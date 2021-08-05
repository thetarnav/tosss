import { JoiningRole } from '@common/player'
import { nanoid } from 'nanoid'
import { io } from '..'
import Player from './Player'

export default class RoomController {
	static rooms: Record<string, RoomController> = {}
	readonly roomID: string

	readonly creator: Player
	opponent?: Player
	readonly spectators: Record<string, Player> = {}

	constructor(player: Player) {
		this.roomID = nanoid(10)
		this.creator = player

		RoomController.rooms[this.roomID] = this
	}

	get spectatorsList(): Player[] {
		return Object.values(this.spectators)
	}

	join(player: Player): JoiningRole {
		const { id } = player
		if (!this.opponent) {
			this.opponent = player
			io.to(this.roomID).emit('message', `Opponent ${id} joined!`)
			return 'opponent'
		} else {
			this.spectators[id] = player
			io.to(this.roomID).emit('message', `Spectator ${id} joined!`)
			return 'spectator'
		}
	}

	leave(player: Player) {
		if (player.role === 'creator' || player.role === 'opponent') {
			io.to(this.roomID).emit(
				'message',
				`Player ${player.id} left the room! Closing the Room.`,
			)
			this.closeRoom()
		} else {
			io.to(this.roomID).emit(
				'message',
				`Spectator ${player.id} left the room!`,
			)
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
		io.to(this.roomID).emit('message', `Room Closed!`)
		io.to(this.roomID).emit('room_closed')
		this.creator.leaveRoom()
		this.opponent?.leaveRoom()
		this.spectatorsList.forEach(player => player.leaveRoom())
		delete RoomController.rooms[this.roomID]
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
