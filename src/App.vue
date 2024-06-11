<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

// components
import Header from "./components/Header.vue"

const AsyncHome = defineAsyncComponent(() =>
    import('./components/AsyncHome.vue')
)


</script>

<template>
    <Header />
    <Suspense>
        <template #default>
            <AsyncHome />
        </template>
        <template #fallback>
            Loading...
        </template>
    </Suspense>
</template>
