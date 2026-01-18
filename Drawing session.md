---
editor-width: 100
cssclasses:
  - hide-properties
---

```dataviewjs
// ==========================================
// DRAWING SESSION - SKILL TREE MAP (AMOLED)
// ==========================================

const VAULT_NAME = "Alt society";

const THEME = {
    primary: "#ffffff",
    primaryGlow: "rgba(255, 255, 255, 0.6)",
    connection: "#3a5a7d",
    bg: "#000000"
};

// ==========================================
// GEOMETRIC MAP STRUCTURE
// ==========================================
// Hierarchical radial system with exact positions
// Level 0: Center, Level 1: 280px radius, Level 2: 450px, Level 3: 600px

const MAP_STRUCTURE = {
    // Center node - Level 0
    'core': {
        id: 'core',
        name: 'Core Basics',
        file: 'Drawing/Core Basics',
        level: 0,
        angle: 0,
        x: 0,
        y: 0,
        parent: null,
        children: ['line-form', 'observation', 'value-light', 'anatomy']
    },

    // Level 1 - Main branches (280px from center)
    'line-form': {
        id: 'line-form',
        name: 'Line & Form',
        file: 'Drawing/Line & Form',
        level: 1,
        angle: -90, // Top
        x: 0,
        y: -280,
        parent: 'core',
        children: ['basic-shapes', 'contour', 'geometric']
    },
    'observation': {
        id: 'observation',
        name: 'Observation',
        file: 'Drawing/Observation',
        level: 1,
        angle: 150, // Bottom-left
        x: -242,
        y: 140,
        parent: 'core',
        children: ['eye-obs', 'negative-space', 'perspective']
    },
    'value-light': {
        id: 'value-light',
        name: 'Value & Light',
        file: 'Drawing/Value & Light',
        level: 1,
        angle: 30, // Bottom-right
        x: 242,
        y: 140,
        parent: 'core',
        children: ['light-source', 'sphere-shading']
    },
    'anatomy': {
        id: 'anatomy',
        name: 'Anatomy Basics',
        file: 'Drawing/Anatomy Basics',
        level: 1,
        angle: 90, // Bottom
        x: 0,
        y: 280,
        parent: 'core',
        children: ['anatomy-basics-1', 'anatomy-basics-2']
    },

    // Level 2 - Secondary branches
    // Top branch
    'basic-shapes': {
        id: 'basic-shapes',
        name: 'Basic Shapes',
        file: 'Drawing/Basic Shapes',
        level: 2,
        angle: -120,
        x: -194,
        y: -417,
        parent: 'line-form',
        children: ['still-life', 'basic-shapes-2']
    },
    'contour': {
        id: 'contour',
        name: 'Contour Lines',
        file: 'Drawing/Contour Lines',
        level: 2,
        angle: -90,
        x: 0,
        y: -460,
        parent: 'line-form',
        children: ['contour-advanced']
    },
    'geometric': {
        id: 'geometric',
        name: 'Geometric Forms',
        file: 'Drawing/Geometric Forms',
        level: 2,
        angle: -60,
        x: 194,
        y: -417,
        parent: 'line-form',
        children: ['geometric-advanced']
    },

    // Left branch
    'eye-obs': {
        id: 'eye-obs',
        name: 'Eye',
        file: 'Drawing/Eye',
        level: 2,
        angle: 140,
        x: -389,
        y: 56,
        parent: 'observation',
        children: []
    },
    'negative-space': {
        id: 'negative-space',
        name: 'Negative Space',
        file: 'Drawing/Negative Space',
        level: 2,
        angle: 160,
        x: -415,
        y: 225,
        parent: 'observation',
        children: ['negative-space-adv']
    },
    'perspective': {
        id: 'perspective',
        name: 'Perspective Grids',
        file: 'Drawing/Perspective Grids',
        level: 2,
        angle: 180,
        x: -422,
        y: 140,
        parent: 'observation',
        children: ['cross-hatching']
    },

    // Right branch
    'light-source': {
        id: 'light-source',
        name: 'Light Source',
        file: 'Drawing/Light Source',
        level: 2,
        angle: 20,
        x: 415,
        y: 40,
        parent: 'value-light',
        children: ['light-source-adv']
    },
    'sphere-shading': {
        id: 'sphere-shading',
        name: 'Sphere Shading',
        file: 'Drawing/Sphere Shading',
        level: 2,
        angle: 40,
        x: 389,
        y: 225,
        parent: 'value-light',
        children: ['cast-shadows']
    },

    // Level 3 - Tertiary branches
    'still-life': {
        id: 'still-life',
        name: 'Still Life',
        file: 'Drawing/Still Life',
        level: 3,
        angle: -140,
        x: -340,
        y: -520,
        parent: 'basic-shapes',
        children: []
    },
    'basic-shapes-2': {
        id: 'basic-shapes-2',
        name: 'Basic Shapes II',
        file: 'Drawing/Basic Shapes II',
        level: 3,
        angle: -100,
        x: -100,
        y: -550,
        parent: 'basic-shapes',
        children: []
    },
    'cross-hatching': {
        id: 'cross-hatching',
        name: 'Cross-Hatching',
        file: 'Drawing/Cross-Hatching',
        level: 3,
        angle: 200,
        x: -560,
        y: 240,
        parent: 'perspective',
        children: []
    },
    'cast-shadows': {
        id: 'cast-shadows',
        name: 'Cast Shadows',
        file: 'Drawing/Cast Shadows',
        level: 3,
        angle: 50,
        x: 520,
        y: 300,
        parent: 'sphere-shading',
        children: []
    },
    'anatomy-basics-1': {
        id: 'anatomy-basics-1',
        name: 'Anatomy I',
        file: 'Drawing/Anatomy I',
        level: 3,
        angle: 75,
        x: 260,
        y: 470,
        parent: 'anatomy',
        children: []
    },
    'anatomy-basics-2': {
        id: 'anatomy-basics-2',
        name: 'Anatomy II',
        file: 'Drawing/Anatomy II',
        level: 3,
        angle: 105,
        x: -260,
        y: 470,
        parent: 'anatomy',
        children: []
    }
};

// Algorithmic placement system
const LEVEL_RADII = [0, 280, 450, 600, 750, 900]; // Distance for each level
const ANGLE_SPREAD = 35; // Degrees between children

function calculateNewNodePosition(parentId) {
    const parent = MAP_STRUCTURE[parentId];
    if (!parent) return null;

    const childCount = parent.children.length;
    const level = parent.level + 1;
    const baseRadius = LEVEL_RADII[level] || (level * 150);

    // Calculate angle based on existing children
    const existingAngles = parent.children.map(childId => MAP_STRUCTURE[childId]?.angle || 0);
    let newAngle = parent.angle;

    if (childCount > 0) {
        // Spread children evenly around parent
        const angleStep = ANGLE_SPREAD;
        const startOffset = -(childCount * angleStep) / 2;
        newAngle = parent.angle + startOffset + (childCount * angleStep);
    }

    const angleRad = (newAngle * Math.PI) / 180;
    const x = parent.x + Math.cos(angleRad) * baseRadius;
    const y = parent.y + Math.sin(angleRad) * baseRadius;

    return { x, y, angle: newAngle, level };
}

// Load saved customizations
let customNodes = {};
try {
    const saved = localStorage.getItem('skillTreeCustom');
    if (saved) {
        customNodes = JSON.parse(saved);
    }
} catch(e) {
    console.log('No custom nodes');
}

function saveCustomNodes() {
    try {
        localStorage.setItem('skillTreeCustom', JSON.stringify(customNodes));
    } catch(e) {
        console.error('Failed to save');
    }
}

// ==========================================
// GLOBAL STYLES
// ==========================================
if (!document.getElementById('drawing-session-styles')) {
    const style = document.createElement('style');
    style.id = 'drawing-session-styles';
    style.textContent = `
        * {
            -webkit-tap-highlight-color: transparent;
        }

        body {
            background: ${THEME.bg};
        }

        @keyframes fade-in {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
        }

        .skill-tree-canvas {
            cursor: grab;
            touch-action: none;
        }

        .skill-tree-canvas:active {
            cursor: grabbing;
        }

        .skill-action-menu {
            position: fixed;
            display: flex;
            gap: 15px;
            z-index: 10000;
            animation: fade-in 0.2s ease;
            pointer-events: all;
        }

        .skill-action-btn {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: ${THEME.primary};
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform 0.1s ease;
            box-shadow: 0 0 20px ${THEME.primaryGlow};
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
        }

        .skill-action-btn:active {
            transform: scale(0.85);
        }
    `;
    document.head.appendChild(style);
}

// ==========================================
// MAIN CONTAINER
// ==========================================
const mainContainer = dv.el("div", "");
mainContainer.style.cssText = `
    width: 100%;
    height: 100vh;
    background: ${THEME.bg};
    position: fixed;
    top: 0;
    left: 0;
    overflow: hidden;
    margin: 0;
    padding: 0;
