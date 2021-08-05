import { Server } from 'socket.io'
import express from 'express'
import http from 'http'
import { ClientEventsMap, ServerEventsMap } from '@common/socketEventsMap'
import handleConnection from './connection'

const app = express(),
	server = http.createServer(app)

export const io = new Server<ClientEventsMap, ServerEventsMap>(server, {
	cors: {
		origin: ['http://localhost:3000', 'http://192.168.1.11:3000'],
		methods: ['GET', 'POST'],
	},
})

io.on('connection', socket => handleConnection(socket))

app.get('/', (req, res) => {
	res.send('<h1>Hello world</h1>')
})

server.listen(8080, () => {
	console.log('Listening on localhost:8080')
})
