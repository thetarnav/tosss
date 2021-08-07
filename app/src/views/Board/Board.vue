<script lang="ts" setup>
import BOARD from './Board'
import Dices from './Dices.vue'

const roll = () => {
	BOARD.instance.rollDices()
}
</script>

<template>
	<div>
		<Dices />
		<button @click="roll">Roll</button>
	</div>
</template>

<style lang="postcss"></style>
