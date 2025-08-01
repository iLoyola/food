<script setup lang="ts">
import { onMounted } from 'vue'

// uncomment to import data to db
// import database from '../firebase/firebase'

// stores
import { useRecipesStore } from '../stores/recipes.js'
import { useItemsStore } from '../stores/items.js'
import { useMarketplacesStore } from '../stores/marketplaces.js'

const recipesStore = useRecipesStore()
const itemsStore = useItemsStore()
const marketplacesStore = useMarketplacesStore()

onMounted(async () => {
    // uncomment to import data to db
    // database
    await recipesStore.fetchRecipes()
    await itemsStore.fetchItems()
    await marketplacesStore.fetchMarketplaces()
})

</script>

<template>
    <div>

        <main>
            <div class="container mx-auto px-10 content">
                <router-view></router-view>
            </div>
        </main>
    </div>
</template>
