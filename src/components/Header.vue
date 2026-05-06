<template>
    <header class="flex flex-col items-center justify-center mb-5">
        <button @click="goHome" type="button" class="h-full bg-firefly-800 w-full text-center leading-none">
            <h1 class="font-bold text-firefly-800 text-white uppercase" style="font-size: 11vw;">iLoyola Creative</h1>
        </button>
        <div class="flex container items-center mx-auto mt-4 px-16 content">
            <bread-crumbs />
            <nav class="h-10 w-full flex justify-end items-center gap-3">
                <template v-if="authStore.user">
                    <span class="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[140px]">
                        {{ authStore.user.email }}
                    </span>
                    <button
                        type="button"
                        @click="signOut"
                        class="w-24 text-white dark:text-white bg-gray-700 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-md p-2.5 dark:bg-gray-700 dark:hover:bg-gray-800 dark:focus:ring-gray-700 dark:border-gray-700"
                    >
                        Sign Out
                    </button>
                </template>
                <template v-else>
                    <button
                        type="button"
                        @click="goLogin"
                        class="w-24 text-white dark:text-white bg-gray-700 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-md p-2.5 dark:bg-gray-700 dark:hover:bg-gray-800 dark:focus:ring-gray-700 dark:border-gray-700"
                    >
                        Sign In
                    </button>
                </template>
                <mode-toggle></mode-toggle>
            </nav>
        </div>
    </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app.js'
import { useAuthStore } from '../stores/auth.js'
import BreadCrumbs from '../components/BreadCrumbs.vue'
import ModeToggle from '../components/ModeToggle.vue'

const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()

function goHome() {
    appStore.atHome = true
    router.push({ name: 'home' })
}

function goLogin() {
    appStore.atHome = false
    router.push({ name: 'register' })
}

async function signOut() {
    await authStore.signOut()
    appStore.atHome = true
    router.push({ name: 'register' })
}
</script>
