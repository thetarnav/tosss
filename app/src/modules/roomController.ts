export default class OnlineGame {
	readonly link: string
	constructor(readonly id: string) {
		this.link = window.origin + '/join/' + id
	}
}
