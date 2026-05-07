<script setup lang="ts">
import { onMounted } from 'vue'
import Header from './components/Header.vue'
import BottomNav from './components/BottomNav.vue'
import { useAuthStore } from './stores/auth.js'
import { useRecipesStore } from './stores/recipes.js'
import { useItemsStore } from './stores/items.js'
import { useMarketplacesStore } from './stores/marketplaces.js'

const authStore = useAuthStore()
authStore.init()

const recipesStore = useRecipesStore()
const itemsStore = useItemsStore()
const marketplacesStore = useMarketplacesStore()

onMounted(async () => {
    await Promise.all([
        recipesStore.fetchRecipes(),
        itemsStore.fetchItems(),
        marketplacesStore.fetchMarketplaces(),
    ])
})
</script>

<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
        <Header />
        <main class="flex-1 pb-20">
            <router-view />
        </main>
        <BottomNav v-if="authStore.user" />
    </div>
</template>
