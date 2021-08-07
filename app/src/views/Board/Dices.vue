<script lang="ts" setup>
import type { DiceIndex } from './types'
import BOARD from './Board'

const { dices } = BOARD.instance.refs

const selectDice = (index: DiceIndex) => {
	BOARD.instance.userSelectDice(index)
}
</script>

<template>
	<div class="dices">
		<button
			v-for="{ index, value, isSelected, isDisabled } in dices"
			:key="Number(index)"
			:class="{
				isSelected,
				isDisabled,
			}"
			@click="selectDice(index)"
		>
			{{ value }}
		</button>
	</div>
</template>

<style lang="postcss" scoped>
.dices {
	@apply m-4 grid grid-cols-3 gap-2;

	button {
		@apply w-12 h-12;

		&.isSelected {
			@apply bg-yellow-200;
		}
		&.isDisabled {
			@apply opacity-50 pointer-events-none cursor-default;
		}
	}
}
</style>
