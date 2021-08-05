import { createRouter, createWebHistory } from 'vue-router'

const routes = [
	{ path: '/', name: 'Home', component: () => import('@/views/Home.vue') },
	{
		path: '/online',
		name: 'Online',
		component: () => import('@/views/OnlineCreate.vue'),
	},
	{
		path: '/join/:roomID',
		name: 'Join',
		component: () => import('@/views/OnlineJoin.vue'),
	},
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

export default router
