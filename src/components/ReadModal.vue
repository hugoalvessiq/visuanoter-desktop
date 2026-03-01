<template>
  <div class="modal" :class="{ 'modal-open': note }">
    <div
      v-if="note"
      class="modal-box max-w-3xl border-l-8"
      :style="{ borderLeftColor: note.color }"
    >
      <div class="flex justify-between items-start mb-4">
        <div>
          <div
            class="badge mb-2"
            :style="{
              backgroundColor: note.color,
              color: 'rgb(3, 21, 35)',
              border: 'none',
            }"
          >
            {{ note.tag }}
          </div>
          <h3 class="font-bold text-2xl">{{ note.title }}</h3>
          <p class="text-xs opacity-50 mt-1">
            {{ new Date(note.date).toLocaleString(noteStore.currentLang) }}
          </p>
        </div>
        <button class="btn btn-sm btn-circle btn-ghost" @click="$emit('close')">
          ✕
        </button>
      </div>

      <div
        class="py-4 text-lg leading-relaxed whitespace-pre-wrap max-h-[60vh] overflow-y-auto"
      >
        {{ note.text }}
      </div>

      <div class="modal-action">
        <button class="btn btn-primary" @click="$emit('close')">
          Fechar Leitura
        </button>
      </div>
    </div>
    <div class="modal-backdrop" @click="$emit('close')"></div>
  </div>
</template>

<script setup>
import { noteStore } from "../store/noteStore";
defineProps(["note"]);
defineEmits(["close"]);
</script>
