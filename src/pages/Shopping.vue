<script setup lang="ts">
import { computed, ref } from 'vue'
import { useItemsStore } from '../stores/items.js'
import { useMarketplacesStore } from '../stores/marketplaces.js'

const marketplacesStore = useMarketplacesStore()
const itemsStore = useItemsStore()

const checked = ref<Set<string>>(new Set())

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
    filteredItems.value.filter(item => !checked.value.has(item.id!))
)

const checkedItems = computed(() =>
    filteredItems.value.filter(item => checked.value.has(item.id!))
)

function toggle(id: string) {
    const next = new Set(checked.value)
    next.has(id) ? next.delete(id) : next.add(id)
    checked.value = next
}

function clearChecked() {
    checked.value = new Set()
}
</script>

<template>
    <div class="max-w-3xl mx-auto">

        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white px-4 pt-4 mb-1">Shopping</h1>

        <!-- Marketplace filter pills -->
        <div class="px-4 pt-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
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

        <!-- Item count -->
        <div class="px-4 pb-2 flex items-center justify-between">
            <span class="text-xs text-gray-400 dark:text-gray-500">
                {{ uncheckedItems.length }} item{{ uncheckedItems.length !== 1 ? 's' : '' }} remaining
            </span>
            <button
                v-if="checkedItems.length > 0"
                @click="clearChecked"
                class="text-xs text-firefly-500 font-medium"
            >
                Clear checked
            </button>
        </div>

        <!-- Unchecked items -->
        <div class="mx-4 rounded-2xl overflow-hidden bg-white dark:bg-firefly-900 divide-y divide-gray-100 dark:divide-firefly-800">
            <div
                v-if="uncheckedItems.length === 0 && checkedItems.length === 0"
                class="px-4 py-8 text-center text-gray-400 dark:text-gray-500 text-sm"
            >
                No items
            </div>

            <div
                v-for="item in uncheckedItems"
                :key="item.id"
                @click="toggle(item.id!)"
                class="flex items-center gap-3 px-4 py-3 cursor-pointer active:bg-gray-50 dark:active:bg-firefly-800 select-none"
            >
                <!-- Empty circle -->
                <div class="shrink-0 w-6 h-6 rounded-full border-2 border-gray-300 dark:border-firefly-600"></div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                    <div class="flex items-baseline gap-1.5 flex-wrap">
                        <span class="font-medium text-gray-900 dark:text-white">
                            {{ item.quantity ? `${item.quantity} ` : '' }}{{ item.product }}
                        </span>
                        <span v-if="item.brand" class="text-sm text-gray-500 dark:text-gray-400">
                            {{ item.brand }}
                        </span>
                    </div>
                    <p v-if="item.comments" class="text-sm text-gray-400 dark:text-gray-500 truncate">
                        {{ item.comments }}
                    </p>
                </div>

                <span
                    v-if="item.isNonessential"
                    class="shrink-0 text-xs px-2 py-0.5 rounded-full bg-damask-100 text-damask-700"
                >
                    Nice-to-have
                </span>
            </div>
        </div>

        <!-- Checked items -->
        <div v-if="checkedItems.length > 0" class="mx-4 mt-3 rounded-2xl overflow-hidden bg-white dark:bg-firefly-900 divide-y divide-gray-100 dark:divide-firefly-800">
            <div class="px-4 py-2">
                <span class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                    Checked off
                </span>
            </div>
            <div
                v-for="item in checkedItems"
                :key="item.id"
                @click="toggle(item.id!)"
                class="flex items-center gap-3 px-4 py-3 cursor-pointer active:bg-gray-50 dark:active:bg-firefly-800 select-none"
            >
                <!-- Filled circle with checkmark -->
                <div class="shrink-0 w-6 h-6 rounded-full bg-firefly-500 flex items-center justify-center">
                    <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <span class="flex-1 text-gray-400 dark:text-gray-600 line-through text-sm">
                    {{ item.product }}
                </span>
            </div>
        </div>

        <div class="h-4"></div>
    </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
