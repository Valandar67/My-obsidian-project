---
editor-width: 100
cssclasses:
  - hide-properties
---

```dataviewjs
// ==========================================
// DRUM PRACTICE SESSION - GLOBAL STYLES
// Black & White Rhythm Theme
// ==========================================

if (!document.getElementById('drum-session-styles-v1')) {
    const style = document.createElement('style');
    style.id = 'drum-session-styles-v1';
    style.textContent = `
        @keyframes drum-fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes drum-float-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes drum-pulse {
            0%, 100% { box-shadow: 0 0 10px rgba(255,255,255,0.1), inset 0 0 8px rgba(255,255,255,0.02); }
            50% { box-shadow: 0 0 20px rgba(255,255,255,0.2), inset 0 0 12px rgba(255,255,255,0.05); }
        }

        @keyframes drum-breathe {
            0%, 100% { box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.02); }
            50% { box-shadow: inset 0 0 40px rgba(255, 255, 255, 0.05); }
        }

        @keyframes drum-scanline {
            0% { top: -100%; opacity: 0; }
            50% { opacity: 0.4; }
            100% { top: 100%; opacity: 0; }
        }

        @keyframes drum-flash {
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

        @keyframes beat-pulse {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.1); opacity: 1; }
        }

        @keyframes metronome-tick {
            0%, 100% { transform: rotate(-15deg); }
            50% { transform: rotate(15deg); }
        }

        .drum-card-hover:hover {
            border-color: #444 !important;
        }

        .drum-img-no-drag {
            pointer-events: none !important;
            user-select: none !important;
            -webkit-user-select: none !important;
            -webkit-touch-callout: none !important;
            -webkit-user-drag: none !important;
        }

        .drum-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            backdrop-filter: blur(0px);
            transition: background 0.5s ease, backdrop-filter 0.5s ease;
        }

        .drum-modal-overlay.visible {
            background: rgba(0,0,0,0.95);
            backdrop-filter: blur(4px);
        }

        .drum-modal-content {
            background: #0a0a0a;
            padding: 32px;
            border: 1px solid #222;
            max-width: 500px;
            max-height: 85vh;
            width: 90%;
            display: flex;
            flex-direction: column;
            gap: 20px;
            box-shadow: 0 40px 120px rgba(0,0,0,0.9);
            position: relative;
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.5s ease, transform 0.5s ease;
        }

        .drum-modal-overlay.visible .drum-modal-content {
            opacity: 1;
            transform: translateY(0);
        }

        .bpm-display {
            font-family: "Courier New", monospace;
            font-size: 48px;
            font-weight: 700;
            color: #fff;
            text-shadow: 0 0 20px rgba(255,255,255,0.3);
        }

        .rudiment-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 10px;
            background: rgba(255,255,255,0.05);
            border: 1px solid #333;
            font-size: 10px;
            letter-spacing: 1px;
            color: #888;
            text-transform: uppercase;
        }

        .rudiment-badge.mastered {
            border-color: #fff;
            color: #fff;
        }
    `;
    document.head.appendChild(style);
}

// Global theme constants - Black & White
const DRUM_THEME = {
    color: "#888",
    colorHover: "#fff",
    colorBorder: "#222",
    colorBorderHover: "#444",
    colorMuted: "#555",
    colorAccent: "#fff"
};

// Store in window for other blocks
window.DRUM_THEME = DRUM_THEME;
window.VAULT_NAME = "Alt society";

// Settings
const DRUM_SETTINGS_KEY = 'drum-practice-settings-v1';
function loadDrumSettings() {
    try {
        const saved = localStorage.getItem(DRUM_SETTINGS_KEY);
        if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
        rudimentFolder: "Home/Starts/Drumming/Rudiments",
        sessionFolder: "Home/Starts/Drumming/Sessions",
        logFile: "Personal Life/04 Drumming/Practice Log.md"
    };
}

function saveDrumSettings(settings) {
    try {
        localStorage.setItem(DRUM_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {}
}

window.DRUM_SETTINGS = loadDrumSettings();

// Helper: Create decorative corners
window.createDrumCorners = function(container, color = DRUM_THEME.color, size = 16) {
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

// Helper: Add floating rhythm dots
window.addRhythmDots = function(container, color, count = 4) {
    for (let i = 0; i < count; i++) {
        const dot = document.createElement('div');
        dot.style.cssText = `
            position: absolute;
            bottom: ${10 + Math.random() * 20}%;
            left: ${10 + Math.random() * 80}%;
            width: ${2 + Math.random() * 3}px;
            height: ${2 + Math.random() * 3}px;
            background: ${color};
            border-radius: 50%;
            opacity: 0.2;
            pointer-events: none;
            animation: beat-pulse ${1 + Math.random() * 2}s ${Math.random() * 2}s ease-in-out infinite;
            z-index: 1;
        `;
        container.appendChild(dot);
    }
};

dv.paragraph(""); // Minimal output
```

```dataviewjs
// ==========================================
// RECENT PRACTICE SESSIONS - SCATTERED CARDS
// Cards with session info, scattered layout
// ==========================================

const THEME = window.DRUM_THEME || { color: "#888", colorHover: "#fff", colorBorder: "#222", colorMuted: "#555" };
const VAULT_NAME = window.VAULT_NAME || "Alt society";
const settings = window.DRUM_SETTINGS || { sessionFolder: "Home/Starts/Drumming/Sessions" };
const createCorners = window.createDrumCorners;

// Get recent sessions from folder
const sessionFolder = settings.sessionFolder || "Home/Starts/Drumming/Sessions";
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
    animation: drum-breathe 8s ease-in-out infinite;
`;
container.appendChild(card);

