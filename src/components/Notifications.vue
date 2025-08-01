<template>
    <div
        class="notification hidden flex items-center p-4 mb-4 text-sm rounded-lg dark:bg-gray-800"
        :class="[
            type === 'error' ? 'notification--error' : null,
            type === 'success' ? 'notification--success' : null,
            type === 'info' ? 'notification--info ' : null,
            message && message.length > 0 ? 'notification--slide' : null,
        ]"
        role="alert"
    >
        <svg v-if="type === 'error'" id="icon-alert-octagon" viewBox="0 0 24 24" class="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
            <path d="M7.86 1c-0.256 0-0.512 0.098-0.707 0.293l-5.86 5.86c-0.181 0.181-0.293 0.431-0.293 0.707v8.28c0 0.256 0.098 0.512 0.293 0.707l5.86 5.86c0.181 0.181 0.431 0.293 0.707 0.293h8.28c0.256 0 0.512-0.098 0.707-0.293l5.86-5.86c0.181-0.181 0.293-0.431 0.293-0.707v-8.28c0-0.256-0.098-0.512-0.293-0.707l-5.86-5.86c-0.181-0.181-0.431-0.293-0.707-0.293zM8.274 3h7.452l5.274 5.274v7.452l-5.274 5.274h-7.452l-5.274-5.274v-7.452zM11 8v4c0 0.552 0.448 1 1 1s1-0.448 1-1v-4c0-0.552-0.448-1-1-1s-1 0.448-1 1zM12 17c0.552 0 1-0.448 1-1s-0.448-1-1-1-1 0.448-1 1 0.448 1 1 1z"></path>
        </svg>
        <svg v-if="type === 'success'" id="icon-alert-circle" viewBox="0 0 24 24" class="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
            <path d="M23 12c0-3.037-1.232-5.789-3.222-7.778s-4.741-3.222-7.778-3.222-5.789 1.232-7.778 3.222-3.222 4.741-3.222 7.778 1.232 5.789 3.222 7.778 4.741 3.222 7.778 3.222 5.789-1.232 7.778-3.222 3.222-4.741 3.222-7.778zM21 12c0 2.486-1.006 4.734-2.636 6.364s-3.878 2.636-6.364 2.636-4.734-1.006-6.364-2.636-2.636-3.878-2.636-6.364 1.006-4.734 2.636-6.364 3.878-2.636 6.364-2.636 4.734 1.006 6.364 2.636 2.636 3.878 2.636 6.364zM11 8v4c0 0.552 0.448 1 1 1s1-0.448 1-1v-4c0-0.552-0.448-1-1-1s-1 0.448-1 1zM12 17c0.552 0 1-0.448 1-1s-0.448-1-1-1-1 0.448-1 1 0.448 1 1 1z"></path>
        </svg>
        <svg v-if="type === 'info'" id="icon-alert-triangle" viewBox="0 0 24 24" class="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
            <path d="M11.148 4.374c0.073-0.123 0.185-0.242 0.334-0.332 0.236-0.143 0.506-0.178 0.756-0.116s0.474 0.216 0.614 0.448l8.466 14.133c0.070 0.12 0.119 0.268 0.128 0.434-0.015 0.368-0.119 0.591-0.283 0.759-0.18 0.184-0.427 0.298-0.693 0.301l-16.937-0.001c-0.152-0.001-0.321-0.041-0.481-0.134-0.239-0.138-0.399-0.359-0.466-0.607s-0.038-0.519 0.092-0.745zM9.432 3.346l-8.47 14.14c-0.422 0.731-0.506 1.55-0.308 2.29s0.68 1.408 1.398 1.822c0.464 0.268 0.976 0.4 1.475 0.402h16.943c0.839-0.009 1.587-0.354 2.123-0.902s0.864-1.303 0.855-2.131c-0.006-0.536-0.153-1.044-0.406-1.474l-8.474-14.147c-0.432-0.713-1.11-1.181-1.854-1.363s-1.561-0.081-2.269 0.349c-0.429 0.26-0.775 0.615-1.012 1.014zM11 9v4c0 0.552 0.448 1 1 1s1-0.448 1-1v-4c0-0.552-0.448-1-1-1s-1 0.448-1 1zM12 18c0.552 0 1-0.448 1-1s-0.448-1-1-1-1 0.448-1 1 0.448 1 1 1z"></path>
        </svg>
        <span class="sr-only">Alert {{ type }}</span>
        <p class="notification__text">
            {{ message }}
        </p>
        <button
            @click="$emit('clear-notification')"
            type="button"
            ref="closeButton"
            class="notification__button ms-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 p-1.5 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
            <span class="sr-only">Close {{ type }} Alert</span>
            <svg id="icon-x" class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"  viewBox="0 0 24 24">
                <path stroke="currentColor" d="M5.293 6.707l5.293 5.293-5.293 5.293c-0.391 0.391-0.391 1.024 0 1.414s1.024 0.391 1.414 0l5.293-5.293 5.293 5.293c0.391 0.391 1.024 0.391 1.414 0s0.391-1.024 0-1.414l-5.293-5.293 5.293-5.293c0.391-0.391 0.391-1.024 0-1.414s-1.024-0.391-1.414 0l-5.293 5.293-5.293-5.293c-0.391-0.391-1.024-0.391-1.414 0s-0.391 1.024 0 1.414z"></path>
            </svg>
        </button>
    </div>
</template>
<script>
  export default {
    name: "Notification",
    emits: ['clear-notification'],
    props: {
      type: {
        type: String,
        default: null,
      },
      message: {
        type: String,
        default: null,
      },
    },
  };
</script>

<style>
.notification {
    transition: all 900ms ease-out;
    transform: translateY(-100vh);
    opacity: 0;
}

.notification--slide {
    transform: translateY(0px);
    opacity: 1;
}
</style>