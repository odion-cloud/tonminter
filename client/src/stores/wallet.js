import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useTonConnect } from '@/composables/useTonConnect'
import { getTonApiClient } from '@shared/blockchain/ton-api'
import { useContractStore } from './contract.js'

export const useWalletStore = defineStore('wallet', () => {
  const { 
    wallet, 
    address, 
    isConnected, 
    tonConnectUI,
    connect: tonConnect,
    disconnect: tonDisconnect,
    sendTransaction,
    getShortAddress,
    getRawAddress
  } = useTonConnect()

  // Additional wallet state
  const isConnecting = ref(false)
  const error = ref(null)

  // Computed
  const shortAddress = computed(() => getShortAddress())

  // Actions
  const connect = async () => {
    try {
      isConnecting.value = true
      error.value = null
      await tonConnect()
    } catch (err) {
      error.value = err.message
      console.error('Wallet connection failed:', err)
    } finally {
      isConnecting.value = false
    }
  }

  const disconnect = async () => {
    try {
      error.value = null
      await tonDisconnect()
    } catch (err) {
      error.value = err.message
      console.error('Wallet disconnection failed:', err)
    }
  }

  const sendTx = async (transaction) => {
    try {
      error.value = null
      return await sendTransaction(transaction)
    } catch (err) {
      error.value = err.message
      console.error('Transaction failed:', err)
      throw err
    }
  }

  // Payment wallet configuration
  const getPaymentWalletAddress = () => {
    // Replace this with your actual TON wallet address for receiving payments
    return 'EQD4FPq-PRDieyQKkizFTRtSDyucUIqrj0v_zXJmqaDp6_0t'
  }

  const getCurrentNetwork = () => {
    // Get network from contract store instead of URL
    try {
      const contractStore = useContractStore()
      return contractStore.activeNetwork
    } catch (error) {
      console.warn('Could not get network from contract store, defaulting to testnet:', error)
      return 'testnet'
    }
  }

  // Fetch all Jetton data for a wallet address from blockchain
  const fetchAllJettonData = async (walletAddress) => {
    try {
      console.log('Fetching Jetton data for wallet:', walletAddress)
      
      // Use the new TON API client
      const network = getCurrentNetwork()
      const tonApiClient = getTonApiClient(network)
      
      // Get all Jettons for the wallet using the API client
      const jettons = await tonApiClient.getWalletJettons(walletAddress)
      
      console.log('Processed Jetton tokens:', jettons)
      return jettons
      
    } catch (error) {
      console.error('Failed to fetch Jetton data from blockchain:', error)
      return []
    }
  }

  return {
    // State
    wallet,
    address,
    isConnected,
    isConnecting,
    error,
    tonConnectUI,

    // Getters
    shortAddress,

    // Actions
    connect,
    disconnect,
    sendTransaction: sendTx,

    // Address methods
    getRawAddress,

    // Payment methods
    getPaymentWalletAddress,
    getCurrentNetwork,
    
    // Blockchain methods
    fetchAllJettonData
  }
}) 