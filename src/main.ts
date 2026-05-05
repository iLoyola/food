import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './routes/router.js'

import App from '@/App.vue'
import '@/assets/styles/style.css'

import { firebaseConfig } from './firebase/firebaseConfig.js'

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Initialize Firebase
initializeApp(firebaseConfig);

const pinia = createPinia()
const app = createApp(App)

app.use(router).use(pinia)
app.mount('#app')
