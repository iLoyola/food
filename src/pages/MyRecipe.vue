<script setup lang="ts">
// vue
import { onMounted, onUnmounted } from 'vue'

// store
import { useRecipesStore } from '../stores/recipes.js'

// router
import { useRoute } from 'vue-router'

const recipesStore = useRecipesStore()
const route = useRoute()

onMounted(() => {
    recipesStore.recipe = recipesStore.recipesWithImages.find(({ alias }) => alias === route.params.alias) ?? {
        alias: '',
        name: '',
        id: '',
        description: '',
        tags: [],
        ingredients: [
            {
                quantity: 0,
                volume: '',
                ingredient: '',
                process: '',
                extra: ''
            }
        ],
        steps: [
            {
                step: '',
                stepImages: [],
                instruction: ''
            }
        ],
        primaryImages: [],
        isEnabled: false,
        titlePosition: ''
    }
})

onUnmounted(() => {
    recipesStore.recipe = {
        alias: '',
        name: '',
        id: '',
        description: '',
        tags: [],
        ingredients: [
            {
                quantity: 0,
                volume: '',
                ingredient: '',
                process: '',
                extra: ''
            }
        ],
        steps: [
            {
                step: '',
                stepImages: [],
                instruction: ''
            }
        ],
        primaryImages: [],
        isEnabled: false,
        titlePosition: ''
    }
})

function constructedIng(ing:any) {
    return `<strong>${ing.quantity} ${ing.volume} ${ing.ingredient}</strong> <em>${ing.extra ? ing.extra : ''}</em>`
}
</script>

<template>
    <div v-if="Object.getOwnPropertyNames(recipesStore.recipe).length > 0">
        <div class=" flex justify-center items-center bg-white border border-firefly-600 rounded-lg card-shadow dark:border-white mb-2 relative aspect-[16/9]">
            <img
                class="rounded-lg"
                loading="lazy"
                :src="recipesStore.recipe.primaryImages[0]"
                :alt="recipesStore.recipe.name"
            />
            <div
                class="absolute bg-firefly-700 bg-opacity-80 border border-firefly-600 rounded-lg p-4 backdrop-filter backdrop-blur-sm pointer-events-none top-10 left-10">
                <span class="text-3xl font-bold tracking-tight text-white capitalize">{{ recipesStore.recipe.name }}</span>
            </div>
        </div>
        <h3 class="il-recipes-btn rounded-lg p-3 pb-4 pl-5 relative overflow-hidden text-center font-bold text-firefly-800 dark:text-firefly-200 bg-firefly-200 dark:bg-firefly-800 mb-5 uppercase font-extralight">
            <div class="absolute w-1.5 top-0 bottom-0 left-0 bg-firefly-800 dark:bg-firefly-200"></div>
            Tags:
            <span v-for="(tag, index) in recipesStore.recipe.tags">
                {{ tag }}<span v-if="recipesStore.recipe.tags.length !== index + 1">, </span>
            </span>
        </h3>
        <h4 class="text-xl font-extralight dark:text-white">Description</h4>
        <div class="my-2 px-5">
            <p class="dark:text-white">{{ recipesStore.recipe.description }}</p>
        </div>
        <h4 class="text-xl font-extralight dark:text-white">Ingredients</h4>
        <div>
            <ul class="list-disc px-8 pb-1">
                <li v-for="ing in recipesStore.recipe.ingredients" class="my-2 dark:text-white">
                    <div v-html="constructedIng(ing)"></div>
                </li>
            </ul>
        </div>
        <h4 class="text-xl font-extralight dark:text-white">Steps</h4>
        <ol class="list-decimal px-8 pb-1">
            <li v-for="step in recipesStore.recipe.steps" class="my-2 dark:text-white">
                {{ step.instruction }}
            </li>
        </ol>
        <div class="rounded-lg p-3 pb-4 pl-5 relative overflow-hidden text-firefly-800 bg-firefly-200 dark:text-firefly-200 dark:bg-firefly-800 my-10 uppercase font-extralight">
            <div class="absolute w-1.5 top-0 bottom-0 left-0 bg-firefly-800 dark:bg-firefly-200"></div>
            <ul>
                <li v-if="recipesStore.recipe.alias"><span>Alias:</span> {{ recipesStore.recipe.alias }}</li>
                <li v-if="recipesStore.recipe.notes"><span>Notes:</span> {{ recipesStore.recipe.notes }}</li>
                <li v-if="recipesStore.recipe.reference"><span>Reference:</span> {{ recipesStore.recipe.reference }}</li>
                <li v-if="recipesStore.recipe.boundRecipes">
                    <a v-for="br in recipesStore.recipe.boundRecipes" href="br.url">{{ br.name }}</a>
                </li>
            </ul>
        </div>
    </div>

</template>