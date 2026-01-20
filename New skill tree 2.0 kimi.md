```dataviewjs
// ==========================================
// DRAWING SKILL TREE - MOBILE FIXED VERSION
// v2.2 - Fixed zoom/touch interaction bug
// ==========================================

const VAULT_NAME = "Alt society";
const SKILL_FOLDER = "Home/Starts/Drawing/Skill tree";
const DEBUG_MODE = false; // Set to true for mobile debugging

function logDebug(...args) {
    if (DEBUG_MODE) console.log('[SkillTree]', ...args);
}

// ==========================================
// CONFIGURATION
// ==========================================
const CONFIG = {
    // Arc settings (270° arc, open at bottom)
    arcStart: -225,      // Lower-left (degrees)
    arcEnd: 45,          // Lower-right (degrees)
    arcCenter: -90,      // Top of screen (degrees) - straight up

    // Level radii (distance from center for each depth level)
    radii: [0, 220, 380, 520, 650, 780],

    // Node sizes
    rootRadius: 50,
    nodeRadius: 38,

    // Canvas
    canvasSize: 2400,
    initialZoom: 0.6,

    // Timing
    longPressTime: 800, // Reduced from 1000ms for better mobile feel

    // Touch sensitivity
    movementThreshold: 8, // pixels of movement before cancelling hold (mobile fix)

    // Colors (AMOLED)
    bg: "#000000",
    nodeFill: "#ffffff",
    nodeStroke: "#ffffff",
    selectedGlow: "#00aaff",
    selectedFill: "#00aaff",
    connection: "#4a6a8d",
    connectionGlow: "rgba(74, 106, 141, 0.5)",
    text: "#ffffff",
    textMuted: "#888888"
};

// ==========================================
// SVG ICON LIBRARY (unchanged)
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
if (!document.getElementById('skill-tree-styles-v2')) {
    const style = document.createElement('style');
    style.id = 'skill-tree-styles-v2';
    style.textContent = `
        * { -webkit-tap-highlight-color: transparent; }

        .skill-tree-canvas {
            cursor: grab;
            touch-action: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            -webkit-touch-callout: none;
        }
        .skill-tree-canvas:active { cursor: grabbing; }

        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }

        @keyframes slideIn {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
        }

        @keyframes pulse {
            0%, 100% { box-shadow: 0 0 20px rgba(0, 170, 255, 0.5); }
            50% { box-shadow: 0 0 35px rgba(0, 170, 255, 0.8); }
        }

        @keyframes selectionPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.08); }
        }

        /* Edit Button - Right Side */
        .skill-edit-btn {
            position: fixed;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #333;
            border: 2px solid #555;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: not-allowed;
            opacity: 0.4;
            transition: all 0.3s ease;
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            touch-action: manipulation;
        }

        .skill-edit-btn.active {
            background: ${CONFIG.selectedGlow};
            border-color: ${CONFIG.selectedGlow};
            cursor: pointer;
            opacity: 1;
            animation: pulse 2s infinite;
        }

        .skill-edit-btn:active.active {
            transform: translateY(-50%) scale(0.9);
        }

        .skill-edit-btn svg {
            width: 28px;
            height: 28px;
            fill: none;
            stroke: #888;
            stroke-width: 2;
            transition: stroke 0.3s ease;
        }

        .skill-edit-btn.active svg {
            stroke: white;
        }

        /* Selection indicator label */
        .skill-selection-label {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 170, 255, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 500;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
            max-width: 80vw;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .skill-selection-label .deselect {
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
        }

        /* Edit Card Modal (unchanged) */
        .skill-edit-card {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 16px;
            padding: 0;
            min-width: 320px;
            max-width: 90vw;
            max-height: 85vh;
            overflow: hidden;
            z-index: 10001;
            animation: fadeIn 0.25s ease;
            box-shadow: 0 20px 60px rgba(0,0,0,0.8);
        }

        .skill-edit-card-header {
            background: linear-gradient(135deg, ${CONFIG.selectedGlow}, #0066aa);
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .skill-edit-card-header h3 {
            margin: 0;
            color: white;
            font-size: 18px;
            font-weight: 600;
        }

        .skill-edit-card-close {
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .skill-edit-card-body {
            padding: 20px;
            overflow-y: auto;
            max-height: 60vh;
        }

        .skill-edit-section {
            margin-bottom: 20px;
        }

        .skill-edit-section:last-child {
            margin-bottom: 0;
        }

        .skill-edit-section-title {
            color: #888;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
        }

        .skill-edit-option {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px;
            background: #252525;
            border-radius: 10px;
            margin-bottom: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 1px solid transparent;
        }

        .skill-edit-option:hover {
            background: #303030;
            border-color: ${CONFIG.selectedGlow};
        }

        .skill-edit-option:active {
            transform: scale(0.98);
        }

        .skill-edit-option-icon {
            width: 44px;
            height: 44px;
            border-radius: 10px;
            background: #333;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
        }

        .skill-edit-option-icon.add { background: #1a4d1a; }
        .skill-edit-option-icon.edit { background: #4d4d1a; }
        .skill-edit-option-icon.delete { background: #4d1a1a; }
        .skill-edit-option-icon.move { background: #1a1a4d; }

        .skill-edit-option-text h4 {
            margin: 0 0 4px 0;
            color: white;
            font-size: 15px;
            font-weight: 500;
        }

        .skill-edit-option-text p {
            margin: 0;
            color: #888;
            font-size: 12px;
        }

        /* Sub-menu panels */
        .skill-submenu {
            animation: slideIn 0.2s ease;
        }

        .skill-submenu-back {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 15px 20px;
            background: #222;
            cursor: pointer;
            border-bottom: 1px solid #333;
            color: #888;
            font-size: 14px;
        }

        .skill-submenu-back:hover {
            background: #2a2a2a;
            color: white;
        }

        /* Form inputs */
        .skill-form-group {
            margin-bottom: 15px;
        }

        .skill-form-group label {
            display: block;
            color: #888;
            font-size: 12px;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .skill-form-group input,
        .skill-form-group select {
            width: 100%;
            padding: 12px 15px;
            background: #252525;
            border: 1px solid #333;
            border-radius: 8px;
            color: white;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s ease;
        }

        .skill-form-group input:focus,
        .skill-form-group select:focus {
            border-color: ${CONFIG.selectedGlow};
        }

        .skill-form-group select {
            cursor: pointer;
        }

        .skill-form-actions {
            display: flex;
            gap: 10px;
            margin-top: 20px;
        }

        .skill-form-btn {
            flex: 1;
            padding: 14px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .skill-form-btn.primary {
            background: ${CONFIG.selectedGlow};
            color: white;
        }

        .skill-form-btn.primary:hover {
            background: #0099dd;
        }

        .skill-form-btn.secondary {
            background: #333;
            color: white;
        }

        .skill-form-btn.secondary:hover {
            background: #444;
        }

        .skill-form-btn.danger {
            background: #aa3333;
            color: white;
        }

        .skill-form-btn.danger:hover {
            background: #cc4444;
        }

        /* Overlay */
        .skill-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            z-index: 10000;
            animation: fadeIn 0.2s ease;
        }

        /* Icon grid */
        .skill-icon-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 8px;
            max-height: 200px;
            overflow-y: auto;
            padding: 5px;
        }

        .skill-icon-option {
            width: 48px;
            height: 48px;
            border-radius: 8px;
            background: #252525;
            border: 2px solid transparent;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }

        .skill-icon-option:hover {
            background: #333;
        }

        .skill-icon-option.selected {
            border-color: ${CONFIG.selectedGlow};
            background: rgba(0, 170, 255, 0.2);
        }

        .skill-icon-option svg {
            width: 24px;
            height: 24px;
        }

        .skill-tree-empty {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            color: ${CONFIG.text};
            max-width: 400px;
            padding: 40px;
        }
        .skill-tree-empty h2 {
            font-size: 18px;
            margin-bottom: 20px;
            letter-spacing: 2px;
        }
        .skill-tree-empty pre {
            background: #111;
            padding: 15px;
            border-radius: 8px;
            text-align: left;
            font-size: 11px;
            overflow-x: auto;
        }

        /* Mobile optimizations */
        .skill-tree-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            height: -webkit-fill-available;
            background: ${CONFIG.bg};
            overflow: hidden;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: none;
        }

        @media (max-width: 768px) {
            .skill-edit-btn {
                width: 70px;
                height: 70px;
                right: 15px;
                bottom: 15px;
                top: auto;
                transform: none;
            }
            .skill-selection-label {
                font-size: 16px;
                padding: 12px 24px;
            }
        }
    `;
    document.head.appendChild(style);
}

// ==========================================
// MAIN CONTAINER
// ==========================================
const mainContainer = dv.el("div", "");
mainContainer.className = 'skill-tree-container';
mainContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    height: -webkit-fill-available;
    background: ${CONFIG.bg};
    overflow: hidden;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: none;
`;

// ==========================================
// DATA LOADING FROM OBSIDIAN NOTES
// ==========================================
function loadSkillsFromFolder() {
    const pages = dv.pages(`"${SKILL_FOLDER}"`);
    const skills = [];

    for (const page of pages) {
        let parent = page.parent || null;
        if (parent) {
            parent = String(parent).replace(/^\[\[/, '').replace(/\]\]$/, '');
            if (parent.includes('/')) {
                parent = parent.split('/').pop();
            }
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

    return skills;
}

function buildTree(skills) {
    if (skills.length === 0) return null;

    const skillMap = new Map();
    skills.forEach(s => skillMap.set(s.id, { ...s, children: [] }));

    let root = null;
    const orphans = [];

    skillMap.forEach(skill => {
        if (skill.parent && skillMap.has(skill.parent)) {
            skillMap.get(skill.parent).children.push(skill);
        } else if (!skill.parent) {
            if (root) {
                orphans.push(skill);
            } else {
                root = skill;
            }
        } else {
            orphans.push(skill);
        }
    });

    if (!root && orphans.length > 0) {
        root = {
            id: '__root__',
            name: 'Core',
            icon: 'core',
            children: orphans,
            isImplicit: true
        };
    } else if (root && orphans.length > 0) {
        root.children.push(...orphans);
    }

    function sortChildren(node) {
        if (node.children.length > 0) {
            node.children.sort((a, b) => (a.order || 0) - (b.order || 0));
            node.children.forEach(sortChildren);
        }
    }
    if (root) sortChildren(root);

    return root;
}

// ==========================================
// LAYOUT ALGORITHM - POLAR COORDINATES
// ==========================================
function layoutTree(node, level = 0, inheritedAngle = CONFIG.arcCenter) {
    if (!node) return;

    const radius = CONFIG.radii[level] || CONFIG.radii[CONFIG.radii.length - 1] + (level - CONFIG.radii.length + 1) * 150;

    node.level = level;

    if (level === 0) {
        node.x = 0;
        node.y = 0;
        node.angle = CONFIG.arcCenter;
    } else {
        node.angle = inheritedAngle;
        const angleRad = (node.angle * Math.PI) / 180;
        node.x = radius * Math.cos(angleRad);
        node.y = radius * Math.sin(angleRad);
    }

    if (node.children && node.children.length > 0) {
        const childCount = node.children.length;

        if (level === 0) {
            const arcSpan = CONFIG.arcEnd - CONFIG.arcStart;
            const padding = 15;
            const usableArc = arcSpan - (padding * 2);

            if (childCount === 1) {
                node.children[0].angle = CONFIG.arcCenter;
                layoutTree(node.children[0], 1, CONFIG.arcCenter);
            } else {
                const step = usableArc / (childCount - 1);
                node.children.forEach((child, i) => {
                    const childAngle = CONFIG.arcStart + padding + (i * step);
                    layoutTree(child, 1, childAngle);
                });
            }
        } else {
            const baseSpread = 35;
            const spreadReduction = 0.7;
            const spreadPerChild = baseSpread * Math.pow(spreadReduction, level - 1);

            const totalSpread = spreadPerChild * (childCount - 1);
            const startAngle = node.angle - (totalSpread / 2);

            node.children.forEach((child, i) => {
                const childAngle = childCount === 1
                    ? node.angle
                    : startAngle + (i * spreadPerChild);
                layoutTree(child, level + 1, childAngle);
            });
        }
    }
}

// ==========================================
// CANVAS SETUP
// ==========================================
const canvas = document.createElement('canvas');
canvas.className = 'skill-tree-canvas';
canvas.width = CONFIG.canvasSize;
canvas.height = CONFIG.canvasSize;
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
let zoom = CONFIG.initialZoom;
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let touchDistance = 0;
let lastTouchPos = { x: 0, y: 0 };
let treeRoot = null;
let allNodes = [];

// Selection state
let selectedNode = null;
let selectionLabel = null;

// Touch state tracking (mobile fix)
let touchState = {
    active: false,
    startPos: { x: 0, y: 0 },
    currentPos: { x: 0, y: 0 },
    startTime: 0,
    holdTimer: null,
    isHold: false,
    nodeAtStart: null
};

function updateTransform() {
    canvas.style.transform = `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;
}
updateTransform();

// ==========================================
// DRAWING FUNCTIONS
// ==========================================
function collectAllNodes(node, arr = []) {
    if (!node) return arr;
    arr.push(node);
    if (node.children) {
        node.children.forEach(child => collectAllNodes(child, arr));
    }
    return arr;
}

function drawConnection(parent, child) {
    const cx = CONFIG.canvasSize / 2;
    const cy = CONFIG.canvasSize / 2;

    const x1 = cx + parent.x;
    const y1 = cy + parent.y;
    const x2 = cx + child.x;
    const y2 = cy + child.y;

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawNode(node) {
    const cx = CONFIG.canvasSize / 2;
    const cy = CONFIG.canvasSize / 2;
    const x = cx + node.x;
    const y = cy + node.y;
    const isRoot = node.level === 0;
    const isSelected = selectedNode && selectedNode.id === node.id;
    const radius = isRoot ? CONFIG.rootRadius : CONFIG.nodeRadius;

    if (isSelected) {
        ctx.shadowBlur = 35;
        ctx.shadowColor = CONFIG.selectedGlow;

        ctx.beginPath();
        ctx.arc(x, y, radius + 8, 0, Math.PI * 2);
        ctx.strokeStyle = CONFIG.selectedGlow;
        ctx.lineWidth = 3;
        ctx.stroke();
    } else {
        ctx.shadowBlur = isRoot ? 25 : 15;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    }

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = isSelected ? CONFIG.selectedFill : CONFIG.nodeFill;
    ctx.fill();

    ctx.shadowBlur = 0;

    drawIcon(x, y, radius * 0.6, node.icon || 'default', isSelected);

    ctx.fillStyle = CONFIG.text;
    ctx.font = `${isRoot ? 13 : 11}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const words = node.name.split(' ');
    const maxWidth = 80;
    let lines = [];
    let currentLine = '';

    words.forEach(word => {
        const testLine = currentLine ? currentLine + ' ' + word : word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    });
    lines.push(currentLine);

    lines.forEach((line, i) => {
        ctx.fillText(line, x, y + radius + 10 + (i * 14));
    });
}

function drawIcon(x, y, size, iconName, isSelected = false) {
    const icon = ICONS[iconName] || ICONS.default;

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", icon.viewBox);
    svg.setAttribute("width", size * 2);
    svg.setAttribute("height", size * 2);
    const fillColor = isSelected ? "#ffffff" : CONFIG.bg;
    svg.innerHTML = icon.path.replace(/currentColor/g, fillColor);

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);

    if (img.complete) {
        ctx.drawImage(img, x - size, y - size, size * 2, size * 2);
    } else {
        img.onload = () => {
            ctx.drawImage(img, x - size, y - size, size * 2, size * 2);
        };
    }
}

function render() {
    ctx.clearRect(0, 0, CONFIG.canvasSize, CONFIG.canvasSize);

    if (!treeRoot) return;

    function drawConnections(node) {
        if (node.children) {
            node.children.forEach(child => {
                drawConnection(node, child);
                drawConnections(child);
            });
        }
    }
    drawConnections(treeRoot);

    allNodes.forEach(node => drawNode(node));
}

// ==========================================
// SELECTION SYSTEM
// ==========================================
function selectNode(node) {
    selectedNode = node;
    updateEditButton();
    showSelectionLabel(node);
    render();
}

function deselectNode() {
    selectedNode = null;
    updateEditButton();
    hideSelectionLabel();
    render();
}

function showSelectionLabel(node) {
    hideSelectionLabel();

    const label = document.createElement('div');
    label.className = 'skill-selection-label';
    label.innerHTML = `
        <span>Selected: <strong>${node.name}</strong></span>
        <button class="deselect" title="Deselect">✕</button>
    `;

    label.querySelector('.deselect').onclick = () => deselectNode();

    document.body.appendChild(label);
    selectionLabel = label;
}

function hideSelectionLabel() {
    if (selectionLabel) {
        selectionLabel.remove();
        selectionLabel = null;
    }
}

// ==========================================
// EDIT BUTTON (Right Side)
// ==========================================
const editButton = document.createElement('button');
editButton.className = 'skill-edit-btn';
editButton.innerHTML = `
    <svg viewBox="0 0 24 24">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
`;
editButton.title = "Hold a node for 1 second to select it, then tap here to edit";
document.body.appendChild(editButton);

function updateEditButton() {
    if (selectedNode) {
        editButton.classList.add('active');
    } else {
        editButton.classList.remove('active');
    }
}

editButton.onclick = () => {
    if (selectedNode) {
        showEditCard(selectedNode);
    }
};

// ==========================================
// EDIT CARD MODAL
// ==========================================
let currentOverlay = null;
let currentCard = null;

function closeEditCard() {
    if (currentOverlay) {
        currentOverlay.remove();
        currentOverlay = null;
    }
    if (currentCard) {
        currentCard.remove();
        currentCard = null;
    }
}

function showEditCard(node) {
    closeEditCard();

    const overlay = document.createElement('div');
    overlay.className = 'skill-overlay';
    overlay.onclick = closeEditCard;
    document.body.appendChild(overlay);
    currentOverlay = overlay;

    const card = document.createElement('div');
    card.className = 'skill-edit-card';
    card.onclick = (e) => e.stopPropagation();

    card.innerHTML = `
        <div class="skill-edit-card-header">
            <h3>${node.name}</h3>
            <button class="skill-edit-card-close">✕</button>
        </div>
        <div class="skill-edit-card-body">
            <div class="skill-edit-section">
                <div class="skill-edit-section-title">Actions</div>

                <div class="skill-edit-option" data-action="add">
                    <div class="skill-edit-option-icon add">➕</div>
                    <div class="skill-edit-option-text">
                        <h4>Add New Skill</h4>
                        <p>Create a child, sibling, or parent skill</p>
                    </div>
                </div>

                <div class="skill-edit-option" data-action="edit">
                    <div class="skill-edit-option-icon edit">✏️</div>
                    <div class="skill-edit-option-text">
                        <h4>Edit Skill</h4>
                        <p>Change name, icon, or parent relationship</p>
                    </div>
                </div>

                <div class="skill-edit-option" data-action="move">
                    <div class="skill-edit-option-icon move">↕️</div>
                    <div class="skill-edit-option-text">
                        <h4>Reorder</h4>
                        <p>Change this skill's position among siblings</p>
                    </div>
                </div>

                <div class="skill-edit-option" data-action="delete">
                    <div class="skill-edit-option-icon delete">🗑️</div>
                    <div class="skill-edit-option-text">
                        <h4>Delete Skill</h4>
                        <p>Remove this skill from the tree</p>
                    </div>
                </div>
            </div>

            <div class="skill-edit-section">
                <div class="skill-edit-section-title">Quick Actions</div>

                <div class="skill-edit-option" data-action="open">
                    <div class="skill-edit-option-icon" style="background: #1a3d4d;">📄</div>
                    <div class="skill-edit-option-text">
                        <h4>Open File</h4>
                        <p>Navigate to this skill's note</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(card);
    currentCard = card;

    card.querySelector('.skill-edit-card-close').onclick = closeEditCard;

    card.querySelectorAll('.skill-edit-option').forEach(opt => {
        opt.onclick = () => {
            const action = opt.dataset.action;
            handleEditAction(action, node);
        };
    });
}

function handleEditAction(action, node) {
    switch(action) {
        case 'add':
            showAddSubmenu(node);
            break;
        case 'edit':
            showEditSubmenu(node);
            break;
        case 'move':
            showMoveSubmenu(node);
            break;
        case 'delete':
            showDeleteConfirm(node);
            break;
        case 'open':
            closeEditCard();
            deselectNode();
            openFile(node);
            break;
    }
}

// ==========================================
// ADD SUBMENU
// ==========================================
function showAddSubmenu(node) {
    const body = currentCard.querySelector('.skill-edit-card-body');

    body.innerHTML = `
        <div class="skill-submenu">
            <div class="skill-submenu-back">
                ← Back to options
            </div>
            <div style="padding: 20px;">
                <div class="skill-edit-section-title">Add New Skill</div>

                <div class="skill-edit-option" data-type="child">
                    <div class="skill-edit-option-icon add">👶</div>
                    <div class="skill-edit-option-text">
                        <h4>Add Child</h4>
                        <p>Create a skill under "${node.name}"</p>
                    </div>
                </div>

                <div class="skill-edit-option" data-type="sibling">
                    <div class="skill-edit-option-icon add">👥</div>
                    <div class="skill-edit-option-text">
                        <h4>Add Sibling</h4>
                        <p>Create a skill at the same level</p>
                    </div>
                </div>

                ${node.level > 0 ? `
                <div class="skill-edit-option" data-type="parent">
                    <div class="skill-edit-option-icon add">👆</div>
                    <div class="skill-edit-option-text">
                        <h4>Add Parent</h4>
                        <p>Insert a new parent above "${node.name}"</p>
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;

    body.querySelector('.skill-submenu-back').onclick = () => showEditCard(node);

    body.querySelectorAll('.skill-edit-option').forEach(opt => {
        opt.onclick = () => showAddForm(node, opt.dataset.type);
    });
}

function showAddForm(node, type) {
    const body = currentCard.querySelector('.skill-edit-card-body');

    const typeLabels = {
        child: `Child of "${node.name}"`,
        sibling: `Sibling of "${node.name}"`,
        parent: `Parent of "${node.name}"`
    };

    body.innerHTML = `
        <div class="skill-submenu">
            <div class="skill-submenu-back">
                ← Back to add options
            </div>
            <div style="padding: 20px;">
                <div class="skill-edit-section-title">New ${type.charAt(0).toUpperCase() + type.slice(1)}</div>
                <p style="color: #888; font-size: 12px; margin-bottom: 20px;">${typeLabels[type]}</p>

                <div class="skill-form-group">
                    <label>Name</label>
                    <input type="text" id="new-skill-name" placeholder="Enter skill name...">
                </div>

                <div class="skill-form-group">
                    <label>Icon</label>
                    <div class="skill-icon-grid" id="icon-grid">
                        ${Object.keys(ICONS).map(iconName => `
                            <div class="skill-icon-option ${iconName === 'default' ? 'selected' : ''}" data-icon="${iconName}" title="${iconName}">
                                ${renderIconSVG(iconName)}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <input type="hidden" id="selected-icon" value="default">

                <div class="skill-form-actions">
                    <button class="skill-form-btn secondary" id="cancel-add">Cancel</button>
                    <button class="skill-form-btn primary" id="confirm-add">Create Skill</button>
                </div>
            </div>
        </div>
    `;

    body.querySelector('.skill-submenu-back').onclick = () => showAddSubmenu(node);
    body.querySelector('#cancel-add').onclick = closeEditCard;

    body.querySelectorAll('.skill-icon-option').forEach(opt => {
        opt.onclick = () => {
            body.querySelectorAll('.skill-icon-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            body.querySelector('#selected-icon').value = opt.dataset.icon;
        };
    });

    body.querySelector('#confirm-add').onclick = async () => {
        const name = body.querySelector('#new-skill-name').value.trim();
        const icon = body.querySelector('#selected-icon').value;

        if (!name) {
            new Notice('Please enter a skill name');
            return;
        }

        await createNewSkill(name, icon, node, type);
    };

    setTimeout(() => body.querySelector('#new-skill-name').focus(), 100);
}

async function createNewSkill(name, icon, referenceNode, type) {
    let parentName = '';
    let order = 1;

    if (type === 'child') {
        parentName = referenceNode.isImplicit ? '' : referenceNode.name;
        order = (referenceNode.children?.length || 0) + 1;
    } else if (type === 'sibling') {
        parentName = referenceNode.parent || '';
        const parent = allNodes.find(n => n.name === parentName);
        order = parent ? (parent.children?.length || 0) + 1 : (referenceNode.order || 0) + 1;
    } else if (type === 'parent') {
        parentName = referenceNode.parent || '';
        order = referenceNode.order || 1;
    }

    const content = `---
parent: "${parentName}"
icon: ${icon}
order: ${order}
---

# ${name}

`;

    const filePath = `${SKILL_FOLDER}/${name}.md`;

    try {
        await app.vault.create(filePath, content);

        if (type === 'parent' && referenceNode.file) {
            const file = app.vault.getAbstractFileByPath(referenceNode.file);
            if (file) {
                await app.fileManager.processFrontMatter(file, (fm) => {
                    fm.parent = name;
                });
            }
        }

        new Notice(`Created: ${name}`);
        closeEditCard();
        deselectNode();
        setTimeout(() => location.reload(), 500);
    } catch (err) {
        new Notice(`Error: ${err.message}`);
    }
}

// ==========================================
// EDIT SUBMENU
// ==========================================
function showEditSubmenu(node) {
    if (node.isImplicit) {
        new Notice('Cannot edit implicit root node');
        return;
    }

    const body = currentCard.querySelector('.skill-edit-card-body');

    const descendants = new Set();
    function collectDescendants(n) {
        descendants.add(n.id);
        if (n.children) n.children.forEach(collectDescendants);
    }
    collectDescendants(node);

    const potentialParents = allNodes.filter(n => !descendants.has(n.id) && !n.isImplicit);

    body.innerHTML = `
        <div class="skill-submenu">
            <div class="skill-submenu-back">
                ← Back to options
            </div>
            <div style="padding: 20px;">
                <div class="skill-edit-section-title">Edit Skill</div>

                <div class="skill-form-group">
                    <label>Name</label>
                    <input type="text" id="edit-skill-name" value="${node.name}">
                </div>

                <div class="skill-form-group">
                    <label>Parent</label>
                    <select id="edit-skill-parent">
                        <option value="">None (Root level)</option>
                        ${potentialParents.map(p => `
                            <option value="${p.name}" ${node.parent === p.name ? 'selected' : ''}>${p.name}</option>
                        `).join('')}
                    </select>
                </div>

                <div class="skill-form-group">
                    <label>Icon</label>
                    <div class="skill-icon-grid" id="icon-grid">
                        ${Object.keys(ICONS).map(iconName => `
                            <div class="skill-icon-option ${iconName === (node.icon || 'default') ? 'selected' : ''}" data-icon="${iconName}" title="${iconName}">
                                ${renderIconSVG(iconName)}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <input type="hidden" id="selected-icon" value="${node.icon || 'default'}">

                <div class="skill-form-actions">
                    <button class="skill-form-btn secondary" id="cancel-edit">Cancel</button>
                    <button class="skill-form-btn primary" id="confirm-edit">Save Changes</button>
                </div>
            </div>
        </div>
    `;

    body.querySelector('.skill-submenu-back').onclick = () => showEditCard(node);
    body.querySelector('#cancel-edit').onclick = closeEditCard;

    body.querySelectorAll('.skill-icon-option').forEach(opt => {
        opt.onclick = () => {
            body.querySelectorAll('.skill-icon-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            body.querySelector('#selected-icon').value = opt.dataset.icon;
        };
    });

    body.querySelector('#confirm-edit').onclick = async () => {
        const newName = body.querySelector('#edit-skill-name').value.trim();
        const newParent = body.querySelector('#edit-skill-parent').value;
        const newIcon = body.querySelector('#selected-icon').value;

        if (!newName) {
            new Notice('Name cannot be empty');
            return;
        }

        await updateSkill(node, newName, newParent, newIcon);
    };
}

async function updateSkill(node, newName, newParent, newIcon) {
    try {
        const file = app.vault.getAbstractFileByPath(node.file);
        if (!file) {
            new Notice('File not found');
            return;
        }

        await app.fileManager.processFrontMatter(file, (fm) => {
            fm.parent = newParent || '';
            fm.icon = newIcon;
        });

        if (newName !== node.name) {
            const newPath = `${SKILL_FOLDER}/${newName}.md`;
            await app.vault.rename(file, newPath);

            for (const child of (node.children || [])) {
                if (child.file) {
                    const childFile = app.vault.getAbstractFileByPath(child.file);
                    if (childFile) {
                        await app.fileManager.processFrontMatter(childFile, (fm) => {
                            fm.parent = newName;
                        });
                    }
                }
            }
        }

        new Notice(`Updated: ${newName}`);
        closeEditCard();
        deselectNode();
        setTimeout(() => location.reload(), 500);
    } catch (err) {
        new Notice(`Error: ${err.message}`);
    }
}

// ==========================================
// MOVE/REORDER SUBMENU
// ==========================================
function showMoveSubmenu(node) {
    if (node.isImplicit) {
        new Notice('Cannot reorder implicit root node');
        return;
    }

    const body = currentCard.querySelector('.skill-edit-card-body');

    const parent = allNodes.find(n => n.name === node.parent);
    const siblings = parent ? parent.children : allNodes.filter(n => n.level === node.level);
    const currentIndex = siblings.findIndex(s => s.id === node.id);

    body.innerHTML = `
        <div class="skill-submenu">
            <div class="skill-submenu-back">
                ← Back to options
            </div>
            <div style="padding: 20px;">
                <div class="skill-edit-section-title">Reorder "${node.name}"</div>
                <p style="color: #888; font-size: 12px; margin-bottom: 20px;">
                    Current position: ${currentIndex + 1} of ${siblings.length}
                </p>

                <div class="skill-edit-option" data-action="move-first" ${currentIndex === 0 ? 'style="opacity:0.5;pointer-events:none;"' : ''}>
                    <div class="skill-edit-option-icon move">⬆️</div>
                    <div class="skill-edit-option-text">
                        <h4>Move to First</h4>
                        <p>Place at the beginning</p>
                    </div>
                </div>

                <div class="skill-edit-option" data-action="move-up" ${currentIndex === 0 ? 'style="opacity:0.5;pointer-events:none;"' : ''}>
                    <div class="skill-edit-option-icon move">↑</div>
                    <div class="skill-edit-option-text">
                        <h4>Move Up</h4>
                        <p>Move one position up</p>
                    </div>
                </div>

                <div class="skill-edit-option" data-action="move-down" ${currentIndex === siblings.length - 1 ? 'style="opacity:0.5;pointer-events:none;"' : ''}>
                    <div class="skill-edit-option-icon move">↓</div>
                    <div class="skill-edit-option-text">
                        <h4>Move Down</h4>
                        <p>Move one position down</p>
                    </div>
                </div>

                <div class="skill-edit-option" data-action="move-last" ${currentIndex === siblings.length - 1 ? 'style="opacity:0.5;pointer-events:none;"' : ''}>
                    <div class="skill-edit-option-icon move">⬇️</div>
                    <div class="skill-edit-option-text">
                        <h4>Move to Last</h4>
                        <p>Place at the end</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    body.querySelector('.skill-submenu-back').onclick = () => showEditCard(node);

    body.querySelectorAll('.skill-edit-option').forEach(opt => {
        if (opt.style.pointerEvents !== 'none') {
            opt.onclick = () => reorderSkill(node, siblings, currentIndex, opt.dataset.action);
        }
    });
}

async function reorderSkill(node, siblings, currentIndex, action) {
    let newIndex;

    switch(action) {
        case 'move-first':
            newIndex = 0;
            break;
        case 'move-up':
            newIndex = currentIndex - 1;
            break;
        case 'move-down':
            newIndex = currentIndex + 1;
            break;
        case 'move-last':
            newIndex = siblings.length - 1;
            break;
    }

    const reordered = [...siblings];
    reordered.splice(currentIndex, 1);
    reordered.splice(newIndex, 0, node);

    try {
        for (let i = 0; i < reordered.length; i++) {
            const sibling = reordered[i];
            if (sibling.file) {
                const file = app.vault.getAbstractFileByPath(sibling.file);
                if (file) {
                    await app.fileManager.processFrontMatter(file, (fm) => {
                        fm.order = i + 1;
                    });
                }
            }
        }

        new Notice('Reordered successfully');
        closeEditCard();
        deselectNode();
        setTimeout(() => location.reload(), 500);
    } catch (err) {
        new Notice(`Error: ${err.message}`);
    }
}

// ==========================================
// DELETE CONFIRMATION
// ==========================================
function showDeleteConfirm(node) {
    if (node.isImplicit) {
        new Notice('Cannot delete implicit root node');
        return;
    }

    const hasChildren = node.children && node.children.length > 0;

    const body = currentCard.querySelector('.skill-edit-card-body');

    body.innerHTML = `
        <div class="skill-submenu">
            <div class="skill-submenu-back">
                ← Back to options
            </div>
            <div style="padding: 20px;">
                <div class="skill-edit-section-title" style="color: #ff6666;">Delete Skill</div>

                <div style="background: #3d1a1a; border: 1px solid #662222; border-radius: 10px; padding: 20px; margin: 20px 0;">
                    <p style="color: #ff9999; margin: 0 0 10px 0; font-size: 14px;">
                        ⚠️ Are you sure you want to delete "${node.name}"?
                    </p>
                    ${hasChildren ? `
                        <p style="color: #ff6666; margin: 0; font-size: 13px;">
                            <strong>Warning:</strong> This skill has ${node.children.length} child skill(s).
                            They will become orphaned and move to root level.
                        </p>
                    ` : ''}
                </div>

                <div class="skill-form-actions">
                    <button class="skill-form-btn secondary" id="cancel-delete">Cancel</button>
                    <button class="skill-form-btn danger" id="confirm-delete">Delete</button>
                </div>
            </div>
        </div>
    `;

    body.querySelector('.skill-submenu-back').onclick = () => showEditCard(node);
    body.querySelector('#cancel-delete').onclick = closeEditCard;
    body.querySelector('#confirm-delete').onclick = () => deleteSkill(node);
}

async function deleteSkill(node) {
    try {
        if (node.children) {
            for (const child of node.children) {
                if (child.file) {
                    const childFile = app.vault.getAbstractFileByPath(child.file);
                    if (childFile) {
                        await app.fileManager.processFrontMatter(childFile, (fm) => {
                            fm.parent = node.parent || '';
                        });
                    }
                }
            }
        }

        const file = app.vault.getAbstractFileByPath(node.file);
        if (file) {
            await app.vault.trash(file, true);
        }

        new Notice(`Deleted: ${node.name}`);
        closeEditCard();
        deselectNode();
        setTimeout(() => location.reload(), 500);
    } catch (err) {
        new Notice(`Error: ${err.message}`);
    }
}

// ==========================================
// HELPER: Render Icon SVG
// ==========================================
function renderIconSVG(iconName) {
    const icon = ICONS[iconName] || ICONS.default;
    return `<svg viewBox="${icon.viewBox}" style="fill:none;stroke:white;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;">${icon.path.replace(/currentColor/g, 'white')}</svg>`;
}

// ==========================================
// INTERACTION - FIXED COORDINATE CONVERSION
// ==========================================
function getNodeAtPosition(x, y) {
    for (const node of allNodes) {
        const dx = x - node.x;
        const dy = y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = node.level === 0 ? CONFIG.rootRadius : CONFIG.nodeRadius;
        if (dist < radius + 10) return node;
    }
    return null;
}

function openFile(node) {
    if (node.file) {
        window.location.href = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent(node.file)}`;
    } else if (!node.isImplicit) {
        const path = `${SKILL_FOLDER}/${node.name}.md`;
        window.location.href = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent(path)}`;
    }
}

// Mouse events - FIXED: removed -pan.x / -pan.y
canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();

    const rect = canvas.getBoundingClientRect();
    // FIXED: Removed - pan.x and - pan.y
    const x = (e.clientX - rect.left - rect.width/2) / zoom;
    const y = (e.clientY - rect.top - rect.height/2) / zoom;

    const clicked = getNodeAtPosition(x, y);

    if (clicked) {
        holdTimer = setTimeout(() => {
            if (!isDragging) {
                selectNode(clicked);
                if (navigator.vibrate) navigator.vibrate(50);
            }
        }, CONFIG.longPressTime);
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
        updateTransform();
        if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
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
            // FIXED: Removed - pan.x and - pan.y
            const x = (e.clientX - rect.left - rect.width/2) / zoom;
            const y = (e.clientY - rect.top - rect.height/2) / zoom;
            const clicked = getNodeAtPosition(x, y);
            if (clicked) openFile(clicked);
        }
    }
});

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    zoom = Math.max(0.25, Math.min(2, zoom * delta));
    updateTransform();
});

// Touch events - FIXED: removed -pan.x / -pan.y and improved detection
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    
    touchState.active = true;
    touchState.isHold = false;
    touchState.startTime = Date.now();
    // FIXED: Removed - pan.x and - pan.y from start position
    touchState.startPos = {
        x: (touch.clientX - rect.left - rect.width/2) / zoom,
        y: (touch.clientY - rect.top - rect.height/2) / zoom
    };
    touchState.currentPos = { ...touchState.startPos };
    
    const clickedNode = getNodeAtPosition(touchState.startPos.x, touchState.startPos.y);
    
    if (clickedNode) {
        touchState.nodeAtStart = clickedNode;
        touchState.holdTimer = setTimeout(() => {
            if (touchState.active && !touchState.isHold) {
                touchState.isHold = true;
                selectNode(clickedNode);
                if (navigator.vibrate) navigator.vibrate(50);
            }
        }, CONFIG.longPressTime);
    } else {
        isDragging = true;
        dragStart = { x: touch.clientX - pan.x, y: touch.clientY - pan.y };
        touchState.nodeAtStart = null;
    }
    
    if (e.touches.length === 2) {
        isDragging = false;
        if (touchState.holdTimer) {
            clearTimeout(touchState.holdTimer);
            touchState.holdTimer = null;
        }
        const t1 = e.touches[0], t2 = e.touches[1];
        touchDistance = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        lastTouchPos = { x: (t1.clientX + t2.clientX)/2, y: (t1.clientY + t2.clientY)/2 };
    }
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    
    if (e.touches.length === 1 && touchState.active) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        
        touchState.currentPos = {
            x: (touch.clientX - rect.left - rect.width/2) / zoom,
            y: (touch.clientY - rect.top - rect.height/2) / zoom
        };
        
        const distance = Math.hypot(
            touchState.currentPos.x - touchState.startPos.x,
            touchState.currentPos.y - touchState.startPos.y
        );
        
        if (distance > CONFIG.movementThreshold) {
            if (touchState.holdTimer) {
                clearTimeout(touchState.holdTimer);
                touchState.holdTimer = null;
            }
            
            if (isDragging) {
                pan.x = touch.clientX - dragStart.x;
                pan.y = touch.clientY - dragStart.y;
                updateTransform();
            }
        }
    } else if (e.touches.length === 2) {
        const t1 = e.touches[0], t2 = e.touches[1];
        const newDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const newCenter = { x: (t1.clientX + t2.clientX)/2, y: (t1.clientY + t2.clientY)/2 };
        
        if (touchDistance > 0) {
            zoom = Math.max(0.25, Math.min(2, zoom * (newDist / touchDistance)));
        }
        pan.x += newCenter.x - lastTouchPos.x;
        pan.y += newCenter.y - lastTouchPos.y;
        
        touchDistance = newDist;
        lastTouchPos = newCenter;
        updateTransform();
    }
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    
    const duration = Date.now() - touchState.startTime;
    const distance = Math.hypot(
        touchState.currentPos.x - touchState.startPos.x,
        touchState.currentPos.y - touchState.startPos.y
    );
    
    if (touchState.holdTimer) {
        clearTimeout(touchState.holdTimer);
        touchState.holdTimer = null;
    }
    
    if (touchState.isHold) {
        // Hold already handled
    } else if (distance < CONFIG.movementThreshold && duration < 300) {
        // Short tap - open file
        if (touchState.nodeAtStart) {
            openFile(touchState.nodeAtStart);
        }
    }
    
    // Reset touch state
    touchState = {
        active: false,
        startPos: { x: 0, y: 0 },
        currentPos: { x: 0, y: 0 },
        startTime: 0,
        holdTimer: null,
        isHold: false,
        nodeAtStart: null
    };
    isDragging = false;
    touchDistance = 0;
}, { passive: false });

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

function makeCtrlBtn(text, onClick) {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.style.cssText = `
        width: 45px;
        height: 45px;
        border-radius: 50%;
        background: ${CONFIG.nodeFill};
        border: none;
        color: ${CONFIG.bg};
        font-size: 20px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 0 15px rgba(255,255,255,0.3);
        touch-action: manipulation;
    `;
    btn.onclick = onClick;
    return btn;
}

controls.appendChild(makeCtrlBtn('+', () => { zoom = Math.min(2, zoom * 1.2); updateTransform(); }));
controls.appendChild(makeCtrlBtn('−', () => { zoom = Math.max(0.25, zoom * 0.8); updateTransform(); }));
controls.appendChild(makeCtrlBtn('⟲', () => { pan = {x:0, y:0}; zoom = CONFIG.initialZoom; updateTransform(); deselectNode(); }));
mainContainer.appendChild(controls);

// ==========================================
// EMPTY STATE
// ==========================================
function showEmptyState() {
    const empty = document.createElement('div');
    empty.className = 'skill-tree-empty';
    empty.innerHTML = `
        <h2>SKILL TREE</h2>
        <p style="color:${CONFIG.textMuted};margin-bottom:20px;">
            No skills found in:<br>
            <code>${SKILL_FOLDER}/</code>
        </p>
        <p style="color:${CONFIG.text};margin-bottom:15px;">
            Create your first skill note with this frontmatter:
        </p>
        <pre>---
parent: ""
icon: core
order: 1
---

# Core Basics</pre>
        <p style="color:${CONFIG.textMuted};margin-top:20px;font-size:12px;">
            Available icons: ${Object.keys(ICONS).join(', ')}
        </p>
    `;
    mainContainer.appendChild(empty);
}

// ==========================================
// INITIALIZE
// ==========================================
const skills = loadSkillsFromFolder();

if (skills.length === 0) {
    showEmptyState();
} else {
    treeRoot = buildTree(skills);
    if (treeRoot) {
        layoutTree(treeRoot, 0, CONFIG.arcCenter);
        allNodes = collectAllNodes(treeRoot);
        render();
    } else {
        showEmptyState();
    }
}

```