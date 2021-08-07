import io, { Socket } from 'socket.io-client'
import { ClientEventsMap, ServerEventsMap } from '@common/socketEventsMap'
import { DeepReadonly, reactive, readonly, ToRefs, toRefs } from 'vue'
import { wait } from '@common/functions'
import { useDebounceFn } from '@vueuse/core'
import { JoiningRole, PlayerRole } from '@common/player'
import router from '@/router/router'

export const messages = ref<string[]>([])

interface State {
	username: string
	link: string | undefined
	roomID: string | undefined
	role: PlayerRole | undefined
}

const initialState: State = {
	username: 'Player',
	link: undefined,
	roomID: undefined,
	role: undefined,
}

export default class ROOM {
	private static _instance: ROOM
	private _state: State
	private socket: Socket<ServerEventsMap, ClientEventsMap>

	private constructor() {
		this._state = reactive(initialState)
		this.socket = io('192.168.1.11:8080')

		this.socket.on('message', message => ROOM.addMessage(message))

		this.socket.on('room_closed', () => this.clearRoom())
	}

	static get instance(): ROOM {
		return ROOM._instance || (ROOM._instance = new ROOM())
	}

	mutate<K extends keyof State>(key: K, val: State[K]): void {
		this._state[key] = val
	}
	get state(): DeepReadonly<State> {
		return readonly(this._state)
	}
	get refs(): ToRefs<DeepReadonly<State>> {
		return toRefs(this.state)
	}

	static reconnect() {
		if (ROOM.instance.socket.disconnected) ROOM.instance.socket.connect()
	}

	static disconnect() {
		this.instance.socket.disconnect()
		this.instance.clearRoom(false)
	}

	static addMessage(message: string) {
		messages.value.push(message)
	}

	rename(username: string) {
		ROOM.instance.mutate('username', username)
		ROOM.emitUsername()
	}
	private static emitUsername = useDebounceFn(() =>
		ROOM.instance.socket.emit('rename', ROOM.instance.state.username),
	)

	private static setRoom(roomID: string, role: PlayerRole): string {
		const link = window.origin + '/join/' + roomID
		ROOM.instance.mutate('roomID', roomID)
		ROOM.instance.mutate('link', link)
		ROOM.instance.mutate('role', role)
		return link
	}

	createRoom(): Promise<string> {
		ROOM.reconnect()

		let pending = true
		return new Promise<string>((resolve, reject) => {
			if (this.socket.disconnected) rejection('Server disconnected.')
			this.socket
				.emit('create_room')
				.once('room_created', onRoomCreated)
				.once('disconnect', rejection)

			wait(5000).then(() => rejection('Server timeout...'))

			// Handles room successfully created
			function onRoomCreated(roomID: string) {
				if (!pending) return reject('Promise was already resolved.')
				pending = false
				const link = ROOM.setRoom(roomID, 'creator')
				resolve(link)
			}

			function rejection(reason?: string) {
				if (!pending) return
				pending = false
				reason && ROOM.addMessage(reason)
				reject(reason)
			}
		})
	}

	joinRoom(roomID: string): Promise<void> {
		ROOM.reconnect()

		let pending = true
		return new Promise((resolve, reject) => {
			if (this.socket.disconnected) rejection('Server disconnected.')
			this.socket
				.emit('join_room', roomID)
				.once('room_join_result', onResult)
				.once('disconnect', rejection)

			wait(5000).then(() => rejection('Server timeout...'))

			function onResult(role: JoiningRole | false) {
				if (!pending) return rejection('Promise was already resolved.')
				if (!role) return rejection("Couldn't join the room.")
				pending = false
				ROOM.setRoom(roomID, role)
				resolve()
			}

			function rejection(reason?: string) {
				if (!pending) return
				pending = false
				reason && ROOM.addMessage(reason)
				reject(reason)
			}
		})
	}

	private clearRoom(redirect = true) {
		this.mutate('roomID', undefined)
		this.mutate('link', undefined)
		this.mutate('role', undefined)
		redirect && router.push('/')
	}
}
