---
editor-width: 100
cssclasses:
  - hide-properties
---

```dataviewjs
// ==========================================
// SOCIAL SESSION - GLOBAL STYLES & CONFIG
// Warm Brown Theme (matching Home.md)
// ==========================================

if (!document.getElementById('social-session-styles-v1')) {
    const style = document.createElement('style');
    style.id = 'social-session-styles-v1';
    style.textContent = `
        @keyframes social-breathe {
            0%, 100% { box-shadow: inset 0 0 20px rgba(154, 134, 122, 0.03); }
            50% { box-shadow: inset 0 0 40px rgba(154, 134, 122, 0.08); }
        }

        @keyframes social-fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scanline-sweep {
            0% { top: -100%; opacity: 0; }
            50% { opacity: 0.4; }
            100% { top: 100%; opacity: 0; }
        }

        .social-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0); display: flex; align-items: center;
            justify-content: center; z-index: 9999; backdrop-filter: blur(0px);
            transition: background 0.5s ease, backdrop-filter 0.5s ease;
        }
        .social-modal-overlay.visible {
            background: rgba(0,0,0,0.95); backdrop-filter: blur(4px);
        }
        .social-modal-content {
            background: #0a0a0a; padding: 32px; border: 1px solid #3a2a2a;
            max-width: 500px; max-height: 85vh; width: 90%;
            display: flex; flex-direction: column; gap: 20px;
            box-shadow: 0 40px 120px rgba(0,0,0,0.9); position: relative;
            opacity: 0; transform: translateY(30px);
            transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .social-modal-overlay.visible .social-modal-content {
            opacity: 1; transform: translateY(0);
        }

        .social-folder-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 16px;
            background: #0f0f0f;
            border: 1px solid #3a2a2a;
            margin-bottom: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .social-folder-item:hover {
            border-color: #9a867a;
            background: #121210;
        }

        .social-file-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            background: #0c0c0c;
            border: 1px solid #2a2525;
            margin-bottom: 6px;
            margin-left: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .social-file-item:hover {
            border-color: #9a867a;
            background: #101010;
        }
    `;
    document.head.appendChild(style);
}

// Theme - Warm Brown (matching Home.md social)
const SOCIAL_THEME = {
    color: "#9a867a",
    colorHover: "#aa968a",
    colorBorder: "#3a2a2a",
    colorBorderHover: "#4a3a3a",
    colorMuted: "#6a5a5a",
    colorAccent: "#aa968a"
};

window.SOCIAL_THEME = SOCIAL_THEME;
window.VAULT_NAME = "Alt society";

// Settings persistence
const SOCIAL_SETTINGS_KEY = 'social-session-settings-v1';

function loadSocialSettings() {
    try {
        const saved = localStorage.getItem(SOCIAL_SETTINGS_KEY);
        if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
        socialFolder: "Social"
    };
}

function saveSocialSettings(settings) {
    try {
        localStorage.setItem(SOCIAL_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {}
}

window.SOCIAL_SETTINGS = loadSocialSettings();

// Helper: Create decorative corners
window.createSocialCorners = function(container, color = SOCIAL_THEME.color, size = 16) {
    const corners = [];
    ['TL', 'TR', 'BL', 'BR'].forEach(pos => {
        const corner = document.createElement('div');
        const isTop = pos.includes('T');
        const isLeft = pos.includes('L');
        corner.style.cssText = `
            position: absolute;
            ${isTop ? 'top: 0' : 'bottom: 0'};
            ${isLeft ? 'left: 0' : 'right: 0'};
            width: ${size}px;
            height: ${size}px;
            border-${isTop ? 'top' : 'bottom'}: 1px solid ${color};
            border-${isLeft ? 'left' : 'right'}: 1px solid ${color};
            z-index: 10;
            pointer-events: none;
            transition: all 0.4s ease;
        `;
        corner.dataset.corner = pos;
        corner.dataset.baseSize = size;
        container.appendChild(corner);
        corners.push(corner);
    });
    return corners;
};

dv.paragraph("");
```

```dataviewjs
// ==========================================
// FOLDER BOARD - SOCIAL CONNECTIONS EXPLORER
// Click to navigate through folders and files
// ==========================================

const THEME = window.SOCIAL_THEME || { color: "#9a867a", colorHover: "#aa968a", colorBorder: "#3a2a2a", colorMuted: "#6a5a5a", colorAccent: "#aa968a" };
const VAULT_NAME = window.VAULT_NAME || "Alt society";
const settings = window.SOCIAL_SETTINGS || { socialFolder: "Social" };
const createCorners = window.createSocialCorners;

// Main container
const container = dv.el("div", "");
container.style.cssText = `
    max-width: 460px;
    margin: 20px auto;
    padding: 0;
`;

// Card wrapper
const card = document.createElement('div');
card.style.cssText = `
    border: 1px solid ${THEME.colorBorder};
    background: #0a0a0a;
    position: relative;
    overflow: hidden;
    animation: social-breathe 8s ease-in-out infinite;
`;
container.appendChild(card);

if (createCorners) createCorners(card, THEME.color);

// Header section
const headerSection = document.createElement('div');
headerSection.style.cssText = `
    padding: 24px 28px 20px 28px;
    background: linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 100%);
    border-bottom: 1px solid ${THEME.colorBorder};
