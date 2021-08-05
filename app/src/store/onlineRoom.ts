import io, { Socket } from 'socket.io-client'
import { ClientEventsMap, ServerEventsMap } from '@common/socketEventsMap'
import { DeepReadonly, reactive, readonly, ToRefs, toRefs } from 'vue'
import { wait } from '@common/functions'
import { useDebounceFn } from '@vueuse/core'
import { JoiningRole, PlayerRole } from '@common/player'
import router from '@/router/router'

interface State {
	messages: string[]
	username: string
	link: string | undefined
	roomID: string | undefined
	role: PlayerRole | undefined
}

const initialState: State = {
	messages: [],
	username: 'Player',
	link: undefined,
	roomID: undefined,
	role: undefined,
}

export default class OnlineRoom {
	private static _instance: OnlineRoom
	private _state: State
	private socket: Socket<ServerEventsMap, ClientEventsMap>

	private constructor() {
		this._state = reactive(initialState)
		this.socket = io('192.168.1.11:8080')

		this.socket.on('message', message => OnlineRoom.addMessage(message))

		this.socket.on('room_closed', () => this.roomClosed())
	}

	static get instance(): OnlineRoom {
		return OnlineRoom._instance || (OnlineRoom._instance = new OnlineRoom())
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
		if (OnlineRoom.instance.socket.disconnected)
			OnlineRoom.instance.socket.connect()
	}

	static addMessage(message: string) {
		OnlineRoom.instance._state.messages.push(message)
	}

	rename(username: string) {
		OnlineRoom.instance.mutate('username', username)
		OnlineRoom.emitUsername()
	}
	private static emitUsername = useDebounceFn(() =>
		OnlineRoom.instance.socket.emit(
			'rename',
			OnlineRoom.instance.state.username,
		),
	)

	private static setRoom(roomID: string, role: PlayerRole): string {
		const link = window.origin + '/join/' + roomID
		OnlineRoom.instance.mutate('roomID', roomID)
		OnlineRoom.instance.mutate('link', link)
		OnlineRoom.instance.mutate('role', role)
		return link
	}

	createRoom(): Promise<string> {
		OnlineRoom.reconnect()

		let pending = true
		return new Promise<string>((resolve, reject) => {
			this.socket
				.emit('create_room')
				.once('room_created', onRoomCreated)
				.once('disconnect', rejection)

			wait(5000).then(() => rejection('Server timeout...'))

			// Handles room successfully created
			function onRoomCreated(roomID: string) {
				if (!pending) return reject('Promise was already resolved.')
				pending = false
				const link = OnlineRoom.setRoom(roomID, 'creator')
				resolve(link)
			}

			function rejection(reason?: string) {
				if (!pending) return
				pending = false
				reason && OnlineRoom.addMessage(reason)
				reject(reason)
			}
		})
	}

	joinRoom(roomID: string): Promise<void> {
		OnlineRoom.reconnect()

		let pending = true
		return new Promise((resolve, reject) => {
			this.socket
				.emit('join_room', roomID)
				.once('room_join_result', onResult)
				.once('disconnect', rejection)

			wait(5000).then(() => rejection('Server timeout...'))

			function onResult(role: JoiningRole | false) {
				if (!pending) return rejection('Promise was already resolved.')
				if (!role) return rejection("Couldn't join the room.")
				pending = false
				OnlineRoom.setRoom(roomID, role)
				resolve()
			}

			function rejection(reason?: string) {
				if (!pending) return
				pending = false
				reason && OnlineRoom.addMessage(reason)
				reject(reason)
			}
		})
	}

	private roomClosed() {
		this.mutate('roomID', undefined)
		this.mutate('link', undefined)
		this.mutate('role', undefined)
		router.push('/')
	}
}
