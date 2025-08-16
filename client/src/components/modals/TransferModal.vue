<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4">
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Transfer Tokens</h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">To Address</label>
              <input v-model="toAddress" type="text" required class="w-full px-3 py-2 border rounded-md" placeholder="Enter TON address" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount</label>
              <input v-model.number="amount" type="number" min="1" step="1" required class="w-full px-3 py-2 border rounded-md" placeholder="Enter amount" />
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button type="button" @click="$emit('close')" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">
              Cancel
            </button>
            <button type="submit" :disabled="isLoading" class="px-4 py-2 text-sm font-medium text-white bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 rounded-md">
              {{ isLoading ? 'Transferring...' : 'Transfer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['close', 'transfer'])

const toAddress = ref('')
const amount = ref('')
const isLoading = ref(false)

const handleSubmit = async () => {
  if (!toAddress.value || !amount.value || amount.value <= 0) return
  
  try {
    isLoading.value = true
    await emit('transfer', toAddress.value, amount.value)
    emit('close')
  } catch (error) {
    console.error('Transfer failed:', error)
  } finally {
    isLoading.value = false
  }
}
</script> 