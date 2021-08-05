<script lang="ts" setup>
const props = defineProps<{
	modelValue: string
}>()
const emit = defineEmits<{
	(e: 'update:modelValue', v: string): void
}>()

const username = computed({
	get: () => props.modelValue,
	set: v => emit('update:modelValue', v),
})
</script>

<template>
	<div class="type-username-form">
		<p>What's your name?</p>
		<input type="text" v-model="username" />
		<p class="form-warning"></p>
	</div>
</template>

<style lang="postcss"></style>
