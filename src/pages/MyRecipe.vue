<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRecipesStore } from '../stores/recipes.js'
import { useRoute } from 'vue-router'

const recipesStore = useRecipesStore()
const route = useRoute()

const emptyRecipe = {
    alias: '', name: '', id: '', description: '', tags: [],
    ingredients: [{ quantity: 0, volume: '', ingredient: '', process: '', extra: '' }],
    steps: [{ step: '', stepImages: [], instruction: '' }],
    primaryImages: [], isEnabled: false, titlePosition: ''
}

onMounted(() => {
    recipesStore.recipe = recipesStore.recipesWithImages.find(
        ({ alias }) => alias === route.params.alias
    ) ?? emptyRecipe
    if (recipesStore.recipe.name) {
        document.title = `${recipesStore.recipe.name} | iLoyola`
    }
})

onUnmounted(() => {
    recipesStore.recipe = emptyRecipe
    document.title = 'iLoyola'
})

const recipe = computed(() => recipesStore.recipe)

function formatAmount(quantity: number, volume: string): string {
    if (!quantity && !volume) return ''
    if (!quantity) return volume
    if (!volume) return String(quantity)
    return `${quantity} ${volume}`
}
</script>

<template>
    <div v-if="recipe.alias" class="max-w-2xl mx-auto px-4 pt-4 pb-12">

        <!-- Hero image -->
        <div class="relative aspect-[16/9] rounded-2xl overflow-hidden border-2 border-firefly-600 dark:border-white shadow-md mb-6">
            <img
                class="w-full h-full object-cover"
                loading="lazy"
                :src="recipe.primaryImages[0]"
                :alt="recipe.name"
            />
            <div class="absolute bottom-3 left-3 bg-firefly-700 bg-opacity-80 border border-firefly-600 rounded-xl px-3 py-2 backdrop-blur-sm max-w-[calc(100%-1.5rem)]">
                <span class="text-xl font-bold tracking-tight text-white capitalize break-words">{{ recipe.name }}</span>
            </div>
        </div>

        <!-- Title -->
        <h1 class="text-3xl text-gray-900 dark:text-white capitalize mb-3">
            {{ recipe.name }}
        </h1>

        <!-- Tags -->
        <div v-if="recipe.tags.length" class="flex flex-wrap gap-2 mb-5">
            <span
                v-for="tag in recipe.tags"
                :key="tag"
                class="px-3 py-1 rounded-full text-xs font-medium bg-firefly-50 dark:bg-firefly-900 text-firefly-700 dark:text-firefly-300 border border-firefly-200 dark:border-firefly-700"
            >
                {{ tag }}
            </span>
        </div>

        <!-- Description -->
        <p v-if="recipe.description" class="text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
            {{ recipe.description }}
        </p>

        <!-- Ingredients -->
        <section class="mb-8">
            <h2 class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                Ingredients
            </h2>
            <div class="bg-white dark:bg-firefly-900 rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-firefly-800">
                <div
                    v-for="ing in recipe.ingredients"
                    :key="ing.ingredient"
                    class="flex items-start gap-4 px-4 py-3"
                >
                    <!-- Amount column -->
                    <span class="shrink-0 w-20 text-right text-sm font-semibold text-firefly-600 dark:text-firefly-400 pt-0.5">
                        {{ formatAmount(ing.quantity, ing.volume) }}
                    </span>
                    <!-- Ingredient + notes -->
                    <div class="flex-1 min-w-0">
                        <p class="text-gray-900 dark:text-white font-medium">{{ ing.ingredient }}</p>
                        <p
                            v-if="ing.process || ing.extra"
                            class="text-sm text-gray-400 dark:text-gray-500 mt-0.5"
                        >
                            {{ [ing.process, ing.extra].filter(Boolean).join(' · ') }}
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Steps -->
        <section class="mb-8">
            <h2 class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
                Instructions
            </h2>
            <div class="space-y-5">
                <div
                    v-for="(step, index) in recipe.steps"
                    :key="step.step"
                    class="flex gap-4"
                >
                    <div class="shrink-0 w-8 h-8 rounded-full bg-firefly-500 flex items-center justify-center text-white text-sm font-bold mt-0.5">
                        {{ index + 1 }}
                    </div>
                    <p class="flex-1 text-gray-700 dark:text-gray-200 leading-relaxed pt-1">
                        {{ step.instruction }}
                    </p>
                </div>
            </div>
        </section>

        <!-- Notes -->
        <div
            v-if="recipe.notes"
            class="mb-6 bg-damask-100 dark:bg-firefly-900 border border-damask-200 dark:border-firefly-700 rounded-2xl px-4 py-4"
        >
            <p class="text-xs font-semibold text-damask-700 dark:text-damask-400 uppercase tracking-widest mb-2">
                Notes
            </p>
            <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{{ recipe.notes }}</p>
        </div>

        <!-- Reference & bound recipes -->
        <div
            v-if="recipe.reference || recipe.boundRecipes?.length"
            class="text-sm text-gray-400 dark:text-gray-500 space-y-2"
        >
            <p v-if="recipe.reference">
                Source:
                <a
                    :href="recipe.reference"
                    target="_blank"
                    rel="noopener"
                    class="text-firefly-500 underline underline-offset-2"
                >
                    {{ recipe.reference }}
                </a>
            </p>
            <div v-if="recipe.boundRecipes?.length">
                <p class="mb-1 font-medium">See also:</p>
                <a
                    v-for="br in recipe.boundRecipes"
                    :key="br.name"
                    :href="br.url"
                    class="block text-firefly-500 underline underline-offset-2"
                >
                    {{ br.name }}
                </a>
            </div>
        </div>

    </div>

    <div v-else class="max-w-2xl mx-auto px-4 pt-16 text-center text-gray-400 dark:text-gray-500 text-sm">
        Recipe not found.
    </div>
</template>
