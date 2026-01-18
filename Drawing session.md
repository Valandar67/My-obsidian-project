---
editor-width: 100
cssclasses:
  - hide-properties
---

```dataviewjs
// ==========================================
// DRAWING SESSION - SKILL TREE EDITION
// ==========================================

const VAULT_NAME = "Alt society";

const THEME = {
    primary: "#ffffff",
    primaryGlow: "rgba(255, 255, 255, 0.8)",
    secondary: "#3a7a9e",
    accent: "#5a9ace",
    border: "#2a3a4d",
    borderHover: "#3a5a7d",
    muted: "#7a8a9d",
    bg: "#1a1d2e",
    bgLight: "#252838",
    bgCard: "#2a2d3e",
    connection: "#3a5a7d"
};

// ==========================================
// SESSION DATA STORAGE
// ==========================================
let sessionData = {
    totalMileage: 0,
    thisWeek: 0,
    lastSession: null,
    currentStreak: 0
};

// Try to load from localStorage
try {
    const saved = localStorage.getItem('drawingSessionData');
    if (saved) {
        sessionData = JSON.parse(saved);
    }
} catch(e) {
    console.log('No saved session data');
}

function saveSessionData() {
    try {
        localStorage.setItem('drawingSessionData', JSON.stringify(sessionData));
    } catch(e) {
        console.error('Failed to save session data');
    }
}

// ==========================================
// SKILL TREE DATA
// ==========================================
let skillTree = {
    center: {
        id: 'core',
        name: 'Core Basics',
        image: 'pencil',
        x: 0,
        y: 0,
        connections: ['line-form', 'observation', 'value-light']
    },
    skills: [
        // TOP BRANCH - Line & Form
        { id: 'line-form', name: 'Line & Form', image: 'pyramid', x: 0, y: -280, connections: ['basic-shapes-1', 'contour', 'geometric'] },
        { id: 'basic-shapes-1', name: 'Basic Shapes', image: 'shapes', x: -180, y: -420, connections: ['still-life'] },
        { id: 'still-life', name: 'Still Life', image: 'apple', x: -280, y: -560, connections: [] },
        { id: 'contour', name: 'Contour Lines', image: 'contour', x: 0, y: -450, connections: [] },
        { id: 'geometric', name: 'Geometric Forms', image: 'cube', x: 180, y: -420, connections: [] },

        // LEFT BRANCH - Observation
        { id: 'observation', name: 'Observation', image: 'eye', x: -320, y: -80, connections: ['negative-space', 'perspective'] },
        { id: 'negative-space', name: 'Negative Space', image: 'negative', x: -480, y: -220, connections: [] },
        { id: 'perspective', name: 'Perspective Grids', image: 'grid', x: -480, y: 60, connections: ['cross-hatching'] },
        { id: 'cross-hatching', name: 'Cross-Hatching', image: 'hatch', x: -380, y: 180, connections: [] },

        // RIGHT BRANCH - Value & Light
        { id: 'value-light', name: 'Value & Light', image: 'gradient', x: 320, y: -80, connections: ['light-source', 'sphere-shading'] },
        { id: 'light-source', name: 'Light Source', image: 'bulb', x: 480, y: -220, connections: [] },
        { id: 'sphere-shading', name: 'Sphere Shading', image: 'sphere', x: 480, y: 60, connections: ['cast-shadows'] },
        { id: 'cast-shadows', name: 'Cast Shadows', image: 'shadow', x: 380, y: 180, connections: [] },

        // BOTTOM BRANCH - Anatomy
        { id: 'anatomy', name: 'Anatomy Basics', image: 'body', x: 0, y: 280, connections: [] }
    ]
};

// Try to load from localStorage
try {
    const saved = localStorage.getItem('skillTreeData');
    if (saved) {
        skillTree = JSON.parse(saved);
    }
} catch(e) {
    console.log('Using default skill tree');
}

function saveSkillTree() {
    try {
        localStorage.setItem('skillTreeData', JSON.stringify(skillTree));
    } catch(e) {
        console.error('Failed to save skill tree');
    }
}

// ==========================================
// GLOBAL STYLES
// ==========================================
if (!document.getElementById('drawing-session-styles')) {
    const style = document.createElement('style');
    style.id = 'drawing-session-styles';
    style.textContent = `
        .drawing-no-drag {
            pointer-events: none !important;
            user-select: none !important;
            -webkit-user-select: none !important;
            -webkit-user-drag: none !important;
        }

        @keyframes glow-pulse {
            0%, 100% {
                box-shadow: 0 0 10px ${THEME.primary}, 0 0 20px ${THEME.primary}, 0 0 30px ${THEME.primary};
                filter: brightness(1.2);
            }
            50% {
                box-shadow: 0 0 20px ${THEME.primaryHover}, 0 0 40px ${THEME.primaryHover}, 0 0 60px ${THEME.primaryHover};
                filter: brightness(1.5);
            }
        }

        @keyframes blood-drip {
            0% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(100px); opacity: 0; }
        }

        @keyframes fade-in {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
        }

        .skill-tree-canvas {
            cursor: grab;
        }

        .skill-tree-canvas:active {
            cursor: grabbing;
        }

        .decorative-skull {
            position: absolute;
            opacity: 0.15;
            pointer-events: none;
            filter: grayscale(1) contrast(1.2);
            mix-blend-mode: overlay;
        }
    `;
    document.head.appendChild(style);
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
function createCorners(container, color, size = 18) {
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
            border-${isTop ? 'top' : 'bottom'}: 2px solid ${color};
            border-${isLeft ? 'left' : 'right'}: 2px solid ${color};
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
}

function loadDecorativeImage(imageName, onLoad, onError) {
    const img = new Image();
    img.onload = () => onLoad(img);
    img.onerror = () => onError(imageName);
    img.src = app.vault.adapter.getResourcePath(`Obsidian/Images/${imageName}.jpg`);
}

// ==========================================
// MAIN CONTAINER
// ==========================================
const mainContainer = dv.el("div", "");
mainContainer.style.cssText = `
    width: 100%;
    min-height: 100vh;
    background: ${THEME.bg};
    position: relative;
    overflow: hidden;
    padding: 20px;
