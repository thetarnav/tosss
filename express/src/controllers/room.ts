import { nanoid } from 'nanoid'
import Player from './user'

export default class RoomController {
	readonly roomID: string
	readonly users: Record<string, Player> = {}

	constructor(user: Player) {
		this.roomID = nanoid(10)
		this.join(user)
	}

	join(user: Player) {
		const { id } = user
		this.users[id] = user
	}

	leave(userID: string) {
		delete this.users[userID]
	}
}
