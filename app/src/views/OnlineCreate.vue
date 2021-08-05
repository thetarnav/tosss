<script lang="ts" setup>
import clipboardCopy from 'copy-to-clipboard-ultralight'
import OnlineRoom from '@/store/onlineRoom'
import { useRouter } from 'vue-router'
import TypeUsername from '@/components/TypeUsername.vue'

const router = useRouter()

const username = computed({
	get: () => OnlineRoom.instance.state.username,
	set: v => OnlineRoom.instance.rename(v),
})
const { roomID } = OnlineRoom.instance.refs

const link = ref<string>()

async function makeNewGame() {
	try {
		link.value = await OnlineRoom.instance.createRoom()
	} catch (e) {
		console.error(e)
		router.push('/')
	}
}
</script>

<template>
	<TypeUsername v-model="username" />

	<div v-if="!link" class="actions">
		<button>JOIN</button>
		<button @click="makeNewGame">CREATE NEW GAME</button>
	</div>

	<div v-if="link" class="room-link">
		<p>ROOM ID: {{ roomID }}</p>
		<button @click="() => clipboardCopy(link)">Copy Invite Link</button>
	</div>
</template>

<style lang="postcss" scoped>
.actions {
	@apply mt-6 space-x-3;
}
</style>