`;

// ==========================================
// DECORATIVE IMAGES
// ==========================================
function addDecorativeImage(name, styles) {
    loadDecorativeImage(name,
        (img) => {
            const decorative = document.createElement('img');
            decorative.src = img.src;
            decorative.className = 'decorative-skull drawing-no-drag';
            decorative.style.cssText += styles;
            mainContainer.appendChild(decorative);
        },
        (imageName) => {
            const errorMsg = document.createElement('div');
            errorMsg.textContent = `"${imageName}" image is not found`;
            errorMsg.style.cssText = `
                ${styles}
                color: ${THEME.muted};
                font-size: 10px;
                font-family: monospace;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
            `;
            mainContainer.appendChild(errorMsg);
        }
    );
}

// Add decorative images
addDecorativeImage('skull-left', `top: 50px; left: -80px; width: 300px; height: 300px; transform: rotate(-15deg);`);
addDecorativeImage('skull-right', `bottom: 50px; right: -80px; width: 300px; height: 300px; transform: rotate(15deg);`);

// ==========================================
// HEADER - SESSION STATS
// ==========================================
const statsContainer = document.createElement('div');
statsContainer.style.cssText = `
    max-width: 1200px;
    margin: 0 auto 30px auto;
    background: linear-gradient(135deg, ${THEME.bgCard} 0%, ${THEME.bgLight} 100%);
    border: 2px solid ${THEME.border};
    padding: 30px;
    position: relative;
    box-shadow: 0 0 30px rgba(139, 0, 0, 0.3);
`;

createCorners(statsContainer, THEME.primary, 25);

// Title
const title = document.createElement('h1');
title.textContent = 'DRAWING FUNDAMENTALS';
title.style.cssText = `
    margin: 0 0 25px 0;
    color: ${THEME.primary};
    font-size: 28px;
    font-weight: 700;
    font-family: "Arial", sans-serif;
    letter-spacing: 6px;
    text-align: center;
    text-transform: uppercase;
    text-shadow: 0 0 15px ${THEME.primaryGlow};
`;
statsContainer.appendChild(title);

// Stats grid
const statsGrid = document.createElement('div');
statsGrid.style.cssText = `
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    padding: 20px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid ${THEME.border};
    position: relative;
