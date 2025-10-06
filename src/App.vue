<template>
  <div class="flex flex-col h-screen relative overflow-hidden font-mono bg-slate-900 text-slate-200">
    <!-- Верхний список -->
    <div
      ref="targetContainer"
      class="bg-machine-panel border-b pt-2 border-industrial overflow-y-auto"
      style="height: 40vh"
    >
      <div
        v-if="targetItems.length === 0"
        class="h-full flex items-center justify-center text-industrial text-sm font-medium"
      >
        Перетащите сюда упражнения
      </div>
      <div
        v-for="item in targetItems"
        :key="`target-${item.id}`"
        @touchstart.passive="onTouchStart(item, 'target')"
        @touchmove.passive="onTouchMove"
        @touchend="onTouchEnd"
        class="relative touch-none select-none cursor-grab bg-slate-800 border-l-4 border-industrial p-3 mb-2 mx-3 rounded-sm transition-transform hover:scale-[1.005]"
        :class="{ 'opacity-60 scale-95': dragging && dragItem?.id === item.id }"
      >
        <div class="text-xs text-slate-400 font-mono mb-1">{{ formatTime(item.addedAt) }}</div>
        <div class="font-bold text-slate-100 text-base">{{ item.name }}</div>
        <div
          :class="[
            'text-sm font-mono mt-1',
            item.sets && item.sets.length
              ? 'text-industrial'
              : 'text-slate-500 italic'
          ]"
        >
          Подходов: {{ item.sets?.length || 0 }}
        </div>
      </div>
    </div>

    <div class="h-px bg-gradient-to-r from-transparent via-industrial to-transparent"></div>

    <!-- Нижний список -->
    <div class="flex-1 overflow-y-auto p-4 bg-slate-800">
      <button
        @click="handleAddDay"
        class="mb-4 px-5 py-2.5 btn-machine rounded transition-all duration-150"
      >
        + ДОБАВИТЬ УПРАЖНЕНИЯ
      </button>

      <div ref="sourceContainer" class="space-y-2">
        <div
          v-for="item in sourceItems"
          :key="`source-${item.id}`"
          @touchstart.passive="onTouchStart(item, 'source')"
          @touchmove.passive="onTouchMove"
          @touchend="onTouchEnd"
          class="relative touch-none select-none cursor-grab bg-slate-700 border border-slate-600 p-3 rounded-sm transition-transform hover:scale-[1.005]"
          :class="{ 'opacity-60 scale-95': dragging && dragItem?.id === item.id }"
        >
          <div class="font-bold text-slate-100 text-base">⚙️ {{ item.name }}</div>
          <div v-if="item.repsMin !== undefined" class="text-sm text-slate-300 mt-1 font-mono">
            Повторения: <span class="font-bold text-industrial">{{ item.repsMin }}–{{ item.repsMax }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Popup -->
    <div
      v-if="editItem"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      @click="closeEditPopup"
    >
      <div
        class="popup-machine rounded-lg p-5 w-11/12 max-w-md mx-4 shadow-2xl overflow-hidden"
        :class="{ 'h-[75vh]': editMode !== 'source' }"
        @click.stop
        @contextmenu.prevent
      >
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-lg font-bold text-industrial">
            {{ editMode === 'source' ? 'РЕДАКТИРОВАТЬ ТРЕНАЖЁР' : 'НАСТРОЙКИ УПРАЖНЕНИЯ' }}
          </h3>
          <button @click="closeEditPopup" class="text-slate-400 hover:text-industrial text-xl font-bold">&times;</button>
        </div>

        <!-- Source edit -->
        <div v-if="editMode === 'source'" class="space-y-4">
          <input
            v-model="editItem.name"
            type="text"
            class="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 rounded text-slate-100 focus:border-industrial focus:outline-none focus:ring-1 focus:ring-industrial/30 font-mono"
            placeholder="Название тренажёра"
          />
          <div class="flex space-x-2">
            <div class="flex-1">
              <div class="text-xs text-white text-right mb-1"><span class="bg-industrial rounded px-2 py-0.5 font-bold">ОТ</span></div>
              <input
                v-model.number="editItem.repsMin"
                type="number"
                min="1"
                class="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 rounded text-center text-slate-100 focus:border-industrial focus:outline-none font-mono"
              />
            </div>
            <div class="flex-1">
              <div class="text-xs text-white text-right mb-1"><span class="bg-industrial rounded px-2 py-0.5 font-bold">ДО</span></div>
              <input
                v-model.number="editItem.repsMax"
                type="number"
                min="1"
                class="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 rounded text-center text-slate-100 focus:border-industrial focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        <!-- Target edit -->
        <div v-else class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-slate-300 mb-2">ПОДХОДЫ</label>
            <input
              v-model.number="editItem.setsCount"
              type="range"
              min="0"
              max="100"
              class="w-full h-2 bg-slate-700 rounded appearance-none cursor-pointer accent-industrial"
            />
            <div class="text-right text-sm text-slate-400 mt-1 font-mono">{{ editItem.setsCount || 0 }}</div>
          </div>

          <div class="max-h-60 overflow-y-auto p-2 space-y-3 h-[60vh] bg-slate-800/50 rounded border border-slate-700">
            <div
              v-for="(set, index) in editItem.sets"
              :key="index"
              class="p-3 border border-slate-700 rounded bg-slate-800/70"
            >
              <div class="font-bold text-industrial text-xs mb-2">ПОДХОД {{ index + 1 }}</div>
              <div class="grid grid-cols-2 gap-2">
                <input
                  v-model.number="set.weight"
                  type="number"
                  min="0"
                  class="col-span-1 px-2.5 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm text-slate-100 focus:border-industrial focus:outline-none font-mono"
                  placeholder="Вес"
                />
                <select
                  v-model="set.unit"
                  class="col-span-1 px-2.5 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm text-slate-100 focus:border-industrial focus:outline-none font-mono"
                >
                  <option value="kg">кг</option>
                  <option value="ue">у.е.</option>
                </select>
                <input
                  v-model.number="set.reps"
                  type="number"
                  min="1"
                  class="col-span-1 px-2.5 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm text-slate-100 focus:border-industrial focus:outline-none font-mono"
                  placeholder="Повторения"
                />
                <div class="flex items-center">
                  <input
                    v-model="set.failure"
                    type="checkbox"
                    class="mr-2 h-4 w-4 accent-industrial"
                  />
                  <span class="text-xs text-slate-400">ОТКАЗ</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 flex space-x-2">
          <button
            @click="deleteItem"
            class="flex-1 py-2.5 bg-red-700 text-white font-bold rounded hover:bg-red-800 transition-colors"
          >
            УДАЛИТЬ
          </button>
          <button
            @click="saveEdit"
            class="flex-1 py-2.5 btn-machine"
          >
            СОХРАНИТЬ
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
  mounted() {
    // === Telegram Mini App: отключаем свайп-закрытие ===
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const app = window.Telegram.WebApp;

      // Говорим Telegram, что приложение готово
      app.ready();

      // 🔑 Главное: отключаем вертикальный свайп (старый, но рабочий способ)
      app.allow_vertical_swipe = false;

      // Также расширяем на весь экран — критически важно!
      app.expand();

      // Опционально: отключаем подтверждение закрытия
      if (app.isClosingConfirmationEnabled) {
        app.disableClosingConfirmation();
      }
    }
  },
  watch: {
    'editItem.setsCount'(newVal) {
      if (!this.editItem || this.editMode !== 'target') return;
      newVal = Math.max(0, newVal || 0);
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
        const sets = Array.isArray(item.sets) ? item.sets : [];
        this.editItem = {
          id: item.id,
          name: item.name,
          setsCount: sets.length,
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

      if (this.dragMode === 'target') {
        this.cleanupDrag();
        return;
      }

      this.clone = document.createElement("div");
      this.clone.textContent = this.dragItem.name;
      Object.assign(this.clone.style, {
        position: "fixed",
        zIndex: "9999",
        background: "#1e293b",
        color: "white",
        padding: "12px",
        borderRadius: "6px",
        boxShadow: "0 4px 12px rgba(249, 115, 22, 0.4)",
        pointerEvents: "none",
        opacity: "0.95",
        left: `${event.touches[0].clientX - 80}px`,
        top: `${event.touches[0].clientY - 20}px`,
        minWidth: "140px",
        textAlign: "center",
        fontWeight: "bold",
        border: "2px solid #f97316",
        fontSize: "14px",
        fontFamily: "monospace"
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
                sets: [] // ← всегда массив!
              });
            }
          } else {
            this.updateSourceOrder();
          }
        }

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
      let newIndex = items.length - 1;
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
