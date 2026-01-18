---
editor-width: 100
cssclasses:
  - hide-properties
---

```dataviewjs
// ==========================================
// DRAWING SESSION - SKILL TREE (AMOLED)
// ==========================================

const VAULT_NAME = "Alt society";

const THEME = {
    primary: "#ffffff",
    primaryGlow: "rgba(255, 255, 255, 0.6)",
    connection: "#444444",
    bg: "#000000",
    bgCard: "#000000"
};

// ==========================================
// FIXED SKILL TREE STRUCTURE
// ==========================================
// Geometric positions based on the reference image
let skillTree = {
    center: {
        id: 'core',
        name: 'Core Basics',
        file: 'Drawing/Core Basics',
        x: 0,
        y: 0,
        slots: [
            { angle: 0, distance: 280, occupied: 'line-form' },      // Top
            { angle: 120, distance: 320, occupied: 'observation' },   // Left
            { angle: 240, distance: 320, occupied: 'value-light' },   // Right
            { angle: 180, distance: 280, occupied: 'anatomy' }        // Bottom
        ]
    },
    skills: {
        // TOP BRANCH - Line & Form
        'line-form': {
            id: 'line-form',
            name: 'Line & Form',
            file: 'Drawing/Line & Form',
            x: 0,
            y: -280,
            slots: [
                { angle: -30, distance: 180, occupied: 'basic-shapes' },
                { angle: 0, distance: 200, occupied: 'contour' },
                { angle: 30, distance: 180, occupied: 'geometric' }
            ]
        },
        'basic-shapes': {
            id: 'basic-shapes',
            name: 'Basic Shapes',
            file: 'Drawing/Basic Shapes',
            x: -155,
            y: -370,
            slots: [
                { angle: -60, distance: 150, occupied: 'still-life' }
            ]
        },
        'still-life': {
            id: 'still-life',
            name: 'Still Life',
            file: 'Drawing/Still Life',
            x: -230,
            y: -500,
            slots: []
        },
        'contour': {
            id: 'contour',
            name: 'Contour Lines',
            file: 'Drawing/Contour Lines',
            x: 0,
            y: -480,
            slots: []
        },
        'geometric': {
            id: 'geometric',
            name: 'Geometric Forms',
            file: 'Drawing/Geometric Forms',
            x: 155,
            y: -370,
            slots: []
        },

        // LEFT BRANCH - Observation
        'observation': {
            id: 'observation',
            name: 'Observation',
            file: 'Drawing/Observation',
            x: -277,
            y: 160,
            slots: [
                { angle: 150, distance: 200, occupied: 'negative-space' },
                { angle: 180, distance: 180, occupied: 'perspective' }
            ]
        },
        'negative-space': {
            id: 'negative-space',
            name: 'Negative Space',
            file: 'Drawing/Negative Space',
            x: -450,
            y: 260,
            slots: []
        },
        'perspective': {
            id: 'perspective',
            name: 'Perspective Grids',
            file: 'Drawing/Perspective Grids',
            x: -457,
            y: 160,
            slots: [
                { angle: 210, distance: 150, occupied: 'cross-hatching' }
            ]
        },
        'cross-hatching': {
            id: 'cross-hatching',
            name: 'Cross-Hatching',
            file: 'Drawing/Cross-Hatching',
            x: -587,
            y: 235,
            slots: []
        },

        // RIGHT BRANCH - Value & Light
        'value-light': {
            id: 'value-light',
            name: 'Value & Light',
            file: 'Drawing/Value & Light',
            x: 277,
            y: 160,
            slots: [
                { angle: 30, distance: 200, occupied: 'light-source' },
                { angle: 0, distance: 180, occupied: 'sphere-shading' }
            ]
        },
        'light-source': {
            id: 'light-source',
            name: 'Light Source',
            file: 'Drawing/Light Source',
            x: 450,
            y: 60,
            slots: []
        },
        'sphere-shading': {
            id: 'sphere-shading',
            name: 'Sphere Shading',
            file: 'Drawing/Sphere Shading',
            x: 457,
            y: 160,
            slots: [
                { angle: -30, distance: 150, occupied: 'cast-shadows' }
            ]
        },
        'cast-shadows': {
            id: 'cast-shadows',
            name: 'Cast Shadows',
            file: 'Drawing/Cast Shadows',
            x: 587,
            y: 85,
            slots: []
        },

        // BOTTOM BRANCH - Anatomy
        'anatomy': {
            id: 'anatomy',
            name: 'Anatomy Basics',
            file: 'Drawing/Anatomy Basics',
            x: 0,
            y: 280,
            slots: []
        }
    }
};

// Try to load from localStorage
try {
    const saved = localStorage.getItem('skillTreeData');
    if (saved) {
        const savedData = JSON.parse(saved);
        // Merge saved data with default structure
        if (savedData.skills) {
            Object.keys(savedData.skills).forEach(id => {
                if (skillTree.skills[id]) {
                    skillTree.skills[id] = { ...skillTree.skills[id], ...savedData.skills[id] };
                } else {
                    skillTree.skills[id] = savedData.skills[id];
                }
            });
        }
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
            -webkit-touch-callout: none !important;
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
            gap: 20px;
            z-index: 10000;
            animation: fade-in 0.3s ease;
            pointer-events: all;
        }

        .skill-action-btn {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: ${THEME.primary};
            border: 2px solid ${THEME.primary};
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 0 20px ${THEME.primaryGlow};
            touch-action: manipulation;
        }

        .skill-action-btn:active {
            transform: scale(0.9);
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
    min-height: 100vh;
    background: ${THEME.bg};
    position: relative;
    overflow: hidden;
    padding: 0;
    margin: 0;
`;

