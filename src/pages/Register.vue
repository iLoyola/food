<template>
    <div class="heading w-full mb-1">
        <h1 class="text-5xl font-extrabold dark:text-white m-4">{{ isSignIn ? 'Sign In' : 'Create Account' }}</h1>
    </div>

    <div v-if="successMessage" class="mx-4 mb-4 p-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400">
        {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="mx-4 mb-4 p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400">
        {{ errorMessage }}
    </div>

    <div class="mb-4">
        <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Email Address
        </label>
        <input
            v-model="email"
            type="text"
            placeholder="Email"
            name="email"
            id="email"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />
    </div>
    <div class="mb-4">
        <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Password
        </label>
        <input
            v-model="password"
            type="password"
            placeholder="Password"
            name="password"
            id="password"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />
    </div>

    <div class="flex justify-around mt-12 mb-4">
        <button
            @click="submit"
            type="button"
            :disabled="loading"
            class="w-48 text-white bg-damask-500 hover:bg-damask-700 focus:ring-4 focus:ring-damask-200 font-medium rounded-lg text-md px-5 py-2.5 me-2 mb-2 dark:bg-damask-600 dark:hover:bg-damask-500 focus:outline-none dark:focus:ring-damask-900 text-center disabled:opacity-50"
        >
            {{ isSignIn ? 'Sign In' : 'Create Account' }}
        </button>
        <button
            @click="signInWithGoogle"
            type="button"
            :disabled="loading"
            class="w-48 text-white bg-damask-500 hover:bg-damask-700 focus:ring-4 focus:ring-damask-200 font-medium rounded-lg text-md px-5 py-2.5 me-2 mb-2 dark:bg-damask-600 dark:hover:bg-damask-500 focus:outline-none dark:focus:ring-damask-900 text-center disabled:opacity-50"
        >
            Sign in with Google
        </button>
    </div>

    <p class="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
        {{ isSignIn ? "Don't have an account?" : 'Already have an account?' }}
        <button @click="toggleMode" class="text-damask-500 hover:underline ml-1">
            {{ isSignIn ? 'Create one' : 'Sign in instead' }}
        </button>
    </p>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

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
            router.push({ name: 'home' })
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

async function signInWithGoogle() {
    errorMessage.value = ''
    try {
        await authStore.signInWithGoogle()
        // Supabase handles the redirect — no router.push needed here
    } catch (e: any) {
        errorMessage.value = e.message
    }
}
</script>
