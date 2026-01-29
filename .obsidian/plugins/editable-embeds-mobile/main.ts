import { Plugin, MarkdownView, TFile, Platform, PluginSettingTab, App, Setting } from "obsidian";

interface EditableEmbedsSettings {
	autoScrollEmbeds: boolean;
	embedHeight: number;
	embedWidth: number;
	singleTapEdit: boolean;
	openInNativeEditor: boolean;
}

const DEFAULT_SETTINGS: EditableEmbedsSettings = {
	autoScrollEmbeds: true,
	embedHeight: 400,
	embedWidth: 400,
	singleTapEdit: false,
	openInNativeEditor: false,
};

export default class EditableEmbedsMobilePlugin extends Plugin {
	settings: EditableEmbedsSettings;
	styleEl: HTMLStyleElement | null = null;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new EditableEmbedsSettingTab(this.app, this));

		if (this.settings.autoScrollEmbeds) {
			this.injectStyles();
		}

		if (!Platform.isMobile) return;

		this.registerMarkdownPostProcessor((el, ctx) => {
			const embeds = el.querySelectorAll(".internal-embed, .markdown-embed");
			embeds.forEach((embed) => {
				if (embed instanceof HTMLElement) {
					this.makeEditable(embed, ctx.sourcePath);
				}
			});
		});

		this.registerEvent(
			this.app.workspace.on("active-leaf-change", () => this.processView())
		);

		this.app.workspace.onLayoutReady(() => this.processView());
	}

	onunload() {
		this.removeStyles();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		if (this.settings.autoScrollEmbeds) {
			this.injectStyles();
		} else {
			this.removeStyles();
		}
	}

	injectStyles() {
		this.removeStyles();
		this.styleEl = document.createElement("style");
		this.styleEl.id = "editable-embeds-mobile-styles";
		this.styleEl.textContent = `
			span.internal-embed,
			div.internal-embed {
				display: block !important;
				max-width: ${this.settings.embedWidth}px !important;
				height: ${this.settings.embedHeight}px !important;
				overflow: hidden !important;
				border: 1px solid var(--background-modifier-border) !important;
				border-radius: 8px !important;
			}

			span.internal-embed .markdown-embed,
			div.internal-embed .markdown-embed {
				height: 100% !important;
				max-height: 100% !important;
			}

			span.internal-embed .markdown-embed-content,
			div.internal-embed .markdown-embed-content,
			span.internal-embed .markdown-preview-view,
			div.internal-embed .markdown-preview-view {
				height: 100% !important;
				max-height: 100% !important;
				overflow-y: scroll !important;
				-webkit-overflow-scrolling: touch !important;
				overscroll-behavior: contain !important;
				padding: 12px !important;
			}
		`;
		document.head.appendChild(this.styleEl);
	}

	removeStyles() {
		if (this.styleEl) {
			this.styleEl.remove();
			this.styleEl = null;
		}
	}

	processView() {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view) return;

		const embeds = view.containerEl.querySelectorAll(".internal-embed, .markdown-embed");
		embeds.forEach((embed) => {
			if (embed instanceof HTMLElement && !embed.hasAttribute("data-editable")) {
				this.makeEditable(embed, view.file?.path || "");
			}
		});
	}

	makeEditable(embedEl: HTMLElement, sourcePath: string) {
		if (embedEl.hasAttribute("data-editable")) return;
		embedEl.setAttribute("data-editable", "true");

		const src = embedEl.getAttribute("src") || embedEl.getAttribute("data-src");
		if (!src) return;

		const file = this.app.metadataCache.getFirstLinkpathDest(src.split("#")[0], sourcePath);
		if (!(file instanceof TFile)) return;

		const eventType = this.settings.singleTapEdit ? "click" : "dblclick";
		embedEl.addEventListener(eventType, (e) => {
			e.preventDefault();
			e.stopPropagation();
			if (this.settings.openInNativeEditor) {
				this.openFileInEditor(file, src);
			} else {
				this.editEmbed(embedEl, file, src);
			}
		});
	}

	async openFileInEditor(file: TFile, src: string) {
		const hash = src.indexOf("#");
		const subpath = hash !== -1 ? src.substring(hash) : undefined;

		await this.app.workspace.getLeaf(true).openFile(file, {
			eState: subpath ? { subpath } : undefined,
		});
	}

	async editEmbed(embedEl: HTMLElement, file: TFile, src: string) {
		if (embedEl.querySelector(".embed-edit-textarea")) return;

		const content = await this.app.vault.read(file);
		const section = this.getSection(content, src);

		const textarea = document.createElement("textarea");
		textarea.className = "embed-edit-textarea";
		textarea.value = section.text;
		textarea.style.cssText = `
			width: 100%;
			height: 100%;
			min-height: 150px;
			font-family: var(--font-monospace);
			font-size: var(--font-text-size);
			line-height: var(--line-height-normal);
			padding: 12px;
			box-sizing: border-box;
			border: none;
			background: var(--background-primary);
			color: var(--text-normal);
			resize: none;
			outline: none;
		`;

		const contentEl = embedEl.querySelector(".markdown-embed-content, .markdown-preview-view");
		if (contentEl) (contentEl as HTMLElement).style.display = "none";

		const embedContent = embedEl.querySelector(".markdown-embed") || embedEl;
		embedContent.appendChild(textarea);
		textarea.focus();

		const saveAndClose = async () => {
			const newContent = section.isSection
				? content.substring(0, section.start) + textarea.value + content.substring(section.end)
				: textarea.value;
			await this.app.vault.modify(file, newContent);
			textarea.remove();
			if (contentEl) (contentEl as HTMLElement).style.display = "";
		};

		textarea.addEventListener("blur", saveAndClose);
		textarea.addEventListener("keydown", (e) => {
			if (e.key === "Escape") {
				textarea.blur();
			}
		});
	}

	getSection(content: string, src: string): { text: string; start: number; end: number; isSection: boolean } {
		const hash = src.indexOf("#");
		if (hash === -1) return { text: content, start: 0, end: content.length, isSection: false };

		const ref = src.substring(hash + 1);

		if (ref.startsWith("^")) {
			const blockId = ref.substring(1);
			const regex = new RegExp(`^(.*)\\s+\\^${blockId}\\s*$`, "m");
			const match = content.match(regex);
			if (match && match.index !== undefined) {
				let start = match.index;
				while (start > 0 && content[start - 1] !== "\n") start--;
				return { text: content.substring(start, match.index + match[0].length), start, end: match.index + match[0].length, isSection: true };
			}
		} else {
			const heading = decodeURIComponent(ref).toLowerCase().replace(/-/g, " ");
			const lines = content.split("\n");
			let inSection = false, level = 0, startLine = 0, endLine = lines.length;

			for (let i = 0; i < lines.length; i++) {
				const m = lines[i].match(/^(#{1,6})\s+(.+)$/);
				if (m) {
					if (!inSection && m[2].toLowerCase().trim() === heading) {
						inSection = true;
						level = m[1].length;
						startLine = i;
					} else if (inSection && m[1].length <= level) {
						endLine = i;
						break;
					}
				}
			}

			if (inSection) {
				const start = lines.slice(0, startLine).join("\n").length + (startLine > 0 ? 1 : 0);
				const text = lines.slice(startLine, endLine).join("\n");
				return { text, start, end: start + text.length, isSection: true };
			}
		}

		return { text: content, start: 0, end: content.length, isSection: false };
	}
}

class EditableEmbedsSettingTab extends PluginSettingTab {
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
			.setName("Auto-scroll embeds")
			.setDesc("Apply scrollable container styling to all embeds automatically (no need for [alt=\"scroll\"])")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.autoScrollEmbeds)
					.onChange(async (value) => {
						this.plugin.settings.autoScrollEmbeds = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Embed height")
			.setDesc("Height of embedded notes in pixels")
			.addText((text) =>
				text
					.setPlaceholder("400")
					.setValue(String(this.plugin.settings.embedHeight))
					.onChange(async (value) => {
						const num = parseInt(value);
						if (!isNaN(num) && num > 0) {
							this.plugin.settings.embedHeight = num;
							await this.plugin.saveSettings();
						}
					})
			);

		new Setting(containerEl)
			.setName("Embed width")
			.setDesc("Maximum width of embedded notes in pixels")
			.addText((text) =>
				text
					.setPlaceholder("400")
					.setValue(String(this.plugin.settings.embedWidth))
					.onChange(async (value) => {
						const num = parseInt(value);
						if (!isNaN(num) && num > 0) {
							this.plugin.settings.embedWidth = num;
							await this.plugin.saveSettings();
						}
					})
			);

		containerEl.createEl("h3", { text: "Editing behavior" });

		new Setting(containerEl)
			.setName("Single tap to edit")
			.setDesc("Edit embeds with one tap instead of double-tap")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.singleTapEdit)
					.onChange(async (value) => {
						this.plugin.settings.singleTapEdit = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Open in native editor")
			.setDesc("Open the embedded file in Obsidian's editor instead of inline editing (full markdown features but leaves current note)")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.openInNativeEditor)
					.onChange(async (value) => {
						this.plugin.settings.openInNativeEditor = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
