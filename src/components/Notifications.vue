<script setup lang="ts">
import { useToastStore } from '../stores/toast.js'

const toast = useToastStore()
</script>

<template>
    <Teleport to="body">
        <div class="fixed bottom-20 inset-x-0 z-[100] px-4 flex flex-col gap-2 max-w-sm mx-auto pointer-events-none">
            <TransitionGroup
                enter-active-class="transition duration-300 ease-out"
                enter-from-class="opacity-0 translate-y-3"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition duration-200 ease-in absolute w-full"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
            >
                <div
                    v-for="t in toast.toasts"
                    :key="t.id"
                    class="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg pointer-events-auto"
                    :class="{
                        'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200': t.type === 'success',
                        'bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200': t.type === 'error',
                        'bg-firefly-50 text-firefly-800 dark:bg-firefly-950 dark:text-firefly-200': t.type === 'info',
                        'bg-damask-100 text-damask-800 dark:bg-damask-900 dark:text-damask-300': t.type === 'warning',
                    }"
                    role="alert"
                    aria-live="assertive"
                    aria-atomic="true"
                >
                    <svg v-if="t.type === 'success'" aria-hidden="true" class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <svg v-else-if="t.type === 'error'" aria-hidden="true" class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    <svg v-else-if="t.type === 'warning'" aria-hidden="true" class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    <svg v-else aria-hidden="true" class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>

                    <span class="flex-1 text-sm font-medium">{{ t.message }}</span>

                    <button
                        @click="toast.dismiss(t.id)"
                        class="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                        aria-label="Dismiss"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </TransitionGroup>
        </div>
    </Teleport>
</template>
