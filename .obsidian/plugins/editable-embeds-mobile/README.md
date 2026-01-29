# Editable Embeds Mobile

An Obsidian plugin that makes embedded notes editable directly in Live Preview mode, optimized for mobile devices.

## Features

- **Inline Editing**: Edit embedded notes without leaving your current document
- **Mobile Optimized**: Large touch targets and mobile-friendly UI
- **Section Support**: Edit specific headings or block references
- **Auto-Save**: Changes are automatically saved as you type
- **Multiple Interaction Methods**:
  - Tap on an embed to edit
  - Use the edit button
  - Long press (500ms) on mobile

## Usage

1. Open a note that contains embedded content (e.g., `![[Another Note]]`)
2. Tap on the embed or the edit button (pencil icon) to open the editor
3. Make your changes in the textarea
4. Click "Save" to save and close, or "Cancel" to discard changes
5. Use "Open" to open the embedded note in a new tab

## Settings

- **Enable on desktop**: By default, the plugin only works on mobile. Enable this to use it on desktop too.
- **Auto-save delay**: Time in milliseconds before auto-saving changes (default: 1000ms)
- **Show edit border**: Display a colored border when editing an embed
- **Tap to edit**: Enable/disable tapping on embeds to open the editor

## Commands

- **Toggle embed editing mode**: Opens/closes editors for all embeds in the current note

## Installation

### Manual Installation

1. Download the latest release
2. Extract the files to your vault's `.obsidian/plugins/editable-embeds-mobile/` folder
3. Reload Obsidian
4. Enable the plugin in Settings → Community Plugins

### Building from Source

```bash
cd .obsidian/plugins/editable-embeds-mobile
npm install
npm run build
```

## Compatibility

- Obsidian v1.0.0 or higher
- Works on iOS, Android, and desktop (when enabled)

## License

MIT
