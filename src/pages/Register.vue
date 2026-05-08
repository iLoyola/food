<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import FullAlerts from '../components/FullAlerts.vue'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const isSignIn = ref(true)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

function toggleMode() {
    isSignIn.value = !isSignIn.value
    errorMessage.value = ''
    successMessage.value = ''
}

async function submit() {
    errorMessage.value = ''
    successMessage.value = ''
    loading.value = true
    try {
        if (isSignIn.value) {
            await authStore.signIn(email.value, password.value)
            router.push({ name: 'shopping' })
        } else {
            await authStore.signUp(email.value, password.value)
            successMessage.value = 'Account created! Check your email to confirm your address before signing in.'
            password.value = ''
        }
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

                <h1 class="text-2xl text-gray-900 dark:text-white mb-6">
                    {{ isSignIn ? 'Sign in' : 'Create account' }}
                </h1>

                <FullAlerts v-if="errorMessage" type="error" :message="errorMessage" class="mb-4" />
                <FullAlerts v-if="successMessage" type="success" :message="successMessage" class="mb-4" />

                <!-- Email -->
                <div class="mb-4">
                    <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Email address
                    </label>
                    <input
                        id="email"
                        v-model="email"
                        type="email"
                        autocomplete="email"
                        placeholder="you@example.com"
                        class="w-full rounded-xl border border-gray-200 dark:border-firefly-700 bg-gray-50 dark:bg-firefly-950 text-gray-900 dark:text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-firefly-400"
                    />
                </div>

                <!-- Password -->
                <div class="mb-6">
                    <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Password
                    </label>
                    <input
                        id="password"
                        v-model="password"
                        type="password"
                        autocomplete="current-password"
                        placeholder="••••••••"
                        class="w-full rounded-xl border border-gray-200 dark:border-firefly-700 bg-gray-50 dark:bg-firefly-950 text-gray-900 dark:text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-firefly-400"
                    />
                </div>

                <!-- Primary action -->
                <button
                    type="button"
                    @click="submit"
                    :disabled="loading"
                    class="w-full py-2.5 rounded-xl bg-damask-500 hover:bg-damask-600 text-white text-sm font-medium transition-colors disabled:opacity-50 mb-3"
                >
                    <span v-if="loading">Please wait…</span>
                    <span v-else>{{ isSignIn ? 'Sign in' : 'Create account' }}</span>
                </button>


            </div>

            <!-- Toggle mode -->
            <p class="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
                {{ isSignIn ? "Don't have an account?" : 'Already have an account?' }}
                <button @click="toggleMode" class="text-damask-500 hover:underline ml-1 font-medium">
                    {{ isSignIn ? 'Create one' : 'Sign in instead' }}
                </button>
            </p>

        </div>
    </div>
</template>
