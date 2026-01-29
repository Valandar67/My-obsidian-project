```dataviewjs
// ==========================================
// SKILL SELECTOR - LANDING PAGE
// Constellation theme, daily note with |scroll embeds
// ==========================================

const VAULT_NAME = "Alt society";

// ==========================================
// SETTINGS (shared with Skill Tree)
// ==========================================
const SETTINGS_KEY = 'skill-tree-settings-v3';

function loadSettings() {
    try {
        const saved = localStorage.getItem(SETTINGS_KEY);
        if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
        skillFolder: "Home/Starts/Drawing/Skill tree",
        treeTitle: "",
        selectorTitle: "",
        sessionFolder: "Home/Starts/Drawing/Sessions",
        layoutStyle: "radial"
    };
}

function saveSettings(s) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    } catch (e) {}
}

let settings = loadSettings();

// Folder where daily session notes are created
const SESSION_FOLDER = settings.sessionFolder || "Home/Starts/Drawing/Sessions";

// ==========================================
// SVG ICON LIBRARY (same as Skill Tree)
// ==========================================
const ICONS = {
    default: { viewBox: "0 0 24 24", path: `<circle cx="12" cy="12" r="3" fill="currentColor"/>` },
    core: { viewBox: "0 0 24 24", path: `<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` },
    pencil: { viewBox: "0 0 24 24", path: `<path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` },
    anatomy: { viewBox: "0 0 24 24", path: `<circle cx="12" cy="5" r="3" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 8v4m-4 0h8m-6 0v8m4-8v8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>` },
    gesture: { viewBox: "0 0 24 24", path: `<path d="M6 18c0-3 2-6 6-9s6-6 6-6M4 12c2-2 4-3 6-3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="18" cy="3" r="2" fill="currentColor"/>` },
    muscle: { viewBox: "0 0 24 24", path: `<path d="M4 15c2-4 5-5 8-3 3 2 5 1 8-3M4 11c2-4 5-5 8-3 3 2 5 1 8-3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>` },
    bone: { viewBox: "0 0 24 24", path: `<path d="M6 4a2 2 0 1 0 0 4 2 2 0 0 0 2-2l4 12a2 2 0 0 0-2 2 2 2 0 1 0 4 0 2 2 0 0 0-2-2l4-12a2 2 0 0 0 2 2 2 2 0 1 0 0-4 2 2 0 0 0-2 2H8a2 2 0 0 0-2-2z" stroke="currentColor" stroke-width="1.5" fill="none"/>` },
    line: { viewBox: "0 0 24 24", path: `<path d="M4 20L20 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="4" cy="20" r="2" fill="currentColor"/><circle cx="20" cy="4" r="2" fill="currentColor"/>` },
    shapes: { viewBox: "0 0 24 24", path: `<rect x="3" y="11" width="8" height="8" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="16" cy="8" r="5" stroke="currentColor" stroke-width="2" fill="none"/><polygon points="12,3 16,10 8,10" stroke="currentColor" stroke-width="2" fill="none"/>` },
    cube: { viewBox: "0 0 24 24", path: `<path d="M12 2l9 5v10l-9 5-9-5V7l9-5z" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 22V12M12 12l9-5M12 12l-9-5" stroke="currentColor" stroke-width="2"/>` },
    contour: { viewBox: "0 0 24 24", path: `<path d="M4 12c0-4 3-8 8-8s8 4 8 8-3 8-8 8" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-dasharray="4 2"/><path d="M8 12c0-2 2-4 4-4s4 2 4 4-2 4-4 4" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="4 2"/>` },
    eye: { viewBox: "0 0 24 24", path: `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/>` },
    negative: { viewBox: "0 0 24 24", path: `<rect x="3" y="3" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"/><path d="M8 8h8v8H8z" fill="currentColor"/>` },
    grid: { viewBox: "0 0 24 24", path: `<path d="M3 3v18h18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M7 21V7h14" stroke="currentColor" stroke-width="1.5" fill="none" stroke-dasharray="2 2"/><path d="M11 21V11h10" stroke="currentColor" stroke-width="1.5" fill="none" stroke-dasharray="2 2"/>` },
    perspective: { viewBox: "0 0 24 24", path: `<path d="M2 20h20M12 4v4M4 20l8-12 8 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="4" r="2" fill="currentColor"/>` },
    light: { viewBox: "0 0 24 24", path: `<circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>` },
    sphere: { viewBox: "0 0 24 24", path: `<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" fill="none"/><ellipse cx="12" cy="12" rx="9" ry="3" stroke="currentColor" stroke-width="1" fill="none"/><path d="M12 3c-2 3-2 15 0 18" stroke="currentColor" stroke-width="1" fill="none"/>` },
    shadow: { viewBox: "0 0 24 24", path: `<circle cx="10" cy="10" r="6" stroke="currentColor" stroke-width="2" fill="none"/><ellipse cx="14" cy="19" rx="6" ry="2" fill="currentColor" opacity="0.5"/>` },
    hatching: { viewBox: "0 0 24 24", path: `<path d="M4 4l16 16M8 4l12 12M12 4l8 8M4 8l12 12M4 12l8 8M4 16l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>` },
    vase: { viewBox: "0 0 24 24", path: `<path d="M9 3h6v3c2 1 4 4 4 8v2c0 2-1 4-4 5H9c-3-1-4-3-4-5v-2c0-4 2-7 4-8V3z" stroke="currentColor" stroke-width="2" fill="none"/>` },
    fruit: { viewBox: "0 0 24 24", path: `<circle cx="12" cy="14" r="7" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 7V4M10 5c0-2 4-2 4 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>` }
};

