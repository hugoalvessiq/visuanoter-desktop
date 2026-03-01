<template>
  <div class="modal" :class="{ 'modal-open': isOpen }">
    <div class="modal-box relative">
      <button
        class="btn btn-sm btn-circle absolute right-2 top-2"
        @click="$emit('close')"
      >
        ✕
      </button>

      <h3 class="text-lg font-bold mb-4">{{ t.backUp }}</h3>
      <div class="flex flex-col gap-4">
        <button
          class="btn btn-outline btn-warning w-full flex justify-between"
          @click="isTrashOpen = true"
        >
          <span>🗑️ {{ t.openTrash }}</span>
          <span class="badge badge-sm">{{ noteStore.trashNotes.length }}</span>
        </button>

        <div class="divider">Backup</div>

        <div class="form-control w-full">
          <label class="label"
            ><span class="label-text font-bold">Pasta de Destino</span></label
          >
          <div class="flex gap-2">
            <input
              type="text"
              :value="noteStore.backupPath || 'Nenhuma pasta selecionada'"
              disabled
              class="input input-bordered w-full text-xs"
            />
            <button
              class="btn btn-square btn-outline"
              @click="noteStore.selectBackupFolder()"
            >
              📂
            </button>
          </div>
        </div>

        <div class="form-control">
          <label class="label cursor-pointer bg-base-200 p-3 rounded-lg">
            <span class="label-text">{{ t.enableAutoBackup }}</span>
            <input
              type="checkbox"
              class="toggle toggle-success"
              v-model="noteStore.autoBackupEnabled"
              :disabled="!noteStore.backupPath"
              @change="updateSettings"
            />
          </label>
        </div>

        <div class="form-control w-full">
          <select
            v-model="noteStore.backupInterval"
            @change="updateSettings"
            class="select select-bordered w-full"
            :disabled="!noteStore.autoBackupEnabled"
          >
            <option value="5">A cada 5 minutos</option>
            <option value="30">A cada 30 minutos</option>
            <option value="60">A cada 1 hora</option>
            <option value="1440">Diariamente</option>
          </select>
        </div>

        <button
          class="btn btn-primary mt-2 w-full"
          @click="noteStore.executeSilentBackup()"
          :disabled="!noteStore.backupPath"
        >
          {{ t.backupNow }}
        </button>

        <div class="divider text-error">{{ t.dangerZone }}</div>

        <div class="p-4 border border-error rounded-xl bg-error/10">
          <p class="text-xs mb-2 text-error font-bold">
            ⚠️ {{ t.factoryResetConfirm }}
          </p>
          <button
            class="btn btn-error btn-sm w-full"
            @click="confirmFactoryReset"
          >
            {{ t.factoryReset }}
          </button>
        </div>
      </div>
    </div>
    <div class="modal-backdrop" @click="$emit('close')"></div>

    <TrashModal :isOpen="isTrashOpen" @close="isTrashOpen = false" />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { noteStore } from "../store/noteStore";
import TrashModal from "./TrashModal.vue";

defineProps(["isOpen"]);
defineEmits(["close"]);

const t = computed(() => noteStore.translations[noteStore.currentLang]);
const isTrashOpen = ref(false);

const updateSettings = () => {
  noteStore.save();
  noteStore.startAutoBackup();
};

const confirmFactoryReset = () => {
  if (confirm(t.value.factoryResetConfirm)) {
    noteStore.factoryReset();
  }
};
</script>
