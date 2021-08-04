import { ClientEventsMap, ServerEventsMap } from '@common/socketEventsMap'
import { Server } from 'socket.io'
import Player from './controllers/user'
import { Socket } from './types/socket'

export default function handleConnection(
	io: Server<ClientEventsMap, ServerEventsMap>,
	socket: Socket,
) {
	const { id } = socket,
		user = new Player(socket)

	console.log('New connection with:', id)
	io.emit('message', 'New user connected')
	socket.on('message', msg => io.emit('message', msg))

	socket.on('create_room', () => user.createRoom())
}