`;
card.appendChild(headerSection);

const header = document.createElement('h3');
header.textContent = "Social Board";
header.style.cssText = `
    margin: 0 0 8px 0;
    color: ${THEME.color};
    font-size: 13px;
    font-weight: 500;
    font-family: "Times New Roman", serif;
    letter-spacing: 3px;
    text-transform: uppercase;
    opacity: 0.7;
`;
headerSection.appendChild(header);

const desc = document.createElement('p');
desc.textContent = "Explore connections and community";
desc.style.cssText = `
    margin: 0;
    color: ${THEME.colorMuted};
    font-size: 14px;
    line-height: 1.4;
    font-family: "Georgia", serif;
    font-style: italic;
`;
headerSection.appendChild(desc);

// Breadcrumb navigation
const breadcrumbSection = document.createElement('div');
breadcrumbSection.style.cssText = `
    padding: 12px 20px;
    background: #0c0c0c;
    border-bottom: 1px solid ${THEME.colorBorder};
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
`;
card.appendChild(breadcrumbSection);

// Content section
const contentSection = document.createElement('div');
contentSection.style.cssText = `
    padding: 16px 20px;
    max-height: 400px;
    overflow-y: auto;
`;
card.appendChild(contentSection);

// Current path state
let currentPath = settings.socialFolder;

// Get folder contents
async function getFolderContents(folderPath) {
    const folder = app.vault.getAbstractFileByPath(folderPath);
    if (!folder || !folder.children) {
        return { folders: [], files: [] };
    }

    const folders = [];
    const files = [];

    for (const child of folder.children) {
        if (child.children !== undefined) {
            // It's a folder
            folders.push({
                name: child.name,
                path: child.path
            });
        } else if (child.extension === 'md') {
            // It's a markdown file
            files.push({
                name: child.basename,
                path: child.path
            });
        }
    }

    // Sort alphabetically
    folders.sort((a, b) => a.name.localeCompare(b.name));
    files.sort((a, b) => a.name.localeCompare(b.name));

    return { folders, files };
}

// Update breadcrumb
function updateBreadcrumb() {
    breadcrumbSection.innerHTML = '';

    const pathParts = currentPath.split('/');
    let accumulatedPath = '';

    // Home icon
    const homeBtn = document.createElement('span');
    homeBtn.textContent = '🏠';
    homeBtn.style.cssText = `
        cursor: pointer;
        font-size: 14px;
        transition: transform 0.2s ease;
    `;
    homeBtn.onclick = () => {
        currentPath = settings.socialFolder;
        renderContents();
    };
    homeBtn.onmouseenter = () => { homeBtn.style.transform = 'scale(1.1)'; };
    homeBtn.onmouseleave = () => { homeBtn.style.transform = 'scale(1)'; };
    breadcrumbSection.appendChild(homeBtn);

    pathParts.forEach((part, index) => {
        accumulatedPath = pathParts.slice(0, index + 1).join('/');

        // Separator
        const sep = document.createElement('span');
        sep.textContent = ' / ';
        sep.style.cssText = `color: ${THEME.colorMuted}; font-size: 12px;`;
        breadcrumbSection.appendChild(sep);

        // Path part
        const pathBtn = document.createElement('span');
        pathBtn.textContent = part;
        const thisPath = accumulatedPath;
        pathBtn.style.cssText = `
            color: ${index === pathParts.length - 1 ? THEME.color : THEME.colorMuted};
            font-size: 12px;
            font-family: "Times New Roman", serif;
            letter-spacing: 0.5px;
            cursor: ${index === pathParts.length - 1 ? 'default' : 'pointer'};
            transition: color 0.2s ease;
        `;
        if (index < pathParts.length - 1) {
            pathBtn.onmouseenter = () => { pathBtn.style.color = THEME.colorHover; };
            pathBtn.onmouseleave = () => { pathBtn.style.color = THEME.colorMuted; };
            pathBtn.onclick = () => {
                currentPath = thisPath;
                renderContents();
            };
        }
        breadcrumbSection.appendChild(pathBtn);
    });
}

// Render folder contents
async function renderContents() {
    contentSection.innerHTML = '';
    updateBreadcrumb();

    const { folders, files } = await getFolderContents(currentPath);

    if (folders.length === 0 && files.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.style.cssText = `
            text-align: center;
            padding: 40px 20px;
            color: ${THEME.colorMuted};
        `;
        emptyMsg.innerHTML = `
            <div style="font-size: 32px; margin-bottom: 16px; opacity: 0.3;">👥</div>
            <div style="font-family: Georgia, serif; font-style: italic; font-size: 13px;">No files or folders found</div>
            <div style="font-family: 'Courier New', monospace; font-size: 10px; letter-spacing: 1px; margin-top: 12px; opacity: 0.5;">
                Create folder: ${settings.socialFolder}
            </div>
        `;
        contentSection.appendChild(emptyMsg);
        return;
    }

    // Render folders first
    folders.forEach((folder, index) => {
        const item = document.createElement('div');
        item.className = 'social-folder-item';
        item.style.animation = `social-fade-in 0.3s ease ${index * 0.05}s both`;

        const icon = document.createElement('span');
        icon.textContent = '📂';
        icon.style.cssText = `font-size: 18px; flex-shrink: 0;`;
        item.appendChild(icon);

        const name = document.createElement('span');
        name.textContent = folder.name;
        name.style.cssText = `
            color: ${THEME.color};
            font-size: 14px;
            font-family: "Times New Roman", serif;
            letter-spacing: 0.5px;
            flex: 1;
        `;
        item.appendChild(name);

        const arrow = document.createElement('span');
        arrow.textContent = '→';
        arrow.style.cssText = `
            color: ${THEME.colorMuted};
            font-size: 14px;
            opacity: 0;
            transition: opacity 0.2s ease, transform 0.2s ease;
        `;
        item.appendChild(arrow);

        item.onmouseenter = () => {
            arrow.style.opacity = '1';
            arrow.style.transform = 'translateX(4px)';
        };
        item.onmouseleave = () => {
            arrow.style.opacity = '0';
            arrow.style.transform = 'translateX(0)';
        };

        item.onclick = () => {
            currentPath = folder.path;
            renderContents();
        };

        contentSection.appendChild(item);
    });

    // Render files
    files.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'social-file-item';
        item.style.animation = `social-fade-in 0.3s ease ${(folders.length + index) * 0.05}s both`;

        const icon = document.createElement('span');
        icon.textContent = '📄';
        icon.style.cssText = `font-size: 16px; flex-shrink: 0;`;
        item.appendChild(icon);

        const name = document.createElement('span');
        name.textContent = file.name;
        name.style.cssText = `
            color: ${THEME.colorAccent};
            font-size: 13px;
            font-family: "Times New Roman", serif;
            letter-spacing: 0.5px;
            flex: 1;
        `;
        item.appendChild(name);

        item.onclick = () => {
            window.location.href = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent(file.path)}`;
        };

        contentSection.appendChild(item);
    });
}

