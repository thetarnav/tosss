<script lang="ts" setup>
import { useRouter } from 'vue-router'
import BOARD from '@/modules/Board'
import Dices from './Dices.vue'
import Player from './Player.vue'
import { onBeforeMount } from 'vue'

const router = useRouter()
const { controller } = BOARD.instance

onBeforeMount(() => {
	if (!controller) router.push('/')
})
</script>

<template>
	<div class="board">
		<Player :player-index="1" />
		<Dices />
		<Player :player-index="0" />
		<button
			:disabled="controller?.rollDisabled"
			@click="controller?.roll"
			class="roll"
		>
			Roll
		</button>
		<button
			:disabled="controller?.takeDisabled"
			@click="controller?.take"
			class="take"
		>
			Take
		</button>
	</div>
</template>

<style lang="postcss" scoped>
.take,
.roll {
	@apply m-2;
	&:disabled {
		@apply opacity-50 pointer-events-none;
	}
}
</style>
