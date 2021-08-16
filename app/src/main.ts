// Global Composition API imports
import 'vue-global-api/ref'
import 'vue-global-api/reactive'
import 'vue-global-api/computed'
import 'vue-global-api/watch'

import { createApp } from 'vue'
import router from './router/router'
import App from './App.vue'
import Button from './components/Button.vue'

// CSS
import './styles/tailwind.css'
import './styles/base.css'
import './styles/main.css'

createApp(App).use(router).component('Button', Button).mount('#app')
