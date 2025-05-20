import './assets/main.css'

import 'vue-multiselect/dist/vue-multiselect.css'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/swiper-bundle.css'
import ResponseDisplayer from './components/ResponseDisplayer.vue'
import * as LucideIcons from 'lucide-vue-next'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// Option 1: Register all icons globally
for (const [key, icon] of Object.entries(LucideIcons)) {
  app.component(key, icon)
}
app.component('ResponseDisplayer', ResponseDisplayer)
app.use(createPinia())
app.use(router)

app.mount('#app')
