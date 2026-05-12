<script setup lang="ts">
import Header from './components/Header.vue'
import BottomNav from './components/BottomNav.vue'
import Notifications from './components/Notifications.vue'
import { useAuthStore } from './stores/auth.js'
import { useRecipesStore } from './stores/recipes.js'
import { useItemsStore } from './stores/items.js'
import { useMarketplacesStore } from './stores/marketplaces.js'
import { supabase } from './supabase/client.js'

const authStore = useAuthStore()
authStore.init()

const recipesStore = useRecipesStore()
const itemsStore = useItemsStore()
const marketplacesStore = useMarketplacesStore()

function fetchAllData() {
    Promise.all([
        recipesStore.fetchRecipes(),
        itemsStore.fetchItems(),
        marketplacesStore.fetchMarketplaces(),
    ])
}

// Fetch data whenever a session becomes available — covers both returning users
// (INITIAL_SESSION) and fresh sign-ins (SIGNED_IN) in the same app lifecycle.
supabase.auth.onAuthStateChange((event, session) => {
    if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN') && session) {
        fetchAllData()
    }
})
</script>

<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
        <a
            href="#main-content"
            class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-firefly-600 focus:text-white focus:text-sm focus:font-medium focus:shadow-lg"
        >
            Skip to main content
        </a>
        <Header />
        <main id="main-content" class="flex-1 pb-20">
            <router-view />
        </main>
        <BottomNav v-if="authStore.user" />
        <Notifications />
    </div>
</template>
