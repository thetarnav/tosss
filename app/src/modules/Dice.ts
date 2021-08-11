import { random } from '@common/functions'
import { nanoid } from 'nanoid'
import { DiceProps, DiceValue } from '@common/types'

export interface DiceState extends DiceProps {
	id: string
	isDisabled: boolean

	roll: () => void
	set: (props: Partial<DiceProps>, disable?: boolean) => void
}

export default class Dice implements DiceState {
	public id: string
	public value: DiceValue = '1'
	public isSelected
	public isStored
	public isDisabled = false

	constructor(value?: DiceValue, isSelected?: boolean, isStored?: boolean) {
		this.value = value || this.random
		this.id = nanoid(8)
		this.isSelected = isSelected ?? false
		this.isStored = isStored ?? false
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
