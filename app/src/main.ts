// Global Composition API imports
import 'vue-global-api/ref'
import 'vue-global-api/reactive'
import 'vue-global-api/computed'
import 'vue-global-api/watch'

import { createApp } from 'vue'
import router from './router/router'
import App from './App.vue'

// CSS
import './styles/main.css'

createApp(App).use(router).mount('#app')
