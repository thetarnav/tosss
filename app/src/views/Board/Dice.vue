<script lang="ts" setup>
import { DiceValue } from '@common/types'

const props = defineProps({
	value: { type: String as () => DiceValue, required: true },
	isSelected: { type: Boolean, required: true },
	isStored: { type: Boolean, required: true },
	isDisabled: { type: Boolean, required: true },
})
</script>

<template>
	<div
		class="dice"
		:data-value="value"
		:class="{
			isSelected,
			isStored,
			isDisabled,
		}"
	>
		<div class="dots">
			<div v-for="dot in 9" :key="dot" class="dot active"></div>
		</div>
		<div class="dots">
			<div v-for="dot in 9" :key="dot" class="dot inactive"></div>
		</div>
	</div>
</template>

<style lang="postcss">
$dot-size: 0.7rem;
$size: 3rem;
$padding: 0;
$margin: 0.5rem;
$bouncy-easing: theme('transitionTimingFunction.bouncy');

$mid: calc(50% - #{$dot-size}/ 2);

@mixin active-dot {
	transform: scale(1);
	&.inactive {
		transform: scale(0);
	}
}

.dice {
	position: relative;
	height: $size;
	width: $size;
	margin: $margin / 2;

	.dots {
		@apply absolute inset-0;
		@apply grid grid-cols-3 grid-rows-3 gap-1;
		filter: url(#goo-l);
	}

	.dot {
		display: block;
		width: $dot-size;
		height: $dot-size;
		background: theme('colors.salomon');
		border-radius: 50%;

		transition: transform 0.4s $bouncy-easing, background 0.2s;
		&.active {
			background: theme('colors.gray');
			transform: scale(0);
		}
	}

	&[data-value='1'] .dot {
		&:nth-of-type(5) {
			@include active-dot;
		}
	}
	&[data-value='2'] .dot {
		&:nth-of-type(3),
		&:nth-of-type(7) {
			@include active-dot;
		}
	}
	&[data-value='3'] .dot {
		&:nth-of-type(3),
		&:nth-of-type(5),
		&:nth-of-type(7) {
			@include active-dot;
		}
	}
	&[data-value='4'] .dot {
		&:nth-of-type(2),
		&:nth-of-type(4),
		&:nth-of-type(6),
		&:nth-of-type(8) {
			@include active-dot;
		}
	}
	&[data-value='5'] .dot {
		&:nth-of-type(1),
		&:nth-of-type(3),
		&:nth-of-type(5),
		&:nth-of-type(7),
		&:nth-of-type(9) {
			@include active-dot;
		}
	}
	&[data-value='6'] .dot {
		&:nth-of-type(1),
		&:nth-of-type(3),
		&:nth-of-type(4),
		&:nth-of-type(6),
		&:nth-of-type(7),
		&:nth-of-type(9) {
			@include active-dot;
		}
	}

	// dices:
	transition: transform 0.5s $bouncy-easing;

	&.selected {
		.inactive {
			transform: scale(0);
		}
	}
	&.disabled {
		.dot.inactive {
			background: theme('colors.tan');
		}
		.dot.active {
			background: theme('colors.salomon');
		}
	}
	&.gone {
		.inactive {
			transform: scale(0);
		}
		.active {
			background: theme('colors.salomon');
		}
	}
}
</style>