// ==========================================
// STYLES
// ==========================================
if (!document.getElementById('skill-selector-styles')) {
    const style = document.createElement('style');
    style.id = 'skill-selector-styles';
    style.textContent = `
        @keyframes selector-fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes selector-float-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes selector-pulse-selected {
            0%, 100% { box-shadow: 0 0 12px rgba(255,255,255,0.3), inset 0 0 8px rgba(255,255,255,0.05); }
            50% { box-shadow: 0 0 20px rgba(255,255,255,0.5), inset 0 0 12px rgba(255,255,255,0.1); }
        }

        @keyframes selector-star-drift {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.3); }
        }

        .skill-selector-node {
            position: relative;
            width: 72px;
            height: 72px;
            border-radius: 50%;
            border: 1px solid #333;
            background: rgba(10, 10, 10, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            -webkit-tap-highlight-color: transparent;
            user-select: none;
        }

        .skill-selector-node:hover {
            border-color: #666;
            transform: scale(1.08);
            background: rgba(20, 20, 20, 0.95);
        }

        .skill-selector-node.selected {
            border-color: #fff;
            background: rgba(30, 30, 30, 0.95);
            animation: selector-pulse-selected 2.5s ease-in-out infinite;
        }

        .skill-selector-node.selected svg {
            color: #fff !important;
            filter: drop-shadow(0 0 6px rgba(255,255,255,0.6));
        }

        .skill-selector-node-label {
            position: absolute;
            bottom: -20px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 9px;
            color: #555;
            font-family: "Courier New", monospace;
            letter-spacing: 1px;
            text-transform: uppercase;
            white-space: nowrap;
            transition: color 0.3s ease;
            pointer-events: none;
        }

        .skill-selector-node.selected .skill-selector-node-label {
            color: #aaa;
        }

        .skill-selector-begin-btn {
            border: 1px solid #333;
            background: transparent;
            color: #666;
            font-family: "Courier New", monospace;
            font-size: 12px;
            letter-spacing: 4px;
            text-transform: uppercase;
            padding: 14px 40px;
            cursor: pointer;
            transition: all 0.4s ease;
            position: relative;
            overflow: hidden;
        }

        .skill-selector-begin-btn:hover {
            border-color: #888;
            color: #ccc;
        }

        .skill-selector-begin-btn.ready {
            border-color: #fff;
            color: #fff;
            text-shadow: 0 0 10px rgba(255,255,255,0.3);
        }

        .skill-selector-begin-btn.ready:hover {
            background: rgba(255,255,255,0.05);
            box-shadow: 0 0 30px rgba(255,255,255,0.1);
        }

        .skill-selector-begin-btn:active {
            transform: scale(0.96);
        }

        .selector-count-badge {
            display: inline-block;
            min-width: 18px;
            height: 18px;
            line-height: 18px;
            text-align: center;
            border-radius: 9px;
            background: rgba(255,255,255,0.15);
            font-size: 10px;
            color: #aaa;
            margin-left: 10px;
            padding: 0 5px;
            transition: all 0.3s ease;
        }

        .selector-count-badge.active {
            background: rgba(255,255,255,0.3);
            color: #fff;
        }
    `;
    document.head.appendChild(style);
}

// ==========================================
// LOAD SKILLS FROM VAULT
// ==========================================
function loadSkills() {
    const pages = dv.pages(`"${settings.skillFolder}"`);
    const skills = [];

    for (const page of pages) {
        let parent = page.parent || null;
        if (parent) {
            parent = String(parent).replace(/^\[\[/, '').replace(/\]\]$/, '');
            if (parent.includes('/')) parent = parent.split('/').pop();
        }

        skills.push({
            id: page.file.name,
            name: page.file.name,
            parent: parent,
            icon: page.icon || 'default',
            order: page.order || 0,
            file: page.file.path
        });
    }

    // Sort by order, then alphabetically
    skills.sort((a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name));
    return skills;
}

// ==========================================
// MAIN CONTAINER
// ==========================================
const container = dv.el("div", "");
container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    height: -webkit-fill-available;
    background: #000;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    animation: selector-fade-in 0.8s ease;
    z-index: 9999;
`;

// ==========================================
// STAR BACKGROUND
// ==========================================
const starCanvas = document.createElement('canvas');
starCanvas.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
`;
container.appendChild(starCanvas);

