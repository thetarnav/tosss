import BOARD from '../Board'

export default function initHotseatGame() {
	BOARD.instance.controller = new HotseatController()
}

class HotseatController {
	constructor() {
		BOARD.instance.mutate('activePlayer', 0)
		BOARD.instance.mutate('dices', undefined)
		BOARD.instance.rollDices()
	}
}
