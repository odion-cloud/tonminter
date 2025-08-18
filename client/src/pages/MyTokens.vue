<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">My Tokens</h1>
                  <div class="flex space-x-3">
            <button 
              @click="loadTokens"
              :disabled="isLoading"
              class="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              {{ isLoading ? 'Loading...' : 'Refresh' }}
            </button>
            <button 
              @click="$router.push('/')"
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Create New Token
            </button>
            <!-- Debug button for development -->
            <button 
              v-if="isDevelopment()"
              @click="clearTokens"
              class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Clear Tokens (Debug)
            </button>
            <!-- Sync from blockchain button -->
            <button 
              @click="syncFromBlockchain"
              :disabled="isLoading"
              class="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              {{ isLoading ? 'Syncing...' : 'Sync from Blockchain' }}
            </button>
          </div>
      </div>

      <div v-if="!walletStore.isConnected" class="text-center py-12">
        <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <svg class="mx-auto h-12 w-12 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/>
            <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">Connect your wallet</h3>
          <p class="mt-2 text-gray-500 dark:text-gray-400">Connect your wallet to view your tokens</p>
          <button 
            @click="walletStore.connect()"
            class="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium"
          >
            Connect Wallet
          </button>
        </div>
      </div>

      <div v-else class="space-y-6">
        <!-- Network Filter -->
        <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div class="flex items-center space-x-4">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Network:</span>
            <select 
              v-model="selectedNetwork"
              class="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Networks</option>
              <option value="testnet">Testnet</option>
              <option value="mainnet">Mainnet</option>
            </select>
          </div>
        </div>

        <!-- Tokens List -->
        <div v-if="isLoading" class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>

        <div v-else-if="filteredTokens.length === 0" class="text-center py-12">
          <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <svg class="mx-auto h-12 w-12 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
            <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">No tokens found</h3>
            <p class="mt-2 text-gray-500 dark:text-gray-400">
              {{ selectedNetwork === 'all' ? 'You haven\'t created any tokens yet.' : `No tokens found on ${selectedNetwork}.` }}
            </p>
            <button 
              @click="$router.push('/')"
              class="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium"
            >
              Create Your First Token
            </button>
          </div>
        </div>

        <div v-else>
          <!-- Token Count -->
          <div class="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {{ filteredTokens.length }} token{{ filteredTokens.length !== 1 ? 's' : '' }}
            {{ selectedNetwork !== 'all' ? `on ${selectedNetwork}` : '' }}
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="token in filteredTokens" 
              :key="token.address"
              class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
              @click="viewToken(token.address)"
            >
              <div class="flex items-center mb-4">
                <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden mr-3">
                  <img 
                    v-if="token.metadata?.image" 
                    :src="token.metadata.image" 
                    alt="Token Logo" 
                    class="w-full h-full object-cover"
                  />
                  <svg v-else class="h-6 w-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                    <circle cx="9" cy="9" r="2"/>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 dark:text-white">
                    {{ token.metadata?.name || 'Unknown Token' }}
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ token.metadata?.symbol || 'N/A' }}
                  </p>
                </div>
              </div>

              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-500 dark:text-gray-400">Network:</span>
                  <span :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    token.network === 'mainnet' 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                  ]">
                    {{ token.network.toUpperCase() }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500 dark:text-gray-400">Total Supply:</span>
                  <span class="text-gray-900 dark:text-white">
                    {{ formatNumber(token.totalSupply) }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500 dark:text-gray-400">Address:</span>
                  <span class="text-gray-900 dark:text-white font-mono text-xs">
                    {{ formatAddress(token.address) }}
                  </span>
                </div>
              </div>

              <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button 
                  @click.stop="viewToken(token.address)"
                  class="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Manage Token
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useWalletStore } from '@/stores/wallet'

const router = useRouter()
const walletStore = useWalletStore()

const isLoading = ref(false)
const selectedNetwork = ref('all')
const tokens = ref([])

// Check if we're in development mode
const isDevelopment = () => {
  try {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' || 
           window.location.hostname.includes('test') ||
           window.location.hostname.includes('dev')
  } catch (error) {
    return false
  }
}

const filteredTokens = computed(() => {
  if (selectedNetwork.value === 'all') {
    return tokens.value
  }
  return tokens.value.filter(token => token.network === selectedNetwork.value)
})

const formatAddress = (address) => {
  if (!address) return 'N/A'
  return address.slice(0, 8) + '...' + address.slice(-6)
}

const formatNumber = (number) => {
  if (!number) return '0'
  return new Intl.NumberFormat().format(number.toString())
}

const viewToken = (address) => {
  router.push(`/jetton/${address}`)
}

const clearTokens = () => {
  if (walletStore.isConnected) {
    const walletAddress = walletStore.getRawAddress()
    localStorage.removeItem(`tokens_${walletAddress}`)
    tokens.value = []
    console.log('Cleared tokens for wallet:', walletAddress)
  }
}

const loadTokens = async () => {
  try {
    isLoading.value = true

    // Always try to load real data from blockchain when wallet is connected
    if (walletStore.isConnected) {
      const walletAddress = walletStore.getRawAddress()
      if (walletAddress) {
        // First try to load from localStorage
        try {
          const storedTokens = JSON.parse(localStorage.getItem(`tokens_${walletAddress}`) || '[]')
          console.log('Loaded tokens from localStorage:', storedTokens)
          tokens.value = storedTokens
        } catch (parseError) {
          console.error('Failed to parse stored tokens:', parseError)
          tokens.value = []
        }

        // Then try to sync from blockchain to get any missing tokens
        try {
          const blockchainTokens = await walletStore.fetchAllJettonData(walletAddress)
          console.log('Fetched tokens from blockchain:', blockchainTokens)

          if (blockchainTokens.length > 0) {
            // Merge blockchain tokens with stored tokens, avoiding duplicates
            const existingAddresses = new Set(tokens.value.map(t => t.address))
            const newTokens = blockchainTokens.filter(token => !existingAddresses.has(token.address))

            if (newTokens.length > 0) {
              const updatedTokens = [...tokens.value, ...newTokens]
              localStorage.setItem(`tokens_${walletAddress}`, JSON.stringify(updatedTokens))
              tokens.value = updatedTokens
              console.log('Merged new tokens from blockchain. Total tokens:', updatedTokens.length)
            }
          }
        } catch (blockchainError) {
          console.error('Failed to fetch from blockchain:', blockchainError)
          // Continue with localStorage data if blockchain fetch fails
        }
      } else {
        tokens.value = []
      }
    } else {
      // Show empty state when wallet not connected
      tokens.value = []
    }
  } catch (error) {
    console.error('Failed to load tokens:', error)
    tokens.value = [] // Set empty array on error
  } finally {
    isLoading.value = false
  }
}

const syncFromBlockchain = async () => {
  try {
    isLoading.value = true
    const walletAddress = walletStore.getRawAddress()
    if (!walletAddress) {
      console.error('Wallet address not available for syncing.')
      return
    }

    // Fetch all Jetton data for the connected wallet
    const jettonData = await walletStore.fetchAllJettonData(walletAddress)
    console.log('Fetched Jetton data from blockchain:', jettonData)

    // Filter out tokens that are already in localStorage
    const existingTokens = JSON.parse(localStorage.getItem(`tokens_${walletAddress}`) || '[]')
    const newTokens = jettonData.filter(newToken => {
      const existingToken = existingTokens.find(
        (existing) => existing.address === newToken.address
      )
      return !existingToken
    })

    if (newTokens.length > 0) {
      const updatedTokens = [...existingTokens, ...newTokens]
      localStorage.setItem(`tokens_${walletAddress}`, JSON.stringify(updatedTokens))
      tokens.value = updatedTokens
      console.log('Synced new tokens from blockchain. Total tokens:', updatedTokens.length)
    } else {
      console.log('No new tokens found to sync from blockchain.')
    }
  } catch (error) {
    console.error('Failed to sync tokens from blockchain:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadTokens()
})

// Watch for wallet connection changes
watch(() => walletStore.isConnected, (isConnected) => {
  if (isConnected) {
    loadTokens()
  } else {
    tokens.value = []
  }
})
</script>