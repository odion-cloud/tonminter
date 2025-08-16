<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-900">
    <Header />
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="text-red-500 text-lg font-medium mb-4">
          <svg class="h-12 w-12 mx-auto mb-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          Error loading jetton
        </div>
        <div class="text-sm text-gray-500 mb-4">
          {{ error }}
        </div>
        <div class="text-xs text-gray-400 mb-6">
          Address: {{ jettonAddress }}
        </div>
        <div class="space-x-4">
          <button 
            @click="loadJettonDetails"
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Try Again
          </button>
          <button 
            @click="$router.push('/')"
            class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
          >
            Go Home
          </button>
        </div>
      </div>

      <!-- Jetton Details -->
      <div v-else-if="jettonDetails" class="space-y-6">
        <div class="flex justify-between items-center">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Jetton Management</h1>
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-500 dark:text-gray-400">Network:</span>
            <span :class="[
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              activeNetwork === 'mainnet' 
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
            ]">
              {{ activeNetwork.toUpperCase() }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Token Information -->
          <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center mb-6">
              <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden mr-4">
                <img 
                  v-if="jettonDetails.minter?.metadata?.image" 
                  :src="jettonDetails.minter.metadata.image" 
                  alt="Token Logo" 
                  class="w-full h-full object-cover"
                />
                <svg v-else class="h-8 w-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                    {{ jettonDetails.minter?.metadata?.name || 'Unknown Token' }}
                    <span class="text-gray-500 dark:text-gray-400 ml-2">
                      ({{ jettonDetails.minter?.metadata?.symbol || 'N/A' }})
                    </span>
                  </h2>
                  <button 
                    v-if="isAdmin && !adminRevokedOwnership"
                    @click="showUpdateMetadataModal = true"
                    class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-medium"
                  >
                    Edit
                  </button>
                </div>
                <p class="text-gray-500 dark:text-gray-400 text-sm">
                  {{ jettonDetails.minter?.metadata?.description || 'No description available' }}
                </p>
              </div>
            </div>

            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <div>
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Contract Address</span>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    On-chain smart contract address of the Jetton parent
                  </p>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-sm font-mono text-gray-900 dark:text-white">
                    {{ formatAddress(jettonAddress) }}
                  </span>
                  <button 
                    @click="copyToClipboard(jettonAddress)"
                    class="text-blue-500 hover:text-blue-600"
                    title="Copy contract address"
                  >
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="flex justify-between items-center">
                <div>
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Admin Address</span>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Account address that can mint tokens and change metadata
                  </p>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-sm font-mono text-gray-900 dark:text-white">
                    {{ adminRevokedOwnership ? 'Empty address (Ownership revoked)' : formatAddress(jettonDetails.minter?.admin) }}
                  </span>
                  <button 
                    v-if="!adminRevokedOwnership"
                    @click="copyToClipboard(jettonDetails.minter?.admin)"
                    class="text-blue-500 hover:text-blue-600"
                    title="Copy admin address"
                  >
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                    </svg>
                  </button>
                  <button 
                    v-if="isAdmin && !adminRevokedOwnership"
                    @click="showRevokeModal = true"
                    class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium"
                  >
                    Revoke
                  </button>
                </div>
              </div>

              <div class="flex justify-between items-center">
                <div>
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Total Supply</span>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Total number of tokens in circulation
                  </p>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-sm text-gray-900 dark:text-white">
                    {{ formatNumber(jettonDetails.minter?.totalSupply) }} {{ jettonDetails.minter?.metadata?.symbol }}
                  </span>
                  <button 
                    v-if="isAdmin && !adminRevokedOwnership"
                    @click="showMintModal = true"
                    class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium"
                  >
                    Mint
                  </button>
                </div>
              </div>

              <div class="flex justify-between items-center">
                <div>
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Decimals</span>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Number of decimal places for token precision
                  </p>
                </div>
                <span class="text-sm text-gray-900 dark:text-white">
                  {{ jettonDetails.minter?.metadata?.decimals || 'N/A' }}
                </span>
              </div>
            </div>

            <!-- Admin Revoked Warning -->
            <div v-if="adminRevokedOwnership" class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div class="flex">
                  <svg class="h-5 w-5 text-green-400 mr-3 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <div class="text-green-700 dark:text-green-200">
                    <h3 class="text-sm font-medium">Ownership Revoked</h3>
                    <p class="mt-1 text-sm">This token is now safe and immutable. No admin actions are possible.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Non-Admin Warning -->
            <div v-if="!isAdmin && !adminRevokedOwnership" class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div class="flex">
                  <svg class="h-5 w-5 text-yellow-400 mr-3 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  <div class="text-yellow-700 dark:text-yellow-200">
                    <h3 class="text-sm font-medium">Token Safety Warning</h3>
                    <p class="mt-1 text-sm">This token is not 100% safe because admin has not revoked ownership. The admin can still mint more tokens and change metadata.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Wallet Information -->
          <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Wallet Information</h3>
            
            <div v-if="!walletStore.isConnected" class="text-center py-8">
              <p class="text-gray-500 dark:text-gray-400 mb-4">Connect your wallet to view balance</p>
              <button 
                @click="walletStore.connect()"
                class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium"
              >
                Connect Wallet
              </button>
            </div>

            <div v-else class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Wallet Address</span>
                <span class="text-sm font-mono text-gray-900 dark:text-white">
                  {{ formatAddress(walletStore.address) }}
                </span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Balance</span>
                <span class="text-sm text-gray-900 dark:text-white">
                  {{ formatNumber(jettonDetails.jettonWallet?.balance) }} {{ jettonDetails.minter?.metadata?.symbol }}
                </span>
              </div>

              <!-- Wallet Actions -->
              <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div class="grid grid-cols-2 gap-3">
                  <button 
                    @click="showTransferModal = true"
                    :disabled="!jettonDetails.jettonWallet?.balance || jettonDetails.jettonWallet?.balance === '0'"
                    class="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Transfer
                  </button>
                  <button 
                    @click="showBurnModal = true"
                    :disabled="!jettonDetails.jettonWallet?.balance || jettonDetails.jettonWallet?.balance === '0'"
                    class="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Burn Tokens
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Admin Actions Section -->
        <div v-if="isAdmin && !adminRevokedOwnership" class="space-y-6">
          <!-- Admin Warning -->
          <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div class="flex">
              <svg class="h-5 w-5 text-yellow-400 mr-3 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <div class="text-yellow-700 dark:text-yellow-200">
                <h3 class="text-sm font-medium">Admin Warning</h3>
                <p class="mt-1 text-sm">You should revoke this token's ownership to make it safe and immutable. Your tokens will remain safely in your wallet.</p>
              </div>
            </div>
          </div>

          <!-- Basic Admin Actions -->
          <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Admin Actions</h3>
            <div class="grid grid-cols-3 gap-3">
              <button 
                @click="showMintModal = true"
                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Mint Tokens
              </button>
              <button 
                @click="showUpdateMetadataModal = true"
                class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Update Metadata
              </button>
              <button 
                @click="showRevokeModal = true"
                class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Revoke Ownership
              </button>
            </div>
          </div>

          <!-- Transaction Fee Configuration -->
          <div v-if="transactionFeeConfig.distributionType !== 'none'" class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Transaction Fee Configuration</h3>
              <button 
                @click="showTransactionFeeModal = true"
                class="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-sm font-medium"
              >
                Edit
              </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Fee Percentage</span>
                <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ transactionFeeConfig.feePercentage }}%</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Applied to every token transfer</p>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Fee Distribution</span>
                <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ transactionFeeConfig.buybackPercentage }}% Buyback & Burn / {{ transactionFeeConfig.treasuryPercentage }}% Treasury</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">How fees are distributed</p>
              </div>
            </div>
          </div>
          <div v-else class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Transaction Fee Configuration</h3>
              <button 
                @click="showTransactionFeeModal = true"
                class="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-sm font-medium"
              >
                Edit
              </button>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Transaction fees are disabled. No fees will be applied to token transfers.
              </p>
            </div>
          </div>

          <!-- Deflationary Mechanism -->
          <div v-if="deflationaryConfig.triggerType !== 'none'" class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Deflationary Mechanism</h3>
              <button 
                @click="showDeflationaryModal = true"
                class="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-sm font-medium"
              >
                Edit
              </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Buyback Trigger</span>
                <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ deflationaryConfig.triggerType }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">How buybacks are triggered</p>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Threshold Amount</span>
                <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ formatNumber(deflationaryConfig.thresholdAmount) }} {{ jettonDetails.minter?.metadata?.symbol }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Amount needed to trigger buyback</p>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Time Period</span>
                <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ deflationaryConfig.timePeriod }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">How often buybacks run</p>
              </div>
              <div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Max Per Transaction</span>
                <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ formatNumber(deflationaryConfig.maxBuybackPerTx) }} {{ jettonDetails.minter?.metadata?.symbol }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Maximum buyback per transaction</p>
              </div>
            </div>
          </div>
          <div v-else class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Deflationary Mechanism</h3>
              <button 
                @click="showDeflationaryModal = true"
                class="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-sm font-medium"
              >
                Edit
              </button>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Deflationary mechanism is disabled. No automatic buyback will occur.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <MintModal v-if="showMintModal" @close="showMintModal = false" @mint="handleMint" />
    <UpdateMetadataModal v-if="showUpdateMetadataModal" @close="showUpdateMetadataModal = false" @update="handleUpdateMetadata" />
    <RevokeModal v-if="showRevokeModal" @close="showRevokeModal = false" @revoke="handleRevoke" />
    <TransferModal v-if="showTransferModal" @close="showTransferModal = false" @transfer="handleTransfer" />
    <BurnModal v-if="showBurnModal" @close="showBurnModal = false" @burn="handleBurn" />
    <TransactionFeeModal v-if="showTransactionFeeModal" :current-config="transactionFeeConfig" @close="showTransactionFeeModal = false" @update="handleUpdateTransactionFee" />
    <DeflationaryModal v-if="showDeflationaryModal" :current-config="deflationaryConfig" @close="showDeflationaryModal = false" @update="handleUpdateDeflationary" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useContractStore } from '@/stores/contract'
