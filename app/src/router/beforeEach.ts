import BOARD from '@/modules/Board'
import { NavigationGuard } from 'vue-router'

const beforeEach: NavigationGuard = (to, from, next) => {
	// Destroy the board controller when leaving the Board route
	if (from.name === 'Board') {
		BOARD.instance.controller.value = undefined
		next()
		return
	}

	// Block access to the Board without board controller initialized
	if (to.name === 'Board' && !BOARD.instance.controller.value) {
		return
	}

	next()
}
export default beforeEach
