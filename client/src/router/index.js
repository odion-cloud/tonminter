import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import JettonManagement from '@/pages/JettonManagement.vue'
import MyTokens from '@/pages/MyTokens.vue'
import NotFound from '@/pages/NotFound.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/jetton/:address',
    name: 'JettonManagement',
    component: JettonManagement
  },
  {
    path: '/my-tokens',
    name: 'MyTokens',
    component: MyTokens
  },
  {
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 