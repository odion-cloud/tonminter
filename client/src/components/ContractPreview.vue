<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Contract Preview</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Review the generated FunC contract code before compilation
        </p>
      </div>

      <button 
        @click="handleCopyCode"
        class="inline-flex items-center px-3 py-1.5 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg class="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
        </svg>
        Copy Code
      </button>
    </div>

    <!-- Compile Result Alert -->
    <div v-if="compileResult" :class="[
      'rounded-lg p-4 mb-4',
      compileResult.success 
        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
    ]">
      <div class="flex">
        <svg v-if="compileResult.success" class="h-5 w-5 text-green-500 mr-3 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <svg v-else class="h-5 w-5 text-red-500 mr-3 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <div>
          <h3 :class="[
            'text-sm font-medium',
            compileResult.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
          ]">
            {{ compileResult.success ? 'Compilation Successful' : 'Compilation Failed' }}
          </h3>
          <p :class="[
            'mt-1 text-sm',
            compileResult.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
          ]">
            {{ compileResult.message }}
          </p>
          <div v-if="compileResult.success" class="mt-2 text-xs text-green-600 dark:text-green-400">
            <p>Contract Hash: {{ compileResult.contractHash }}</p>
            <p>Code Size: {{ compileResult.codeSize }} bytes</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Contract Preview Tabs -->
    <div class="w-full">
      <!-- Tab Headers -->
      <div class="border-b border-gray-200 dark:border-gray-700 mb-2">
        <nav class="flex -mb-px">
          <button
            @click="activeTab = 'minter'"
            :class="[
              'py-2 px-4 text-sm font-medium border-b-2',
              activeTab === 'minter'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            ]"
          >
            Jetton Minter
          </button>
          <button
            @click="activeTab = 'wallet'"
            :class="[
              'py-2 px-4 text-sm font-medium border-b-2 ml-8',
              activeTab === 'wallet'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            ]"
          >
            Jetton Wallet
          </button>
          <button
            @click="activeTab = 'metadata'"
            :class="[
              'py-2 px-4 text-sm font-medium border-b-2 ml-8',
              activeTab === 'metadata'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            ]"
          >
            Token Metadata
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="mt-2">
        <!-- Jetton Minter Tab -->
        <div v-if="activeTab === 'minter'">
          <div class="bg-gray-800 rounded-md overflow-hidden border border-gray-700">
            <div class="flex items-center justify-between px-4 py-2 bg-gray-900">
              <span class="text-sm font-medium text-gray-200">jetton-minter.fc</span>
              <div class="flex items-center space-x-2">
                <span v-if="compileResult?.success" class="text-xs text-green-400 flex items-center">
                  <svg class="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  Compiled
                </span>
                <span v-else class="text-xs text-gray-400 flex items-center">
                  <svg class="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                    <path d="M21 3v5h-5"/>
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                    <path d="M3 21v-5h5"/>
                  </svg>
                  Generated
                </span>
              </div>
            </div>
            <div class="p-4 font-mono text-sm text-gray-200 overflow-x-auto" style="max-height: 400px">
              <pre class="whitespace-pre-wrap">{{ minterCode }}</pre>
            </div>
          </div>
        </div>

        <!-- Jetton Wallet Tab -->
        <div v-if="activeTab === 'wallet'">
          <div class="bg-gray-800 rounded-md overflow-hidden border border-gray-700">
            <div class="flex items-center justify-between px-4 py-2 bg-gray-900">
              <span class="text-sm font-medium text-gray-200">jetton-wallet.fc</span>
              <div class="flex items-center space-x-2">
                <span class="text-xs text-blue-400">Custom Fee Logic</span>
              </div>
            </div>
            <div class="p-4 font-mono text-sm text-gray-200 overflow-x-auto" style="max-height: 400px">
              <pre class="whitespace-pre-wrap">{{ walletCode }}</pre>
            </div>
          </div>
        </div>

        <!-- Token Metadata Tab -->
        <div v-if="activeTab === 'metadata'">
          <div class="bg-gray-800 rounded-md overflow-hidden border border-gray-700">
            <div class="flex items-center justify-between px-4 py-2 bg-gray-900">
              <span class="text-sm font-medium text-gray-200">metadata.json</span>
              <button 
                @click="handleCopyMetadata"
                class="text-xs text-blue-400 hover:text-blue-300 flex items-center"
              >
                <svg class="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                </svg>
                Copy
              </button>
            </div>
            <div class="p-4 font-mono text-sm text-gray-200 overflow-x-auto" style="max-height: 400px">
              <pre class="whitespace-pre-wrap">{{ metadataJson }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { generateJettonMinter, generateJettonWallet } from '@/lib/contract-generator.js'

const props = defineProps({
  config: {
    type: Object,
    required: true
  },
  compileResult: {
    type: Object,
    default: null
  }
})

const activeTab = ref('minter')

// Generate actual contract code based on configuration
const minterCode = computed(() => {
  return generateJettonMinter(props.config)
})

const walletCode = computed(() => {
  return generateJettonWallet(props.config)
})

const metadataJson = computed(() => {
  const { token, transactionFee, buyback } = props.config

  const metadata = {
    name: token.name,
    symbol: token.symbol,
    decimals: token.decimals,
    description: token.description || `${token.name} - A custom TON token`,
    image: token.imageUrl || "https://ton.org/jetton-default-image.png",

    // Contract configuration embedded in metadata for transparency
    contract_config: {
      has_transaction_fees: transactionFee && transactionFee.distributionType !== 'none',
      fee_percentage: transactionFee?.feePercentage || 0,
      buyback_percentage: transactionFee?.buybackPercentage || 0,
      treasury_percentage: transactionFee?.treasuryPercentage || 0,
      has_deflationary_mechanism: buyback && buyback.triggerType !== 'none',
      buyback_threshold: buyback?.thresholdAmount || 0,
      max_buyback_per_tx: buyback?.maxBuybackPerTx || 0,
      buyback_trigger: buyback?.triggerType || 'none'
    },

    total_supply: token.totalSupply,
    created_at: new Date().toISOString(),
    contract_version: "1.0.0"
  }

  return JSON.stringify(metadata, null, 2)
})

const handleCopyCode = async () => {
  try {
    const codeToShare = activeTab.value === 'minter' ? minterCode.value : walletCode.value
    await navigator.clipboard.writeText(codeToShare)
    alert('Contract code copied to clipboard!')
  } catch (err) {
    console.error('Failed to copy:', err)
    alert('Failed to copy code to clipboard')
  }
}

const handleCopyMetadata = async () => {
  try {
    await navigator.clipboard.writeText(metadataJson.value)
    alert('Metadata copied to clipboard!')
  } catch (err) {
    console.error('Failed to copy:', err)
    alert('Failed to copy metadata to clipboard')
  }
}
</script>

<style scoped>
.contract-preview {
  max-width: 100%;
}

.card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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

pre {
  font-size: 0.85rem;
  line-height: 1.4;
}

.alert {
  border: none;
  border-radius: 8px;
}

.table {
  font-size: 0.9rem;
}

.table th {
  border-top: none;
  font-weight: 600;
  color: #495057;
}

.badge {
  font-size: 0.75rem;
}
</style>