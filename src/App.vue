<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const AsyncHome = defineAsyncComponent(() =>
    import('./components/AsyncHome.vue')
)
</script>

<template>
    <Suspense>
        <template #default>
            <AsyncHome />
        </template>
        <template #fallback>
            Loading...
        </template>
    </Suspense>
</template>
