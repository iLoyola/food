<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase/client.js'
import FullAlerts from '../components/FullAlerts.vue'

const router = useRouter()
const password = ref('')
const confirm = ref('')
const loading = ref(false)
const errorMessage = ref('')

async function submit() {
    errorMessage.value = ''
    if (password.value.length < 8) {
        errorMessage.value = 'Password must be at least 8 characters.'
        return
    }
    if (password.value !== confirm.value) {
        errorMessage.value = 'Passwords do not match.'
        return
    }
    loading.value = true
    try {
        const { error } = await supabase.auth.updateUser({ password: password.value })
        if (error) throw error
        router.push({ name: 'shopping' })
    } catch (e: any) {
        errorMessage.value = e.message
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="min-h-[80vh] flex items-center justify-center px-4">
        <div class="w-full max-w-sm">

            <!-- Logo -->
            <div class="flex justify-center mb-8">
                <img src="@/assets/svg/iloyola-logo-light-w300.svg" class="h-8 dark:hidden" alt="iLoyola" />
                <img src="@/assets/svg/iloyola-logo-dark-nobg.svg" class="h-8 hidden dark:block" alt="iLoyola" />
            </div>

            <!-- Card -->
            <div class="bg-white dark:bg-firefly-900 rounded-2xl p-6 shadow-sm">

                <h1 class="text-2xl text-gray-900 dark:text-white mb-1">Set your password</h1>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Choose a password to finish setting up your account.
                </p>

                <FullAlerts v-if="errorMessage" type="error" :message="errorMessage" class="mb-4" />

                <form @submit.prevent="submit">
                    <div class="mb-4">
                        <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Password
                        </label>
                        <input
                            id="password"
                            v-model="password"
                            type="password"
                            autocomplete="new-password"
                            placeholder="Min. 8 characters"
                            class="w-full rounded-xl border border-gray-200 dark:border-firefly-700 bg-gray-50 dark:bg-firefly-950 text-gray-900 dark:text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-firefly-400"
                        />
                    </div>

                    <div class="mb-6">
                        <label for="confirm" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Confirm password
                        </label>
                        <input
                            id="confirm"
                            v-model="confirm"
                            type="password"
                            autocomplete="new-password"
                            placeholder="••••••••"
                            class="w-full rounded-xl border border-gray-200 dark:border-firefly-700 bg-gray-50 dark:bg-firefly-950 text-gray-900 dark:text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-firefly-400"
                        />
                    </div>

                    <button
                        type="submit"
                        :disabled="loading"
                        class="w-full py-2.5 rounded-xl bg-damask-500 hover:bg-damask-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        <span v-if="loading">Setting password…</span>
                        <span v-else>Set password &amp; sign in</span>
                    </button>
                </form>

            </div>
        </div>
    </div>
</template>
