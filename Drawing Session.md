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
// RECENT SESSIONS - COLLAGE CARD
// Stacked cards showing 5 most recent sessions
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

// Header
const headerSection = document.createElement('div');
headerSection.style.cssText = `
    padding: 24px 28px 20px 28px;
    background: linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 100%);
    border-bottom: 1px solid ${THEME.colorBorder};
`;
card.appendChild(headerSection);

const header = document.createElement('h3');
header.textContent = "Recent Sessions";
header.style.cssText = `
    margin: 0 0 8px 0;
    color: ${THEME.color};
    font-size: 11px;
    font-weight: 500;
    font-family: "Courier New", monospace;
    letter-spacing: 3px;
    text-transform: uppercase;
    opacity: 0.7;
`;
headerSection.appendChild(header);

const desc = document.createElement('p');
desc.textContent = "Your creative journey";
desc.style.cssText = `
    margin: 0;
    color: ${THEME.colorMuted};
    font-size: 13px;
    line-height: 1.4;
    font-family: "Georgia", serif;
    font-style: italic;
`;
headerSection.appendChild(desc);

// Collage container - stacked cards
const collageContainer = document.createElement('div');
collageContainer.style.cssText = `
    position: relative;
    height: 280px;
    margin: 20px;
    perspective: 1000px;
`;
card.appendChild(collageContainer);

