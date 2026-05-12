<template>
    <div class="max-w-3xl mx-auto px-4 pt-6">
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Account</h1>

        <div class="bg-white dark:bg-firefly-900 rounded-2xl divide-y divide-gray-100 dark:divide-firefly-800">
            <div class="px-4 py-4 flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-firefly-100 dark:bg-firefly-800 flex items-center justify-center">
                    <svg class="w-5 h-5 text-firefly-600 dark:text-firefly-300" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">{{ authStore.user?.email }}</p>
                    <p class="text-xs text-gray-600 dark:text-gray-400">Signed in</p>
                </div>
            </div>

            <!-- Change password row -->
            <div v-if="!showPasswordForm" class="px-4 py-3">
                <button
                    type="button"
                    @click="showPasswordForm = true"
                    class="text-sm text-firefly-500 font-medium hover:text-firefly-600 transition-colors"
                >
                    Change password
                </button>
            </div>

            <!-- Change password form -->
            <div v-else class="px-4 py-4 space-y-3">
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Change password</p>

                <FullAlerts v-if="passwordError" type="error" :message="passwordError" />
                <FullAlerts v-if="passwordSuccess" type="success" :message="passwordSuccess" />

                <input
                    v-model="newPassword"
                    type="password"
                    placeholder="New password (min. 8 characters)"
                    autocomplete="new-password"
                    class="w-full rounded-xl border border-gray-200 dark:border-firefly-700 bg-gray-50 dark:bg-firefly-950 text-gray-900 dark:text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-firefly-400"
                    @keydown.enter="changePassword"
                />
                <input
                    v-model="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    autocomplete="new-password"
                    class="w-full rounded-xl border border-gray-200 dark:border-firefly-700 bg-gray-50 dark:bg-firefly-950 text-gray-900 dark:text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-firefly-400"
                    @keydown.enter="changePassword"
                />
                <div class="flex gap-2 pt-1">
                    <button
                        type="button"
                        @click="changePassword"
                        :disabled="passwordLoading"
                        class="px-4 py-2 rounded-xl bg-firefly-500 hover:bg-firefly-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        {{ passwordLoading ? 'Saving…' : 'Save password' }}
                    </button>
                    <button
                        type="button"
                        @click="cancelPasswordChange"
                        class="px-4 py-2 rounded-xl border border-gray-200 dark:border-firefly-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-firefly-800 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>

        <!-- Admin -->
        <div class="mt-6 bg-white dark:bg-firefly-900 rounded-2xl divide-y divide-gray-100 dark:divide-firefly-800">
            <div class="px-4 py-3">
                <p class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest">Admin</p>
            </div>
            <router-link
                to="/admin/marketplaces"
                class="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-firefly-800 transition-colors"
            >
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-firefly-50 dark:bg-firefly-800 flex items-center justify-center">
                        <svg class="w-4 h-4 text-firefly-600 dark:text-firefly-400" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">Manage Marketplaces</span>
                </div>
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            </router-link>
            <router-link
                to="/admin/recipes"
                class="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-firefly-800 transition-colors"
            >
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-firefly-50 dark:bg-firefly-800 flex items-center justify-center">
                        <svg class="w-4 h-4 text-firefly-600 dark:text-firefly-400" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">Manage Recipes</span>
                </div>
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            </router-link>
        </div>

        <div class="mt-6">
            <button
                @click="signOut"
                type="button"
                class="w-full py-3 rounded-2xl bg-gray-100 dark:bg-firefly-900 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-200 dark:hover:bg-firefly-800 transition-colors"
            >
                Sign Out
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { supabase } from '../supabase/client.js'
import FullAlerts from '../components/FullAlerts.vue'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => { document.title = 'Account | iLoyola' })

const showPasswordForm = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const passwordLoading = ref(false)
const passwordError = ref('')
const passwordSuccess = ref('')

async function signOut() {
    await authStore.signOut()
    router.push({ name: 'register' })
}

async function changePassword() {
    passwordError.value = ''
    passwordSuccess.value = ''
    if (newPassword.value.length < 8) {
        passwordError.value = 'Password must be at least 8 characters.'
        return
    }
    if (newPassword.value !== confirmPassword.value) {
        passwordError.value = 'Passwords do not match.'
        return
    }
    passwordLoading.value = true
    try {
        const { error } = await supabase.auth.updateUser({ password: newPassword.value })
        if (error) throw error
        passwordSuccess.value = 'Password updated successfully.'
        newPassword.value = ''
        confirmPassword.value = ''
        setTimeout(() => {
            showPasswordForm.value = false
            passwordSuccess.value = ''
        }, 2000)
    } catch (e: any) {
        passwordError.value = e.message
    } finally {
        passwordLoading.value = false
    }
}

function cancelPasswordChange() {
    showPasswordForm.value = false
    newPassword.value = ''
    confirmPassword.value = ''
    passwordError.value = ''
    passwordSuccess.value = ''
}
</script>
