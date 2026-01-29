import { Plugin, MarkdownView, TFile, Platform, PluginSettingTab, App, Setting } from "obsidian";

interface EditableEmbedsSettings {
	autoScrollEmbeds: boolean;
	embedHeight: number;
	embedWidth: number;
}

const DEFAULT_SETTINGS: EditableEmbedsSettings = {
	autoScrollEmbeds: true,
	embedHeight: 400,
	embedWidth: 400,
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

		embedEl.addEventListener("dblclick", (e) => {
			e.preventDefault();
			e.stopPropagation();
			this.openFileInEditor(file, src);
		});
	}

	async openFileInEditor(file: TFile, src: string) {
		const hash = src.indexOf("#");
		const subpath = hash !== -1 ? src.substring(hash) : undefined;

		await this.app.workspace.getLeaf(true).openFile(file, {
			eState: subpath ? { subpath } : undefined,
		});
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
	}
}
