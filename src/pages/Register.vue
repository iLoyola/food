<template>
    <div class="heading w-full mb-1">
        <h1 class="text-5xl font-extrabold dark:text-white m-4">Create Account</h1>
    </div>
    <div class="mb-4">
        <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Email Address
        </label>
        <input type="text" placeholder="Email" name="email" id="email" v-model="email" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
    </div>
    <div class="mb-4">
        <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Password
        </label>
        <input type="password" placeholder="Password" name="password" id="password" v-model="password" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
    </div>
    <div class="flex justify-around mt-12 mb-4">
        <button class="w-48 text-white bg-damask-500 hover:bg-damask-700 focus:ring-4 focus:ring-damask-200 font-medium rounded-lg text-md px-5 py-2.5 me-2 mb-2 dark:bg-damask-600 dark:hover:bg-damask-500 focus:outline-none dark:focus:ring-damask-900 text-center" type="button" @click="register">Submit</button>
        <button class="w-48 text-white bg-damask-500 hover:bg-damask-700 focus:ring-4 focus:ring-damask-200 font-medium rounded-lg text-md px-5 py-2.5 me-2 mb-2 dark:bg-damask-600 dark:hover:bg-damask-500 focus:outline-none dark:focus:ring-damask-900 text-center" type="button" @click="signInWithGoogle">Sign in with Google</button>
    </div>
</template>

<script setup lang="ts">
// vue
import { ref } from 'vue'

// firebase
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'

const email = ref<string>('')
const password = ref<string>('')

const register = () => {
    const auth = getAuth()
    createUserWithEmailAndPassword(auth, email.value, password.value)
    .then((data) => {
        console.log({data});
        console.log('current user: ', auth.currentUser);

    })
    .catch((error) => {
        console.log({error});

    })
}

const signInWithGoogle = () => {

}
</script>