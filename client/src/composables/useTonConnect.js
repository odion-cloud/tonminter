import { ref, computed, onMounted, onUnmounted } from 'vue'
import { TonConnectUI } from '@tonconnect/ui'

// Global state
const tonConnectUI = ref(null)
const wallet = ref(null)
const connected = ref(false)

// Initialize TonConnect
const initTonConnect = () => {
  if (!tonConnectUI.value) {
    tonConnectUI.value = new TonConnectUI({
      manifestUrl: window.location.origin + '/tonconnect-manifest.json',
      buttonRootId: 'ton-connect-button'
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
    return wallet.value?.account?.address || null
  })

  const isConnected = computed(() => connected.value)

  // Methods
  const connect = async () => {
    if (!tonConnectUI.value) {
      initTonConnect()
    }
    await tonConnectUI.value.connectWallet()
  }

  const disconnect = async () => {
    if (tonConnectUI.value) {
      await tonConnectUI.value.disconnect()
    }
  }

  const sendTransaction = async (transaction) => {
    if (!tonConnectUI.value || !connected.value) {
      throw new Error('Wallet not connected')
    }
    return await tonConnectUI.value.sendTransaction(transaction)
  }

  const getShortAddress = () => {
    if (!address.value) return ''
    return address.value.slice(0, 6) + '...' + address.value.slice(-4)
  }

  // Initialize on mount
  onMounted(() => {
    initTonConnect()
  })

  // Cleanup on unmount
  onUnmounted(() => {
    if (tonConnectUI.value) {
      tonConnectUI.value.removeAllListeners()
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
    getShortAddress
  }
} 