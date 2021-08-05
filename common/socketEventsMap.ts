export interface ClientEventsMap {
	rename: (username: string) => void
	create_room: () => void
	join_room: (roomID: string) => void
}

export interface ServerEventsMap {
	message: (msg: string) => void
	room_created: (roomID: string) => void
	room_join_result: (success: boolean) => void
}
