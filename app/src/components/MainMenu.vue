<script lang="ts" setup></script>

<template>
	<h3>How do you wanna play?</h3>
	<nav>
		<router-link :to="{ name: 'Online' }" class="btn">Online</router-link>
		<button>Hotseat</button>
		<button>vs AI</button>
	</nav>
</template>

<style lang="postcss" scoped>
h3 {
	@apply mb-3;
}
nav {
	@apply flex flex-col space-y-3;
}
</style>