function drawStarBackground() {
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    starCanvas.width = rect.width * dpr;
    starCanvas.height = rect.height * dpr;
    const ctx = starCanvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Draw subtle stars
    for (let i = 0; i < 80; i++) {
        const x = Math.random() * rect.width;
        const y = Math.random() * rect.height;
        const r = Math.random() * 1.5 + 0.3;
        const alpha = Math.random() * 0.4 + 0.1;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
    }

    // Draw faint constellation lines
    const points = [];
    for (let i = 0; i < 20; i++) {
        points.push({ x: Math.random() * rect.width, y: Math.random() * rect.height });
    }
    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            const dx = points[i].x - points[j].x;
            const dy = points[i].y - points[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200 && Math.random() < 0.3) {
                ctx.beginPath();
                ctx.moveTo(points[i].x, points[i].y);
                ctx.lineTo(points[j].x, points[j].y);
                ctx.strokeStyle = `rgba(255, 255, 255, 0.04)`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    }
}

setTimeout(drawStarBackground, 50);

// ==========================================
// TITLE
// ==========================================
const title = document.createElement('div');
title.textContent = 'Select Skills';
title.style.cssText = `
    color: #fff;
    font-size: 13px;
    font-family: "Courier New", monospace;
    letter-spacing: 5px;
    text-transform: uppercase;
    margin-bottom: 40px;
    opacity: 0.5;
    position: relative;
    z-index: 2;
    animation: selector-float-up 0.6s ease both;
    animation-delay: 0.2s;
    text-align: center;
`;
container.appendChild(title);

// Decorative line under title
const titleLine = document.createElement('div');
titleLine.style.cssText = `
    width: 40px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    margin: -25px auto 30px auto;
    position: relative;
    z-index: 2;
    animation: selector-float-up 0.6s ease both;
    animation-delay: 0.3s;
`;
container.appendChild(titleLine);

// ==========================================
// SKILLS GRID
// ==========================================
const gridWrapper = document.createElement('div');
gridWrapper.style.cssText = `
    position: relative;
    z-index: 2;
    max-width: 500px;
    max-height: 55vh;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 20px;
    animation: selector-float-up 0.6s ease both;
    animation-delay: 0.4s;
    scrollbar-width: thin;
    scrollbar-color: #333 transparent;
`;
container.appendChild(gridWrapper);

const grid = document.createElement('div');
grid.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 30px;
    padding: 10px;
`;
gridWrapper.appendChild(grid);

// ==========================================
// STATE
// ==========================================
const selectedSkills = new Set();
const skills = loadSkills();

// Filter out root/parent-only nodes - show leaf skills or all if tree is flat
const selectableSkills = skills.filter(s => {
    // Include all skills that aren't the implicit root
    return s.id !== '__root__';
});

// ==========================================
// RENDER SKILL NODES
// ==========================================
selectableSkills.forEach((skill, index) => {
    const node = document.createElement('div');
    node.className = 'skill-selector-node';
    node.style.animationDelay = `${0.5 + index * 0.05}s`;
    node.style.opacity = '0';
    node.style.animation = `selector-float-up 0.4s ease both`;
    node.style.animationDelay = `${0.5 + index * 0.04}s`;

    // SVG icon (high quality rendering)
    const iconData = ICONS[skill.icon] || ICONS.default;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', iconData.viewBox);
    svg.setAttribute('width', '36');
    svg.setAttribute('height', '36');
    svg.setAttribute('shape-rendering', 'geometricPrecision');
    svg.setAttribute('stroke-rendering', 'geometricPrecision');
    svg.style.cssText = `color: #555; transition: all 0.3s ease; overflow: visible;`;
    svg.innerHTML = iconData.path;
    node.appendChild(svg);

    // Label
    const label = document.createElement('div');
    label.className = 'skill-selector-node-label';
    // Truncate long names
    label.textContent = skill.name.length > 12 ? skill.name.substring(0, 11) + '..' : skill.name;
    label.title = skill.name;
    node.appendChild(label);

    // Click handler
    node.addEventListener('click', () => {
        if (selectedSkills.has(skill.id)) {
            selectedSkills.delete(skill.id);
            node.classList.remove('selected');
        } else {
            selectedSkills.add(skill.id);
            node.classList.add('selected');
        }
        updateBeginButton();
    });

    // Touch feedback
    node.addEventListener('touchstart', () => {
        node.style.transform = 'scale(0.92)';
    }, { passive: true });
    node.addEventListener('touchend', () => {
        node.style.transform = '';
    }, { passive: true });

    grid.appendChild(node);
});

// ==========================================
// BEGIN BUTTON
// ==========================================
const btnContainer = document.createElement('div');
btnContainer.style.cssText = `
    position: relative;
    z-index: 2;
    margin-top: 40px;
    animation: selector-float-up 0.6s ease both;
    animation-delay: ${0.6 + selectableSkills.length * 0.04}s;
    text-align: center;
`;
container.appendChild(btnContainer);