// ==========================================
// SKILL TREE CANVAS
// ==========================================
const skillTreeSection = document.createElement('div');
skillTreeSection.style.cssText = `
    width: 100%;
    height: 100vh;
    background: ${THEME.bg};
    position: relative;
    overflow: hidden;
`;

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
let activeMenu = null;

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

    // Draw connections first
    ctx.strokeStyle = THEME.connection;
    ctx.lineWidth = 2;

    // Draw connections from center
    Object.values(skillTree.skills).forEach(skill => {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + skill.x, centerY + skill.y);
        ctx.stroke();
    });

    // Draw connections between skills
    Object.values(skillTree.skills).forEach(skill => {
        if (skill.slots) {
            skill.slots.forEach(slot => {
                if (slot.occupied && skillTree.skills[slot.occupied]) {
                    const target = skillTree.skills[slot.occupied];
                    ctx.beginPath();
                    ctx.moveTo(centerX + skill.x, centerY + skill.y);
                    ctx.lineTo(centerX + target.x, centerY + target.y);
                    ctx.stroke();
                }
            });
        }
    });

    // Draw center skill
    drawSkill(centerX, centerY, skillTree.center, true);

    // Draw all other skills
    Object.values(skillTree.skills).forEach(skill => {
        drawSkill(centerX + skill.x, centerY + skill.y, skill, false);
    });
}

