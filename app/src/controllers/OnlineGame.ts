import BOARD, { PublicBoardState } from '@/modules/Board'
import ROOM from '@/modules/OnlineRoom'
import { BoardController } from '@/modules/types'
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
		}

		ROOM.instance.listen('game_roll', this.handleRoll.bind(this))
		ROOM.instance.listen('game_select', this.handleSelect.bind(this))
	}

	get playerNames(): [string, string] {
		const { username, opponent } = ROOM.instance.refs
		return [username.value, opponent.value]
	}

	private get isPlayerActive(): boolean {
		return this.boardState.activePlayer === 0
	}

	select(index: DiceIndex) {
		if (!this.isPlayerActive || this.actionsDisabled) return
		const dice = BOARD.instance.userSelectDice(index)
		if (dice) ROOM.instance.emit('game_select', index, dice.isSelected)
	}

	private emitRoll(): void {
		const dices: DiceProps[] = BOARD.instance.dicesList.value.map(dice => ({
			value: dice.value,
			isSelected: dice.isSelected,
			isStored: dice.isStored,
		}))
		ROOM.instance.emit('game_roll', dices)
	}

	private handleRoll(dices: DiceProps[]) {
		if (this.isPlayerActive) return
		BOARD.instance.setDices(i => [
			{
				value: dices[i].value,
				isSelected: dices[i].isSelected,
				isStored: dices[i].isStored,
			},
			true,
		])
	}

	private handleSelect(index: DiceIndex, isSelected: boolean) {
		if (this.isPlayerActive) return
		BOARD.instance.selectDice(index, isSelected)
	}
}
