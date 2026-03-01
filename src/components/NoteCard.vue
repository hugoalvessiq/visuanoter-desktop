<template>
  <div
    class="card bg-base-200 shadow-xl border-l-4 cursor-pointer hover:bg-base-300 transition-all duration-300"
    :style="{
      borderLeftColor: note.pinned ? 'transparent' : note.color,
      outline: note.pinned ? '2px solid #6aa8ff' : '2px solid transparent',
      outlineOffset: '-2px',
    }"
    @click="$emit('read', note)"
  >
    <div class="card-body p-4">
      <div class="flex justify-between items-start" @click.stop>
        <div
          class="badge cursor-pointer border-none font-bold text-slate-800"
          :style="{ backgroundColor: note.color }"
          @click="filterByTag(note.tag)"
        >
          {{ note.tag || "Sem tag" }}
        </div>

        <div
          v-if="note.reminder"
          class="flex items-center gap-1 text-[10px] opacity-60 mt-1"
        >
          <span>⏰</span>
          <span>{{ new Date(note.reminder).toLocaleString() }}</span>
        </div>

        <button
          v-if="!note.archived"
          @click="noteStore.togglePin(note.id)"
          class="btn btn-ghost btn-xs btn-circle transition-transform active:scale-90"
          :class="{ 'bg-warning/20 shadow-inner': note.pinned }"
        >
          <span
            :class="{
              'grayscale-0 scale-125': note.pinned,
              'grayscale opacity-50': !note.pinned,
            }"
          >
            📌
          </span>
        </button>
      </div>

      <h2 class="card-title text-md mt-2 flex items-center gap-2">
        {{ note.title }}
        <span
          v-if="note.pinned"
          class="text-[10px] badge badge-warning badge-outline"
        >
          {{ t.fixNote }}
        </span>
      </h2>

      <p class="text-sm opacity-70 line-clamp-3">{{ note.text }}</p>

      <div class="card-actions justify-end mt-4" @click.stop>
        <button
          class="btn btn-sm btn-outline"
          @click="noteStore.toggleArchive(note.id)"
          :title="note.archived ? t.unarchiveBtn : t.archiveBtn"
        >
          <span v-if="note.archived">{{ t.unarchiveBtn }}</span>
          <span v-else> {{ t.archiveBtn }} </span>
        </button>

        <button class="btn btn-sm btn-info" @click="$emit('edit', note)">
          {{ t.editBtn }}
        </button>

        <button class="btn btn-error btn-sm" @click="confirmDelete(note.id)">
          {{ t.delBtn }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { noteStore } from "../store/noteStore";
import { computed } from "vue";
defineProps(["note"]);
defineEmits(["edit", "read"]);

const t = computed(() => noteStore.translations[noteStore.currentLang]);

const filterByTag = (tag) => {
  noteStore.search = "";
  noteStore.filterTag = tag;
  noteStore.currentPage = 1;
};

// Função com aviso de exclusão
const confirmDelete = (id) => {
  if (confirm(t.value.deleteConfirm)) {
    noteStore.moveToTrash(id);
  }
};
</script>