if (sessions.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: ${THEME.colorMuted};">
            <div style="font-size: 32px; margin-bottom: 16px; opacity: 0.3;">&#9998;</div>
            <div style="font-family: Georgia, serif; font-style: italic; font-size: 14px;">No sessions yet</div>
            <div style="font-family: Courier New, monospace; font-size: 10px; letter-spacing: 2px; margin-top: 8px; opacity: 0.5;">START ONE BELOW</div>
        </div>
    `;
    collageContainer.appendChild(emptyMsg);
} else {
    // Create stacked session cards
    sessions.forEach((session, index) => {
        const sessionCard = document.createElement('div');
        const offset = index * 8;
        const rotation = (index - 2) * 2; // Slight rotation for collage effect
        const zIndex = sessions.length - index;
        const opacity = 1 - (index * 0.12);

        sessionCard.style.cssText = `
            position: absolute;
            top: ${offset}px;
            left: ${offset}px;
            right: ${-offset}px;
            height: 180px;
            background: #111;
            border: 1px solid ${THEME.colorBorder};
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            transform: rotate(${rotation}deg);
            z-index: ${zIndex};
            opacity: ${opacity};
            overflow: hidden;
        `;
        collageContainer.appendChild(sessionCard);

        // Session content
        const content = document.createElement('div');
        content.style.cssText = `
            padding: 20px;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            position: relative;
        `;
        sessionCard.appendChild(content);

        // Top row: date and skills count
        const topRow = document.createElement('div');
        topRow.style.cssText = `display: flex; justify-content: space-between; align-items: flex-start;`;
        content.appendChild(topRow);

        const dateEl = document.createElement('div');
        const sessionDate = session.file.ctime;
        dateEl.textContent = sessionDate ? moment(sessionDate.ts || sessionDate).format('MMM D, YYYY') : session.file.name;
        dateEl.style.cssText = `
            color: #fff;
            font-size: 14px;
            font-family: "Courier New", monospace;
            letter-spacing: 1px;
            text-transform: uppercase;
        `;
        topRow.appendChild(dateEl);

        const skillCount = session.skills ? (Array.isArray(session.skills) ? session.skills.length : 1) : 0;
        if (skillCount > 0) {
            const countBadge = document.createElement('div');
            countBadge.textContent = `${skillCount} skill${skillCount > 1 ? 's' : ''}`;
            countBadge.style.cssText = `
                color: ${THEME.colorMuted};
                font-size: 10px;
                font-family: "Courier New", monospace;
                letter-spacing: 1px;
                padding: 4px 8px;
                border: 1px solid ${THEME.colorBorder};
                text-transform: uppercase;
            `;
            topRow.appendChild(countBadge);
        }

        // Middle: session name
        const nameEl = document.createElement('div');
        nameEl.textContent = session.file.name;
        nameEl.style.cssText = `
            color: ${THEME.color};
            font-size: 16px;
            font-family: "Times New Roman", serif;
            letter-spacing: 0.5px;
            flex: 1;
            display: flex;
            align-items: center;
            padding: 10px 0;
        `;
        content.appendChild(nameEl);

        // Bottom: type indicator
        const bottomRow = document.createElement('div');
        bottomRow.style.cssText = `display: flex; justify-content: space-between; align-items: center;`;
        content.appendChild(bottomRow);

        const typeEl = document.createElement('div');
        const sessionType = session.mood || session.type || 'session';
        const typeIcon = sessionType === 'discipline' ? '&#9830;' : sessionType === 'flow' ? '&#8776;' : '&#9679;';
        typeEl.innerHTML = `<span style="margin-right: 6px;">${typeIcon}</span>${sessionType}`;
        typeEl.style.cssText = `
            color: ${sessionType === 'discipline' ? '#888' : sessionType === 'flow' ? '#666' : THEME.colorMuted};
            font-size: 10px;
            font-family: "Courier New", monospace;
            letter-spacing: 2px;
            text-transform: uppercase;
        `;
        bottomRow.appendChild(typeEl);

        // Arrow indicator
        const arrow = document.createElement('div');
        arrow.innerHTML = '&rarr;';
        arrow.style.cssText = `
            color: ${THEME.colorMuted};
            font-size: 16px;
            opacity: 0;
            transform: translateX(-10px);
            transition: all 0.3s ease;
        `;
        bottomRow.appendChild(arrow);

        // Hover effect
        sessionCard.onmouseenter = () => {
            sessionCard.style.transform = `rotate(0deg) translateY(-8px) scale(1.02)`;
            sessionCard.style.zIndex = '100';
            sessionCard.style.opacity = '1';
            sessionCard.style.borderColor = THEME.colorHover;
            sessionCard.style.boxShadow = '0 20px 60px rgba(0,0,0,0.8)';
            arrow.style.opacity = '1';
            arrow.style.transform = 'translateX(0)';
        };

        sessionCard.onmouseleave = () => {
            sessionCard.style.transform = `rotate(${rotation}deg)`;
            sessionCard.style.zIndex = zIndex;
            sessionCard.style.opacity = opacity;
            sessionCard.style.borderColor = THEME.colorBorder;
            sessionCard.style.boxShadow = 'none';
            arrow.style.opacity = '0';
            arrow.style.transform = 'translateX(-10px)';
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

// Subtle line at bottom
const bottomLine = document.createElement('div');
bottomLine.style.cssText = `
    width: 40px;
    height: 1px;
    background: linear-gradient(90deg, transparent, ${THEME.color}40, transparent);
    margin: 0 auto 20px auto;
`;
card.appendChild(bottomLine);
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
    const fileName = `Session ${dateStr} ${timeStr}`;
    const sessionFolder = settings.sessionFolder || "Home/Starts/Drawing/Sessions";
    const filePath = `${sessionFolder}/${fileName}`;

    // Note content with Add Skills button embedded
    const noteContent = `---
date: ${dateStr}
time: "${now.toTimeString().split(' ')[0].substring(0, 5)}"
type: session
mood:
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
        newSkills.forEach(skillName => {
            const fmEnd = content.indexOf('---', 4);
            if (fmEnd !== -1) {
                content = content.slice(0, fmEnd) + '  - "' + skillName + '"\\n' + content.slice(fmEnd);
            }
        });

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

```dataviewjs
// ==========================================
// FINISH SESSION BUTTON
// Opens modal with mood selection and time tracking
// ==========================================

const THEME = window.SESSION_THEME || { color: "#888", colorHover: "#fff", colorBorder: "#222", colorMuted: "#555" };
const VAULT_NAME = window.VAULT_NAME || "Alt society";
const settings = window.SESSION_SETTINGS || { sessionFolder: "Home/Starts/Drawing/Sessions" };
const createCorners = window.createSessionCorners;

// Container
const container = dv.el("div", "");
container.style.cssText = `
    max-width: 460px;
    margin: 30px auto;
    padding: 0;
`;

// Finish button card - dashed border style (like log button)
const finishCard = document.createElement('div');
finishCard.style.cssText = `
    border: 1px dashed ${THEME.colorBorder};
    background: #0a0a0a;
    position: relative;
    cursor: pointer;
    transition: all 0.4s ease;
    overflow: hidden;
`;
container.appendChild(finishCard);

const corners = createCorners ? createCorners(finishCard, THEME.color) : [];

// Inner content
const inner = document.createElement('div');
inner.style.cssText = `
    padding: 28px;
    text-align: center;
    position: relative;
`;
finishCard.appendChild(inner);

// Icon
const icon = document.createElement('div');
icon.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: ${THEME.color}; transition: all 0.3s ease;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
icon.style.cssText = `margin-bottom: 14px;`;
inner.appendChild(icon);

// Title
const title = document.createElement('div');
title.textContent = 'Finish Session';
title.style.cssText = `
    color: ${THEME.color};
    font-size: 11px;
    font-family: "Courier New", monospace;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-bottom: 6px;
    transition: color 0.3s ease;
`;
inner.appendChild(title);

// Subtitle
const subtitle = document.createElement('div');
subtitle.textContent = 'Log your mood and track time';
subtitle.style.cssText = `
    color: ${THEME.colorMuted};
    font-size: 11px;
    font-family: "Georgia", serif;
    font-style: italic;
`;
inner.appendChild(subtitle);

// Hover effects
finishCard.onmouseenter = () => {
    finishCard.style.borderColor = THEME.colorHover;
    finishCard.style.borderStyle = 'solid';
    title.style.color = THEME.colorHover;
    icon.querySelector('svg').style.color = THEME.colorHover;
    corners.forEach(c => {
        c.style.width = '22px';
        c.style.height = '22px';
    });
};

finishCard.onmouseleave = () => {
    finishCard.style.borderColor = THEME.colorBorder;
    finishCard.style.borderStyle = 'dashed';
    title.style.color = THEME.color;
    icon.querySelector('svg').style.color = THEME.color;
    corners.forEach(c => {
        c.style.width = '16px';
        c.style.height = '16px';
    });
};

// Click - open finish modal
finishCard.onclick = () => {
    openFinishModal();
};

// ==========================================
// FINISH SESSION MODAL
// ==========================================
function openFinishModal() {
    // Get current session info
    const currentFile = app.workspace.getActiveFile();
    const currentPage = dv.current();

    // Try to get start time from frontmatter
    let startTime = null;
    let startTimeStr = "Unknown";
    if (currentPage && currentPage.time) {
        startTimeStr = currentPage.time;
        // Parse time like "14:30"
        const [hours, mins] = currentPage.time.split(':').map(Number);
        startTime = new Date();
        startTime.setHours(hours, mins, 0, 0);
    } else if (currentPage && currentPage.file && currentPage.file.ctime) {
        startTime = new Date(currentPage.file.ctime.ts || currentPage.file.ctime);
        startTimeStr = startTime.toTimeString().substring(0, 5);
    }

    const now = new Date();
    const nowStr = now.toTimeString().substring(0, 5);

    // Calculate duration
    let durationStr = "—";
    if (startTime) {
        const diffMs = now - startTime;
        const diffMins = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        if (hours > 0) {
            durationStr = `${hours}h ${mins}m`;
        } else {
            durationStr = `${mins} min`;
        }
    }

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
        padding: 36px 32px;
        border: 1px solid ${THEME.colorBorder};
        max-width: 400px;
        width: 90%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        animation: modal-slide-up 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
    `;
    modal.appendChild(modalContent);

    if (createCorners) createCorners(modalContent, THEME.color);

    // Modal title
    const modalTitle = document.createElement('div');
    modalTitle.textContent = 'Session Complete';
    modalTitle.style.cssText = `
        color: ${THEME.color};
        font-size: 11px;
        font-family: "Courier New", monospace;
        letter-spacing: 3px;
        text-transform: uppercase;
        text-align: center;
    `;
    modalContent.appendChild(modalTitle);

    // Time info section
    const timeSection = document.createElement('div');
    timeSection.style.cssText = `
        width: 100%;
        padding: 20px;
        background: #0f0f0f;
        border: 1px solid ${THEME.colorBorder};
        display: flex;
        flex-direction: column;
        gap: 12px;
    `;
    modalContent.appendChild(timeSection);

    // Time row function
    function createTimeRow(label, value, isHighlight = false) {
        const row = document.createElement('div');
        row.style.cssText = `display: flex; justify-content: space-between; align-items: center;`;

        const labelEl = document.createElement('div');
        labelEl.textContent = label;
        labelEl.style.cssText = `
            color: ${THEME.colorMuted};
            font-size: 10px;
            font-family: "Courier New", monospace;
            letter-spacing: 1px;
            text-transform: uppercase;
        `;
        row.appendChild(labelEl);

        const valueEl = document.createElement('div');
        valueEl.textContent = value;
        valueEl.style.cssText = `
            color: ${isHighlight ? THEME.colorHover : THEME.color};
            font-size: ${isHighlight ? '18px' : '14px'};
            font-family: "Courier New", monospace;
            letter-spacing: 1px;
            font-weight: ${isHighlight ? '600' : '400'};
        `;
        row.appendChild(valueEl);

        timeSection.appendChild(row);
        return row;
    }

    createTimeRow('Started', startTimeStr);
    createTimeRow('Finished', nowStr);

    // Divider
    const timeDivider = document.createElement('div');
    timeDivider.style.cssText = `
        width: 100%;
        height: 1px;
        background: ${THEME.colorBorder};
        margin: 4px 0;
    `;
    timeSection.appendChild(timeDivider);

    createTimeRow('Duration', durationStr, true);

    // Mood selection title
    const moodTitle = document.createElement('div');
    moodTitle.textContent = 'How did it feel?';
    moodTitle.style.cssText = `
        color: ${THEME.colorMuted};
        font-size: 10px;
        font-family: "Courier New", monospace;
        letter-spacing: 2px;
        text-transform: uppercase;
        margin-top: 8px;
    `;
    modalContent.appendChild(moodTitle);

    // Mood buttons
    const moodContainer = document.createElement('div');
    moodContainer.style.cssText = `
        display: flex;
        gap: 16px;
        width: 100%;
    `;
    modalContent.appendChild(moodContainer);

    let selectedMood = null;

    function createMoodBtn(mood, icon, label) {
        const btn = document.createElement('div');
        btn.style.cssText = `
            flex: 1;
            padding: 20px 16px;
            background: #0f0f0f;
            border: 1px solid ${THEME.colorBorder};
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        moodContainer.appendChild(btn);

        const iconEl = document.createElement('div');
        iconEl.textContent = icon;
        iconEl.style.cssText = `font-size: 24px; margin-bottom: 8px;`;
        btn.appendChild(iconEl);

        const labelEl = document.createElement('div');
        labelEl.textContent = label;
        labelEl.style.cssText = `
            color: ${THEME.colorMuted};
            font-size: 9px;
            font-family: "Courier New", monospace;
            letter-spacing: 1px;
            text-transform: uppercase;
            transition: color 0.3s ease;
        `;
        btn.appendChild(labelEl);

        btn.onmouseenter = () => {
            if (selectedMood !== mood) {
                btn.style.borderColor = '#444';
            }
        };

        btn.onmouseleave = () => {
            if (selectedMood !== mood) {
                btn.style.borderColor = THEME.colorBorder;
            }
        };

        btn.onclick = () => {
            // Deselect others
            moodContainer.querySelectorAll('div').forEach(el => {
                if (el.parentElement === moodContainer) {
                    el.style.borderColor = THEME.colorBorder;
                    el.style.background = '#0f0f0f';
                    const lbl = el.querySelector('div:last-child');
                    if (lbl) lbl.style.color = THEME.colorMuted;
                }
            });
            // Select this one
            selectedMood = mood;
            btn.style.borderColor = THEME.colorHover;
            btn.style.background = '#141414';
            labelEl.style.color = THEME.colorHover;
            confirmBtn.style.opacity = '1';
            confirmBtn.style.pointerEvents = 'auto';
        };

        return btn;
    }

    createMoodBtn('discipline', '◆', 'Discipline');
    createMoodBtn('flow', '≈', 'Flow');

    // Confirm button
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Complete & Return';
    confirmBtn.style.cssText = `
        width: 100%;
        padding: 14px;
        background: transparent;
        border: 1px solid ${THEME.colorBorder};
        color: ${THEME.color};
        font-family: "Courier New", monospace;
        font-size: 10px;
        letter-spacing: 2px;
        text-transform: uppercase;
        cursor: pointer;
        transition: all 0.3s ease;
        opacity: 0.4;
        pointer-events: none;
        margin-top: 8px;
    `;
    modalContent.appendChild(confirmBtn);

    confirmBtn.onmouseenter = () => {
        if (selectedMood) {
            confirmBtn.style.borderColor = THEME.colorHover;
            confirmBtn.style.color = THEME.colorHover;
        }
    };

    confirmBtn.onmouseleave = () => {
        confirmBtn.style.borderColor = THEME.colorBorder;
        confirmBtn.style.color = THEME.color;
    };

    confirmBtn.onclick = async () => {
        if (!selectedMood) return;

        // Update frontmatter if we have an active file
        if (currentFile) {
            try {
                let content = await app.vault.read(currentFile);

                // Update mood in frontmatter
                if (content.includes('mood:')) {
                    content = content.replace(/mood:\s*\n|mood:\s*$/m, `mood: "${selectedMood}"\n`);
                    content = content.replace(/mood:\s*"[^"]*"/m, `mood: "${selectedMood}"`);
                } else {
                    // Add mood after date if exists
                    const fmEnd = content.indexOf('---', 4);
                    if (fmEnd !== -1) {
                        content = content.slice(0, fmEnd) + `mood: "${selectedMood}"\n` + content.slice(fmEnd);
                    }
                }

                // Add end time
                if (!content.includes('endTime:')) {
                    const fmEnd = content.indexOf('---', 4);
                    if (fmEnd !== -1) {
                        content = content.slice(0, fmEnd) + `endTime: "${nowStr}"\n` + content.slice(fmEnd);
                    }
                }

                // Add duration
                if (!content.includes('duration:')) {
                    const fmEnd = content.indexOf('---', 4);
                    if (fmEnd !== -1) {
                        content = content.slice(0, fmEnd) + `duration: "${durationStr}"\n` + content.slice(fmEnd);
                    }
                }

                await app.vault.modify(currentFile, content);
            } catch (err) {
                console.error('[FinishSession] Error updating file:', err);
            }
        }

        // Close modal and navigate
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.remove();
            window.location.href = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent("Drawing hub")}`;
        }, 200);
    };

    // Close on backdrop
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.opacity = '0';
            setTimeout(() => modal.remove(), 200);
        }
    };

    document.body.appendChild(modal);
}
```
