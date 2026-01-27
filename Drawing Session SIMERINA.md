---
editor-width: 100
cssclasses:
  - hide-properties
---

```dataviewjs
// ==========================================
// DRAWING SESSION - GLOBAL STYLES
// Black & White Constellation Theme
// ==========================================

if (!document.getElementById('drawing-session-styles-v1')) {
    const style = document.createElement('style');
    style.id = 'drawing-session-styles-v1';
    style.textContent = `
        @keyframes session-fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes session-float-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes session-pulse {
            0%, 100% { box-shadow: 0 0 10px rgba(255,255,255,0.1), inset 0 0 8px rgba(255,255,255,0.02); }
            50% { box-shadow: 0 0 20px rgba(255,255,255,0.2), inset 0 0 12px rgba(255,255,255,0.05); }
        }

        @keyframes session-breathe {
            0%, 100% { box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.02); }
            50% { box-shadow: inset 0 0 40px rgba(255, 255, 255, 0.05); }
        }

        @keyframes session-scanline {
            0% { top: -100%; opacity: 0; }
            50% { opacity: 0.4; }
            100% { top: 100%; opacity: 0; }
        }

        @keyframes session-flash {
            0% { opacity: 0.8; transform: scale(0.5); }
            100% { opacity: 0; transform: scale(1.5); }
        }

        @keyframes modal-fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes modal-slide-up {
            from { transform: translateY(30px) scale(0.98); opacity: 0; }
            to { transform: translateY(0) scale(1); opacity: 1; }
        }

        .session-card-hover:hover {
            border-color: #444 !important;
        }

        .session-img-no-drag {
            pointer-events: none !important;
            user-select: none !important;
            -webkit-user-select: none !important;
            -webkit-touch-callout: none !important;
            -webkit-user-drag: none !important;
        }
    `;
    document.head.appendChild(style);
}

// Global theme constants - Black & White
const SESSION_THEME = {
    color: "#888",
    colorHover: "#fff",
    colorBorder: "#222",
    colorBorderHover: "#444",
    colorMuted: "#555",
    colorAccent: "#fff"
};

// Store in window for other blocks
window.SESSION_THEME = SESSION_THEME;
window.VAULT_NAME = "Alt society";

// Settings
const SETTINGS_KEY = 'skill-tree-settings-v3';
function loadSettings() {
    try {
        const saved = localStorage.getItem(SETTINGS_KEY);
        if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
        skillFolder: "Home/Starts/Drawing/Skill tree",
        sessionFolder: "Home/Starts/Drawing/Sessions"
    };
}
window.SESSION_SETTINGS = loadSettings();

// Helper: Create decorative corners
window.createSessionCorners = function(container, color = SESSION_THEME.color, size = 16) {
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

dv.paragraph(""); // Minimal output
```

```dataviewjs
// ==========================================
// RECENT SESSIONS - SCATTERED COLLAGE CARD
// Cards with images from notes, title below
// ==========================================

const THEME = window.SESSION_THEME || { color: "#888", colorHover: "#fff", colorBorder: "#222", colorMuted: "#555" };
const VAULT_NAME = window.VAULT_NAME || "Alt society";
const settings = window.SESSION_SETTINGS || { sessionFolder: "Home/Starts/Drawing/Sessions" };
const createCorners = window.createSessionCorners;

// Get recent sessions from folder
const sessionFolder = settings.sessionFolder || "Home/Starts/Drawing/Sessions";
const sessions = dv.pages(`"${sessionFolder}"`)
    .sort(p => p.file.ctime, 'desc')
    .limit(5)
    .array();

// Helper: Extract first image from note content
async function getFirstImage(session) {
    try {
        const file = app.vault.getAbstractFileByPath(session.file.path);
        if (!file) return null;
        const content = await app.vault.read(file);
        // Match ![[image.ext]] patterns (common image extensions)
        const imageMatch = content.match(/!\[\[([^\]]+\.(jpg|jpeg|png|gif|webp|bmp))\]\]/i);
        if (imageMatch) {
            return imageMatch[1];
        }
    } catch (e) {
        console.log('[RecentSessions] Error reading:', e);
    }
    return null;
}

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
    overflow: visible;
    animation: session-breathe 8s ease-in-out infinite;
`;
container.appendChild(card);

if (createCorners) createCorners(card, THEME.color);

// ==========================================
// TOP SECTION - Scattered cards collage
// ==========================================
const collageContainer = document.createElement('div');
collageContainer.style.cssText = `
    position: relative;
    height: 260px;
    margin: 20px;
    perspective: 1000px;
`;
card.appendChild(collageContainer);

