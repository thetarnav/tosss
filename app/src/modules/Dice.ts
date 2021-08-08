import { random } from '@common/functions'
import { DiceValue, DiceIndex } from './types'
import { nanoid } from 'nanoid'

export interface DiceState {
	id: string
	index: DiceIndex
	value: DiceValue
	isSelected: boolean
	isStored: boolean
	isDisabled: boolean

	roll: () => void
}

export default class Dice implements DiceState {
	public id: string
	public value: DiceValue = 1
	public isSelected = false
	public isStored = false
	public isDisabled = false

	constructor(public index: DiceIndex, value?: DiceValue) {
		this.value = value || this.random
		this.id = nanoid(8)
	}

	private get random(): DiceValue {
		return random(1, 6, 'round') as DiceValue
	}
	roll() {
		if (this.isStored) return
		this.value = this.random
	}
}
