<template>
  <div class="flex flex-col h-screen relative overflow-hidden font-sans">
    <!-- Верхний список (без сортировки!) -->
    <div
      ref="targetContainer"
      class="bg-amber-50 border-b border-orange-500 overflow-y-auto"
      style="height: 40vh"
    >
      <div
        v-if="targetItems.length === 0"
        class="h-full flex items-center justify-center text-orange-600 text-sm font-medium"
      >
        Перетащите сюда тренажёры
      </div>
      <div
        v-for="item in targetItems"
        :key="`target-${item.id}`"
        @touchstart.passive="onTouchStart(item, 'target')"
        @touchmove.passive="onTouchMove"
        @touchend="onTouchEnd"
        class="relative touch-none select-none cursor-grab bg-white border-l-4 border-orange-600 p-3 mb-2 mx-3 rounded-md transition-transform hover:scale-[1.01]"
        :class="{ 'opacity-70 scale-95': dragging && dragItem?.id === item.id }"
      >
        <div class="text-xs text-gray-600 font-semibold mb-1">{{ formatTime(item.addedAt) }}</div>
        <div class="font-bold text-gray-900 text-base">{{ item.name }}</div>
        <div
          :class="[
            'text-sm font-medium mt-1',
            item.sets && item.sets.length
              ? 'text-orange-700'
              : 'text-gray-400 italic'
          ]"
        >
          Количество подходов: {{ item.sets?.length || 0 }}
        </div>
      </div>
    </div>

    <div class="h-px bg-orange-300"></div>

    <!-- Нижний список -->
    <div class="flex-1 overflow-y-auto p-4 bg-gray-100">
      <button
        @click="handleAddDay"
        class="mb-4 px-5 py-2.5 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors duration-200 shadow-none"
      >
        + Добавить тренажёр
      </button>

      <div ref="sourceContainer" class="space-y-3">
        <div
          v-for="item in sourceItems"
          :key="`source-${item.id}`"
          @touchstart.passive="onTouchStart(item, 'source')"
          @touchmove.passive="onTouchMove"
          @touchend="onTouchEnd"
          class="relative touch-none select-none cursor-grab bg-white border border-gray-300 p-3 rounded-lg transition-transform hover:scale-[1.01] shadow-none"
          :class="{ 'opacity-70 scale-95': dragging && dragItem?.id === item.id }"
        >
          <div class="font-bold text-gray-900 text-base">🏋️ {{ item.name }}</div>
          <div v-if="item.repsMin !== undefined" class="text-sm text-gray-700 mt-1">
            Повторения: <span class="font-semibold text-orange-700">{{ item.repsMin }}–{{ item.repsMax }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Popup -->
    <div
      v-if="editItem"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      @click="closeEditPopup"
    >
      <div
        class="bg-white rounded-lg p-5 w-11/12 max-w-md mx-4 shadow-xl border border-gray-200 max-h-[85vh] overflow-hidden"
        @click.stop
        @contextmenu.prevent
      >
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-lg font-bold text-gray-900">
            {{ editMode === 'source' ? 'Редактировать тренажёр' : 'Настройки упражнения' }}
          </h3>
          <button @click="closeEditPopup" class="text-gray-500 hover:text-gray-800 text-xl font-bold">&times;</button>
        </div>

        <!-- Нижний список: редактирование -->
        <div v-if="editMode === 'source'" class="space-y-4">
          <input
            v-model="editItem.name"
            type="text"
            class="w-full px-3 py-2.5 border border-gray-400 rounded-md text-base focus:border-orange-600 focus:outline-none focus:ring-1 focus:ring-orange-300"
            placeholder="Название тренажёра"
          />
          <div class="flex space-x-2">
            <input
              v-model.number="editItem.repsMin"
              type="number"
              min="1"
              class="w-full px-3 py-2.5 border border-gray-400 rounded-md text-center focus:border-orange-600 focus:outline-none"
              placeholder="От"
            />
            <input
              v-model.number="editItem.repsMax"
              type="number"
              min="1"
              class="w-full px-3 py-2.5 border border-gray-400 rounded-md text-center focus:border-orange-600 focus:outline-none"
              placeholder="До"
            />
          </div>
        </div>

        <!-- Верхний список: редактирование -->
        <div v-else class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-800 mb-2">Количество подходов</label>
            <input
              v-model.number="editItem.setsCount"
              type="range"
              min="0"
              max="100"
              step="1"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
            />
            <div class="text-right text-sm text-gray-600 mt-1">{{ editItem.setsCount || 0 }}</div>
          </div>

          <div
            v-if="editItem.setsCount > 0"
            class="max-h-60 overflow-y-auto pr-1 space-y-3"
          >
            <div
              v-for="(set, index) in editItem.sets"
              :key="index"
              class="p-3 border border-orange-200 rounded-md bg-orange-50"
            >
              <div class="font-semibold text-orange-800 text-xs mb-2">Подход {{ index + 1 }}</div>
              <div class="grid grid-cols-2 gap-2">
                <input
                  v-model.number="set.weight"
                  type="number"
                  min="0"
                  class="col-span-1 px-2.5 py-1.5 border border-gray-400 rounded text-sm focus:border-orange-600 focus:outline-none"
                  placeholder="Вес"
                />
                <select
                  v-model="set.unit"
                  class="col-span-1 px-2.5 py-1.5 border border-gray-400 rounded text-sm focus:border-orange-600 focus:outline-none"
                >
                  <option value="kg">кг</option>
                  <option value="ue">у.е.</option>
                </select>
                <input
                  v-model.number="set.reps"
                  type="number"
                  min="1"
                  class="col-span-1 px-2.5 py-1.5 border border-gray-400 rounded text-sm focus:border-orange-600 focus:outline-none"
                  placeholder="Повторения"
                />
                <div class="flex items-center">
                  <input
                    v-model="set.failure"
                    type="checkbox"
                    class="mr-2 h-4 w-4 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <span class="text-xs text-gray-700">Отказ</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-between space-x-2">
          <button
            @click="deleteItem"
            class="px-4 py-2.5 bg-red-600 text-white font-semibold rounded-md flex-1 hover:bg-red-700 transition-colors shadow-none"
          >
            Удалить
          </button>
          <button
            @click="saveEdit"
            class="px-4 py-2.5 bg-orange-600 text-white font-semibold rounded-md flex-1 hover:bg-orange-700 transition-colors shadow-none"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "./style.css";

export default {
  name: "DraggableComponent",
  data() {
    return {
      sourceItems: [
        { id: 1, name: "Жим лёжа", repsMin: 8, repsMax: 12 },
        { id: 2, name: "Приседания", repsMin: 6, repsMax: 10 },
        { id: 3, name: "Тяга штанги", repsMin: 10, repsMax: 15 }
      ],
      targetItems: [],
      editItem: null,
      editMode: null,

      // Drag state
      dragging: false,
      dragItem: null,
      dragMode: null,
      longPressTimer: null,
      hasMoved: false,
      startY: 0,
      clone: null,
      enteredTargetZone: false,
      sourceBackup: null,
      targetBackup: null,
    };
  },
  watch: {
    'editItem.setsCount'(newVal) {
      if (this.editMode !== 'target') return;
      if (newVal == null || newVal < 0) newVal = 0;
      const oldSets = this.editItem.sets || [];
      const newSets = [];
      for (let i = 0; i < newVal; i++) {
        newSets.push({ ...oldSets[i] } || { weight: null, unit: 'kg', reps: null, failure: false });
      }
      this.editItem.sets = newSets;
    }
  },
  methods: {
    handleAddDay() {
      this.sourceItems.push({
        id: Date.now(),
        name: `Тренажёр ${Date.now()}`,
        repsMin: 8,
        repsMax: 12
      });
    },

    formatTime(date) {
      const d = new Date(date);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },

    onTouchStart(item, mode) {
      if (this.editItem) return;

      this.dragItem = item;
      this.dragMode = mode;
      this.hasMoved = false;
      this.enteredTargetZone = false;

      document.body.style.webkitUserSelect = 'none';
      document.body.style.userSelect = 'none';

      this.longPressTimer = setTimeout(() => {
        if (!this.hasMoved) {
          this.openEditPopup(item, mode);
        }
      }, 600);

      this.startY = event.touches[0].clientY;
    },

    openEditPopup(item, mode) {
      if (mode === 'source') {
        this.editItem = {
          id: item.id,
          name: item.name,
          repsMin: item.repsMin ?? 8,
          repsMax: item.repsMax ?? 12
        };
      } else {
        const sets = item.sets || [];
        this.editItem = {
          id: item.id,
          name: item.name,
          setsCount: sets.length || 0,
          sets: sets.map(s => ({ ...s }))
        };
      }
      this.editMode = mode;
      this.cleanupDrag();
    },

    onTouchMove(e) {
      if (!this.dragItem || this.editItem) return;

      const touch = e.touches[0];
      const dy = Math.abs(touch.clientY - this.startY);

      if (dy > 5) {
        clearTimeout(this.longPressTimer);
        this.hasMoved = true;

        if (!this.dragging) {
          this.startDrag();
        }

        if (this.dragging && this.clone) {
          this.clone.style.top = `${touch.clientY - 20}px`;
          this.clone.style.left = `${touch.clientX - this.clone.offsetWidth / 2}px`;

          const targetRect = this.$refs.targetContainer.getBoundingClientRect();
          this.enteredTargetZone = touch.clientY < targetRect.bottom;
        }
      }
    },

    startDrag() {
      this.dragging = true;

      // Запрещаем перетаскивание в верхнем списке (сортировку)
      if (this.dragMode === 'target') {
        this.cleanupDrag();
        return;
      }

      this.clone = document.createElement("div");
      this.clone.textContent = this.dragItem.name;
      Object.assign(this.clone.style, {
        position: "fixed",
        zIndex: "9999",
        background: "white",
        padding: "12px",
        borderRadius: "8px",
        boxShadow: "0 4px 10px rgba(255, 107, 53, 0.25)",
        pointerEvents: "none",
        opacity: "0.95",
        left: `${event.touches[0].clientX - 60}px`,
        top: `${event.touches[0].clientY - 20}px`,
        minWidth: "130px",
        textAlign: "center",
        fontWeight: "bold",
        border: "2px solid #e65a2c",
        fontSize: "14px",
      });
      document.body.appendChild(this.clone);

      if (this.dragMode === "source") {
        this.sourceBackup = [...this.sourceItems];
      }
    },

    onTouchEnd() {
      clearTimeout(this.longPressTimer);
      document.body.style.webkitUserSelect = '';
      document.body.style.userSelect = '';

      if (this.dragging) {
        if (this.dragMode === "source") {
          if (this.enteredTargetZone) {
            this.sourceItems = this.sourceBackup;
            const item = this.sourceBackup.find(i => i.id === this.dragItem.id);
            if (item) {
              this.targetItems.push({
                id: `${item.id}-${Date.now()}`,
                name: item.name,
                addedAt: new Date(),
                sets: []
              });
            }
          } else {
            this.updateSourceOrder();
          }
        }
        // Сортировка в target отключена — ничего не делаем

        if (this.clone) {
          document.body.removeChild(this.clone);
          this.clone = null;
        }
      }

      this.cleanupDrag();
    },

    updateSourceOrder() {
      const currentIndex = this.sourceBackup.findIndex(i => i.id === this.dragItem.id);
      if (currentIndex === -1) return;

      const container = this.$refs.sourceContainer;
      const items = Array.from(container.children);
      let newIndex = 0;
      for (let i = 0; i < items.length; i++) {
        const rect = items[i].getBoundingClientRect();
        if (event.changedTouches[0].clientY < rect.bottom) {
          newIndex = i;
          break;
        }
      }

      if (newIndex !== currentIndex) {
        const newItems = [...this.sourceBackup];
        const [moved] = newItems.splice(currentIndex, 1);
        newItems.splice(newIndex, 0, moved);
        this.sourceItems = newItems;
      }
    },

    cleanupDrag() {
      this.dragging = false;
      this.dragItem = null;
      this.dragMode = null;
      this.hasMoved = false;
      this.clone = null;
      this.sourceBackup = null;
      this.targetBackup = null;
    },

    closeEditPopup() {
      this.editItem = null;
      this.editMode = null;
    },

    deleteItem() {
      if (this.editMode === "source") {
        this.sourceItems = this.sourceItems.filter(i => i.id !== this.editItem.id);
      } else {
        this.targetItems = this.targetItems.filter(i => i.id !== this.editItem.id);
      }
      this.closeEditPopup();
    },

    saveEdit() {
      if (this.editMode === "source") {
        const idx = this.sourceItems.findIndex(i => i.id === this.editItem.id);
        if (idx !== -1) {
          this.sourceItems[idx] = {
            id: this.editItem.id,
            name: this.editItem.name,
            repsMin: this.editItem.repsMin,
            repsMax: this.editItem.repsMax
          };
        }
      } else {
        const idx = this.targetItems.findIndex(i => i.id === this.editItem.id);
        if (idx !== -1) {
          this.targetItems[idx] = {
            ...this.targetItems[idx],
            sets: this.editItem.sets
          };
        }
      }
      this.closeEditPopup();
    },
  },
  beforeUnmount() {
    clearTimeout(this.longPressTimer);
    if (this.clone) document.body.removeChild(this.clone);
    document.body.style.webkitUserSelect = '';
    document.body.style.userSelect = '';
  },
};
</script>

<style>
* {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