if (sessions.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.innerHTML = `
        <div style="text-align: center; padding: 80px 20px; color: ${THEME.colorMuted};">
            <div style="font-size: 32px; margin-bottom: 16px; opacity: 0.3;">&#9998;</div>
            <div style="font-family: Georgia, serif; font-style: italic; font-size: 14px;">No sessions yet</div>
            <div style="font-family: Courier New, monospace; font-size: 10px; letter-spacing: 2px; margin-top: 8px; opacity: 0.5;">START ONE BELOW</div>
        </div>
    `;
    collageContainer.appendChild(emptyMsg);
} else {
    // Random-ish positions for scattered effect
    const positions = [
        { x: 15, y: 10, rot: -8, scale: 1 },      // back-left
        { x: 55, y: 5, rot: 5, scale: 1 },        // back-right
        { x: 35, y: 25, rot: -3, scale: 1.02 },   // middle-center
        { x: 10, y: 45, rot: 6, scale: 1 },       // front-left
        { x: 50, y: 50, rot: -4, scale: 1.05 },   // front-right (most recent)
    ];

    // Create scattered session cards (reverse so most recent is on top)
    sessions.slice().reverse().forEach(async (session, reverseIndex) => {
        const index = sessions.length - 1 - reverseIndex;
        const pos = positions[index] || positions[0];
        const zIndex = index + 1;

        const sessionCard = document.createElement('div');
        sessionCard.style.cssText = `
            position: absolute;
            left: ${pos.x}%;
            top: ${pos.y}%;
            width: 140px;
            height: 100px;
            background: #111;
            border: 1px solid ${THEME.colorBorder};
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            transform: rotate(${pos.rot}deg) scale(${pos.scale});
            z-index: ${zIndex};
            overflow: hidden;
        `;
        collageContainer.appendChild(sessionCard);

        // Try to get image from note
        const imageName = await getFirstImage(session);

        if (imageName) {
            // Find the image file in vault
            const imageFile = app.metadataCache.getFirstLinkpathDest(imageName, session.file.path);
            if (imageFile) {
                const imageUrl = app.vault.getResourcePath(imageFile);
                sessionCard.style.backgroundImage = `url('${imageUrl}')`;
                sessionCard.style.backgroundSize = 'cover';
                sessionCard.style.backgroundPosition = 'center';

                // Add dark overlay for text readability
                const overlay = document.createElement('div');
                overlay.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%);
                    pointer-events: none;
                `;
                sessionCard.appendChild(overlay);
            }
        }

        // Inner content
        const content = document.createElement('div');
        content.style.cssText = `
            padding: 12px;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            position: relative;
            z-index: 1;
        `;
        sessionCard.appendChild(content);

        // Date at top
        const dateEl = document.createElement('div');
        const sessionDate = session.file.ctime;
        dateEl.textContent = sessionDate ? moment(sessionDate.ts || sessionDate).format('MMM D') : '—';
        dateEl.style.cssText = `
            color: #fff;
            font-size: 11px;
            font-family: "Courier New", monospace;
            letter-spacing: 1px;
            text-transform: uppercase;
            text-shadow: 0 1px 3px rgba(0,0,0,0.8);
        `;
        content.appendChild(dateEl);

        // Drawing-Type indicator at bottom
        const moodEl = document.createElement('div');
        const drawingType = session["Drawing-Type"] || '';
        const moodIcon = drawingType === 'discipline' ? '◆' : drawingType === 'flow' ? '≈' : '○';
        moodEl.textContent = moodIcon;
        moodEl.style.cssText = `
            color: ${drawingType === 'discipline' ? '#fff' : drawingType === 'flow' ? '#ccc' : '#666'};
            font-size: 16px;
            text-align: right;
            text-shadow: 0 1px 3px rgba(0,0,0,0.8);
        `;
        content.appendChild(moodEl);

        // Hover effect
        sessionCard.onmouseenter = () => {
            sessionCard.style.transform = `rotate(0deg) scale(1.15) translateY(-10px)`;
            sessionCard.style.zIndex = '100';
            sessionCard.style.borderColor = THEME.colorHover;
            sessionCard.style.boxShadow = '0 20px 40px rgba(0,0,0,0.8)';
        };

        sessionCard.onmouseleave = () => {
            sessionCard.style.transform = `rotate(${pos.rot}deg) scale(${pos.scale})`;
            sessionCard.style.zIndex = zIndex;
            sessionCard.style.borderColor = THEME.colorBorder;
            sessionCard.style.boxShadow = 'none';
        };

        // Click to open session
        sessionCard.onclick = () => {
            sessionCard.style.transform = 'scale(0.95)';
            setTimeout(() => {
                window.location.href = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent(session.file.path)}`;
            }, 150);
        };
    });
}

// ==========================================
// DIVIDER LINE
// ==========================================
const divider = document.createElement('div');
divider.style.cssText = `
    width: calc(100% - 40px);
    height: 1px;
    background: ${THEME.colorBorder};
    margin: 0 20px;
`;
card.appendChild(divider);

