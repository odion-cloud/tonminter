<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4">
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Update Metadata</h3>
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
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
              <input v-model="metadata.name" type="text" required class="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Symbol</label>
              <input v-model="metadata.symbol" type="text" required class="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <textarea v-model="metadata.description" rows="3" class="w-full px-3 py-2 border rounded-md"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image URL</label>
              <input v-model="metadata.image" type="url" class="w-full px-3 py-2 border rounded-md" />
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button type="button" @click="$emit('close')" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">
              Cancel
            </button>
            <button type="submit" :disabled="isLoading" class="px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 disabled:bg-gray-300 rounded-md">
              {{ isLoading ? 'Updating...' : 'Update' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['close', 'update'])

const metadata = ref({
  name: '',
  symbol: '',
  description: '',
  image: ''
})

const isLoading = ref(false)

const handleSubmit = async () => {
  try {
    isLoading.value = true
    await emit('update', metadata.value)
    emit('close')
  } catch (error) {
    console.error('Update failed:', error)
  } finally {
    isLoading.value = false
  }
}
</script> 