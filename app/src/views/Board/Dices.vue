<script lang="ts" setup>
import type { DiceIndex } from '@common/types'
import BOARD from '@/modules/Board'

const { controller } = BOARD.instance

const playableDices = computed(() =>
	BOARD.instance.filteredList(dice => !dice.isStored),
)
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
		<button
			v-for="{ index, id, value, isSelected, isDisabled } in playableDices"
			:key="id"
			:class="{
				isSelected,
				isDisabled,
			}"
			class="dice"
			@click="select(index)"
		>
			{{ value }}
		</button>
	</TransitionGroup>
</template>

<style lang="postcss" scoped>
.dices {
	@apply flex flex-wrap w-48 h-48 justify-center content-center;

	.dice {
		@apply w-12 h-12 m-2;
		transition: transform 700ms, opacity 200ms, background-color 200ms;

		&.isSelected {
			@apply bg-yellow-200;
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