if (createCorners) createCorners(card, THEME.color);

// ==========================================
// TOP SECTION - Scattered session cards
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
            <div style="font-size: 32px; margin-bottom: 16px; opacity: 0.3;">&#x1F941;</div>
            <div style="font-family: Georgia, serif; font-style: italic; font-size: 14px;">No practice sessions yet</div>
            <div style="font-family: Courier New, monospace; font-size: 10px; letter-spacing: 2px; margin-top: 8px; opacity: 0.5;">START PRACTICING BELOW</div>
        </div>
    `;
    collageContainer.appendChild(emptyMsg);
} else {
    // Scattered positions
    const positions = [
        { x: 15, y: 10, rot: -8, scale: 1 },
        { x: 55, y: 5, rot: 5, scale: 1 },
        { x: 35, y: 25, rot: -3, scale: 1.02 },
        { x: 10, y: 45, rot: 6, scale: 1 },
        { x: 50, y: 50, rot: -4, scale: 1.05 },
    ];

    // Create scattered session cards
    sessions.slice().reverse().forEach((session, reverseIndex) => {
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
        `;
        content.appendChild(dateEl);

        // BPM if available
        const bpmEl = document.createElement('div');
        const bpm = session.BPM || session.bpm || '';
        bpmEl.textContent = bpm ? `${bpm} BPM` : '';
        bpmEl.style.cssText = `
            color: ${THEME.colorAccent};
            font-size: 14px;
            font-family: "Courier New", monospace;
            font-weight: 700;
        `;
        content.appendChild(bpmEl);

        // Type indicator at bottom
        const typeEl = document.createElement('div');
        const practiceType = session["Drumming-Type"] || session["Practice-Type"] || '';
        const typeIcon = practiceType === 'discipline' ? '◆' : practiceType === 'flow' ? '≈' : '○';
        typeEl.textContent = typeIcon;
        typeEl.style.cssText = `
            color: ${practiceType === 'discipline' ? '#fff' : practiceType === 'flow' ? '#ccc' : '#666'};
            font-size: 16px;
            text-align: right;
        `;
        content.appendChild(typeEl);

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
desc.textContent = "Your rhythm journey";
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
// RUDIMENT WHEEL - CIRCULAR PRACTICE TRACKER
// Visual representation of rudiment mastery
// ==========================================

const THEME = window.DRUM_THEME || { color: "#888", colorHover: "#fff", colorBorder: "#222", colorMuted: "#555", colorAccent: "#fff" };
const VAULT_NAME = window.VAULT_NAME || "Alt society";
const settings = window.DRUM_SETTINGS || { rudimentFolder: "Home/Starts/Drumming/Rudiments" };
const createCorners = window.createDrumCorners;

// Core rudiments organized by category
const RUDIMENT_CATEGORIES = {
    singles: {
        name: "Singles",
        icon: "●",
        rudiments: ["Single Stroke Roll", "Single Stroke Four", "Single Stroke Seven"]
    },
    doubles: {
        name: "Doubles",
        icon: "●●",
        rudiments: ["Double Stroke Roll", "Double Stroke Bounce"]
    },
    paradiddles: {
        name: "Paradiddles",
        icon: "◐",
        rudiments: ["Single Paradiddle", "Double Paradiddle", "Triple Paradiddle", "Paradiddle-diddle"]
    },
    flams: {
        name: "Flams",
        icon: "◑",
        rudiments: ["Flam", "Flam Accent", "Flam Tap", "Flamacue", "Flam Paradiddle"]
    },
    drags: {
        name: "Drags",
        icon: "◒",
        rudiments: ["Drag", "Single Drag Tap", "Double Drag Tap", "Drag Paradiddle"]
    },
    rolls: {
        name: "Rolls",
        icon: "◓",
        rudiments: ["Five Stroke Roll", "Six Stroke Roll", "Seven Stroke Roll", "Nine Stroke Roll"]
    }
};

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
    animation: drum-breathe 8s ease-in-out infinite;
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

const titleRow = document.createElement('div');
titleRow.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 8px;
`;
headerSection.appendChild(titleRow);

const titleIcon = document.createElement('span');
titleIcon.textContent = '◎';
titleIcon.style.cssText = `font-size: 20px; color: ${THEME.color}; opacity: 0.7;`;
titleRow.appendChild(titleIcon);

const headerTitle = document.createElement('h3');
headerTitle.textContent = "Rudiment Wheel";
headerTitle.style.cssText = `
    margin: 0;
    color: ${THEME.color};
    font-size: 13px;
    font-weight: 500;
    font-family: "Times New Roman", serif;
    letter-spacing: 3px;
    text-transform: uppercase;
    opacity: 0.7;
`;
titleRow.appendChild(headerTitle);

const subtitle = document.createElement('p');
subtitle.textContent = "Master the fundamentals";
subtitle.style.cssText = `
    margin: 0;
    color: ${THEME.colorMuted};
    font-size: 12px;
    font-family: "Georgia", serif;
    font-style: italic;
    text-align: center;
`;
headerSection.appendChild(subtitle);

// ==========================================
// CANVAS - Rudiment Wheel Visualization
// ==========================================
const canvasContainer = document.createElement('div');
canvasContainer.style.cssText = `
    display: flex;
    justify-content: center;
    padding: 30px 20px;
    position: relative;
