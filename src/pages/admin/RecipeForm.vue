<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRecipesStore } from '../../stores/recipes.js'

const route = useRoute()
const router = useRouter()
const store = useRecipesStore()

const isEditing = computed(() => !!route.params.id)
const saving = ref(false)
const aliasLocked = ref(false)

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

// ── Form state ─────────────────────────────────────────────────────────────

function emptyForm() {
    return {
        alias: '',
        name: '',
        description: '',
        tags: [] as string[],
        titlePosition: 'bl',
        isEnabled: true,
        notes: '',
        reference: '',
        ingredients: [{ quantity: 0, volume: '', ingredient: '', process: '', extra: '' }],
        steps: [{ instruction: '' }],
        boundRecipes: [] as { name: string; url: string }[],
    }
}

const form = reactive(emptyForm())
const errors = reactive({ name: '', alias: '' })

// ── Image ───────────────────────────────────────────────────────────────────

const imageFile = ref<File | null>(null)
const imagePreview = ref('')

const existingImageUrl = computed(() =>
    isEditing.value && form.alias
        ? `${supabaseUrl}/storage/v1/object/public/recipes/${form.alias}_md.jpg`
        : ''
)

function onImageSelect(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    imageFile.value = file
    imagePreview.value = URL.createObjectURL(file)
}

// ── Alias ───────────────────────────────────────────────────────────────────

function generateAlias(name: string): string {
    return name.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
}

watch(() => form.name, (name) => {
    if (!aliasLocked.value) {
        form.alias = generateAlias(name)
    }
})

// ── Tags ────────────────────────────────────────────────────────────────────

const tagInput = ref('')

function addTag() {
    const tag = tagInput.value.trim().toLowerCase()
    if (tag && !form.tags.includes(tag)) form.tags.push(tag)
    tagInput.value = ''
}

function onTagKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault()
        addTag()
    }
}

// ── Ingredients ─────────────────────────────────────────────────────────────

function addIngredient() {
    form.ingredients.push({ quantity: 0, volume: '', ingredient: '', process: '', extra: '' })
}

function removeIngredient(i: number) {
    form.ingredients.splice(i, 1)
}

function moveIngredient(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= form.ingredients.length) return
    ;[form.ingredients[i], form.ingredients[j]] = [form.ingredients[j], form.ingredients[i]]
}

// ── Steps ────────────────────────────────────────────────────────────────────

function addStep() {
    form.steps.push({ instruction: '' })
}

function removeStep(i: number) {
    form.steps.splice(i, 1)
}

function moveStep(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= form.steps.length) return
    ;[form.steps[i], form.steps[j]] = [form.steps[j], form.steps[i]]
}

// ── Bound recipes ────────────────────────────────────────────────────────────

function addBoundRecipe() {
    form.boundRecipes.push({ name: '', url: '' })
}

function removeBoundRecipe(i: number) {
    form.boundRecipes.splice(i, 1)
}

// ── Populate form when editing ───────────────────────────────────────────────

onMounted(async () => {
    if (!isEditing.value) return
    await store.fetchAllRecipes()
    const recipe = store.adminRecipes.find(r => r.id === route.params.id)
    if (!recipe) { router.push({ name: 'admin-recipes' }); return }

    form.alias = recipe.alias
    form.name = recipe.name
    form.description = recipe.description
    form.tags = [...recipe.tags]
    form.titlePosition = recipe.titlePosition || 'bl'
    form.isEnabled = recipe.isEnabled
    form.notes = recipe.notes ?? ''
    form.reference = recipe.reference ?? ''
    form.ingredients = recipe.ingredients.map(i => ({ ...i }))
    form.steps = recipe.steps.map(s => ({ instruction: s.instruction }))
    form.boundRecipes = recipe.boundRecipes ? recipe.boundRecipes.map(b => ({ ...b })) : []
    aliasLocked.value = true
})

// ── Validate & submit ────────────────────────────────────────────────────────

function validate(): boolean {
    errors.name = form.name.trim() ? '' : 'Recipe name is required'
    errors.alias = form.alias.trim() ? '' : 'Alias is required'
    return !errors.name && !errors.alias
}

async function submit() {
    if (!validate()) return
    saving.value = true
    try {
        const payload = {
            alias: form.alias.trim(),
            name: form.name.trim(),
            description: form.description.trim(),
            tags: form.tags,
            titlePosition: form.titlePosition,
            isEnabled: form.isEnabled,
            notes: form.notes.trim(),
            reference: form.reference.trim(),
            ingredients: form.ingredients.filter(i => i.ingredient.trim()),
            steps: form.steps.filter(s => s.instruction.trim()),
            boundRecipes: form.boundRecipes.filter(b => b.name.trim() && b.url.trim()),
        }
        if (isEditing.value) {
            await store.updateRecipe(route.params.id as string, payload, imageFile.value)
        } else {
            await store.createRecipe(payload, imageFile.value)
        }
        router.push({ name: 'admin-recipes' })
    } catch {
        // toast handled in store
    } finally {
        saving.value = false
    }
}
</script>

