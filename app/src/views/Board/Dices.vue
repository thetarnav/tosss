<script lang="ts" setup>
import type { DiceIndex } from '@common/types'
import BOARD from '@/modules/Board'
import Dice from './Dice.vue'

const { controller, dicesList } = BOARD.instance

const select = (i: number) =>
	i >= 0 && i <= 5 && controller.value?.select(i as DiceIndex)
</script>

<template>
	<TransitionGroup
		name="dice"
		:duration="700"
		tag="div"
		class="dices"
		:class="{ 'round-lost': controller?.turnLost }"
	>
		<Dice
			v-for="{
				index,
				id,
				value,
				isSelected,
				isDisabled,
				isStored,
			} in dicesList"
			:key="id"
			:value="value"
			:is-selected="isSelected"
			:is-stored="isStored"
			:is-disabled="isDisabled"
		/>
	</TransitionGroup>
</template>

<style lang="postcss" scoped>
.dices {
	@apply flex flex-wrap w-48 h-48 justify-center content-center;

	.dice {
		@apply m-2;
		transition: transform 700ms, opacity 200ms, background-color 200ms;

		&.isSelected {
			@apply bg-tan;
		}
		&.isDisabled {
			@apply opacity-50 pointer-events-none cursor-default;
		}

		&-leave-active {
			position: absolute;
		}
		&-enter-from {
			@apply opacity-0 transform -translate-x-8;
		}
		&-leave-to {
			@apply opacity-0 transform translate-x-24;
		}
	}

	&.round-lost {
		.dice:not(.dice-leave-active) {
			@apply opacity-50;
		}
	}
}
</style>
