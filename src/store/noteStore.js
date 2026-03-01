import { reactive, onMounted, onUnmounted } from "vue";
import tipsData from "./tips.json";

export const noteStore = reactive({
  notes: JSON.parse(localStorage.getItem("notes_v2")) || [],
  currentLang: localStorage.getItem("lang") || "pt",
  currentTheme: localStorage.getItem("theme") || "dark",
  search: "",
  filterTag: "",
  sortBy: localStorage.getItem("sortBy") || "newest",
  currentPage: 1,
  notesPerPage: 6,

  viewMode: "active",

  backupInterval: localStorage.getItem("backup_interval") || "30",
  autoBackupEnabled: localStorage.getItem("backup_enabled") !== "false",
  backupPath: localStorage.getItem("backup_path") || "",
  backupTimer: null,

  currentTip: "",

  // Função para mudar a dica
  getRandomTip() {
    const lang = this.currentLang || "pt";
    const tips = tipsData[lang];
    const randomIndex = Math.floor(Math.random() * tips.length);
    this.currentTip = tips[randomIndex];

    // Start the interval
    setTimeout(() => {
      this.getRandomTip();
    }, 10000);
  },

  updateLanguage(lang) {
    this.currentLang = lang;
    this.save();
    this.getRandomTip(); // Atualiza a dica para o novo idioma
  },

  translations: {
    pt: {
      logo: "VisuaNoter",
      addBtn: "Nova Nota",
      editBtn: "Editar",
      delBtn: "Apagar",
      noNotes: "Nenhuma nota encontrada",
      exportJson: "Exportar JSON",
      exportTxt: "Exportar TXT",
      searchPlaceholder: "Buscar notas...",
      pages: "Página",
      save: "Salvar",
      cancel: "Cancelar",
      title: "Título",
      tag: "Tag",
      content: "Conteúdo",
      sortNew: "Mais novas",
      sortOld: "Mais antigas",
      backupMsg: "Backup automático realizado",
      importJson: "Importar JSON",
      tips: "Dica: Use tags para organizar. Notas salvas automaticamente. Backup criado a cada 5 minutos.",
      actions: "Ações",
      fixNote: "FIXADA",
      backupSettings: "Configurações de Backup",
      interval: "Intervalo (minutos)",
      enableAutoBackup: "Backup Automático Ativo",
      backupNow: "Fazer Backup Agora",
      reminder: "Lembrete",
      noPermission: "Notificações desativadas",
      backUp: "Configurações & Backup",
      dicas: "dicas",
      tipBtn: "Próxima dica",

      archiveBtn: "Arquivar",
      unarchiveBtn: "Desarquivar",
      archivedNotes: "Notas Arquivadas",
      activeNotes: "Notas Ativas",
      trash: "Lixeira",
      emptyTrash: "Esvaziar Lixeira",
      restore: "Restaurar",
      deletePermanently: "Excluir Permanentemente",
      deleteConfirm: "Tem certeza que deseja mover esta nota para a lixeira?",
      factoryReset: "Resetar App de Fábrica",
      factoryResetConfirm:
        "PERIGO: Isso apagará TODAS as notas e configurações permanentemente. Continuar?",
      trashEmpty: "Lixeira vazia",
      openTrash: "Abrir Lixeira",
      dangerZone: "Zona de Perigo",
      excluir: "Excluir",

      systemTheme: "Sistema",

      docsTitle: "Documentação & Ajuda",
      helpBtn: "Ajuda e Documentação",
    },
    en: {
      logo: "VisuaNoter",
      addBtn: "New Note",
      editBtn: "Edit",
      delBtn: "Move to Trash",
      noNotes: "No notes found",
      exportJson: "Export JSON",
      exportTxt: "Export TXT",
      searchPlaceholder: "Search notes...",
      pages: "Page",
      save: "Save",
      cancel: "Cancel",
      title: "Title",
      tag: "Tag",
      content: "Content",
      sortNew: "Newest",
      sortOld: "Oldest",
      backupMsg: "Auto-backup completed",
      actions: "Actions",
      importJson: "Import JSON",
      tips: "Tips: Use tags to organize. Notes saved automatically. Backup created every 5 minutes.",
      fixNote: "FIXED",
      backupSettings: "Backup Settings",
      interval: "Intervalo (minutes)",
      enableAutoBackup: "Auto-Backup Enabled",
      backupNow: "Backup Now",
      reminder: "Reminder",
      noPermission: "Notifications disabled",
      backUp: "Settings and Backup",
      dicas: "Tips",
      tipBtn: "Next Tip",

      archiveBtn: "Archive",
      unarchiveBtn: "Unarchive",
      archivedNotes: "Archived Notes",
      activeNotes: "Active Notes",
      trash: "Trash",
      emptyTrash: "Empty Trash",
      restore: "Restore",
      deletePermanently: "Delete Permanently",
      deleteConfirm: "Are you sure you want to move this note to trash?",
      factoryReset: "Factory Reset App",
      factoryResetConfirm:
        "DANGER: This will delete ALL notes and settings permanently. Continue?",
      trashEmpty: "Trash is empty",
      openTrash: "Open Trash",
      dangerZone: "Danger Zone",
      systemTheme: "System",
      excluir: "Delete",

      docsTitle: "Documentation & Help",
      helpBtn: "Help & Docs",
    },
  },

  colorPalette: [
    { name: "Vermelho", value: "#ffb3ba" },
    { name: "Amarelo", value: "#ffffba" },
    { name: "Azul", value: "#bae1ff" },
    { name: "Verde", value: "#baffc9" },
    { name: "Laranja", value: "#ffdfba" },
    { name: "Roxo", value: "#eecbff" },
    { name: "Branco", value: "#ffffff" },
    { name: "Marrom", value: "#e2cfc4" },
    { name: "Cinza", value: "#f0f0f0" },
  ],

  importNotes(jsonArray) {
    try {
      const validNotes = jsonArray.filter((n) => n.title || n.text);

      const existingIds = new Set(this.notes.map((n) => n.id));

      const normalizedNotes = validNotes.map((n) => {
        // Se não tiver 'date' mas tiver 'createdAt', converte o timestamp para ISO String
        if (!n.date && n.createdAt) {
          n.date = new Date(n.createdAt).toISOString();
        }
        // Garante que o ID seja um número (caso venha como string)
        n.id = Number(n.id);
        return n;
      });

      const newNotes = normalizedNotes.filter((n) => !existingIds.has(n.id));

      this.notes = [...newNotes, ...this.notes];
      this.save();
      return { success: true, count: newNotes.length };
    } catch (e) {
      console.error("Erro ao importar:", e);
      return { success: false };
    }
  },

  // Filtros e Ordenação
  get filteredNotes() {
    let result = [...noteStore.notes];

    // FILTRO DE ESTADO (Ativo vs Arquivado vs Lixeira)
    // Se viewMode for 'active', mostra não arquivados e não lixeira
    // Se viewMode for 'archived', mostra arquivados e não lixeira
    if (noteStore.viewMode === "active") {
      result = result.filter((n) => !n.archived && !n.trashed);
    } else if (noteStore.viewMode === "archived") {
      result = result.filter((n) => n.archived && !n.trashed);
    }

    if (noteStore.search) {
      const s = noteStore.search.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(s) || n.text.toLowerCase().includes(s)
      );
    }
    if (noteStore.filterTag) {
      result = result.filter((n) => n.tag === noteStore.filterTag);
    }

    result.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      return noteStore.sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  },

  get trashNotes() {
    // Getter específico para a lixeira
    return noteStore.notes.filter((n) => n.trashed);
  },

  get paginatedNotes() {
    const start = (noteStore.currentPage - 1) * noteStore.notesPerPage;
    return noteStore.filteredNotes.slice(start, start + noteStore.notesPerPage);
  },

  // FUNÇÕES DE AÇÃO
  addOrUpdateNote(noteData) {
    if (noteData.id) {
      const index = noteStore.notes.findIndex((n) => n.id === noteData.id);
      if (index !== -1) {
        // Verifica se o lembrete mudou para resetar a flag
        const oldReminder = noteStore.notes[index].reminder;
        const isNewReminder = noteData.reminder !== oldReminder;

        noteStore.notes[index] = {
          ...noteStore.notes[index],
          ...noteData,
          reminderFired: isNewReminder
            ? false
            : noteStore.notes[index].reminderFired,
          date: new Date().toISOString(), // Atualiza a data na edição
        };
      }
    } else {
      noteStore.notes.unshift({
        ...noteData,
        id: Date.now(),
        date: new Date().toISOString(),
        pinned: false,
        reminderFired: false,
        archived: false,
        trashed: false,
      });
    }
    noteStore.save();
  },

  // Soft Delete (Mover para Lixeira)
  moveToTrash(id) {
    const note = noteStore.notes.find((n) => n.id === id);
    if (note) {
      note.trashed = true;
      note.pinned = false; // Desfixar ao mover para lixeira
      note.reminder = ""; // Remover lembrete
    }
    noteStore.save();
  },

  // Restaurar da Lixeira
  restoreFromTrash(id) {
    const note = noteStore.notes.find((n) => n.id === id);
    if (note) {
      note.trashed = false;
      note.archived = false; // Volta para notas ativas
    }
    noteStore.save();
  },

  // Excluir Permanentemente
  deletePermanently(id) {
    noteStore.notes = noteStore.notes.filter((n) => n.id !== id);
    noteStore.save();
  },

  // Esvaziar Lixeira
  emptyTrash() {
    noteStore.notes = noteStore.notes.filter((n) => !n.trashed);
    noteStore.save();
  },

  // Arquivar / Desarquivar
  toggleArchive(id) {
    const note = noteStore.notes.find((n) => n.id === id);
    if (note) {
      note.archived = !note.archived;
      note.pinned = false; // Desfixar ao arquivar
      // Se estava vendo arquivados e desarquivou, ou vice versa, reseta pagina
      noteStore.currentPage = 1;
    }
    noteStore.save();
  },

  deleteNote(id) {
    noteStore.notes = noteStore.notes.filter((n) => n.id !== id);
    noteStore.save();
  },

  togglePin(id) {
    const note = noteStore.notes.find((n) => n.id === id);
    if (note) note.pinned = !note.pinned;
    noteStore.save();
  },

  // Factory Reset
  factoryReset() {
    this.notes = [];
    this.currentLang = "pt";
    this.currentTheme = "dark";
    this.backupPath = "";
    this.autoBackupEnabled = false;
    this.save();
    location.reload(); // Recarrega o app para limpar estados
  },

  async selectBackupFolder() {
    // Chama a função do Electron (se existir)
    if (window.electronAPI) {
      const path = await window.electronAPI.selectFolder();
      if (path) {
        this.backupPath = path;
        this.save(); // Salva no localStorage
      }
    } else {
      alert("Esta função só funciona na versão Desktop instalada.");
    }
  },

  startAutoBackup() {
    if (this.backupTimer) clearInterval(this.backupTimer);

    // Só inicia se estiver habilitado E se tiver uma pasta escolhida
    if (!this.autoBackupEnabled || !this.backupPath) return;

    const ms = parseInt(this.backupInterval) * 60 * 1000;

    this.backupTimer = setInterval(() => {
      this.executeSilentBackup();
    }, ms);
  },

  async executeSilentBackup() {
    if (!this.backupPath || !window.electronAPI) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `VisuaNoter-backup-${timestamp}.json`;
    const dataStr = JSON.stringify(this.notes, null, 2);

    try {
      const result = await window.electronAPI.saveBackup({
        folderPath: this.backupPath,
        fileName: fileName,
        data: dataStr,
      });

      if (result.success) {
        console.log("Backup salvo em:", result.path);
        // Opcional: Mostrar notificação discreta
        // new Notification("Backup Realizado", { body: "Seus dados estão seguros." });
      }
    } catch (e) {
      console.error("Falha no backup automático", e);
    }
  },

  executeBackupDownload() {
    // Esta função simula o "escolher onde salvar" disparando o diálogo de download do sistema
    const dataStr = JSON.stringify(this.notes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    // Nome do arquivo com data e hora para não sobrescrever
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    link.download = `VisuaNoter-auto-backup-${timestamp}.json`;

    link.click();
    URL.revokeObjectURL(url);
    console.log(this.translations[this.currentLang].backupMsg);
  },

  // Função para verificar lembretes a cada minuto
  startReminderCheck() {
    // Pede permissão logo ao abrir o app
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    setInterval(() => {
      const agora = new Date().getTime();

      this.notes.forEach((note) => {
        if (note.reminder) {
          const dataLembrete = new Date(note.reminder).getTime();

          // Se o lembrete for agora (com margem de 1 minuto) e não foi disparado ainda
          if (dataLembrete <= agora && !note.reminderFired) {
            this.sendNotification(note);
            note.reminderFired = true; // Evita notificações repetidas
            this.save();
          }
        }
      });
    }, 30000); // Checa a cada 30 segundos
  },

  sendNotification(note) {
    const iconPath = "/icon_notification.png";
    const options = {
      body: note.text.substring(0, 100),
      icon: iconPath,
      tag: note.id,
      requireInteraction: true, // Mantém a notificação visível até o usuário interagir
    };

    const notification = new Notification("VisuaNoter: " + note.title, options);
    notification.onclick = () => {
      // Tenta o foco padrão do navegador
      window.focus();

      // Se estiver no Electron, chama a API que criamos acima
      if (window.electronAPI && window.electronAPI.focusApp) {
        window.electronAPI.focusApp();
      }
    };
  },

  save() {
    localStorage.setItem("notes_v2", JSON.stringify(this.notes));
    localStorage.setItem("lang", this.currentLang);
    localStorage.setItem("theme", this.currentTheme);
    localStorage.setItem("sortBy", this.sortBy);
    localStorage.setItem("backup_interval", this.backupInterval);
    localStorage.setItem("backup_enabled", this.autoBackupEnabled);
    localStorage.setItem("backup_path", this.backupPath); // Salva o caminho
  },
});

// Inicie o check ao carregar o store
noteStore.startReminderCheck();

noteStore.startAutoBackup();
