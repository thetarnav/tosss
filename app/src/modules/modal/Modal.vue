<script lang="ts" setup>
import type { ButtonType } from './modalController'

const props = defineProps({
	title: { type: String, default: '' },
	text: { type: String, required: true },
	closable: { type: Boolean, default: true },
	fireworks: { type: Boolean, default: false },
	buttons: {
		type: Array as () => ButtonType[],
		default: [],
	},
	close: { type: Function, required: true },
})

const handleCoverClick = () => props.closable && props.close()
const handleButtonClick = (btn: ButtonType) => {
	btn.action()
	props.close()
}
</script>

<template>
	<div class="modal-component">
		<div class="cover" @click="handleCoverClick"></div>
		<div class="modal">
			<h2 v-if="title">
				{{ title }}
			</h2>
			<p>
				{{ text }}
			</p>
			<div class="buttons">
				<button
					v-for="(btn, index) in buttons"
					:key="index"
					@click="handleButtonClick(btn)"
				>
					{{ btn.text }}
				</button>
			</div>
		</div>
	</div>
</template>

<style lang="postcss">
.modal-component {
	@apply fixed inset-0 flex justify-center items-center;

	.cover {
		@apply absolute z-10 inset-0 bg-gray bg-opacity-5;
	}
	.modal {
		@apply relative z-20 p-6 bg-white;
		@apply text-center flex flex-col items-center justify-center space-y-3;
	}
	.buttons {
		@apply flex space-x-2;
	}
}
</style>
