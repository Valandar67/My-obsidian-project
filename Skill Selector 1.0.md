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
        layoutStyle: "radial"
    };
}

const settings = loadSettings();

// Folder where daily session notes are created
const SESSION_FOLDER = "Home/Starts/Drawing/Sessions";

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

        @keyframes transcend-flash {
            0% { opacity: 0; }
            30% { opacity: 1; }
            100% { opacity: 1; }
        }

        @keyframes transcend-expand {
            0% { transform: scale(0.8); opacity: 0; }
            50% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(3); opacity: 0; }
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

    // SVG icon
    const iconData = ICONS[skill.icon] || ICONS.default;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', iconData.viewBox);
    svg.setAttribute('width', '28');
    svg.setAttribute('height', '28');
    svg.style.cssText = `color: #555; transition: all 0.3s ease;`;
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

    // === TRANSCEND FLASH EFFECT ===
    const flashOverlay = document.createElement('div');
    flashOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 99999;
        pointer-events: none;
        background: radial-gradient(ellipse at center,
            rgba(255, 255, 255, 1) 0%,
            rgba(220, 230, 255, 0.95) 30%,
            rgba(180, 200, 255, 0.8) 60%,
            rgba(100, 140, 200, 0.4) 100%);
        opacity: 0;
        animation: transcend-flash 0.7s ease-in forwards;
    `;
    document.body.appendChild(flashOverlay);

    // Radial light burst from center
    const burst = document.createElement('div');
    burst.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        width: 100px;
        height: 100px;
        margin: -50px 0 0 -50px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255,255,255,1) 0%, transparent 70%);
        z-index: 100000;
        pointer-events: none;
        animation: transcend-expand 0.8s ease-out forwards;
    `;
    document.body.appendChild(burst);

    // Fade out skill nodes
    grid.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    grid.style.opacity = '0';
    grid.style.transform = 'scale(1.05)';
    title.style.transition = 'opacity 0.3s ease';
    title.style.opacity = '0';
    btnContainer.style.transition = 'opacity 0.3s ease';
    btnContainer.style.opacity = '0';

    // Build note content while the effect plays
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '').substring(0, 4); // HHMM
    const fileName = `Session ${dateStr} ${timeStr}`;
    const filePath = `${SESSION_FOLDER}/${fileName}`;

    // Build the note content with selected skills as |scroll embeds
    const selectedList = [...selectedSkills];
    let noteContent = `---\ndate: ${dateStr}\ntype: session\nskills:\n`;
    selectedList.forEach(skillName => {
        noteContent += `  - "${skillName}"\n`;
    });
    noteContent += `---\n\n`;

    // Add each selected skill as a scroll embed
    selectedList.forEach(skillName => {
        noteContent += `![[${skillName}|scroll]]\n\n`;
    });

    // Create the session folder if it doesn't exist, then create the note
    try {
        const folderExists = app.vault.getAbstractFileByPath(SESSION_FOLDER);
        if (!folderExists) {
            await app.vault.createFolder(SESSION_FOLDER);
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
            // Navigate after flash completes
            setTimeout(() => {
                window.location.href = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent(altPath)}`;
            }, 700);
        } else {
            await app.vault.create(filePath + '.md', noteContent);
            setTimeout(() => {
                window.location.href = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent(filePath)}`;
            }, 700);
        }
    } catch (err) {
        console.error('[SkillSelector] Failed to create session note:', err);
        // Clean up flash on error
        flashOverlay.remove();
        burst.remove();
        beginBtn.style.pointerEvents = '';
        beginBtn.style.opacity = '';
        grid.style.opacity = '1';
        grid.style.transform = '';
        title.style.opacity = '0.5';
        btnContainer.style.opacity = '1';
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
    top: 20px;
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
```
