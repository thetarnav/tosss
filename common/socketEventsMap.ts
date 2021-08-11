import { DiceIndex, DiceProps, JoiningRole, PlayingRole } from './types'

export interface ClientEventsMap {
	rename: (username: string) => void
	create_room: (username: string) => void
	join_room: (roomID: string, username: string) => void
	player_ready: () => void
	game_roll: (dices: DiceProps[], storedScore: number) => void
	game_select: (index: DiceIndex, isSelected: boolean) => void
	game_turn_lost: () => void
	game_turn_scored: (totalScore: number) => void
	game_won: (totalScore: number) => void
}

export interface ServerEventsMap {
	message: (msg: string) => void
	room_created: (roomID: string) => void
	room_join_result:
		| ((result: JoiningRole, username: string) => void)
		| ((result: false) => void)
	room_closed: () => void
	player_rename: (role: PlayingRole, username: string) => void
	game_start: () => void
	game_roll: (dices: DiceProps[], storedScore: number) => void
	game_select: (index: DiceIndex, isSelected: boolean) => void
	game_turn_lost: () => void
	game_turn_scored: (totalScore: number) => void
	game_won: (totalScore: number) => void
}
