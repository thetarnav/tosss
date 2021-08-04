import io, { Socket } from 'socket.io-client'
import { ClientEventsMap, ServerEventsMap } from '@common/socketEventsMap'
import { wait } from '@common/functions'
import OnlineGame from './roomController'

export const messages = ref<string[]>([])

let socket: Socket<ServerEventsMap, ClientEventsMap>

export default function useSocket() {
	socket = io('192.168.1.11:8080')

	socket.on('message', v => messages.value.push(v))

	const createRoom = (): Promise<OnlineGame> =>
		new Promise((resolve, reject) => {
			socket
				.emit('create_room')
				.once('room_created', onRoomCreated)
				.once('disconnect', reject)

			wait(5000).then(() => reject('Server timeout...'))

			// Handles room successfully created
			function onRoomCreated(roomID: string) {
				const roomController = new OnlineGame(roomID)
				resolve(roomController)
			}
		})

	const changeName = (username: string) => {
		socket.emit('rename', username)
	}

	return {
		createRoom,
		changeName,
	}
}
