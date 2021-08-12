import { removeFromArray } from '@common/functions'
import { createApp } from 'vue'
import Modal from './Modal.vue'

export type ButtonType = {
	text: string
	action: () => void
}

interface SummonOptions {
	text: string
	title?: string
	closable?: boolean
	fireworks?: boolean
	buttons?: ButtonType[]
}

const modals:Function[] = []

export function closeAllModals(){
	modals.forEach(close => close())
}

export default function summonModal({
	text,
	title,
	closable,
	fireworks,
	buttons,
}: SummonOptions) {
	const container = document.createElement('div')
	document.body.appendChild(container)
	const app = createApp(Modal, {
		text,
		title,
		closable,
		fireworks,
		buttons,
		close,
	})
	app.mount(container)

	function close() {
		app.unmount()
		container.remove()
		removeFromArray(modals, close)
	}

	modals.push(close)

	return close
}
