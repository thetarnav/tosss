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

	createRoom() {
		const room = new RoomController(this)
		this.room = room

		this.socket.emit('room_created', room.roomID)
	}
}
