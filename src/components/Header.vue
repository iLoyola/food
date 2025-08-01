<template>
    <header class="flex flex-col items-center justify-center mb-5">
        <button @click="goHome" type="button" class="h-full bg-firefly-800 w-full text-center leading-none">
            <h1 class="font-bold text-firefly-800 text-white uppercase" style="font-size: 11vw;">iLoyola Creative</h1>
        </button>
        <div class="flex container items-center mx-auto mt-4 px-16 content">
            <bread-crumbs />
            <nav class="h-10 w-full flex justify-end items-center">
                <button type="button" class="w-24 text-white dark:text-white bg-gray-700 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-md p-2.5 dark:bg-gray-700 dark:hover:bg-gray-800 dark:focus:ring-gray-700 dark:border-gray-700 mr-3">
                Sign In
                </button>
                <button type="button" @click="login" class="text-gray-500 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5 mr-3">
                    <svg id="icon-user-plus" viewBox="0 0 24 24" class="w-5 h-5" fill="currentColor">
                        <path d="M17 21v-2c0-1.38-0.561-2.632-1.464-3.536s-2.156-1.464-3.536-1.464h-7c-1.38 0-2.632 0.561-3.536 1.464s-1.464 2.156-1.464 3.536v2c0 0.552 0.448 1 1 1s1-0.448 1-1v-2c0-0.829 0.335-1.577 0.879-2.121s1.292-0.879 2.121-0.879h7c0.829 0 1.577 0.335 2.121 0.879s0.879 1.292 0.879 2.121v2c0 0.552 0.448 1 1 1s1-0.448 1-1zM13.5 7c0-1.38-0.561-2.632-1.464-3.536s-2.156-1.464-3.536-1.464-2.632 0.561-3.536 1.464-1.464 2.156-1.464 3.536 0.561 2.632 1.464 3.536 2.156 1.464 3.536 1.464 2.632-0.561 3.536-1.464 1.464-2.156 1.464-3.536zM11.5 7c0 0.829-0.335 1.577-0.879 2.121s-1.292 0.879-2.121 0.879-1.577-0.335-2.121-0.879-0.879-1.292-0.879-2.121 0.335-1.577 0.879-2.121 1.292-0.879 2.121-0.879 1.577 0.335 2.121 0.879 0.879 1.292 0.879 2.121zM23 10h-2v-2c0-0.552-0.448-1-1-1s-1 0.448-1 1v2h-2c-0.552 0-1 0.448-1 1s0.448 1 1 1h2v2c0 0.552 0.448 1 1 1s1-0.448 1-1v-2h2c0.552 0 1-0.448 1-1s-0.448-1-1-1z"></path>
                    </svg>
                    <span class="sr-only">Create new user</span>
                </button>
                <mode-toggle></mode-toggle>
            </nav>
        </div>
    </header>

</template>

<script setup lang="ts">
// router
import { useRouter } from 'vue-router'

// stores
import { useAppStore } from '../stores/app.js'

// component
import BreadCrumbs from '../components/BreadCrumbs.vue'
import ModeToggle from '../components/ModeToggle.vue'

const router = useRouter()
const appStore = useAppStore()

function goHome() {
    appStore.atHome = true
    router.push({ name: 'home' })
}

function login() {
    console.log('login')
    appStore.atHome = false
    router.push({ name: 'register' })
}
</script>