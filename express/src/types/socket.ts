import { ClientEventsMap, ServerEventsMap } from '@common/socketEventsMap'
import { Socket as DefaultSocket, Server as DefaultServer } from 'socket.io'

export type Socket = DefaultSocket<ClientEventsMap, ServerEventsMap>
export type Server = DefaultServer<ClientEventsMap, ServerEventsMap>
