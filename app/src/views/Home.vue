<script lang="ts" setup>
import MainMenu from '@/components/MainMenu.vue'

const showMenu = ref(false)
</script>

<template>
	<button v-if="!showMenu" @click="showMenu = true">Play</button>
	<MainMenu v-else />
</template>

<style lang="postcss"></style>
