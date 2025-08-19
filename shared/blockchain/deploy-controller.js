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
  JETTON_MINTER_CODE,
  JETTON_WALLET_CODE
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
      const { compileFunc } = await import('@ton-community/func-js');

      console.log(`Compiling ${contractType} contract...`);
      const compileResult = await compileFunc({
        targets: [`${contractType}.fc`],
        sources: {
          [`${contractType}.fc`]: sourceCode
        }
      });
      
      if (compileResult.status === 'error') {
        throw new Error(`FunC compilation failed: ${compileResult.message}`);
      }

      // Return the compiled BOC data
      return {
        success: true,
        boc: compileResult.codeBoc,
        codeBoc: compileResult.codeBoc,
        fiftCode: compileResult.fiftCode || null
      };

    } catch (error) {
      console.error(`FunC compilation error for ${contractType}:`, error);
      throw new Error(`Compilation failed: ${error.message}`);
    }
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



  async getJettonDetails(jettonAddress, ownerAddress, network = 'testnet') {
    try {
      const client = await getTonClient(network)

      // Convert string address to Address object if needed
      const minterAddress = typeof jettonAddress === 'string' ? Address.parse(jettonAddress) : jettonAddress

      // Get jetton data from the minter contract
      const jettonData = await makeGetCall(
        client,
        minterAddress,
        'get_jetton_data',
        []
      )

      if (!jettonData || jettonData.length < 5) {
        throw new Error('Invalid jetton data response')
      }

      const [totalSupply, mintable, adminAddress, jettonContent, jettonWalletCode] = jettonData

      // Calculate jetton wallet address for the owner
      let jettonWalletAddress = null
      let balance = new BN(0)

      if (ownerAddress) {
        try {
          const walletAddressResult = await makeGetCall(
            client,
            jettonAddress,
            'get_wallet_address',
            [{ type: 'slice', cell: beginCell().storeAddress(ownerAddress).endCell() }]
          )

          if (walletAddressResult && walletAddressResult.length > 0) {
            jettonWalletAddress = cellToAddress(walletAddressResult[0])

            // Get wallet balance
            try {
              const walletData = await makeGetCall(
                client,
                jettonWalletAddress,
                'get_wallet_data',
                []
              )

              if (walletData && walletData.length > 0) {
                balance = new BN(walletData[0].toString())
              }
            } catch (walletError) {
              console.warn('Failed to get wallet balance:', walletError)
            }
          }
        } catch (addressError) {
          console.warn('Failed to get jetton wallet address:', addressError)
        }
      }

      // Parse metadata from jetton content
      let metadata = {
        name: 'Unknown Token',
        symbol: 'N/A',
        description: '',
        image: '',
        decimals: '9'
      }

      try {
        const metadataResult = await readJettonMetadata(jettonContent)
        if (metadataResult && metadataResult.metadata) {
          metadata = { ...metadata, ...metadataResult.metadata }
        }
      } catch (metadataError) {
        console.warn('Failed to read jetton metadata:', metadataError)
      }

      return {
        jettonAddress: minterAddress.toString(),
        totalSupply: totalSupply.toString(),
        mintable: mintable.toString() === '-1',
        adminAddress: adminAddress ? Address.parse(adminAddress).toString() : null,
        metadata,
        jettonWallet: jettonWalletAddress ? {
          jWalletAddress: jettonWalletAddress.toString(),
          balance: balance.toString()
        } : null,
        // Add getJettonDetails method for compatibility
        getJettonDetails: async () => {
          return this.getJettonDetails(minterAddress, ownerAddress, network)
        }
      }

    } catch (error) {
      console.error('Failed to get jetton details:', error)
      throw error
    }
  }

  async mint(tonConnectUI, jettonAddress, amount, toAddress, network = 'testnet') {
    try {
      const mintMessage = mintBody(
        Address.parse(toAddress),
        amount,
        toNano('0.05'),
        0
      )

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 60,
        messages: [{
          address: jettonAddress.toString(),
          amount: toNano('0.05').toString(),
          payload: mintMessage.toBoc().toString('base64')
        }]
      }

      await tonConnectUI.sendTransaction(transaction)
    } catch (error) {
      console.error('Failed to mint tokens:', error)
      throw error
    }
  }

  async transfer(tonConnectUI, amount, toAddress, fromAddress, jettonWalletAddress, network = 'testnet') {
    try {
      const transferMessage = transfer(
        Address.parse(toAddress),
        amount,
        toNano('0.05'),
        0,
        null
      )

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 60,
        messages: [{
          address: jettonWalletAddress,
          amount: toNano('0.05').toString(),
          payload: transferMessage.toBoc().toString('base64')
        }]
      }

      await tonConnectUI.sendTransaction(transaction)
    } catch (error) {
      console.error('Failed to transfer tokens:', error)
      throw error
    }
  }

  async burnJettons(tonConnectUI, amount, jettonAddress, fromAddress, network = 'testnet') {
    try {
      // First get the jetton wallet address
      const jettonDetails = await this.getJettonDetails(
        Address.parse(jettonAddress),
        Address.parse(fromAddress),
        network
      )

      if (!jettonDetails.jettonWallet) {
        throw new Error('No jetton wallet found for this address')
      }

      const burnMessage = burn(
        amount,
        Address.parse(fromAddress),
        null
      )

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 60,
        messages: [{
          address: jettonDetails.jettonWallet.jWalletAddress,
          amount: toNano('0.05').toString(),
          payload: burnMessage.toBoc().toString('base64')
        }]
      }

      await tonConnectUI.sendTransaction(transaction)
    } catch (error) {
      console.error('Failed to burn tokens:', error)
      throw error
    }
  }

  async updateMetadata(jettonAddress, metadata, tonConnectUI, fromAddress, network = 'testnet') {
    try {
      const metadataCell = buildJettonOnchainMetadata(metadata)
      const updateMessage = updateMetadataBody(metadataCell)

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 60,
        messages: [{
          address: jettonAddress.toString(),
          amount: toNano('0.05').toString(),
          payload: updateMessage.toBoc().toString('base64')
        }]
      }

      await tonConnectUI.sendTransaction(transaction)
    } catch (error) {
      console.error('Failed to update metadata:', error)
      throw error
    }
  }

  async changeAdmin(tonConnectUI, jettonAddress, newAdminAddress, fromAddress, network = 'testnet') {
    try {
      const changeAdminMessage = changeAdminBody(newAdminAddress)

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 60,
        messages: [{
          address: jettonAddress.toString(),
          amount: toNano('0.05').toString(),
          payload: changeAdminMessage.toBoc().toString('base64')
        }]
      }

      await tonConnectUI.sendTransaction(transaction)
    } catch (error) {
      console.error('Failed to change admin:', error)
      throw error
    }
  }

  async createJetton(params, tonConnectUI, ownerAddress, network = 'testnet') {
    try {
      console.log('Creating jetton with dynamic contracts:', params)

      const owner = Address.parse(ownerAddress)
      const tokenConfig = params.config?.token || params.token || params

      // Check if we have the source code to compile
      if (!params.minterCode || !params.walletCode) {
        throw new Error('Dynamic contract source code is required for compilation.')
      }

      console.log('🔄 Compiling user-generated FunC contracts...')

      // Compile both contracts
      console.log('📝 Compiling minter contract...')
      const minterCompileResult = await this.compileFuncCode(params.minterCode, 'minter')
      console.log('📝 Compiling wallet contract...')
      const walletCompileResult = await this.compileFuncCode(params.walletCode, 'wallet')

      // Convert BOC to Cell objects
      minterCodeCell = Cell.fromBoc(Buffer.from(minterCompileResult.codeBoc, 'base64'))[0]
      walletCodeCell = Cell.fromBoc(Buffer.from(walletCompileResult.codeBoc, 'base64'))[0]

      console.log('✅ Dynamic contracts compiled successfully')
      console.log('Minter BOC length:', minterCompileResult.codeBoc.length)
      console.log('Wallet BOC length:', walletCompileResult.codeBoc.length)

      // Log first few characters of BOC for debugging
      console.log('Minter BOC preview:', minterCompileResult.codeBoc.substring(0, 100) + '...')
      console.log('Wallet BOC preview:', walletCompileResult.codeBoc.substring(0, 100) + '...')

      console.log('Custom features:', {
        transactionFee: params.config?.transactionFee || params.transactionFee,
        buyback: params.config?.buyback || params.buyback
      })

      // Create init data for minter with dynamic wallet code
      const minterData = initData(owner, tokenConfig, null, walletCodeCell)

      // Deploy the user's custom contract
      const contractAddress = await this.deployer.deployContract({
        code: minterCodeCell,
        data: minterData,
        value: toNano(params.deployAmount || '0.5'),
        message: this.createDeployMessage(params)
      }, tonConnectUI)

      console.log('🚀 Dynamic contract deployed at:', contractAddress.toString())

      return contractAddress

    } catch (error) {
      console.error('Contract deployment failed:', error)
      throw new Error(`Deployment failed: ${error.message}`)
    }
  }
}

export const jettonDeployController = new JettonDeployController();