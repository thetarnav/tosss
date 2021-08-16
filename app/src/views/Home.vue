<script lang="ts" setup>
import MainMenu from '@/components/MainMenu.vue'

const showMenu = ref(false)
</script>

<template>
	<Button v-if="!showMenu" @click="showMenu = true">Play</Button>
	<MainMenu v-else />
</template>

<style lang="postcss"></style>
