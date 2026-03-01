<template>
  <div class="modal" :class="{ 'modal-open': isOpen }">
    <div class="modal-box border-t-8" :style="{ borderTopColor: form.color }">
      <h3 class="font-bold text-lg mb-4">
        {{ form.id ? t.editBtn : t.addBtn }}
      </h3>

      <div class="flex flex-col gap-3">
        <input
          v-model="form.title"
          type="text"
          :placeholder="t.title"
          class="input input-bordered w-full"
        />
        <input
          v-model="form.tag"
          type="text"
          :placeholder="t.tag"
          class="input input-bordered p-3 flex-1 max-w-1/3"
        />

        <div class="flex gap-2">
          <div
            class="flex flex-wrap gap-2 justify-center p-2 bg-base-300/50 rounded-2xl"
          >
            <button
              v-for="color in noteStore.colorPalette"
              :key="color.value"
              type="button"
              class="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
              :class="
                form.color === color.value
                  ? 'border-primary scale-110 shadow-lg'
                  : 'border-transparent'
              "
              :style="{ backgroundColor: color.value }"
              @click="form.color = color.value"
              :title="color.name"
            >
              <svg
                v-if="form.color === color.value"
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 m-auto text-slate-800 animate-in zoom-in duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="3"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold opacity-50">{{ t.reminder }}</label>
          <input
            v-model="form.reminder"
            type="datetime-local"
            class="input input-bordered input-sm w-full"
          />
        </div>

        <textarea
          v-model="form.text"
          class="textarea textarea-bordered h-40"
          :placeholder="t.content"
        ></textarea>
      </div>

      <div class="modal-action">
        <button class="btn btn-ghost" @click="$emit('close')">
          {{ t.cancel }}
        </button>
        <button class="btn btn-primary" @click="handleSave">
          {{ t.save }}
        </button>
      </div>
    </div>
    <div class="modal-backdrop" @click="$emit('close')"></div>
  </div>
</template>

<script setup>
import { reactive, watch, computed, onMounted, onUnmounted } from "vue";
import { noteStore } from "../store/noteStore";

const t = computed(() => noteStore.translations[noteStore.currentLang]);

const props = defineProps(["isOpen", "editData"]);
const emit = defineEmits(["close", "save"]);

const form = reactive({
  id: null,
  title: "",
  text: "",
  tag: "",
  color: "#6aa8ff",
  reminder: "",
});

// Quando o modal abre, decide se limpa ou carrega dados de edição
watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      if (props.editData) {
        Object.assign(form, props.editData);
      } else {
        Object.assign(form, {
          id: null,
          title: "",
          text: "",
          tag: "",
          color: "#6aa8ff",
          reminder: "",
        });
      }
    }
  }
);

const handleSave = () => {
  if (!form.title) return;
  emit("save", JSON.parse(JSON.stringify(form)));
  emit("close");
};

const handleClose = () => {
  emit("close");
};

// --- LOGICA DO ATALHO CTRL + S ---
const handleKeyDown = (e) => {
  const isMac = navigator.userAgentData
    ? navigator.userAgentData.platform === "macOS"
    : /Mac|iPhone|iPod|iPad/.test(navigator.platform || navigator.userAgent);

  const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

  if (ctrlKey && e.key.toLowerCase() === "s") {
    e.preventDefault(); // Impede o "Salvar Página" do navegador
    handleSave(); // Chama sua função de salvar
  }

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
