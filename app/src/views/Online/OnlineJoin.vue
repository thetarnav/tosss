<script lang="ts" setup>
import TypeUsername from '@/components/TypeUsername.vue'
import { useRoute, useRouter } from 'vue-router'
import ROOM from '@/modules/OnlineRoom'
import { onMounted } from 'vue-demi'

const route = useRoute()
const router = useRouter()

const { roomID } = route.params,
	joinedRoom = ref(false)

const username = computed({
	get: () => ROOM.instance.state.username,
	set: v => ROOM.instance.rename(v),
})

onMounted(async () => {
	if (typeof roomID !== 'string') router.push('/')
	else {
		try {
			await ROOM.instance.joinRoom(roomID)
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
	<button>Play</button>
</template>

<style lang="postcss"></style>
