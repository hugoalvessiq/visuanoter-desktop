<template>
  <aside class="drawer-side z-50">
    <label for="my-drawer" class="drawer-overlay"></label>
    <div
      class="menu p-4 w-80 min-h-full bg-base-200 text-base-content flex flex-col"
    >
      <h1 class="text-2xl font-bold mb-6 mr-0flex items-center gap-2">
        Visua<span class="text-[#6aa8ff]">Noter</span>
      </h1>

      <button
        v-if="noteStore.viewMode === 'archived'"
        class="btn btn-outline btn-info w-full mb-6"
        @click="
          noteStore.viewMode = 'active';
          closeDrawer();
        "
      >
        ⬅️ {{ noteStore.translations[noteStore.currentLang].activeNotes }}
      </button>

      <button
        v-if="noteStore.viewMode !== 'archived'"
        class="btn btn-primary w-full mb-6 shadow-sm shadow-primary/20"
        @click="
          $emit('open-modal');
          closeDrawer();
        "
      >
        {{ noteStore.translations[noteStore.currentLang].addBtn }}
      </button>

      <ul class="menu bg-base-100 w-full rounded-box p-2 shadow-sm gap-2">
        <li class="menu-title opacity-50">
          {{ noteStore.translations[noteStore.currentLang].actions }}
        </li>

        <li>
          <a @click="triggerFileInput" class="btn btn-outline btn-accent">
            {{ noteStore.translations[noteStore.currentLang].importJson }}
          </a>
        </li>

        <li>
          <a @click="exportJSON" class="btn btn-outline btn-accent">
            {{ noteStore.translations[noteStore.currentLang].exportJson }}
          </a>
        </li>

        <li>
          <a @click="exportTxt" class="btn btn-outline btn-accent">
            {{ noteStore.translations[noteStore.currentLang].exportTxt }}
          </a>
        </li>

        <li>
          <a
            @click="
              noteStore.viewMode = 'archived';
              closeDrawer();
            "
            class="btn btn-outline"
            :class="{ 'btn-disabled': noteStore.viewMode === 'archived' }"
          >
            🗄️ {{ noteStore.translations[noteStore.currentLang].archivedNotes }}
          </a>
        </li>
      </ul>

      <div class="divider">
        {{ noteStore.translations[noteStore.currentLang].tipsTitle }}
      </div>

      <div
        class="p-3 bg-base-100 h-20 rounded-lg border border-base-300 shadow-inner"
      >
        <p
          class="text-xs italic opacity-80 leading-relaxed transition duration-800 ease-in-out"
        >
          {{ noteStore.currentTip }}
        </p>
      </div>

      <button
        class="btn btn-ghost btn-sm w-full mt-4 gap-2 opacity-70 hover:opacity-100 font-normal"
        @click="isDocsOpen = true"
      >
        <span>📚</span>
        {{ noteStore.translations[noteStore.currentLang].helpBtn }}
      </button>

      <div class="mt-auto pt-4 border-t border-base-300 flex flex-col gap-3">
        <button class="btn btn-outline w-full gap-2" @click="openSettings">
          {{ noteStore.translations[noteStore.currentLang].backUp }}
        </button>

        <div class="grid grid-cols-2 gap-2">
          <select
            v-model="noteStore.currentLang"
            class="select select-sm select-bordered w-full"
            @change="noteStore.save()"
          >
            <option value="pt">PT-BR</option>
            <option value="en">EN-US</option>
          </select>

          <select
            :value="theme"
            @change="$emit('update:theme', $event.target.value)"
            class="select select-sm select-bordered w-full"
          >
            <option value="system">
              {{ noteStore.translations[noteStore.currentLang].systemTheme }}
            </option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="cyberpunk">Cyber</option>
            <option value="cupcake">Cupcake</option>
            <option value="emerald">Emerald</option>
            <option value="night">Night</option>
            <option value="business">Business</option>
          </select>
        </div>
      </div>
    </div>

    <input
      type="file"
      ref="fileInput"
      class="hidden"
      accept=".json"
      @change="handleFileImport"
    />

    <SettingsModal
      :isOpen="isSettingsOpen"
      @close="emit('update:isSettingsOpen', false)"
    />

    <DocsModal :isOpen="isDocsOpen" @close="isDocsOpen = false" />
  </aside>
</template>

<script setup>
import { noteStore } from "../store/noteStore";
import { ref, onMounted } from "vue";
import SettingsModal from "./SettingsModal.vue";
import DocsModal from "./DocsModal.vue";

defineProps(["theme", "isSettingsOpen"]);
const emit = defineEmits([
  "open-modal",
  "update:theme",
  "update:isSettingsOpen",
]);

const fileInput = ref(null);

const openSettings = () => {
  emit("update:isSettingsOpen", true);
};

const isDocsOpen = ref(false);

const closeDrawer = () => {
  const drawer = document.getElementById("my-drawer");
  if (drawer) drawer.checked = false;
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileImport = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target.result);
      const result = noteStore.importNotes(json);

      if (result.success) {
        alert(`${result.count} notas importadas com sucesso!`);
      }
    } catch (err) {
      alert("Erro ao ler o arquivo JSON. Verifique o formato.");
    }
  };
  reader.readAsText(file);

  // Limpa o input para permitir importar o mesmo arquivo novamente se necessário
  event.target.value = "";
};

const exportTxt = () => {
  if (noteStore.notes.length === 0) return;
  console.log(noteStore.translations[noteStore.currentLang].exportTxt);

  let content = "=== VISUANOTER BACKUP (TXT) ===\n\n";
  noteStore.notes.forEach((n) => {
    content += `TÍTULO: ${n.title}\n`;
    content += `TAG: ${n.tag}\n`;
    content += `DATA: ${new Date(n.date).toLocaleString()}\n`;
    content += `CONTEÚDO:\n${n.text}\n`;
    content += `---------------------------\n\n`;
  });

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `VisuaNoter-notas-${new Date().toLocaleDateString()}.txt`;
  link.click();
};

const exportJSON = () => {
  const compatibleNotes = noteStore.notes.map((n) => ({
    id: n.id,
    title: n.title,
    text: n.text,
    tag: n.tag,
    color: n.color,
    createdAt: new Date(n.date).getTime(),
    updatedAt: new Date(n.date).getTime(),
    pinned: n.pinned || false,
  }));

  const dataStr = JSON.stringify(compatibleNotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `VisuaNoter-export.json`;
  link.click();
};

onMounted(() => {
  noteStore.getRandomTip();
});
</script>
