import io, { Socket } from 'socket.io-client'
import { ClientEventsMap, ServerEventsMap } from '@common/socketEventsMap'
import { DeepReadonly, reactive, readonly, ToRefs, toRefs } from 'vue'
import { wait } from '@common/functions'
import { useDebounceFn } from '@vueuse/core'

interface State {
	messages: string[]
	username: string
	link: string | undefined
	roomID: string | undefined
}

const initialState: State = {
	messages: [],
	username: 'Player',
	link: undefined,
	roomID: undefined,
}

export default class Singleton {
	private static _instance: Singleton
	private _state: State
	private socket: Socket<ServerEventsMap, ClientEventsMap>

	private constructor() {
		this._state = reactive(initialState)
		this.socket = io('192.168.1.11:8080')

		this.socket.on('message', message => Singleton.addMessage(message))
	}

	static get instance(): Singleton {
		return Singleton._instance || (Singleton._instance = new Singleton())
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
		if (Singleton.instance.socket.disconnected)
			Singleton.instance.socket.connect()
	}

	static addMessage(message: string) {
		Singleton.instance._state.messages.push(message)
	}

	rename(username: string) {
		Singleton.instance.mutate('username', username)
		Singleton.emitUsername()
	}
	private static emitUsername = useDebounceFn(() =>
		Singleton.instance.socket.emit(
			'rename',
			Singleton.instance.state.username,
		),
	)

	private static setRoomID(roomID: string): string {
		const link = window.origin + '/join/' + roomID
		Singleton.instance.mutate('roomID', roomID)
		Singleton.instance.mutate('link', link)
		return link
	}

	createRoom(): Promise<string> {
		Singleton.reconnect()

		let rejected = false
		return new Promise<string>((resolve, reject) => {
			this.socket
				.emit('create_room')
				.once('room_created', onRoomCreated)
				.once('disconnect', rejection)

			wait(5000).then(() => rejection('Server timeout...'))

			// Handles room successfully created
			function onRoomCreated(roomID: string) {
				if (rejected) return reject('Promise was already resolved.')
				const link = Singleton.setRoomID(roomID)
				resolve(link)
			}

			function rejection(reason?: string) {
				rejected = true
				reason && Singleton.addMessage(reason)
				reject(reason)
			}
		})
	}

	joinRoom(roomID: string): Promise<void> {
		Singleton.reconnect()

		let rejected = false
		return new Promise((resolve, reject) => {
			this.socket
				.emit('join_room', roomID)
				.once('room_join_result', onResult)
				.once('disconnect', rejection)

			wait(5000).then(() => rejection('Server timeout...'))

			function onResult(result: boolean) {
				if (rejected) return rejection('Promise was already resolved.')
				if (!result) return rejection("Couldn't join the room.")

				Singleton.setRoomID(roomID)
				resolve()
			}

			function rejection(reason?: string) {
				rejected = true
				reason && Singleton.addMessage(reason)
				reject(reason)
			}
		})
	}
}
