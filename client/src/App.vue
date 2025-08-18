
<template>
  <div id="app" class="bg-gray-50 font-sans text-gray-900 dark:bg-slate-900 dark:text-gray-100 min-h-screen">
    <Header />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex flex-col lg:flex-row gap-6">
        <Sidebar :activeNetwork="activeNetwork" @networkChange="setActiveNetwork" />

        <div class="flex-1">
          <router-view :activeNetwork="activeNetwork" @networkChange="setActiveNetwork" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'

const activeNetwork = ref('testnet')

const setActiveNetwork = (network) => {
  activeNetwork.value = network
  console.log(`Network changed to: ${network}`)
}
</script>

<style>
#app {
  min-height: 100vh;
}
</style>