import { useWalletStore } from '@/stores/wallet'
import { getTonApiClient } from '@shared/blockchain/ton-api'
import { isValidAddress } from '@shared/blockchain/blockchain-utils'
import Header from '@/components/Header.vue'
import MintModal from '@/components/modals/MintModal.vue'
import UpdateMetadataModal from '@/components/modals/UpdateMetadataModal.vue'
import RevokeModal from '@/components/modals/RevokeModal.vue'
import TransferModal from '@/components/modals/TransferModal.vue'
import BurnModal from '@/components/modals/BurnModal.vue'
import TransactionFeeModal from '@/components/modals/TransactionFeeModal.vue'
import DeflationaryModal from '@/components/modals/DeflationaryModal.vue'
import { toUserFriendlyAddress } from '@tonconnect/sdk'

const route = useRoute()
const walletStore = useWalletStore()
const contractStore = useContractStore()

const jettonAddress = computed(() => route.params.address)
const activeNetwork = computed(() => contractStore.activeNetwork)

const isLoading = ref(false)
const error = ref(null)
const jettonDetails = ref(null)

// Modal states
const showMintModal = ref(false)
const showUpdateMetadataModal = ref(false)
const showRevokeModal = ref(false)
const showTransferModal = ref(false)
const showBurnModal = ref(false)
const showTransactionFeeModal = ref(false)
const showDeflationaryModal = ref(false)

