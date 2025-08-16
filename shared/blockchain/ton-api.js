import axios from 'axios'

/**
 * TON API Client for interacting with TON blockchain
 * Supports both testnet and mainnet
 */
class TonApiClient {
  constructor(network = 'testnet') {
    this.network = network
    this.baseUrl = this.getBaseUrl()
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
  }

  /**
   * Get base URL for the specified network
   */
  getBaseUrl(network = null) {
    const targetNetwork = network || this.network
    return targetNetwork === 'mainnet' 
      ? 'https://toncenter.com/api/v3'
      : 'https://testnet.toncenter.com/api/v3'
  }

  /**
   * Switch network and update client
   */
  setNetwork(network) {
    this.network = network
    this.baseUrl = this.getBaseUrl()
    this.client.defaults.baseURL = this.baseUrl
  }

  /**
   * Make API request with error handling
   */
  async request(method, url, data = null) {
    try {
      const config = {
        method,
        url,
        ...(data && { data })
      }
      
      const response = await this.client.request(config)
      return response.data
    } catch (error) {
      console.error(`TON API Error (${method} ${url}):`, error.response?.data || error.message)
      throw new Error(`TON API request failed: ${error.response?.data?.error || error.message}`)
    }
  }

  // ==================== ACCOUNT ENDPOINTS ====================

  /**
   * Get account states
   */
  async getAccountStates(address) {
    return this.request('GET', `/accountStates?address=${address}`)
  }

  /**
   * Get wallet information (v2 compatibility)
   */
  async getWalletInformation(address) {
    return this.request('GET', `/walletInformation?address=${address}`)
  }

  /**
   * Get address information (v2 compatibility)
   */
  async getAddressInformation(address) {
    return this.request('GET', `/addressInformation?address=${address}`)
  }

  // ==================== JETTON ENDPOINTS ====================

  /**
   * Get Jetton masters
   */
  async getJettonMasters(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request('GET', `/jetton/masters?${queryString}`)
  }

  /**
   * Get Jetton wallets
   */
  async getJettonWallets(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request('GET', `/jetton/wallets?${queryString}`)
  }

  /**
   * Get Jetton transfers
   */
  async getJettonTransfers(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request('GET', `/jetton/transfers?${queryString}`)
  }

  /**
   * Get Jetton info for a specific address
   */
  async getJettonInfo(address) {
    return this.request('GET', `/jetton/masters?address=${address}`)
  }

  // ==================== V2 COMPATIBILITY ENDPOINTS ====================

  /**
   * Estimate fee (v2 compatibility)
   */
  async estimateFee(requestData) {
    return this.request('POST', '/estimateFee', requestData)
  }

  /**
   * Send message (v2 compatibility)
   */
  async sendMessage(requestData) {
    return this.request('POST', '/message', requestData)
  }

