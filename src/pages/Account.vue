<template>
    <div class="max-w-3xl mx-auto px-4 pt-6">
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Account</h1>

        <div class="bg-white dark:bg-firefly-900 rounded-2xl divide-y divide-gray-100 dark:divide-firefly-800">
            <div class="px-4 py-4 flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-firefly-100 dark:bg-firefly-800 flex items-center justify-center">
                    <svg class="w-5 h-5 text-firefly-600 dark:text-firefly-300" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">{{ authStore.user?.email }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Signed in</p>
                </div>
            </div>
        </div>

        <div class="mt-6">
            <button
                @click="signOut"
                type="button"
                class="w-full py-3 rounded-2xl bg-gray-100 dark:bg-firefly-900 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-200 dark:hover:bg-firefly-800 transition-colors"
            >
                Sign Out
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()

async function signOut() {
    await authStore.signOut()
    router.push({ name: 'register' })
}
</script>
