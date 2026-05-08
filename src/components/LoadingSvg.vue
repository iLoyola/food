<script setup lang="ts">
defineProps<{ label?: string }>()
</script>

<template>
    <div class="flex items-center justify-center gap-2 text-sm text-gray-400 dark:text-gray-500">
        <svg class="w-5 h-5 animate-spin text-firefly-500" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span v-if="label">{{ label }}</span>
    </div>
</template>
