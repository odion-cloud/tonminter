<template>
  <div class="w-full lg:w-64 flex-shrink-0">
    <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="p-5">
        <div class="flex items-center mb-4">
          <NetworkIcon class="h-5 w-5 text-blue-500 mr-2" />
          <h3 class="text-lg font-semibold">Network Settings</h3>
        </div>
        
        <div class="flex items-center justify-between mb-4">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Current Network</span>
          <span :class="networkBadgeClass" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
            {{ networkDisplayName }}
          </span>
        </div>
        
        <div class="mt-4">
          <label for="network" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Network
          </label>
          <select 
            id="network"
            :value="activeNetwork" 
            @change="handleNetworkChange"
            class="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&amp;&gt;span]:line-clamp-1 w-full"
          >
            <option value="mainnet">TON Mainnet</option>
            <option value="testnet">TON Testnet</option>
          </select>
        </div>
        
        <div class="mt-6 text-sm text-gray-500 dark:text-gray-400">
          <p>Use Testnet for development and testing. Deploy to Mainnet when ready for production.</p>
          <p class="mt-2">Deployment requires at least 0.25 TON for fees.</p>
        </div>
        
        <div v-if="activeNetwork === 'testnet'" class="mt-4 text-xs text-blue-600 dark:text-blue-400">
          Testnet tokens can be obtained from the 
          <a 
            href="https://t.me/testgiver_ton_bot" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="underline"
          >
            Testnet Giver bot
          </a>.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { Network as NetworkIcon } from 'lucide-vue-next'

export default {
  name: 'Sidebar',
  components: {
    NetworkIcon
  },
  props: {
    activeNetwork: {
      type: String,
      required: true
    }
  },
  emits: ['networkChange'],
  setup(props, { emit }) {
    const networkBadgeClass = computed(() => {
      switch (props.activeNetwork) {
        case 'mainnet':
          return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200'
        case 'testnet':
          return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
        default:
          return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      }
    })
    
    const networkDisplayName = computed(() => {
      switch (props.activeNetwork) {
        case 'mainnet':
          return 'Mainnet'
        case 'testnet':
          return 'Testnet'
        default:
          return 'Unknown'
      }
    })
    
    const handleNetworkChange = (event) => {
      emit('networkChange', event.target.value)
    }
    
    return {
      networkBadgeClass,
      networkDisplayName,
      handleNetworkChange
    }
  }
}
</script>

<style scoped>
.h-5 {
  height: 1.25rem;
}

.w-5 {
  width: 1.25rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-4 {
  margin-top: 1rem;
}

.mt-6 {
  margin-top: 1.5rem;
}

.badge {
  border: 1px solid transparent;
}

.card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

@media (prefers-color-scheme: dark) {
  .card {
    background: rgba(52, 58, 64, 0.95);
    color: #f8f9fa;
  }
}
</style> 