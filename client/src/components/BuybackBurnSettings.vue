<template>
  <div class="space-y-6">
    <div>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white">Deflationary Mechanism</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Configure the automatic buyback and burn functionality to make your token deflationary
      </p>
    </div>
    
    <div class="md:grid md:grid-cols-2 md:gap-6">
      <!-- Left Column -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6 md:mb-0">
        <div class="pt-6 px-6 pb-6">
          <div class="mb-4">
            <label for="triggerType" class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Buyback Trigger
            </label>
            <select
              id="triggerType"
              v-model="form.triggerType"
              @change="updateAndValidate"
              class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="threshold">Threshold Based</option>
              <option value="time">Time-Based (Periodic)</option>
              <option value="hybrid">Hybrid (Both)</option>
            </select>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              How should the buyback mechanism be triggered
            </p>
          </div>
          
          <div>
            <label for="thresholdAmount" class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Threshold Amount
            </label>
            <div class="relative">
              <input
                type="number"
                id="thresholdAmount"
                v-model.number="form.thresholdAmount"
                @input="updateAndValidate"
                class="block w-full px-3 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                min="1"
              />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span class="text-gray-500 sm:text-sm">{{ tokenSymbol }}</span>
              </div>
            </div>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Amount of {{ tokenSymbol }} needed to trigger automatic buyback
            </p>
          </div>
        </div>
      </div>
      
      <!-- Right Column -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div class="pt-6 px-6 pb-6">
          <div class="mb-4">
            <label for="timePeriod" class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Time Period
            </label>
            <select
              id="timePeriod"
              v-model="form.timePeriod"
              @change="updateAndValidate"
              class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              How often should buybacks run on a schedule
            </p>
          </div>
          
          <div>
            <label for="maxBuybackPerTx" class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Maximum Buyback Per Transaction
            </label>
            <div class="relative">
              <input
                type="number"
                id="maxBuybackPerTx"
                v-model.number="form.maxBuybackPerTx"
                @input="updateAndValidate"
                class="block w-full px-3 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                min="1"
              />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span class="text-gray-500 sm:text-sm">{{ tokenSymbol }}</span>
              </div>
            </div>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Maximum number of {{ tokenSymbol }} that can be bought back in one transaction
            </p>
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
      triggerType: 'threshold',
      thresholdAmount: 10000,
      timePeriod: 'weekly',
      maxBuybackPerTx: 5000
    })
  },
  tokenSymbol: {
    type: String,
    default: 'TON'
  }
})

const emit = defineEmits(['change'])

const form = ref({ ...props.config })

const updateAndValidate = () => {
  emit('change', { ...form.value })
}

// Watch for config changes from parent
watch(() => props.config, (newConfig) => {
  form.value = { ...newConfig }
}, { deep: true })
</script>

<style scoped>
.buyback-burn-settings {
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

.timeline {
  position: relative;
  padding-left: 20px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #007bff;
}

.timeline-item {
  position: relative;
  margin-bottom: 1rem;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -20px;
  top: 8px;
  width: 8px;
  height: 8px;
  background: #007bff;
  border-radius: 50%;
}

.timeline-content {
  padding-left: 10px;
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