// Initial render
renderContents();
```

```dataviewjs
// ==========================================
// SETTINGS CARD - CONFIGURE SOCIAL FOLDER
// ==========================================

const THEME = window.SOCIAL_THEME || { color: "#9a867a", colorHover: "#aa968a", colorBorder: "#3a2a2a", colorMuted: "#6a5a5a" };
const createCorners = window.createSocialCorners;

// Modal system
let activeModal = null;

function closeModal() {
    if (!activeModal) return;
    activeModal.classList.remove('visible');
    setTimeout(() => {
        if (activeModal?.parentNode) activeModal.parentNode.removeChild(activeModal);
        activeModal = null;
    }, 500);
}

function openSettingsModal() {
    if (activeModal) {
        activeModal.parentNode.removeChild(activeModal);
        activeModal = null;
    }

    const modal = document.createElement("div");
    modal.className = "social-modal-overlay";
    activeModal = modal;

    const modalContent = document.createElement("div");
    modalContent.className = "social-modal-content";
    modal.appendChild(modalContent);

    if (createCorners) createCorners(modalContent, THEME.color);

    const scrollWrapper = document.createElement('div');
    scrollWrapper.style.cssText = 'overflow-y: auto; max-height: calc(85vh - 60px); display: flex; flex-direction: column; gap: 20px;';
    modalContent.appendChild(scrollWrapper);

    // Title
    const title = document.createElement("h2");
    title.textContent = "Settings";
    title.style.cssText = `
        margin: 0;
        color: ${THEME.color};
        font-size: 14px;
        font-weight: 500;
        font-family: "Times New Roman", serif;
        letter-spacing: 3px;
        text-align: center;
        text-transform: uppercase;
        opacity: 0.8;
    `;
    scrollWrapper.appendChild(title);

    const divider = document.createElement('div');
    divider.style.cssText = `
        width: 60px;
        height: 1px;
        background: linear-gradient(90deg, transparent, ${THEME.color}, transparent);
        margin: 0 auto;
    `;
    scrollWrapper.appendChild(divider);

    // Folder path input
    const folderLabel = document.createElement('div');
    folderLabel.textContent = 'Social Folder Path';
    folderLabel.style.cssText = `color: ${THEME.colorMuted}; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; margin-top: 12px;`;
    scrollWrapper.appendChild(folderLabel);

    const folderInput = document.createElement('input');
    folderInput.type = 'text';
    folderInput.value = window.SOCIAL_SETTINGS.socialFolder;
    folderInput.placeholder = 'Social';
    folderInput.style.cssText = `
        width: 100%;
        padding: 14px;
        background: #0f0f0f;
        border: 1px solid ${THEME.colorBorder};
        color: ${THEME.color};
        font-size: 14px;
        box-sizing: border-box;
    `;
    scrollWrapper.appendChild(folderInput);

    // Info note
    const infoNote = document.createElement('div');
    infoNote.style.cssText = `
        padding: 16px;
        background: #0c0c0c;
        border-left: 2px solid ${THEME.color};
    `;
    infoNote.innerHTML = `
        <div style="color: ${THEME.color}; font-size: 12px; font-weight: 600; margin-bottom: 8px; letter-spacing: 1px;">FOLDER STRUCTURE</div>
        <div style="color: ${THEME.colorMuted}; font-size: 12px; line-height: 1.5;">
            Organize your social notes like:
        </div>
        <pre style="color: ${THEME.colorAccent}; font-size: 11px; margin: 10px 0 0 0; padding: 10px; background: #0a0a0a; border: 1px solid ${THEME.colorBorder}; overflow-x: auto;">Social/
├── Friends/
│   ├── Close friends.md
│   └── Acquaintances.md
├── Family/
│   └── Family notes.md
└── Events/
    └── Gatherings.md</pre>
    `;
    scrollWrapper.appendChild(infoNote);

    // Save button
    const saveBtn = document.createElement('button');
    saveBtn.textContent = "SAVE SETTINGS";
    saveBtn.style.cssText = `
        width: 100%;
        padding: 16px;
        background: ${THEME.color};
        border: none;
        color: #0a0a0a;
        font-size: 14px;
        font-weight: 700;
        letter-spacing: 2px;
        cursor: pointer;
        margin-top: 16px;
        transition: all 0.2s ease;
    `;
    saveBtn.onmouseover = () => { saveBtn.style.background = THEME.colorHover; };
    saveBtn.onmouseout = () => { saveBtn.style.background = THEME.color; };
    saveBtn.onclick = () => {
        window.SOCIAL_SETTINGS.socialFolder = folderInput.value.trim() || 'Social';
        try {
            localStorage.setItem('social-session-settings-v1', JSON.stringify(window.SOCIAL_SETTINGS));
        } catch (e) {}
        new Notice('Settings saved! Refresh to see changes.');
        closeModal();
    };
    scrollWrapper.appendChild(saveBtn);

    modal.onclick = (e) => { if (e.target === modal) closeModal(); };
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('visible'));
}

