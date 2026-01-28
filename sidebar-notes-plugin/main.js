"use strict";

const obsidian = require("obsidian");

// ============================================================================
// DEFAULT SETTINGS
// ============================================================================

const DEFAULT_SETTINGS = {
  pinnedNotes: [
    {
      name: "Quick Capture",
      path: "Quick Capture.md",
      createIfMissing: true
    }
  ],
  focusOnOpen: true,
  newNoteTemplate: "# {{name}}\n\n"
};

// ============================================================================
// SIDEBAR NOTES PLUGIN
// ============================================================================

class SidebarNotesPlugin extends obsidian.Plugin {
  async onload() {
    await this.loadSettings();
    this.commandIds = [];

    // Register commands for each pinned note
    this.registerPinnedNoteCommands();

    // Add generic command to open any note in sidebar
    this.addCommand({
      id: "open-note-in-sidebar",
      name: "Open note in sidebar (picker)",
      callback: () => this.openNotePicker()
    });

    // Add settings tab
    this.addSettingTab(new SidebarNotesSettingTab(this.app, this));

    console.log("Sidebar Notes plugin loaded");
  }

  onunload() {
    console.log("Sidebar Notes plugin unloaded");
  }

  // --------------------------------------------------------------------------
  // SETTINGS
  // --------------------------------------------------------------------------

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  // --------------------------------------------------------------------------
  // COMMAND REGISTRATION
  // --------------------------------------------------------------------------

  registerPinnedNoteCommands() {
    this.commandIds = [];

    for (const note of this.settings.pinnedNotes) {
      const commandId = `open-sidebar-${this.sanitizeId(note.name)}`;

      if (this.commandIds.includes(commandId)) continue;

      this.addCommand({
        id: commandId,
        name: `Open ${note.name} in sidebar`,
        callback: () => this.openNoteInSidebar(note)
      });

      this.commandIds.push(commandId);
    }
  }

  sanitizeId(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }

  // --------------------------------------------------------------------------
  // CORE SIDEBAR FUNCTIONALITY
  // --------------------------------------------------------------------------

  /**
   * Opens a pinned note in the right sidebar.
   *
   * KEY API: workspace.getRightLeaf(false)
   * - Gets a leaf in the right sidebar (where Backlinks, Outline appear)
   * - false = don't split, get existing or create new leaf
   */
  async openNoteInSidebar(note) {
    const { workspace, vault } = this.app;

    // Get the file, creating it if necessary
    let file = vault.getAbstractFileByPath(note.path);

    if (!file) {
      if (note.createIfMissing) {
        const content = this.settings.newNoteTemplate
          .replace(/\{\{name\}\}/g, note.name);

        // Ensure parent folders exist
        const folderPath = note.path.substring(0, note.path.lastIndexOf("/"));
        if (folderPath) {
          await this.ensureFolderExists(folderPath);
        }

        file = await vault.create(note.path, content);
        new obsidian.Notice(`Created new note: ${note.name}`);
      } else {
        new obsidian.Notice(`Note not found: ${note.path}`);
        return;
      }
    }

    if (!(file instanceof obsidian.TFile)) {
      new obsidian.Notice(`Path is not a file: ${note.path}`);
      return;
    }

    // KEY API: Get a leaf in the RIGHT sidebar
    const rightLeaf = workspace.getRightLeaf(false);

    if (!rightLeaf) {
      new obsidian.Notice("Could not get sidebar leaf");
      return;
    }

    // Open the file in the sidebar leaf
    await rightLeaf.openFile(file, { active: this.settings.focusOnOpen });

    // Reveal (focus) the leaf
    if (this.settings.focusOnOpen) {
      workspace.revealLeaf(rightLeaf);
    }

    // Pin the leaf to prevent it from being replaced
    rightLeaf.setPinned(true);
  }

  openNotePicker() {
    new NoteSuggestModal(this.app, (file) => {
      this.openFileInSidebar(file);
    }).open();
  }

  async openFileInSidebar(file) {
    const { workspace } = this.app;

    const rightLeaf = workspace.getRightLeaf(false);
    if (!rightLeaf) {
      new obsidian.Notice("Could not get sidebar leaf");
      return;
    }

    await rightLeaf.openFile(file, { active: this.settings.focusOnOpen });

    if (this.settings.focusOnOpen) {
      workspace.revealLeaf(rightLeaf);
    }

    rightLeaf.setPinned(true);
  }

