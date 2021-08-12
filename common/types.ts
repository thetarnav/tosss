export type PlayerRole = 'creator' | 'opponent' | 'spectator'

export type JoiningRole = 'opponent' | 'spectator'
export type PlayingRole = 'creator' | 'opponent'

export type DiceValue = '1' | '2' | '3' | '4' | '5' | '6'
export type DiceIndex = 0 | 1 | 2 | 3 | 4 | 5

export interface DiceProps {
	value: DiceValue
	isSelected: boolean
	isStored: boolean
}
