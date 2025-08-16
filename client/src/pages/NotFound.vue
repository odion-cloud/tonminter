<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-900">
    <Header />
    <div class="flex items-center justify-center" style="min-height: calc(100vh - 64px);">
    <div class="max-w-md mx-auto text-center">
      <div class="mb-8">
        <div class="text-6xl font-bold text-gray-300 dark:text-gray-600 mb-4">404</div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Page Not Found</h1>
        <p class="text-gray-600 dark:text-gray-400 mb-8">
                The page you're looking for doesn't exist or has been moved.
              </p>
      </div>
      
      <div class="space-y-4">
        <button 
          @click="$router.push('/')"
          class="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-medium transition-colors"
        >
          Go to Home
        </button>
        
        <button 
          @click="$router.go(-1)"
          class="w-full bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-md font-medium transition-colors"
        >
                  Go Back
                </button>
              </div>
      
      <div class="mt-8 text-sm text-gray-500 dark:text-gray-400">
        <p>If you believe this is an error, please check the URL and try again.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'

const router = useRouter()

onMounted(() => {
  // Log the attempted route for debugging
  console.warn('404 - Page not found:', router.currentRoute.value.fullPath)
})
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
}

.btn:hover {
  transform: translateY(-1px);
}
</style> 