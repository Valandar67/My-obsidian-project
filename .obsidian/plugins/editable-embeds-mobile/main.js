"use strict";

var obsidian = require("obsidian");

const DEFAULT_SETTINGS = {
	enabled: true,
	embedHeight: 400,
	embedWidth: 400,
};

class AutoScrollEmbedsPlugin extends obsidian.Plugin {
	settings;
	styleEl = null;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new AutoScrollEmbedsSettingTab(this.app, this));

		if (this.settings.enabled) {
			this.injectStyles();
		}
	}

	onunload() {
		this.removeStyles();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		if (this.settings.enabled) {
			this.injectStyles();
		} else {
			this.removeStyles();
		}
	}

	injectStyles() {
		this.removeStyles();
		this.styleEl = document.createElement("style");
		this.styleEl.id = "auto-scroll-embeds-styles";
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
}

class AutoScrollEmbedsSettingTab extends obsidian.PluginSettingTab {
	plugin;

	constructor(app, plugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display() {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: "Auto Scroll Embeds" });

		new obsidian.Setting(containerEl)
			.setName("Enable")
			.setDesc("Apply scrollable container styling to all embeds")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enabled)
					.onChange(async (value) => {
						this.plugin.settings.enabled = value;
						await this.plugin.saveSettings();
					})
			);

		new obsidian.Setting(containerEl)
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

		new obsidian.Setting(containerEl)
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

module.exports = AutoScrollEmbedsPlugin;
