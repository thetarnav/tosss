import BOARD from '@/modules/Board'
import { BoardController } from '@/modules/types'

export default function initHotseatGame() {
	BOARD.instance.controller.value = new HotseatController()
}

class HotseatController implements BoardController {
	constructor() {
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

	roll() {
		if (this.rollDisabled) return
		BOARD.instance.storeSelected()
		BOARD.instance.rollDices()
		// Check if player lost after roll
		if (!BOARD.instance.isPlayable.value) {
			BOARD.instance.mutate('storedScore', 0)
			BOARD.instance.rollDices(true)
			BOARD.instance.switchActivePlayer()
		}
	}

	take() {
		if (this.takeDisabled) return
		BOARD.instance.addTotalScore()
		BOARD.instance.rollDices(true)
		BOARD.instance.switchActivePlayer()

		// Check if player lost immediately
		if (!BOARD.instance.isPlayable.value) {
			BOARD.instance.rollDices(true)
			BOARD.instance.switchActivePlayer()
		}
	}
}
