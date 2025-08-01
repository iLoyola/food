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

const recipes: RecipeModel[] = recipesStore.recipesWithImages

function loadRecipe(alias: string) {
    router.push({ name: 'recipe', params: { alias: alias } })
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
    <div v-if="recipesStore.recipe.alias === ''" class="heading w-full mb-1">
        <h1 class="text-5xl font-extrabold dark:text-white m-4">My Recipes</h1>
    </div>
    <div v-if="recipesStore.recipe.alias === ''" class="flex flex-wrap justify-center md:justify-between">
        <section v-for="recipe in recipes"
            class="w-[100%] md:w-[31%] flex justify-center items-center bg-white border border-2 border-firefly-600 rounded-lg card-shadow dark:border-white m-2 relative aspect-[16/9]">
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
                <span class="font-bold tracking-tight text-white capitalize break-words card-title-responsive-sizing">{{ recipe.name }}</span>
            </div>
        </section>
    </div>
    <router-view></router-view>
</template>

<style lang="css" scoped>
.card-title-responsive-sizing {
    font-size: 1.4rem;
    @media screen and (min-width: 502px) {
        font-size: 2rem;
    }
    @media screen and (min-width: 768px) {
        font-size: 1rem;
    }
    @media screen and (min-width: 1024px) {
        font-size: 1.4rem;
    }
}
</style>

