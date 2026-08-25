<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRecipesStore } from '../stores/recipes.js'
import { useRoute } from 'vue-router'

const recipesStore = useRecipesStore()
const route = useRoute()

// ── Photo upload (add/replace) ───────────────────────────────────────────────
const imageLoaded = ref(true) // optimistic; flips off if the <img> 404s
const imageVersion = ref<number | null>(null) // set after an upload to bust the cache
const uploadingImage = ref(false)

async function onPhotoSelect(e: Event) {
    const input = e.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    uploadingImage.value = true
    try {
        await recipesStore.uploadRecipeImage(recipe.value.alias, file)
        imageLoaded.value = true
        imageVersion.value = Date.now()
    } finally {
        uploadingImage.value = false
    }
}

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

// Same filename every upload (upsert), so the browser/CDN cache needs busting
// right after a fresh upload — but not on a normal page load, to keep the
// image cacheable the rest of the time.
const heroImageSrc = computed(() => {
    const base = recipe.value.primaryImages[0]
    if (!base) return ''
    return imageVersion.value ? `${base}?v=${imageVersion.value}` : base
})

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
        <div class="relative aspect-[16/9] rounded-2xl overflow-hidden border-2 border-firefly-600 dark:border-white shadow-md mb-3 bg-firefly-100 dark:bg-firefly-800">
            <img
                v-show="imageLoaded"
                class="w-full h-full object-cover"
                loading="lazy"
                :src="heroImageSrc"
                :alt="recipe.name"
                @load="imageLoaded = true"
                @error="imageLoaded = false"
            />
            <div class="absolute bottom-3 left-3 bg-firefly-700 bg-opacity-80 border border-firefly-600 rounded-xl px-3 py-2 backdrop-blur-sm max-w-[calc(100%-1.5rem)]">
                <span class="text-xl font-bold tracking-tight text-white capitalize break-words">{{ recipe.name }}</span>
            </div>
        </div>

        <!-- Change/add photo — deliberately its own control, never the image
             itself, so a misclick while cooking can't trigger this -->
        <div class="flex justify-end mb-4">
            <label class="flex items-center gap-1.5 text-sm text-firefly-500 hover:text-firefly-600 font-medium cursor-pointer">
                <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    class="sr-only"
                    :disabled="uploadingImage"
                    @change="onPhotoSelect"
                    @click="($event.target as HTMLInputElement).value = ''"
                />
                <svg v-if="!uploadingImage" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {{ uploadingImage ? 'Uploading…' : imageLoaded ? 'Change photo' : 'Add a photo' }}
            </label>
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
