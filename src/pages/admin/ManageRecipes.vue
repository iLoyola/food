<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRecipesStore } from '../../stores/recipes.js'

const store = useRecipesStore()

const confirmDeleteId = ref<string | null>(null)
const deleting = ref(false)

onMounted(() => store.fetchAllRecipes())

async function executeDelete(id: string) {
    deleting.value = true
    try {
        await store.deleteRecipe(id)
        confirmDeleteId.value = null
    } catch {
    } finally {
        deleting.value = false
    }
}
</script>

<template>
    <div class="max-w-3xl mx-auto px-4 pt-4 pb-6">

        <!-- Breadcrumb -->
        <nav class="flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 mb-6">
            <router-link to="/account" class="hover:text-firefly-500 transition-colors">Account</router-link>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span class="text-gray-700 dark:text-gray-300 font-medium">Recipes</span>
        </nav>

        <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Manage Recipes</h1>
            <router-link
                to="/admin/recipes/new"
                class="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-firefly-500 hover:bg-firefly-600 text-white text-sm font-medium transition-colors"
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New recipe
            </router-link>
        </div>

        <!-- List -->
        <div class="bg-white dark:bg-firefly-900 rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-firefly-800">

            <div
                v-if="store.adminRecipes.length === 0"
                class="px-4 py-10 text-center text-sm text-gray-400 dark:text-gray-500"
            >
                No recipes yet.
                <router-link to="/admin/recipes/new" class="block mt-2 text-firefly-500 hover:underline">
                    Add your first recipe
                </router-link>
            </div>

            <div v-for="recipe in store.adminRecipes" :key="recipe.id">

                <!-- Normal row -->
                <router-link
                    v-if="confirmDeleteId !== recipe.id"
                    :to="{ name: 'admin-recipe-edit', params: { id: recipe.id } }"
                    class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-firefly-800 transition-colors"
                >
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                            <p
                                class="text-sm font-medium text-gray-900 dark:text-white capitalize truncate"
                                :class="!recipe.isEnabled ? 'opacity-40' : ''"
                            >
                                {{ recipe.name }}
                            </p>
                            <span
                                v-if="!recipe.isEnabled"
                                class="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-firefly-800 text-gray-400"
                            >
                                Hidden
                            </span>
                        </div>
                        <p v-if="recipe.tags.length" class="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                            {{ recipe.tags.join(', ') }}
                        </p>
                    </div>

                    <!-- Enable/disable toggle -->
                    <button
                        type="button"
                        role="switch"
                        :aria-checked="recipe.isEnabled"
                        @click.stop="store.toggleRecipeEnabled(recipe.id, !recipe.isEnabled)"
                        :class="recipe.isEnabled ? 'bg-firefly-500' : 'bg-gray-200 dark:bg-firefly-700'"
                        class="relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-firefly-400 focus:ring-offset-2"
                        :aria-label="recipe.isEnabled ? 'Hide recipe' : 'Show recipe'"
                    >
                        <span
                            :class="recipe.isEnabled ? 'translate-x-4' : 'translate-x-0.5'"
                            class="inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transform transition-transform"
                        />
                    </button>

                    <!-- Delete -->
                    <button
                        type="button"
                        @click.stop="confirmDeleteId = recipe.id"
                        class="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-firefly-800"
                        aria-label="Delete recipe"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </router-link>

                <!-- Delete confirm row -->
                <div
                    v-else
                    class="px-4 py-3 bg-red-50 dark:bg-firefly-950"
                >
                    <p class="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                        Permanently delete "{{ recipe.name }}"?
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        This removes all ingredients, steps, and related data. This cannot be undone.
                    </p>
                    <div class="flex gap-2">
                        <button
                            type="button"
                            @click="executeDelete(recipe.id)"
                            :disabled="deleting"
                            class="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-medium transition-colors disabled:opacity-50"
                        >
                            {{ deleting ? 'Deleting…' : 'Yes, delete' }}
                        </button>
                        <button
                            type="button"
                            @click="confirmDeleteId = null"
                            class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-firefly-700 text-gray-600 dark:text-gray-300 text-xs font-medium hover:bg-white dark:hover:bg-firefly-800 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>

            </div>
        </div>

    </div>
</template>
