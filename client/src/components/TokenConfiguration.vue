<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
          <img 
            v-if="form.imageUrl && !imageError" 
            :src="form.imageUrl" 
            alt="Token Logo" 
            class="w-full h-full object-cover"
            @error="handleImageError"
          />
          <svg v-else class="h-8 w-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
            <circle cx="9" cy="9" r="2"/>
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-medium">Mint your token</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">Configure your custom TON token</p>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div class="pt-6 px-6 pb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <!-- Jetton Name -->
            <div>
              <label for="name" class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                Jetton Name
              </label>
              <input
                type="text"
                id="name"
                v-model="form.name"
                @input="updateAndValidate"
                class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Your token name"
              />
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Your project's unabbreviated name with spaces (1-3 words).
              </p>
            </div>
            
            <!-- Jetton Symbol -->
            <div>
              <label for="symbol" class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                Jetton Symbol
              </label>
              <input
                type="text"
                id="symbol"
                v-model="form.symbol"
                @input="updateAndValidate"
                class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="TKNSYM"
              />
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Currency symbol appearing in balance (3-5 uppercase chars).
              </p>
            </div>
            
            <!-- Token Image URL -->
            <div>
              <label for="imageUrl" class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                Token Image URL
              </label>
              <input
                type="text"
                id="imageUrl"
                v-model="form.imageUrl"
                @input="updateAndValidate"
                class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="https://example.com/token-image.png"
              />
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                URL to your token's logo image (PNG or SVG recommended).
              </p>
            </div>
          </div>
          
          <div class="space-y-4">
            <!-- Decimals -->
            <div>
              <label for="decimals" class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                Decimals
              </label>
              <input
                type="number"
                id="decimals"
                v-model.number="form.decimals"
                @input="updateAndValidate"
                class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                min="0"
                max="18"
              />
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                The decimal precision of your token (9 is TON default).
              </p>
            </div>
            
            <!-- Tokens to Mint -->
            <div>
              <label for="totalSupply" class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                Tokens to Mint
              </label>
              <input
                type="number"
                id="totalSupply"
                v-model.number="form.totalSupply"
                @input="updateAndValidate"
                class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                min="1"
              />
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Total supply of 2.1 billion tokens.
              </p>
            </div>
            
            <!-- Initial Token Price -->
            <div>
              <label for="initialPrice" class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                Initial Token Price (USD)
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span class="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="initialPrice"
                  v-model.number="form.initialPrice"
                  @input="updateAndValidate"
                  class="block w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  step="0.000001"
                  min="0"
                />
              </div>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Initial market cap: ${{ marketCap.toLocaleString() }}
              </p>
            </div>
          </div>
        </div>
        
        <!-- Description -->
        <div class="mt-6">
          <label for="description" class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            Description
          </label>
          <textarea
            id="description"
            v-model="form.description"
            @input="updateAndValidate"
            rows="3"
            class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
            placeholder="Optional sentence explaining about your project."
          ></textarea>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            A brief description of your token (optional).
          </p>
        </div>
      </div>
    </div>
    
    <!-- Info Alert -->
    <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <div class="flex">
        <svg class="h-5 w-5 text-blue-400 mr-3 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        <div class="text-blue-700 dark:text-blue-200 text-sm">
          <span>Jetton is the fungible token standard for TON Blockchain. You will need at least 0.25 TON for deployment fees.</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  config: {
    type: Object,
    default: () => ({
      name: '',
      symbol: '',
      decimals: 9,
      totalSupply: 2100000000,
      initialPrice: 0.01,
      imageUrl: '',
      description: ''
    })
  }
})

const emit = defineEmits(['change'])

const form = ref({ ...props.config })
const imageError = ref(false)

const marketCap = computed(() => {
  return (form.value.totalSupply || 0) * (form.value.initialPrice || 0)
})

const handleImageError = () => {
  imageError.value = true
}

const updateAndValidate = () => {
  imageError.value = false // Reset image error when URL changes
  emit('change', { ...form.value })
}

// Watch for config changes from parent
watch(() => props.config, (newConfig) => {
  form.value = { ...newConfig }
}, { deep: true })
</script>

<style scoped>
.token-configuration {
  max-width: 100%;
}

.form-control:focus,
.form-select:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.token-logo img {
  border: 2px solid #e9ecef;
  transition: border-color 0.2s ease-in-out;
}

.token-logo img:hover {
  border-color: #007bff;
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
</style> 