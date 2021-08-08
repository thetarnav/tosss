<script lang="ts" setup>
import clipboardCopy from 'copy-to-clipboard-ultralight'
import ROOM from '@/modules/OnlineRoom'
import { useRouter } from 'vue-router'
import TypeUsername from '@/components/TypeUsername.vue'
import { onMounted } from 'vue-demi'

const router = useRouter()

const username = computed({
	get: () => ROOM.instance.state.username,
	set: v => ROOM.instance.rename(v),
})

const link = ref<string>()

onMounted(async () => {
	try {
		link.value = await ROOM.instance.createRoom()
	} catch (e) {
		console.error(e)
		router.push('/')
	}
})
</script>

<template>
	<TypeUsername v-model="username" />

	<button @click="() => clipboardCopy(link)">Copy Invite Link</button>
</template>

<style lang="postcss" scoped></style>
