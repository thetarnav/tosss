import { nanoid } from 'nanoid'
import { io } from '..'
import Player from './Player'

export default class RoomController {
	static rooms: Record<string, RoomController> = {}

	readonly roomID: string
	readonly players: Record<string, Player> = {}

	constructor(player: Player) {
		this.roomID = nanoid(10)
		this.join(player)

		RoomController.rooms[this.roomID] = this
	}

	get playersList(): Player[] {
		return Object.values(this.players)
	}

	join(player: Player) {
		const { id } = player
		this.players[id] = player
		io.to(this.roomID).emit('message', `Player ${id} joined!`)
	}

	leave(userID: string) {
		delete this.players[userID]
		io.to(this.roomID).emit('message', `Player ${userID} left the room!`)
		// Last player left the room:
		if (Object.keys(this.players).length === 0) this.closeRoom()
	}

	static joinRoom(roomID: string, player: Player): RoomController | undefined {
		const room: RoomController | undefined = this.rooms[roomID]
		if (!room) return undefined
		room.join(player)
		return room
	}

	closeRoom() {
		this.playersList.forEach(player => player.leaveRoom())
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