const beginBtn = document.createElement('button');
beginBtn.className = 'skill-selector-begin-btn';
beginBtn.innerHTML = `Begin`;
btnContainer.appendChild(beginBtn);

const countBadge = document.createElement('span');
countBadge.className = 'selector-count-badge';
countBadge.textContent = '0';
beginBtn.appendChild(countBadge);

function updateBeginButton() {
    const count = selectedSkills.size;
    countBadge.textContent = count;

    if (count > 0) {
        beginBtn.classList.add('ready');
        countBadge.classList.add('active');
    } else {
        beginBtn.classList.remove('ready');
        countBadge.classList.remove('active');
    }
}

// ==========================================
// TRANSCEND EFFECT & NOTE CREATION
// ==========================================
beginBtn.addEventListener('click', async () => {
    if (selectedSkills.size === 0) {
        // Subtle shake if nothing selected
        beginBtn.style.animation = 'none';
        beginBtn.offsetHeight; // reflow
        beginBtn.style.transform = 'translateX(-4px)';
        setTimeout(() => { beginBtn.style.transform = 'translateX(4px)'; }, 80);
        setTimeout(() => { beginBtn.style.transform = 'translateX(-2px)'; }, 160);
        setTimeout(() => { beginBtn.style.transform = ''; }, 240);
        return;
    }

    // Disable button
    beginBtn.style.pointerEvents = 'none';
    beginBtn.style.opacity = '0.5';

    // === COSMIC APOCALYPSE EFFECT ===
    // Direct style manipulation - no canvas, no CSS animations
    // Step 1: Background lights up white
    container.style.transition = 'background 0.3s ease-in';
    container.style.background = '#fff';

    // Step 2: Each node burns white with stagger
    const allNodes = grid.querySelectorAll('.skill-selector-node');
    allNodes.forEach((node, i) => {
        setTimeout(() => {
            node.style.transition = 'all 0.15s ease-in';
            node.style.background = '#fff';
            node.style.borderColor = '#fff';
            node.style.boxShadow = '0 0 20px #fff';
            const svg = node.querySelector('svg');
            if (svg) svg.style.color = '#fff';
            const lbl = node.querySelector('.skill-selector-node-label');
            if (lbl) lbl.style.color = '#fff';
        }, 50 + i * 20);
    });

    // Hide title/button
    title.style.transition = 'color 0.2s ease';
    title.style.color = '#fff';
    btnContainer.style.transition = 'opacity 0.15s ease';
    btnContainer.style.opacity = '0';

    // Build note content while the effect plays
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '').substring(0, 4); // HHMM
    const fileName = `Session ${dateStr} ${timeStr}`;
    const sessionFolder = settings.sessionFolder || SESSION_FOLDER;
    const filePath = `${sessionFolder}/${fileName}`;

    // Build the note content with selected skills as |scroll embeds
    const selectedList = [...selectedSkills];

    // Create ISO timestamp with timezone offset
    const tzOffset = -now.getTimezoneOffset();
    const tzHours = String(Math.floor(Math.abs(tzOffset) / 60)).padStart(2, '0');
    const tzMins = String(Math.abs(tzOffset) % 60).padStart(2, '0');
    const tzSign = tzOffset >= 0 ? '+' : '-';
    const timestamp = now.toISOString().slice(0, -1) + tzSign + tzHours + ':' + tzMins;

    let noteContent = `---\nDrawing: true\nDrawing-Type:\nTimestamp: "${timestamp}"\nskills:\n`;
    selectedList.forEach(skillName => {
        noteContent += `  - "${skillName}"\n`;
    });
    noteContent += `---\n\n`;

    // Add the "Add Skills" button dataviewjs block
    noteContent += '```dataviewjs\n';
    noteContent += `// ADD SKILLS BUTTON
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
    muscle: { viewBox: "0 0 24 24", path: '<path d="M4 15c2-4 5-5 8-3 3 2 5 1 8-3M4 11c2-4 5-5 8-3 3 2 5 1 8-3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>' },
    bone: { viewBox: "0 0 24 24", path: '<path d="M6 4a2 2 0 1 0 0 4 2 2 0 0 0 2-2l4 12a2 2 0 0 0-2 2 2 2 0 1 0 4 0 2 2 0 0 0-2-2l4-12a2 2 0 0 0 2 2 2 2 0 1 0 0-4 2 2 0 0 0-2 2H8a2 2 0 0 0-2-2z" stroke="currentColor" stroke-width="1.5" fill="none"/>' },
    line: { viewBox: "0 0 24 24", path: '<path d="M4 20L20 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="4" cy="20" r="2" fill="currentColor"/><circle cx="20" cy="4" r="2" fill="currentColor"/>' },
    shapes: { viewBox: "0 0 24 24", path: '<rect x="3" y="11" width="8" height="8" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="16" cy="8" r="5" stroke="currentColor" stroke-width="2" fill="none"/><polygon points="12,3 16,10 8,10" stroke="currentColor" stroke-width="2" fill="none"/>' },
    cube: { viewBox: "0 0 24 24", path: '<path d="M12 2l9 5v10l-9 5-9-5V7l9-5z" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 22V12M12 12l9-5M12 12l-9-5" stroke="currentColor" stroke-width="2"/>' },
    contour: { viewBox: "0 0 24 24", path: '<path d="M4 12c0-4 3-8 8-8s8 4 8 8-3 8-8 8" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-dasharray="4 2"/><path d="M8 12c0-2 2-4 4-4s4 2 4 4-2 4-4 4" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="4 2"/>' },
    eye: { viewBox: "0 0 24 24", path: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/>' },
    negative: { viewBox: "0 0 24 24", path: '<rect x="3" y="3" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"/><path d="M8 8h8v8H8z" fill="currentColor"/>' },
    grid: { viewBox: "0 0 24 24", path: '<path d="M3 3v18h18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M7 21V7h14" stroke="currentColor" stroke-width="1.5" fill="none" stroke-dasharray="2 2"/><path d="M11 21V11h10" stroke="currentColor" stroke-width="1.5" fill="none" stroke-dasharray="2 2"/>' },
    perspective: { viewBox: "0 0 24 24", path: '<path d="M2 20h20M12 4v4M4 20l8-12 8 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="4" r="2" fill="currentColor"/>' },
    light: { viewBox: "0 0 24 24", path: '<circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' },
    sphere: { viewBox: "0 0 24 24", path: '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" fill="none"/><ellipse cx="12" cy="12" rx="9" ry="3" stroke="currentColor" stroke-width="1" fill="none"/><path d="M12 3c-2 3-2 15 0 18" stroke="currentColor" stroke-width="1" fill="none"/>' },
    shadow: { viewBox: "0 0 24 24", path: '<circle cx="10" cy="10" r="6" stroke="currentColor" stroke-width="2" fill="none"/><ellipse cx="14" cy="19" rx="6" ry="2" fill="currentColor" opacity="0.5"/>' },
    hatching: { viewBox: "0 0 24 24", path: '<path d="M4 4l16 16M8 4l12 12M12 4l8 8M4 8l12 12M4 12l8 8M4 16l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' },
    vase: { viewBox: "0 0 24 24", path: '<path d="M9 3h6v3c2 1 4 4 4 8v2c0 2-1 4-4 5H9c-3-1-4-3-4-5v-2c0-4 2-7 4-8V3z" stroke="currentColor" stroke-width="2" fill="none"/>' },
    fruit: { viewBox: "0 0 24 24", path: '<circle cx="12" cy="14" r="7" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 7V4M10 5c0-2 4-2 4 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' }
};

// Get current skills from frontmatter
const currentSkills = dv.current().skills || [];

// Create card container
const card = dv.el('div', '');
card.style.cssText = 'background:#0a0a0a;border:1px solid #222;border-radius:6px;padding:16px 20px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;';

// Left side - label
const cardLabel = document.createElement('div');
cardLabel.innerHTML = '<span style="color:#555;font-size:10px;font-family:Courier New,monospace;letter-spacing:2px;text-transform:uppercase;">Session Skills</span><span style="color:#333;font-size:10px;margin-left:10px;">(' + currentSkills.length + ' active)</span>';
card.appendChild(cardLabel);

// Right side - add button
const addBtn = document.createElement('div');
addBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg><span>Add More</span>';
addBtn.style.cssText = 'display:flex;align-items:center;padding:10px 16px;background:#111;border:1px solid #333;border-radius:4px;color:#666;font-size:10px;font-family:Courier New,monospace;letter-spacing:1px;text-transform:uppercase;cursor:pointer;transition:all 0.2s;';
addBtn.onmouseenter = () => { addBtn.style.borderColor = '#555'; addBtn.style.color = '#fff'; addBtn.style.background = '#1a1a1a'; };
addBtn.onmouseleave = () => { addBtn.style.borderColor = '#333'; addBtn.style.color = '#666'; addBtn.style.background = '#111'; };
card.appendChild(addBtn);

// Popup elements
let popup = null;
let overlay = null;

addBtn.onclick = async () => {
    if (popup) return;

    // Load available skills
    const pages = dv.pages('"' + skillFolder + '"');
    const allSkills = [];
    for (const p of pages) {
        if (p.file.name !== '__root__') {
            allSkills.push({ name: p.file.name, icon: p.icon || 'default' });
        }
    }
    allSkills.sort((a, b) => a.name.localeCompare(b.name));

    // Filter out already added skills
    const available = allSkills.filter(s => !currentSkills.includes(s.name));

    if (available.length === 0) {
        addBtn.style.transform = 'scale(0.9)';
        setTimeout(() => { addBtn.style.transform = ''; }, 150);
        return;
    }

    const selected = new Set();

    // Create overlay
    overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:9998;opacity:0;transition:opacity 0.3s;';
    document.body.appendChild(overlay);
    setTimeout(() => { overlay.style.opacity = '1'; }, 10);

    // Create popup
    popup = document.createElement('div');
    popup.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.95);width:90%;max-width:420px;max-height:70vh;background:#0a0a0a;border:1px solid #222;z-index:9999;display:flex;flex-direction:column;opacity:0;transition:all 0.3s;border-radius:4px;';

    // Header
    const header = document.createElement('div');
    header.style.cssText = 'padding:20px;border-bottom:1px solid #222;display:flex;justify-content:space-between;align-items:center;';
    header.innerHTML = '<span style="color:#888;font-size:11px;font-family:Courier New,monospace;letter-spacing:2px;text-transform:uppercase;">Add Skills</span>';
    const closeBtn = document.createElement('div');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = 'color:#555;font-size:20px;cursor:pointer;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border:1px solid #333;transition:all 0.2s;';
    closeBtn.onmouseenter = () => { closeBtn.style.borderColor = '#666'; closeBtn.style.color = '#fff'; };
    closeBtn.onmouseleave = () => { closeBtn.style.borderColor = '#333'; closeBtn.style.color = '#555'; };
    closeBtn.onclick = closePopup;
    header.appendChild(closeBtn);
    popup.appendChild(header);

    // Grid
    const gridWrap = document.createElement('div');
    gridWrap.style.cssText = 'flex:1;overflow-y:auto;padding:20px;';
    const grid = document.createElement('div');
    grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:20px;justify-content:center;';

    available.forEach(skill => {
        const node = document.createElement('div');
        node.style.cssText = 'width:64px;height:64px;border-radius:50%;border:1px solid #333;background:#111;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;position:relative;';

        const iconData = ICONS[skill.icon] || ICONS.default;
        node.innerHTML = '<svg viewBox="' + iconData.viewBox + '" width="28" height="28" style="color:#555;transition:color 0.2s;">' + iconData.path + '</svg>';

        const label = document.createElement('div');
        label.textContent = skill.name.length > 10 ? skill.name.substring(0,9) + '..' : skill.name;
        label.title = skill.name;
        label.style.cssText = 'position:absolute;bottom:-18px;left:50%;transform:translateX(-50%);font-size:8px;color:#444;font-family:Courier New,monospace;white-space:nowrap;text-transform:uppercase;letter-spacing:1px;';
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
                node.style.boxShadow = '0 0 15px rgba(255,255,255,0.2)';
                node.querySelector('svg').style.color = '#fff';
            }
            confirmBtn.style.opacity = selected.size > 0 ? '1' : '0.4';
            confirmBtn.style.pointerEvents = selected.size > 0 ? 'auto' : 'none';
        };

        grid.appendChild(node);
    });
    gridWrap.appendChild(grid);
    popup.appendChild(gridWrap);

    // Footer with confirm button
    const footer = document.createElement('div');
    footer.style.cssText = 'padding:15px 20px;border-top:1px solid #222;';
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Add Selected';
    confirmBtn.style.cssText = 'width:100%;padding:12px;background:transparent;border:1px solid #333;color:#888;font-family:Courier New,monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:all 0.2s;opacity:0.4;pointer-events:none;';
    confirmBtn.onmouseenter = () => { if (selected.size > 0) { confirmBtn.style.borderColor = '#fff'; confirmBtn.style.color = '#fff'; } };
    confirmBtn.onmouseleave = () => { confirmBtn.style.borderColor = '#333'; confirmBtn.style.color = '#888'; };
    confirmBtn.onclick = async () => {
        if (selected.size === 0) return;

        // Get current file
        const file = app.workspace.getActiveFile();
        if (!file) return;

        // Read current content
        let content = await app.vault.read(file);
        const newSkills = [...selected];

        // Build the new skills array items
        let skillItems = '';
        newSkills.forEach(skillName => {
            skillItems += '  - "' + skillName + '"\\n';
        });

        // Fix YAML: update skills in frontmatter
        // Match skills: [] only in YAML frontmatter (between --- markers)
        const fmMatch = content.match(/^---\\n([\\s\\S]*?)\\n---/);
        const frontmatter = fmMatch ? fmMatch[1] : '';

        if (frontmatter.includes('skills: []')) {
            // Replace empty array with proper YAML list (only in frontmatter)
            content = content.replace(/^(---\\n[\\s\\S]*?)skills: \\[\\]/, '$1skills:\\n' + skillItems.slice(0, -1));
        } else if (frontmatter.match(/skills:\\s*\\n/)) {
            // Has skills: with items below, find where to insert (only first match in frontmatter)
            const skillsMatch = frontmatter.match(/skills:\\s*\\n((?:  - [^\\n]+\\n)*)/);
            if (skillsMatch) {
                const existingSkills = skillsMatch[0];
                content = content.replace(existingSkills, existingSkills + skillItems);
            }
        } else if (fmMatch) {
            // Fallback: add skills section before closing --- of frontmatter
            const fmEnd = content.indexOf('\\n---', 4);
            if (fmEnd !== -1) {
                content = content.slice(0, fmEnd) + '\\nskills:\\n' + skillItems.slice(0, -1) + content.slice(fmEnd);
            }
        }

        // Add embeds before Finish Session button (find the --- separator before it)
        let embedContent = '';
        newSkills.forEach(skillName => {
            embedContent += '![[' + skillName + '|scroll]]\\n\\n';
        });

        // Find the Finish Session section marker and insert before it
        const finishMarker = '---\\n\\n\`\`\`dataviewjs\\n// FINISH SESSION';
        const finishIdx = content.indexOf(finishMarker);
        if (finishIdx !== -1) {
            content = content.slice(0, finishIdx) + embedContent + content.slice(finishIdx);
        } else {
            // Fallback: append at end if marker not found
            content += embedContent;
        }

        await app.vault.modify(file, content);
        closePopup();

        // Refresh the view
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
`;
    noteContent += '\`\`\`\n\n';

    // Add each selected skill as a scroll embed
    selectedList.forEach(skillName => {
        noteContent += `![[${skillName}|scroll]]\n\n`;
    });

    // Add the Finish Session button at the bottom
    noteContent += '---\n\n';
    noteContent += '```dataviewjs\n';
    noteContent += '// FINISH SESSION BUTTON - Mood tracking and time calculation\n';
    noteContent += 'const VAULT_NAME = "' + VAULT_NAME + '";\n';
    noteContent += 'const THEME = { color: "#888", colorHover: "#fff", colorBorder: "#222", colorMuted: "#555" };\n\n';
    noteContent += `function createCorners(container, color, size) {
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
`;
    noteContent += '```\n';

    // Create the session folder if it doesn't exist, then create the note
    try {
        const folderExists = app.vault.getAbstractFileByPath(sessionFolder);
        if (!folderExists) {
            await app.vault.createFolder(sessionFolder);
        }

        // Check if note already exists (same minute)
        const existing = app.vault.getAbstractFileByPath(filePath + '.md');
        if (existing) {
            // Append a counter
            let counter = 2;
            let altPath = `${filePath} (${counter})`;
            while (app.vault.getAbstractFileByPath(altPath + '.md')) {
                counter++;
                altPath = `${filePath} (${counter})`;
            }
            await app.vault.create(altPath + '.md', noteContent);
            // Navigate when screen is fully white
            setTimeout(() => {
                window.location.href = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent(altPath)}`;
                setTimeout(() => { container.remove(); }, 500);
            }, 400);
        } else {
            await app.vault.create(filePath + '.md', noteContent);
            setTimeout(() => {
                window.location.href = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent(filePath)}`;
                setTimeout(() => { container.remove(); }, 500);
            }, 400);
        }
    } catch (err) {
        console.error('[SkillSelector] Failed to create session note:', err);
        container.style.background = '#000';
        allNodes.forEach(node => {
            node.style.background = '';
            node.style.borderColor = '';
            node.style.boxShadow = '';
        });
        title.style.color = '';
        btnContainer.style.opacity = '1';
        beginBtn.style.pointerEvents = '';
        beginBtn.style.opacity = '';
    }
});

