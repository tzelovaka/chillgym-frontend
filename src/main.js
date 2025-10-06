import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Инициализация Telegram Web App ДО монтирования приложения
if (window.Telegram?.WebApp) {
  const tg = window.Telegram.WebApp;

  // Инициализация с отключенными свайпами
  tg.disableVerticalSwipes();
  tg.expand();

  // Устанавливаем тему
  tg.setHeaderColor('#000000');
  tg.setBackgroundColor('#ffffff');

  // Дополнительные настройки для лучшего UX
  tg.enableClosingConfirmation(); // Запрос подтверждения при закрытии
  tg.MainButton.setParams({
    color: '#000000',
    text_color: '#ffffff'
  });

  // Можно также сохранить tg в глобальной переменной для доступа из компонентов
  app.config.globalProperties.$tg = tg;
}

app.mount('#app')
