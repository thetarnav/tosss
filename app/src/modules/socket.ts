import io, { Socket } from 'socket.io-client'
import { debouncedWatch } from '@vueuse/core'
import { ClientEventsMap, ServerEventsMap } from '@common/socketEventsMap'
import { wait } from '@common/functions'
import OnlineGame from './roomController'

export const messages = ref<string[]>([])
export const input = ref('')

const socket: Socket<ServerEventsMap, ClientEventsMap> = io('192.168.1.11:8080')

socket.on('message', v => {
	messages.value.push(v)
})

export const createRoom = (username: string): Promise<OnlineGame> =>
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
