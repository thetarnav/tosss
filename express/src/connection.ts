import Player from './controllers/Player'
import { Socket } from './types/socket'

export default function handleConnection(socket: Socket) {
	const { id } = socket,
		player = new Player(socket)

	console.log('New connection', id)
	socket.emit('message', 'Connected!')

	socket.on('create_room', () => {
		const roomID = player.createRoom()
		socket.emit('room_created', roomID)
	})

	socket.on('join_room', roomID => {
		const result = player.joinRoom(roomID)
		socket.emit('room_join_result', result)
	})

	socket.on('disconnect', () => {
		player.leaveRoom()
	})
}
