<template>
  <div class="grid gap-6 md:grid-cols-3">
    <!-- Compile Card -->
    <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <CodeIcon class="h-5 w-5 text-blue-500 mr-2" />
          <h3 class="text-lg font-semibold">Compile Contract</h3>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400">Build your FunC smart contract</p>
      </div>

      <div class="px-6 py-4">
        <div v-if="compileResult" class="mb-4">
          <div class="flex items-center">
            <CheckIcon v-if="compileResult.success" class="h-4 w-4 text-green-500 mr-2" />
            <AlertTriangleIcon v-else class="h-4 w-4 text-red-500 mr-2" />
            <span :class="compileResult.success ? 'text-green-700' : 'text-red-700'" class="text-sm font-medium">
              {{ compileResult.message }}
            </span>
          </div>
        </div>

        <button
          @click="onCompile"
          class="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium"
        >
          <CodeIcon class="h-4 w-4 mr-2" />
          Compile Contract
        </button>
      </div>
    </div>

    <!-- Test Card -->
    <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <ShieldCheckIcon class="h-5 w-5 text-green-500 mr-2" />
          <h3 class="text-lg font-semibold">Run Tests</h3>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400">Verify contract functionality</p>
      </div>

      <div class="px-6 py-4">
        <div v-if="testResult" class="mb-4">
          <div class="flex items-center">
            <CheckIcon v-if="testResult.success" class="h-4 w-4 text-green-500 mr-2" />
            <AlertTriangleIcon v-else class="h-4 w-4 text-red-500 mr-2" />
            <span :class="testResult.success ? 'text-green-700' : 'text-red-700'" class="text-sm font-medium">
              Tests: {{ testsCount }}
            </span>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {{ testResult.message }}
          </p>
        </div>

        <button
          @click="onRunTests"
          :disabled="!isCompiled"
          :class="[
            'w-full inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium',
            isCompiled 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          ]"
        >
          <ClipboardCheckIcon class="h-4 w-4 mr-2" />
          Run Tests {{ isCompiled ? '(Ready)' : '(Disabled)' }}
        </button>
      </div>
    </div>

    <!-- Deploy Card -->
    <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center">
          <CloudUploadIcon class="h-5 w-5 text-purple-500 mr-2" />
          <h3 class="text-lg font-semibold">Deploy Contract</h3>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400">Launch to {{ activeNetwork.toUpperCase() }}</p>
      </div>

      <div class="px-6 py-4">
        <div v-if="deployResult" class="mb-4">
          <div class="flex items-center">
            <CheckIcon v-if="deployResult.success" class="h-4 w-4 text-green-500 mr-2" />
            <AlertTriangleIcon v-else class="h-4 w-4 text-red-500 mr-2" />
            <span :class="deployResult.success ? 'text-green-700' : 'text-red-700'" class="text-sm font-medium">
              {{ deployResult.message }}
            </span>
          </div>

          <div v-if="deployResult.success && deployResult.address" class="mt-2">
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-500">Contract Address:</span>
              <a 
                :href="getTonscanUrl(deployResult.address)"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-500 hover:text-blue-600 flex items-center"
              >
                <span class="font-mono">{{ deployResult.address.slice(0, 8) }}...{{ deployResult.address.slice(-6) }}</span>
                <ExternalLinkIcon class="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>
        </div>

        <button
          @click="handleDeploy"
          :disabled="!testsPassed || isDeploying"
          :class="[
            'w-full inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium',
            testsPassed && !isDeploying
              ? 'bg-purple-500 hover:bg-purple-600 text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          ]"
        >
          <template v-if="isDeploying">
            <div class="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
            Deploying...
          </template>
          <template v-else>
            <CloudUploadIcon class="h-4 w-4 mr-2" />
            Deploy {{ testsPassed ? '(Ready)' : '(Need Tests)' }}
          </template>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { 
  ShieldCheck as ShieldCheckIcon, 
  ClipboardCheck as ClipboardCheckIcon, 
  Upload as CloudUploadIcon,
  Code as CodeIcon,
  Check as CheckIcon,
  AlertTriangle as AlertTriangleIcon,
  ExternalLink as ExternalLinkIcon
} from 'lucide-vue-next'
import { useWalletStore } from '@/stores/wallet'

export default {
  name: 'ActionCards',
  components: {
    ShieldCheckIcon,
    ClipboardCheckIcon,
    CloudUploadIcon,
    CodeIcon,
    CheckIcon,
    AlertTriangleIcon,
    ExternalLinkIcon
  },
  props: {
    compileResult: {
      type: Object,
      default: null
    },
    testResult: {
      type: Object,
      default: null
    },
    deployResult: {
      type: Object,
      default: null
    },
    activeNetwork: {
      type: String,
      required: true
    }
  },
  emits: ['compile', 'runTests', 'deploy'],
  setup(props, { emit }) {
    const walletStore = useWalletStore()
    const isDeploying = ref(false)

    const isCompiled = computed(() => {
      console.log('Computing isCompiled:', props.compileResult)
      return props.compileResult?.success === true
    })

    const testsPassed = computed(() => {
      console.log('Computing testsPassed:', props.testResult)
      return props.testResult?.success === true
    })

    const testsCount = computed(() => {
      if (props.testResult && props.testResult.tests) {
        const passedTests = props.testResult.tests.filter(t => t.passed).length
        const totalTests = props.testResult.tests.length
        return `${passedTests}/${totalTests}`
      }
      return "0/5"
    })

    const getTonscanUrl = (address) => {
      const formattedAddress = address.replace(/^0x/, '')

      if (props.activeNetwork === 'testnet') {
        return `https://testnet.tonscan.org/address/${formattedAddress}`
      }
      return `https://tonscan.org/address/${formattedAddress}`
    }

    const onCompile = () => {
      emit('compile')
    }

    const onRunTests = () => {
      emit('runTests')
    }

    const handleDeploy = async () => {
      // Check if wallet is connected
      if (!walletStore.isConnected) {
        try {
          await walletStore.connect()
        } catch (error) {
          return // User cancelled or connection failed
        }
      }

      // Wallet is now connected, proceed with deployment
      try {
        isDeploying.value = true

        // Introduce a slight delay to simulate the wallet interaction
        setTimeout(() => {
          emit('deploy')
          isDeploying.value = false
        }, 1500)
      } catch (error) {
        isDeploying.value = false
        console.error('Deployment failed:', error)
      }
    }

    return {
      isDeploying,
      isCompiled,
      testsPassed,
      testsCount,
      getTonscanUrl,
      onCompile,
      onRunTests,
      handleDeploy
    }
  }
}
</script>

<style scoped>
.action-cards {
  max-width: 100%;
}

.card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.card-header {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  border-radius: 12px 12px 0 0 !important;
  border: none;
}

.btn {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn:disabled {
  transform: none;
}

.alert {
  border: none;
  border-radius: 8px;
}

.display-4 {
  font-size: 2.5rem;
}

.display-6 {
  font-size: 1.5rem;
}

code {
  font-size: 0.85rem;
  word-break: break-all;
}
</style>