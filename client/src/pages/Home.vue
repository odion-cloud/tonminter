<template>
  <div class="bg-gray-50 font-sans text-gray-900 dark:bg-slate-900 dark:text-gray-100 min-h-screen">
    <Header />
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex flex-col lg:flex-row gap-6">
        <Sidebar :activeNetwork="activeNetwork" @networkChange="setActiveNetwork" />
        
        <div class="flex-1">
          <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <!-- Header with Action Buttons -->
            <div class="border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">TON Token Minter</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Create and deploy your custom TON token</p>
                </div>
                <button 
                  class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  @click="toggleContractPreview"
                >
                  <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="16 18 22 12 16 6"/>
                    <polyline points="8 6 2 12 8 18"/>
                  </svg>
                  {{ showContractPreview ? "Hide Preview" : "Show Contract Preview" }}
                </button>
              </div>
            </div>

            <!-- Contract Preview or Configuration Tabs -->
            <div v-if="showContractPreview" class="p-4 sm:p-6">
              <ContractPreview 
                :config="contractConfig"
                :compileResult="compileResult"
              />
              <div class="mt-6 flex justify-between">
                <button 
                  @click="toggleContractPreview"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                  Back to Configuration
                </button>
                
                <button 
                  @click="handleCompile"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Compile Contract
                </button>
              </div>
            </div>

            <!-- Configuration Tabs -->
            <div v-else>
              <!-- Tab Navigation -->
              <div class="border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6">
                <nav class="flex -mb-px">
                  <button
                    v-for="tab in tabs"
                    :key="tab.value"
                    @click="setActiveTab(tab.value)"
                    :class="[
                      'border-b-2 border-transparent py-4 px-1 font-medium text-sm whitespace-nowrap',
                      tab.value === 'tokenConfig' ? 'ml-0' : 'ml-8',
                      activeTab === tab.value
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                    ]"
                  >
                    {{ tab.label }}
                  </button>
                </nav>
              </div>

              <!-- Tab Content -->
              <div class="p-4 sm:p-6">
                <div v-if="activeTab === 'tokenConfig'">
                  <TokenConfiguration 
                    :config="contractConfig.token"
                    @change="updateTokenConfig"
                  />
                </div>
                <div v-if="activeTab === 'txFeeSettings'">
                  <TransactionFeeSettings 
                    :config="contractConfig.transactionFee"
                    @change="updateTransactionFeeConfig"
                  />
                </div>
                <div v-if="activeTab === 'buybackBurn'">
                  <BuybackBurnSettings 
                    :config="contractConfig.buyback"
                    :tokenSymbol="contractConfig.token.symbol"
                    @change="updateBuybackConfig"
                  />
                </div>
              </div>

              <!-- Footer Navigation -->
              <div class="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between w-full">
                <button 
                  v-if="activeTab !== 'tokenConfig'"
                  @click="handlePrevTab"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                  Previous
                </button>
                <div v-else></div>
                
                <button 
                  @click="handleNextTab"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {{ activeTab === 'buybackBurn' ? 'Review Contract' : 'Next' }}
                  <svg class="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Action Cards (Deploy & Test) -->
          <ActionCards 
            :compileResult="compileResult"
            :testResult="testResult"
            :deployResult="deployResult"
            :activeNetwork="activeNetwork"
            @compile="handleCompile"
            @runTests="handleRunTests"
            @deploy="handleDeploy"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'
import TokenConfiguration from '@/components/TokenConfiguration.vue'
import TransactionFeeSettings from '@/components/TransactionFeeSettings.vue'
import BuybackBurnSettings from '@/components/BuybackBurnSettings.vue'
import ContractPreview from '@/components/ContractPreview.vue'
import ActionCards from '@/components/ActionCards.vue'
import { useContractStore } from '@/stores/contract'

const contractStore = useContractStore()

const activeTab = ref('tokenConfig')
const activeNetwork = ref('testnet')
const showContractPreview = ref(false)

const tabs = [
  { value: 'tokenConfig', label: 'Token Configuration' },
  { value: 'txFeeSettings', label: 'Transaction Fee Settings' },
  { value: 'buybackBurn', label: 'Buyback & Burn' }
]

const contractConfig = reactive({
  token: {
    name: 'TON Token',
    symbol: 'TTKN',
    decimals: 9,
    totalSupply: 2100000000,
    initialPrice: 0.01,
    imageUrl: '',
    description: 'A deflationary TON token with automatic buyback-burn mechanism'
  },
  transactionFee: {
    feePercentage: 2,
    distributionType: 'default',
    buybackPercentage: 50,
    treasuryPercentage: 50
  },
  buyback: {
    triggerType: 'threshold',
    thresholdAmount: 10000,
    timePeriod: 'weekly',
    maxBuybackPerTx: 5000
  }
})

const compileResult = ref(null)
const testResult = ref(null)
const deployResult = ref(null)

