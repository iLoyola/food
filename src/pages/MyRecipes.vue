<script setup lang="ts">
// router
import { useRouter } from 'vue-router';

// stores
import { useRecipesStore } from '../stores/recipes.js'
import { RecipeModel } from '../model/recipe.model'

// components
import ImageSkeleton from '../components/ImageSkeleton.vue'

const router = useRouter()
const recipesStore = useRecipesStore()

const recipes: RecipeModel[] = recipesStore.recipes

function loadRecipe(alias: string) {
    router.push({name: 'recipe', params: {alias: alias}})
}

function titlePositioning(tp: string) {
    return {
        'card-title-tl': tp === 'tl',
        'card-title-tr': tp === 'tr',
        'card-title-bl': tp === 'bl',
        'card-title-br': tp === 'br',
    }
}
</script>

<template>
    <div class="heading w-full border-black border-b border-solid mb-1">
        <h1 class="text-3xl font-bold text-black m-4">My Recipes</h1>
    </div>
    <div class="flex flex-wrap justify-center md:justify-between">
        <section v-for="recipe in recipes"
            class="w-[100%] md:w-[31%] flex justify-center items-center bg-white border border-firefly-600 rounded-lg card-shadow dark:border-gray-700 m-2 relative aspect-[16/9]">
            <button type="button" @click="loadRecipe(recipe.alias)" class="w-full">
                <img
                    v-if="recipe.primaryImages[2]"
                    loading="lazy"
                    :src="recipe.primaryImages[2]"
                    :srcset="`${recipe.primaryImages[3]} 400w,
                    ${recipe.primaryImages[2]} 704w`"
                    sizes="((min-width: 499px && max-width: 767px) && (min-width: 1536px)) 400px, 704px"
                    :alt="recipe.name"
                    class="rounded-lg"
                />
                <image-skeleton v-else />
            </button>

            <div class="absolute bg-firefly-700 bg-opacity-80 border border-firefly-600 rounded-lg p-4 backdrop-filter backdrop-blur-sm pointer-events-none"
                :class="titlePositioning(recipe.titlePosition)">
                <span class="font-bold tracking-tight text-white capitalize" style="font-size: 2.4vw;">{{ recipe.name }}</span>
            </div>
        </section>
    </div>

</template>

