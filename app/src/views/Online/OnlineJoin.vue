<script lang="ts" setup>
import TypeUsername from '@/components/TypeUsername.vue'
import { useRoute, useRouter } from 'vue-router'
import ROOM from '@/modules/OnlineRoom'
import { onMounted } from 'vue-demi'

const route = useRoute()
const router = useRouter()

const { roomID } = route.params

const username = computed({
	get: () => ROOM.instance.state.username,
	set: v => ROOM.instance.rename(v),
})

const { role } = ROOM.instance.refs

onMounted(async () => {
	if (typeof roomID !== 'string') router.push('/')
	else {
		try {
			await ROOM.instance.joinRoom(roomID)
		} catch (error) {
			console.error(error)
			router.push('/')
		}
	}
})
</script>

<template>
	<TypeUsername v-model="username" />
	<button
		v-if="role === 'opponent'"
		@click="() => ROOM.instance.startPlaying()"
	>
		Begin!
	</button>
</template>

<style lang="postcss"></style>
