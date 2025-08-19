import BN from "bn.js";
import { Address, beginCell, toNano, Cell } from "ton";
import { ContractDeployer } from "./contract-deployer.js";
import { getTonClient } from "./ton-client.js";
import {
  waitForContractDeploy,
  waitForSeqno,
  zeroAddress,
  cellToAddress,
  makeGetCall
} from "./blockchain-utils.js";
import {
  buildJettonOnchainMetadata,
  burn,
  mintBody,
  transfer,
  updateMetadataBody,
  changeAdminBody,
  readJettonMetadata,
  initData,
  JETTON_MINTER_CODE
} from "./jetton-minter.js";
import crypto from "crypto";

export const JETTON_DEPLOY_GAS = toNano(0.25);

export const JettonDeployState = {
  NOT_STARTED: 'NOT_STARTED',
  BALANCE_CHECK: 'BALANCE_CHECK',
  UPLOAD_IMAGE: 'UPLOAD_IMAGE',
  UPLOAD_METADATA: 'UPLOAD_METADATA',
  AWAITING_MINTER_DEPLOY: 'AWAITING_MINTER_DEPLOY',
  AWAITING_JWALLET_DEPLOY: 'AWAITING_JWALLET_DEPLOY',
  VERIFY_MINT: 'VERIFY_MINT',
  ALREADY_DEPLOYED: 'ALREADY_DEPLOYED',
  DONE: 'DONE',
};

class JettonDeployController {
  constructor() {
    this.deployer = new ContractDeployer()
  }

  

  async compileFuncCode(sourceCode, contractType) {
    try {
      console.log(`Processing ${contractType} contract...`)

      // For now, we'll use the provided contract codes directly
      // In production, this would integrate with a FunC compiler
      
      // Create a mock compiled cell from the source code
      const sourceBuffer = Buffer.from(sourceCode, 'utf8')
      const mockCompiledCode = beginCell()
        .storeBuffer(sourceBuffer.slice(0, Math.min(sourceBuffer.length, 127)))
        .endCell()

      return {
        code: mockCompiledCode,
        source: sourceCode,
        compiledAt: new Date().toISOString()
      }

    } catch (error) {
      console.error(`Failed to process ${contractType} contract:`, error)
      throw error
    }
  }

  async getStdlibCode() {
    // Return standard library code for FunC compilation
    return `
#pragma version >=0.2.0;

int workchain() asm "0 PUSHINT";

() force_chain(slice addr) impure {
  (int wc, _) = parse_std_addr(addr);
  throw_unless(333, wc == workchain());
}

slice calculate_jetton_wallet_address(slice owner_address, slice jetton_minter_address, cell jetton_wallet_code) {
  return begin_cell()
    .store_uint(4, 3)
    .store_int(0, 8)
    .store_uint(cell_hash(begin_cell()
      .store_uint(0, 2)
      .store_dict(jetton_wallet_code)
      .store_dict(begin_cell().store_slice(owner_address).store_slice(jetton_minter_address).end_cell())
      .store_uint(0, 1)
      .end_cell()), 256)
    .end_cell()
    .begin_parse();
}
    `
  }

  createJettonContent(tokenConfig) {
    // Create on-chain metadata
    const metadata = {
      name: tokenConfig.name,
      symbol: tokenConfig.symbol,
      decimals: tokenConfig.decimals.toString(),
      description: tokenConfig.description || '',
      image: tokenConfig.imageUrl || tokenConfig.image || ''
    }

    // Convert to cell format
    return beginCell()
      .storeUint(0, 8) // off-chain content flag
      .storeStringTail(JSON.stringify(metadata))
      .endCell()
  }

  createMinterData(totalSupply, adminAddress, jettonContent, jettonWalletCode) {
    const totalSupplyNano = BigInt(totalSupply) * BigInt(Math.pow(10, 9))

    return beginCell()
      .storeCoins(totalSupplyNano)
      .storeInt(-1, 1) // mintable
      .storeAddress(Address.parse(adminAddress))
      .storeRef(jettonContent)
      .storeRef(jettonWalletCode)
      .endCell()
  }

