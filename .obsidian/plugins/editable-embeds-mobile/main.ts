import {
	App,
	Plugin,
	PluginSettingTab,
	Setting,
	MarkdownView,
	TFile,
	Platform,
	debounce,
	MarkdownRenderer,
	Component,
	EditorView,
	WidgetType,
	Decoration,
	DecorationSet,
	ViewPlugin,
	ViewUpdate,
} from "obsidian";

interface EditableEmbedsMobileSettings {
	enableOnDesktop: boolean;
	autoSaveDelay: number;
	showEditBorder: boolean;
	tapToEdit: boolean;
	expandByDefault: boolean;
}

const DEFAULT_SETTINGS: EditableEmbedsMobileSettings = {
	enableOnDesktop: false,
	autoSaveDelay: 1000,
	showEditBorder: true,
	tapToEdit: true,
	expandByDefault: false,
};

export default class EditableEmbedsMobilePlugin extends Plugin {
	settings: EditableEmbedsMobileSettings;
	private observers: MutationObserver[] = [];
	private activeEditors: Map<string, HTMLTextAreaElement> = new Map();

	async onload() {
		await this.loadSettings();

		// Only activate on mobile unless desktop is enabled
		if (!Platform.isMobile && !this.settings.enableOnDesktop) {
			console.log("Editable Embeds Mobile: Desktop mode disabled, plugin inactive");
			return;
		}

		// Register the embed processor
		this.registerMarkdownPostProcessor((el, ctx) => {
			this.processEmbeds(el, ctx.sourcePath);
		});

		// Add CSS class to body for mobile-specific styling
		if (Platform.isMobile) {
			document.body.addClass("editable-embeds-mobile");
		}

		// Register event for active leaf change to setup embeds
		this.registerEvent(
			this.app.workspace.on("active-leaf-change", () => {
				this.setupActiveViewEmbeds();
			})
		);

		// Register event for layout change
		this.registerEvent(
			this.app.workspace.on("layout-change", () => {
				setTimeout(() => this.setupActiveViewEmbeds(), 100);
			})
		);

		// Initial setup
		this.app.workspace.onLayoutReady(() => {
			this.setupActiveViewEmbeds();
		});

		// Add settings tab
		this.addSettingTab(new EditableEmbedsMobileSettingTab(this.app, this));

		// Add command to toggle embed editing
		this.addCommand({
			id: "toggle-embed-editing",
			name: "Toggle embed editing mode",
			callback: () => {
				this.toggleAllEmbedEditing();
			},
		});

		console.log("Editable Embeds Mobile plugin loaded");
	}

