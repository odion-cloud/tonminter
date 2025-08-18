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
// Using ton-compiler for real FunC compilation

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

  async createJetton(params, tonConnectUI, walletAddress, network = 'testnet') {
    try {
      console.log('Starting contract deployment with user configuration...')

      // Generate contract code based on user configuration
      const { generateJettonMinter, generateJettonWallet } = await import('../../client/src/lib/contract-generator.js')

      const minterSourceCode = generateJettonMinter(params)
      const walletSourceCode = generateJettonWallet(params)

      console.log('Generated custom contract code based on user configuration')

      // Compile the generated FunC code
      const minterCompiled = await this.compileFuncCode(minterSourceCode, 'minter')
      const walletCompiled = await this.compileFuncCode(walletSourceCode, 'wallet')

      // Create initial data for the minter contract
      const jettonContent = this.createJettonContent(params.token)
      const minterData = this.createMinterData(
        params.token.totalSupply,
        params.owner,
        jettonContent,
        walletCompiled.code
      )

      // Deploy the custom contract
      const contractAddress = await this.deployer.deployContract({
        code: minterCompiled.code,
        data: minterData,
        value: toNano(params.deployAmount || '0.5'),
        message: this.createDeployMessage(params)
      }, tonConnectUI)

      console.log('Custom contract deployed at:', contractAddress.toString())

      return contractAddress

    } catch (error) {
      console.error('Contract deployment failed:', error)
      throw new Error(`Deployment failed: ${error.message}`)
    }
  }

  async compileFuncCode(sourceCode, contractType) {
    try {
      console.log(`Compiling ${contractType} contract...`)

      // In a real implementation, you would use the FunC compiler
      // For now, we'll create a mock compiled version that represents the user's configuration
      const compiled = await compile({
        sources: {
          'main.fc': sourceCode,
          'stdlib.fc': await this.getStdlibCode()
        },
        entryPoints: ['main.fc']
      })

      if (compiled.status === 'error') {
        throw new Error(`Compilation failed: ${compiled.message}`)
      }

      return {
        code: compiled.codeBoc,
        source: sourceCode,
        compiledAt: new Date().toISOString()
      }

    } catch (error) {
      console.error(`Failed to compile ${contractType} contract:`, error)
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
      image: tokenConfig.image || ''
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
    if (deployConfig.initialMint && deployConfig.initialMint > 0) {
      const mintAmount = BigInt(deployConfig.initialMint) * BigInt(Math.pow(10, 9))

      return beginCell()
        .storeUint(21, 32) // mint op
        .storeUint(0, 64) // query_id
        .storeAddress(Address.parse(deployConfig.mintTo || deployConfig.ownerAddress))
        .storeCoins(mintAmount)
        .endCell()
    }

    return null
  }

  async createJetton(deployConfig, tonConnectUI, ownerAddress, network) {
    try {
      console.log('Starting contract deployment...', { deployConfig, ownerAddress, network: network?.name });

      // Compile contracts from user configuration first
      const response = await fetch('/api/contracts/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deployConfig)
      });

      if (!response.ok) {
        throw new Error('Failed to compile user contracts');
      }

      const compilation = await response.json();
      if (!compilation.success) {
        throw new Error(compilation.message);
      }

      console.log('Using compiled contracts from user configuration');

      // Use the compiled contracts based on user's form data
      const minterCode = Cell.fromBase64(compilation.data.minter.compiled.base64)
      const walletCode = Cell.fromBase64(compilation.data.wallet.compiled.base64)

      // Create initial data for the minter contract
      const jettonContent = this.createJettonContent(deployConfig.token)
      const minterData = this.createMinterData(
        deployConfig.token.totalSupply,
        ownerAddress,
        jettonContent,
        walletCode
      )

      // Deploy the custom contract
      const contractAddress = await this.deployer.deployContract({
        code: minterCode,
        data: minterData,
        value: toNano(deployConfig.deployAmount || '0.5'),
        message: this.createDeployMessage(deployConfig)
      }, tonConnectUI)

      console.log('Custom contract deployed at:', contractAddress.toString())

      return contractAddress

    } catch (error) {
      console.error('Contract deployment failed:', error)
      throw new Error(`Deployment failed: ${error.message}`)
    }
  }
}

export const jettonDeployController = new JettonDeployController();