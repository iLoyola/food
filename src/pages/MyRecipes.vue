<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useRecipesStore } from '../stores/recipes.js'
import { RecipeModel } from '../model/recipe.model'
import ImageSkeleton from '../components/ImageSkeleton.vue'

const router = useRouter()
const recipesStore = useRecipesStore()

const recipes: RecipeModel[] = recipesStore.recipesWithImages

function loadRecipe(alias: string) {
    router.push({ name: 'recipe', params: { alias } })
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
    <div class="max-w-5xl mx-auto px-4 pt-4 pb-6">

        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Recipes</h1>

        <!-- Loading skeleton -->
        <div v-if="recipesStore.isRequestPending" class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div
                v-for="n in 6"
                :key="n"
                class="relative aspect-[16/9] rounded-2xl overflow-hidden border-2 border-firefly-100 dark:border-firefly-800"
            >
                <image-skeleton class="w-full h-full" />
            </div>
        </div>

        <div
            v-else-if="recipes.length === 0"
            class="rounded-2xl bg-white dark:bg-firefly-900 px-4 py-10 text-center text-sm text-gray-400 dark:text-gray-500"
        >
            No recipes yet.
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <section
                v-for="recipe in recipes"
                :key="recipe.alias"
                class="relative aspect-[16/9] rounded-2xl overflow-hidden border-2 border-firefly-600 dark:border-white shadow-md"
            >
                <button
                    type="button"
                    @click="loadRecipe(recipe.alias)"
                    class="absolute inset-0 w-full h-full"
                >
                    <img
                        v-if="recipe.primaryImages[2]"
                        loading="lazy"
                        :src="recipe.primaryImages[2]"
                        :srcset="`${recipe.primaryImages[3]} 400w, ${recipe.primaryImages[2]} 704w`"
                        sizes="(max-width: 767px) 100vw, 33vw"
                        :alt="recipe.name"
                        class="w-full h-full object-cover"
                    />
                    <image-skeleton v-else class="w-full h-full" />
                </button>

                <div
                    class="absolute bg-firefly-700 bg-opacity-80 border border-firefly-600 rounded-xl px-3 py-2 backdrop-blur-sm pointer-events-none"
                    :class="titlePositioning(recipe.titlePosition)"
                >
                    <span class="font-bold tracking-tight text-white capitalize break-words card-title-responsive-sizing">
                        {{ recipe.name }}
                    </span>
                </div>
            </section>
        </div>

    </div>
</template>

<style scoped>
.card-title-responsive-sizing {
    font-size: 1.1rem;
}

@media screen and (min-width: 502px) {
    .card-title-responsive-sizing {
        font-size: 1.3rem;
    }
}

@media screen and (min-width: 768px) {
    .card-title-responsive-sizing {
        font-size: 0.875rem;
    }
}

@media screen and (min-width: 1024px) {
    .card-title-responsive-sizing {
        font-size: 1rem;
    }
}

@media screen and (min-width: 1280px) {
    .card-title-responsive-sizing {
        font-size: 1.1rem;
    }
}
</style>
