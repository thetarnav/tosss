<script lang="ts" setup>
import ROOM from '@/modules/OnlineRoom'
import { onBeforeRouteLeave } from 'vue-router'

const { role } = ROOM.instance.refs
ROOM.reconnect()

onBeforeRouteLeave((to, from, next) => {
	next()
	// ON GO BACK
	// by clicking on go back button on using browser buttons
	if (to.path === '/') {
		ROOM.disconnect()
	}
})
</script>

<template>
	<div class="role">
		{{ role }}
	</div>
	<div class="content">
		<router-link to="/" class="btn go-back">&lt; Go Back</router-link>
		<main>
			<router-view></router-view>
		</main>
	</div>
</template>

<style lang="postcss" scoped>
.role {
	@apply fixed top-4 right-4 pointer-events-none;
}
.content {
	@apply relative;
}
.go-back {
	@apply absolute right-full mr-8 whitespace-nowrap;
}
main {
	@apply space-y-6;
}
</style>
