import BOARD, { PublicBoardState } from '@/modules/Board'
import summonModal from '@/modules/modal/modalController'
import { BoardController, DiceIndex } from '@/modules/types'
import router from '@/router/router'

export default function initHotseatGame() {
	BOARD.instance.controller.value = new HotseatController()
}

class HotseatController implements BoardController {
	private boardState: PublicBoardState
	private actionsDisabled = false

	turnLost = false

	constructor() {
		BOARD.instance.fullClear()
		this.boardState = BOARD.instance.state
		do {
			BOARD.instance.rollDices(true)
		} while (!BOARD.instance.isPlayable.value)
	}

	get rollDisabled() {
		return this.actionsDisabled || BOARD.instance.disabled.value
	}
	get takeDisabled() {
		return this.actionsDisabled || BOARD.instance.disabled.value
	}

	select(index: DiceIndex) {
		if (!this.actionsDisabled) BOARD.instance.selectDice(index)
	}

	roll() {
		if (this.rollDisabled) return
		BOARD.instance.storeSelected()
		// If all dices are selected or stored, roll will roll all of them, giving player bonus turn.
		if (BOARD.instance.freeList.value.length === 0)
			BOARD.instance.rollDices(true)
		else BOARD.instance.rollDices()
		// Check if player lost after rolling
		if (!BOARD.instance.isPlayable.value) {
			BOARD.instance.mutate('storedScore', 0)
			this.onTurnLost()
		}
	}

	take() {
		if (this.takeDisabled) return

		// Add stored & selected points to player's total
		BOARD.instance.addTotalScore()

		// Check if player won
		{
			const { activePlayer, totalScore } = this.boardState
			if (totalScore[activePlayer] >= 2000)
				return this.playerWon(activePlayer)
		}

		// Switch sides
		BOARD.instance.rollDices(true)
		BOARD.instance.switchActivePlayer()

		// Check if player lost his turn immediately
		if (!BOARD.instance.isPlayable.value) this.onTurnLost()
	}

	private onTurnLost() {
		this.actionsDisabled = true
		this.turnLost = true
		setTimeout(() => {
			BOARD.instance.rollDices(true)
			BOARD.instance.switchActivePlayer()
			this.actionsDisabled = false
			this.turnLost = false
		}, 1500)
	}

	private playerWon(playerIndex: 0 | 1) {
		this.actionsDisabled = true
		BOARD.instance.mutate('dices', undefined)
		summonModal({
			title: 'Player ' + playerIndex,
			text: 'won this round!',
			closable: false,
			fireworks: true,
			buttons: [
				{
					text: 'Quit',
					action: () => this.playerQuit(),
				},
				{
					text: 'Play Again!',
					action: () => this.playAgain(),
				},
			],
		})
	}

	private playerQuit() {
		router.push('/')
		BOARD.instance.controller.value = undefined
		BOARD.instance.fullClear()
	}

	private playAgain() {
		BOARD.instance.fullClear()
		BOARD.instance.rollDices(true)
		this.actionsDisabled = false
	}
}
