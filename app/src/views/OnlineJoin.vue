<script lang="ts" setup>
import TypeUsername from '@/components/TypeUsername.vue'
import { useRoute, useRouter } from 'vue-router'
import OnlineRoom from '@/store/onlineRoom'
import { onMounted } from 'vue-demi'

const route = useRoute()
const router = useRouter()

const { roomID } = route.params,
	joinedRoom = ref(false)

const username = computed({
	get: () => OnlineRoom.instance.state.username,
	set: v => OnlineRoom.instance.rename(v),
})

onMounted(async () => {
	if (typeof roomID !== 'string') router.push('/')
	else {
		try {
			await OnlineRoom.instance.joinRoom(roomID)
			joinedRoom.value = true
		} catch (error) {
			console.error(error)
			router.push('/')
		}
	}
})
</script>

<template>
	<TypeUsername v-model="username" />
	<div v-if="joinedRoom" class="play-group">
		<p>ROOM ID: {{ roomID }}</p>
		<button>Play</button>
	</div>
</template>

<style lang="postcss"></style>