// ==========================================
// BOTTOM SECTION - Title and description
// ==========================================
const infoSection = document.createElement('div');
infoSection.style.cssText = `
    padding: 20px 24px 24px 24px;
`;
card.appendChild(infoSection);

const title = document.createElement('h3');
title.textContent = "Recent Sessions";
title.style.cssText = `
    margin: 0 0 6px 0;
    color: ${THEME.color};
    font-size: 14px;
    font-weight: 500;
    font-family: "Times New Roman", serif;
    letter-spacing: 0.5px;
`;
infoSection.appendChild(title);

const desc = document.createElement('p');
desc.textContent = "Your creative journey";
desc.style.cssText = `
    margin: 0;
    color: ${THEME.colorMuted};
    font-size: 12px;
    line-height: 1.4;
    font-family: "Georgia", serif;
    font-style: italic;
`;
infoSection.appendChild(desc);
```

```dataviewjs
// ==========================================
// START SESSION BUTTON
// Opens modal with Study/Free options
// ==========================================

const THEME = window.SESSION_THEME || { color: "#888", colorHover: "#fff", colorBorder: "#222", colorMuted: "#555" };
const VAULT_NAME = window.VAULT_NAME || "Alt society";
const settings = window.SESSION_SETTINGS || { sessionFolder: "Home/Starts/Drawing/Sessions", skillFolder: "Home/Starts/Drawing/Skill tree" };
const createCorners = window.createSessionCorners;

// Container
const container = dv.el("div", "");
container.style.cssText = `
    max-width: 460px;
    margin: 30px auto;
    padding: 0;
`;

// Start button card
const startCard = document.createElement('div');
startCard.style.cssText = `
    border: 1px solid ${THEME.colorBorder};
    background: #0a0a0a;
    position: relative;
    cursor: pointer;
    transition: all 0.4s ease;
    overflow: hidden;
`;
container.appendChild(startCard);

const corners = createCorners ? createCorners(startCard, THEME.color) : [];

// Inner content
const inner = document.createElement('div');
inner.style.cssText = `
    padding: 32px;
    text-align: center;
    position: relative;
`;
startCard.appendChild(inner);

// Icon
const icon = document.createElement('div');
icon.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: ${THEME.color}; transition: all 0.3s ease;"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
icon.style.cssText = `margin-bottom: 16px;`;
inner.appendChild(icon);

// Title
const title = document.createElement('div');
title.textContent = 'Start Session';
title.style.cssText = `
    color: ${THEME.color};
    font-size: 12px;
    font-family: "Courier New", monospace;
    letter-spacing: 4px;
    text-transform: uppercase;
    margin-bottom: 8px;
    transition: color 0.3s ease;
`;
inner.appendChild(title);

// Subtitle
const subtitle = document.createElement('div');
subtitle.textContent = 'Begin your creative practice';
subtitle.style.cssText = `
    color: ${THEME.colorMuted};
    font-size: 12px;
    font-family: "Georgia", serif;
    font-style: italic;
`;
inner.appendChild(subtitle);

// Scanline effect
const scanline = document.createElement('div');
scanline.style.cssText = `
    position: absolute;
    top: -100%;
    left: 0;
    right: 0;
    height: 100%;
    background: linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%);
    pointer-events: none;
    opacity: 0;
`;
startCard.appendChild(scanline);

// Hover effects
startCard.onmouseenter = () => {
    startCard.style.borderColor = THEME.colorHover;
    startCard.style.boxShadow = '0 0 30px rgba(255,255,255,0.05)';
    title.style.color = THEME.colorHover;
    icon.querySelector('svg').style.color = THEME.colorHover;
    scanline.style.opacity = '1';
    scanline.style.animation = 'session-scanline 1.5s ease-out';
    corners.forEach(c => {
        c.style.width = '24px';
        c.style.height = '24px';
    });
};

startCard.onmouseleave = () => {
    startCard.style.borderColor = THEME.colorBorder;
    startCard.style.boxShadow = 'none';
    title.style.color = THEME.color;
    icon.querySelector('svg').style.color = THEME.color;
    scanline.style.opacity = '0';
    scanline.style.animation = 'none';
    corners.forEach(c => {
        c.style.width = '16px';
        c.style.height = '16px';
    });
};

// Click - open modal
startCard.onclick = () => {
    openStartModal();
};

