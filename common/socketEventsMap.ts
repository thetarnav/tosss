export interface ClientEventsMap {
	message: (msg: string) => void
	rename: (username: string) => void
	create_room: () => void
}

export interface ServerEventsMap {
	message: (msg: string) => void
	room_created: (roomID: string) => void
}
