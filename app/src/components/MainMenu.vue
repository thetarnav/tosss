<script lang="ts" setup>
import initHotseatGame from '@/views/Board/controllers/Hotseat'
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
		<router-link :to="{ name: 'Online' }" class="btn">Online</router-link>
		<!-- <router-link :to="{ name: 'Board' }" class="btn">Hotseat</router-link> -->
		<button @click="runHotseat">Hotseat</button>
		<button>vs AI</button>
	</nav>
</template>

<style lang="postcss" scoped>
h3 {
	@apply mb-3;
}
nav {
	@apply flex flex-col space-y-3;
}
</style>
