<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useItemsStore } from '../stores/items.js'
import { useMarketplacesStore } from '../stores/marketplaces.js'
import { ItemModel } from '../model/item.model.js'
import grocerySuggestions from '../data/grocery-suggestions.json'

const itemsStore = useItemsStore()
const marketplacesStore = useMarketplacesStore()

onMounted(() => { document.title = 'Gather | iLoyola' })

// --- Form state ---

function emptyForm() {
    return {
        id: undefined as string | undefined,
        product: '',
        quantity: 1,
        brand: '',
        comments: '',
        isNonessential: false,
        marketplacesIds: [] as string[],
        category: { id: '', name: '', isEnabled: true },
        marketplaces: [] as ItemModel['marketplaces'],
        isEnabled: true,
    }
}

const form = reactive(emptyForm())
const isEditing = ref(false)
const wasDisabled = ref(false)
const saving = ref(false)
const activeTab = ref<'add' | 'items'>('add')
const errors = reactive({ product: '', quantity: '', marketplaces: '' })

// --- Autocomplete ---

const showSuggestions = ref(false)
const activeIndex = ref(-1)

const localSuggestions = computed(() => {
    const q = form.product.trim().toLowerCase()
    if (q.length < 2) return []
    return itemsStore.knownItems
        .filter(item => item.product.toLowerCase().includes(q))
        .slice(0, 5)
})

const catalogSuggestions = computed(() => {
    const q = form.product.trim().toLowerCase()
    if (q.length < 2) return []
    const localNames = new Set(itemsStore.knownItems.map(i => i.product.toLowerCase()))
    return grocerySuggestions
        .filter(s => s.name.toLowerCase().includes(q) && !localNames.has(s.name.toLowerCase()))
        .slice(0, 5)
})

const hasSuggestions = computed(() =>
    localSuggestions.value.length > 0 || catalogSuggestions.value.length > 0
)

const totalSuggestions = computed(() =>
    localSuggestions.value.length + catalogSuggestions.value.length
)

function onProductInput() {
    showSuggestions.value = true
    isEditing.value = false
    form.id = undefined
    activeIndex.value = -1
}

function onProductBlur() {
    setTimeout(() => { showSuggestions.value = false; activeIndex.value = -1 }, 150)
}

function onProductKeydown(e: KeyboardEvent) {
    if (!showSuggestions.value || !hasSuggestions.value) return
    if (e.key === 'ArrowDown') {
        e.preventDefault()
        activeIndex.value = activeIndex.value < totalSuggestions.value - 1 ? activeIndex.value + 1 : 0
    } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        activeIndex.value = activeIndex.value > 0 ? activeIndex.value - 1 : totalSuggestions.value - 1
    } else if (e.key === 'Enter' && activeIndex.value >= 0) {
        e.preventDefault()
        const localLen = localSuggestions.value.length
        if (activeIndex.value < localLen) {
            selectSuggestion(localSuggestions.value[activeIndex.value])
        } else {
            const s = catalogSuggestions.value[activeIndex.value - localLen]
            form.product = s.name
            showSuggestions.value = false
            activeIndex.value = -1
        }
    } else if (e.key === 'Escape') {
        showSuggestions.value = false
        activeIndex.value = -1
    }
}

function selectSuggestion(item: ItemModel) {
    loadItem(item)
    showSuggestions.value = false
    activeIndex.value = -1
}

// --- Item list ---

const sortedItems = computed(() =>
    [...itemsStore.items].sort((a, b) => a.product.localeCompare(b.product))
)

const sortedMarketplaces = computed(() =>
    [...marketplacesStore.marketplaces].sort((a, b) => a.name.localeCompare(b.name))
)

function loadItem(item: ItemModel) {
    Object.assign(form, {
        id: item.id,
        product: item.product,
        quantity: item.quantity ?? 1,
        brand: item.brand ?? '',
        comments: item.comments ?? '',
        isNonessential: item.isNonessential,
        marketplacesIds: [...item.marketplacesIds],
        category: { ...item.category },
        marketplaces: [...item.marketplaces],
        isEnabled: true,
    })
    isEditing.value = true
    wasDisabled.value = !item.isEnabled
    activeTab.value = 'add'
    errors.product = ''
    errors.quantity = ''
    errors.marketplaces = ''
}

// --- Marketplace toggle ---

function toggleMarketplace(id: string) {
    const idx = form.marketplacesIds.indexOf(id)
    if (idx === -1) form.marketplacesIds.push(id)
    else form.marketplacesIds.splice(idx, 1)
}