// Tab navigation functions
const setActiveTab = (value) => {
  activeTab.value = value
  showContractPreview.value = false
}

const handleNextTab = () => {
  // Validate current tab before proceeding
  if (activeTab.value === 'tokenConfig') {
    if (validateTokenConfig()) {
      activeTab.value = 'txFeeSettings'
    }
  } else if (activeTab.value === 'txFeeSettings') {
    if (validateTransactionFeeConfig()) {
      activeTab.value = 'buybackBurn'
    }
  } else if (activeTab.value === 'buybackBurn') {
    if (validateBuybackConfig()) {
      showContractPreview.value = true
    }
  }
}

const handlePrevTab = () => {
  if (activeTab.value === 'txFeeSettings') {
    activeTab.value = 'tokenConfig'
  } else if (activeTab.value === 'buybackBurn') {
    activeTab.value = 'txFeeSettings'
  } else if (showContractPreview.value) {
    showContractPreview.value = false
    activeTab.value = 'buybackBurn'
  }
}

const toggleContractPreview = () => {
  showContractPreview.value = !showContractPreview.value
}

// Validation functions
const validateTokenConfig = () => {
  const { name, symbol, decimals, totalSupply, initialPrice } = contractConfig.token
  
  if (!name || name.length < 1) {
    alert('Token name is required')
    return false
  }
  
  if (!symbol || symbol.length < 1) {
    alert('Token symbol is required')
    return false
  }
  
  if (!/^[A-Z0-9]+$/.test(symbol)) {
    alert('Symbol must contain only uppercase letters and numbers')
    return false
  }
  
  if (decimals < 0 || decimals > 18) {
    alert('Decimals must be between 0 and 18')
    return false
  }
  
  if (totalSupply <= 0) {
    alert('Total supply must be greater than 0')
    return false
  }
  
  if (initialPrice <= 0) {
    alert('Initial price must be greater than 0')
    return false
  }
  
  return true
}

const validateTransactionFeeConfig = () => {
  const { feePercentage, distributionType, buybackPercentage, treasuryPercentage } = contractConfig.transactionFee
  
  if (feePercentage < 0 || feePercentage > 10) {
    alert('Fee percentage must be between 0 and 10%')
    return false
  }
  
  if (distributionType === 'custom') {
    if ((buybackPercentage + treasuryPercentage) !== 100) {
      alert('Buyback and treasury percentages must add up to 100%')
      return false
    }
  }
  
  return true
}

const validateBuybackConfig = () => {
  const { thresholdAmount, maxBuybackPerTx } = contractConfig.buyback
  
  if (thresholdAmount <= 0) {
    alert('Threshold amount must be greater than 0')
    return false
  }
  
  if (maxBuybackPerTx <= 0) {
    alert('Maximum buyback per transaction must be greater than 0')
    return false
  }
  
  return true
}

// Network and config update functions
const setActiveNetwork = (network) => {
  activeNetwork.value = network
  console.log(`Network changed to: ${network}`)
}

const updateTokenConfig = (config) => {
  Object.assign(contractConfig.token, config)
}

const updateTransactionFeeConfig = (config) => {
  Object.assign(contractConfig.transactionFee, config)
}

const updateBuybackConfig = (config) => {
  Object.assign(contractConfig.buyback, config)
}

// Action handlers
const handleCompile = async () => {
  try {
    compileResult.value = await contractStore.compileContract(contractConfig)
  } catch (error) {
    console.error('Compilation failed:', error)
    compileResult.value = {
      success: false,
      message: error.message || 'Compilation failed'
    }
  }
}

const handleRunTests = async () => {
  try {
    testResult.value = await contractStore.testContract(contractConfig)
  } catch (error) {
    console.error('Testing failed:', error)
    testResult.value = {
      success: false,
      message: error.message || 'Testing failed',
      testsRun: 0,
      testsPassed: 0,
      testsFailed: 0,
      details: []
    }
  }
}

const handleDeploy = async () => {
  try {
    deployResult.value = await contractStore.deployContract({
      ...contractConfig,
      network: activeNetwork.value
    })
  } catch (error) {
    console.error('Deployment failed:', error)
    deployResult.value = {
      success: false,
      message: error.message || 'Deployment failed'
    }
  }
}
</script>

<style scoped>
.nav-tabs {
  border-bottom: 2px solid #e9ecef;
}

.nav-tabs .nav-link {
  border: none;
  border-radius: 8px 8px 0 0;
  color: #6c757d;
  font-weight: 500;
  padding: 1rem 1.5rem;
}

.nav-tabs .nav-link.active {
  background-color: #0d6efd;
  color: #fff;
  border-color: #0d6efd;
}

.nav-tabs .nav-link:hover {
  border: none;
  color: #0d6efd;
}

.card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.card:hover {
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

@media (prefers-color-scheme: dark) {
  .card {
    background: rgba(52, 58, 64, 0.95);
    color: #f8f9fa;
  }
}
</style> 