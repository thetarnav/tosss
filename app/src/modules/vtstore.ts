import { DeepReadonly, reactive, readonly, ToRefs, toRefs } from 'vue'

export default class VTStore<T extends Record<string, any>> {
	private underlying: T

	constructor(initial: T) {
		this.underlying = reactive(initial) as T
	}

	public mutate<K extends keyof T>(key: K, val: T[K]): void {
		this.underlying[key] = val
	}

	get state(): DeepReadonly<T> {
		return readonly(this.underlying) as DeepReadonly<T>
	}

	get refs(): ToRefs<DeepReadonly<T>> {
		return toRefs(this.state)
	}
}

interface State {
	name: string
	id: number
}

const initialValues: State = {
	name: 'Yooo',
	id: 123,
}

class Singleton {
	private static instance: Singleton

	private _state: State

	private constructor() {
		this._state = reactive(initialValues)
	}

	public static getInstance(): Singleton {
		if (!Singleton.instance) {
			Singleton.instance = new Singleton()
		}

		return Singleton.instance
	}

	public mutate<K extends keyof State>(key: K, val: State[K]): void {
		this._state[key] = val
	}

	get state(): DeepReadonly<State> {
		return readonly(this._state)
	}

	get refs(): ToRefs<DeepReadonly<State>> {
		return toRefs(this.state)
	}
}