function drawSkill(x, y, skill, isCenter) {
    const radius = isCenter ? 60 : 45;

    // Draw outer glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = THEME.primaryGlow;

    // Draw filled circle (white)
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
    ctx.font = `${isCenter ? 12 : 10}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const words = skill.name.split(' ');
    words.forEach((word, i) => {
        ctx.fillText(word, x, y + radius + 10 + (i * 14));
    });
}

drawSkillTree();

// ==========================================
// INTERACTION HANDLERS
// ==========================================

// Remove any existing action menu
function removeActionMenu() {
    if (activeMenu) {
        activeMenu.remove();
        activeMenu = null;
    }
    drawSkillTree();
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

// Touch events for mobile (improved)
let touchStartTime = 0;
let touchMoved = false;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    removeActionMenu();

    touchStartTime = Date.now();
    touchMoved = false;

    if (e.touches.length === 1) {
        // Single touch
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = (touch.clientX - rect.left - rect.width / 2 - pan.x) / zoom;
        const y = (touch.clientY - rect.top - rect.height / 2 - pan.y) / zoom;

        const clicked = getSkillAtPosition(x, y);

        if (clicked) {
            holdTimer = setTimeout(() => {
                if (!touchMoved) {
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
        // Two touches - pinch zoom
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
        const touchDuration = Date.now() - touchStartTime;
        const wasDragging = isDragging;
        isDragging = false;
        touchDistance = 0;

        if (holdTimer) {
            clearTimeout(holdTimer);
            holdTimer = null;

            // Quick tap (< 300ms, not moved much)
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

function getSkillAtPosition(x, y) {
    // Check center
    const distCenter = Math.sqrt(x ** 2 + y ** 2);
    if (distCenter < 60) return skillTree.center;

    // Check skills
    for (let skill of Object.values(skillTree.skills)) {
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
    // Remove any existing menu
    removeActionMenu();

    const actionMenu = document.createElement('div');
    actionMenu.className = 'skill-action-menu';
    actionMenu.style.cssText = `
        left: ${clientX}px;
        top: ${clientY}px;
        transform: translate(-50%, -120%);
    `;

    // Edit button
    const editBtn = createActionButton('✏️', () => {
        removeActionMenu();
        showEditModal(skill);
    });

    // Add button (only if skill has available slots)
    const hasSlots = skill.slots && skill.slots.some(s => !s.occupied);
    if (hasSlots) {
        const addBtn = createActionButton('➕', () => {
            removeActionMenu();
            addNewSkill(skill);
        });
        actionMenu.appendChild(addBtn);
    }

    actionMenu.appendChild(editBtn);
    document.body.appendChild(actionMenu);
    activeMenu = actionMenu;

    // Add glow effect to canvas skill
    const centerX = canvas.width / 2 + (skill.x || 0);
    const centerY = canvas.height / 2 + (skill.y || 0);
    const radius = skill === skillTree.center ? 60 : 45;

    ctx.save();
    ctx.shadowBlur = 30;
    ctx.shadowColor = THEME.primary;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 10, 0, Math.PI * 2);
    ctx.strokeStyle = THEME.primary;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // Remove menu on click outside
    setTimeout(() => {
        const removeOnOutsideClick = (e) => {
            if (activeMenu && !actionMenu.contains(e.target) && e.target !== canvas) {
                removeActionMenu();
                document.removeEventListener('click', removeOnOutsideClick);
                document.removeEventListener('touchstart', removeOnOutsideClick);
            }
        };
        document.addEventListener('click', removeOnOutsideClick);
        document.addEventListener('touchstart', removeOnOutsideClick);
    }, 100);
}

function createActionButton(icon, onClick) {
    const btn = document.createElement('div');
    btn.className = 'skill-action-btn';

    const iconEl = document.createElement('div');
    iconEl.textContent = icon;
    iconEl.style.cssText = `font-size: 32px;`;
    btn.appendChild(iconEl);

    btn.onclick = (e) => {
        e.stopPropagation();
        onClick();
    };

    btn.ontouchend = (e) => {
        e.stopPropagation();
        e.preventDefault();
        onClick();
    };

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
        background: #111111;
        border: 2px solid ${THEME.primary};
        padding: 30px;
        max-width: 400px;
        width: 90%;
        border-radius: 10px;
    `;
    modal.appendChild(modalContent);

    // Title
    const title = document.createElement('h2');
    title.textContent = 'EDIT SKILL';
    title.style.cssText = `
        margin: 0 0 20px 0;
        color: ${THEME.primary};
        font-size: 18px;
        font-weight: 700;
        font-family: "Arial", sans-serif;
        text-align: center;
    `;
    modalContent.appendChild(title);

    // Name input
    const nameLabel = document.createElement('div');
    nameLabel.textContent = 'Name:';
    nameLabel.style.cssText = `
        color: ${THEME.primary};
        font-size: 12px;
        margin-bottom: 5px;
        font-family: Arial, sans-serif;
    `;
    modalContent.appendChild(nameLabel);

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
        font-family: Arial, sans-serif;
        border-radius: 5px;
    `;
    modalContent.appendChild(nameInput);

    // File path input
    const fileLabel = document.createElement('div');
    fileLabel.textContent = 'File Path:';
    fileLabel.style.cssText = `
        color: ${THEME.primary};
        font-size: 12px;
        margin-bottom: 5px;
        font-family: Arial, sans-serif;
    `;
    modalContent.appendChild(fileLabel);

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
        font-family: Arial, sans-serif;
        border-radius: 5px;
    `;
    modalContent.appendChild(fileInput);

    // Buttons
    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = `
        display: flex;
        gap: 10px;
        justify-content: center;
    `;
    modalContent.appendChild(btnContainer);

    // Save button
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'SAVE';
    saveBtn.style.cssText = `
        padding: 10px 25px;
        background: ${THEME.primary};
        border: none;
        color: ${THEME.bg};
        font-size: 12px;
        font-weight: bold;
        cursor: pointer;
        font-family: "Arial", sans-serif;
        border-radius: 5px;
        touch-action: manipulation;
    `;
    saveBtn.onclick = () => {
        skill.name = nameInput.value;
        skill.file = fileInput.value;
        saveSkillTree();
        drawSkillTree();
        modal.remove();
    };
    btnContainer.appendChild(saveBtn);

    // Cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'CANCEL';
    cancelBtn.style.cssText = `
        padding: 10px 25px;
        background: transparent;
        border: 1px solid #333333;
        color: ${THEME.primary};
        font-size: 12px;
        font-weight: bold;
        cursor: pointer;
        font-family: "Arial", sans-serif;
        border-radius: 5px;
        touch-action: manipulation;
    `;
    cancelBtn.onclick = () => modal.remove();
    btnContainer.appendChild(cancelBtn);

    document.body.appendChild(modal);
}

// ==========================================
// ADD NEW SKILL
// ==========================================
function addNewSkill(parentSkill) {
    const name = prompt('Enter skill name:');
    if (!name) return;

    // Find first available slot
    const availableSlot = parentSkill.slots?.find(s => !s.occupied);
    if (!availableSlot) {
        alert('No available slots for new skills');
        return;
    }

    // Calculate position based on slot
    const angleRad = (availableSlot.angle * Math.PI) / 180;
    const parentX = parentSkill.x || 0;
    const parentY = parentSkill.y || 0;
    const newX = parentX + Math.cos(angleRad) * availableSlot.distance;
    const newY = parentY + Math.sin(angleRad) * availableSlot.distance;

    const newId = `skill-${Date.now()}`;
    const newSkill = {
        id: newId,
        name: name,
        file: `Drawing/${name}`,
        x: newX,
        y: newY,
        slots: []
    };

    skillTree.skills[newId] = newSkill;
    availableSlot.occupied = newId;

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
        border: none;
        color: ${THEME.bg};
        font-size: 24px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 0 15px ${THEME.primaryGlow};
        touch-action: manipulation;
    `;
    btn.onclick = onClick;
    btn.ontouchend = (e) => {
        e.preventDefault();
        onClick();
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
```