// Configuration data (loaded from blockchain metadata)
const transactionFeeConfig = ref({
  feePercentage: 2,
  buybackPercentage: 50,
  treasuryPercentage: 50,
  distributionType: 'default'
})

const deflationaryConfig = ref({
  triggerType: 'Threshold Based',
  thresholdAmount: 10000,
  timePeriod: 'Weekly',
  maxBuybackPerTx: 5000,
  enableAutoBuyback: true,
  enableBurnOnBuyback: true
})

// Computed
const isAdmin = computed(() => {
  if (!jettonDetails.value?.minter?.admin || !walletStore.getRawAddress()) return false
  
  // Get admin address as string (following minter project approach)
  const adminAddress = jettonDetails.value.minter.admin
  const walletRawAddress = walletStore.getRawAddress()
  
  if (adminAddress && walletRawAddress) {
    try {
      // Convert admin address to string if it's an Address object
      const adminAddressStr = typeof adminAddress === 'object' && adminAddress.toFriendly 
        ? adminAddress.toFriendly({ urlSafe: true, bounceable: false })
        : adminAddress.toString()
      
      // Compare with raw wallet address
      if (adminAddressStr === walletRawAddress) return true
      
      // Also try comparing with user-friendly wallet address
      if (adminAddressStr === walletStore.address) return true
      
      return false
    } catch (error) {
      console.warn('Error comparing addresses:', error)
      return false
    }
  }
  
  return false
})

