<template>
    <nav class="fixed bottom-0 inset-x-0 bg-white dark:bg-firefly-950 border-t border-gray-100 dark:border-firefly-800 z-50">
        <div class="flex h-16 pb-safe">
            <router-link
                to="/shopping"
                class="flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors"
                :class="isActive('/shopping') ? 'text-firefly-500' : 'text-gray-400 dark:text-gray-500'"
            >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Shopping
            </router-link>

            <router-link
                to="/basket"
                class="flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors"
                :class="isActive('/basket') ? 'text-firefly-500' : 'text-gray-400 dark:text-gray-500'"
            >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Gather
            </router-link>

            <router-link
                to="/recipes"
                class="flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors"
                :class="isActive('/recipes') ? 'text-firefly-500' : 'text-gray-400 dark:text-gray-500'"
            >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Recipes
            </router-link>

            <router-link
                to="/account"
                class="flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors"
                :class="isActive('/account') ? 'text-firefly-500' : 'text-gray-400 dark:text-gray-500'"
            >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Account
            </router-link>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

function isActive(path: string): boolean {
    if (path === '/recipes') return route.path.startsWith('/recipes')
    return route.path === path
}
</script>
