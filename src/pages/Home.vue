<template>
    <div class="flex justify-center">
        <div
            class="w-full card-shadow rounded-2xl h-96 border-card-border-color overflow-hidden card-background-color">
            <div class="p-4 pt-0 overflow-y-scroll">
                <div class="space-y-2 flex flex-col">
                    <router-link to="/recipes" type="button"
                        class="il-recipes-btn rounded-lg p-3 pb-4 pl-5 relative overflow-hidden text-center font-bold text-firefly-800 bg-firefly-200">
                        <div class="absolute w-1.5 top-0 bottom-0 left-0 bg-firefly-800"></div>
                        Recipes
                    </router-link>
                    <router-link to="/shopping" type="button"
                        class="il-shopping-btn rounded-lg p-3 pb-4 pl-5 relative overflow-hidden text-center font-bold text-firefly-800 bg-firefly-200">
                        <div class="absolute w-1.5 top-0 bottom-0 left-0 bg-firefly-800"></div>
                        Shopping
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

</script>

<style>
.il-recipes-btn {
    background-image: url('../assets/svg/bowl.svg');
    background-repeat: no-repeat;
    background-size: 160%;
    background-position: -2% 2.3%;
}

.il-shopping-btn {
    background-image: url('../assets/svg/shop.svg');
    background-repeat: no-repeat;
    background-size: 160%;
    background-position: -137% 1.3%;
}
</style>