<template>
    <header class="sticky top-0 z-40 bg-white dark:bg-firefly-950 border-b border-gray-100 dark:border-firefly-900">
        <div class="flex items-center justify-between h-14 px-4 max-w-3xl mx-auto">
            <button @click="goHome" type="button" class="flex items-center">
                <img
                    src="@/assets/svg/iloyola-logo-light-w300.svg"
                    alt="iLoyola"
                    class="h-7 dark:hidden"
                />
                <img
                    src="@/assets/svg/iloyola-logo-dark-nobg.svg"
                    alt="iLoyola"
                    class="h-7 hidden dark:block"
                />
            </button>
            <mode-toggle />
        </div>
    </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import ModeToggle from './ModeToggle.vue'

const router = useRouter()

function goHome() {
    router.push({ name: 'shopping' })
}
</script>
