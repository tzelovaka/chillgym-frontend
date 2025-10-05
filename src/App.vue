<template>
  <div class="flex flex-col" style="position: relative; height: 100vh; overflow: hidden;">
    <div
      ref="listContainer"
      class="bg-gray-500"
      style="height: 50vh; overflow-y: auto; padding: 16px; position: relative;"
    >
      <div
        v-for="(item) in items"
        :key="item.id"
        :ref="(el) => { if (el) itemRefs[item.id] = el }"
        @touchstart="handleTouchStart($event, item)"
        @touchend="handleTouchEnd"
        @touchmove="handleTouchMove"
        style="
          position: relative;
          touch-action: none;
          user-select: none;
          cursor: grab;
          padding: 12px;
          background: #f0f0f0;
          border: 1px solid #ccc;
          border-radius: 6px;
          margin-bottom: 12px;
          transition: transform 0.3s ease, opacity 0.3s ease;
        "
        :style="{
          transform: getItemTransform(item.id),
          opacity: activeItemId === item.id ? 0.4 : 1,
          zIndex: activeItemId === item.id ? 1 : 0,
        }"
      >
        Drag me! I am item {{ item.id }}
      </div>
    </div>

    <button
      @click="handleAddDay"
      style="
        margin: 16px;
        padding: 10px 20px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
      "
    >
      Добавить тренажёр
    </button>

    <div>Привет</div>
  </div>
</template>

<script>
export default {
  name: 'DraggableComponent',
  data() {
    return {
      items: [
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ],
      itemRefs: {},
      activeItemId: null,
      draggedItem: null,
      currentClone: null,
      isDragging: false,
      // Новые свойства для оптимизации
      lastTargetIndex: -1,
      updateThrottle: null,
      shiftY: 0, // Смещение для анимации
      originalPositions: {}, // Оригинальные позиции элементов
    }
  },
  methods: {
    handleAddDay() {
      const id = Date.now()
      this.items.push({ id })
    },

    handleTouchStart(e, item) {
      e.preventDefault()
      const el = this.itemRefs[item.id]
      if (!el || this.isDragging) return

      this.isDragging = true
      this.activeItemId = item.id
      this.draggedItem = item
      this.lastTargetIndex = -1

      // Сохраняем оригинальные позиции всех элементов
      this.cacheOriginalPositions()

      const touch = e.touches[0]
      const rect = el.getBoundingClientRect()
      this.startY = touch.clientY
      this.initialOffsetY = touch.clientY - rect.top

      // Создаём клон
      const clone = el.cloneNode(true)
      clone.style.position = 'fixed'
      clone.style.zIndex = '9999'
      clone.style.pointerEvents = 'none'
      clone.style.opacity = '0.9'
      clone.style.transform = 'scale(1.02)'
      clone.style.margin = '0'
      clone.style.boxShadow = '0 6px 16px rgba(0,0,0,0.3)'
      clone.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease'
      clone.id = ''

      clone.style.left = (touch.clientX - el.offsetWidth / 2) + 'px'
      clone.style.top = (touch.clientY - this.initialOffsetY) + 'px'
      clone.style.width = el.offsetWidth + 'px'

      document.body.appendChild(clone)
      this.currentClone = clone

      // Небольшая задержка для плавности
      setTimeout(() => {
        if (this.currentClone) {
          this.currentClone.style.transform = 'scale(1.05)'
          this.currentClone.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)'
        }
      }, 10)
    },

    cacheOriginalPositions() {
      this.originalPositions = {}
      this.items.forEach((item) => {
        const el = this.itemRefs[item.id]
        if (el) {
          this.originalPositions[item.id] = {
            top: el.offsetTop,
            height: el.offsetHeight
          }
        }
      })
    },

    handleTouchMove(e) {
      if (!this.isDragging || !this.currentClone) return
      e.preventDefault()

      const touch = e.touches[0]
      this.currentClone.style.left = (touch.clientX - this.currentClone.offsetWidth / 2) + 'px'
      this.currentClone.style.top = (touch.clientY - this.initialOffsetY) + 'px'

      const container = this.$refs.listContainer
      const containerRect = container.getBoundingClientRect()

      // Если вне контейнера — ничего не делаем
      if (touch.clientY < containerRect.top || touch.clientY > containerRect.bottom) {
        return
      }
      // Троттлинг обновлений для уменьшения мерцания
      if (this.updateThrottle) {
        cancelAnimationFrame(this.updateThrottle)
      }

      this.updateThrottle = requestAnimationFrame(() => {
        this.updateItemPositions(touch)
      })

    },

    updateItemPositions(touch) {
      // Находим элемент, ближайший к пальцу по вертикали
      let targetIndex = -1
      let minDist = Infinity

      for (let i = 0; i < this.items.length; i++) {
        const item = this.items[i]
        if (item.id === this.activeItemId) continue

        const el = this.itemRefs[item.id]
        if (!el) continue

        const rect = el.getBoundingClientRect()
        const centerY = rect.top + rect.height / 4
        const dist = Math.abs(touch.clientY - centerY)
        if (dist < minDist) {
          minDist = dist
          targetIndex = i
        }
      }

      // Если достаточно близко к какому-то элементу и позиция изменилась
      if (targetIndex !== -1 && minDist < 10 && targetIndex !== this.lastTargetIndex) {
        const currentIndex = this.items.findIndex(i => i.id === this.activeItemId)
        if (currentIndex !== -1 && currentIndex !== targetIndex) {
          // Обновляем массив только если позиция действительно изменилась
          const newItems = [...this.items]
          const [movedItem] = newItems.splice(currentIndex, 1)
          newItems.splice(targetIndex, 0, movedItem)
          this.items = newItems
          this.lastTargetIndex = targetIndex
        }
      }
    },

    getItemTransform(itemId) {
      if (itemId === this.activeItemId) {
        return 'scale(0.95)'
      }
      return 'none'
    },

    handleTouchEnd() {
      if (!this.isDragging) return

      // Анимация завершения для клона
      if (this.currentClone) {
        this.currentClone.style.transition = 'all 0.3s ease'
        this.currentClone.style.opacity = '0'
        this.currentClone.style.transform = 'scale(0.8)'

        setTimeout(() => {
          if (this.currentClone && this.currentClone.parentNode) {
            document.body.removeChild(this.currentClone)
          }
        }, 300)
      }

      // Сбрасываем состояние
      this.cleanup()
    },

    cleanup() {
      if (this.updateThrottle) {
        cancelAnimationFrame(this.updateThrottle)
        this.updateThrottle = null
      }

      this.currentClone = null
      this.activeItemId = null
      this.draggedItem = null
      this.isDragging = false
      this.lastTargetIndex = -1
      this.originalPositions = {}
    },
  },
  beforeUnmount() {
    this.cleanup()
  },
}
</script>