`;
card.appendChild(canvasContainer);

// Create canvas
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

const dpr = window.devicePixelRatio || 1;
const logicalSize = 300;

canvas.width = logicalSize * dpr;
canvas.height = logicalSize * dpr;
canvas.style.width = logicalSize + "px";
canvas.style.height = logicalSize + "px";

ctx.scale(dpr, dpr);
canvasContainer.appendChild(canvas);

const centerX = logicalSize / 2;
const centerY = logicalSize / 2;

// Try to load rudiment data from vault
const rudimentFolder = settings.rudimentFolder || "Home/Starts/Drumming/Rudiments";
const rudimentPages = dv.pages(`"${rudimentFolder}"`).array();

// Build mastery map
const masteryMap = new Map();
rudimentPages.forEach(page => {
    const mastery = page.mastery || page.level || 0;
    masteryMap.set(page.file.name, Math.min(100, Math.max(0, mastery)));
});

// Draw the rudiment wheel
function drawWheel() {
    ctx.clearRect(0, 0, logicalSize, logicalSize);

    const categories = Object.entries(RUDIMENT_CATEGORIES);
    const numCategories = categories.length;
    const radius = 100;
    const innerRadius = 35;

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#111';
    ctx.fill();
    ctx.strokeStyle = THEME.colorBorder;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Center icon
    ctx.font = '16px serif';
    ctx.fillStyle = THEME.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('◎', centerX, centerY);

    // Draw category segments
    categories.forEach(([key, cat], i) => {
        const startAngle = (i / numCategories) * Math.PI * 2 - Math.PI / 2;
        const endAngle = ((i + 1) / numCategories) * Math.PI * 2 - Math.PI / 2;
        const midAngle = (startAngle + endAngle) / 2;

        // Calculate average mastery for category
        let totalMastery = 0;
        let count = 0;
        cat.rudiments.forEach(rud => {
            if (masteryMap.has(rud)) {
                totalMastery += masteryMap.get(rud);
                count++;
            }
        });
        const avgMastery = count > 0 ? totalMastery / count : 0;
        const masteryRadius = innerRadius + (radius - innerRadius) * (avgMastery / 100);

        // Draw segment arc (mastery level)
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, masteryRadius, startAngle, endAngle);
        ctx.closePath();

        const alpha = 0.1 + (avgMastery / 100) * 0.3;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();

        // Draw segment outline
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.strokeStyle = `rgba(255, 255, 255, 0.2)`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw radial lines
        ctx.beginPath();
        ctx.moveTo(
            centerX + Math.cos(startAngle) * innerRadius,
            centerY + Math.sin(startAngle) * innerRadius
        );
        ctx.lineTo(
            centerX + Math.cos(startAngle) * radius,
            centerY + Math.sin(startAngle) * radius
        );
        ctx.strokeStyle = `rgba(255, 255, 255, 0.15)`;
        ctx.stroke();

        // Draw category label
        const labelRadius = radius + 25;
        const labelX = centerX + Math.cos(midAngle) * labelRadius;
        const labelY = centerY + Math.sin(midAngle) * labelRadius;

        ctx.font = '9px "Courier New", monospace';
        ctx.fillStyle = THEME.colorMuted;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Rotate text to follow circle
        ctx.save();
        ctx.translate(labelX, labelY);
        let rotation = midAngle + Math.PI / 2;
        if (midAngle > Math.PI / 2 && midAngle < 3 * Math.PI / 2) {
            rotation += Math.PI;
        }
        ctx.rotate(rotation);
        ctx.fillText(cat.name.toUpperCase(), 0, 0);
        ctx.restore();

        // Draw category icon
        const iconRadius = innerRadius + 25;
        const iconX = centerX + Math.cos(midAngle) * iconRadius;
        const iconY = centerY + Math.sin(midAngle) * iconRadius;

        ctx.font = '12px serif';
        ctx.fillStyle = avgMastery > 50 ? THEME.colorAccent : THEME.colorMuted;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(cat.icon, iconX, iconY);
    });

    // Draw outer ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = THEME.colorBorder;
    ctx.lineWidth = 1;
    ctx.stroke();
}

drawWheel();

// ==========================================
// CATEGORY LIST
// ==========================================
const listSection = document.createElement('div');
listSection.style.cssText = `
    padding: 0 20px 20px 20px;
`;
card.appendChild(listSection);

Object.entries(RUDIMENT_CATEGORIES).forEach(([key, cat]) => {
    const catItem = document.createElement('div');
    catItem.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 14px;
        margin-bottom: 6px;
        background: #0c0c0c;
        border: 1px solid ${THEME.colorBorder};
        cursor: pointer;
        transition: all 0.3s ease;
    `;

    catItem.onmouseenter = () => {
        catItem.style.borderColor = THEME.color;
        catItem.style.background = '#0f0f0f';
    };
    catItem.onmouseleave = () => {
        catItem.style.borderColor = THEME.colorBorder;
        catItem.style.background = '#0c0c0c';
    };

    const leftSide = document.createElement('div');
    leftSide.style.cssText = 'display: flex; align-items: center; gap: 12px;';

    const icon = document.createElement('span');
    icon.textContent = cat.icon;
    icon.style.cssText = `font-size: 14px; color: ${THEME.color}; width: 24px; text-align: center;`;
    leftSide.appendChild(icon);

    const name = document.createElement('span');
    name.textContent = cat.name;
    name.style.cssText = `
        color: ${THEME.color};
        font-size: 13px;
        font-family: "Times New Roman", serif;
        letter-spacing: 0.5px;
    `;
    leftSide.appendChild(name);

    catItem.appendChild(leftSide);

    // Count mastered
    let mastered = 0;
    cat.rudiments.forEach(rud => {
        if (masteryMap.get(rud) >= 80) mastered++;
    });

    const rightSide = document.createElement('span');
    rightSide.textContent = `${mastered}/${cat.rudiments.length}`;
    rightSide.style.cssText = `
        color: ${THEME.colorMuted};
        font-size: 11px;
        font-family: "Courier New", monospace;
    `;
    catItem.appendChild(rightSide);

    listSection.appendChild(catItem);
});
```


```dataviewjs
// ==========================================
// PRACTICE SESSION LOGGER
// Log practice with BPM, duration, and type
// ==========================================