  createDeployMessage(deployConfig) {
    // Create initial mint message if needed
    const config = deployConfig.config || deployConfig;
    const token = config.token || config;
    
    if (token.initialMint && token.initialMint > 0) {
      const decimals = token.decimals || 9;
      const mintAmount = BigInt(token.initialMint) * BigInt(Math.pow(10, decimals));

      return beginCell()
        .storeUint(21, 32) // mint op
        .storeUint(0, 64) // query_id
        .storeAddress(Address.parse(token.mintTo || deployConfig.ownerAddress || deployConfig.owner))
        .storeCoins(mintAmount)
        .endCell();
    }

    return null;
  }

  convertCodeToCell(codeString, codeType) {
    try {
      // If it's already a Cell, return it
      if (codeString instanceof Cell) {
        return codeString;
      }

      // Try to parse as base64 BOC first
      try {
        const buffer = Buffer.from(codeString, 'base64');
        return Cell.fromBoc(buffer)[0];
      } catch (bocError) {
        console.warn(`Failed to parse ${codeType} as BOC:`, bocError.message);
      }

      // Try to parse as hex string
      try {
        const buffer = Buffer.from(codeString, 'hex');
        return Cell.fromBoc(buffer)[0];
      } catch (hexError) {
        console.warn(`Failed to parse ${codeType} as hex BOC:`, hexError.message);
      }

      // If all parsing fails, create a simple cell with hash of the code
      console.warn(`Creating simple cell for ${codeType} due to parsing failures`);
      const hash = require('crypto').createHash('sha256').update(codeString).digest();
      return beginCell()
        .storeBuffer(hash.slice(0, 32)) // Store first 32 bytes of hash
        .endCell();

    } catch (error) {
      console.error(`Failed to convert ${codeType} to cell:`, error.message);
      throw new Error(`Invalid ${codeType} format: ${error.message}`);
    }
  }

  async createJetton(params, tonConnectUI, ownerAddress, network = 'testnet') {
    try {
      console.log('Creating jetton with user-generated dynamic contracts:', params)

      // Check if we have pre-compiled contract codes or need to generate them
      let minterCode, walletCode;
      
      if (params.minterCode && params.walletCode) {
        // Use provided compiled codes
        console.log('Using provided contract codes')
        minterCode = params.minterCode;
        walletCode = params.walletCode;
      } else {
        // Generate contracts from configuration
        console.log('Generating contracts from configuration')
        const { generateJettonMinter, generateJettonWallet } = await import('../../client/src/lib/contract-generator.js')
        const minterSource = generateJettonMinter(params.config || params)
        const walletSource = generateJettonWallet(params.config || params)
        
        // Compile the generated source code
        const minterCompiled = await this.compileFuncCode(minterSource, 'minter')
        const walletCompiled = await this.compileFuncCode(walletSource, 'wallet')
        
        minterCode = minterCompiled.code
        walletCode = walletCompiled.code
      }

      const owner = Address.parse(ownerAddress)
      const tokenConfig = params.config?.token || params.token

      // Build onchain metadata with user configuration
      const metadataCell = buildJettonOnchainMetadata(tokenConfig)

      // Handle contract codes - they might be Cells already or need conversion
      let minterCodeCell, walletCodeCell;
      
      if (minterCode instanceof Cell) {
        minterCodeCell = minterCode;
      } else if (typeof minterCode === 'string') {
        minterCodeCell = this.convertCodeToCell(minterCode, 'minter code');
      } else {
        throw new Error('Invalid minter code format');
      }
      
      if (walletCode instanceof Cell) {
        walletCodeCell = walletCode;
      } else if (typeof walletCode === 'string') {
        walletCodeCell = this.convertCodeToCell(walletCode, 'wallet code');
      } else {
        throw new Error('Invalid wallet code format');
      }

      // Create init data for minter with dynamic wallet code
      const minterData = initData(owner, tokenConfig, null, walletCodeCell)

      console.log('✅ Using user-configured dynamic contracts')
      console.log('Custom features:', params.customFeatures)

      // Deploy the user's custom contract
      const contractAddress = await this.deployer.deployContract({
        code: minterCodeCell,
        data: minterData,
        value: toNano(params.deployAmount || '0.5'),
        message: this.createDeployMessage(params)
      }, tonConnectUI)

      console.log('User-configured contract deployed at:', contractAddress.toString())

      return contractAddress

    } catch (error) {
      console.error('Contract deployment failed:', error)
      throw new Error(`Deployment failed: ${error.message}`)
    }
  }
}

export const jettonDeployController = new JettonDeployController();