<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
</script>
<template>
  <div class="bg-white py-4 rounded-t-xl flex justify-evenly">
    <div v-for="menuItem in menuItems" :key="menuItem" class="text-lg flex flex-col items-center">
      <FontAwesomeIcon :icon="menuItem.iconName" class="text-3xl text-blue-500"/> <div class="text-xs">{{menuItem.name}}</div>
    </div>
  </div>
</template>
<script>
import {faDumbbell, faCalendarWeek, faDatabase} from '@fortawesome/free-solid-svg-icons'

export default {
  name: "NavigationBar",
  data(){
    return {
      menuItems: [
        {
          name: 'Календарь',
          iconName: faCalendarWeek,
        },
        {
          name: 'Тренировка',
          iconName: faDumbbell,
        },
        {
          name: 'Упражнения',
          iconName: faDatabase
          ,
        }
      ]
    }
  }
}
</script>
<style scoped>

</style>
