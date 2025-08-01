<script setup lang="ts">
// router
import { useRoute, useRouter } from 'vue-router'

// stores
import { useAppStore } from '../stores/app.js'

const appStore = useAppStore()

const route = useRoute()
const router = useRouter()

function gotoLink(path:string) {
    if (path === '/') appStore.atHome = true
    router.push({ path: path })
}

</script>

<template>
<nav class="w-full flex" aria-label="Breadcrumb">
  <ol class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
    <li class="inline-flex items-center">
      <button @click="gotoLink('/')" class="inline-flex items-center text-md font-medium text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg p-2.5">
        <svg id="icon-home" viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-5 h-5 me-2.5">
            <path d="M2.386 8.211c-0.236 0.184-0.386 0.469-0.386 0.789v11c0 0.828 0.337 1.58 0.879 2.121s1.293 0.879 2.121 0.879h14c0.828 0 1.58-0.337 2.121-0.879s0.879-1.293 0.879-2.121v-11c-0.001-0.3-0.134-0.593-0.386-0.789l-9-7c-0.358-0.275-0.861-0.285-1.228 0zM16 21v-9c0-0.552-0.448-1-1-1h-6c-0.552 0-1 0.448-1 1v9h-3c-0.276 0-0.525-0.111-0.707-0.293s-0.293-0.431-0.293-0.707v-10.511l8-6.222 8 6.222v10.511c0 0.276-0.111 0.525-0.293 0.707s-0.431 0.293-0.707 0.293zM10 21v-8h4v8z"></path>
        </svg>
        Home
      </button>
    </li>
    <template v-if="route.matched.length > 1">
        <li v-for="(r, i) in route.matched" :aria-current="'page'" class="inline-flex items-center">
            <svg v-if="i !== 0" id="icon-chevron-right" viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-5 h-5 text-gray-500 dark:text-white mx-1">
                <path d="M9.707 18.707l6-6c0.391-0.391 0.391-1.024 0-1.414l-6-6c-0.391-0.391-1.024-0.391-1.414 0s-0.391 1.024 0 1.414l5.293 5.293-5.293 5.293c-0.391 0.391-0.391 1.024 0 1.414s1.024 0.391 1.414 0z"></path>
            </svg>
            <button v-if="i !== 0" @click="gotoLink(r.path)" class="text-gray-500 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-md capitalize p-2.5" p-2.5>{{ r.meta.breadcrumb }}</button>
        </li>
    </template>
  </ol>
</nav>
</template>