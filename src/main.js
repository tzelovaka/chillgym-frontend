import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Функция инициализации Telegram Web App
function initializeTelegramApp() {
  try {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;

      // Дожидаемся полной инициализации
      tg.ready();

      // Основные настройки
      tg.disableVerticalSwipes();
      tg.expand();

      // Настройка темы
      tg.setHeaderColor('#000000');
      tg.setBackgroundColor('#ffffff');

      // Дополнительные улучшения
      tg.enableClosingConfirmation();

      console.log('Telegram Web App initialized successfully');
      return tg;
    }
  } catch (error) {
    console.warn('Telegram Web App initialization failed:', error);
  }
  return null;
}

// Инициализируем перед монтированием
const tg = initializeTelegramApp();

// Если нужно использовать tg в компонентах
if (tg) {
  app.config.globalProperties.$tg = tg;

  // Также можно провайдить tg через provide/inject
  app.provide('telegram', tg);
}

app.mount('#app')
