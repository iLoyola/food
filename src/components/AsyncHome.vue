<script setup lang="ts">
import { onMounted } from 'vue'

// import database from '../firebase/firebase'

// stores
import { useRecipesStore } from '../stores/recipes.js'

const recipesStore = useRecipesStore()

onMounted(async () => {
    // database
    await recipesStore.fetchRecipes()
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
