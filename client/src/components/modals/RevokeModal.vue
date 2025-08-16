<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4">
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-red-600 dark:text-red-400">Revoke Ownership</h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="mb-6">
          <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div class="flex">
              <svg class="h-5 w-5 text-red-400 mr-3 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <div>
                <h3 class="text-sm font-medium text-red-800 dark:text-red-200">Warning</h3>
                <p class="mt-1 text-sm text-red-700 dark:text-red-300">
                  This action will permanently revoke your admin rights to this token. You will no longer be able to mint tokens or update metadata.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-3">
          <button @click="$emit('close')" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">
            Cancel
          </button>
          <button @click="handleRevoke" :disabled="isLoading" class="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:bg-gray-300 rounded-md">
            {{ isLoading ? 'Revoking...' : 'Revoke Ownership' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['close', 'revoke'])

const isLoading = ref(false)

const handleRevoke = async () => {
  try {
    isLoading.value = true
    await emit('revoke')
    emit('close')
  } catch (error) {
    console.error('Revoke failed:', error)
  } finally {
    isLoading.value = false
  }
}
</script> 