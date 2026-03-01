<template>
  <div class="modal" :class="{ 'modal-open': isOpen }">
    <div class="modal-box w-11/12 max-w-5xl h-[80vh] flex flex-col">
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-bold text-lg flex items-center gap-2">
          🗑️ {{ t.trash }} ({{ noteStore.trashNotes.length }})
        </h3>
        <button class="btn btn-sm btn-circle" @click="$emit('close')">✕</button>
      </div>

      <div class="flex-1 overflow-y-auto p-2 bg-base-200 rounded-box">
        <div
          v-if="noteStore.trashNotes.length === 0"
          class="flex flex-col items-center justify-center h-full opacity-50"
        >
          <span class="text-4xl">🍃</span>
          <p>{{ t.trashEmpty }}</p>
        </div>

        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <div
            v-for="note in noteStore.trashNotes"
            :key="note.id"
            class="card bg-base-100 shadow-sm border border-base-300"
          >
            <div class="card-body p-4">
              <h4 class="font-bold truncate">{{ note.title }}</h4>
              <p class="text-xs opacity-50">
                {{ new Date(note.date).toLocaleString() }}
              </p>
              <div class="card-actions justify-end mt-2">
                <button
                  class="btn btn-xs btn-success"
                  @click="noteStore.restoreFromTrash(note.id)"
                >
                  {{ t.restore }}
                </button>
                <button
                  class="btn btn-xs btn-error"
                  @click="noteStore.deletePermanently(note.id)"
                >
                  {{ t.excluir }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-action justify-between mt-4">
        <button
          class="btn btn-error btn-outline"
          @click="confirmEmptyTrash"
          :disabled="noteStore.trashNotes.length === 0"
        >
          {{ t.emptyTrash }}
        </button>
        <button class="btn" @click="$emit('close')">{{ t.cancel }}</button>
      </div>
    </div>
    <div class="modal-backdrop" @click="$emit('close')"></div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from "vue";
import { noteStore } from "../store/noteStore";

defineProps(["isOpen"]);
const emit = defineEmits(["close"]);

const t = computed(() => noteStore.translations[noteStore.currentLang]);

const confirmEmptyTrash = () => {
  if (confirm(t.value.factoryResetConfirm)) {
    // Usando alerta genérico ou criar um especifico se quiser
    noteStore.emptyTrash();
  }
};

const handleClose = () => {
  emit("close");
};

// --- LOGICA DO ATALHO CTRL + S ---
const handleKeyDown = (e) => {
  const isMac = navigator.userAgentData
    ? navigator.userAgentData.platform === "macOS"
    : /Mac|iPhone|iPod|iPad/.test(navigator.platform || navigator.userAgent);


  if (e.key === "Escape") {
    e.preventDefault(); // Impede o "Salvar Página" do navegador
    handleClose(); // Chama sua função de salvar
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
</script>
