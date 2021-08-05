<script lang="ts" setup>
import clipboardCopy from 'copy-to-clipboard-ultralight'
import OnlineRoom from '@/store/onlineRoom'
import { useRouter } from 'vue-router'
import TypeUsername from '@/components/TypeUsername.vue'
import { onMounted } from 'vue-demi'

const router = useRouter()

const username = computed({
	get: () => OnlineRoom.instance.state.username,
	set: v => OnlineRoom.instance.rename(v),
})

const link = ref<string>()

onMounted(async () => {
	try {
		link.value = await OnlineRoom.instance.createRoom()
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
