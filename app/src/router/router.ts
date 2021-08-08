import { createRouter, createWebHistory } from 'vue-router'

const routes = [
	{ path: '/', name: 'Home', component: () => import('@/views/Home.vue') },
	{
		// not-found
		path: '/:pathMatch(.*)*',
		redirect: '/',
	},
	{
		path: '/online',
		name: 'Online',
		component: () => import('@/views/Online/index.vue'),
		redirect: { name: 'Create' },
		children: [
			{
				path: '/create',
				name: 'Create',
				component: () => import('@/views/Online/OnlineCreate.vue'),
			},
			{
				path: '/join/:roomID',
				name: 'Join',
				component: () => import('@/views/Online/OnlineJoin.vue'),
			},
		],
	},
	{
		path: '/board',
		name: 'Board',
		component: () => import('@/views/Board/_Board.vue'),
	},
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

export default router
