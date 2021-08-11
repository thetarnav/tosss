import { nanoid } from 'nanoid'
import { io } from '..'
import Player from './Player'
import { DiceProps, JoiningRole, PlayerRole, PlayingRole } from '@common/types'
import { ServerEventsMap } from '@common/socketEventsMap'

/**
 * One instance per socket room created
 */
export default class RoomController {
	static rooms: Record<string, RoomController> = {}
	readonly roomID: string

	readonly creator: Player
	opponent?: Player
	readonly spectators: Record<string, Player> = {}

	playing = false
	activePlayer: PlayingRole = 'creator'

	constructor(player: Player) {
		this.roomID = nanoid(10)
		this.creator = player

		RoomController.rooms[this.roomID] = this
	}

	get spectatorsList(): Player[] {
		return Object.values(this.spectators)
	}

	emit<T extends keyof ServerEventsMap>(
		name: T,
		...args: Parameters<ServerEventsMap[T]>
	) {
		io.to(this.roomID).emit(name, ...args)
	}

	join(player: Player): JoiningRole {
		const { id } = player
		if (!this.opponent) {
			this.opponent = player
			this.emit('message', `Opponent ${player.name} joined!`)
			return 'opponent'
		} else {
			this.spectators[id] = player
			this.emit('message', `Spectator ${player.name} joined!`)
			return 'spectator'
		}
	}

	leave(player: Player) {
		if (player.role === 'creator' || player.role === 'opponent') {
			this.emit(
				'message',
				`Player ${player.name} left the room! Closing the Room.`,
			)
			this.closeRoom()
		} else {
			this.emit('message', `Spectator ${player.name} left the room!`)
			delete this.spectators[player.id]
		}
	}

	static joinRoom(
		roomID: string,
		player: Player,
	): { room: RoomController; role: JoiningRole } | undefined {
		const room: RoomController | undefined = this.rooms[roomID]
		if (!room) return undefined
		const role = room.join(player)
		return { room, role }
	}

	closeRoom() {
		this.emit('message', `Room Closed!`)
		this.emit('room_closed')
		this.creator.leaveRoom()
		this.opponent?.leaveRoom()
		this.spectatorsList.forEach(player => player.leaveRoom())
		delete RoomController.rooms[this.roomID]
	}

	handleRename(player: Player) {
		const { role } = player
		if (!role || role === 'spectator' || !this.opponent) return

		const toList: Player[] = [
			role === 'creator' ? this.opponent : this.creator,
			...this.spectatorsList,
		]
		toList.forEach(to => to.playerRenamed(role, player.name))
	}

	startGame() {
		if (!this.opponent) return
		this.playing = true
		this.emit('game_start')
	}
}

setInterval(() => {
	console.log(
		'Sockets:',
		io.sockets.sockets.size,
		'Rooms:',
		Object.keys(RoomController.rooms).length,
	)
}, 2000)
