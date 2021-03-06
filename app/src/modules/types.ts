import { DiceIndex, DiceValue } from '@common/types'
import { DiceState } from './Dice'

export type GameMode = 'online' | 'hotseat'

export const diceIndexes: [0, 1, 2, 3, 4, 5] = [0, 1, 2, 3, 4, 5]
export const diceValues: ['1', '2', '3', '4', '5', '6'] = [
	'1',
	'2',
	'3',
	'4',
	'5',
	'6',
]

export const streetScores = {
	'1-5': 500,
	'2-6': 750,
	'1-6': 1500,
}

export interface PartialStreet {
	type: '1-5' | '2-6'
	duplicates: [DiceState, DiceState] | null
	duplicateValue: DiceValue | null
}

export interface FullStreet {
	type: '1-6'
	duplicates: null
	duplicateValue: null
}

export interface BoardController {
	playerNames: [string, string]
	turnLost: boolean
	rollDisabled: boolean
	takeDisabled: boolean
	roll: () => void
	take: () => void
	select: (index: DiceIndex) => void
}
