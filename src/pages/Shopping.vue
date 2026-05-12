<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useItemsStore } from '../stores/items.js'
import { useMarketplacesStore } from '../stores/marketplaces.js'

const marketplacesStore = useMarketplacesStore()
const itemsStore = useItemsStore()

const purchasing = ref(false)

onMounted(() => { document.title = 'Shopping | iLoyola' })

const sortedMarketplaces = computed(() =>
    [...marketplacesStore.marketplaces].sort((a, b) => a.name.localeCompare(b.name))
)

const filteredItems = computed(() => {
    if (marketplacesStore.activeMarket === 'all') return itemsStore.items
    return itemsStore.items.filter(item =>
        item.marketplaces.some(mp => mp.name === marketplacesStore.activeMarket)
    )
})

const uncheckedItems = computed(() =>
    filteredItems.value.filter(item => !itemsStore.checkedIds.has(item.id!))
)

const checkedItems = computed(() =>
    filteredItems.value.filter(item => itemsStore.checkedIds.has(item.id!))
)

// All checked IDs across all filters (for the purchase action)
const allCheckedIds = computed(() => [...itemsStore.checkedIds])

async function justPurchased() {
    purchasing.value = true
    await itemsStore.purchaseItems(allCheckedIds.value)
    purchasing.value = false
}
</script>

