<template>
  <div class="bg-white py-4 rounded-t-xl flex justify-evenly">
    <div v-for="menuItem in menuItems" :key="menuItem" class="text-lg">
      {{menuItem}}
    </div>
  </div>
</template>
<script>
export default {
  name: "NavigationBar",
  data(){
    return {
      menuItems: ['Календарь', 'Тренировка', 'Упражнения']
    }
  }
}
</script>
<style scoped>

</style>
