<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Deflationary Mechanism</h2>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Buyback Trigger -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buyback Trigger
            </label>
            <select
              v-model="form.triggerType"
              @change="updateAndValidate"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
            >
              <option value="none">None (No Buyback Mechanism)</option>
              <option value="Threshold Based">Threshold Based</option>
              <option value="Time Based">Time Based</option>
              <option value="Volume Based">Volume Based</option>
              <option value="Price Based">Price Based</option>
            </select>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              How should the buyback mechanism be triggered
            </p>
          </div>

          <!-- Threshold Amount -->
          <div v-if="form.triggerType !== 'none'">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Threshold Amount
            </label>
            <input
              v-model.number="form.thresholdAmount"
              type="number"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
              placeholder="10000"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Amount of tokens needed to trigger automatic buyback
            </p>
          </div>
          <div v-else>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Buyback mechanism is disabled. No automatic buyback will occur.
              </p>
            </div>
          </div>

          <!-- Time Period -->
          <div v-if="form.triggerType !== 'none'">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Period
            </label>
            <select
              v-model="form.timePeriod"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
            </select>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              How often should buybacks run on a schedule
            </p>
          </div>

          <!-- Maximum Buyback Per Transaction -->
          <div v-if="form.triggerType !== 'none'">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Maximum Buyback Per Transaction
            </label>
            <input
              v-model.number="form.maxBuybackPerTx"
              type="number"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
              placeholder="5000"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Maximum number of tokens that can be bought back in one transaction
            </p>
          </div>

          <!-- Additional Settings -->
          <div class="space-y-4">
            <div>
              <label class="flex items-center">
                <input
                  v-model="form.enableAutoBuyback"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Enable Automatic Buyback</span>
              </label>
            </div>
            
            <div>
              <label class="flex items-center">
                <input
                  v-model="form.enableBurnOnBuyback"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Burn Tokens After Buyback</span>
              </label>
            </div>
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
      triggerType: 'Threshold Based',
      thresholdAmount: 10000,
      timePeriod: 'Weekly',
      maxBuybackPerTx: 5000,
      enableAutoBuyback: true,
      enableBurnOnBuyback: true
    })
  }
})

const emit = defineEmits(['close', 'update'])

const form = ref({
  triggerType: 'Threshold Based',
  thresholdAmount: 10000,
  timePeriod: 'Weekly',
  maxBuybackPerTx: 5000,
  enableAutoBuyback: true,
  enableBurnOnBuyback: true
})

onMounted(() => {
  // Initialize form with current config
  form.value = { ...props.currentConfig }
})

const updateAndValidate = () => {
  // When trigger type is "none", set all values to 0
  if (form.value.triggerType === 'none') {
    form.value.thresholdAmount = 0
    form.value.maxBuybackPerTx = 0
    form.value.enableAutoBuyback = false
    form.value.enableBurnOnBuyback = false
  }
}

const handleSubmit = () => {
  // Skip validation if trigger type is "none"
  if (form.value.triggerType !== 'none') {
    // Validate threshold amount
    if (form.value.thresholdAmount < 0) {
      alert('Threshold amount must be positive')
      return
    }

    // Validate max buyback per transaction
    if (form.value.maxBuybackPerTx < 0) {
      alert('Maximum buyback per transaction must be positive')
      return
    }
  }

  emit('update', form.value)
  emit('close')
}
</script> 