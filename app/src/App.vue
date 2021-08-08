<script lang="ts" setup>
import { messages } from '@/modules/OnlineRoom'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

{
	const routeName = route.name
	if (routeName !== 'Join' && routeName !== 'Home') {
		router.push('/')
	}
}
</script>

<template>
	<ul class="server-messages">
		<li v-for="(msg, index) in messages" :key="index">
			{{ msg }}
		</li>
	</ul>
	<router-view></router-view>
</template>

<style lang="postcss">
#app {
	@apply w-screen h-screen;
	@apply flex flex-col justify-center items-center;
}
.server-messages {
	@apply fixed left-4 top-4 pointer-events-none;
	@apply font-mono text-sm opacity-70;
}
</style>
