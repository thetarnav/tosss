<script lang="ts" setup>
import OnlineGame from '@/modules/roomController'
import useSocket from '@/modules/socket'
import { debouncedWatch } from '@vueuse/core'
import clipboardCopy from 'copy-to-clipboard-ultralight'

const { createRoom, changeName } = useSocket()

const username = ref('Random name'),
	room = ref<OnlineGame>()

debouncedWatch(username, changeName, { debounce: 1000 })

async function makeNewGame() {
	const result = await createRoom()
	room.value = result
}
</script>

<template>
	<p>What's your name?</p>
	<input type="text" v-model="username" />
	<p class="form-warning"></p>

	<div v-if="!room" class="actions">
		<button>JOIN</button>
		<button @click="makeNewGame">CREATE NEW GAME</button>
	</div>

	<div v-if="room" class="room-link">
		<p>ROOM ID: {{ room.id }}</p>
		<button @click="() => clipboardCopy(room?.link)">Copy Invite Link</button>
	</div>
</template>

<style lang="postcss" scoped>
.actions {
	@apply mt-6 space-x-3;
}
</style>
