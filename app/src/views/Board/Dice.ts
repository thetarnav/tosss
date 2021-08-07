import { random } from '@common/functions'
import { DiceValue, DiceIndex } from './types'

export interface DiceState {
	index: DiceIndex
	value: DiceValue
	isSelected: boolean
	isStored: boolean
	isDisabled: boolean

	roll: () => void
}

export default class Dice implements DiceState {
	public value: DiceValue = 1
	public isSelected = false
	public isStored = false
	public isDisabled = false

	constructor(public index: DiceIndex, value?: DiceValue) {
		this.value = value || this.random
	}

	private get random(): DiceValue {
		return random(1, 6, 'round') as DiceValue
	}
	roll() {
		if (this.isStored) return
		this.value = this.random
	}
}