`;

// ==========================================
// CANVAS
// ==========================================
const canvas = document.createElement('canvas');
canvas.className = 'skill-tree-canvas';
canvas.width = 2400;
canvas.height = 2400;
canvas.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform-origin: center;
`;
mainContainer.appendChild(canvas);

const ctx = canvas.getContext('2d');

// State
let pan = { x: 0, y: 0 };
let zoom = 0.5;
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let holdTimer = null;
let touchDistance = 0;
let lastTouchPosition = { x: 0, y: 0 };
let activeMenu = null;
let touchStartTime = 0;
let touchMoved = false;

function updateCanvasTransform() {
    canvas.style.transform = `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;
}

updateCanvasTransform();

// ==========================================
// DRAWING FUNCTIONS
// ==========================================
function drawCurvedLine(x1, y1, x2, y2) {
    // Calculate control point for curved line
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    // Create curve that bends away from center
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Perpendicular offset for curve
    const offsetX = -dy * 0.15;
    const offsetY = dx * 0.15;

    const cpX = midX + offsetX;
    const cpY = midY + offsetY;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(cpX, cpY, x2, y2);
    ctx.stroke();
}

function drawSkillTree() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw connections with curved lines
    ctx.strokeStyle = THEME.connection;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 5;
    ctx.shadowColor = THEME.connection;

    Object.values(MAP_STRUCTURE).forEach(skill => {
        if (skill.parent) {
            const parent = MAP_STRUCTURE[skill.parent];
            if (parent) {
                drawCurvedLine(
                    centerX + parent.x,
                    centerY + parent.y,
                    centerX + skill.x,
                    centerY + skill.y
                );
            }
        }
    });

    ctx.shadowBlur = 0;

    // Draw nodes
    Object.values(MAP_STRUCTURE).forEach(skill => {
        const isCenter = skill.level === 0;
        drawSkill(centerX + skill.x, centerY + skill.y, skill, isCenter);
    });
}

function drawSkill(x, y, skill, isCenter) {
    const radius = isCenter ? 60 : 45;

    // Outer glow
    ctx.shadowBlur = isCenter ? 25 : 15;
    ctx.shadowColor = THEME.primaryGlow;

    // White circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = THEME.primary;
    ctx.fill();

    ctx.shadowBlur = 0;

    // Icon
    ctx.fillStyle = THEME.bg;
    ctx.font = `${isCenter ? 28 : 22}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎨', x, y - 3);

    // Label
    ctx.fillStyle = THEME.primary;
    ctx.font = `${isCenter ? 12 : 10}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const words = skill.name.split(' ');
    const maxWidth = 3;
    let lines = [];
    let currentLine = '';

    words.forEach((word, i) => {
        if (currentLine.length + word.length <= maxWidth || currentLine === '') {
            currentLine = currentLine ? currentLine + ' ' + word : word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
        if (i === words.length - 1) {
            lines.push(currentLine);
        }
    });

    lines.forEach((line, i) => {
        ctx.fillText(line, x, y + radius + 12 + (i * 13));
    });
}

drawSkillTree();

// ==========================================
// INTERACTION HANDLERS
// ==========================================
function removeActionMenu() {
    if (activeMenu) {
        activeMenu.remove();
        activeMenu = null;
    }
    drawSkillTree();
}

function getSkillAtPosition(x, y) {
    for (let skill of Object.values(MAP_STRUCTURE)) {
        const dx = x - skill.x;
        const dy = y - skill.y;
        const dist = Math.sqrt(dx ** 2 + dy ** 2);
        const radius = skill.level === 0 ? 60 : 45;
        if (dist < radius) return skill;
    }
    return null;
}

// Mouse events
canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();
    removeActionMenu();

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2 - pan.x) / zoom;
    const y = (e.clientY - rect.top - rect.height / 2 - pan.y) / zoom;

    const clicked = getSkillAtPosition(x, y);

    if (clicked) {
        holdTimer = setTimeout(() => {
            if (!isDragging) {
                showSkillActions(clicked, e.clientX, e.clientY);
            }
        }, 500);
    } else {
        isDragging = true;
        dragStart = { x: e.clientX - pan.x, y: e.clientY - pan.y };
        canvas.style.cursor = 'grabbing';
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        pan.x = e.clientX - dragStart.x;
        pan.y = e.clientY - dragStart.y;
        updateCanvasTransform();

        if (holdTimer) {
            clearTimeout(holdTimer);
            holdTimer = null;
        }
    }
});

canvas.addEventListener('mouseup', (e) => {
    const wasDragging = isDragging;
    isDragging = false;
    canvas.style.cursor = 'grab';

    if (holdTimer) {
        clearTimeout(holdTimer);
        holdTimer = null;

        if (!wasDragging) {
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2 - pan.x) / zoom;
            const y = (e.clientY - rect.top - rect.height / 2 - pan.y) / zoom;
            const clicked = getSkillAtPosition(x, y);

            if (clicked) {
                openSkillFile(clicked);
            }
        }
    }
});

canvas.addEventListener('mouseleave', () => {
    isDragging = false;
    canvas.style.cursor = 'grab';
    if (holdTimer) {
        clearTimeout(holdTimer);
        holdTimer = null;
    }
});

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    zoom = Math.max(0.3, Math.min(2, zoom * delta));
    updateCanvasTransform();
});

// Touch events
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    removeActionMenu();

    touchStartTime = Date.now();
    touchMoved = false;

    if (e.touches.length === 1) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = (touch.clientX - rect.left - rect.width / 2 - pan.x) / zoom;
        const y = (touch.clientY - rect.top - rect.height / 2 - pan.y) / zoom;

        const clicked = getSkillAtPosition(x, y);

        if (clicked) {
            holdTimer = setTimeout(() => {
                if (!touchMoved) {
                    showSkillActions(clicked, touch.clientX, touch.clientY);
                }
            }, 500);
        } else {
            isDragging = true;
            dragStart = { x: touch.clientX - pan.x, y: touch.clientY - pan.y };
        }

        lastTouchPosition = { x: touch.clientX, y: touch.clientY };
    } else if (e.touches.length === 2) {
        isDragging = false;
        if (holdTimer) {
            clearTimeout(holdTimer);
            holdTimer = null;
        }

        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        touchDistance = Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );

        lastTouchPosition = {
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2
        };
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    touchMoved = true;

    if (e.touches.length === 1 && isDragging) {
        const touch = e.touches[0];
        pan.x = touch.clientX - dragStart.x;
        pan.y = touch.clientY - dragStart.y;
        updateCanvasTransform();

        if (holdTimer) {
            clearTimeout(holdTimer);
            holdTimer = null;
        }
    } else if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        const newDistance = Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );

        const newCenter = {
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2
        };

        if (touchDistance > 0) {
            const zoomDelta = newDistance / touchDistance;
            zoom = Math.max(0.3, Math.min(2, zoom * zoomDelta));
        }

        pan.x += newCenter.x - lastTouchPosition.x;
        pan.y += newCenter.y - lastTouchPosition.y;

        touchDistance = newDistance;
        lastTouchPosition = newCenter;
        updateCanvasTransform();
    }
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();

    if (e.touches.length === 0) {
        const touchDuration = Date.now() - touchStartTime;
        isDragging = false;
        touchDistance = 0;

        if (holdTimer) {
            clearTimeout(holdTimer);
            holdTimer = null;

            if (!touchMoved && touchDuration < 300 && e.changedTouches.length > 0) {
                const touch = e.changedTouches[0];
                const rect = canvas.getBoundingClientRect();
                const x = (touch.clientX - rect.left - rect.width / 2 - pan.x) / zoom;
                const y = (touch.clientY - rect.top - rect.height / 2 - pan.y) / zoom;
                const clicked = getSkillAtPosition(x, y);

                if (clicked) {
                    openSkillFile(clicked);
                }
            }
        }
    }
});

function openSkillFile(skill) {
    const fileName = skill.file || `Drawing/${skill.name}`;
    window.location.href = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent(fileName)}`;
}

