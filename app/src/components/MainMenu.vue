<script lang="ts" setup></script>

<template>
	<h3>How do you wanna play?</h3>
	<nav>
		<router-link :to="{ name: 'Online' }">Online</router-link>
		<button>Hotseat</button>
		<button>vs AI</button>
	</nav>
</template>

<style lang="postcss" scoped>
nav {
	@apply flex flex-col space-y-3;
}
</style>
