import { Socket } from '@/types/socket'
import RoomController from './room'

export default class Player {
	readonly id: string
	name: string = 'Player'
	room?: RoomController

	constructor(private socket: Socket) {
		this.id = socket.id
	}

	rename(name: string) {
		this.name = name
	}

	leaveRoom() {
		if (!this.room) return
		this.socket.leave(this.room.roomID)
		this.room.leave(this.id)
		this.room = undefined
	}

	createRoom(): string {
		if (this.room) this.leaveRoom()
		const room = new RoomController(this)
		this.room = room
		this.socket.join(room.roomID)
		this.socket.emit('message', `Room ${room.roomID} was created!`)
		return room.roomID
	}

	joinRoom(roomID: string): boolean {
		if (this.room) this.leaveRoom()
		const room = RoomController.joinRoom(roomID, this)
		if (!room) return false
		this.room = room
		this.socket.join(roomID)
		return true
	}
}