// --- Quantity stepper ---

function incrementQty() { form.quantity = (form.quantity ?? 0) + 1 }
function decrementQty() { form.quantity = Math.max(0, (form.quantity ?? 0) - 1) }

// --- Validation & submit ---

function validate(): boolean {
    errors.product = form.product.trim() ? '' : 'Product name is required'
    errors.quantity = (form.quantity ?? 0) > 0 ? '' : 'Quantity must be at least 1'
    errors.marketplaces = form.marketplacesIds.length > 0 ? '' : 'Select at least one marketplace'
    return !errors.product && !errors.quantity && !errors.marketplaces
}

async function submitForm() {
    if (!validate()) return
    saving.value = true
    try {
        const payload: ItemModel = {
            id: form.id,
            product: form.product,
            quantity: form.quantity,
            brand: form.brand,
            comments: form.comments,
            isNonessential: form.isNonessential,
            marketplacesIds: form.marketplacesIds,
            category: form.category,
            marketplaces: form.marketplaces,
            isEnabled: form.isEnabled,
        }
        if (isEditing.value && form.id) {
            await itemsStore.updateItem(payload)
        } else {
            await itemsStore.addItem(payload)
        }
        resetForm()
    } catch {
        // toast is handled in the store
    } finally {
        saving.value = false
    }
}

async function deleteCurrentItem() {
    if (!form.id) return
    saving.value = true
    try {
        const payload: ItemModel = {
            id: form.id,
            product: form.product,
            quantity: form.quantity,
            brand: form.brand,
            comments: form.comments,
            isNonessential: form.isNonessential,
            marketplacesIds: form.marketplacesIds,
            category: form.category,
            marketplaces: form.marketplaces,
            isEnabled: form.isEnabled,
        }
        await itemsStore.deleteItem(payload)
        resetForm()
    } catch {
        // toast is handled in the store
    } finally {
        saving.value = false
    }
}

function resetForm() {
    Object.assign(form, emptyForm())
    isEditing.value = false
    wasDisabled.value = false
    errors.product = ''
    errors.quantity = ''
    errors.marketplaces = ''
}
</script>