// ==========================================
// START SESSION MODAL
// ==========================================
function openStartModal() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        backdrop-filter: blur(4px);
        animation: modal-fade-in 0.3s ease-out;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: #0a0a0a;
        padding: 40px 32px;
        border: 1px solid ${THEME.colorBorder};
        max-width: 420px;
        width: 90%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 24px;
        animation: modal-slide-up 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
    `;
    modal.appendChild(modalContent);

    if (createCorners) createCorners(modalContent, THEME.color);

    // Modal title
    const modalTitle = document.createElement('div');
    modalTitle.textContent = 'Choose Session Type';
    modalTitle.style.cssText = `
        color: ${THEME.color};
        font-size: 11px;
        font-family: "Courier New", monospace;
        letter-spacing: 3px;
        text-transform: uppercase;
        text-align: center;
    `;
    modalContent.appendChild(modalTitle);

    // Divider
    const divider = document.createElement('div');
    divider.style.cssText = `
        width: 40px;
        height: 1px;
        background: linear-gradient(90deg, transparent, ${THEME.color}, transparent);
    `;
    modalContent.appendChild(divider);

    // Buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 16px;
        width: 100%;
    `;
    modalContent.appendChild(buttonsContainer);

    // Create option button
    function createOptionBtn(options) {
        const { icon, title, description, onClick } = options;

        const btn = document.createElement('div');
        btn.style.cssText = `
            display: flex;
            align-items: center;
            gap: 20px;
            padding: 20px 24px;
            background: #0f0f0f;
            border: 1px solid ${THEME.colorBorder};
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        `;
        buttonsContainer.appendChild(btn);

        // Icon
        const iconEl = document.createElement('div');
        iconEl.innerHTML = icon;
        iconEl.style.cssText = `
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${THEME.color};
            transition: color 0.3s ease;
        `;
        btn.appendChild(iconEl);

        // Text
        const textContainer = document.createElement('div');
        textContainer.style.cssText = `flex: 1;`;
        btn.appendChild(textContainer);

        const titleEl = document.createElement('div');
        titleEl.textContent = title;
        titleEl.style.cssText = `
            color: ${THEME.color};
            font-size: 13px;
            font-family: "Courier New", monospace;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 4px;
            transition: color 0.3s ease;
        `;
        textContainer.appendChild(titleEl);

        const descEl = document.createElement('div');
        descEl.textContent = description;
        descEl.style.cssText = `
            color: ${THEME.colorMuted};
            font-size: 11px;
            font-family: "Georgia", serif;
            font-style: italic;
        `;
        textContainer.appendChild(descEl);

        // Arrow
        const arrow = document.createElement('div');
        arrow.innerHTML = '&rarr;';
        arrow.style.cssText = `
            color: ${THEME.colorMuted};
            font-size: 18px;
            opacity: 0;
            transform: translateX(-10px);
            transition: all 0.3s ease;
        `;
        btn.appendChild(arrow);

        btn.onmouseenter = () => {
            btn.style.borderColor = THEME.colorHover;
            btn.style.background = '#141414';
            titleEl.style.color = THEME.colorHover;
            iconEl.style.color = THEME.colorHover;
            arrow.style.opacity = '1';
            arrow.style.transform = 'translateX(0)';
        };

        btn.onmouseleave = () => {
            btn.style.borderColor = THEME.colorBorder;
            btn.style.background = '#0f0f0f';
            titleEl.style.color = THEME.color;
            iconEl.style.color = THEME.color;
            arrow.style.opacity = '0';
            arrow.style.transform = 'translateX(-10px)';
        };

        btn.onclick = (e) => {
            e.stopPropagation();
            btn.style.transform = 'scale(0.98)';
            setTimeout(() => {
                modal.remove();
                if (onClick) onClick();
            }, 150);
        };

        return btn;
    }

    // STUDY option - opens Skill Selector
    createOptionBtn({
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
        title: 'Study',
        description: 'Select skills from your tree',
        onClick: () => {
            window.location.href = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent("Skill Selector")}`;
        }
    });

    // FREE option - create session directly with add skill button
    createOptionBtn({
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 5v14M5 12h14"/></svg>`,
        title: 'Free',
        description: 'Start with blank canvas',
        onClick: async () => {
            await createFreeSession();
        }
    });

    // Close on backdrop
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.opacity = '0';
            setTimeout(() => modal.remove(), 200);
        }
    };

    document.body.appendChild(modal);
}

