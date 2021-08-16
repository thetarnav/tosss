<script lang="ts" setup>
import GooeyBackground from 'vue-gooey-background'
import { RouteLocationRaw, useRouter } from 'vue-router'

const router = useRouter()
const props = defineProps({
	to: {
		type: [String, Object] as unknown as () => RouteLocationRaw | string,
		default: undefined,
	},
})
const emit = defineEmits(['click'])

function handleClick() {
	if (props.to) return router.push(props.to)
	emit('click')
}
</script>

<template>
	<button class="button-component" @click="handleClick">
		<GooeyBackground>
			<slot></slot>
		</GooeyBackground>
	</button>
</template>

<style lang="postcss">
.button-component {
	.gooey-background {
		@apply py-3 px-5;
		@apply text-white font-medium;

		--bg-color: theme('colors.tan');
		.background,
		.ball {
			@apply transition-colors duration-300;
		}
	}

	&:hover .gooey-background {
		--bg-color: theme('colors.salomon');
	}
}
</style>