	onunload() {
		// Clean up observers
		this.observers.forEach((obs) => obs.disconnect());
		this.observers = [];

		// Clean up active editors
		this.activeEditors.forEach((editor, key) => {
			editor.remove();
		});
		this.activeEditors.clear();

		// Remove body class
		document.body.removeClass("editable-embeds-mobile");

		console.log("Editable Embeds Mobile plugin unloaded");
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private setupActiveViewEmbeds() {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView) return;

		const container = activeView.containerEl;
		this.setupEmbedsInContainer(container, activeView.file?.path || "");

		// Set up mutation observer to catch dynamically loaded embeds
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				mutation.addedNodes.forEach((node) => {
					if (node instanceof HTMLElement) {
						this.processEmbeds(node, activeView.file?.path || "");
					}
				});
			});
		});

		observer.observe(container, {
			childList: true,
			subtree: true,
		});

		this.observers.push(observer);
	}

	private setupEmbedsInContainer(container: HTMLElement, sourcePath: string) {
		// Find all embed elements
		const embeds = container.querySelectorAll(".internal-embed, .markdown-embed");
		embeds.forEach((embed) => {
			if (embed instanceof HTMLElement) {
				this.makeEmbedEditable(embed, sourcePath);
			}
		});
	}

	private processEmbeds(el: HTMLElement, sourcePath: string) {
		// Process any embeds in the rendered content
		const embeds = el.querySelectorAll(".internal-embed, .markdown-embed");
		embeds.forEach((embed) => {
			if (embed instanceof HTMLElement) {
				this.makeEmbedEditable(embed, sourcePath);
			}
		});

		// Also check if the element itself is an embed
		if (el.classList.contains("internal-embed") || el.classList.contains("markdown-embed")) {
			this.makeEmbedEditable(el, sourcePath);
		}
	}

	private makeEmbedEditable(embedEl: HTMLElement, sourcePath: string) {
		// Skip if already processed
		if (embedEl.hasAttribute("data-editable-embed")) {
			return;
		}
		embedEl.setAttribute("data-editable-embed", "true");

		// Get the embedded file path
		const src = embedEl.getAttribute("src") || embedEl.getAttribute("data-src");
		if (!src) return;

		// Resolve the file path
		const linkedFile = this.app.metadataCache.getFirstLinkpathDest(src, sourcePath);
		if (!linkedFile || !(linkedFile instanceof TFile)) return;

		// Create edit overlay/button
		this.createEditInterface(embedEl, linkedFile);
	}

	private createEditInterface(embedEl: HTMLElement, file: TFile) {
		// Add edit button
		const editBtn = document.createElement("button");
		editBtn.className = "editable-embed-edit-btn";
		editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
		editBtn.setAttribute("aria-label", "Edit embedded note");

		embedEl.style.position = "relative";
		embedEl.appendChild(editBtn);

		// Handle tap/click to edit
		if (this.settings.tapToEdit) {
			embedEl.addEventListener("click", (e) => {
				// Prevent if clicking a link or other interactive element
				if ((e.target as HTMLElement).closest("a, button, input, textarea")) {
					return;
				}
				this.openEmbedEditor(embedEl, file);
			});
		}

		// Handle edit button click
		editBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			e.preventDefault();
			this.openEmbedEditor(embedEl, file);
		});

		// Long press handler for mobile
		if (Platform.isMobile) {
			let pressTimer: NodeJS.Timeout | null = null;

			embedEl.addEventListener("touchstart", (e) => {
				pressTimer = setTimeout(() => {
					this.openEmbedEditor(embedEl, file);
				}, 500);
			});

			embedEl.addEventListener("touchend", () => {
				if (pressTimer) {
					clearTimeout(pressTimer);
					pressTimer = null;
				}
			});

			embedEl.addEventListener("touchmove", () => {
				if (pressTimer) {
					clearTimeout(pressTimer);
					pressTimer = null;
				}
			});
		}
	}

	private async openEmbedEditor(embedEl: HTMLElement, file: TFile) {
		// Check if editor is already open
		const existingEditor = embedEl.querySelector(".editable-embed-editor");
		if (existingEditor) {
			return;
		}

		// Read the file content
		const content = await this.app.vault.read(file);

		// Get any heading/block reference from the embed
		const src = embedEl.getAttribute("src") || embedEl.getAttribute("data-src") || "";
		const hashIndex = src.indexOf("#");
		let sectionContent = content;
		let sectionStart = 0;
		let sectionEnd = content.length;
		let isSection = false;

		if (hashIndex !== -1) {
			const reference = src.substring(hashIndex + 1);
			// Handle heading reference
			if (!reference.startsWith("^")) {
				const headingMatch = this.findHeadingSection(content, reference);
				if (headingMatch) {
					sectionContent = headingMatch.content;
					sectionStart = headingMatch.start;
					sectionEnd = headingMatch.end;
					isSection = true;
				}
			} else {
				// Handle block reference
				const blockMatch = this.findBlockSection(content, reference.substring(1));
				if (blockMatch) {
					sectionContent = blockMatch.content;
					sectionStart = blockMatch.start;
					sectionEnd = blockMatch.end;
					isSection = true;
				}
			}
		}

		// Create editor container
		const editorContainer = document.createElement("div");
		editorContainer.className = "editable-embed-editor";

		// Create toolbar
		const toolbar = document.createElement("div");
		toolbar.className = "editable-embed-toolbar";

		const fileNameSpan = document.createElement("span");
		fileNameSpan.className = "editable-embed-filename";
		fileNameSpan.textContent = file.basename;
		if (isSection) {
			fileNameSpan.textContent += ` (section)`;
		}
		toolbar.appendChild(fileNameSpan);

		const buttonGroup = document.createElement("div");
		buttonGroup.className = "editable-embed-buttons";

		const saveBtn = document.createElement("button");
		saveBtn.className = "editable-embed-save-btn";
		saveBtn.textContent = "Save";

		const cancelBtn = document.createElement("button");
		cancelBtn.className = "editable-embed-cancel-btn";
		cancelBtn.textContent = "Cancel";

		const openBtn = document.createElement("button");
		openBtn.className = "editable-embed-open-btn";
		openBtn.textContent = "Open";

		buttonGroup.appendChild(openBtn);
		buttonGroup.appendChild(cancelBtn);
		buttonGroup.appendChild(saveBtn);
		toolbar.appendChild(buttonGroup);

		// Create textarea
		const textarea = document.createElement("textarea");
		textarea.className = "editable-embed-textarea";
		textarea.value = sectionContent;
		textarea.spellcheck = true;

		// Auto-resize textarea
		const resizeTextarea = () => {
			textarea.style.height = "auto";
			textarea.style.height = Math.max(100, textarea.scrollHeight) + "px";
		};

		editorContainer.appendChild(toolbar);
		editorContainer.appendChild(textarea);

		// Hide original content and show editor
		const originalContent = embedEl.querySelector(".markdown-embed-content");
		if (originalContent instanceof HTMLElement) {
			originalContent.style.display = "none";
		}

		embedEl.appendChild(editorContainer);
		embedEl.classList.add("editable-embed-editing");

		// Focus and resize
		setTimeout(() => {
			textarea.focus();
			resizeTextarea();
		}, 50);

		textarea.addEventListener("input", resizeTextarea);

		// Auto-save with debounce
		const debouncedSave = debounce(async () => {
			await this.saveEmbedContent(file, textarea.value, content, sectionStart, sectionEnd, isSection);
		}, this.settings.autoSaveDelay, true);

		textarea.addEventListener("input", () => {
			debouncedSave();
		});

		// Save button handler
		saveBtn.addEventListener("click", async () => {
			await this.saveEmbedContent(file, textarea.value, content, sectionStart, sectionEnd, isSection);
			this.closeEmbedEditor(embedEl, editorContainer, originalContent);
		});

		// Cancel button handler
		cancelBtn.addEventListener("click", () => {
			this.closeEmbedEditor(embedEl, editorContainer, originalContent);
		});

		// Open in new tab button handler
		openBtn.addEventListener("click", () => {
			this.app.workspace.openLinkText(file.path, "", true);
			this.closeEmbedEditor(embedEl, editorContainer, originalContent);
		});

		// Store reference
		this.activeEditors.set(file.path, textarea);
	}

	private findHeadingSection(content: string, heading: string): { content: string; start: number; end: number } | null {
		const lines = content.split("\n");
		const decodedHeading = decodeURIComponent(heading).toLowerCase().replace(/-/g, " ");

		let inSection = false;
		let sectionLevel = 0;
		let startLine = 0;
		let endLine = lines.length;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

			if (headingMatch) {
				const level = headingMatch[1].length;
				const headingText = headingMatch[2].toLowerCase().trim();

				if (!inSection && headingText === decodedHeading) {
					inSection = true;
					sectionLevel = level;
					startLine = i;
				} else if (inSection && level <= sectionLevel) {
					endLine = i;
					break;
				}
			}
		}

		if (inSection) {
			const sectionLines = lines.slice(startLine, endLine);
			const start = lines.slice(0, startLine).join("\n").length + (startLine > 0 ? 1 : 0);
			const end = start + sectionLines.join("\n").length;
			return {
				content: sectionLines.join("\n"),
				start,
				end,
			};
		}

		return null;
	}

	private findBlockSection(content: string, blockId: string): { content: string; start: number; end: number } | null {
		const blockRegex = new RegExp(`^(.*)\\s+\\^${blockId}\\s*$`, "m");
		const match = content.match(blockRegex);

		if (match && match.index !== undefined) {
			// Find the start of the paragraph/block
			let start = match.index;
			while (start > 0 && content[start - 1] !== "\n") {
				start--;
			}
			// Go back further to include full paragraph
			while (start > 0 && content[start - 1] !== "\n" || (start > 1 && content[start - 2] !== "\n")) {
				if (content[start - 1] === "\n" && (start < 2 || content[start - 2] === "\n")) {
					break;
				}
				start--;
			}

			const end = match.index + match[0].length;
			return {
				content: content.substring(start, end),
				start,
				end,
			};
		}

		return null;
	}

	private async saveEmbedContent(
		file: TFile,
		newContent: string,
		originalFullContent: string,
		sectionStart: number,
		sectionEnd: number,
		isSection: boolean
	) {
		try {
			let finalContent: string;

			if (isSection) {
				// Replace just the section
				finalContent =
					originalFullContent.substring(0, sectionStart) +
					newContent +
					originalFullContent.substring(sectionEnd);
			} else {
				// Replace entire file content
				finalContent = newContent;
			}

			await this.app.vault.modify(file, finalContent);
			console.log(`Saved changes to ${file.path}`);
		} catch (error) {
			console.error("Failed to save embed content:", error);
		}
	}

	private closeEmbedEditor(
		embedEl: HTMLElement,
		editorContainer: HTMLElement,
		originalContent: HTMLElement | null
	) {
		editorContainer.remove();
		embedEl.classList.remove("editable-embed-editing");

		if (originalContent) {
			originalContent.style.display = "";
		}

		// Get file path and remove from active editors
		const src = embedEl.getAttribute("src") || embedEl.getAttribute("data-src") || "";
		const file = this.app.metadataCache.getFirstLinkpathDest(src.split("#")[0], "");
		if (file) {
			this.activeEditors.delete(file.path);
		}
	}

	private toggleAllEmbedEditing() {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView) return;

		const container = activeView.containerEl;
		const embeds = container.querySelectorAll(".internal-embed[data-editable-embed], .markdown-embed[data-editable-embed]");

		embeds.forEach((embed) => {
			if (embed instanceof HTMLElement) {
				const editor = embed.querySelector(".editable-embed-editor");
				if (editor) {
					// Close editor
					const originalContent = embed.querySelector(".markdown-embed-content") as HTMLElement;
					this.closeEmbedEditor(embed, editor as HTMLElement, originalContent);
				} else {
					// Open editor
					const src = embed.getAttribute("src") || embed.getAttribute("data-src");
					if (src) {
						const linkedFile = this.app.metadataCache.getFirstLinkpathDest(src.split("#")[0], activeView.file?.path || "");
						if (linkedFile instanceof TFile) {
							this.openEmbedEditor(embed, linkedFile);
						}
					}
				}
			}
		});
	}
}