<template>
    <div class="max-w-3xl mx-auto">

        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white px-4 pt-4 mb-1">Shopping</h1>

        <!-- Empty state — no items in the list at all -->
        <div
            v-if="itemsStore.items.length === 0 && !itemsStore.loading"
            class="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center"
        >
            <div class="w-16 h-16 rounded-full bg-firefly-50 dark:bg-firefly-900 flex items-center justify-center mb-5">
                <svg class="w-8 h-8 text-firefly-400 dark:text-firefly-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            </div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Your list is empty</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-xs leading-relaxed">
                Head over to Gather to start adding items to your shopping list.
            </p>
            <router-link
                to="/basket"
                class="px-5 py-2.5 rounded-xl bg-firefly-500 hover:bg-firefly-600 text-white text-sm font-medium transition-colors"
            >
                Go to Gather
            </router-link>
        </div>

        <!-- List — items exist -->
        <template v-else>

            <!-- Sticky bar: marketplace pills + item count -->
            <div class="sticky top-14 z-30 bg-gray-50 dark:bg-gray-950">
                <div class="px-4 pt-3 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                    <button
                        @click="marketplacesStore.activeMarket = 'all'"
                        :class="marketplacesStore.activeMarket === 'all'
                            ? 'bg-firefly-500 text-white'
                            : 'bg-gray-100 dark:bg-firefly-900 text-gray-600 dark:text-gray-300'"
                        class="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                    >
                        All
                    </button>
                    <button
                        v-for="mp in sortedMarketplaces"
                        :key="mp.id"
                        @click="marketplacesStore.activeMarket = mp.name"
                        :class="marketplacesStore.activeMarket === mp.name
                            ? 'bg-firefly-500 text-white'
                            : 'bg-gray-100 dark:bg-firefly-900 text-gray-600 dark:text-gray-300'"
                        class="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                    >
                        {{ mp.name }}
                    </button>
                </div>
                <div class="px-4 pb-2">
                    <span aria-live="polite" aria-atomic="true" class="text-xs text-gray-500 dark:text-gray-400">
                        {{ uncheckedItems.length }} item{{ uncheckedItems.length !== 1 ? 's' : '' }} remaining
                    </span>
                </div>
            </div>

            <!-- No items for active marketplace filter -->
            <div
                v-if="filteredItems.length === 0"
                class="mx-4 rounded-2xl bg-white dark:bg-firefly-900 px-4 py-8 text-center text-sm text-gray-600 dark:text-gray-400"
            >
                No items at this marketplace.
            </div>

            <template v-else>
                <!-- Unchecked items -->
                <div class="mx-4 rounded-2xl overflow-hidden bg-white dark:bg-firefly-900 divide-y divide-gray-100 dark:divide-firefly-800">
                    <button
                        v-for="item in uncheckedItems"
                        :key="item.id"
                        type="button"
                        @click="itemsStore.toggleChecked(item.id!)"
                        aria-pressed="false"
                        class="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-gray-50 dark:active:bg-firefly-800 select-none"
                        :aria-label="`Mark ${item.product} as purchased`"
                    >
                        <div class="shrink-0 w-6 h-6 rounded-full border-2 border-gray-300 dark:border-firefly-600"></div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-baseline gap-1.5 flex-wrap">
                                <span class="font-medium text-gray-900 dark:text-white">
                                    {{ item.quantity ? `${item.quantity} ` : '' }}{{ item.product }}
                                </span>
                                <span v-if="item.brand" class="text-sm text-gray-600 dark:text-gray-400">
                                    {{ item.brand }}
                                </span>
                            </div>
                            <p v-if="item.comments" class="text-sm text-gray-600 dark:text-gray-400 truncate">
                                {{ item.comments }}
                            </p>
                        </div>
                        <div class="shrink-0 flex flex-col items-end gap-1">
                            <span
                                v-if="item.isNonessential"
                                class="text-xs px-2 py-0.5 rounded-full bg-damask-100 text-damask-700"
                            >
                                Nice-to-have
                            </span>
                            <span
                                v-for="mp in item.marketplaces"
                                :key="mp.id"
                                class="text-xs text-gray-600 dark:text-gray-400"
                            >
                                {{ mp.name }}
                            </span>
                        </div>
                    </button>

                    <!-- All items checked -->
                    <div
                        v-if="uncheckedItems.length === 0"
                        class="px-4 py-6 text-center text-sm text-gray-600 dark:text-gray-400"
                    >
                        All done — everything's checked off.
                    </div>
                </div>

                <!-- Checked items -->
                <div v-if="checkedItems.length > 0" class="mx-4 mt-3 rounded-2xl overflow-hidden bg-white dark:bg-firefly-900 divide-y divide-gray-100 dark:divide-firefly-800">
                    <div class="px-4 py-2">
                        <span class="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                            Checked off
                        </span>
                    </div>
                    <button
                        v-for="item in checkedItems"
                        :key="item.id"
                        type="button"
                        @click="itemsStore.toggleChecked(item.id!)"
                        aria-pressed="true"
                        class="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-gray-50 dark:active:bg-firefly-800 select-none"
                        :aria-label="`Mark ${item.product} as not purchased`"
                    >
                        <div class="shrink-0 w-6 h-6 rounded-full bg-firefly-500 flex items-center justify-center">
                            <svg class="w-3.5 h-3.5 text-white" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <span class="flex-1 text-gray-500 dark:text-gray-400 line-through text-sm">
                            {{ item.product }}
                        </span>
                    </button>
                </div>
            </template>

        </template>

        <div class="h-4"></div>
    </div>

    <!-- Just Purchased action bar -->
    <Teleport to="body">
        <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="translate-y-full opacity-0"
            enter-to-class="translate-y-0 opacity-100"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="translate-y-0 opacity-100"
            leave-to-class="translate-y-full opacity-0"
        >
            <div
                v-if="allCheckedIds.length > 0"
                class="fixed bottom-16 inset-x-0 z-50 px-4 pb-3 pointer-events-none"
            >
                <button
                    type="button"
                    @click="justPurchased"
                    :disabled="purchasing"
                    class="pointer-events-auto w-full flex items-center justify-between gap-3 px-5 py-3.5 rounded-2xl bg-damask-500 hover:bg-damask-600 dark:bg-damask-500 text-white shadow-lg shadow-damask-900/20 active:scale-[0.98] transition-transform disabled:opacity-60"
                >
                    <div class="flex items-center gap-2.5">
                        <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span class="font-semibold text-sm">
                            {{ purchasing ? 'Updating…' : 'Purchased' }}
                        </span>
                    </div>
                    <span class="shrink-0 bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        {{ allCheckedIds.length }}
                    </span>
                </button>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