// ==========================================
// BACK BUTTON (top-left, subtle)
// ==========================================
const backBtn = document.createElement('div');
backBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`;
backBtn.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 10;
    color: #444;
    cursor: pointer;
    padding: 10px;
    transition: color 0.3s ease, transform 0.2s ease;
`;
backBtn.addEventListener('mouseenter', () => { backBtn.style.color = '#aaa'; });
backBtn.addEventListener('mouseleave', () => { backBtn.style.color = '#444'; });
backBtn.addEventListener('click', () => {
    container.style.transition = 'opacity 0.4s ease';
    container.style.opacity = '0';
    setTimeout(() => {
        window.location.href = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent("Home")}`;
    }, 400);
});
container.appendChild(backBtn);

// ==========================================
// SELECT ALL / DESELECT ALL (top-right)
// ==========================================
const toggleAllBtn = document.createElement('div');
toggleAllBtn.textContent = 'All';
toggleAllBtn.style.cssText = `
    position: fixed;
    top: 140px;
    right: 20px;
    z-index: 10;
    color: #444;
    cursor: pointer;
    padding: 10px;
    font-family: "Courier New", monospace;
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    transition: color 0.3s ease;
`;
toggleAllBtn.addEventListener('mouseenter', () => { toggleAllBtn.style.color = '#aaa'; });
toggleAllBtn.addEventListener('mouseleave', () => { toggleAllBtn.style.color = '#444'; });
toggleAllBtn.addEventListener('click', () => {
    const allNodes = grid.querySelectorAll('.skill-selector-node');
    if (selectedSkills.size === selectableSkills.length) {
        // Deselect all
        selectedSkills.clear();
        allNodes.forEach(n => n.classList.remove('selected'));
    } else {
        // Select all
        selectableSkills.forEach(s => selectedSkills.add(s.id));
        allNodes.forEach(n => n.classList.add('selected'));
    }
    updateBeginButton();
});
container.appendChild(toggleAllBtn);

// ==========================================
// SETTINGS BUTTON (top-right, below All btn)
// ==========================================
const settingsBtn = document.createElement('div');
settingsBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;
settingsBtn.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    z-index: 10;
    color: #444;
    cursor: pointer;
    padding: 10px;
    transition: color 0.3s ease, transform 0.2s ease;
`;
settingsBtn.addEventListener('mouseenter', () => { settingsBtn.style.color = '#aaa'; });
settingsBtn.addEventListener('mouseleave', () => { settingsBtn.style.color = '#444'; });
settingsBtn.addEventListener('click', () => { openSelectorSettings(); });
container.appendChild(settingsBtn);

// ==========================================
// SETTINGS PANEL
// ==========================================
const settingsOverlay = document.createElement('div');
settingsOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    z-index: 10000;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
`;
container.appendChild(settingsOverlay);

const settingsPanel = document.createElement('div');
settingsPanel.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 320px;
    max-width: 90vw;
    height: 100vh;
    background: #0a0a0a;
    border-left: 1px solid #222;
    z-index: 10001;
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
`;
settingsPanel.innerHTML = `
    <div style="padding: 24px 20px; border-bottom: 1px solid #222; display: flex; align-items: center; justify-content: space-between;">
        <h3 style="margin: 0; color: #fff; font-size: 10px; font-family: 'Courier New', monospace; letter-spacing: 3px; text-transform: uppercase;">Settings</h3>
        <button id="selector-settings-close" style="background: transparent; border: 1px solid #333; color: #666; width: 28px; height: 28px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">×</button>
    </div>
    <div style="flex: 1; padding: 20px;">
        <div style="margin-bottom: 28px;">
            <div style="color: #555; font-size: 9px; font-family: 'Courier New', monospace; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid #1a1a1a;">Session Folder</div>
            <input type="text" id="selector-settings-folder"
                   placeholder="Path to session notes folder"
                   value="${settings.sessionFolder || 'Home/Starts/Drawing/Sessions'}"
                   style="width: 100%; padding: 12px 14px; background: #111; border: 1px solid #222; color: #fff; font-size: 13px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; outline: none; box-sizing: border-box; transition: all 0.3s ease;">
        </div>
        <div style="margin-bottom: 28px;">
            <div style="color: #555; font-size: 9px; font-family: 'Courier New', monospace; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid #1a1a1a;">Selector Title</div>
            <input type="text" id="selector-settings-title"
                   placeholder="Optional title (shown at top)"
                   value="${settings.selectorTitle || ''}"
                   style="width: 100%; padding: 12px 14px; background: #111; border: 1px solid #222; color: #fff; font-size: 13px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; outline: none; box-sizing: border-box; transition: all 0.3s ease;">
        </div>
    </div>
`;
container.appendChild(settingsPanel);

function openSelectorSettings() {
    settingsPanel.style.transform = 'translateX(0)';
    settingsOverlay.style.opacity = '1';
    settingsOverlay.style.pointerEvents = 'auto';
}

function closeSelectorSettings() {
    settingsPanel.style.transform = 'translateX(100%)';
    settingsOverlay.style.opacity = '0';
    settingsOverlay.style.pointerEvents = 'none';
}

function applySelectorSettings() {
    const folderInput = settingsPanel.querySelector('#selector-settings-folder');
    const titleInput = settingsPanel.querySelector('#selector-settings-title');

    settings.sessionFolder = folderInput.value.trim() || "Home/Starts/Drawing/Sessions";
    settings.selectorTitle = titleInput.value.trim();

    saveSettings(settings);

    // Update title display
    if (settings.selectorTitle) {
        title.textContent = settings.selectorTitle;
    } else {
        title.textContent = 'Select Skills';
    }
}

settingsOverlay.addEventListener('click', closeSelectorSettings);
settingsPanel.querySelector('#selector-settings-close').addEventListener('click', closeSelectorSettings);
settingsPanel.querySelector('#selector-settings-folder').addEventListener('change', applySelectorSettings);
settingsPanel.querySelector('#selector-settings-title').addEventListener('change', applySelectorSettings);

// Initialize title from settings
if (settings.selectorTitle) {
    title.textContent = settings.selectorTitle;
}

// ==========================================
// CLEANUP ON NOTE CHANGE
// ==========================================
// Remove container and effects when navigating away
const cleanupObserver = new MutationObserver(() => {
    if (!document.body.contains(container)) {
        // Container was removed from DOM (note changed)
        cleanupObserver.disconnect();
        // Remove any stray elements that might have escaped
        document.querySelectorAll('[data-skill-selector-effect]').forEach(el => el.remove());
    }
});
cleanupObserver.observe(document.body, { childList: true, subtree: true });
```
