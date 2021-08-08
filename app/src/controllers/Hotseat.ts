import BOARD, { PublicBoardState } from '@/modules/Board'
import summonModal from '@/modules/modal/modalController'
import { BoardController, DiceIndex } from '@/modules/types'
import router from '@/router/router'

export default function initHotseatGame() {
	BOARD.instance.controller.value = new HotseatController()
}

class HotseatController implements BoardController {
	private boardState: PublicBoardState

	constructor() {
		this.boardState = BOARD.instance.state
		BOARD.instance.mutate('activePlayer', 0)
		do {
			BOARD.instance.rollDices(true)
		} while (!BOARD.instance.isPlayable.value)
	}

	get rollDisabled() {
		return (
			BOARD.instance.disabled.value ||
			// Also disable roll when there is no more dices to play with (selected or stored all of them)
			BOARD.instance.freeList.value.length === 0
		)
	}
	get takeDisabled() {
		return BOARD.instance.disabled.value
	}

	select(index: DiceIndex) {
		if (
			BOARD.instance.state.winner === undefined &&
			BOARD.instance.state.lostRound === false
		)
			BOARD.instance.selectDice(index)
	}

	roll() {
		if (this.rollDisabled) return
		BOARD.instance.storeSelected()
		BOARD.instance.rollDices()
		// Check if player lost after rolling
		if (!BOARD.instance.isPlayable.value) {
			BOARD.instance.mutate('storedScore', 0)
			BOARD.instance.rollDices(true)
			BOARD.instance.switchActivePlayer()
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
		if (!BOARD.instance.isPlayable.value) {
			BOARD.instance.rollDices(true)
			BOARD.instance.switchActivePlayer()
		}
	}

	private playerWon(playerIndex: 0 | 1) {
		BOARD.instance.mutate('winner', playerIndex)
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
		BOARD.instance.fullClear()
	}

	private playAgain() {
		BOARD.instance.fullClear()
		initHotseatGame()
	}
}
