<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRecipesStore } from '../stores/recipes.js'
import ImageSkeleton from '../components/ImageSkeleton.vue'

const router = useRouter()
const recipesStore = useRecipesStore()

const search = ref('')
const selectedTag = ref<string | null>(null)

const allTags = computed(() => {
    const tags = new Set<string>()
    recipesStore.recipesWithImages.forEach(r => r.tags?.forEach((t: string) => tags.add(t)))
    return [...tags].sort()
})

const filteredRecipes = computed(() => {
    let result = recipesStore.recipesWithImages
    if (selectedTag.value) {
        result = result.filter(r => r.tags?.includes(selectedTag.value!))
    }
    if (search.value.trim()) {
        const q = search.value.trim().toLowerCase()
        result = result.filter(r =>
            r.name.toLowerCase().includes(q) ||
            r.tags?.some((t: string) => t.toLowerCase().includes(q))
        )
    }
    return result
})

function selectTag(tag: string | null) {
    selectedTag.value = selectedTag.value === tag ? null : tag
}

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

        <template v-else>

            <!-- Search -->
            <div class="relative mb-3">
                <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <input
                    v-model="search"
                    type="search"
                    placeholder="Search recipes…"
                    class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-firefly-700 bg-white dark:bg-firefly-900 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-firefly-400"
                />
            </div>

            <!-- Tag filter pills -->
            <div v-if="allTags.length > 0" class="flex flex-wrap gap-2 mb-4">
                <button
                    @click="selectTag(null)"
                    :class="selectedTag === null
                        ? 'bg-firefly-500 text-white border-firefly-500'
                        : 'bg-white dark:bg-firefly-900 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-firefly-700'"
                    class="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
                >
                    All
                </button>
                <button
                    v-for="tag in allTags"
                    :key="tag"
                    @click="selectTag(tag)"
                    :class="selectedTag === tag
                        ? 'bg-firefly-500 text-white border-firefly-500'
                        : 'bg-white dark:bg-firefly-900 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-firefly-700'"
                    class="px-3 py-1 rounded-full text-xs font-medium border transition-colors capitalize"
                >
                    {{ tag }}
                </button>
            </div>

            <!-- No results -->
            <div
                v-if="filteredRecipes.length === 0"
                class="flex flex-col items-center justify-center min-h-[40vh] text-center px-4"
            >
                <svg class="w-10 h-10 text-gray-300 dark:text-firefly-800 mb-3" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">No recipes found</p>
                <p class="text-xs text-gray-400 dark:text-gray-500">
                    Try a different search or
                    <button @click="search = ''; selectedTag = null" class="text-firefly-500 underline underline-offset-2">clear filters</button>
                </p>
            </div>

            <!-- Recipe grid -->
            <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <section
                    v-for="recipe in filteredRecipes"
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

        </template>

    </div>
</template>

<style scoped>
.card-title-responsive-sizing {
    font-size: 1.1rem;
}
@media screen and (min-width: 502px) {
    .card-title-responsive-sizing { font-size: 1.3rem; }
}
@media screen and (min-width: 768px) {
    .card-title-responsive-sizing { font-size: 0.875rem; }
}
@media screen and (min-width: 1024px) {
    .card-title-responsive-sizing { font-size: 1rem; }
}
@media screen and (min-width: 1280px) {
    .card-title-responsive-sizing { font-size: 1.1rem; }
}
</style>