`;
statsContainer.appendChild(statsGrid);

function createStatBox(label, value, icon) {
    const box = document.createElement('div');
    box.style.cssText = `
        text-align: center;
        padding: 15px;
        background: ${THEME.bgLight};
        border: 1px solid ${THEME.border};
        position: relative;
        transition: all 0.3s ease;
    `;

    const iconEl = document.createElement('div');
    iconEl.textContent = icon;
    iconEl.style.cssText = `
        font-size: 32px;
        margin-bottom: 10px;
        filter: grayscale(0.3);
    `;
    box.appendChild(iconEl);

    const valueEl = document.createElement('div');
    valueEl.textContent = value;
    valueEl.style.cssText = `
        font-size: 32px;
        font-weight: bold;
        color: ${THEME.primary};
        font-family: "Arial", sans-serif;
        margin-bottom: 5px;
        text-shadow: 0 0 10px ${THEME.primaryGlow};
    `;
    box.appendChild(valueEl);

    const labelEl = document.createElement('div');
    labelEl.textContent = label;
    labelEl.style.cssText = `
        font-size: 11px;
        color: ${THEME.muted};
        font-family: "Arial", sans-serif;
        letter-spacing: 2px;
        text-transform: uppercase;
    `;
    box.appendChild(labelEl);

    box.onmouseenter = () => {
        box.style.borderColor = THEME.accent;
        box.style.transform = 'translateY(-3px)';
        box.style.boxShadow = `0 5px 15px ${THEME.accent}`;
    };

    box.onmouseleave = () => {
        box.style.borderColor = THEME.border;
        box.style.transform = 'translateY(0)';
        box.style.boxShadow = 'none';
    };

    return box;
}

statsGrid.appendChild(createStatBox('TOTAL MILEAGE', `${sessionData.totalMileage}h`, '🎨'));
statsGrid.appendChild(createStatBox('THIS WEEK', `${sessionData.thisWeek}h`, '📅'));
statsGrid.appendChild(createStatBox('LAST SESSION', sessionData.lastSession || 'Never', '⏱️'));
statsGrid.appendChild(createStatBox('STREAK', `${sessionData.currentStreak} days`, '🔥'));

mainContainer.appendChild(statsContainer);

// ==========================================
// START SESSION SECTION (UNSCROLLABLE)
// ==========================================
const startSessionContainer = document.createElement('div');
startSessionContainer.style.cssText = `
    max-width: 600px;
    margin: 0 auto 40px auto;
    background: ${THEME.bgCard};
    border: 2px solid ${THEME.border};
    position: relative;
    overflow: hidden;
    height: 200px;
`;

createCorners(startSessionContainer, THEME.primary, 20);

// Fixed content (no scroll)
const fixedContent = document.createElement('div');
fixedContent.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px;
`;
startSessionContainer.appendChild(fixedContent);

const sessionTitle = document.createElement('h2');
sessionTitle.textContent = 'START SESSION';
sessionTitle.style.cssText = `
    margin: 0 0 20px 0;
    color: ${THEME.primary};
    font-size: 20px;
    font-weight: 700;
    font-family: "Arial", sans-serif;
    letter-spacing: 4px;
    text-shadow: 0 0 15px ${THEME.primaryGlow};
`;
fixedContent.appendChild(sessionTitle);

// Start button
const startBtn = document.createElement('button');
startBtn.textContent = 'BEGIN';
startBtn.style.cssText = `
    padding: 15px 50px;
    background: ${THEME.primary};
    border: 2px solid ${THEME.accent};
    color: ${THEME.bg};
    font-size: 18px;
    font-weight: bold;
    font-family: "Arial", sans-serif;
    letter-spacing: 3px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    border-radius: 50px;
    box-shadow: 0 0 20px ${THEME.primaryGlow};
`;

startBtn.onmouseenter = () => {
    startBtn.style.transform = 'scale(1.1)';
    startBtn.style.boxShadow = `0 0 30px ${THEME.primary}`;
    startBtn.style.borderColor = THEME.accent;
};

startBtn.onmouseleave = () => {
    startBtn.style.transform = 'scale(1)';
    startBtn.style.boxShadow = `0 0 20px ${THEME.primaryGlow}`;
    startBtn.style.borderColor = THEME.accent;
};

startBtn.onclick = () => {
    const now = new Date();
    const hours = prompt('Enter session duration (hours):');
    if (hours && !isNaN(hours)) {
        sessionData.totalMileage += parseFloat(hours);
        sessionData.thisWeek += parseFloat(hours);
        sessionData.lastSession = now.toLocaleDateString();
        sessionData.currentStreak += 1;
        saveSessionData();
        location.reload();
    }
};

fixedContent.appendChild(startBtn);

