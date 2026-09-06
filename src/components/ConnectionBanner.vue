<script setup lang="ts">
import { useConnectionStore } from '../stores/connection.js'

const connection = useConnectionStore()

async function retry() {
    await connection.retry()
}
</script>

<template>
    <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-full"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0 -translate-y-full"
    >
        <div
            v-if="connection.status === 'offline'"
            class="sticky top-0 z-50 bg-damask-100 text-damask-800 dark:bg-damask-900 dark:text-damask-200 border-b border-damask-200 dark:border-damask-800"
            role="status"
            aria-live="polite"
        >
            <div class="max-w-3xl mx-auto flex items-center gap-3 px-4 py-2.5">
                <svg aria-hidden="true" class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <p class="flex-1 text-sm font-medium leading-snug">
                    Can’t reach the server. Recipes, your shopping list and sign-in may be unavailable or out of date.
                </p>
                <button
                    type="button"
                    @click="retry"
                    :disabled="connection.checking"
                    class="shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold bg-damask-800 text-white dark:bg-damask-200 dark:text-damask-900 disabled:opacity-60 transition-opacity"
                >
                    {{ connection.checking ? 'Checking…' : 'Retry' }}
                </button>
            </div>
        </div>
    </Transition>
</template>