const adminRevokedOwnership = computed(() => {
  if (!jettonDetails.value?.minter?.admin) return false
  
  // Check if admin address is empty or zero address
  const adminAddress = jettonDetails.value.minter.admin
  let adminAddressStr = ''
  
  // Handle Address objects (from TON library)
  if (typeof adminAddress === 'object' && adminAddress.toFriendly) {
    try {
      adminAddressStr = adminAddress.toFriendly({ urlSafe: true, bounceable: false })
    } catch (error) {
      console.warn('Error converting admin Address object to string:', error)
      return false
    }
  } else if (typeof adminAddress === 'string') {
    adminAddressStr = adminAddress
  } else {
    return false
  }
  
  return !adminAddressStr || 
         adminAddressStr === 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c' || 
         adminAddressStr === '0:0000000000000000000000000000000000000000000000000000000000000000'
})

// Methods
const loadJettonDetails = async () => {
  if (!jettonAddress.value) {
    error.value = 'No jetton address provided'
    return
  }
  
  try {
    isLoading.value = true
    error.value = null
    
    // Validate address format
    if (!isValidAddress(jettonAddress.value)) {
      throw new Error('Invalid TON address format')
    }
    
    const details = await contractStore.getJettonDetails(jettonAddress.value)
    jettonDetails.value = details
    console.log(details.minter,details.jettonWallet)
    // Extract transaction fee and deflationary configuration from metadata
    if (details?.minter?.metadata) {
      const metadata = details.minter.metadata
      
      // Load transaction fee configuration
      const feeDistributionType = metadata.transaction_fee_distribution_type || 'default'
      transactionFeeConfig.value = {
        feePercentage: feeDistributionType === 'none' ? 0 : (parseInt(metadata.transaction_fee_percentage) || 2),
        buybackPercentage: feeDistributionType === 'none' ? 0 : (parseInt(metadata.transaction_fee_buyback_percentage) || 50),
        treasuryPercentage: feeDistributionType === 'none' ? 0 : (parseInt(metadata.transaction_fee_treasury_percentage) || 50),
        distributionType: feeDistributionType
      }
      
      // Load deflationary mechanism configuration
      const deflationaryTriggerType = metadata.deflationary_trigger_type || 'threshold'
      deflationaryConfig.value = {
        triggerType: deflationaryTriggerType === 'none' ? 'none' :
                    deflationaryTriggerType === 'threshold' ? 'Threshold Based' : 
                    deflationaryTriggerType === 'time' ? 'Time Based' :
                    deflationaryTriggerType === 'hybrid' ? 'Hybrid' : 'Threshold Based',
        thresholdAmount: deflationaryTriggerType === 'none' ? 0 : (parseInt(metadata.deflationary_threshold_amount) || 10000),
        timePeriod: deflationaryTriggerType === 'none' ? 'Weekly' :
                   metadata.deflationary_time_period === 'daily' ? 'Daily' :
                   metadata.deflationary_time_period === 'weekly' ? 'Weekly' :
                   metadata.deflationary_time_period === 'monthly' ? 'Monthly' : 'Weekly',
        maxBuybackPerTx: deflationaryTriggerType === 'none' ? 0 : (parseInt(metadata.deflationary_max_buyback_per_tx) || 5000),
        enableAutoBuyback: deflationaryTriggerType === 'none' ? false : (metadata.deflationary_enable_auto_buyback === 'true'),
        enableBurnOnBuyback: deflationaryTriggerType === 'none' ? false : (metadata.deflationary_enable_burn_on_buyback === 'true')
      }
    }
  } catch (err) {
    error.value = err.message || 'Failed to load jetton details'
    console.error('Failed to load jetton details:', err)
    jettonDetails.value = null
  } finally {
    isLoading.value = false
  }
}

const isValidTonAddress = (address) => {
  if (!address) return false
  
  // Use the blockchain-utils isValidAddress method which handles both raw and friendly addresses
  return isValidAddress(address)
}

const formatAddress = (address) => {
  // Check if address exists
  if (!address) return 'N/A'
  
  let addressStr = ''
  
  // Handle Address objects (from TON library)
  if (typeof address === 'object' && address.toFriendly) {
    try {
      addressStr = address.toFriendly({ urlSafe: true, bounceable: false })
    } catch (error) {
      console.warn('Error converting Address object to string:', error)
      return 'N/A'
    }
  } else if (typeof address === 'string') {
    addressStr = address
  } else {
    return 'N/A'
  }
  
  // Check if it's a zero address (revoked ownership)
  if (addressStr === 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c' || 
      addressStr === '0:0000000000000000000000000000000000000000000000000000000000000000') {
    return 'Empty address (Ownership revoked)'
  }
  
  // Ensure the address has enough characters to slice
  if (addressStr.length < 14) return addressStr
  
  return addressStr.slice(0, 8) + '...' + addressStr.slice(-6)
}