// ==========================================
// SKILL ACTIONS
// ==========================================
function showSkillActions(skill, clientX, clientY) {
    removeActionMenu();

    const actionMenu = document.createElement('div');
    actionMenu.className = 'skill-action-menu';
    actionMenu.style.left = clientX + 'px';
    actionMenu.style.top = (clientY - 80) + 'px';

    // Edit button
    const editBtn = createActionButton('✏️', () => {
        removeActionMenu();
        showEditModal(skill);
    });
    actionMenu.appendChild(editBtn);

    // Add button (only if has children array)
    if (skill.children) {
        const addBtn = createActionButton('➕', () => {
            removeActionMenu();
            addNewSkill(skill);
        });
        actionMenu.appendChild(addBtn);
    }

    document.body.appendChild(actionMenu);
    activeMenu = actionMenu;

    // Glow effect
    const centerX = canvas.width / 2 + skill.x;
    const centerY = canvas.height / 2 + skill.y;
    const radius = skill.level === 0 ? 60 : 45;

    ctx.save();
    ctx.shadowBlur = 30;
    ctx.shadowColor = THEME.primary;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 10, 0, Math.PI * 2);
    ctx.strokeStyle = THEME.primary;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    setTimeout(() => {
        const removeOnClick = (e) => {
            if (activeMenu && !actionMenu.contains(e.target) && e.target !== canvas) {
                removeActionMenu();
                document.removeEventListener('click', removeOnClick);
                document.removeEventListener('touchstart', removeOnClick);
            }
        };
        document.addEventListener('click', removeOnClick);
        document.addEventListener('touchstart', removeOnClick);
    }, 100);
}

