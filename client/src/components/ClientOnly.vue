<template>
  <div v-if="mounted">
    <slot />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'ClientOnly',
  setup() {
    const mounted = ref(false)
    
    onMounted(() => {
      mounted.value = true
    })
    
    return {
      mounted
    }
  }
}
</script> 