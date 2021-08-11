import BOARD, { PublicBoardState } from '@/modules/Board'
import ROOM from '@/modules/OnlineRoom'
import { BoardController, streetScores } from '@/modules/types'
import { DiceIndex, DiceProps, PlayingRole } from '@common/types'

export default function initOnlineGame(role: PlayingRole) {
	BOARD.instance.controller.value = new OnlineController(role)
}

class OnlineController implements BoardController {
	private boardState: PublicBoardState
	private actionsDisabled = false

	turnLost = false

	constructor(private role: PlayingRole) {
		BOARD.instance.fullClear()
		this.boardState = BOARD.instance.state

		if (role === 'creator') {
			do {
				BOARD.instance.rollDices(true)
			} while (!BOARD.instance.isPlayable.value)
			this.emitRoll()
		} else {
			BOARD.instance.rollDices(true)
			BOARD.instance.switchActivePlayer()
			this.actionsDisabled = true
		}

		ROOM.instance.listen('game_roll', this.handleRoll.bind(this))
		ROOM.instance.listen('game_select', this.handleSelect.bind(this))
		ROOM.instance.listen('game_turn_lost', this.handleLost.bind(this))
	}

	get playerNames(): [string, string] {
		const { username, opponent } = ROOM.instance.refs
		return [username.value, opponent.value]
	}

	get rollDisabled() {
		return BOARD.instance.disabled.value || this.actionsDisabled
	}
	get takeDisabled() {
		return BOARD.instance.disabled.value || this.actionsDisabled
	}

	private get isPlayerActive(): boolean {
		return this.boardState.activePlayer === 0
	}

	select(index: DiceIndex) {
		if (this.actionsDisabled) return
		const dice = BOARD.instance.userSelectDice(index)
		if (dice) ROOM.instance.emit('game_select', index, dice.isSelected)
	}

	private handleSelect(index: DiceIndex, isSelected: boolean) {
		if (this.isPlayerActive) return
		BOARD.instance.selectDice(index, isSelected)
	}

	roll() {
		if (this.rollDisabled) return
		BOARD.instance.storeSelected()
		// If all dices are selected or stored, roll will roll all of them, giving player bonus turn.
		if (BOARD.instance.freeList.value.length === 0)
			BOARD.instance.rollDices(true)
		else BOARD.instance.rollDices()
		this.emitRoll()
		// Check if player lost after rolling
		this.checkTurnLost()
	}

	private emitRoll(): void {
		const dices: DiceProps[] = BOARD.instance.dicesList.value.map(dice => ({
				value: dice.value,
				isSelected: dice.isSelected,
				isStored: dice.isStored,
			})),
			score = this.boardState.storedScore
		ROOM.instance.emit('game_roll', dices, score)
	}

	private handleRoll(dices: DiceProps[], storedScore: number) {
		if (this.isPlayerActive) return
		BOARD.instance.setDices(i => [
			{
				value: dices[i].value,
				isSelected: dices[i].isSelected,
				isStored: dices[i].isStored,
			},
			true,
		])
		BOARD.instance.mutate('storedScore', storedScore)
	}

	private checkTurnLost() {
		!BOARD.instance.isPlayable.value && this.onTurnLost()
	}

	private onTurnLost() {
		this.actionsDisabled = true
		this.turnLost = true
		BOARD.instance.mutate('storedScore', 0)
		ROOM.instance.emit('game_turn_lost')
		setTimeout(() => {
			BOARD.instance.mutate('dices', undefined)
			BOARD.instance.switchActivePlayer()
			this.turnLost = false
		}, 1500)
	}

	private handleLost() {
		if (this.isPlayerActive) return
		this.actionsDisabled = true
		this.turnLost = true
		BOARD.instance.mutate('storedScore', 0)
		setTimeout(() => {
			BOARD.instance.rollDices(true)
			BOARD.instance.switchActivePlayer()
			this.turnLost = false
			this.actionsDisabled = false
			this.emitRoll()
			this.checkTurnLost()
		}, 1500)
	}
}