  async ensureFolderExists(folderPath) {
    const { vault } = this.app;
    const folder = vault.getAbstractFileByPath(folderPath);

    if (!folder) {
      await vault.createFolder(folderPath);
    }
  }
}

// ============================================================================
// NOTE SUGGEST MODAL
// ============================================================================

class NoteSuggestModal extends obsidian.SuggestModal {
  constructor(app, onSelect) {
    super(app);
    this.onSelect = onSelect;
    this.setPlaceholder("Type to search for a note...");
  }

  getSuggestions(query) {
    const files = this.app.vault.getMarkdownFiles();
    const lowerQuery = query.toLowerCase();

    return files
      .filter(file => file.path.toLowerCase().includes(lowerQuery))
      .slice(0, 50);
  }

  renderSuggestion(file, el) {
    el.createEl("div", { text: file.basename });
    el.createEl("small", { text: file.path });
  }

  onChooseSuggestion(file) {
    this.onSelect(file);
  }
}

// ============================================================================
// SETTINGS TAB
// ============================================================================

class SidebarNotesSettingTab extends obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Sidebar Notes Settings" });

    // Focus on open toggle
    new obsidian.Setting(containerEl)
      .setName("Focus sidebar on open")
      .setDesc("Whether to focus the sidebar when opening a note")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.focusOnOpen)
        .onChange(async (value) => {
          this.plugin.settings.focusOnOpen = value;
          await this.plugin.saveSettings();
        }));

    // New note template
    new obsidian.Setting(containerEl)
      .setName("New note template")
      .setDesc("Template for auto-created notes. Use {{name}} for note name.")
      .addTextArea(text => text
        .setPlaceholder("# {{name}}\n\n")
        .setValue(this.plugin.settings.newNoteTemplate)
        .onChange(async (value) => {
          this.plugin.settings.newNoteTemplate = value;
          await this.plugin.saveSettings();
        }));

    // Pinned notes section
    containerEl.createEl("h3", { text: "Pinned Notes" });
    containerEl.createEl("p", {
      text: "Configure notes that will have dedicated commands to open in the sidebar. Restart Obsidian after changes for new commands to appear.",
      cls: "setting-item-description"
    });

    // Add existing notes
    this.plugin.settings.pinnedNotes.forEach((note, index) => {
      this.addPinnedNoteSetting(containerEl, note, index);
    });

    // Add new note button
    new obsidian.Setting(containerEl)
      .addButton(button => button
        .setButtonText("Add pinned note")
        .setCta()
        .onClick(async () => {
          this.plugin.settings.pinnedNotes.push({
            name: "New Note",
            path: "New Note.md",
            createIfMissing: true
          });
          await this.plugin.saveSettings();
          this.plugin.registerPinnedNoteCommands();
          this.display();
        }));

    // Usage instructions
    containerEl.createEl("h3", { text: "Usage" });
    containerEl.createEl("p", {
      text: "Use the command palette and search for \"Open [Note Name] in sidebar\" to open pinned notes.",
      cls: "setting-item-description"
    });
  }

  addPinnedNoteSetting(container, note, index) {
    const setting = new obsidian.Setting(container);

    // Name input
    setting.addText(text => text
      .setPlaceholder("Display name")
      .setValue(note.name)
      .onChange(async (value) => {
        this.plugin.settings.pinnedNotes[index].name = value;
        await this.plugin.saveSettings();
      }));

    // Path input
    setting.addText(text => text
      .setPlaceholder("Path (e.g., Folder/Note.md)")
      .setValue(note.path)
      .onChange(async (value) => {
        this.plugin.settings.pinnedNotes[index].path = value;
        await this.plugin.saveSettings();
      }));

    // Create if missing toggle
    setting.addToggle(toggle => toggle
      .setTooltip("Create note if it doesn't exist")
      .setValue(note.createIfMissing)
      .onChange(async (value) => {
        this.plugin.settings.pinnedNotes[index].createIfMissing = value;
        await this.plugin.saveSettings();
      }));

    // Delete button
    setting.addExtraButton(button => button
      .setIcon("trash")
      .setTooltip("Remove")
      .onClick(async () => {
        this.plugin.settings.pinnedNotes.splice(index, 1);
        await this.plugin.saveSettings();
        this.display();
      }));
  }
}

module.exports = SidebarNotesPlugin;
