<script lang="ts" setup>
import { createRoom } from '@/modules/socket'

const username = ref('Random name'),
	roomID = ref('')

function handleSubmit() {
	createRoom(username.value)
}
</script>

<template>
	<p>What's your name?</p>
	<form @submit.prevent="handleSubmit">
		<input type="text" v-model="username" />
		<button type="submit">Enter</button>
	</form>
	<p class="form-warning"></p>
</template>

<style lang="postcss"></style>
