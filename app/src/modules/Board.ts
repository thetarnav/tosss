import { getObjectDuplicates, isInRange, keyLookup } from '@common/functions'
import { DeepReadonly, reactive, readonly, ToRefs, toRefs } from 'vue'
import Dice, { DiceState } from './Dice'
import {
	BoardController,
	DiceIndex,
	diceIndexes,
	DiceValue,
	diceValues,
	FullStreet,
	PartialStreet,
	streetScores,
} from './types'
import { cloneDeep, findKey, findLastKey } from 'lodash'

export interface BoardState {
	activePlayer: 0 | 1
	totalScore: [number, number]
	storedScore: number
	dices: Record<DiceIndex, DiceState> | undefined
	street: PartialStreet | FullStreet | undefined
}
export type BoardStateRefs = ToRefs<DeepReadonly<BoardState>>
export type PublicBoardState = DeepReadonly<BoardState>
const initialState: BoardState = {
	dices: undefined,
	activePlayer: 0,
	totalScore: [0, 0],
	storedScore: 0,
	street: undefined,
}

export default class BOARD {
	private static _instance: BOARD
	private readonly _state: BoardState

	readonly controller = ref<BoardController>()

	private constructor() {
		this._state = reactive(cloneDeep(initialState))
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
	get state(): PublicBoardState {
		return readonly(this._state)
	}
	get refs(): BoardStateRefs {
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
	freeList = computed<DiceState[]>(() =>
		this.filteredList(dice => !dice.isStored && !dice.isSelected),
	)

	selectedScore = computed<number>(() => {
		const dices = this.selectedList.value,
			{ street } = this._state

		if (dices.length === 0) return 0

		if (street && dices.length >= 5 && !this.isStreetUnfinished.value) {
			let score = streetScores[street.type]

			const bothDupesSelected = street.duplicates?.every(
				dice => dice.isSelected,
			)
			if (bothDupesSelected)
				score += street.duplicateValue === '1' ? 100 : 50

			return score
		}

		const count = countValues(dices)
		return diceValues.reduce((total, v) => {
			const n = count[v]

			let min = 3
			if (v === '1' || v === '5') min = 1

			let points = 0

			if (n >= min) {
				const base = v === '1' ? 100 : Number(v) * 10,
					multiplier = n < 3 ? n : (n - 2) * 10
				points = base * multiplier
			}

			return total + points
		}, 0)
	})

	/**
	 * Is it possible to get any points from the dices on the board?
	 */
	isPlayable = computed<boolean>(() => {
		if (this._state.street) return true

		const count = countValues(this.freeList.value),
			areChains = () => Object.values(count).some(n => n >= 3)

		return count['1'] > 0 || count['5'] > 0 || areChains()
	})

	private unfinishedChain = computed<DiceValue | undefined>(() => {
		const count = countValues(this.selectedList.value)
		return (['2', '3', '4', '6'] as ['2', '3', '4', '6']).find(v =>
			isInRange(count[v], 0, 3, true),
		)
	})

	private isStreetUnfinished = computed<boolean>(() => {
		const street = this._state.street
		// Street is not unfinished if every selected dice is a solo dice ("1"|"5")
		if (!street || this.selectedList.value.every(dice => isSoloDice(dice)))
			return false

		// For full street check if every dice is selected
		if (street.type === '1-6') return this.selectedList.value.length !== 6

		// To complete a street every (x=0) or almost every (x=1) dice must be selected
		const notSelected = this.filteredList(dice => !dice.isSelected)
		// The remaining dice (x=1) can only be a duplicate
		const isNotSelectedADuplicate = () =>
			notSelected.length === 1 && street.duplicates.includes(notSelected[0])

		return notSelected.length !== 0 && !isNotSelectedADuplicate()
	})

	disabled = computed<boolean>(
		() =>
			this.selectedList.value.length === 0 ||
			(this._state.street
				? this.isStreetUnfinished.value
				: !!this.unfinishedChain.value),
	)

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

		const street = this.checkStreet(this.freeList.value)
		this.mutate('street', street)
	}

	private checkStreet(
		dices: DiceState[],
	): PartialStreet | FullStreet | undefined {
		const count = countValues(dices),
			missing = findKey(count, n => n === 0),
			missingLast = findLastKey(count, n => n === 0)

		const getDuplicates = () =>
			getObjectDuplicates(dices, 'value') as [DiceState, DiceState]

		if (missing === '1' && missingLast === '1') {
			const duplicates = getDuplicates()
			return {
				type: '2-6',
				duplicates,
				duplicateValue: duplicates[0].value,
			}
		}
		if (missing === '6' && missingLast === '6') {
			const duplicates = getDuplicates()
			return {
				type: '1-5',
				duplicates,
				duplicateValue: duplicates[0].value,
			}
		}
		if (!missing && !missingLast)
			return {
				type: '1-6',
				duplicates: null,
				duplicateValue: null,
			}
	}

	switchActivePlayer(): 0 | 1 {
		this.mutate('activePlayer', this.state.activePlayer ? 0 : 1)
		return this.state.activePlayer
	}

	selectDice(index: DiceIndex) {
		const dice = this._state.dices?.[index]

		if (!dice || dice.isDisabled || dice.isStored) return

		dice.isSelected = !dice.isSelected
		this.disableDices(dice)
	}

	private disableDices(selectedDice: DiceState) {
		const disableWhileStreet = (): void => {
			const street = this._state.street as PartialStreet | FullStreet

			if (
				street.type === '1-6' ||
				!street.duplicates.includes(selectedDice) ||
				['1', '5'].includes(street.duplicateValue)
			)
				return

			const otherDuplicate = street.duplicates.find(d => d !== selectedDice)
			if (otherDuplicate) otherDuplicate.isDisabled = selectedDice.isSelected
		}

		const disableWhileChain = (): void => {
			const dices = this.filteredList(dice => !dice.isStored)
			const chain = this.unfinishedChain.value

			dices.forEach(dice => {
				dice.isDisabled =
					!isSoloDice(selectedDice) &&
					chain !== dice.value &&
					chain !== undefined
			})
		}

		this._state.street ? disableWhileStreet() : disableWhileChain()
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

	fullClear() {
		Object.assign(this._state, cloneDeep(initialState))
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
	const base = {
		1: 0,
		2: 0,
		3: 0,
		4: 0,
		5: 0,
		6: 0,
	}
	const lookup = keyLookup(dices, 'value')
	return Object.assign(base, lookup)
}

const isSoloDice = (dice: DiceState) => ['1', '5'].includes(dice.value)
