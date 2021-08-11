import { Socket } from '@/types/socket'
import RoomController from './RoomController'
import {
	DiceIndex,
	DiceProps,
	JoiningRole,
	PlayerRole,
	PlayingRole,
} from '@common/types'

export default class Player {
	readonly id: string
	name: string = 'Player'
	room?: RoomController
	role?: PlayerRole

	constructor(private socket: Socket) {
		this.id = socket.id
	}

	rename(name: string) {
		this.name = name
		this.room?.handleRename(this)
	}
	playerRenamed(role: PlayingRole, username: string) {
		this.socket.emit('player_rename', role, username)
	}

	leaveRoom() {
		if (!this.room) return
		const { room } = this
		this.room = undefined
		this.socket.leave(room.roomID)
		room.leave(this)
	}

	createRoom(): string {
		if (this.room) this.leaveRoom()
		const room = new RoomController(this)
		this.room = room
		this.socket.join(room.roomID)
		this.socket.emit('message', `Online Room ${room.roomID} created!`)
		this.role = 'creator'
		return room.roomID
	}

	joinRoom(
		roomID: string,
		playerUsername: string,
	): false | { role: JoiningRole; creatorUsername: string } {
		this.name = playerUsername
		if (this.room) this.leaveRoom()
		const result = RoomController.joinRoom(roomID, this)
		if (!result) return false

		this.room = result.room
		this.role = result.role
		this.room.handleRename(this)
		this.socket.join(roomID)
		return {
			role: result.role,
			creatorUsername: this.room.creator.name,
		}
	}

	ready() {
		if (this.role === 'opponent') this.room?.startGame()
	}

	roll(dices: DiceProps[], storedScore: number) {
		this.room?.isPlayerActive(this) &&
			this.room.emitOmit(
				this.room.activePlayer,
				'game_roll',
				dices,
				storedScore,
			)
	}

	select(index: DiceIndex, isSelected: boolean) {
		this.room?.isPlayerActive(this) &&
			this.room.emitOmit(
				this.room.activePlayer,
				'game_select',
				index,
				isSelected,
			)
	}

	lost() {
		if (!this.room?.isPlayerActive(this)) return
		this.room.emitOmit(this.room.activePlayer, 'game_turn_lost')
		this.room.switchActivePlayer()
	}

	scored(totalScore: number) {
		if (!this.room?.isPlayerActive(this)) return
		this.room.emitOmit(this.room.activePlayer, 'game_turn_scored', totalScore)
		this.room.switchActivePlayer()
	}

	won(totalScore: number) {
		if (!this.room?.isPlayerActive(this)) return
		this.room.gameWon(totalScore)
	}
}