mainContainer.appendChild(startSessionContainer);

// ==========================================
// SKILL TREE CANVAS
// ==========================================
const skillTreeSection = document.createElement('div');
skillTreeSection.style.cssText = `
    max-width: 1400px;
    margin: 0 auto;
    background: ${THEME.bgCard};
    border: 2px solid ${THEME.border};
    position: relative;
    height: 800px;
    overflow: hidden;
    box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.8);
`;

createCorners(skillTreeSection, THEME.primary, 25);

const canvas = document.createElement('canvas');
canvas.className = 'skill-tree-canvas';
canvas.width = 2000;
canvas.height = 2000;
canvas.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform-origin: center;
`;
skillTreeSection.appendChild(canvas);

const ctx = canvas.getContext('2d');

// Pan and zoom state
let pan = { x: 0, y: 0 };
let zoom = 0.5;
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let holdTimer = null;
let holdingSkill = null;
let touchDistance = 0;
let lastTouchPosition = { x: 0, y: 0 };

// Update canvas transform
function updateCanvasTransform() {
    canvas.style.transform = `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;
}

updateCanvasTransform();

// ==========================================
// SKILL TREE RENDERING
// ==========================================
function drawSkillTree() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw connections first (glowing blue lines)
    ctx.strokeStyle = THEME.connection;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 8;
    ctx.shadowColor = THEME.accent;

    // Draw connections from center
    skillTree.center.connections.forEach(targetId => {
        const target = skillTree.skills.find(s => s.id === targetId);
        if (target) {
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + target.x, centerY + target.y);
            ctx.stroke();
        }
    });

    // Draw connections between skills
    skillTree.skills.forEach(skill => {
        skill.connections.forEach(targetId => {
            const target = skillTree.skills.find(s => s.id === targetId);
            if (target) {
                ctx.beginPath();
                ctx.moveTo(centerX + skill.x, centerY + skill.y);
                ctx.lineTo(centerX + target.x, centerY + target.y);
                ctx.stroke();
            }
        });
    });

    // Reset shadow for skills
    ctx.shadowBlur = 0;

    // Draw center skill
    drawSkill(centerX, centerY, skillTree.center, true);

    // Draw all other skills
    skillTree.skills.forEach(skill => {
        drawSkill(centerX + skill.x, centerY + skill.y, skill, false);
    });
}

function drawSkill(x, y, skill, isCenter) {
    const radius = isCenter ? 60 : 45;

    // Draw outer glow
    ctx.shadowBlur = 20;
    ctx.shadowColor = THEME.primaryGlow;

    // Draw filled circle (white with glow)
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = THEME.primary;
    ctx.fill();

    // Reset shadow
    ctx.shadowBlur = 0;

    // Draw icon placeholder
    ctx.fillStyle = THEME.bg;
    ctx.font = `${isCenter ? 28 : 20}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎨', x, y - 5);

    // Draw label
    ctx.fillStyle = THEME.primary;
    ctx.font = `${isCenter ? 14 : 11}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const words = skill.name.split(' ');
    words.forEach((word, i) => {
        ctx.fillText(word, x, y + radius + 10 + (i * 15));
    });
}

drawSkillTree();

// ==========================================
// INTERACTION HANDLERS
// ==========================================

