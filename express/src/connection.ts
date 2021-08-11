import Player from './controllers/Player'
import { Socket } from './types/socket'

export default function handleConnection(socket: Socket) {
	const { id } = socket,
		player = new Player(socket)

	console.log('New connection', id)
	socket.emit('message', 'Connected to the server')

	socket.on('create_room', () => {
		const roomID = player.createRoom()
		socket.emit('room_created', roomID)
	})

	socket.on('join_room', (roomID, username) => {
		const result = player.joinRoom(roomID, username)
		result
			? socket.emit('room_join_result', result.role, result.creatorUsername)
			: socket.emit('room_join_result', false)
	})

	socket.on('rename', name => player.rename(name))

	socket.on('player_ready', () => player.ready())

	socket.on('game_roll', player.roll.bind(player))

	socket.on('game_select', (i, isSelected) => player.select(i, isSelected))

	socket.on('game_turn_lost', () => player.lost())

	socket.on('disconnect', () => {
		player.leaveRoom()
	})
}
