import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import naive from 'naive-ui/es/preset'

import { createRouter, createWebHistory } from 'vue-router'
import ChatRoom from './components/ChatRoom.vue'
import ProChat from './components/ProChat.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {path: '/', component: ChatRoom, props: true},
        {path: '/index', component: ChatRoom, props: true},
        {path: '/pro', component: ProChat}
    ]
})


const app = createApp(App)
app.use(naive)
app.use(router)
app.mount('#app')




