import { isInRange } from '@common/functions'
import { DeepReadonly, reactive, readonly, ToRefs, toRefs } from 'vue'
import Dice, { DiceState } from './Dice'
import {
	BoardController,
	DiceIndex,
	diceIndexes,
	DiceValue,
	diceValues,
} from './types'

interface BoardState {
	dices: Record<DiceIndex, DiceState> | undefined
	activePlayer: 0 | 1
	totalScore: [number, number]
	storedScore: number
	lostRound: boolean
}
const initialState: BoardState = {
	dices: undefined,
	activePlayer: 0,
	totalScore: [0, 0],
	storedScore: 0,
	lostRound: false,
}

export default class BOARD {
	private static _instance: BOARD
	private readonly _state: BoardState

	controller = ref<BoardController | undefined>()

	private constructor() {
		this._state = reactive(initialState)
	}

	static get instance(): BOARD {
		if (!BOARD._instance) {
			BOARD._instance = new BOARD()
		}
		return BOARD._instance
	}

	mutate<K extends keyof BoardState>(key: K, val: BoardState[K]): void {
		this._state[key] = val
	}
	get state(): DeepReadonly<BoardState> {
		return readonly(this._state)
	}
	get refs(): ToRefs<DeepReadonly<BoardState>> {
		return toRefs(this.state)
	}

	private dicesList = computed<DiceState[]>(() =>
		this._state.dices ? Object.values(this._state.dices) : [],
	)
	filteredList = (filter: (dice: DiceState) => boolean): DiceState[] => {
		return this.dicesList.value.filter(filter)
	}
	private selectedList = computed<DiceState[]>(() =>
		this.filteredList(dice => dice.isSelected),
	)
	private storedList = computed<DiceState[]>(() =>
		this.filteredList(dice => dice.isStored),
	)
	freeList = computed<DiceState[]>(() =>
		this.filteredList(dice => !dice.isStored && !dice.isSelected),
	)

	isPlayable = computed<boolean>(() => countPoints(this.freeList.value) > 0)

	private unfinishedChain = computed<DiceValue | undefined>(() => {
		const count = countValues(this.selectedList.value)
		return diceValues.find(
			v => ![1, 5].includes(v) && isInRange(count[v], 0, 3, true),
		)
	})

	disabled = computed<boolean>(
		() =>
			this._state.lostRound ||
			this.unfinishedChain.value !== undefined ||
			this.selectedList.value.length === 0,
	)

	selectedScore = computed<number>(() =>
		this.selectedList.value.length === 0
			? 0
			: countPoints(this.selectedList.value),
	)

	get availableScore(): number {
		const dicesList = this.dicesList.value
		if (!dicesList.length) return 0
		return countPoints(dicesList)
	}

	/**
	 * Randomizes values of dices on the board.
	 * Rolls only not-selected & not-stored dices, if the "clear" param isn't enabled
	 * @param clear - to reset every dice on the board
	 */
	rollDices(clear = false): void {
		if (clear || this._state.dices === undefined) {
			// Fresh Game
			this._state.dices = randomDices()
		} else {
			// In the middle of the game
			const freeList = this.freeList.value
			freeList.forEach(dice => dice.roll())
		}
	}

	switchActivePlayer(): 0 | 1 {
		this.mutate('activePlayer', this.state.activePlayer ? 0 : 1)
		return this.state.activePlayer
	}

	selectDice(index: DiceIndex) {
		const dice = this._state.dices?.[index],
			selectedList = this.selectedList.value,
			chain = this.unfinishedChain.value

		if (
			!dice ||
			dice.isDisabled ||
			dice.isStored ||
			(selectedList.length && chain !== undefined && chain !== dice.value)
		)
			return

		dice.isSelected = !dice.isSelected
		this.disableDices()
	}

	private disableDices() {
		const chain = this.unfinishedChain.value,
			dices = this.dicesList.value

		dices.forEach(dice => {
			dice.isDisabled =
				!dice.isStored && chain !== dice.value && chain !== undefined
		})
	}

	/**
	 * - Adds score of selected dices to "storedScore"
	 * - Turns selected dices into stored ones
	 */
	storeSelected() {
		const selectedList = this.selectedList.value,
			chain = this.unfinishedChain.value

		if (chain) return

		this._state.storedScore += this.selectedScore.value
		selectedList.forEach(dice => {
			dice.isStored = dice.isSelected || dice.isStored
			dice.isSelected = false
		})
	}

	addTotalScore() {
		const state = this._state
		state.totalScore[state.activePlayer] +=
			state.storedScore + this.selectedScore.value
		state.storedScore = 0
	}
}

function randomDices(): Record<DiceIndex, DiceState> {
	const dices = {} as Record<DiceIndex, DiceState>
	for (const i of diceIndexes) {
		dices[i] = new Dice(i)
	}
	return dices
}

function countValues(
	dices: DiceState[],
	filter?: (dice: DiceState) => boolean,
): Record<DiceValue, number> {
	if (filter) dices = dices.filter(filter)

	const count = {
		1: 0,
		2: 0,
		3: 0,
		4: 0,
		5: 0,
		6: 0,
	}
	dices.forEach(dice => count[dice.value]++)
	return count
}

function countPoints(
	dices: DiceState[],
	filter?: (dice: DiceState) => boolean,
) {
	if (filter) dices = dices.filter(filter)

	const diceCount = countValues(dices)

	const result: number = diceValues.reduce((total, v) => {
		const n = diceCount[v]

		let min = 3
		if (v === 1 || v === 5) min = 1

		let points = 0

		if (n >= min) {
			const base = v === 1 ? 100 : v * 10,
				multiplier = n < 3 ? n : (n - 2) * 10
			points = base * multiplier
		}

		return total + points
	}, 0)

	return result
}
