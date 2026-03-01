<template>
  <div class="drawer lg:drawer-open" :data-theme="noteStore.currentTheme">
    <input id="my-drawer" type="checkbox" class="drawer-toggle" />

    <main class="drawer-content flex flex-col p-6 bg-base-100 min-h-screen">
      <div class="flex lg:hidden mb-4">
        <label for="my-drawer" class="btn btn-square btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            class="inline-block w-6 h-6 stroke-current"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </label>
        <h1 class="text-xl font-bold ml-2 self-center">
          Visua<span class="text-[#6aa8ff]">Noter</span>
        </h1>
      </div>

      <div class="flex flex-wrap gap-4 mb-8 items-center"></div>

      <div class="flex flex-wrap gap-4 mb-8 items-center">
        <input
          v-model="noteStore.search"
          id="search-input"
          type="text"
          :placeholder="t.searchPlaceholder"
          class="input input-bordered flex-1 min-w-50"
        />

        <select
          v-model="noteStore.sortBy"
          @change="noteStore.save"
          class="select select-bordered"
        >
          <option value="newest">{{ t.sortNew }}</option>
          <option value="oldest">{{ t.sortOld }}</option>
        </select>

        <button
          v-if="noteStore.filterTag"
          class="btn btn-secondary btn-sm"
          @click="noteStore.filterTag = ''"
        >
          Tag: {{ noteStore.filterTag }} ✕
        </button>
      </div>

      <div
        v-if="noteStore.paginatedNotes.length"
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        <NoteCard
          v-for="note in noteStore.paginatedNotes"
          :key="note.id"
          :note="note"
          @edit="openEditModal"
          @read="readingNote = $event"
        />
      </div>

      <div
        v-else
        class="flex-1 flex items-center justify-center opacity-30 flex-col"
      >
        <span class="text-6xl mb-4">📓</span>
        <p class="text-xl">{{ t.noNotes }}</p>
      </div>

      <div class="join mt-auto pt-10 self-center shadow-md">
        <button
          class="join-item btn btn-sm md:btn-md"
          :disabled="noteStore.currentPage === 1"
          @click="noteStore.currentPage = 1"
        >
          ««
        </button>

        <button
          class="join-item btn btn-sm md:btn-md"
          :disabled="noteStore.currentPage === 1"
          @click="noteStore.currentPage--"
        >
          «
        </button>

        <button
          v-for="page in displayedPages"
          :key="page"
          class="join-item btn btn-sm md:btn-md"
          :class="{
            'btn-active btn-primary': page === noteStore.currentPage,
            'btn-disabled': page === '...',
          }"
          @click="
            typeof page === 'number' ? (noteStore.currentPage = page) : null
          "
        >
          {{ page }}
        </button>

        <button
          class="join-item btn btn-sm md:btn-md"
          :disabled="noteStore.currentPage >= totalPages"
          @click="noteStore.currentPage++"
        >
          »
        </button>

        <button
          class="join-item btn btn-sm md:btn-md"
          :disabled="noteStore.currentPage >= totalPages"
          @click="noteStore.currentPage = totalPages"
        >
          »»
        </button>
      </div>
    </main>

    <Sidebar
      :theme="noteStore.currentTheme"
      :isSettingsOpen="isSettingsOpen"
      @update:isSettingsOpen="isSettingsOpen = $event"
      @update:theme="
        (val) => {
          noteStore.currentTheme = val;
          noteStore.save();
        }
      "
      @open-modal="openAddModal"
    />

    <NoteModal
      :isOpen="isModalOpen"
      :editData="selectedNote"
      @close="isModalOpen = false"
      @save="noteStore.addOrUpdateNote"
    />

    <ReadModal :note="readingNote" @close="readingNote = null" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { noteStore } from "./store/noteStore";
import Sidebar from "./components/Sidebar.vue";
import NoteCard from "./components/NoteCard.vue";
import NoteModal from "./components/NoteModal.vue";
import ReadModal from "./components/ReadModal.vue";

// const currentTheme = ref(localStorage.getItem("theme") || "system");

// const currentTheme = ref("dark");
const isModalOpen = ref(false);
const selectedNote = ref(null);
const readingNote = ref(null);
const isSettingsOpen = ref(false);

const t = computed(() => noteStore.translations[noteStore.currentLang]);

const openAddModal = () => {
  selectedNote.value = null;
  isModalOpen.value = true;
};

const openEditModal = (note) => {
  selectedNote.value = note;
  isModalOpen.value = true;
};

const totalPages = computed(() =>
  Math.ceil(noteStore.filteredNotes.length / noteStore.notesPerPage)
);

const displayedPages = computed(() => {
  const current = noteStore.currentPage;
  const last = totalPages.value;
  const delta = 1; // Quantidade de páginas ao redor da atual (ex: 1 [2] 3)
  const range = [];
  const rangeWithDots = [];
  let l;

  // Sempre incluir a primeira página
  range.push(1);

  for (let i = current - delta; i <= current + delta; i++) {
    if (i < last && i > 1) {
      range.push(i);
    }
  }

  // Sempre incluir a última página (se houver mais de uma)
  if (last > 1) range.push(last);

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
});

const handleShortcuts = (e) => {
  const isMac = navigator.userAgentData
    ? navigator.userAgentData.platform === "macOS"
    : /Mac|iPhone|iPod|iPad/.test(navigator.platform || navigator.userAgent);

  const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

  // Nova Nota (Ctrl + N)
  if (ctrlKey && e.key.toLowerCase() === "n") {
    e.preventDefault();
    openAddModal();
  }

  // Evitar atalhos globais se o usuário estiver digitando em um modal
  if (isModalOpen.value || isSettingsOpen.value) {
    // Se o modal estiver aberto e ele apertar ESC, fechamos o modal
    if (e.key === "Escape") {
      isModalOpen.value = false;
      isSettingsOpen.value = false; // Se tiver o ref de configurações
    }
    return;
  }

  // Buscar (Ctrl + F)
  if (ctrlKey && e.key.toLowerCase() === "f") {
    e.preventDefault();
    // Supondo que você coloque um ID no seu input de busca
    document.getElementById("search-input")?.focus();
  }

  // Configurações (Ctrl + ,)
  if (ctrlKey && e.key === ",") {
    e.preventDefault();
    isSettingsOpen.value = true;
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleShortcuts);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleShortcuts);
});
</script>
