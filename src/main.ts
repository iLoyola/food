import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './routes/router.js'

import App from '@/App.vue'
import '@/assets/styles/style.css'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia).use(router)
app.mount('#app')
