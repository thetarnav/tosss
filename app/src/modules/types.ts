export type DiceValue = 1 | 2 | 3 | 4 | 5 | 6
export type DiceIndex = 0 | 1 | 2 | 3 | 4 | 5
export type GameMode = 'online' | 'hotseat'

export const diceIndexes: [0, 1, 2, 3, 4, 5] = [0, 1, 2, 3, 4, 5]
export const diceValues: [1, 2, 3, 4, 5, 6] = [1, 2, 3, 4, 5, 6]

export interface BoardController {
	turnLost: boolean
	rollDisabled: boolean
	takeDisabled: boolean
	roll: () => void
	take: () => void
	select: (index: DiceIndex) => void
}