const THEME = window.DRUM_THEME || { color: "#888", colorHover: "#fff", colorBorder: "#222", colorMuted: "#555", colorAccent: "#fff" };
const VAULT_NAME = window.VAULT_NAME || "Alt society";
const settings = window.DRUM_SETTINGS || { logFile: "Personal Life/04 Drumming/Practice Log.md", sessionFolder: "Home/Starts/Drumming/Sessions" };
const createCorners = window.createDrumCorners;
const addRhythmDots = window.addRhythmDots;

// ==========================================
// PRACTICE LOG FUNCTIONS
// ==========================================
async function getPracticeLog() {
    const file = app.vault.getAbstractFileByPath(settings.logFile);
    if (!file) return {
        totalSessions: 0,
        totalMinutes: 0,
        currentStreak: 0,
        longestStreak: 0,
        highestBPM: 0,
        lastSessionDate: null,
        entries: []
    };

    const cache = app.metadataCache.getFileCache(file);
    const fm = cache?.frontmatter || {};
    return {
        totalSessions: fm.totalSessions || 0,
        totalMinutes: fm.totalMinutes || 0,
        currentStreak: fm.currentStreak || 0,
        longestStreak: fm.longestStreak || 0,
        highestBPM: fm.highestBPM || 0,
        lastSessionDate: fm.lastSessionDate || null,
        entries: fm.entries || []
    };
}

async function savePracticeLog(data) {
    const content = `---
totalSessions: ${data.totalSessions}
totalMinutes: ${data.totalMinutes}
currentStreak: ${data.currentStreak}
longestStreak: ${data.longestStreak}
highestBPM: ${data.highestBPM}
lastSessionDate: "${data.lastSessionDate || ''}"
entries: ${JSON.stringify(data.entries)}
cssclasses:
  - hide-properties
---

# Drum Practice Log

> Personal rhythm journey tracker.
> This file is auto-managed by the Drum practice session.

Last updated: ${moment().format("YYYY-MM-DD HH:mm")}
`;

    const file = app.vault.getAbstractFileByPath(settings.logFile);
    if (file) {
        await app.vault.modify(file, content);
    } else {
        const folder = settings.logFile.substring(0, settings.logFile.lastIndexOf('/'));
        if (!app.vault.getAbstractFileByPath(folder)) {
            await app.vault.createFolder(folder);
        }
        await app.vault.create(settings.logFile, content);
    }
}

async function logPracticeSession(durationMins, bpm, focus, type, notes) {
    const log = await getPracticeLog();
    const today = moment().format('YYYY-MM-DD');

    // Check streak
    const lastDate = log.lastSessionDate ? moment(log.lastSessionDate) : null;
    const daysSinceLast = lastDate ? moment().diff(lastDate, 'days') : null;

    let newStreak = log.currentStreak;
    if (daysSinceLast === null || daysSinceLast > 1) {
        newStreak = 1;
    } else if (daysSinceLast === 1) {
        newStreak = log.currentStreak + 1;
    }

    const entry = {
        id: Date.now(),
        timestamp: moment().format(),
        date: today,
        durationMins,
        bpm: bpm || null,
        focus: focus || null,
        type,
        notes: notes || null
    };

    log.entries.unshift(entry);
    if (log.entries.length > 100) {
        log.entries = log.entries.slice(0, 100);
    }

    log.totalSessions++;
    log.totalMinutes += durationMins;
    log.currentStreak = newStreak;
    log.longestStreak = Math.max(log.longestStreak, newStreak);
    log.highestBPM = Math.max(log.highestBPM, bpm || 0);
    log.lastSessionDate = today;

    await savePracticeLog(log);
    return entry;
}

// ==========================================
// MODAL SYSTEM
// ==========================================
let activeModal = null;

function closeModal() {
    if (!activeModal) return;
    activeModal.classList.remove('visible');
    setTimeout(() => {
        if (activeModal?.parentNode) activeModal.parentNode.removeChild(activeModal);
        activeModal = null;
    }, 500);
}

