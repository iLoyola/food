<script setup lang="ts">
// vue
import { ref } from 'vue';

// store
import { useRecipesStore } from '../stores/recipes.js';

// router
import { useRoute } from 'vue-router'

const recipesStore = useRecipesStore()
const route = useRoute()
const recipe = ref(recipesStore.recipes.find(({ alias }) => alias === route.params.alias))

function constructedIng(ing:any) {
    return `<strong>${ing.quantity} ${ing.volume} ${ing.ingredient}</strong> <em>${ing.extra ? ing.extra : ''}</em>`
}
</script>

<template>
    <div v-if="recipe">
        <div class=" flex justify-center items-center bg-white border border-firefly-600 rounded-lg card-shadow dark:border-gray-700 mb-2 relative aspect-[16/9]">
            <img
                class="rounded-lg"
                loading="lazy"
                :src="recipe.primaryImages[0]"
                :alt="recipe.name"
            />
            <div
                class="absolute bg-firefly-700 bg-opacity-80 border border-firefly-600 rounded-lg p-4 backdrop-filter backdrop-blur-sm pointer-events-none top-10 left-10">
                <span class="text-3xl font-bold tracking-tight text-white capitalize">{{ recipe.name }}</span>
            </div>
        </div>
        <h3 class="il-recipes-btn rounded-lg p-3 pb-4 pl-5 relative overflow-hidden text-center font-bold text-firefly-800 bg-firefly-200 mb-5 uppercase font-extralight">
            <div class="absolute w-1.5 top-0 bottom-0 left-0 bg-firefly-800"></div>
            Tags:
            <span v-for="(tag, index) in recipe.tags">
                {{ tag }}<span v-if="recipe.tags.length !== index + 1">, </span>
            </span>
        </h3>
        <h4 class="text-xl font-extralight">Description</h4>
        <div class="my-2 px-5">
            <p>{{ recipe.description }}</p>
        </div>
        <h4 class="text-xl font-extralight">Ingredients</h4>
        <div>
            <ul class="list-disc px-8 pb-1">
                <li v-for="ing in recipe.ingredients" class="my-2">
                    <div v-html="constructedIng(ing)"></div>
                </li>
            </ul>
        </div>
        <h4 class="text-xl font-extralight">Steps</h4>
        <ol class="list-decimal px-8 pb-1">
            <li v-for="step in recipe.steps" class="my-2">
                {{ step.instruction }}
            </li>
        </ol>
        <div class="rounded-lg p-3 pb-4 pl-5 relative overflow-hidden text-firefly-800 bg-firefly-100 my-10">
            <div class="absolute w-1.5 top-0 bottom-0 left-0 bg-firefly-800"></div>
            <ul>
                <li v-if="recipe.alias"><span>Alias:</span> {{ recipe.alias }}</li>
                <li v-if="recipe.notes"><span>Notes:</span> {{ recipe.notes }}</li>
                <li v-if="recipe.reference"><span>Reference:</span> {{ recipe.reference }}</li>
                <li v-if="recipe.boundRecipes">
                    <a v-for="br in recipe.boundRecipes" href="br.url">{{ br.name }}</a>
                </li>
            </ul>
        </div>
    </div>

</template>