import {
  App,
  Plugin,
  PluginSettingTab,
  Setting,
  WorkspaceLeaf,
  TFile,
  Notice,
  TAbstractFile,
  SuggestModal
} from "obsidian";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface PinnedNote {
  /** Display name for the command */
  name: string;
  /** Path to the note (relative to vault root) */
  path: string;
  /** Whether to create the note if it doesn't exist */
  createIfMissing: boolean;
}

interface SidebarNotesSettings {
  pinnedNotes: PinnedNote[];
  /** Whether to focus the sidebar after opening */
  focusOnOpen: boolean;
  /** Default template for new notes */
  newNoteTemplate: string;
}

const DEFAULT_SETTINGS: SidebarNotesSettings = {
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

export default class SidebarNotesPlugin extends Plugin {
  settings!: SidebarNotesSettings;
  private commandIds: string[] = [];

  async onload() {
    await this.loadSettings();

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

  /**
   * Registers a command for each pinned note in settings.
   * Called on load and when settings change.
   */
  registerPinnedNoteCommands() {
    // Remove old commands (can't actually unregister in Obsidian API,
    // but we track IDs to avoid duplicates)
    this.commandIds = [];

    for (const note of this.settings.pinnedNotes) {
      const commandId = `open-sidebar-${this.sanitizeId(note.name)}`;

      // Skip if already registered (during reload)
      if (this.commandIds.includes(commandId)) continue;

      this.addCommand({
        id: commandId,
        name: `Open ${note.name} in sidebar`,
        callback: () => this.openNoteInSidebar(note)
      });

      this.commandIds.push(commandId);
    }
  }

  /**
   * Sanitize a string to be used as a command ID
   */
  private sanitizeId(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }

  // --------------------------------------------------------------------------
  // CORE SIDEBAR FUNCTIONALITY
  // --------------------------------------------------------------------------

  /**
   * Opens a pinned note in the right sidebar.
   *
   * KEY API PATTERNS USED (from habit tracker analysis):
   * 1. workspace.getRightLeaf(false) - Gets a leaf in right sidebar
   *    - false = don't split, get existing leaf or create one
   * 2. leaf.openFile(file) - Opens a markdown file in the leaf
   * 3. workspace.revealLeaf(leaf) - Brings the leaf into focus
   */
  async openNoteInSidebar(note: PinnedNote) {
    const { workspace, vault } = this.app;

    // Get the file, creating it if necessary
    let file = vault.getAbstractFileByPath(note.path);

    if (!file) {
      if (note.createIfMissing) {
        // Create the note with template
        const content = this.settings.newNoteTemplate
          .replace(/\{\{name\}\}/g, note.name);

        // Ensure parent folders exist
        const folderPath = note.path.substring(0, note.path.lastIndexOf("/"));
        if (folderPath) {
          await this.ensureFolderExists(folderPath);
        }

        file = await vault.create(note.path, content);
        new Notice(`Created new note: ${note.name}`);
      } else {
        new Notice(`Note not found: ${note.path}`);
        return;
      }
    }

    if (!(file instanceof TFile)) {
      new Notice(`Path is not a file: ${note.path}`);
      return;
    }

    // ========================================================================
    // KEY SIDEBAR API: workspace.getRightLeaf(false)
    // ========================================================================
    // This is the critical API call that gets a leaf in the RIGHT sidebar
    // (where Backlinks, Outline, etc. appear).
    //
    // The parameter `false` means:
    // - Don't split the current leaf
    // - Get an existing leaf in the sidebar, or create a new one
    //
    // Alternative: workspace.getLeftLeaf(false) for left sidebar
    // ========================================================================
    const rightLeaf = workspace.getRightLeaf(false);

    if (!rightLeaf) {
      new Notice("Could not get sidebar leaf");
      return;
    }

    // Open the file in the sidebar leaf
    await rightLeaf.openFile(file, { active: this.settings.focusOnOpen });

    // Optionally reveal (focus) the leaf
    if (this.settings.focusOnOpen) {
      workspace.revealLeaf(rightLeaf);
    }

    // Pin the leaf to prevent it from being replaced
    // This keeps the note "pinned" in the sidebar
    rightLeaf.setPinned(true);
  }

  /**
   * Opens a file picker modal to select any note to open in sidebar
   */
  openNotePicker() {
    new NoteSuggestModal(this.app, (file) => {
      this.openFileInSidebar(file);
    }).open();
  }

  /**
   * Opens any TFile in the right sidebar
   */
  async openFileInSidebar(file: TFile) {
    const { workspace } = this.app;

    const rightLeaf = workspace.getRightLeaf(false);
    if (!rightLeaf) {
      new Notice("Could not get sidebar leaf");
      return;
    }

    await rightLeaf.openFile(file, { active: this.settings.focusOnOpen });

    if (this.settings.focusOnOpen) {
      workspace.revealLeaf(rightLeaf);
    }

    rightLeaf.setPinned(true);
  }

  /**
   * Ensure a folder path exists, creating it if necessary
   */
  private async ensureFolderExists(folderPath: string) {
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

/**
 * Modal for selecting a note from the vault
 */
class NoteSuggestModal extends SuggestModal<TFile> {
  private onSelect: (file: TFile) => void;

  constructor(app: App, onSelect: (file: TFile) => void) {
    super(app);
    this.onSelect = onSelect;
    this.setPlaceholder("Type to search for a note...");
  }

  getSuggestions(query: string): TFile[] {
    const files = this.app.vault.getMarkdownFiles();
    const lowerQuery = query.toLowerCase();

    return files
      .filter(file => file.path.toLowerCase().includes(lowerQuery))
      .slice(0, 50); // Limit results
  }

  renderSuggestion(file: TFile, el: HTMLElement) {
    el.createEl("div", { text: file.basename });
    el.createEl("small", { text: file.path, cls: "nav-file-title-content" });
  }

  onChooseSuggestion(file: TFile) {
    this.onSelect(file);
  }
}

// ============================================================================
// SETTINGS TAB
// ============================================================================

class SidebarNotesSettingTab extends PluginSettingTab {
  plugin: SidebarNotesPlugin;

  constructor(app: App, plugin: SidebarNotesPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Sidebar Notes Settings" });

    // Focus on open toggle
    new Setting(containerEl)
      .setName("Focus sidebar on open")
      .setDesc("Whether to focus the sidebar when opening a note")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.focusOnOpen)
        .onChange(async (value) => {
          this.plugin.settings.focusOnOpen = value;
          await this.plugin.saveSettings();
        }));

    // New note template
    new Setting(containerEl)
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
      text: "Configure notes that will have dedicated commands to open in the sidebar.",
      cls: "setting-item-description"
    });

    // Add existing notes
    this.plugin.settings.pinnedNotes.forEach((note, index) => {
      this.addPinnedNoteSetting(containerEl, note, index);
    });

    // Add new note button
    new Setting(containerEl)
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
          this.display(); // Refresh
        }));

    // Usage instructions
    containerEl.createEl("h3", { text: "Usage" });
    containerEl.createEl("p", {
      text: "After adding pinned notes, use the command palette (Ctrl/Cmd+P) and search for \"Open [Note Name] in sidebar\" to open them.",
      cls: "setting-item-description"
    });
    containerEl.createEl("p", {
      text: "You can also use \"Open note in sidebar (picker)\" to select any note from your vault.",
      cls: "setting-item-description"
    });
  }

  private addPinnedNoteSetting(container: HTMLElement, note: PinnedNote, index: number) {
    const setting = new Setting(container)
      .setClass("pinned-note-setting");

    // Name input
    setting.addText(text => text
      .setPlaceholder("Display name")
      .setValue(note.name)
      .onChange(async (value) => {
        this.plugin.settings.pinnedNotes[index].name = value;
        await this.plugin.saveSettings();
        this.plugin.registerPinnedNoteCommands();
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
    setting.addButton(button => button
      .setIcon("trash")
      .setTooltip("Remove")
      .onClick(async () => {
        this.plugin.settings.pinnedNotes.splice(index, 1);
        await this.plugin.saveSettings();
        this.plugin.registerPinnedNoteCommands();
        this.display();
      }));
  }
}
