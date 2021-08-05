import { Socket } from '@/types/socket'
import RoomController from './RoomController'
import { JoiningRole, PlayerRole } from '@common/player'

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

	joinRoom(roomID: string): JoiningRole | false {
		if (this.room) this.leaveRoom()

		const result = RoomController.joinRoom(roomID, this)
		if (!result) return false

		this.room = result.room
		this.role = result.role
		this.socket.join(roomID)
		return result.role
	}
}