function createActionButton(icon, onClick) {
    const btn = document.createElement('div');
    btn.className = 'skill-action-btn';
    btn.innerHTML = `<div style="font-size: 28px;">${icon}</div>`;

    const handler = (e) => {
        e.stopPropagation();
        e.preventDefault();
        onClick();
    };

    btn.addEventListener('click', handler);
    btn.addEventListener('touchend', handler);

    return btn;
}

// ==========================================
// EDIT MODAL
// ==========================================
function showEditModal(skill) {
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
        z-index: 10001;
        animation: fade-in 0.2s ease;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
        background: #111111;
        border: 2px solid ${THEME.primary};
        padding: 25px;
        max-width: 350px;
        width: 85%;
        border-radius: 8px;
    `;
    modal.appendChild(content);

    const title = document.createElement('h2');
    title.textContent = 'EDIT SKILL';
    title.style.cssText = `
        margin: 0 0 20px 0;
        color: ${THEME.primary};
        font-size: 16px;
        text-align: center;
    `;
    content.appendChild(title);

    const nameLabel = document.createElement('div');
    nameLabel.textContent = 'Name:';
    nameLabel.style.cssText = `color: ${THEME.primary}; font-size: 11px; margin-bottom: 5px;`;
    content.appendChild(nameLabel);

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = skill.name;
    nameInput.style.cssText = `
        width: 100%;
        padding: 10px;
        background: #000000;
        border: 1px solid #333333;
        color: ${THEME.primary};
        font-size: 14px;
        margin-bottom: 15px;
        border-radius: 5px;
    `;
    content.appendChild(nameInput);

    const fileLabel = document.createElement('div');
    fileLabel.textContent = 'File:';
    fileLabel.style.cssText = `color: ${THEME.primary}; font-size: 11px; margin-bottom: 5px;`;
    content.appendChild(fileLabel);

    const fileInput = document.createElement('input');
    fileInput.type = 'text';
    fileInput.value = skill.file || `Drawing/${skill.name}`;
    fileInput.style.cssText = `
        width: 100%;
        padding: 10px;
        background: #000000;
        border: 1px solid #333333;
        color: ${THEME.primary};
        font-size: 14px;
        margin-bottom: 20px;
        border-radius: 5px;
    `;
    content.appendChild(fileInput);

    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = `display: flex; gap: 10px; justify-content: center;`;
    content.appendChild(btnContainer);

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'SAVE';
    saveBtn.style.cssText = `
        padding: 10px 20px;
        background: ${THEME.primary};
        border: none;
        color: ${THEME.bg};
        font-size: 12px;
        font-weight: bold;
        border-radius: 5px;
        cursor: pointer;
    `;
    saveBtn.onclick = () => {
        skill.name = nameInput.value;
        skill.file = fileInput.value;
        customNodes[skill.id] = { name: skill.name, file: skill.file };
        saveCustomNodes();
        drawSkillTree();
        modal.remove();
    };
    btnContainer.appendChild(saveBtn);

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'CANCEL';
    cancelBtn.style.cssText = `
        padding: 10px 20px;
        background: transparent;
        border: 1px solid #333333;
        color: ${THEME.primary};
        font-size: 12px;
        font-weight: bold;
        border-radius: 5px;
        cursor: pointer;
    `;
    cancelBtn.onclick = () => modal.remove();
    btnContainer.appendChild(cancelBtn);

    document.body.appendChild(modal);
}

// ==========================================
// ADD NEW SKILL
// ==========================================
function addNewSkill(parent) {
    const name = prompt('Enter skill name:');
    if (!name) return;

    const position = calculateNewNodePosition(parent.id);
    if (!position) return;

    const newId = `custom-${Date.now()}`;
    const newSkill = {
        id: newId,
        name: name,
        file: `Drawing/${name}`,
        level: position.level,
        angle: position.angle,
        x: position.x,
        y: position.y,
        parent: parent.id,
        children: []
    };

    MAP_STRUCTURE[newId] = newSkill;
    parent.children.push(newId);

    customNodes[newId] = newSkill;
    saveCustomNodes();
    drawSkillTree();
}

// ==========================================
// ZOOM CONTROLS
// ==========================================
const controls = document.createElement('div');
controls.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 100;
`;

function createControlBtn(text, onClick) {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.style.cssText = `
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: ${THEME.primary};
        border: none;
        color: ${THEME.bg};
        font-size: 22px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 0 15px ${THEME.primaryGlow};
    `;
    btn.onclick = onClick;
    btn.ontouchend = (e) => {
        e.preventDefault();
        onClick();
    };
    return btn;
}

controls.appendChild(createControlBtn('+', () => {
    zoom = Math.min(2, zoom * 1.2);
    updateCanvasTransform();
}));

controls.appendChild(createControlBtn('-', () => {
    zoom = Math.max(0.3, zoom * 0.8);
    updateCanvasTransform();
}));

controls.appendChild(createControlBtn('⟲', () => {
    pan = { x: 0, y: 0 };
    zoom = 0.5;
    updateCanvasTransform();
}));

mainContainer.appendChild(controls);
```
