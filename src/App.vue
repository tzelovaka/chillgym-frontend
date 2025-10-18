<script setup>
import { faSquarePlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
</script>
<template>
  <div class="bg-slate-100 h-screen flex flex-col">

    <!-- Список дней недели -->
    <div class="flex-1 p-4 overflow-y-auto">
      <div class="flex justify-center flex-wrap gap-1">
        <button
          v-for="day in days"
          :key="day.id"
          @click="selectDay(day)"
          class="flex flex-col items-center justify-center w-10 h-16 rounded-xl border-2 transition-all duration-200 hover:scale-105"
          :class="{
            'border-blue-500 bg-blue-50 text-blue-700 font-semibold': day.id === selectedDayId,
            'border-slate-300 bg-white text-slate-700': day.id !== selectedDayId,
            'ring-2 ring-green-400': day.isToday,
          }"
        >
          <span class="text-lg font-medium">{{ day.shortName }}</span>
          <span class="text-lg font-bold">{{ day.date }}</span>
        </button>
      </div>

      <!-- Информация о выбранном дне -->
      <div v-if="selectedDay" class="mt-6 p-4 bg-white rounded-lg shadow">
        <div class="text-lg font-semibold text-slate-800 flex items-center">
          <div class="flex">Тренировка на</div>
          <div class="mx-2 bg-blue-600 w-36 text-white p-1 rounded-lg text-center">
            {{ selectedDay.shortName }}
            {{ date.getDay() + '.' + date.getMonth() + '.' + date.getFullYear() }}
          </div>
        </div>
        <div class="text-md text-slate-800 flex items-center">
          Выходной
          <input v-model="isWeekend" type="checkbox" class="mx-2" />
        </div>
        <div
          @click="addExercise()"
          class="flex w-full h-24 items-center justify-center bg-blue-200 active:bg-accent-500 rounded-xl mt-2"
        >
          <div class="text-lg">
            <FontAwesomeIcon :icon="faSquarePlus" class="text-7xl text-white" />
          </div>
        </div>
        <div v-for="exercise in exercises" :key="exercise.id" class="mt-2">
          <div v-if="exercise.dayId === selectedDayId" class="border border-2 border-slate-300 rounded-full py-1 px-2">
            <select
              v-model="exercise.exerciseTemplateId"
              @change="saveExerciseTemplate(exercise)"
              class="w-full bg-transparent border-none outline-none"
            >
              <option :value="null">Выберите упражнение</option>
              <option
                v-for="template in exerciseTemplates"
                :key="template.id"
                :value="template.id"
              >
                {{ template.name }} ({{ template.trainer.name }})
              </option>
            </select>

            <!-- Отображение выбранного упражнения (опционально) -->
            <div v-if="getExerciseTemplateName(exercise.exerciseTemplateId)" class="text-sm text-gray-600">
              {{ getExerciseTemplateName(exercise.exerciseTemplateId) }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <NavigationBar />
  </div>
</template>

<script>
import NavigationBar from './components/NavigationBar.vue'

export default {
  name: 'WorkoutCalendar',
  components: {
    NavigationBar,
  },
  data() {
    return {
      date: new Date(),
      exerciseTemplates: [ //приходит с бэка
        {
          id: 1,
          name: 'Приседания в гакк-машине',
          trainer: {
            id: 1,
            name: 'Гакк-машина'
          }
        }
      ],
      exercises: [],
      days: [
        { id: 1, shortName: 'Пн', fullName: 'Понедельник', isToday: false },
        { id: 2, shortName: 'Вт', fullName: 'Вторник', isToday: false },
        { id: 3, shortName: 'Ср', fullName: 'Среда', isToday: false },
        { id: 4, shortName: 'Чт', fullName: 'Четверг', isToday: false },
        { id: 5, shortName: 'Пт', fullName: 'Пятница', isToday: false },
        { id: 6, shortName: 'Сб', fullName: 'Суббота', isToday: false },
        { id: 7, shortName: 'Вс', fullName: 'Воскресенье', isToday: false },
      ],
      selectedDayId: this.getTodayId(),
      isWeekend: false,
    }
  },
  computed: {
    selectedDay() {
      return this.days.find((day) => day.id === this.selectedDayId)
    },
  },
  watch: {
    isWeekend(newValue, oldValue) {
      console.log(newValue, oldValue)
    },
  },
  methods: {
    addExercise() {
      let exercisesFilteredLength = this.exercises.filter(
        (exercise) => exercise.dayId === this.selectedDayId
      ).length;

      let exercise = {
        id: exercisesFilteredLength > 1 ? exercisesFilteredLength - 1 : (exercisesFilteredLength > 0 ? 2 : 1),
        dayId: this.selectedDayId,
        exerciseTemplateId: null,
        approaches: null,
        rangeOfRepetitions: null
      }
      this.exercises.push(exercise)
    },
    getTodayId() {
      const day = new Date().getDay()
      return day === 0 ? 7 : day
    },
    selectDay(day) {
      this.selectedDayId = day.id
    },
    saveExerciseTemplate(exercise) {
      console.log('Сохранено упражнение:', exercise);
    },
    getExerciseTemplateName(templateId) {
      if (!templateId) return null;
      const template = this.exerciseTemplates.find(t => t.id === templateId);
      return template ? `${template.name} (${template.trainer.name})` : null;
    }
  },
}
</script>
