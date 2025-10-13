<template>
  <div class="bg-slate-100 h-screen flex flex-col">
    <!-- Заголовок -->
    <header class="p-4 bg-slate-800 text-white text-center">
      <h1 class="text-xl font-bold">Моя тренировочная неделя</h1>
      <p class="text-sm opacity-80">Выберите день для настройки программы</p>
    </header>

    <!-- Список дней недели -->
    <div class="flex-1 p-4 overflow-y-auto">
      <div class="flex justify-center flex-wrap gap-3">
        <button
          v-for="day in days"
          :key="day.id"
          @click="selectDay(day)"
          class="flex flex-col items-center justify-center w-16 h-16 rounded-xl border-2 transition-all duration-200 hover:scale-105"
          :class="{
            'border-blue-500 bg-blue-50 text-blue-700 font-semibold': day.id === selectedDayId,
            'border-slate-300 bg-white text-slate-700': day.id !== selectedDayId,
            'ring-2 ring-green-400': day.isToday
          }"
        >
          <span class="text-lg font-medium">{{ day.shortName }}</span>
          <span class="text-lg font-bold">{{ day.date }}</span>
        </button>
      </div>

      <!-- Информация о выбранном дне -->
      <div v-if="selectedDay" class="mt-6 p-4 bg-white rounded-lg shadow">
        <h2 class="text-lg font-semibold text-slate-800">
          Тренировка на {{ selectedDay.fullName }}
        </h2>
        <p class="text-slate-600 mt-2">
          Здесь вы сможете добавить упражнения, изменить интенсивность или отменить тренировку.
        </p>
        <div class="mt-4 flex gap-2">
          <button class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Настроить
          </button>
          <button class="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">
            Отменить
          </button>
        </div>
      </div>
    </div>

    <!-- Навигация -->
    <NavigationBar />
  </div>
</template>

<script>
import NavigationBar from './components/NavigationBar.vue'

export default {
  name: 'WorkoutCalendar',
  components: {
    NavigationBar
  },
  data() {
    return {
      // Пример данных на текущую неделю
      days: [
        { id: 1, shortName: 'Пн', fullName: 'Понедельник', isToday: false },
        { id: 2, shortName: 'Вт', fullName: 'Вторник', isToday: false },
        { id: 3, shortName: 'Ср', fullName: 'Среда', isToday: false },
        { id: 4, shortName: 'Чт', fullName: 'Четверг', isToday: false },
        { id: 5, shortName: 'Пт', fullName: 'Пятница', isToday: false },
        { id: 6, shortName: 'Сб', fullName: 'Суббота', isToday: false },
        { id: 7, shortName: 'Вс', fullName: 'Воскресенье', isToday: false }
      ],
      selectedDayId: 3 // по умолчанию — сегодня
    }
  },
  computed: {
    selectedDay() {
      return this.days.find(day => day.id === this.selectedDayId)
    }
  },
  methods: {
    selectDay(day) {
      this.selectedDayId = day.id
    }
  }
}
</script>