  /**
   * Run get method (v2 compatibility)
   */
  async runGetMethod(requestData) {
    return this.request('POST', '/runGetMethod', requestData)
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get all Jettons for a wallet address
   */
  async getWalletJettons(walletAddress) {
    try {
      // Use getJettonWallets with owner_address parameter for better efficiency
      const jettonWalletsResponse = await this.getJettonWallets({
        owner_address: walletAddress,
        limit: 100,
        offset: 0
      })
      
      if (!jettonWalletsResponse.jetton_wallets) {
        return []
      }

      const jettons = []
      
      for (const jettonWallet of jettonWalletsResponse.jetton_wallets) {
        try {
          // Get Jetton master info from the jetton field
          const jettonMasterAddress = jettonWallet.jetton
          
          // Get friendly addresses from address_book
          const addressBook = jettonWalletsResponse.address_book || {}
          const friendlyMasterAddress = addressBook[jettonMasterAddress]?.user_friendly || jettonMasterAddress
          const friendlyWalletAddress = addressBook[jettonWallet.address]?.user_friendly || jettonWallet.address
          const friendlyOwnerAddress = addressBook[jettonWallet.owner]?.user_friendly || jettonWallet.owner
          
          // Try to get metadata from the response if available
          let jettonMetadata = null
          if (jettonWalletsResponse.metadata && 
              jettonWalletsResponse.metadata[jettonMasterAddress] &&
              jettonWalletsResponse.metadata[jettonMasterAddress].token_info) {
            
            const tokenInfo = jettonWalletsResponse.metadata[jettonMasterAddress].token_info[0]
            if (tokenInfo && tokenInfo.valid) {
              jettonMetadata = {
                name: tokenInfo.name || 'Unknown Token',
                symbol: tokenInfo.symbol || 'N/A',
                description: tokenInfo.description || '',
                image: tokenInfo.image || '',
                decimals: tokenInfo.extra?.decimals || '9'
              }
            }
          }
          
          // If no metadata in response, try to fetch it separately
          if (!jettonMetadata) {
            try {
              const jettonInfo = await this.getJettonInfo(jettonMasterAddress)
              if (jettonInfo.result?.length > 0) {
                const jettonData = jettonInfo.result[0]
                jettonMetadata = {
                  name: jettonData.name || 'Unknown Token',
                  symbol: jettonData.symbol || 'N/A',
                  description: jettonData.description || '',
                  image: jettonData.image || '',
                  decimals: jettonData.decimals || '9'
                }
              }
            } catch (metadataError) {
              console.warn(`Failed to fetch metadata for jetton ${jettonMasterAddress}:`, metadataError)
            }
          }
          
          // Use default metadata if still not available
          if (!jettonMetadata) {
            jettonMetadata = {
              name: 'Unknown Token',
              symbol: 'N/A',
              description: '',
              image: '',
              decimals: '9'
            }
          }
          
          jettons.push({
            address: friendlyMasterAddress,
            rawAddress: jettonMasterAddress,
            walletAddress: friendlyWalletAddress,
            rawWalletAddress: jettonWallet.address,
            network: this.network,
            totalSupply: jettonWallet.balance || '0',
            metadata: jettonMetadata,
            deployedAt: new Date().toISOString(),
            owner: friendlyOwnerAddress,
            rawOwner: jettonWallet.owner,
            balance: jettonWallet.balance || '0',
            lastTransactionLt: jettonWallet.last_transaction_lt,
            codeHash: jettonWallet.code_hash,
            dataHash: jettonWallet.data_hash
          })
          
        } catch (error) {
          console.warn(`Failed to process jetton wallet ${jettonWallet.address}:`, error)
          
          // Get friendly addresses for fallback
          const addressBook = jettonWalletsResponse.address_book || {}
          const friendlyMasterAddress = addressBook[jettonWallet.jetton]?.user_friendly || jettonWallet.jetton
          const friendlyWalletAddress = addressBook[jettonWallet.address]?.user_friendly || jettonWallet.address
          const friendlyOwnerAddress = addressBook[jettonWallet.owner]?.user_friendly || jettonWallet.owner
          
          // Add basic token info even if processing fails
          jettons.push({
            address: friendlyMasterAddress,
            rawAddress: jettonWallet.jetton || 'unknown',
            walletAddress: friendlyWalletAddress,
            rawWalletAddress: jettonWallet.address,
            network: this.network,
            totalSupply: jettonWallet.balance || '0',
            metadata: {
              name: 'Unknown Token',
              symbol: 'N/A',
              description: '',
              image: '',
              decimals: '9'
            },
            deployedAt: new Date().toISOString(),
            owner: friendlyOwnerAddress,
            rawOwner: jettonWallet.owner,
            balance: jettonWallet.balance || '0',
            lastTransactionLt: jettonWallet.last_transaction_lt,
            codeHash: jettonWallet.code_hash,
            dataHash: jettonWallet.data_hash
          })
        }
      }
      
      return jettons
    } catch (error) {
      console.error('Failed to fetch wallet Jettons:', error)
      return []
    }
  }

  /**
   * Get Jetton details by address
   */
  async getJettonDetails(jettonAddress) {
    try {
      const jettonInfo = await this.getJettonInfo(jettonAddress)
      
      if (jettonInfo.result?.length > 0) {
        const jettonData = jettonInfo.result[0]
        
        // Convert raw address to friendly format if needed
        const friendlyAddress = this.convertToFriendlyAddress(jettonAddress)
        
        return {
          ...jettonData,
          address: friendlyAddress,
          rawAddress: jettonAddress
        }
      }
      
      return null
    } catch (error) {
      console.error('Failed to fetch Jetton details:', error)
      return null
    }
  }

  /**
   * Convert raw address to friendly format
   * @param {string} rawAddress - Raw TON address
   * @returns {string} Friendly address format
   */
  convertToFriendlyAddress(rawAddress) {
    if (!rawAddress || typeof rawAddress !== 'string') {
      return rawAddress
    }
    
    // If already in friendly format (starts with EQ, UQ, etc.), return as is
    if (rawAddress.startsWith('EQ') || rawAddress.startsWith('UQ') || rawAddress.startsWith('kQ')) {
      return rawAddress
    }
    
    // For raw addresses, we would need to implement base64url encoding
    // For now, return the raw address as the API should provide friendly addresses
    return rawAddress
  }

  /**
   * Get account balance
   */
  async getAccountBalance(address) {
    try {
      const accountInfo = await this.getAddressInformation(address)
      return accountInfo.result?.balance || '0'
    } catch (error) {
      console.error('Failed to fetch account balance:', error)
      return '0'
    }
  }

  /**
   * Validate TON address format
   */
  isValidAddress(address) {
    if (!address || typeof address !== 'string') {
      return false
    }
    
    // Accept friendly addresses (EQ, UQ, kQ format)
    if (address.startsWith('EQ') || address.startsWith('UQ') || address.startsWith('kQ')) {
      return true
    }
    
    // Accept raw addresses (48 characters, alphanumeric with underscores and dashes)
    const tonAddressRegex = /^[0-9a-zA-Z_-]{48}$/
    return tonAddressRegex.test(address)
  }
}

// Create default instances
const testnetClient = new TonApiClient('testnet')
const mainnetClient = new TonApiClient('mainnet')

// Export the class and default instances
export default TonApiClient
export { testnetClient, mainnetClient }

// Export utility functions
export const createTonApiClient = (network = 'testnet') => {
  return new TonApiClient(network)
}

export const getTonApiClient = (network = 'testnet') => {
  return network === 'mainnet' ? mainnetClient : testnetClient
} 