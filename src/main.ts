import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './routes/router.js'

import App from '@/App.vue'
import '@/assets/styles/style.css'
import { isNetworkError } from './net/network-error.js'
import { useConnectionStore } from './stores/connection.js'
import { useToastStore } from './stores/toast.js'

const pinia = createPinia()
const app = createApp(App)

app.use(router).use(pinia)

const connection = useConnectionStore(pinia)

// Last-resort net for anything that slips past a store's try/catch — most
// importantly gotrue-js's token-refresh retry loop, whose rejections are
// otherwise unhandled and just flood the console when the backend is down.
window.addEventListener('unhandledrejection', (event) => {
    if (isNetworkError(event.reason)) {
        connection.reportOffline()
        event.preventDefault()
    }
})

// Errors thrown during render / in lifecycle hooks / watchers.
app.config.errorHandler = (err, _instance, info) => {
    console.error(err, info)
    if (isNetworkError(err)) {
        connection.reportOffline()
    } else {
        useToastStore(pinia).show('Something went wrong. Please refresh and try again.', 'error')
    }
}

app.mount('#app')