class EditableEmbedsMobileSettingTab extends PluginSettingTab {
	plugin: EditableEmbedsMobilePlugin;

	constructor(app: App, plugin: EditableEmbedsMobilePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: "Editable Embeds Mobile Settings" });

		new Setting(containerEl)
			.setName("Enable on desktop")
			.setDesc("Also enable editable embeds on desktop (plugin is designed for mobile)")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableOnDesktop)
					.onChange(async (value) => {
						this.plugin.settings.enableOnDesktop = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Auto-save delay")
			.setDesc("Delay in milliseconds before auto-saving changes (default: 1000)")
			.addText((text) =>
				text
					.setPlaceholder("1000")
					.setValue(String(this.plugin.settings.autoSaveDelay))
					.onChange(async (value) => {
						const num = parseInt(value);
						if (!isNaN(num) && num >= 0) {
							this.plugin.settings.autoSaveDelay = num;
							await this.plugin.saveSettings();
						}
					})
			);

		new Setting(containerEl)
			.setName("Show edit border")
			.setDesc("Show a colored border when an embed is being edited")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showEditBorder)
					.onChange(async (value) => {
						this.plugin.settings.showEditBorder = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Tap to edit")
			.setDesc("Enable tapping/clicking on an embed to open the editor")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.tapToEdit)
					.onChange(async (value) => {
						this.plugin.settings.tapToEdit = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
