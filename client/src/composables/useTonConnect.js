
import { ref, computed } from 'vue'
import { TonConnectUI } from '@tonconnect/ui'
import { toUserFriendlyAddress } from '@tonconnect/sdk'

// Global state - only one instance across the entire app
let tonConnectUIInstance = null
const wallet = ref(null)
const connected = ref(false)
const isInitialized = ref(false)

// Initialize TonConnect only once
const initTonConnect = () => {
  // Prevent multiple initializations
  if (tonConnectUIInstance || isInitialized.value) {
    return tonConnectUIInstance
  }

  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    console.warn('TON Connect: Not in browser environment, skipping initialization')
    return null
  }
  
  try {
    tonConnectUIInstance = new TonConnectUI({
      // manifestUrl: window.location.origin + '/tonconnect-manifest.json',
      manifestUrl: 'https://app.viewmynte.com/tonconnect-manifest.json'
    })

    // Listen for wallet changes - only set up listener once
    tonConnectUIInstance.onStatusChange((walletInfo) => {
      console.log('TON Connect status changed:', walletInfo)
      wallet.value = walletInfo
      connected.value = !!walletInfo
    })

    // Check current connection status
    if (tonConnectUIInstance.wallet) {
      wallet.value = tonConnectUIInstance.wallet
      connected.value = true
    }

    isInitialized.value = true
    console.log('TON Connect UI initialized successfully')
  } catch (error) {
    console.error('Failed to initialize TON Connect UI:', error)
    tonConnectUIInstance = null
  }

  return tonConnectUIInstance
}

// Initialize immediately when module loads
if (typeof window !== 'undefined') {
  initTonConnect()
}

export function useTonConnect() {
  // Computed properties
  const address = computed(() => {
    const rawAddress = wallet.value?.account?.address || null
    if (rawAddress) {
      return toUserFriendlyAddress(rawAddress)
    }
    return null
  })

  const isConnected = computed(() => connected.value)

  const tonConnectUI = computed(() => {
    // Always return the same instance
    if (!tonConnectUIInstance && typeof window !== 'undefined') {
      initTonConnect()
    }
    return tonConnectUIInstance
  })

  // Methods
  const connect = async () => {
    const ui = tonConnectUI.value
    if (!ui) {
      console.error('TON Connect UI not available')
      throw new Error('TON Connect UI not available')
    }
    
    if (!ui.connected) {
      await ui.openModal()
    }
  }

  const disconnect = async () => {
    const ui = tonConnectUI.value
    if (ui) {
      await ui.disconnect()
    }
  }

  const sendTransaction = async (transaction) => {
    const ui = tonConnectUI.value
    if (!ui) {
      throw new Error('TON Connect UI not initialized. Please refresh the page and try again.')
    }
    
    if (!connected.value) {
      throw new Error('Wallet not connected. Please connect your wallet first.')
    }

    if (typeof ui.sendTransaction !== 'function') {
      throw new Error('TON Connect UI sendTransaction method not available. Please reconnect your wallet.')
    }

    return await ui.sendTransaction(transaction)
  }

  const getShortAddress = () => {
    if (!address.value) return ''
    
    // For TON addresses (UQ, EQ, 0Q), show first 4 and last 4 characters
    if (address.value.startsWith('UQ') || address.value.startsWith('EQ') || address.value.startsWith('0Q')) {
      return address.value.slice(0, 4) + '...' + address.value.slice(-4)
    }
    
    // For raw addresses, show first 6 and last 4 characters
    return address.value.slice(0, 6) + '...' + address.value.slice(-4)
  }

  // Get raw address for internal use (contract deployment, etc.)
  const getRawAddress = () => {
    return wallet.value?.account?.address || null
  }

  return {
    // State
    wallet: computed(() => wallet.value),
    address,
    isConnected,
    tonConnectUI,

    // Methods
    connect,
    disconnect,
    sendTransaction,
    getShortAddress,
    getRawAddress,
    
    // Utility methods
    isReady: computed(() => {
      const ui = tonConnectUI.value
      return ui && typeof ui.sendTransaction === 'function'
    })
  }
}
