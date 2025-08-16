import { ref, computed, onMounted, onUnmounted } from 'vue'
import { TonConnectUI } from '@tonconnect/ui'
import { toUserFriendlyAddress } from '@tonconnect/sdk'

// Global state
const tonConnectUI = ref(null)
const wallet = ref(null)
const connected = ref(false)

// Initialize TonConnect
const initTonConnect = () => {
  if (!tonConnectUI.value) {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      console.warn('TON Connect: Not in browser environment, skipping initialization');
      return;
    }
    
    tonConnectUI.value = new TonConnectUI({
      // manifestUrl: window.location.origin + '/tonconnect-manifest.json',
      manifestUrl: 'https://app.viewmynte.com/tonconnect-manifest.json'
    })

    // Listen for wallet changes
    tonConnectUI.value.onStatusChange((walletInfo) => {
      wallet.value = walletInfo
      connected.value = !!walletInfo
    })
  }
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

  // Methods
  const connect = async () => {
    if (!tonConnectUI.value) {
      initTonConnect()
    }
    
    if (!tonConnectUI.value.connected) {
      await tonConnectUI.value.openModal()
    }
  }

  const disconnect = async () => {
    if (tonConnectUI.value) {
      await tonConnectUI.value.disconnect()
    }
  }

  const sendTransaction = async (transaction) => {
    if (!tonConnectUI.value) {
      throw new Error('TON Connect UI not initialized. Please refresh the page and try again.')
    }
    
    if (!connected.value) {
      throw new Error('Wallet not connected. Please connect your wallet first.')
    }

    if (typeof tonConnectUI.value.sendTransaction !== 'function') {
      throw new Error('TON Connect UI sendTransaction method not available. Please reconnect your wallet.')
    }

    return await tonConnectUI.value.sendTransaction(transaction)
  }

  const getShortAddress = () => {
    console.log('address.value', address.value)
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

  // Initialize on mount
  onMounted(() => {
    initTonConnect()
  })

  // Cleanup on unmount
  onUnmounted(() => {
    if (tonConnectUI.value) {
      try {
        // TON Connect UI doesn't have removeAllListeners method
        // Just set to null to allow garbage collection
        tonConnectUI.value = null
      } catch (error) {
        console.warn('Error during TON Connect cleanup:', error)
      }
    }
  })

  return {
    // State
    wallet: computed(() => wallet.value),
    address,
    isConnected,
    tonConnectUI: computed(() => tonConnectUI.value),

    // Methods
    connect,
    disconnect,
    sendTransaction,
    getShortAddress,
    getRawAddress,
    
    // Utility methods
    isReady: computed(() => {
      return tonConnectUI.value && typeof tonConnectUI.value.sendTransaction === 'function'
    })
  }
} 