const formatNumber = (number) => {
  // Check if number exists and can be converted to a number
  if (number === null || number === undefined || isNaN(Number(number))) return '0'
  
  try {
    return new Intl.NumberFormat().format(Number(number).toString())
  } catch (error) {
    console.warn('Error formatting number:', error)
    return '0'
  }
}

const copyToClipboard = async (text) => {
  try {
    // Handle Address objects (from TON library)
    let textToCopy = ''
    if (typeof text === 'object' && text.toFriendly) {
      try {
        textToCopy = text.toFriendly({ urlSafe: true, bounceable: false })
      } catch (error) {
        console.warn('Error converting Address object to string:', error)
        return
      }
    } else if (typeof text === 'string') {
      textToCopy = text
    } else {
      console.warn('Invalid text for clipboard:', text)
      return
    }
    
    // Ensure text is not empty
    if (!textToCopy) {
      console.warn('Empty text for clipboard')
      return
    }
    
    await navigator.clipboard.writeText(textToCopy)
    
    // Show a simple notification
    const notification = document.createElement('div')
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50'
    notification.textContent = 'Address copied to clipboard!'
    document.body.appendChild(notification)
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 3000)
  } catch (err) {
    console.error('Failed to copy:', err)
    
    // Show error notification
    const notification = document.createElement('div')
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50'
    notification.textContent = 'Failed to copy address'
    document.body.appendChild(notification)
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 3000)
  }
}

// Action handlers
const handleMint = async (amount) => {
  try {
    await contractStore.mintTokens(jettonAddress.value, amount)
    await loadJettonDetails() // Reload details
  } catch (err) {
    console.error('Mint failed:', err)
  }
}

const handleUpdateMetadata = async (metadata) => {
  try {
    await contractStore.updateMetadata(jettonAddress.value, metadata)
    await loadJettonDetails() // Reload details
  } catch (err) {
    console.error('Update metadata failed:', err)
  }
}

const handleRevoke = async () => {
  try {
    await contractStore.revokeOwnership(jettonAddress.value)
    await loadJettonDetails() // Reload details
  } catch (err) {
    console.error('Revoke ownership failed:', err)
  }
}

const handleTransfer = async (toAddress, amount) => {
  try {
    await contractStore.transferTokens(jettonAddress.value, toAddress, amount)
    await loadJettonDetails() // Reload details
  } catch (err) {
    console.error('Transfer failed:', err)
  }
}

const handleBurn = async (amount) => {
  try {
    await contractStore.burnTokens(jettonAddress.value, amount)
    await loadJettonDetails() // Reload details
  } catch (err) {
    console.error('Burn failed:', err)
  }
}

const handleUpdateTransactionFee = async (config) => {
  try {
    // Update the local config
    transactionFeeConfig.value = { ...transactionFeeConfig.value, ...config }
    
    // In a real implementation, you would call the blockchain to update these settings
    // await contractStore.updateTransactionFee(jettonAddress.value, config)
    
    // For now, just show a success message
    const notification = document.createElement('div')
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50'
    notification.textContent = 'Transaction fee configuration updated!'
    document.body.appendChild(notification)
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 3000)
  } catch (err) {
    console.error('Update transaction fee failed:', err)
  }
}

const handleUpdateDeflationary = async (config) => {
  try {
    // Update the local config
    deflationaryConfig.value = { ...deflationaryConfig.value, ...config }
    
    // In a real implementation, you would call the blockchain to update these settings
    // await contractStore.updateDeflationaryConfig(jettonAddress.value, config)
    
    // For now, just show a success message
    const notification = document.createElement('div')
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50'
    notification.textContent = 'Deflationary mechanism updated!'
    document.body.appendChild(notification)
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 3000)
  } catch (err) {
    console.error('Update deflationary config failed:', err)
  }
}

// Lifecycle
onMounted(() => {
  loadJettonDetails()
})

// Watch for wallet connection changes
watch(() => walletStore.isConnected, () => {
  if (walletStore.isConnected) {
    loadJettonDetails()
  }
})
</script> 