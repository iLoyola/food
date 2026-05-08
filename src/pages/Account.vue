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

        <!-- Admin -->
        <div class="mt-6 bg-white dark:bg-firefly-900 rounded-2xl divide-y divide-gray-100 dark:divide-firefly-800">
            <div class="px-4 py-3">
                <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Admin</p>
            </div>
            <router-link
                to="/admin/marketplaces"
                class="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-firefly-800 transition-colors"
            >
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-firefly-50 dark:bg-firefly-800 flex items-center justify-center">
                        <svg class="w-4 h-4 text-firefly-600 dark:text-firefly-400" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">Manage Marketplaces</span>
                </div>
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            </router-link>
            <router-link
                to="/admin/recipes"
                class="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-firefly-800 transition-colors"
            >
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-firefly-50 dark:bg-firefly-800 flex items-center justify-center">
                        <svg class="w-4 h-4 text-firefly-600 dark:text-firefly-400" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">Manage Recipes</span>
                </div>
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            </router-link>
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