function createModal(title, contentBuilder) {
    if (activeModal) {
        activeModal.parentNode.removeChild(activeModal);
        activeModal = null;
    }

    const modal = document.createElement("div");
    modal.className = "drum-modal-overlay";
    activeModal = modal;

    const modalContent = document.createElement("div");
    modalContent.className = "drum-modal-content";
    modal.appendChild(modalContent);

    const scrollWrapper = document.createElement('div');
    scrollWrapper.style.cssText = 'overflow-y: auto; max-height: calc(85vh - 60px); display: flex; flex-direction: column; gap: 20px;';
    modalContent.appendChild(scrollWrapper);

    if (createCorners) createCorners(modalContent, THEME.color);

    if (title) {
        const modalTitle = document.createElement("h2");
        modalTitle.textContent = title;
        modalTitle.style.cssText = `
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
        scrollWrapper.appendChild(modalTitle);

        const divider = document.createElement('div');
        divider.style.cssText = `
            width: 60px;
            height: 1px;
            background: linear-gradient(90deg, transparent, ${THEME.color}, transparent);
            margin: 0 auto;
        `;
        scrollWrapper.appendChild(divider);
    }

    contentBuilder(scrollWrapper);

    modal.onclick = (e) => { if (e.target === modal) closeModal(); };
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('visible'));

    return modal;
}

// ==========================================
// LOG SESSION MODAL
// ==========================================
function openLogSessionModal() {
    let duration = 30;
    let bpm = 80;
    let focus = '';
    let practiceType = 'flow';

    createModal("Log Practice Session", (content) => {
        // Duration input
        const durationContainer = document.createElement('div');
        durationContainer.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            background: #0f0f0f;
            border: 1px solid ${THEME.colorBorder};
        `;
        content.appendChild(durationContainer);

        const durationLabel = document.createElement('div');
        durationLabel.innerHTML = `<span style="color: ${THEME.color};">Duration</span><br><span style="color: ${THEME.colorMuted}; font-size: 11px;">Minutes practiced</span>`;
        durationContainer.appendChild(durationLabel);

        const durationControls = document.createElement('div');
        durationControls.style.cssText = 'display: flex; align-items: center; gap: 12px;';

        const durationMinus = document.createElement('button');
        durationMinus.textContent = '−';
        durationMinus.style.cssText = `width: 36px; height: 36px; background: #0a0a0a; border: 1px solid ${THEME.colorBorder}; color: ${THEME.color}; font-size: 18px; cursor: pointer;`;

        const durationDisplay = document.createElement('span');
        durationDisplay.textContent = `${duration} min`;
        durationDisplay.style.cssText = `min-width: 70px; text-align: center; color: ${THEME.colorAccent}; font-size: 18px; font-weight: 600; font-family: "Courier New", monospace;`;

        const durationPlus = document.createElement('button');
        durationPlus.textContent = '+';
        durationPlus.style.cssText = `width: 36px; height: 36px; background: #0a0a0a; border: 1px solid ${THEME.colorBorder}; color: ${THEME.color}; font-size: 18px; cursor: pointer;`;

        durationMinus.onclick = () => {
            duration = Math.max(5, duration - 5);
            durationDisplay.textContent = `${duration} min`;
        };
        durationPlus.onclick = () => {
            duration = Math.min(480, duration + 5);
            durationDisplay.textContent = `${duration} min`;
        };

        durationControls.appendChild(durationMinus);
        durationControls.appendChild(durationDisplay);
        durationControls.appendChild(durationPlus);
        durationContainer.appendChild(durationControls);

        // BPM input
        const bpmContainer = document.createElement('div');
        bpmContainer.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            background: #0f0f0f;
            border: 1px solid ${THEME.colorBorder};
        `;
        content.appendChild(bpmContainer);

        const bpmLabel = document.createElement('div');
        bpmLabel.innerHTML = `<span style="color: ${THEME.color};">Max BPM</span><br><span style="color: ${THEME.colorMuted}; font-size: 11px;">Highest tempo reached</span>`;
        bpmContainer.appendChild(bpmLabel);

        const bpmControls = document.createElement('div');
        bpmControls.style.cssText = 'display: flex; align-items: center; gap: 12px;';

        const bpmMinus = document.createElement('button');
        bpmMinus.textContent = '−';
        bpmMinus.style.cssText = `width: 36px; height: 36px; background: #0a0a0a; border: 1px solid ${THEME.colorBorder}; color: ${THEME.color}; font-size: 18px; cursor: pointer;`;

        const bpmDisplay = document.createElement('span');
        bpmDisplay.textContent = `${bpm}`;
        bpmDisplay.className = 'bpm-display';
        bpmDisplay.style.cssText = `min-width: 70px; text-align: center; color: ${THEME.colorAccent}; font-size: 24px; font-weight: 700; font-family: "Courier New", monospace;`;

        const bpmPlus = document.createElement('button');
        bpmPlus.textContent = '+';
        bpmPlus.style.cssText = `width: 36px; height: 36px; background: #0a0a0a; border: 1px solid ${THEME.colorBorder}; color: ${THEME.color}; font-size: 18px; cursor: pointer;`;

        bpmMinus.onclick = () => {
            bpm = Math.max(40, bpm - 5);
            bpmDisplay.textContent = `${bpm}`;
        };
        bpmPlus.onclick = () => {
            bpm = Math.min(300, bpm + 5);
            bpmDisplay.textContent = `${bpm}`;
        };

        bpmControls.appendChild(bpmMinus);
        bpmControls.appendChild(bpmDisplay);
        bpmControls.appendChild(bpmPlus);
        bpmContainer.appendChild(bpmControls);

        // Focus area
        const focusLabel = document.createElement('div');
        focusLabel.textContent = 'Focus Area';
        focusLabel.style.cssText = `color: ${THEME.colorMuted}; font-size: 11px; letter-spacing: 1px; text-transform: uppercase;`;
        content.appendChild(focusLabel);

        const focusInput = document.createElement('input');
        focusInput.type = 'text';
        focusInput.placeholder = 'e.g., Paradiddles, Double bass, Jazz grooves...';
        focusInput.style.cssText = `
            width: 100%;
            padding: 14px;
            background: #0f0f0f;
            border: 1px solid ${THEME.colorBorder};
            color: ${THEME.color};
            font-size: 14px;
            box-sizing: border-box;
        `;
        focusInput.onchange = () => { focus = focusInput.value; };
        content.appendChild(focusInput);

        // Practice type selection
        const typeLabel = document.createElement('div');
        typeLabel.textContent = 'How did it feel?';
        typeLabel.style.cssText = `color: ${THEME.colorMuted}; font-size: 11px; letter-spacing: 1px; text-transform: uppercase;`;
        content.appendChild(typeLabel);

        const typeContainer = document.createElement('div');
        typeContainer.style.cssText = 'display: flex; gap: 10px;';
        content.appendChild(typeContainer);

        const types = [
            { id: 'discipline', label: 'Discipline', icon: '◆', desc: 'Pushed through resistance' },
            { id: 'flow', label: 'Flow', icon: '≈', desc: 'Felt natural and effortless' }
        ];

        const typeBtns = [];
        types.forEach(t => {
            const btn = document.createElement('div');
            btn.style.cssText = `
                flex: 1;
                padding: 16px;
                background: ${t.id === practiceType ? 'rgba(255,255,255,0.05)' : '#0f0f0f'};
                border: 1px solid ${t.id === practiceType ? THEME.color : THEME.colorBorder};
                cursor: pointer;
                text-align: center;
                transition: all 0.3s ease;
            `;

            btn.innerHTML = `
                <div style="font-size: 20px; margin-bottom: 8px;">${t.icon}</div>
                <div style="color: ${THEME.color}; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">${t.label}</div>
                <div style="color: ${THEME.colorMuted}; font-size: 10px; margin-top: 4px;">${t.desc}</div>
            `;

            btn.onclick = () => {
                practiceType = t.id;
                typeBtns.forEach(b => {
                    b.style.background = '#0f0f0f';
                    b.style.borderColor = THEME.colorBorder;
                });
                btn.style.background = 'rgba(255,255,255,0.05)';
                btn.style.borderColor = THEME.color;
            };

            typeContainer.appendChild(btn);
            typeBtns.push(btn);
        });

        // Notes
        const notesLabel = document.createElement('div');
        notesLabel.textContent = 'Session Notes (optional)';
        notesLabel.style.cssText = `color: ${THEME.colorMuted}; font-size: 11px; letter-spacing: 1px; text-transform: uppercase;`;
        content.appendChild(notesLabel);

        const notesInput = document.createElement('textarea');
        notesInput.placeholder = 'What did you work on? Any breakthroughs or challenges...';
        notesInput.style.cssText = `
            width: 100%;
            height: 80px;
            padding: 12px;
            background: #0f0f0f;
            border: 1px solid ${THEME.colorBorder};
            color: ${THEME.color};
            font-size: 13px;
            font-family: Georgia, serif;
            resize: none;
            box-sizing: border-box;
        `;
        content.appendChild(notesInput);

        // Submit button
        const submitBtn = document.createElement('button');
        submitBtn.textContent = "LOG SESSION";
        submitBtn.style.cssText = `
            width: 100%;
            padding: 16px;
            background: ${THEME.colorAccent};
            border: none;
            color: #0a0a0a;
            font-size: 14px;
            font-weight: 700;
            letter-spacing: 2px;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        submitBtn.onmouseover = () => { submitBtn.style.background = '#fff'; submitBtn.style.boxShadow = '0 0 20px rgba(255,255,255,0.3)'; };
        submitBtn.onmouseout = () => { submitBtn.style.background = THEME.colorAccent; submitBtn.style.boxShadow = 'none'; };
        submitBtn.onclick = async () => {
            await logPracticeSession(
                duration,
                bpm,
                focusInput.value.trim(),
                practiceType,
                notesInput.value.trim()
            );

            closeModal();
            new Notice(`Practice session logged: ${duration} min @ ${bpm} BPM`);
            setTimeout(() => {
                app.workspace.trigger('dataview:refresh-views');
            }, 300);
        };
        content.appendChild(submitBtn);
    });
}

// ==========================================
// RENDER ACTION CARD
// ==========================================
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
if (addRhythmDots) addRhythmDots(card, THEME.color, 5);

// Header
const headerSection = document.createElement('div');
headerSection.style.cssText = `
    padding: 24px 28px 20px 28px;
    background: linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 100%);
    border-bottom: 1px solid ${THEME.colorBorder};
`;
card.appendChild(headerSection);

const header = document.createElement('h3');
header.textContent = "Practice";
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
desc.textContent = "Track your rhythm journey";
desc.style.cssText = `
    margin: 0;
    color: ${THEME.colorMuted};
    font-size: 14px;
    line-height: 1.4;
    font-family: "Georgia", serif;
    font-style: italic;
`;
headerSection.appendChild(desc);

// Buttons
const buttonsSection = document.createElement('div');
buttonsSection.style.cssText = `
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
`;
card.appendChild(buttonsSection);

// Log Session button
const logBtn = document.createElement('button');
logBtn.innerHTML = `<span style="margin-right: 8px;">&#x1F941;</span> Log Practice Session`;
logBtn.style.cssText = `
    width: 100%;
    padding: 18px 24px;
    background: ${THEME.colorAccent};
    border: none;
    color: #0a0a0a;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 1px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
`;
logBtn.onmouseover = () => {
    logBtn.style.boxShadow = '0 0 30px rgba(255,255,255,0.3)';
    logBtn.style.transform = 'translateY(-2px)';
};
logBtn.onmouseout = () => {
    logBtn.style.boxShadow = 'none';
    logBtn.style.transform = 'translateY(0)';
};
logBtn.onclick = openLogSessionModal;
buttonsSection.appendChild(logBtn);

// Quick log buttons
const quickRow = document.createElement('div');
quickRow.style.cssText = 'display: flex; gap: 10px;';
buttonsSection.appendChild(quickRow);

const quickBtns = [
    { label: '15 min', duration: 15 },
    { label: '30 min', duration: 30 },
    { label: '60 min', duration: 60 }
];

quickBtns.forEach(q => {
    const btn = document.createElement('button');
    btn.textContent = q.label;
    btn.style.cssText = `
        flex: 1;
        padding: 12px;
        background: transparent;
        border: 1px solid ${THEME.colorBorder};
        color: ${THEME.colorMuted};
        font-size: 12px;
        font-family: "Courier New", monospace;
        letter-spacing: 1px;
        cursor: pointer;
        transition: all 0.3s ease;
    `;
    btn.onmouseover = () => {
        btn.style.borderColor = THEME.color;
        btn.style.color = THEME.color;
    };
    btn.onmouseout = () => {
        btn.style.borderColor = THEME.colorBorder;
        btn.style.color = THEME.colorMuted;
    };
    btn.onclick = async () => {
        await logPracticeSession(q.duration, 0, '', 'flow', '');
        new Notice(`Quick log: ${q.duration} min practice`);
        setTimeout(() => {
            app.workspace.trigger('dataview:refresh-views');
        }, 300);
    };
    quickRow.appendChild(btn);
});
```


```dataviewjs
// ==========================================
// PRACTICE STATS CARD
// ==========================================

const THEME = window.DRUM_THEME || { color: "#888", colorHover: "#fff", colorBorder: "#222", colorMuted: "#555", colorAccent: "#fff" };
const settings = window.DRUM_SETTINGS || { logFile: "Personal Life/04 Drumming/Practice Log.md" };
const createCorners = window.createDrumCorners;

// Get log data
async function getStats() {
    const file = app.vault.getAbstractFileByPath(settings.logFile);
    if (!file) return null;
    const cache = app.metadataCache.getFileCache(file);
    return cache?.frontmatter || null;
}

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

// Header
const headerSection = document.createElement('div');
headerSection.style.cssText = `
    padding: 24px 28px 20px 28px;
    background: linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 100%);
    border-bottom: 1px solid ${THEME.colorBorder};
`;
card.appendChild(headerSection);

const header = document.createElement('h3');
header.textContent = "Statistics";
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
desc.textContent = "Your drumming progress";
desc.style.cssText = `
    margin: 0;
    color: ${THEME.colorMuted};
    font-size: 14px;
    line-height: 1.4;
    font-family: "Georgia", serif;
    font-style: italic;
`;
headerSection.appendChild(desc);

// Stats grid
const statsSection = document.createElement('div');
statsSection.style.cssText = `
    padding: 20px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
`;
card.appendChild(statsSection);

// Render stats
getStats().then(stats => {
    const data = stats || { totalSessions: 0, totalMinutes: 0, currentStreak: 0, longestStreak: 0, highestBPM: 0 };

    const statItems = [
        { label: "Sessions", value: data.totalSessions || 0, icon: "◎", color: THEME.color },
        { label: "Time", value: `${Math.floor((data.totalMinutes || 0) / 60)}h ${(data.totalMinutes || 0) % 60}m`, icon: "◷", color: THEME.colorAccent },
        { label: "Max BPM", value: data.highestBPM || '—', icon: "♩", color: THEME.colorAccent },
        { label: "Streak", value: `${data.currentStreak || 0} days`, icon: "◆", color: THEME.color }
    ];

    statItems.forEach(item => {
        const statCard = document.createElement('div');
        statCard.style.cssText = `
            padding: 16px;
            background: #0f0f0f;
            border: 1px solid ${THEME.colorBorder};
            text-align: center;
            transition: all 0.3s ease;
        `;

        statCard.onmouseenter = () => {
            statCard.style.borderColor = item.color;
            statCard.style.transform = 'translateY(-2px)';
        };
        statCard.onmouseleave = () => {
            statCard.style.borderColor = THEME.colorBorder;
            statCard.style.transform = 'translateY(0)';
        };

        const icon = document.createElement('div');
        icon.textContent = item.icon;
        icon.style.cssText = `font-size: 20px; margin-bottom: 8px; color: ${item.color}; opacity: 0.7;`;
        statCard.appendChild(icon);

        const value = document.createElement('div');
        value.textContent = item.value;
        value.style.cssText = `
            color: ${item.color};
            font-size: 18px;
            font-weight: 600;
            font-family: "Courier New", monospace;
        `;
        statCard.appendChild(value);

        const label = document.createElement('div');
        label.textContent = item.label;
        label.style.cssText = `
            color: ${THEME.colorMuted};
            font-size: 10px;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin-top: 4px;
        `;
        statCard.appendChild(label);

        statsSection.appendChild(statCard);
    });

    // Longest streak note
    if (data.longestStreak > 0) {
        const streakNote = document.createElement('div');
        streakNote.style.cssText = `
            grid-column: 1 / -1;
            text-align: center;
            padding: 12px;
            background: rgba(255, 255, 255, 0.02);
            border: 1px dashed ${THEME.colorBorder};
            color: ${THEME.colorMuted};
            font-size: 12px;
            font-family: Georgia, serif;
            font-style: italic;
        `;
        streakNote.textContent = `Longest streak: ${data.longestStreak} days`;
        statsSection.appendChild(streakNote);
    }
});
```


```dataviewjs
// ==========================================
// RECENT SESSIONS - TIMELINE CARD
// ==========================================

const THEME = window.DRUM_THEME || { color: "#888", colorHover: "#fff", colorBorder: "#222", colorMuted: "#555", colorAccent: "#fff" };
const VAULT_NAME = window.VAULT_NAME || "Alt society";
const settings = window.DRUM_SETTINGS || { logFile: "Personal Life/04 Drumming/Practice Log.md" };
const createCorners = window.createDrumCorners;

// Get recent entries
async function getRecentEntries() {
    const file = app.vault.getAbstractFileByPath(settings.logFile);
    if (!file) return [];
    const cache = app.metadataCache.getFileCache(file);
    const fm = cache?.frontmatter || {};
    return (fm.entries || []).slice(0, 5);
}

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

// Header
const headerSection = document.createElement('div');
headerSection.style.cssText = `
    padding: 24px 28px 20px 28px;
    background: linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 100%);
    border-bottom: 1px solid ${THEME.colorBorder};
`;
card.appendChild(headerSection);

const header = document.createElement('h3');
header.textContent = "Timeline";
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
desc.textContent = "Latest practice sessions";
desc.style.cssText = `
    margin: 0;
    color: ${THEME.colorMuted};
    font-size: 14px;
    line-height: 1.4;
    font-family: "Georgia", serif;
    font-style: italic;
`;
headerSection.appendChild(desc);

// Timeline section
const timelineSection = document.createElement('div');
timelineSection.style.cssText = `
    padding: 16px 20px;
`;
card.appendChild(timelineSection);

// Render entries
getRecentEntries().then(entries => {
    if (entries.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.style.cssText = `
            text-align: center;
            padding: 32px 20px;
            color: ${THEME.colorMuted};
        `;
        emptyMsg.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 12px; opacity: 0.3;">&#x1F941;</div>
            <div style="font-family: Georgia, serif; font-style: italic; font-size: 13px;">No sessions logged yet</div>
            <div style="font-family: 'Courier New', monospace; font-size: 10px; letter-spacing: 1px; margin-top: 8px; opacity: 0.5;">START PRACTICING ABOVE</div>
        `;
        timelineSection.appendChild(emptyMsg);
        return;
    }

    entries.forEach((entry, index) => {
        const item = document.createElement('div');
        item.style.cssText = `
            display: flex;
            align-items: flex-start;
            gap: 16px;
            padding: 14px 16px;
            margin-bottom: ${index < entries.length - 1 ? '8px' : '0'};
            background: #0f0f0f;
            border: 1px solid ${THEME.colorBorder};
            transition: all 0.3s ease;
        `;

        item.onmouseenter = () => {
            item.style.borderColor = THEME.color;
            item.style.background = '#121212';
        };
        item.onmouseleave = () => {
            item.style.borderColor = THEME.colorBorder;
            item.style.background = '#0f0f0f';
        };

        // Date column
        const dateCol = document.createElement('div');
        dateCol.style.cssText = `
            min-width: 50px;
            text-align: center;
        `;

        const entryDate = moment(entry.timestamp || entry.date);
        const dayNum = document.createElement('div');
        dayNum.textContent = entryDate.format('D');
        dayNum.style.cssText = `
            color: ${THEME.colorAccent};
            font-size: 20px;
            font-weight: 600;
            font-family: "Courier New", monospace;
            line-height: 1;
        `;
        dateCol.appendChild(dayNum);

        const month = document.createElement('div');
        month.textContent = entryDate.format('MMM');
        month.style.cssText = `
            color: ${THEME.colorMuted};
            font-size: 10px;
            letter-spacing: 1px;
            text-transform: uppercase;
        `;
        dateCol.appendChild(month);

        item.appendChild(dateCol);

        // Content column
        const contentCol = document.createElement('div');
        contentCol.style.cssText = `flex: 1; min-width: 0;`;

        // Type indicator and duration
        const topRow = document.createElement('div');
        topRow.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-bottom: 4px;';

        const typeIcon = document.createElement('span');
        typeIcon.textContent = entry.type === 'discipline' ? '◆' : '≈';
        typeIcon.style.cssText = `color: ${entry.type === 'discipline' ? THEME.colorAccent : THEME.color};`;
        topRow.appendChild(typeIcon);

        const durationText = document.createElement('span');
        durationText.textContent = `${entry.durationMins} min`;
        durationText.style.cssText = `
            color: ${THEME.color};
            font-size: 14px;
            font-family: "Courier New", monospace;
        `;
        topRow.appendChild(durationText);

        if (entry.bpm) {
            const bpmText = document.createElement('span');
            bpmText.textContent = `@ ${entry.bpm} BPM`;
            bpmText.style.cssText = `
                color: ${THEME.colorMuted};
                font-size: 12px;
                font-family: "Courier New", monospace;
            `;
            topRow.appendChild(bpmText);
        }

        contentCol.appendChild(topRow);

        // Focus area
        if (entry.focus) {
            const focusText = document.createElement('div');
            focusText.textContent = entry.focus;
            focusText.style.cssText = `
                color: ${THEME.colorMuted};
                font-size: 12px;
                font-family: Georgia, serif;
                font-style: italic;
            `;
            contentCol.appendChild(focusText);
        }

        // Notes
        if (entry.notes) {
            const notes = document.createElement('div');
            notes.textContent = entry.notes;
            notes.style.cssText = `
                margin-top: 8px;
                padding: 8px 10px;
                background: rgba(255, 255, 255, 0.02);
                border-left: 2px solid ${THEME.colorBorder};
                color: ${THEME.colorMuted};
                font-size: 12px;
                font-family: Georgia, serif;
                font-style: italic;
                line-height: 1.4;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            `;
            contentCol.appendChild(notes);
        }

        item.appendChild(contentCol);
        timelineSection.appendChild(item);
    });
});
```

<div style="height: 40px;"></div>
