<script lang="ts" setup>
import BOARD from '@/modules/Board'

const props = defineProps({
	playerIndex: { type: Number, required: true },
})

const { activePlayer, totalScore, storedScore } = BOARD.instance.refs
const { selectedScore, controller } = BOARD.instance

const isActive = computed(() => activePlayer.value === props.playerIndex)
</script>

<template>
	<div class="player" :class="{ isActive, opponent: playerIndex === 1 }">
		{{ controller?.playerNames[playerIndex] }}
		<p>
			SCORE: {{ totalScore[playerIndex]
			}}<span v-if="isActive"> + {{ storedScore + selectedScore }}</span>
		</p>
	</div>
</template>

<style lang="postcss" scoped>
.player {
	&.opponent {
		@apply text-right;
	}

	&.isActive {
		@apply bg-yellow-100;
	}
}
</style>
