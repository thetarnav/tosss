<template>
	<ul class="server-messages">
		<li v-for="(msg, index) in messages" :key="index">
			{{ msg }}
		</li>
	</ul>
	<div class="role">
		{{ role }}
	</div>
	<router-view></router-view>
</template>

<script lang="ts" setup>
import OnlineRoom from '@/store/onlineRoom'

const { messages, role } = OnlineRoom.instance.refs
</script>

<style lang="postcss">
#app {
	@apply w-screen h-screen;
	@apply flex flex-col justify-center items-center;
}
</style>

<style lang="postcss" scoped>
.server-messages {
	@apply fixed left-4 top-4 pointer-events-none;
	@apply font-mono text-sm opacity-70;
}
.role {
	@apply fixed top-4 right-4 pointer-events-none;
}
</style>
