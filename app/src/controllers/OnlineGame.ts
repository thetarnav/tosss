import BOARD, { PublicBoardState } from '@/modules/Board'
import summonModal from '@/modules/modal/modalController'
import ROOM from '@/modules/OnlineRoom'
import { BoardController, streetScores } from '@/modules/types'
import router from '@/router/router'
import { DiceIndex, DiceProps, PlayingRole } from '@common/types'

export default function initOnlineGame(role: PlayingRole) {
	BOARD.instance.controller.value = new OnlineController(role)
}

class OnlineController implements BoardController {
	private boardState: PublicBoardState
	private actionsDisabled = false

	turnLost = false

	constructor(role: PlayingRole) {
		BOARD.instance.fullClear()
		this.boardState = BOARD.instance.state

		if (role === 'creator') {
			do {
				BOARD.instance.rollDices(true)
			} while (!BOARD.instance.isPlayable.value)
			this.emitRoll()
		} else {
			BOARD.instance.rollDices(true)
			BOARD.instance.switchActivePlayer(1)
			this.actionsDisabled = true
		}

		ROOM.instance.listen('game_roll', this.handleRoll.bind(this))
		ROOM.instance.listen('game_select', this.handleSelect.bind(this))
		ROOM.instance.listen('game_turn_lost', this.handleLost.bind(this))
		ROOM.instance.listen('game_turn_scored', this.handleTurnScored.bind(this))
		ROOM.instance.listen('game_won', this.handleOpponentWon.bind(this))
	}

	get playerNames(): [string, string] {
		const { username, opponent } = ROOM.instance.refs
		return [username.value, opponent.value]
	}

	get rollDisabled() {
		return (
			BOARD.instance.disabled.value ||
			this.actionsDisabled ||
			!this.isPlayerActive
		)
	}
	get takeDisabled() {
		return (
			BOARD.instance.disabled.value ||
			this.actionsDisabled ||
			!this.isPlayerActive
		)
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

	take() {
		if (this.takeDisabled) return

		// Add stored & selected points to player's total
		const totalScore = BOARD.instance.addTotalScore()
		BOARD.instance.mutate('dices', undefined)

		// Check if player won
		if (totalScore >= 2000) return this.IWin(totalScore)

		// Switch sides
		BOARD.instance.switchActivePlayer(1)
		ROOM.instance.emit('game_turn_scored', totalScore)
	}

	handleTurnScored(total: number) {
		BOARD.instance.mutate('totalScore', a => [a[0], total])
		BOARD.instance.mutate('storedScore', 0)
		BOARD.instance.rollDices(true)
		BOARD.instance.switchActivePlayer(0)
		this.actionsDisabled = false
		this.emitRoll()
		this.checkTurnLost()
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
			BOARD.instance.switchActivePlayer(1)
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
			BOARD.instance.switchActivePlayer(0)
			this.turnLost = false
			this.actionsDisabled = false
			this.emitRoll()
			this.checkTurnLost()
		}, 1500)
	}

	private IWin(totalScore: number) {
		this.actionsDisabled = true
		ROOM.instance.emit('game_won', totalScore)
		ROOM.instance.mutate('awaitingStart', true)
		summonModal({
			title: this.playerNames[0],
			text: 'won this round!',
			closable: false,
			fireworks: true,
			buttons: [
				{
					text: 'Quit',
					action: this.quit.bind(this),
				},
				{
					text: 'Play Again!',
					action: this.playAgain.bind(this),
				},
			],
		})
	}

	private handleOpponentWon(total: number) {
		if (ROOM.instance.state.awaitingStart) return
		ROOM.instance.mutate('awaitingStart', true)
		this.actionsDisabled = true
		BOARD.instance.mutate('dices', undefined)
		BOARD.instance.mutate('storedScore', 0)
		BOARD.instance.mutate('totalScore', a => [a[0], total])
		summonModal({
			title: this.playerNames[1],
			text: 'won this round!',
			closable: false,
			fireworks: true,
			buttons: [
				{
					text: 'Quit',
					action: this.quit.bind(this),
				},
				{
					text: 'Play Again!',
					action: this.playAgain.bind(this),
				},
			],
		})
	}

	private quit() {
		router.push('/')
		BOARD.instance.controller.value = undefined
		BOARD.instance.fullClear()
		ROOM.disconnect()
	}

	private playAgain() {
		ROOM.instance.emit('player_ready')
	}
}
