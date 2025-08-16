<template>
  <div class="space-y-6">
    <div>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white">Transaction Fee Configuration</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Define the transaction fee and its distribution</p>
    </div>
    
    <div class="md:grid md:grid-cols-2 md:gap-6">
      <!-- Left Column -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6 md:mb-0">
        <div class="pt-6 px-6 pb-6">
          <div v-if="form.distributionType !== 'none'" class="mb-4">
            <label for="feePercentage" class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Transaction Fee Percentage
            </label>
            <div class="relative">
              <input
                type="number"
                id="feePercentage"
                v-model.number="form.feePercentage"
                @input="updateAndValidate"
                class="block w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                step="0.1"
                min="0"
                max="100"
              />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span class="text-gray-500 sm:text-sm">%</span>
              </div>
            </div>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Applied to every token transfer
            </p>
          </div>
          <div v-else class="mb-4">
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Transaction fees are disabled. No fees will be applied to token transfers.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Right Column -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div class="pt-6 px-6 pb-6">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Fee Distribution
            </label>
            <div class="mt-2 space-y-4">
              <div class="flex items-center">
                <input
                  id="fee-none"
                  v-model="form.distributionType"
                  value="none"
                  @change="updateAndValidate"
                  type="radio"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                />
                <label for="fee-none" class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                  None (No Transaction Fees)
                </label>
              </div>
              <div class="flex items-center">
                <input
                  id="fee-default"
                  v-model="form.distributionType"
                  value="default"
                  @change="updateAndValidate"
                  type="radio"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                />
                <label for="fee-default" class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                  50% Buyback & Burn / 50% Treasury
                </label>
              </div>
              <div class="flex items-center">
                <input
                  id="fee-custom"
                  v-model="form.distributionType"
                  value="custom"
                  @change="updateAndValidate"
                  type="radio"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                />
                <label for="fee-custom" class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                  Custom Distribution
                </label>
              </div>
            </div>
          </div>
          
          <!-- Custom Distribution Fields -->
          <div v-if="form.distributionType === 'custom'" class="grid grid-cols-2 gap-4">
            <div>
              <label for="buybackPercentage" class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                Buyback & Burn %
              </label>
              <input
                type="number"
                id="buybackPercentage"
                v-model.number="form.buybackPercentage"
                @input="handleBuybackChange"
                class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                min="0"
                max="100"
              />
            </div>
            
            <div>
              <label for="treasuryPercentage" class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                Treasury %
              </label>
              <input
                type="number"
                id="treasuryPercentage"
                v-model.number="form.treasuryPercentage"
                @input="handleTreasuryChange"
                class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  config: {
    type: Object,
    default: () => ({
      feePercentage: 2,
      distributionType: 'default',
      buybackPercentage: 50,
      treasuryPercentage: 50
    })
  }
})

const emit = defineEmits(['change'])

const form = ref({ ...props.config })

const updateAndValidate = () => {
  // When distribution type is "default", set fixed percentages
  if (form.value.distributionType === 'default') {
    form.value.buybackPercentage = 50
    form.value.treasuryPercentage = 50
  }
  emit('change', { ...form.value })
}

const handleBuybackChange = () => {
  const buybackPct = Number(form.value.buybackPercentage) || 0
  form.value.treasuryPercentage = 100 - buybackPct
  updateAndValidate()
}

const handleTreasuryChange = () => {
  const treasuryPct = Number(form.value.treasuryPercentage) || 0
  form.value.buybackPercentage = 100 - treasuryPct
  updateAndValidate()
}

// Watch for config changes from parent
watch(() => props.config, (newConfig) => {
  form.value = { ...newConfig }
}, { deep: true })
</script>

<style scoped>
.transaction-fee-settings {
  max-width: 100%;
}

.form-control:focus,
.form-select:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
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

.input-group-text {
  background-color: #f8f9fa;
  border-color: #ced4da;
  color: #6c757d;
}

.progress {
  border-radius: 10px;
}

.table {
  font-size: 0.9rem;
}

.table th {
  border-top: none;
  font-weight: 600;
  color: #495057;
}
</style> 