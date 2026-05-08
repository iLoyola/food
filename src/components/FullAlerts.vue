<script setup lang="ts">
defineProps<{
    type: 'success' | 'error' | 'info' | 'warning'
    message: string
}>()
</script>

<template>
    <div
        v-if="message"
        class="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm"
        :class="{
            'bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300': type === 'success',
            'bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300': type === 'error',
            'bg-firefly-50 text-firefly-700 dark:bg-firefly-950 dark:text-firefly-300': type === 'info',
            'bg-damask-100 text-damask-700 dark:bg-damask-900 dark:text-damask-300': type === 'warning',
        }"
        role="alert"
    >
        <svg v-if="type === 'success'" class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else-if="type === 'error'" class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <svg v-else-if="type === 'warning'" class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <svg v-else class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ message }}</span>
    </div>
</template>
