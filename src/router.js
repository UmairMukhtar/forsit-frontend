import { createMemoryHistory, createRouter } from 'vue-router'

import Dashboard from './views/Dashboard.vue'
import Products from './views/Products.vue'

const routes = [
  { path: '/', component: Dashboard },
  { path: '/products', component: Products },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

export default router