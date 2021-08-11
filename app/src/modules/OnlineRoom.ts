import io, { Socket } from 'socket.io-client'
import { ClientEventsMap, ServerEventsMap } from '@common/socketEventsMap'
import { DeepReadonly, reactive, readonly, ToRefs, toRefs } from 'vue'
import { wait } from '@common/functions'
import { useDebounceFn } from '@vueuse/core'
import { JoiningRole, PlayerRole, PlayingRole } from '@common/types'
import router from '@/router/router'
import initOnlineGame from '@/controllers/OnlineGame'
import { cloneDeep } from 'lodash'

export const messages = ref<string[]>([])

interface State {
	username: string
	opponent: string
	link: string | undefined
	roomID: string | undefined
	role: PlayerRole | undefined
}

const initialState: State = {
	username: 'Player',
	opponent: 'Player 2',
	link: undefined,
	roomID: undefined,
	role: undefined,
}

export default class ROOM {
	private static _instance: ROOM
	private readonly _state: State
	private socket: Socket<ServerEventsMap, ClientEventsMap>

	private constructor() {
		this._state = reactive(cloneDeep(initialState))
		this.socket = io('192.168.1.11:8080')

		this.listen('message', message => ROOM.addMessage(message))

		this.listen('player_rename', (role, username) =>
			this.playerRenamed(role, username),
		)

		this.listen('game_start', () => this.initGame())

		this.listen('room_closed', () => this.clearRoom())
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

	emit<T extends keyof ClientEventsMap>(
		name: T,
		...args: Parameters<ClientEventsMap[T]>
	): void {
		console.log('EMIT:', name, ...args)
		this.socket.emit(name, ...args)
	}

	listen<T extends keyof ServerEventsMap>(
		name: T,
		callback: ServerEventsMap[T],
	) {
		// @ts-ignore
		this.socket.on(name, (...args: Parameters<ServerEventsMap[T]>) => {
			console.log('LISTEN:', name, ...args)
			// @ts-ignore
			callback(...args)
		})
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
	private static emitUsername = useDebounceFn(
		() => ROOM.instance.emit('rename', ROOM.instance.state.username),
		1000,
	)

	playerRenamed(role: PlayingRole, username: string) {
		if (this._state.role !== 'spectator') this._state.opponent = username
	}

	private static setRoom(
		roomID: string,
		role: PlayerRole,
		opponentName?: string,
	): string {
		const link = window.origin + '/join/' + roomID
		ROOM.instance.mutate('roomID', roomID)
		ROOM.instance.mutate('link', link)
		ROOM.instance.mutate('role', role)
		opponentName && ROOM.instance.mutate('opponent', opponentName)
		return link
	}

	private clearRoom(redirect = true) {
		Object.assign(this._state, cloneDeep(initialState))
		redirect && router.push('/')
	}

	createRoom(): Promise<string> {
		ROOM.reconnect()

		let pending = true
		return new Promise<string>((resolve, reject) => {
			this.socket
				.emit('create_room', this._state.username)
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
			this.socket
				.emit('join_room', roomID, this._state.username)
				.once('room_join_result', onResult)
				.once('disconnect', rejection)

			wait(5000).then(() => rejection('Server timeout...'))

			function onResult(role: JoiningRole | false, creatorName?: string) {
				if (!pending) return rejection('Promise was already resolved.')
				if (!role) return rejection("Couldn't join the room.")
				pending = false
				ROOM.setRoom(roomID, role, creatorName)
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

	/**
	 * Method for joining player. (OPPONENT)
	 * Will call controller constructor & notify creator player to start the game
	 */
	startPlaying(): void {
		if (!this._state.opponent || this._state.role !== 'opponent') return
		initOnlineGame('opponent')
		this.emit('player_ready')
		router.push({ name: 'Board' })
	}

	/**
	 * Method for the host player (CREATOR)
	 * Initialize online game controller as creator
	 */
	private initGame(): void {
		if (!this._state.opponent || this._state.role !== 'creator') return
		initOnlineGame('creator')
		router.push({ name: 'Board' })
	}
}