<template>
    <div class="max-w-3xl mx-auto px-4 pt-4 pb-10">

        <!-- Breadcrumb -->
        <nav class="flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 mb-6">
            <router-link to="/account" class="hover:text-firefly-500 transition-colors">Account</router-link>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <router-link to="/admin/recipes" class="hover:text-firefly-500 transition-colors">Recipes</router-link>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span class="text-gray-700 dark:text-gray-300 font-medium">{{ isEditing ? 'Edit' : 'New recipe' }}</span>
        </nav>

        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            {{ isEditing ? 'Edit recipe' : 'New recipe' }}
        </h1>

        <!-- ── Basic info ─────────────────────────────────────────────── -->
        <div class="bg-white dark:bg-firefly-900 rounded-2xl p-5 mb-4 space-y-4">
            <h2 class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Basic info</h2>

            <!-- Name -->
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Name <span class="text-red-500">*</span>
                </label>
                <input
                    v-model="form.name"
                    type="text"
                    placeholder="e.g. Sticky Toffee Pudding"
                    class="w-full rounded-xl border border-gray-200 dark:border-firefly-700 bg-gray-50 dark:bg-firefly-950 text-gray-900 dark:text-white px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-firefly-400"
                    :class="errors.name ? 'border-red-400' : ''"
                />
                <p v-if="errors.name" class="mt-1 text-xs text-red-500">{{ errors.name }}</p>
            </div>

            <!-- Alias -->
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Alias <span class="text-red-500">*</span>
                    <span class="ml-1 text-xs font-normal text-gray-400">(used in URL and image filenames)</span>
                </label>
                <input
                    v-model="form.alias"
                    @input="aliasLocked = true"
                    type="text"
                    placeholder="e.g. sticky-toffee-pudding"
                    class="w-full rounded-xl border border-gray-200 dark:border-firefly-700 bg-gray-50 dark:bg-firefly-950 text-gray-900 dark:text-white px-4 py-2.5 text-base font-mono focus:outline-none focus:ring-2 focus:ring-firefly-400"
                    :class="errors.alias ? 'border-red-400' : ''"
                />
                <p v-if="errors.alias" class="mt-1 text-xs text-red-500">{{ errors.alias }}</p>
            </div>

            <!-- Description -->
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                <textarea
                    v-model="form.description"
                    rows="3"
                    placeholder="A short description of the recipe…"
                    class="w-full rounded-xl border border-gray-200 dark:border-firefly-700 bg-gray-50 dark:bg-firefly-950 text-gray-900 dark:text-white px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-firefly-400 resize-none"
                />
            </div>

            <!-- Tags -->
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tags</label>
                <div class="flex flex-wrap gap-2 mb-2">
                    <span
                        v-for="(tag, i) in form.tags"
                        :key="tag"
                        class="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-firefly-50 dark:bg-firefly-800 text-firefly-700 dark:text-firefly-300 border border-firefly-200 dark:border-firefly-700"
                    >
                        {{ tag }}
                        <button type="button" @click="form.tags.splice(i, 1)" class="opacity-60 hover:opacity-100 ml-0.5">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </span>
                </div>
                <input
                    v-model="tagInput"
                    @keydown="onTagKeydown"
                    @blur="addTag"
                    type="text"
                    placeholder="Type a tag and press Enter"
                    class="w-full rounded-xl border border-gray-200 dark:border-firefly-700 bg-gray-50 dark:bg-firefly-950 text-gray-900 dark:text-white px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-firefly-400"
                />
            </div>

            <!-- Title position + Enabled -->
            <div class="flex items-start gap-4 flex-wrap">
                <div class="flex-1 min-w-[160px]">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Card title position</label>
                    <select
                        v-model="form.titlePosition"
                        class="w-full rounded-xl border border-gray-200 dark:border-firefly-700 bg-gray-50 dark:bg-firefly-950 text-gray-900 dark:text-white px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-firefly-400"
                    >
                        <option value="tl">Top left</option>
                        <option value="tr">Top right</option>
                        <option value="bl">Bottom left</option>
                        <option value="br">Bottom right</option>
                    </select>
                </div>

                <div class="flex items-center justify-between flex-1 min-w-[160px] pt-7">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Visible to users</span>
                    <button
                        type="button"
                        role="switch"
                        :aria-checked="form.isEnabled"
                        :aria-label="form.isEnabled ? 'Visible to users' : 'Hidden from users'"
                        @click="form.isEnabled = !form.isEnabled"
                        :class="form.isEnabled ? 'bg-firefly-500' : 'bg-gray-200 dark:bg-firefly-700'"
                        class="relative inline-flex h-6 w-11 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-firefly-400 focus:ring-offset-2"
                    >
                        <span
                            :class="form.isEnabled ? 'translate-x-5' : 'translate-x-0.5'"
                            class="inline-block h-5 w-5 mt-0.5 rounded-full bg-white shadow transform transition-transform"
                        />
                    </button>
                </div>
            </div>
        </div>

        <!-- ── Image ─────────────────────────────────────────────────── -->
        <div class="bg-white dark:bg-firefly-900 rounded-2xl p-5 mb-4">
            <h2 class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Primary image</h2>

            <!-- Preview -->
            <div
                v-if="imagePreview || existingImageUrl"
                class="relative aspect-[16/9] rounded-xl overflow-hidden bg-firefly-100 dark:bg-firefly-800 mb-3"
            >
                <img
                    :src="imagePreview || existingImageUrl"
                    class="w-full h-full object-cover"
                    alt="Recipe preview"
                    @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
                />
                <span
                    v-if="imagePreview"
                    class="absolute top-2 right-2 text-xs bg-firefly-600 text-white px-2 py-0.5 rounded-full"
                >
                    New image selected
                </span>
            </div>

            <label class="flex items-center gap-2 cursor-pointer">
                <input
                    type="file"
                    accept="image/*"
                    class="sr-only"
                    @change="onImageSelect"
                />
                <span class="px-4 py-2 rounded-xl border border-gray-200 dark:border-firefly-700 bg-gray-50 dark:bg-firefly-950 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-firefly-800 transition-colors">
                    {{ imagePreview ? 'Change image' : existingImageUrl ? 'Replace image' : 'Choose image' }}
                </span>
                <span class="text-xs text-gray-400 dark:text-gray-500">
                    Uploaded to all 4 sizes (xl, lg, md, sm)
                </span>
            </label>
        </div>

        <!-- ── Ingredients ──────────────────────────────────────────── -->
        <div class="bg-white dark:bg-firefly-900 rounded-2xl p-5 mb-4">
            <h2 class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Ingredients</h2>

            <div class="space-y-3">
                <div
                    v-for="(ing, i) in form.ingredients"
                    :key="i"
                    class="rounded-xl border border-gray-100 dark:border-firefly-800 p-3 bg-gray-50 dark:bg-firefly-950"
                >
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-xs font-medium text-gray-400 dark:text-gray-500">Ingredient {{ i + 1 }}</span>
                        <div class="flex items-center gap-1">
                            <button type="button" @click="moveIngredient(i, -1)" :disabled="i === 0" class="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/></svg>
                            </button>
                            <button type="button" @click="moveIngredient(i, 1)" :disabled="i === form.ingredients.length - 1" class="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
                            </button>
                            <button type="button" @click="removeIngredient(i)" class="p-1 text-gray-400 hover:text-red-500">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                    </div>

                    <!-- Ingredient name (full width) -->
                    <input
                        v-model="ing.ingredient"
                        type="text"
                        placeholder="Ingredient"
                        class="w-full rounded-lg border border-gray-200 dark:border-firefly-700 bg-white dark:bg-firefly-900 text-gray-900 dark:text-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-firefly-400 mb-2"
                    />

                    <!-- Qty + Volume + Process + Extra in a grid -->
                    <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <input
                            v-model.number="ing.quantity"
                            type="number"
                            min="0"
                            placeholder="Qty"
                            class="rounded-lg border border-gray-200 dark:border-firefly-700 bg-white dark:bg-firefly-900 text-gray-900 dark:text-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-firefly-400"
                        />
                        <input
                            v-model="ing.volume"
                            type="text"
                            placeholder="Volume (e.g. cup)"
                            class="rounded-lg border border-gray-200 dark:border-firefly-700 bg-white dark:bg-firefly-900 text-gray-900 dark:text-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-firefly-400"
                        />
                        <input
                            v-model="ing.process"
                            type="text"
                            placeholder="Process (e.g. chopped)"
                            class="rounded-lg border border-gray-200 dark:border-firefly-700 bg-white dark:bg-firefly-900 text-gray-900 dark:text-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-firefly-400"
                        />
                        <input
                            v-model="ing.extra"
                            type="text"
                            placeholder="Extra note"
                            class="rounded-lg border border-gray-200 dark:border-firefly-700 bg-white dark:bg-firefly-900 text-gray-900 dark:text-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-firefly-400"
                        />
                    </div>
                </div>
            </div>

            <button
                type="button"
                @click="addIngredient"
                class="mt-3 flex items-center gap-1.5 text-sm text-firefly-500 hover:text-firefly-600 font-medium"
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add ingredient
            </button>
        </div>

        <!-- ── Steps ────────────────────────────────────────────────── -->
        <div class="bg-white dark:bg-firefly-900 rounded-2xl p-5 mb-4">
            <h2 class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Steps</h2>

            <div class="space-y-3">
                <div
                    v-for="(step, i) in form.steps"
                    :key="i"
                    class="rounded-xl border border-gray-100 dark:border-firefly-800 p-3 bg-gray-50 dark:bg-firefly-950"
                >
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-2">
                            <span class="w-6 h-6 rounded-full bg-firefly-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                                {{ i + 1 }}
                            </span>
                            <span class="text-xs font-medium text-gray-400 dark:text-gray-500">Step {{ i + 1 }}</span>
                        </div>
                        <div class="flex items-center gap-1">
                            <button type="button" @click="moveStep(i, -1)" :disabled="i === 0" class="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/></svg>
                            </button>
                            <button type="button" @click="moveStep(i, 1)" :disabled="i === form.steps.length - 1" class="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
                            </button>
                            <button type="button" @click="removeStep(i)" :disabled="form.steps.length === 1" class="p-1 text-gray-400 hover:text-red-500 disabled:opacity-30">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                    </div>
                    <textarea
                        v-model="step.instruction"
                        rows="3"
                        placeholder="Describe this step…"
                        class="w-full rounded-lg border border-gray-200 dark:border-firefly-700 bg-white dark:bg-firefly-900 text-gray-900 dark:text-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-firefly-400 resize-none"
                    />
                </div>
            </div>

            <button
                type="button"
                @click="addStep"
                class="mt-3 flex items-center gap-1.5 text-sm text-firefly-500 hover:text-firefly-600 font-medium"
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add step
            </button>
        </div>

        <!-- ── Notes & Reference ─────────────────────────────────────── -->
        <div class="bg-white dark:bg-firefly-900 rounded-2xl p-5 mb-4 space-y-4">
            <h2 class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Notes & reference</h2>

            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notes</label>
                <textarea
                    v-model="form.notes"
                    rows="3"
                    placeholder="Optional tips, variations, or storage notes…"
                    class="w-full rounded-xl border border-gray-200 dark:border-firefly-700 bg-gray-50 dark:bg-firefly-950 text-gray-900 dark:text-white px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-firefly-400 resize-none"
                />
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Source URL</label>
                <input
                    v-model="form.reference"
                    type="url"
                    placeholder="https://example.com/recipe"
                    class="w-full rounded-xl border border-gray-200 dark:border-firefly-700 bg-gray-50 dark:bg-firefly-950 text-gray-900 dark:text-white px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-firefly-400"
                />
            </div>
        </div>

        <!-- ── Bound recipes ─────────────────────────────────────────── -->
        <div class="bg-white dark:bg-firefly-900 rounded-2xl p-5 mb-6">
            <h2 class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">See also (linked recipes)</h2>

            <div class="space-y-2">
                <div
                    v-for="(br, i) in form.boundRecipes"
                    :key="i"
                    class="flex items-center gap-2"
                >
                    <input
                        v-model="br.name"
                        type="text"
                        placeholder="Recipe name"
                        class="flex-1 rounded-xl border border-gray-200 dark:border-firefly-700 bg-gray-50 dark:bg-firefly-950 text-gray-900 dark:text-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-firefly-400"
                    />
                    <input
                        v-model="br.url"
                        type="url"
                        placeholder="URL"
                        class="flex-1 rounded-xl border border-gray-200 dark:border-firefly-700 bg-gray-50 dark:bg-firefly-950 text-gray-900 dark:text-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-firefly-400"
                    />
                    <button type="button" @click="removeBoundRecipe(i)" class="p-1.5 text-gray-400 hover:text-red-500 shrink-0">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            <button
                type="button"
                @click="addBoundRecipe"
                class="mt-3 flex items-center gap-1.5 text-sm text-firefly-500 hover:text-firefly-600 font-medium"
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add linked recipe
            </button>
        </div>

        <!-- ── Actions ───────────────────────────────────────────────── -->
        <div class="flex gap-3">
            <router-link
                to="/admin/recipes"
                class="flex-1 py-3 rounded-xl border border-gray-200 dark:border-firefly-700 text-gray-600 dark:text-gray-300 text-sm font-medium text-center hover:bg-gray-50 dark:hover:bg-firefly-800 transition-colors"
            >
                Cancel
            </router-link>
            <button
                type="button"
                @click="submit"
                :disabled="saving"
                class="flex-1 py-3 rounded-xl bg-damask-500 hover:bg-damask-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
                {{ saving ? 'Saving…' : isEditing ? 'Save changes' : 'Create recipe' }}
            </button>
        </div>

    </div>
</template>