// Render settings button
const container = dv.el("div", "");
container.style.cssText = `
    max-width: 460px;
    margin: 20px auto;
    padding: 0;
`;

const card = document.createElement('div');
card.style.cssText = `
    border: 1px solid ${THEME.colorBorder};
    background: #0a0a0a;
    position: relative;
    overflow: visible;
`;
container.appendChild(card);

if (createCorners) createCorners(card, THEME.color);

const buttonsSection = document.createElement('div');
buttonsSection.style.cssText = `
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
`;
card.appendChild(buttonsSection);

// Settings button
const settingsBtn = document.createElement('button');
settingsBtn.innerHTML = `<span style="margin-right: 8px;">⚙️</span> Settings`;
settingsBtn.style.cssText = `
    width: 100%;
    padding: 14px 24px;
    background: transparent;
    border: 1px dashed ${THEME.colorBorder};
    color: ${THEME.colorMuted};
    font-size: 13px;
    letter-spacing: 1px;
    cursor: pointer;
    transition: all 0.3s ease;
`;
settingsBtn.onmouseover = () => {
    settingsBtn.style.borderColor = THEME.color;
    settingsBtn.style.color = THEME.color;
};
settingsBtn.onmouseout = () => {
    settingsBtn.style.borderColor = THEME.colorBorder;
    settingsBtn.style.color = THEME.colorMuted;
};
settingsBtn.onclick = openSettingsModal;
buttonsSection.appendChild(settingsBtn);
```

<div style="height: 40px;"></div>