<template>
    <div class="max-w-3xl mx-auto pb-6">

        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white px-4 pt-4 mb-2">Gather</h1>

        <!-- Sticky tab bar -->
        <div class="sticky top-14 z-30 bg-gray-50 dark:bg-gray-950 px-4 pt-1 pb-3">
            <div class="flex bg-gray-100 dark:bg-firefly-900 rounded-xl p-1">
                <button
                    type="button"
                    @click="activeTab = 'add'"
                    :class="activeTab === 'add'
                        ? 'bg-white dark:bg-firefly-700 shadow-sm text-gray-900 dark:text-white'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
                    class="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                >
                    {{ isEditing ? 'Editing…' : 'Add item' }}
                </button>
                <button
                    type="button"
                    @click="activeTab = 'items'"
                    :class="activeTab === 'items'
                        ? 'bg-white dark:bg-firefly-700 shadow-sm text-gray-900 dark:text-white'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
                    class="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                >
                    Items ({{ itemsStore.items.length }})
                </button>
            </div>
        </div>

        <!-- Items tab -->
        <div v-show="activeTab === 'items'" class="px-4">
            <div class="rounded-2xl overflow-hidden bg-white dark:bg-firefly-900 divide-y divide-gray-100 dark:divide-firefly-800">
                <div v-if="itemsStore.loading" class="px-4 py-4 space-y-3">
                    <div
                        v-for="n in 5"
                        :key="n"
                        class="h-10 rounded-xl bg-gray-100 dark:bg-firefly-800 animate-pulse"
                    />
                </div>
                <div
                    v-else-if="itemsStore.items.length === 0"
                    class="px-4 py-6 text-center text-sm text-gray-600 dark:text-gray-400"
                >
                    No items yet. Switch to Add item to get started.
                </div>
                <button
                    v-for="item in sortedItems"
                    :key="item.id"
                    type="button"
                    @click="loadItem(item)"
                    :class="form.id === item.id
                        ? 'bg-firefly-50 dark:bg-firefly-800'
                        : 'hover:bg-gray-50 dark:hover:bg-firefly-800'"
                    class="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                >
                    <div class="flex-1 min-w-0">
                        <p class="font-medium text-gray-900 dark:text-white text-sm truncate">{{ item.product }}</p>
                        <p class="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {{ item.marketplaces.map(m => m.name).join(', ') || 'No marketplaces' }}
                        </p>
                    </div>
                    <span
                        v-if="item.isNonessential"
                        class="shrink-0 text-xs px-2 py-0.5 rounded-full bg-damask-100 text-damask-700"
                    >
                        Nice-to-have
                    </span>
                    <svg class="shrink-0 w-4 h-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>

        <!-- Add tab -->
        <div v-show="activeTab === 'add'" class="px-4">
        <div class="bg-white dark:bg-firefly-900 rounded-2xl p-5">

            <h2 class="text-base font-semibold text-gray-900 dark:text-white mb-4">
                {{ isEditing ? form.product : 'Add new item' }}
            </h2>

            <!-- Product -->
            <div class="mb-4 relative">
                <label for="product" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Product <span class="text-red-500">*</span>
                </label>
                <input
                    id="product"
                    v-model="form.product"
                    @input="onProductInput"
                    @blur="onProductBlur"
                    @keydown="onProductKeydown"
                    type="text"
                    autocomplete="off"
                    placeholder="e.g. Whole Milk"
                    role="combobox"
                    :aria-expanded="showSuggestions && hasSuggestions"
                    aria-autocomplete="list"
                    class="w-full rounded-xl border border-gray-200 dark:border-firefly-700 bg-gray-50 dark:bg-firefly-950 text-gray-900 dark:text-white px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-firefly-400"
                    :class="errors.product ? 'border-red-400 focus:ring-red-300' : ''"
                />
                <!-- Suggestions dropdown -->
                <div
                    v-if="showSuggestions && hasSuggestions"
                    class="absolute z-20 left-0 right-0 mt-1 bg-white dark:bg-firefly-800 rounded-xl shadow-lg border border-gray-100 dark:border-firefly-700 overflow-hidden"
                >
                    <!-- Your list -->
                    <template v-if="localSuggestions.length > 0">
                        <div class="px-3 pt-2 pb-1">
                            <span class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Your list</span>
                        </div>
                        <button
                            v-for="(s, i) in localSuggestions"
                            :key="s.id"
                            type="button"
                            @mousedown.prevent="selectSuggestion(s)"
                            :class="activeIndex === i ? 'bg-firefly-50 dark:bg-firefly-700' : 'hover:bg-gray-50 dark:hover:bg-firefly-700'"
                            class="w-full flex items-center gap-2 px-4 py-2 text-left transition-colors"
                        >
                            <span class="flex-1 text-sm font-medium text-gray-900 dark:text-white">{{ s.product }}</span>
                            <span class="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[140px]">
                                {{ s.marketplaces.map(m => m.name).join(', ') }}
                            </span>
                        </button>
                    </template>

                    <!-- Catalog -->
                    <template v-if="catalogSuggestions.length > 0">
                        <div class="px-3 pt-2 pb-1" :class="localSuggestions.length > 0 ? 'border-t border-gray-100 dark:border-firefly-700' : ''">
                            <span class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Catalog</span>
                        </div>
                        <button
                            v-for="(s, i) in catalogSuggestions"
                            :key="s.name"
                            type="button"
                            @mousedown.prevent="form.product = s.name; showSuggestions = false; activeIndex = -1"
                            :class="activeIndex === localSuggestions.length + i ? 'bg-firefly-50 dark:bg-firefly-700' : 'hover:bg-gray-50 dark:hover:bg-firefly-700'"
                            class="w-full flex items-center gap-2 px-4 py-2 text-left transition-colors"
                        >
                            <span class="flex-1 text-sm text-gray-700 dark:text-gray-300">{{ s.name }}</span>
                            <span class="text-xs text-gray-600 dark:text-gray-400">{{ s.category }}</span>
                        </button>
                    </template>
                </div>
                <p v-if="errors.product" class="mt-1.5 text-xs text-red-500">{{ errors.product }}</p>
            </div>

            <!-- Quantity -->
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Quantity <span class="text-red-500">*</span>
                </label>
                <div class="flex items-center gap-3">
                    <button
                        type="button"
                        @click="decrementQty"
                        aria-label="Decrease quantity"
                        class="w-9 h-9 rounded-full bg-gray-100 dark:bg-firefly-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-firefly-700 transition-colors"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4" />
                        </svg>
                    </button>
                    <input
                        v-model.number="form.quantity"
                        type="number"
                        min="0"
                        class="w-16 text-center rounded-xl border border-gray-200 dark:border-firefly-700 bg-gray-50 dark:bg-firefly-950 text-gray-900 dark:text-white px-2 py-2 text-base focus:outline-none focus:ring-2 focus:ring-firefly-400"
                    />
                    <button
                        type="button"
                        @click="incrementQty"
                        aria-label="Increase quantity"
                        class="w-9 h-9 rounded-full bg-gray-100 dark:bg-firefly-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-firefly-700 transition-colors"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>
                <p v-if="errors.quantity" class="mt-1.5 text-xs text-red-500">{{ errors.quantity }}</p>
            </div>

            <!-- Marketplaces -->
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Marketplaces <span class="text-red-500">*</span>
                </label>
                <div class="flex flex-wrap gap-2">
                    <button
                        v-for="mp in sortedMarketplaces"
                        :key="mp.id"
                        type="button"
                        @click="toggleMarketplace(mp.id)"
                        :class="form.marketplacesIds.includes(mp.id)
                            ? 'bg-firefly-500 text-white border-firefly-500'
                            : 'bg-white dark:bg-firefly-950 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-firefly-700'"
                        class="px-4 py-1.5 rounded-full text-sm font-medium border transition-colors"
                    >
                        {{ mp.name }}
                    </button>
                </div>
                <p v-if="errors.marketplaces" class="mt-1.5 text-xs text-red-500">{{ errors.marketplaces }}</p>
            </div>

            <!-- Brand -->
            <div class="mb-4">
                <label for="brand" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Preferred brand
                </label>
                <input
                    id="brand"
                    v-model="form.brand"
                    type="text"
                    placeholder="e.g. Organic Valley"
                    class="w-full rounded-xl border border-gray-200 dark:border-firefly-700 bg-gray-50 dark:bg-firefly-950 text-gray-900 dark:text-white px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-firefly-400"
                />
            </div>

            <!-- Extras -->
            <div class="mb-4">
                <label for="comments" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Notes
                </label>
                <input
                    id="comments"
                    v-model="form.comments"
                    type="text"
                    placeholder="e.g. 2% or higher"
                    class="w-full rounded-xl border border-gray-200 dark:border-firefly-700 bg-gray-50 dark:bg-firefly-950 text-gray-900 dark:text-white px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-firefly-400"
                />
            </div>

            <!-- Non-essential toggle -->
            <div class="mb-6 flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Nice-to-have</p>
                    <p class="text-xs text-gray-600 dark:text-gray-400">Only buy if on sale or budget allows</p>
                </div>
                <button
                    type="button"
                    role="switch"
                    :aria-checked="form.isNonessential"
                    @click="form.isNonessential = !form.isNonessential"
                    :class="form.isNonessential ? 'bg-firefly-500' : 'bg-gray-200 dark:bg-firefly-700'"
                    class="relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-firefly-400 focus:ring-offset-2"
                >
                    <span
                        :class="form.isNonessential ? 'translate-x-5' : 'translate-x-0.5'"
                        class="inline-block h-5 w-5 mt-0.5 rounded-full bg-white shadow transform transition-transform"
                    />
                </button>
            </div>

            <!-- Re-add notice -->
            <div
                v-if="wasDisabled"
                class="mb-4 flex items-start gap-2 rounded-xl bg-damask-50 dark:bg-damask-900/20 border border-damask-200 dark:border-damask-800 px-4 py-3 text-sm text-damask-700 dark:text-damask-300"
            >
                <svg class="shrink-0 w-4 h-4 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
                </svg>
                <span>This item was previously purchased. Saving will re-add it to your shopping list.</span>
            </div>

            <!-- Buttons -->
            <div class="flex gap-3">
                <button
                    v-if="isEditing"
                    type="button"
                    @click="resetForm"
                    class="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-firefly-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-firefly-800 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    @click="submitForm"
                    :disabled="saving"
                    class="flex-1 py-2.5 rounded-xl bg-damask-500 hover:bg-damask-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
                >
                    <span v-if="saving">Saving…</span>
                    <span v-else-if="isEditing">Update item</span>
                    <span v-else>Add item</span>
                </button>
            </div>

            <!-- Delete -->
            <div v-if="isEditing" class="mt-3 text-center">
                <button
                    type="button"
                    @click="deleteCurrentItem"
                    :disabled="saving"
                    class="text-sm text-red-500 dark:text-red-400 hover:underline disabled:opacity-50"
                >
                    Remove from list
                </button>
            </div>
        </div>
        </div><!-- /add tab -->

    </div>
</template>
