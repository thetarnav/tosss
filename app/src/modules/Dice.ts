import { random } from '@common/functions'
import { nanoid } from 'nanoid'
import { DiceIndex, DiceProps, DiceValue } from '@common/types'

export interface DiceState extends DiceProps {
	index: DiceIndex
	id: string
	isDisabled: boolean

	roll: () => void
	set: (props: Partial<DiceProps>, disable?: boolean) => void
}

export default class Dice implements DiceState {
	public id: string
	public value: DiceValue = '1'
	public isSelected = false
	public isStored = false
	public isDisabled = false

	constructor(public index: DiceIndex) {
		this.value = this.random
		this.id = nanoid(8)
	}

	private get random(): DiceValue {
		return String(random(1, 6, 'round')) as DiceValue
	}
	roll() {
		if (this.isStored) return
		this.value = this.random
	}

	set(props: Partial<DiceProps>, disable?: boolean) {
		if (props.value !== undefined) this.value = props.value
		if (props.isSelected !== undefined) this.isSelected = props.isSelected
		if (props.isStored !== undefined) this.isStored = props.isStored
		if (disable !== undefined) this.isDisabled = disable
	}
}
