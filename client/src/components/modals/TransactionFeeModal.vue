<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Transaction Fee Configuration</h2>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Fee Percentage -->
          <div v-if="form.distributionType !== 'none'">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Transaction Fee Percentage
            </label>
            <div class="relative">
              <input
                v-model.number="form.feePercentage"
                type="number"
                min="0"
                max="10"
                step="0.1"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                placeholder="2"
              />
              <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                <span class="text-gray-500 dark:text-gray-400 text-sm">%</span>
              </div>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Applied to every token transfer
            </p>
          </div>
          <div v-else>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Transaction fees are disabled. No fees will be applied to token transfers.
              </p>
            </div>
          </div>

          <!-- Fee Distribution -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fee Distribution
            </label>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Buyback & Burn</label>
                <div class="relative">
                  <input
                    v-model.number="form.buybackPercentage"
                    type="number"
                    min="0"
                    max="100"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                    placeholder="50"
                  />
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span class="text-gray-500 dark:text-gray-400 text-sm">%</span>
                  </div>
                </div>
              </div>
              <div>
                <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Treasury</label>
                <div class="relative">
                  <input
                    v-model.number="form.treasuryPercentage"
                    type="number"
                    min="0"
                    max="100"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                    placeholder="50"
                  />
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span class="text-gray-500 dark:text-gray-400 text-sm">%</span>
                  </div>
                </div>
              </div>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Total must equal 100%
            </p>
          </div>

          <!-- Distribution Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Distribution Type
            </label>
            <select
              v-model="form.distributionType"
              @change="updateAndValidate"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
            >
              <option value="none">None (No Transaction Fees)</option>
              <option value="default">Default (50/50)</option>
              <option value="custom">Custom Distribution</option>
              <option value="buyback_only">Buyback Only</option>
              <option value="treasury_only">Treasury Only</option>
            </select>
          </div>

          <!-- Buttons -->
          <div class="flex space-x-3 pt-4">
            <button
              type="button"
              @click="$emit('close')"
              class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              Update Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  currentConfig: {
    type: Object,
    default: () => ({
      feePercentage: 2,
      buybackPercentage: 50,
      treasuryPercentage: 50,
      distributionType: 'default'
    })
  }
})

const emit = defineEmits(['close', 'update'])

const form = ref({
  feePercentage: 2,
  buybackPercentage: 50,
  treasuryPercentage: 50,
  distributionType: 'default'
})

onMounted(() => {
  // Initialize form with current config
  form.value = { ...props.currentConfig }
})

const updateAndValidate = () => {
  // When distribution type is "none", set fee percentage to 0
  if (form.value.distributionType === 'none') {
    form.value.feePercentage = 0
    form.value.buybackPercentage = 0
    form.value.treasuryPercentage = 0
  } else if (form.value.distributionType === 'default') {
    form.value.buybackPercentage = 50
    form.value.treasuryPercentage = 50
  }
}

const handleSubmit = () => {
  // Skip validation if distribution type is "none"
  if (form.value.distributionType !== 'none') {
    // Validate that percentages add up to 100
    if (form.value.buybackPercentage + form.value.treasuryPercentage !== 100) {
      alert('Buyback and Treasury percentages must add up to 100%')
      return
    }

    // Validate fee percentage
    if (form.value.feePercentage < 0 || form.value.feePercentage > 10) {
      alert('Fee percentage must be between 0% and 10%')
      return
    }
  }

  emit('update', form.value)
  emit('close')
}
</script> 