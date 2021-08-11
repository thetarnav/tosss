import { getObjectDuplicates, isInRange, keyLookup } from '@common/functions'
import { DeepReadonly, reactive, readonly, ToRefs, toRefs } from 'vue'
import Dice, { DiceState } from './Dice'
import {
	BoardController,
	diceIndexes,
	diceValues,
	FullStreet,
	PartialStreet,
	streetScores,
} from './types'
import { cloneDeep, findKey, findLastKey } from 'lodash'
import { DiceIndex, DiceValue } from '@common/types'

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

	mutate<K extends keyof BoardState>(
		key: K,
		mutation: ((val: BoardState[K]) => BoardState[K]) | BoardState[K],
	): void {
		if (typeof mutation === 'function')
			this._state[key] = mutation(this._state[key])
		else this._state[key] = mutation
	}
	get state(): PublicBoardState {
		return readonly(this._state)
	}
	get refs(): BoardStateRefs {
		return toRefs(this.state)
	}

	dicesList = computed<DiceState[]>(() =>
		this._state.dices ? Object.values(this._state.dices) : [],
	)
	filteredList = (filter: (dice: DiceState) => boolean): DiceState[] => {
		return this.dicesList.value.filter(filter)
	}
	selectedList = computed<DiceState[]>(() =>
		this.filteredList(dice => dice.isSelected),
	)
	freeList = computed<DiceState[]>(() =>
		this.filteredList(dice => !dice.isStored && !dice.isSelected),
	)

	selectedScore = computed<number>(() => {
		const dices = this.selectedList.value

		if (dices.length === 0) return 0

		if (
			this._state.street &&
			dices.length >= 5 &&
			!this.isStreetUnfinished.value
		) {
			const selectedStreet = this.selectedStreet.value
			if (!selectedStreet) return 0
			let score = streetScores[selectedStreet.type]

			const bothDupesSelected = selectedStreet.duplicates?.every(
				dice => dice.isSelected,
			)
			if (bothDupesSelected)
				score += selectedStreet.duplicateValue === '1' ? 100 : 50

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
		const street = this._state.street,
			selectedList = this.selectedList.value

		if (!street || selectedList.every(dice => isSoloDice(dice))) return false

		return !this.selectedStreet.value
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

	setDices(set: (index: number) => Parameters<Dice['set']>): void {
		if (this._state.dices)
			this.dicesList.value.forEach((dice, index) => dice.set(...set(index)))
		else {
			// if "dices" are undefined
			// create new set of dices, and assign them to the board state
			const dices = {} as Record<DiceIndex, DiceState>
			for (const i of diceIndexes) {
				dices[i] = new Dice(i)
				dices[i].set(...set(i))
			}
			this._state.dices = dices

			const street = this.checkStreet(this.freeList.value)
			this.mutate('street', street)
		}
	}

	setDice(i: number, ...values: Parameters<Dice['set']>) {
		i >= 0 && i <= 5 && this._state.dices?.[i as DiceIndex].set(...values)
	}

	private selectedStreet = computed<PartialStreet | FullStreet | undefined>(
		() => {
			return this.selectedList.value.length >= 5
				? this.checkStreet(this.selectedList.value)
				: undefined
		},
	)

	private checkStreet(
		dices: DiceState[],
	): PartialStreet | FullStreet | undefined {
		const count = countValues(dices),
			missing = findKey(count, n => n === 0),
			missingLast = findLastKey(count, n => n === 0)

		const getDuplicates = () => {
			const dupes = getObjectDuplicates(dices, 'value')
			return dupes.length === 2
				? {
						duplicates: dupes as [DiceState, DiceState],
						duplicateValue: dupes[0].value,
				  }
				: {
						duplicates: null,
						duplicateValue: null,
				  }
		}

		if (missing === '1' && missingLast === '1') {
			const { duplicates, duplicateValue } = getDuplicates()
			return {
				type: '2-6',
				duplicates,
				duplicateValue,
			}
		}
		if (missing === '6' && missingLast === '6') {
			const { duplicates, duplicateValue } = getDuplicates()
			return {
				type: '1-5',
				duplicates,
				duplicateValue,
			}
		}
		if (!missing && !missingLast)
			return {
				type: '1-6',
				duplicates: null,
				duplicateValue: null,
			}
	}

	switchActivePlayer(player?: 0 | 1): 0 | 1 {
		this.mutate('activePlayer', player ?? (this.state.activePlayer ? 0 : 1))
		return this.state.activePlayer
	}

	userSelectDice(index: DiceIndex): DiceState | undefined {
		const dice = this._state.dices?.[index]

		if (!dice || dice.isDisabled || dice.isStored) return

		dice.isSelected = !dice.isSelected
		this.disableDices(dice)
		return dice
	}

	selectDice(index: DiceIndex, isSelected: boolean) {
		const dice = this._state.dices?.[index]
		if (!dice) return
		dice.set({ isSelected })
	}

	private disableDices(selectedDice: DiceState) {
		const disableWhileStreet = (): void => {
			const street = this._state.street as PartialStreet | FullStreet

			if (
				street.type === '1-6' ||
				!street.duplicates?.includes(selectedDice) ||
				['1', '5'].includes(street.duplicateValue ?? '')
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

	addTotalScore(): number {
		const state = this._state
		state.totalScore[state.activePlayer] +=
			state.storedScore + this.selectedScore.value
		state.storedScore = 0
		return state.totalScore[state.activePlayer]
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