// Mouse events
canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2 - pan.x) / zoom;
    const y = (e.clientY - rect.top - rect.height / 2 - pan.y) / zoom;

    const clicked = getSkillAtPosition(x, y);

    if (clicked) {
        // Start hold timer for skill
        holdTimer = setTimeout(() => {
            if (!isDragging) {
                holdingSkill = clicked;
                showSkillActions(clicked, e.clientX, e.clientY);
            }
        }, 500);
    } else {
        // Start panning
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

        // Cancel hold timer if we started dragging
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

        // If not dragging and timer was active, this was a click
        if (!wasDragging) {
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2 - pan.x) / zoom;
            const y = (e.clientY - rect.top - rect.height / 2 - pan.y) / zoom;
            const clicked = getSkillAtPosition(x, y);

            if (clicked) {
                // Open skill MD file
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

// Touch events for mobile
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();

    if (e.touches.length === 1) {
        // Single touch - start hold timer or pan
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = (touch.clientX - rect.left - rect.width / 2 - pan.x) / zoom;
        const y = (touch.clientY - rect.top - rect.height / 2 - pan.y) / zoom;

        const clicked = getSkillAtPosition(x, y);

        if (clicked) {
            holdTimer = setTimeout(() => {
                if (!isDragging) {
                    holdingSkill = clicked;
                    showSkillActions(clicked, touch.clientX, touch.clientY);
                }
            }, 500);
        } else {
            isDragging = true;
            dragStart = { x: touch.clientX - pan.x, y: touch.clientY - pan.y };
        }

        lastTouchPosition = { x: touch.clientX, y: touch.clientY };
    } else if (e.touches.length === 2) {
        // Two touches - prepare for pinch zoom
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

    if (e.touches.length === 1 && isDragging) {
        // Single touch pan
        const touch = e.touches[0];
        pan.x = touch.clientX - dragStart.x;
        pan.y = touch.clientY - dragStart.y;
        updateCanvasTransform();

        if (holdTimer) {
            clearTimeout(holdTimer);
            holdTimer = null;
        }
    } else if (e.touches.length === 2) {
        // Two touch pinch and pan
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

        // Pinch zoom
        if (touchDistance > 0) {
            const zoomDelta = newDistance / touchDistance;
            zoom = Math.max(0.3, Math.min(2, zoom * zoomDelta));
        }

        // Pan
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
        const wasDragging = isDragging;
        isDragging = false;
        touchDistance = 0;

        if (holdTimer) {
            clearTimeout(holdTimer);
            holdTimer = null;

            // Quick tap - open file
            if (!wasDragging && e.changedTouches.length > 0) {
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
    // Try to open the skill's MD file
    const fileName = `Drawing/${skill.name}`;
    window.location.href = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent(fileName)}`;
}

function getSkillAtPosition(x, y) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Check center
    const distCenter = Math.sqrt(x ** 2 + y ** 2);
    if (distCenter < 60) return skillTree.center;

    // Check skills
    for (let skill of skillTree.skills) {
        const dx = x - skill.x;
        const dy = y - skill.y;
        const dist = Math.sqrt(dx ** 2 + dy ** 2);
        if (dist < 45) return skill;
    }

    return null;
}

// ==========================================
// SKILL ACTIONS (EDIT/ADD)
// ==========================================
function showSkillActions(skill, clientX, clientY) {
    // Remove any existing action menus
    document.querySelectorAll('.skill-action-menu').forEach(el => el.remove());

    const actionMenu = document.createElement('div');
    actionMenu.className = 'skill-action-menu';
    actionMenu.style.cssText = `
        position: fixed;
        left: ${clientX}px;
        top: ${clientY}px;
        transform: translate(-50%, -50%);
        display: flex;
        gap: 20px;
        z-index: 10000;
        animation: fade-in 0.3s ease;
    `;

    // Edit button
    const editBtn = createCircleButton('✏️', 'Edit', () => {
        showEditModal(skill);
        actionMenu.remove();
    });

    // Add button (only show for skills that can have connections)
    const addBtn = createCircleButton('➕', 'Add', () => {
        addNewSkill(skill);
        actionMenu.remove();
    });

    actionMenu.appendChild(editBtn);
    actionMenu.appendChild(addBtn);

    document.body.appendChild(actionMenu);

    // Add glow effect to canvas skill
    const centerX = canvas.width / 2 + (skill.x || 0);
    const centerY = canvas.height / 2 + (skill.y || 0);
    const radius = skill === skillTree.center ? 60 : 45;

    ctx.save();
    ctx.shadowBlur = 40;
    ctx.shadowColor = THEME.accent;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = THEME.accent;
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();

    // Remove menu on click outside
    setTimeout(() => {
        const removeMenu = (e) => {
            if (!actionMenu.contains(e.target)) {
                actionMenu.remove();
                drawSkillTree();
                document.removeEventListener('click', removeMenu);
            }
        };
        document.addEventListener('click', removeMenu);
    }, 100);
}

function createCircleButton(icon, label, onClick) {
    const btn = document.createElement('div');
    btn.style.cssText = `
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: ${THEME.primary};
        border: 3px solid ${THEME.accent};
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 0 20px ${THEME.primaryGlow};
    `;

    const iconEl = document.createElement('div');
    iconEl.textContent = icon;
    iconEl.style.cssText = `font-size: 28px;`;
    btn.appendChild(iconEl);

    const labelEl = document.createElement('div');
    labelEl.textContent = label;
    labelEl.style.cssText = `
        font-size: 10px;
        color: ${THEME.bg};
        font-weight: bold;
        font-family: Arial, sans-serif;
        letter-spacing: 1px;
        margin-top: 4px;
    `;
    btn.appendChild(labelEl);

    btn.onmouseenter = () => {
        btn.style.transform = 'scale(1.2)';
        btn.style.boxShadow = `0 0 30px ${THEME.primary}`;
    };

    btn.onmouseleave = () => {
        btn.style.transform = 'scale(1)';
        btn.style.boxShadow = `0 0 20px ${THEME.primaryGlow}`;
    };

    btn.onclick = onClick;

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
        backdrop-filter: blur(10px);
        animation: fade-in 0.3s ease;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: ${THEME.bgCard};
        border: 3px solid ${THEME.primary};
        padding: 50px;
        max-width: 500px;
        width: 90%;
        position: relative;
        box-shadow: 0 0 50px ${THEME.primary};
    `;
    modal.appendChild(modalContent);

    createCorners(modalContent, THEME.secondary, 30);

    // Title
    const title = document.createElement('h2');
    title.textContent = 'EDIT SKILL';
    title.style.cssText = `
        margin: 0 0 30px 0;
        color: ${THEME.primary};
        font-size: 24px;
        font-weight: 700;
        font-family: "Impact", sans-serif;
        letter-spacing: 4px;
        text-align: center;
    `;
    modalContent.appendChild(title);

    // Display enlarged skill
    const skillDisplay = document.createElement('div');
    skillDisplay.style.cssText = `
        width: 150px;
        height: 150px;
        border-radius: 50%;
        background: ${THEME.primary};
        border: 4px solid ${THEME.accent};
        margin: 0 auto 30px auto;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 60px;
        box-shadow: 0 0 30px ${THEME.primaryGlow};
    `;
    skillDisplay.textContent = '🎨';
    modalContent.appendChild(skillDisplay);

    // Name input
    const nameLabel = document.createElement('div');
    nameLabel.textContent = 'Skill Name:';
    nameLabel.style.cssText = `
        color: ${THEME.primary};
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 8px;
        font-family: Arial, sans-serif;
    `;
    modalContent.appendChild(nameLabel);

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = skill.name;
    nameInput.style.cssText = `
        width: 100%;
        padding: 12px;
        background: ${THEME.bgLight};
        border: 2px solid ${THEME.border};
        color: ${THEME.primary};
        font-size: 16px;
        margin-bottom: 20px;
        font-family: Arial, sans-serif;
    `;
    modalContent.appendChild(nameInput);

    // Image input
    const imageLabel = document.createElement('div');
    imageLabel.textContent = 'Image Name:';
    imageLabel.style.cssText = `
        color: ${THEME.primary};
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 8px;
        font-family: Arial, sans-serif;
    `;
    modalContent.appendChild(imageLabel);

    const imageInput = document.createElement('input');
    imageInput.type = 'text';
    imageInput.value = skill.image;
    imageInput.style.cssText = `
        width: 100%;
        padding: 12px;
        background: ${THEME.bgLight};
        border: 2px solid ${THEME.border};
        color: ${THEME.primary};
        font-size: 16px;
        margin-bottom: 30px;
        font-family: Arial, sans-serif;
    `;
    modalContent.appendChild(imageInput);

    // Buttons
    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = `
        display: flex;
        gap: 15px;
        justify-content: center;
    `;
    modalContent.appendChild(btnContainer);

    // Save button
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'SAVE';
    saveBtn.style.cssText = `
        padding: 12px 30px;
        background: ${THEME.primary};
        border: 2px solid ${THEME.accent};
        color: ${THEME.bg};
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        font-family: "Arial", sans-serif;
        letter-spacing: 2px;
        transition: all 0.3s ease;
    `;
    saveBtn.onclick = () => {
        skill.name = nameInput.value;
        skill.image = imageInput.value;
        saveSkillTree();
        drawSkillTree();
        modal.remove();
    };
    btnContainer.appendChild(saveBtn);

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'DELETE';
    deleteBtn.style.cssText = `
        padding: 12px 30px;
        background: #663333;
        border: 2px solid #aa6666;
        color: ${THEME.primary};
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        font-family: "Arial", sans-serif;
        letter-spacing: 2px;
        transition: all 0.3s ease;
    `;
    deleteBtn.onclick = () => {
        if (confirm(`Delete "${skill.name}"?`)) {
            if (skill === skillTree.center) {
                alert('Cannot delete center skill');
            } else {
                skillTree.skills = skillTree.skills.filter(s => s.id !== skill.id);
                saveSkillTree();
                drawSkillTree();
            }
            modal.remove();
        }
    };
    btnContainer.appendChild(deleteBtn);

    // Cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'CANCEL';
    cancelBtn.style.cssText = `
        padding: 12px 30px;
        background: transparent;
        border: 2px solid ${THEME.border};
        color: ${THEME.muted};
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        font-family: "Arial", sans-serif;
        letter-spacing: 2px;
        transition: all 0.3s ease;
    `;
    cancelBtn.onclick = () => modal.remove();
    btnContainer.appendChild(cancelBtn);

    // Hover effects
    [saveBtn, deleteBtn, cancelBtn].forEach(btn => {
        btn.onmouseenter = () => {
            btn.style.transform = 'scale(1.05)';
            btn.style.boxShadow = `0 0 15px ${THEME.accent}`;
        };
        btn.onmouseleave = () => {
            btn.style.transform = 'scale(1)';
            btn.style.boxShadow = 'none';
        };
    });

    document.body.appendChild(modal);
}

// ==========================================
// ADD NEW SKILL
// ==========================================
function addNewSkill(parentSkill) {
    const name = prompt('Enter skill name:');
    if (!name) return;

    const image = prompt('Enter image name:', 'icon');

    const newSkill = {
        id: `skill-${Date.now()}`,
        name: name,
        image: image,
        x: (parentSkill.x || 0) + (Math.random() - 0.5) * 200,
        y: (parentSkill.y || 0) + (Math.random() - 0.5) * 200,
        connections: []
    };

    if (parentSkill === skillTree.center) {
        skillTree.center.connections.push(newSkill.id);
    } else {
        parentSkill.connections.push(newSkill.id);
    }

    skillTree.skills.push(newSkill);
    saveSkillTree();
    drawSkillTree();
}

// ==========================================
// ZOOM CONTROLS
// ==========================================
const controls = document.createElement('div');
controls.style.cssText = `
    position: absolute;
    bottom: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 100;
`;

function createControlButton(text, onClick) {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.style.cssText = `
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: ${THEME.primary};
        border: 2px solid ${THEME.accent};
        color: ${THEME.bg};
        font-size: 24px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 0 15px ${THEME.primaryGlow};
    `;
    btn.onclick = onClick;
    btn.onmouseenter = () => {
        btn.style.transform = 'scale(1.2)';
        btn.style.boxShadow = `0 0 25px ${THEME.primary}`;
    };
    btn.onmouseleave = () => {
        btn.style.transform = 'scale(1)';
        btn.style.boxShadow = `0 0 15px ${THEME.primaryGlow}`;
    };
    return btn;
}

controls.appendChild(createControlButton('+', () => {
    zoom = Math.min(2, zoom * 1.2);
    updateCanvasTransform();
}));

controls.appendChild(createControlButton('-', () => {
    zoom = Math.max(0.3, zoom * 0.8);
    updateCanvasTransform();
}));

controls.appendChild(createControlButton('⟲', () => {
    pan = { x: 0, y: 0 };
    zoom = 0.5;
    updateCanvasTransform();
}));

skillTreeSection.appendChild(controls);

mainContainer.appendChild(skillTreeSection);

// ==========================================
// INSTRUCTIONS
// ==========================================
const instructions = document.createElement('div');
instructions.style.cssText = `
    max-width: 1200px;
    margin: 30px auto;
    padding: 20px;
    text-align: center;
    color: ${THEME.muted};
    font-size: 13px;
    font-family: Arial, sans-serif;
    line-height: 1.6;
`;
instructions.innerHTML = `
    <strong style="color: ${THEME.primary};">CONTROLS:</strong><br>
    <span style="color: ${THEME.accent};">• CLICK</span> on a skill to open its notes<br>
    <span style="color: ${THEME.accent};">• HOLD</span> on a skill (0.5s) to edit or add new skills<br>
    <span style="color: ${THEME.accent};">• DRAG</span> to pan around the skill tree<br>
    <span style="color: ${THEME.accent};">• SCROLL</span> or pinch to zoom in/out<br>
    <span style="color: ${THEME.accent};">• USE BUTTONS</span> in bottom right to reset view
`;
mainContainer.appendChild(instructions);
```
