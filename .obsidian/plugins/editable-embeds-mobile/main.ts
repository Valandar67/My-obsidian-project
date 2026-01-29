import { Plugin, MarkdownView, TFile, Platform } from "obsidian";

export default class EditableEmbedsMobilePlugin extends Plugin {
	async onload() {
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

		embedEl.addEventListener("dblclick", () => this.editEmbed(embedEl, file, src));
	}

	async editEmbed(embedEl: HTMLElement, file: TFile, src: string) {
		if (embedEl.querySelector("textarea")) return;

		const content = await this.app.vault.read(file);
		const section = this.getSection(content, src);

		const textarea = document.createElement("textarea");
		textarea.value = section.text;
		textarea.style.cssText = "width:100%;min-height:200px;font-family:inherit;font-size:inherit;padding:8px;box-sizing:border-box;";

		const contentEl = embedEl.querySelector(".markdown-embed-content");
		if (contentEl) (contentEl as HTMLElement).style.display = "none";

		embedEl.appendChild(textarea);
		textarea.focus();

		textarea.addEventListener("blur", async () => {
			const newContent = section.isSection
				? content.substring(0, section.start) + textarea.value + content.substring(section.end)
				: textarea.value;
			await this.app.vault.modify(file, newContent);
			textarea.remove();
			if (contentEl) (contentEl as HTMLElement).style.display = "";
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
