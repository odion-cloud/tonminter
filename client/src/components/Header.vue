<template>
  <header class="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <svg class="h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L4 6v12l8 4 8-4V6l-8-4zm5.3 15.3l-5.3 2.7-5.3-2.7V6.7L12 4l5.3 2.7v10.6z"></path>
          </svg>
          <span class="ml-2 text-xl font-semibold">TON MINTER</span>
        </div>
        <div class="flex items-center space-x-4">
          <ClientOnly>
            <button
              @click="handleWalletAction"
              :class="walletButtonClass"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/>
                <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>
              </svg>
              {{ walletButtonText }}
            </button>
          </ClientOnly>

          <button @click="toggleTheme" class="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <svg v-if="isDarkMode" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
            </svg>
            <svg v-else class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWalletStore } from '@/stores/wallet'
import ClientOnly from '@/components/ClientOnly.vue'

const walletStore = useWalletStore()
const isDarkMode = ref(false)

const walletButtonText = computed(() =>
  walletStore.isConnected ? 
    `Connected: ${walletStore.getShortAddress()}` : 
    'Connect Wallet'
)

const walletButtonClass = computed(() =>
  walletStore.isConnected
    ? 'bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-500'
    : 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500'
)

const handleWalletAction = () => {
  if (walletStore.isConnected) {
    walletStore.disconnect()
  } else {
    walletStore.connect()
  }
}

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.classList.toggle('dark', isDarkMode.value)
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
}

// Initialize theme from localStorage
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDarkMode.value = true
    document.documentElement.classList.add('dark')
  }
})
</script>

<style scoped>
.h-4 {
  height: 1rem;
}

.w-4 {
  width: 1rem;
}

.h-5 {
  height: 1.25rem;
}

.w-5 {
  width: 1.25rem;
}

.h-8 {
  height: 2rem;
}

.w-8 {
  width: 2rem;
}

.h-10 {
  height: 2.5rem;
}

.w-10 {
  width: 2.5rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.ml-2 {
  margin-left: 0.5rem;
}

.space-x-4 > * + * {
  margin-left: 1rem;
}
</style> 