// ==========================================
// CREATE FREE SESSION
// ==========================================
async function createFreeSession() {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '').substring(0, 4);

    // Create ISO timestamp with timezone offset
    const tzOffset = -now.getTimezoneOffset();
    const tzHours = String(Math.floor(Math.abs(tzOffset) / 60)).padStart(2, '0');
    const tzMins = String(Math.abs(tzOffset) % 60).padStart(2, '0');
    const tzSign = tzOffset >= 0 ? '+' : '-';
    const timestamp = now.toISOString().slice(0, -1) + tzSign + tzHours + ':' + tzMins;

    const fileName = `Session ${dateStr} ${timeStr}`;
    const sessionFolder = settings.sessionFolder || "Home/Starts/Drawing/Sessions";
    const filePath = `${sessionFolder}/${fileName}`;

    // Note content with Add Skills button AND Finish Session button embedded
    const noteContent = `---
Drawing: true
Drawing-Type:
Timestamp: "${timestamp}"
skills: []
---

\`\`\`dataviewjs
// ADD SKILLS BUTTON - Embedded for free sessions
const VAULT_NAME = "${VAULT_NAME}";
const SETTINGS_KEY = 'skill-tree-settings-v3';
const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
const skillFolder = settings.skillFolder || "Home/Starts/Drawing/Skill tree";

const ICONS = {
    default: { viewBox: "0 0 24 24", path: '<circle cx="12" cy="12" r="3" fill="currentColor"/>' },
    core: { viewBox: "0 0 24 24", path: '<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' },
    pencil: { viewBox: "0 0 24 24", path: '<path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' },
    anatomy: { viewBox: "0 0 24 24", path: '<circle cx="12" cy="5" r="3" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 8v4m-4 0h8m-6 0v8m4-8v8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' },
    gesture: { viewBox: "0 0 24 24", path: '<path d="M6 18c0-3 2-6 6-9s6-6 6-6M4 12c2-2 4-3 6-3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="18" cy="3" r="2" fill="currentColor"/>' },
    light: { viewBox: "0 0 24 24", path: '<circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' },
    shapes: { viewBox: "0 0 24 24", path: '<rect x="3" y="11" width="8" height="8" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="16" cy="8" r="5" stroke="currentColor" stroke-width="2" fill="none"/>' }
};

const currentSkills = dv.current().skills || [];

const card = dv.el('div', '');
card.style.cssText = 'background:#111;border:1px solid #333;padding:16px 20px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;';

const cardLabel = document.createElement('div');
cardLabel.innerHTML = '<span style="color:#666;font-size:10px;font-family:Courier New,monospace;letter-spacing:2px;text-transform:uppercase;">Session Skills</span><span style="color:#444;font-size:10px;margin-left:10px;">(' + currentSkills.length + ' active)</span>';
card.appendChild(cardLabel);

const addBtn = document.createElement('div');
addBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg><span>Add Skills</span>';
addBtn.style.cssText = 'display:flex;align-items:center;padding:10px 16px;background:#1a1a1a;border:1px solid #333;color:#666;font-size:10px;font-family:Courier New,monospace;letter-spacing:1px;text-transform:uppercase;cursor:pointer;transition:all 0.2s;';
addBtn.onmouseenter = () => { addBtn.style.borderColor = '#666'; addBtn.style.color = '#fff'; };
addBtn.onmouseleave = () => { addBtn.style.borderColor = '#333'; addBtn.style.color = '#666'; };
card.appendChild(addBtn);

let popup = null;
let overlay = null;

addBtn.onclick = async () => {
    if (popup) return;

    const pages = dv.pages('"' + skillFolder + '"');
    const allSkills = [];
    for (const p of pages) {
        if (p.file.name !== '__root__') {
            allSkills.push({ name: p.file.name, icon: p.icon || 'default' });
        }
    }
    allSkills.sort((a, b) => a.name.localeCompare(b.name));

    const available = allSkills.filter(s => !currentSkills.includes(s.name));

    if (available.length === 0) {
        addBtn.style.transform = 'scale(0.95)';
        setTimeout(() => { addBtn.style.transform = ''; }, 150);
        return;
    }

    const selected = new Set();

    overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:9998;opacity:0;transition:opacity 0.3s;';
    document.body.appendChild(overlay);
    setTimeout(() => { overlay.style.opacity = '1'; }, 10);

    popup = document.createElement('div');
    popup.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.95);width:90%;max-width:400px;max-height:70vh;background:#0a0a0a;border:1px solid #333;z-index:9999;display:flex;flex-direction:column;opacity:0;transition:all 0.3s;';

    const header = document.createElement('div');
    header.style.cssText = 'padding:20px;border-bottom:1px solid #222;display:flex;justify-content:space-between;align-items:center;';
    header.innerHTML = '<span style="color:#888;font-size:10px;font-family:Courier New,monospace;letter-spacing:2px;text-transform:uppercase;">Add Skills</span>';
    const closeBtn = document.createElement('div');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = 'color:#555;font-size:20px;cursor:pointer;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border:1px solid #333;transition:all 0.2s;';
    closeBtn.onmouseenter = () => { closeBtn.style.borderColor = '#666'; closeBtn.style.color = '#fff'; };
    closeBtn.onmouseleave = () => { closeBtn.style.borderColor = '#333'; closeBtn.style.color = '#555'; };
    closeBtn.onclick = closePopup;
    header.appendChild(closeBtn);
    popup.appendChild(header);

    const gridWrap = document.createElement('div');
    gridWrap.style.cssText = 'flex:1;overflow-y:auto;padding:20px;';
    const grid = document.createElement('div');
    grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:20px;justify-content:center;';

    available.forEach(skill => {
        const node = document.createElement('div');
        node.style.cssText = 'width:60px;height:60px;border-radius:50%;border:1px solid #333;background:#111;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;position:relative;';

        const iconData = ICONS[skill.icon] || ICONS.default;
        node.innerHTML = '<svg viewBox="' + iconData.viewBox + '" width="24" height="24" style="color:#555;transition:color 0.2s;">' + iconData.path + '</svg>';

        const label = document.createElement('div');
        label.textContent = skill.name.length > 8 ? skill.name.substring(0,7) + '..' : skill.name;
        label.title = skill.name;
        label.style.cssText = 'position:absolute;bottom:-16px;left:50%;transform:translateX(-50%);font-size:8px;color:#444;font-family:Courier New,monospace;white-space:nowrap;text-transform:uppercase;letter-spacing:1px;';
        node.appendChild(label);

        node.onclick = () => {
            if (selected.has(skill.name)) {
                selected.delete(skill.name);
                node.style.borderColor = '#333';
                node.style.background = '#111';
                node.style.boxShadow = 'none';
                node.querySelector('svg').style.color = '#555';
            } else {
                selected.add(skill.name);
                node.style.borderColor = '#fff';
                node.style.background = '#1a1a1a';
                node.style.boxShadow = '0 0 15px rgba(255,255,255,0.15)';
                node.querySelector('svg').style.color = '#fff';
            }
            confirmBtn.style.opacity = selected.size > 0 ? '1' : '0.4';
            confirmBtn.style.pointerEvents = selected.size > 0 ? 'auto' : 'none';
        };

        grid.appendChild(node);
    });
    gridWrap.appendChild(grid);
    popup.appendChild(gridWrap);

    const footer = document.createElement('div');
    footer.style.cssText = 'padding:15px 20px;border-top:1px solid #222;';
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Add Selected';
    confirmBtn.style.cssText = 'width:100%;padding:12px;background:transparent;border:1px solid #333;color:#888;font-family:Courier New,monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:all 0.2s;opacity:0.4;pointer-events:none;';
    confirmBtn.onmouseenter = () => { if (selected.size > 0) { confirmBtn.style.borderColor = '#fff'; confirmBtn.style.color = '#fff'; } };
    confirmBtn.onmouseleave = () => { confirmBtn.style.borderColor = '#333'; confirmBtn.style.color = '#888'; };
    confirmBtn.onclick = async () => {
        if (selected.size === 0) return;

        const file = app.workspace.getActiveFile();
        if (!file) return;

        let content = await app.vault.read(file);
        const newSkills = [...selected];

        // Build the new skills array items
        let skillItems = '';
        newSkills.forEach(skillName => {
            skillItems += '  - "' + skillName + '"\\n';
        });

        // Fix YAML: handle skills: [] or skills: with existing items
        if (content.includes('skills: []')) {
            // Replace empty array with proper YAML list
            content = content.replace('skills: []', 'skills:\\n' + skillItems.slice(0, -2)); // remove trailing \\n
        } else if (content.match(/skills:\\s*\\n/)) {
            // Has skills: with items below, find where to insert
            const skillsMatch = content.match(/skills:\\s*\\n((?:  - [^\\n]+\\n)*)/);
            if (skillsMatch) {
                const existingSkills = skillsMatch[0];
                content = content.replace(existingSkills, existingSkills + skillItems);
            }
        } else {
            // Fallback: add skills section before closing ---
            const fmEnd = content.indexOf('---', 4);
            if (fmEnd !== -1) {
                content = content.slice(0, fmEnd) + 'skills:\\n' + skillItems + content.slice(fmEnd);
            }
        }

        // Add embeds at the end
        newSkills.forEach(skillName => {
            content += '![[' + skillName + '|scroll]]\\n\\n';
        });

        await app.vault.modify(file, content);
        closePopup();
        app.workspace.getActiveLeaf().rebuildView();
    };
    footer.appendChild(confirmBtn);
    popup.appendChild(footer);

    document.body.appendChild(popup);
    setTimeout(() => { popup.style.opacity = '1'; popup.style.transform = 'translate(-50%,-50%) scale(1)'; }, 10);

    overlay.onclick = closePopup;

    function closePopup() {
        if (!popup) return;
        popup.style.opacity = '0';
        popup.style.transform = 'translate(-50%,-50%) scale(0.95)';
        overlay.style.opacity = '0';
        setTimeout(() => {
            popup?.remove();
            overlay?.remove();
            popup = null;
            overlay = null;
        }, 300);
    }
};
\`\`\`

---

\`\`\`dataviewjs
// FINISH SESSION BUTTON - Mood tracking and time calculation
var VAULT_NAME = "${VAULT_NAME}";
var THEME = { color: "#888", colorHover: "#fff", colorBorder: "#222", colorMuted: "#555" };

function createCorners(container, color, size) {
    color = color || THEME.color;
    size = size || 14;
    ['TL', 'TR', 'BL', 'BR'].forEach(function(pos) {
        var corner = document.createElement('div');
        var isTop = pos.includes('T');
        var isLeft = pos.includes('L');
        corner.style.cssText = 'position:absolute;' + (isTop ? 'top:0;' : 'bottom:0;') + (isLeft ? 'left:0;' : 'right:0;') + 'width:' + size + 'px;height:' + size + 'px;border-' + (isTop ? 'top' : 'bottom') + ':1px solid ' + color + ';border-' + (isLeft ? 'left' : 'right') + ':1px solid ' + color + ';z-index:10;pointer-events:none;transition:all 0.3s ease;';
        container.appendChild(corner);
    });
}

var container = dv.el('div', '');
container.style.cssText = 'max-width:460px;margin:40px auto 20px auto;';

var finishCard = document.createElement('div');
finishCard.style.cssText = 'border:1px dashed ' + THEME.colorBorder + ';background:#0a0a0a;position:relative;cursor:pointer;transition:all 0.4s ease;text-align:center;padding:24px;';
container.appendChild(finishCard);
createCorners(finishCard, THEME.color);

var icon = document.createElement('div');
icon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" style="color:#888;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
icon.style.marginBottom = '12px';
finishCard.appendChild(icon);

var title = document.createElement('div');
title.textContent = 'Finish Session';
title.style.cssText = 'color:#888;font-size:10px;font-family:Courier New,monospace;letter-spacing:3px;text-transform:uppercase;margin-bottom:4px;transition:color 0.3s;';
finishCard.appendChild(title);

var subtitle = document.createElement('div');
subtitle.textContent = 'Log mood and track time';
subtitle.style.cssText = 'color:#555;font-size:11px;font-family:Georgia,serif;font-style:italic;';
finishCard.appendChild(subtitle);

finishCard.onmouseenter = function() {
    finishCard.style.borderColor = THEME.colorHover;
    finishCard.style.borderStyle = 'solid';
    title.style.color = THEME.colorHover;
    icon.querySelector('svg').style.color = THEME.colorHover;
};
finishCard.onmouseleave = function() {
    finishCard.style.borderColor = THEME.colorBorder;
    finishCard.style.borderStyle = 'dashed';
    title.style.color = THEME.color;
    icon.querySelector('svg').style.color = THEME.color;
};

finishCard.onclick = function() {
    var currentPage = dv.current();
    var startTime = null;
    var startTimeStr = "Unknown";
    if (currentPage && currentPage.time) {
        startTimeStr = currentPage.time;
        var timeParts = currentPage.time.split(':');
        startTime = new Date();
        startTime.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), 0, 0);
    } else if (currentPage && currentPage.file && currentPage.file.ctime) {
        startTime = new Date(currentPage.file.ctime.ts || currentPage.file.ctime);
        startTimeStr = startTime.toTimeString().substring(0, 5);
    }

    var now = new Date();
    var nowStr = now.toTimeString().substring(0, 5);
    var durationStr = "—";
    if (startTime) {
        var diffMs = now - startTime;
        var diffMins = Math.floor(diffMs / 60000);
        var hours = Math.floor(diffMins / 60);
        var mins = diffMins % 60;
        durationStr = hours > 0 ? hours + 'h ' + mins + 'm' : mins + ' min';
    }

    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);display:flex;align-items:center;justify-content:center;z-index:9999;backdrop-filter:blur(4px);';

    var modalContent = document.createElement('div');
    modalContent.style.cssText = 'background:#0a0a0a;padding:32px;border:1px solid #222;max-width:380px;width:90%;display:flex;flex-direction:column;align-items:center;gap:16px;position:relative;';
    modal.appendChild(modalContent);
    createCorners(modalContent, THEME.color);

    modalContent.innerHTML = '<div style="color:#888;font-size:10px;font-family:Courier New,monospace;letter-spacing:3px;text-transform:uppercase;">Session Complete</div>' +
        '<div style="width:100%;padding:16px;background:#0f0f0f;border:1px solid #222;">' +
        '<div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="color:#555;font-size:9px;font-family:Courier New,monospace;letter-spacing:1px;text-transform:uppercase;">Started</span><span style="color:#888;font-size:13px;font-family:Courier New,monospace;">' + startTimeStr + '</span></div>' +
        '<div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="color:#555;font-size:9px;font-family:Courier New,monospace;letter-spacing:1px;text-transform:uppercase;">Finished</span><span style="color:#888;font-size:13px;font-family:Courier New,monospace;">' + nowStr + '</span></div>' +
        '<div style="width:100%;height:1px;background:#222;margin:8px 0;"></div>' +
        '<div style="display:flex;justify-content:space-between;"><span style="color:#555;font-size:9px;font-family:Courier New,monospace;letter-spacing:1px;text-transform:uppercase;">Duration</span><span style="color:#fff;font-size:16px;font-family:Courier New,monospace;font-weight:600;">' + durationStr + '</span></div>' +
        '</div>' +
        '<div style="color:#555;font-size:9px;font-family:Courier New,monospace;letter-spacing:2px;text-transform:uppercase;">How did it feel?</div>' +
        '<div id="mood-btns" style="display:flex;gap:12px;width:100%;"></div>' +
        '<button id="confirm-finish" style="width:100%;padding:12px;background:transparent;border:1px solid #222;color:#888;font-family:Courier New,monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;opacity:0.4;pointer-events:none;transition:all 0.2s;">Complete & Return</button>';

    var moodBtns = modalContent.querySelector('#mood-btns');
    var confirmBtn = modalContent.querySelector('#confirm-finish');
    var selectedMood = null;

    ['discipline', 'flow'].forEach(function(mood) {
        var btn = document.createElement('div');
        btn.style.cssText = 'flex:1;padding:16px;background:#0f0f0f;border:1px solid #222;text-align:center;cursor:pointer;transition:all 0.2s;';
        btn.innerHTML = '<div style="font-size:20px;margin-bottom:6px;">' + (mood === 'discipline' ? '◆' : '≈') + '</div><div style="color:#555;font-size:8px;font-family:Courier New,monospace;letter-spacing:1px;text-transform:uppercase;transition:color 0.2s;">' + mood + '</div>';
        moodBtns.appendChild(btn);

        btn.onclick = function() {
            var allBtns = moodBtns.querySelectorAll('div');
            for (var i = 0; i < allBtns.length; i++) {
                if (allBtns[i].parentElement === moodBtns) {
                    allBtns[i].style.borderColor = '#222';
                    allBtns[i].style.background = '#0f0f0f';
                    var lbl = allBtns[i].querySelector('div:last-child');
                    if (lbl) lbl.style.color = '#555';
                }
            }
            selectedMood = mood;
            btn.style.borderColor = '#fff';
            btn.style.background = '#141414';
            btn.querySelector('div:last-child').style.color = '#fff';
            confirmBtn.style.opacity = '1';
            confirmBtn.style.pointerEvents = 'auto';
        };
    });

    confirmBtn.onmouseenter = function() { if (selectedMood) { confirmBtn.style.borderColor = '#fff'; confirmBtn.style.color = '#fff'; } };
    confirmBtn.onmouseleave = function() { confirmBtn.style.borderColor = '#222'; confirmBtn.style.color = '#888'; };

    confirmBtn.onclick = async function() {
        if (!selectedMood) return;
        var file = app.workspace.getActiveFile();
        if (file) {
            try {
                var content = await app.vault.read(file);
                // Update Drawing-Type property
                if (content.includes('Drawing-Type:')) {
                    content = content.replace(/Drawing-Type:\\s*\\n|Drawing-Type:\\s*$/m, 'Drawing-Type: "' + selectedMood + '"\\n');
                    content = content.replace(/Drawing-Type:\\s*"[^"]*"/m, 'Drawing-Type: "' + selectedMood + '"');
                }
                if (!content.includes('endTime:')) {
                    var fmEnd = content.indexOf('---', 4);
                    if (fmEnd !== -1) content = content.slice(0, fmEnd) + 'endTime: "' + nowStr + '"\\n' + content.slice(fmEnd);
                }
                if (!content.includes('duration:')) {
                    var fmEnd2 = content.indexOf('---', 4);
                    if (fmEnd2 !== -1) content = content.slice(0, fmEnd2) + 'duration: "' + durationStr + '"\\n' + content.slice(fmEnd2);
                }
                await app.vault.modify(file, content);
            } catch (err) { console.error('Error updating:', err); }
        }
        modal.remove();
        window.location.href = 'obsidian://open?vault=' + encodeURIComponent(VAULT_NAME) + '&file=' + encodeURIComponent('Drawing hub');
    };

    modal.onclick = function(e) { if (e.target === modal) modal.remove(); };
    document.body.appendChild(modal);
};
\`\`\`
`;

    try {
        // Create folder if needed
        const folderExists = app.vault.getAbstractFileByPath(sessionFolder);
        if (!folderExists) {
            await app.vault.createFolder(sessionFolder);
        }

        // Check for existing file
        const existing = app.vault.getAbstractFileByPath(filePath + '.md');
        let finalPath = filePath;
        if (existing) {
            let counter = 2;
            while (app.vault.getAbstractFileByPath(`${filePath} (${counter}).md`)) {
                counter++;
            }
            finalPath = `${filePath} (${counter})`;
        }

        await app.vault.create(finalPath + '.md', noteContent);
        window.location.href = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent(finalPath)}`;
    } catch (err) {
        console.error('[FreeSession] Failed to create:', err);
        new Notice('Failed to create session: ' + err.message);
    }
}
```
