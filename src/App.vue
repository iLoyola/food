<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

// components
import Loader from "./components/LoadingSvg.vue"
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
            <Loader />
        </template>
    </Suspense>
</template>
