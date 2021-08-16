<script lang="ts" setup>
import initHotseatGame from '@/controllers/Hotseat'
import { useRouter } from 'vue-router'

const router = useRouter()

const runHotseat = () => {
	initHotseatGame()
	router.push({ name: 'Board' })
}
</script>

<template>
	<h3>How do you wanna play?</h3>
	<nav>
		<Button :to="{ name: 'Online' }" class="btn">Online</Button>
		<!-- <router-link :to="{ name: 'Board' }" class="btn">Hotseat</router-link> -->
		<Button @click="runHotseat">Hotseat</Button>
		<!-- <button>vs AI</button> -->
	</nav>
</template>

<style lang="postcss" scoped>
h3 {
	@apply mb-3;
}
nav {
	@apply flex flex-col space-y-6;
}
</style>
