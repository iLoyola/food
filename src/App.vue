<script setup lang="ts">
import { ref, defineAsyncComponent, onErrorCaptured } from 'vue'

// components
import Loader from "./components/LoadingSvg.vue"
import Header from "./components/Header.vue"

const AsyncHome = defineAsyncComponent(() =>
    import('./components/AsyncHome.vue')
)

const errMsg = ref<string>('')

onErrorCaptured(e => {
    errMsg.value = 'Oops!, ' + e
    return true
})

</script>

<template>
    <Header />
    <div v-if="errMsg">{{ errMsg }}</div>
    <Suspense v-else>
        <template #default>
            <AsyncHome />
        </template>
        <template #fallback>
            <Loader />
        </template>
    </Suspense>
</template>
