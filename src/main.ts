import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { performanceService } from './services/performance'

import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  performanceService.startMonitoring()
}

app.mount('#app')