import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useTonConnect } from '../composables/useTonConnect.js'

export const useWalletStore = defineStore('wallet', () => {
  const { 
    wallet, 
    address, 
    isConnected, 
    tonConnectUI,
    connect: tonConnect,
    disconnect: tonDisconnect,
    sendTransaction,
    getShortAddress 
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
    sendTransaction: sendTx
  }
}) 