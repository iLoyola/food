<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMarketplacesStore } from '../../stores/marketplaces.js'

const store = useMarketplacesStore()

const newName = ref('')
const adding = ref(false)
const editingId = ref<string | null>(null)
const editingName = ref('')
const savingId = ref<string | null>(null)
const confirmDeleteId = ref<string | null>(null)
const deleting = ref(false)

onMounted(() => store.fetchAllMarketplaces())

async function addMarketplace() {
    if (!newName.value.trim()) return
    adding.value = true
    try {
        await store.addMarketplace(newName.value)
        newName.value = ''
    } catch {
    } finally {
        adding.value = false
    }
}

function startEdit(id: string, name: string) {
    editingId.value = id
    editingName.value = name
    confirmDeleteId.value = null
}

function cancelEdit() {
    editingId.value = null
    editingName.value = ''
}

async function saveEdit(id: string) {
    if (!editingName.value.trim()) return
    savingId.value = id
    try {
        await store.updateMarketplace(id, editingName.value)
        editingId.value = null
    } catch {
    } finally {
        savingId.value = null
    }
}

function startDelete(id: string) {
    confirmDeleteId.value = id
    editingId.value = null
}

async function executeDelete(id: string) {
    deleting.value = true
    try {
        await store.deleteMarketplace(id)
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
            <span class="text-gray-700 dark:text-gray-300 font-medium">Marketplaces</span>
        </nav>

        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Manage Marketplaces</h1>

        <!-- Add form -->
        <div class="bg-white dark:bg-firefly-900 rounded-2xl p-4 mb-4">
            <h2 class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                Add marketplace
            </h2>
            <div class="flex gap-2">
                <input
                    v-model="newName"
                    @keydown.enter="addMarketplace"
                    type="text"
                    placeholder="e.g. Costco"
                    class="flex-1 rounded-xl border border-gray-200 dark:border-firefly-700 bg-gray-50 dark:bg-firefly-950 text-gray-900 dark:text-white px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-firefly-400"
                />
                <button
                    type="button"
                    @click="addMarketplace"
                    :disabled="adding || !newName.trim()"
                    class="px-4 py-2.5 rounded-xl bg-firefly-500 hover:bg-firefly-600 text-white text-sm font-medium transition-colors disabled:opacity-50 shrink-0"
                >
                    {{ adding ? 'Adding…' : 'Add' }}
                </button>
            </div>
        </div>

        <!-- Marketplace list -->
        <div class="bg-white dark:bg-firefly-900 rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-firefly-800">

            <div
                v-if="store.adminMarketplaces.length === 0"
                class="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500"
            >
                No marketplaces yet. Add one above.
            </div>

            <div v-for="mp in store.adminMarketplaces" :key="mp.id">

                <!-- Normal row -->
                <div
                    v-if="editingId !== mp.id && confirmDeleteId !== mp.id"
                    class="flex items-center gap-3 px-4 py-3"
                >
                    <div class="flex-1 min-w-0">
                        <p
                            class="text-sm font-medium text-gray-900 dark:text-white transition-opacity"
                            :class="!mp.isEnabled ? 'opacity-40' : ''"
                        >
                            {{ mp.name }}
                        </p>
                        <p class="text-xs text-gray-400 dark:text-gray-500">
                            {{ mp.itemCount }} {{ mp.itemCount === 1 ? 'item' : 'items' }} linked
                        </p>
                    </div>

                    <!-- Enable / disable toggle -->
                    <button
                        type="button"
                        role="switch"
                        :aria-checked="mp.isEnabled"
                        @click="store.setMarketplaceEnabled(mp.id, !mp.isEnabled)"
                        :class="mp.isEnabled ? 'bg-firefly-500' : 'bg-gray-200 dark:bg-firefly-700'"
                        class="relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors"
                        :aria-label="mp.isEnabled ? 'Disable marketplace' : 'Enable marketplace'"
                    >
                        <span
                            :class="mp.isEnabled ? 'translate-x-5' : 'translate-x-0.5'"
                            class="inline-block h-5 w-5 mt-0.5 rounded-full bg-white shadow transform transition-transform"
                        />
                    </button>

                    <!-- Edit -->
                    <button
                        type="button"
                        @click="startEdit(mp.id, mp.name)"
                        class="p-1.5 text-gray-400 hover:text-firefly-500 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-firefly-800"
                        aria-label="Edit marketplace"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
                        </svg>
                    </button>

                    <!-- Delete -->
                    <button
                        type="button"
                        @click="startDelete(mp.id)"
                        class="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-firefly-800"
                        aria-label="Delete marketplace"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>

                <!-- Inline edit row -->
                <div
                    v-else-if="editingId === mp.id"
                    class="flex items-center gap-2 px-4 py-3"
                >
                    <input
                        v-model="editingName"
                        @keydown.enter="saveEdit(mp.id)"
                        @keydown.escape="cancelEdit"
                        type="text"
                        autofocus
                        class="flex-1 rounded-xl border border-firefly-400 bg-gray-50 dark:bg-firefly-950 text-gray-900 dark:text-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-firefly-400"
                    />
                    <button
                        type="button"
                        @click="saveEdit(mp.id)"
                        :disabled="savingId === mp.id || !editingName.trim()"
                        class="px-3 py-2 rounded-xl bg-firefly-500 hover:bg-firefly-600 text-white text-xs font-medium transition-colors disabled:opacity-50 shrink-0"
                    >
                        {{ savingId === mp.id ? 'Saving…' : 'Save' }}
                    </button>
                    <button
                        type="button"
                        @click="cancelEdit"
                        class="px-3 py-2 rounded-xl border border-gray-200 dark:border-firefly-700 text-gray-600 dark:text-gray-300 text-xs font-medium hover:bg-gray-50 dark:hover:bg-firefly-800 transition-colors shrink-0"
                    >
                        Cancel
                    </button>
                </div>

                <!-- Delete confirm row -->
                <div
                    v-else-if="confirmDeleteId === mp.id"
                    class="px-4 py-3 bg-red-50 dark:bg-firefly-950"
                >
                    <p class="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                        Delete "{{ mp.name }}"?
                    </p>
                    <p v-if="mp.itemCount > 0" class="text-xs text-red-500 dark:text-red-400 mb-3">
                        This will unlink {{ mp.itemCount }} {{ mp.itemCount === 1 ? 'item' : 'items' }}. This cannot be undone.
                    </p>
                    <p v-else class="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        This cannot be undone.
                    </p>
                    <div class="flex gap-2">
                        <button
                            type="button"
                            @click="executeDelete(mp.id)"
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
