<template>
  <div class="modal" :class="{ 'modal-open': isOpen }">
    <div
      class="modal-box w-11/12 max-w-5xl h-[85vh] p-0 flex bg-base-100 overflow-hidden relative"
    >
      <button
        class="btn btn-sm btn-circle absolute right-4 top-4 z-50 bg-base-200 border-none hover:bg-base-300"
        @click="$emit('close')"
      >
        ✕
      </button>

      <div
        class="w-1/3 bg-base-200/50 h-full p-6 border-r border-base-300 overflow-y-auto hidden md:block"
      >
        <h2 class="font-bold text-xl mb-6 flex items-center gap-2">
          📚 {{ t.docsTitle }}
        </h2>

        <ul class="menu p-0 w-full gap-1">
          <li v-for="(section, index) in docs" :key="section.id">
            <a
              @click="scrollTo(section.id)"
              :class="{ 'active font-bold': activeId === section.id }"
              class="rounded-lg transition-all"
            >
              {{ section.title }}
            </a>
          </li>
        </ul>
      </div>

      <div
        class="flex-1 h-full overflow-y-auto p-8 scroll-smooth"
        id="docs-content"
        @scroll="handleScroll"
      >
        <h2 class="font-bold text-2xl mb-6 md:hidden">📚 {{ t.docsTitle }}</h2>

        <div
          v-for="section in docs"
          :key="section.id"
          :id="section.id"
          class="mb-12 border-b border-base-200 pb-8 last:border-0"
        >
          <h3 class="text-2xl font-bold text-primary mb-4">
            {{ section.title }}
          </h3>
          <div
            class="prose max-w-none text-base-content/80 leading-relaxed space-y-4"
            v-html="section.content"
          ></div>
        </div>

        <div class="text-center text-xs opacity-50 mt-20">
          VisuaNoter v1.0.0 - {{ new Date().getFullYear() }}
        </div>
      </div>
    </div>

    <div class="modal-backdrop" @click="$emit('close')"></div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { noteStore } from "../store/noteStore";
import docsData from "../store/docs.json";

defineProps(["isOpen"]);
defineEmits(["close"]);

const activeId = ref("intro");

const t = computed(() => noteStore.translations[noteStore.currentLang]);

// Carrega a documentação baseada na língua atual
const docs = computed(() => {
  return docsData[noteStore.currentLang] || docsData["pt"];
});

// Função de rolagem suave
const scrollTo = (id) => {
  activeId.value = id;
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

// (Opcional) Detectar qual seção está visível ao rolar
// const handleScroll = (e) => {
//   // Lógica simples para detectar scroll manual pode ser adicionada aqui se desejar
// };
</script>

<style scoped>
/* Pequeno ajuste para garantir que o HTML injetado tenha espaçamento */
:deep(p) {
  margin-bottom: 0.8rem;
}
:deep(ul) {
  margin-bottom: 0.8rem;
}
</style>
