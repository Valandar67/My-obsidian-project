```dataviewjs
// ==========================================
// DRAWING SKILL TREE - ALGORITHMIC LAYOUT
// v2.0 - Polar Coordinate Auto-Placement
// ==========================================

const VAULT_NAME = "Alt society";
const SKILL_FOLDER = "Home/Starts/Drawing/Skill tree";

// ==========================================
// CONFIGURATION
// ==========================================
const CONFIG = {
    // Arc settings (270° arc, open at bottom)
    arcStart: -225,      // Lower-left (degrees)
    arcEnd: 45,          // Lower-right (degrees)
    arcCenter: -90,      // Top of screen (degrees) - straight up
    
    // Level radii (distance from center for each depth level)
    // Tighter spacing keeps tree compact
    radii: [0, 220, 380, 520, 650, 780],
    
    // Node sizes
    rootRadius: 50,
    nodeRadius: 38,
    
    // Canvas
    canvasSize: 2400,
    initialZoom: 0.6,
    
    // Colors (AMOLED)
    bg: "#000000",
    nodeFill: "#ffffff",
    nodeStroke: "#ffffff",
    connection: "#4a6a8d",
    connectionGlow: "rgba(74, 106, 141, 0.5)",
    text: "#ffffff",
    textMuted: "#888888"
};

// ==========================================
// SVG ICON LIBRARY
// ==========================================
const ICONS = {
    // Default
    default: {
        viewBox: "0 0 24 24",
        path: `<circle cx="12" cy="12" r="3" fill="currentColor"/>`
    },
    
    // Core/Fundamentals
    core: {
        viewBox: "0 0 24 24",
        path: `<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
    },
    
    pencil: {
        viewBox: "0 0 24 24",
        path: `<path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
    },
    
    // Anatomy
    anatomy: {
        viewBox: "0 0 24 24",
        path: `<circle cx="12" cy="5" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
               <path d="M12 8v4m-4 0h8m-6 0v8m4-8v8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`
    },
    
    gesture: {
        viewBox: "0 0 24 24",
        path: `<path d="M6 18c0-3 2-6 6-9s6-6 6-6M4 12c2-2 4-3 6-3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
               <circle cx="18" cy="3" r="2" fill="currentColor"/>`
    },
    
    muscle: {
        viewBox: "0 0 24 24",
        path: `<path d="M4 15c2-4 5-5 8-3 3 2 5 1 8-3M4 11c2-4 5-5 8-3 3 2 5 1 8-3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>`
    },
    
    bone: {
        viewBox: "0 0 24 24",
        path: `<path d="M6 4a2 2 0 1 0 0 4 2 2 0 0 0 2-2l4 12a2 2 0 0 0-2 2 2 2 0 1 0 4 0 2 2 0 0 0-2-2l4-12a2 2 0 0 0 2 2 2 2 0 1 0 0-4 2 2 0 0 0-2 2H8a2 2 0 0 0-2-2z" stroke="currentColor" stroke-width="1.5" fill="none"/>`
    },
    
    // Line & Form
    line: {
        viewBox: "0 0 24 24",
        path: `<path d="M4 20L20 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
               <circle cx="4" cy="20" r="2" fill="currentColor"/>
               <circle cx="20" cy="4" r="2" fill="currentColor"/>`
    },
    
    shapes: {
        viewBox: "0 0 24 24",
        path: `<rect x="3" y="11" width="8" height="8" stroke="currentColor" stroke-width="2" fill="none"/>
               <circle cx="16" cy="8" r="5" stroke="currentColor" stroke-width="2" fill="none"/>
               <polygon points="12,3 16,10 8,10" stroke="currentColor" stroke-width="2" fill="none"/>`
    },
    
    cube: {
        viewBox: "0 0 24 24",
        path: `<path d="M12 2l9 5v10l-9 5-9-5V7l9-5z" stroke="currentColor" stroke-width="2" fill="none"/>
               <path d="M12 22V12M12 12l9-5M12 12l-9-5" stroke="currentColor" stroke-width="2"/>`
    },
    
    contour: {
        viewBox: "0 0 24 24",
        path: `<path d="M4 12c0-4 3-8 8-8s8 4 8 8-3 8-8 8" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-dasharray="4 2"/>
               <path d="M8 12c0-2 2-4 4-4s4 2 4 4-2 4-4 4" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="4 2"/>`
    },
    
    // Observation
    eye: {
        viewBox: "0 0 24 24",
        path: `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" fill="none"/>
               <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/>`
    },
    
    negative: {
        viewBox: "0 0 24 24",
        path: `<rect x="3" y="3" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"/>
               <path d="M8 8h8v8H8z" fill="currentColor"/>`
    },
    
    grid: {
        viewBox: "0 0 24 24",
        path: `<path d="M3 3v18h18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
               <path d="M7 21V7h14" stroke="currentColor" stroke-width="1.5" fill="none" stroke-dasharray="2 2"/>
               <path d="M11 21V11h10" stroke="currentColor" stroke-width="1.5" fill="none" stroke-dasharray="2 2"/>`
    },
    
    perspective: {
        viewBox: "0 0 24 24",
        path: `<path d="M2 20h20M12 4v4M4 20l8-12 8 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
               <circle cx="12" cy="4" r="2" fill="currentColor"/>`
    },
    
    // Value & Light
    light: {
        viewBox: "0 0 24 24",
        path: `<circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2" fill="none"/>
               <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`
    },
    
    sphere: {
        viewBox: "0 0 24 24",
        path: `<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" fill="none"/>
               <ellipse cx="12" cy="12" rx="9" ry="3" stroke="currentColor" stroke-width="1" fill="none"/>
               <path d="M12 3c-2 3-2 15 0 18" stroke="currentColor" stroke-width="1" fill="none"/>`
    },
    
    shadow: {
        viewBox: "0 0 24 24",
        path: `<circle cx="10" cy="10" r="6" stroke="currentColor" stroke-width="2" fill="none"/>
               <ellipse cx="14" cy="19" rx="6" ry="2" fill="currentColor" opacity="0.5"/>`
    },
    
    hatching: {
        viewBox: "0 0 24 24",
        path: `<path d="M4 4l16 16M8 4l12 12M12 4l8 8M4 8l12 12M4 12l8 8M4 16l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`
    },
    
    // Still life / objects
    vase: {
        viewBox: "0 0 24 24",
        path: `<path d="M9 3h6v3c2 1 4 4 4 8v2c0 2-1 4-4 5H9c-3-1-4-3-4-5v-2c0-4 2-7 4-8V3z" stroke="currentColor" stroke-width="2" fill="none"/>`
    },
    
    fruit: {
        viewBox: "0 0 24 24",
        path: `<circle cx="12" cy="14" r="7" stroke="currentColor" stroke-width="2" fill="none"/>
               <path d="M12 7V4M10 5c0-2 4-2 4 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`
    }
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
        }
        .skill-tree-canvas:active { cursor: grabbing; }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        .skill-action-menu {
            position: fixed;
            display: flex;
            gap: 12px;
            z-index: 10000;
            animation: fadeIn 0.2s ease;
        }
        
        .skill-action-btn {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: ${CONFIG.nodeFill};
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform 0.15s ease;
            box-shadow: 0 0 20px rgba(255,255,255,0.3);
        }
        .skill-action-btn:active { transform: scale(0.9); }
        
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
    background: ${CONFIG.bg};
    position: fixed;
    top: 0;
    left: 0;
    overflow: hidden;
`;

// ==========================================
// DATA LOADING FROM OBSIDIAN NOTES
// ==========================================
function loadSkillsFromFolder() {
    const pages = dv.pages(`"${SKILL_FOLDER}"`);
    const skills = [];
    
    for (const page of pages) {
        // Normalize parent field (handle [[links]] or plain text)
        let parent = page.parent || null;
        if (parent) {
            // Remove [[ ]] if present
            parent = String(parent).replace(/^\[\[/, '').replace(/\]\]$/, '');
            // Get just the filename if it's a path
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
    
    // Create a map for quick lookup
    const skillMap = new Map();
    skills.forEach(s => skillMap.set(s.id, { ...s, children: [] }));
    
    let root = null;
    const orphans = [];
    
    // Build parent-child relationships
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
            // Parent specified but not found - treat as orphan
            orphans.push(skill);
        }
    });
    
    // If no root found, create implicit root
    if (!root && orphans.length > 0) {
        root = {
            id: '__root__',
            name: 'Core',
            icon: 'core',
            children: orphans,
            isImplicit: true
        };
    } else if (root && orphans.length > 0) {
        // Attach orphans to root
        root.children.push(...orphans);
    }
    
    // Sort children by order
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
// Key insight: Children cluster around parent's direction, not spread across full sector

function layoutTree(node, level = 0, inheritedAngle = CONFIG.arcCenter) {
    if (!node) return;
    
    const radius = CONFIG.radii[level] || CONFIG.radii[CONFIG.radii.length - 1] + (level - CONFIG.radii.length + 1) * 150;
    
    // Position this node
    node.level = level;
    
    if (level === 0) {
        // Root at center
        node.x = 0;
        node.y = 0;
        node.angle = CONFIG.arcCenter; // -90° = straight up
    } else {
        // Place at inherited angle
        node.angle = inheritedAngle;
        const angleRad = (node.angle * Math.PI) / 180;
        node.x = radius * Math.cos(angleRad);
        node.y = radius * Math.sin(angleRad);
    }
    
    // Layout children
    if (node.children && node.children.length > 0) {
        const childCount = node.children.length;
        
        if (level === 0) {
            // LEVEL 1: Distribute main branches evenly across the 270° arc
            // Use padding so they don't sit at the extreme edges
            const arcSpan = CONFIG.arcEnd - CONFIG.arcStart; // 270°
            const padding = 15; // degrees from edge
            const usableArc = arcSpan - (padding * 2);
            
            if (childCount === 1) {
                // Single child goes straight up
                node.children[0].angle = CONFIG.arcCenter;
                layoutTree(node.children[0], 1, CONFIG.arcCenter);
            } else {
                // Multiple children spread evenly
                const step = usableArc / (childCount - 1);
                node.children.forEach((child, i) => {
                    const childAngle = CONFIG.arcStart + padding + (i * step);
                    layoutTree(child, 1, childAngle);
                });
            }
        } else {
            // LEVEL 2+: Children cluster around parent's angle
            // Spread decreases with depth for tighter clustering
            const baseSpread = 35; // degrees between siblings at level 2
            const spreadReduction = 0.7; // multiply spread by this each level
            const spreadPerChild = baseSpread * Math.pow(spreadReduction, level - 1);
            
            const totalSpread = spreadPerChild * (childCount - 1);
            const startAngle = node.angle - (totalSpread / 2);
            
            node.children.forEach((child, i) => {
                const childAngle = childCount === 1 
                    ? node.angle  // Single child continues straight
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
let holdTimer = null;
let touchDistance = 0;
let lastTouchPos = { x: 0, y: 0 };
let activeMenu = null;
let touchStartTime = 0;
let touchMoved = false;
let treeRoot = null;
let allNodes = [];

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
    
    // Simple straight white line
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
    const radius = isRoot ? CONFIG.rootRadius : CONFIG.nodeRadius;
    
    // Glow
    ctx.shadowBlur = isRoot ? 25 : 15;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    
    // Circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = CONFIG.nodeFill;
    ctx.fill();
    
    ctx.shadowBlur = 0;
    
    // Icon
    drawIcon(x, y, radius * 0.6, node.icon || 'default');
    
    // Label
    ctx.fillStyle = CONFIG.text;
    ctx.font = `${isRoot ? 13 : 11}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // Word wrap for labels
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

function drawIcon(x, y, size, iconName) {
    const icon = ICONS[iconName] || ICONS.default;
    
    // Create temporary SVG to render
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", icon.viewBox);
    svg.setAttribute("width", size * 2);
    svg.setAttribute("height", size * 2);
    svg.innerHTML = icon.path.replace(/currentColor/g, CONFIG.bg);
    
    // Convert to image
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    
    // Draw (might need to cache these for performance)
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
    
    // Draw connections first
    function drawConnections(node) {
        if (node.children) {
            node.children.forEach(child => {
                drawConnection(node, child);
                drawConnections(child);
            });
        }
    }
    drawConnections(treeRoot);
    
    // Draw nodes
    allNodes.forEach(node => drawNode(node));
}

// ==========================================
// INTERACTION
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

function removeMenu() {
    if (activeMenu) {
        activeMenu.remove();
        activeMenu = null;
    }
}

function openFile(node) {
    if (node.file) {
        window.location.href = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent(node.file)}`;
    } else if (!node.isImplicit) {
        // Create new file
        const path = `${SKILL_FOLDER}/${node.name}.md`;
        window.location.href = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent(path)}`;
    }
}

function showActionMenu(node, clientX, clientY) {
    removeMenu();
    
    const menu = document.createElement('div');
    menu.className = 'skill-action-menu';
    menu.style.left = (clientX - 60) + 'px';
    menu.style.top = (clientY - 70) + 'px';
    
    // Open button
    const openBtn = document.createElement('div');
    openBtn.className = 'skill-action-btn';
    openBtn.innerHTML = `<span style="font-size:20px;">📄</span>`;
    openBtn.onclick = (e) => { e.stopPropagation(); removeMenu(); openFile(node); };
    menu.appendChild(openBtn);
    
    // Add child button
    const addBtn = document.createElement('div');
    addBtn.className = 'skill-action-btn';
    addBtn.innerHTML = `<span style="font-size:20px;">➕</span>`;
    addBtn.onclick = (e) => { e.stopPropagation(); removeMenu(); addChild(node); };
    menu.appendChild(addBtn);
    
    document.body.appendChild(menu);
    activeMenu = menu;
    
    setTimeout(() => {
        const closeHandler = (e) => {
            if (!menu.contains(e.target)) {
                removeMenu();
                document.removeEventListener('click', closeHandler);
                document.removeEventListener('touchstart', closeHandler);
            }
        };
        document.addEventListener('click', closeHandler);
        document.addEventListener('touchstart', closeHandler);
    }, 100);
}

async function addChild(parentNode) {
    const name = prompt('New skill name:');
    if (!name || !name.trim()) return;
    
    const parentName = parentNode.isImplicit ? '' : parentNode.name;
    const iconList = Object.keys(ICONS).join(', ');
    const icon = prompt(`Icon (${iconList}):`, 'default') || 'default';
    
    const content = `---
parent: "${parentName}"
icon: ${icon}
order: ${(parentNode.children?.length || 0) + 1}
---

# ${name.trim()}

`;

    const filePath = `${SKILL_FOLDER}/${name.trim()}.md`;
    
    try {
        await app.vault.create(filePath, content);
        new Notice(`Created: ${name.trim()}`);
        // Reload
        setTimeout(() => location.reload(), 500);
    } catch (err) {
        new Notice(`Error: ${err.message}`);
    }
}

// Mouse events
canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();
    removeMenu();
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width/2 - pan.x) / zoom;
    const y = (e.clientY - rect.top - rect.height/2 - pan.y) / zoom;
    
    const clicked = getNodeAtPosition(x, y);
    
    if (clicked) {
        holdTimer = setTimeout(() => {
            if (!isDragging) showActionMenu(clicked, e.clientX, e.clientY);
        }, 400);
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
            const x = (e.clientX - rect.left - rect.width/2 - pan.x) / zoom;
            const y = (e.clientY - rect.top - rect.height/2 - pan.y) / zoom;
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

// Touch events
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    removeMenu();
    touchStartTime = Date.now();
    touchMoved = false;
    
    if (e.touches.length === 1) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = (touch.clientX - rect.left - rect.width/2 - pan.x) / zoom;
        const y = (touch.clientY - rect.top - rect.height/2 - pan.y) / zoom;
        
        const clicked = getNodeAtPosition(x, y);
        if (clicked) {
            holdTimer = setTimeout(() => {
                if (!touchMoved) showActionMenu(clicked, touch.clientX, touch.clientY);
            }, 400);
        } else {
            isDragging = true;
            dragStart = { x: touch.clientX - pan.x, y: touch.clientY - pan.y };
        }
        lastTouchPos = { x: touch.clientX, y: touch.clientY };
    } else if (e.touches.length === 2) {
        isDragging = false;
        if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
        const t1 = e.touches[0], t2 = e.touches[1];
        touchDistance = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        lastTouchPos = { x: (t1.clientX + t2.clientX)/2, y: (t1.clientY + t2.clientY)/2 };
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    touchMoved = true;
    
    if (e.touches.length === 1 && isDragging) {
        const touch = e.touches[0];
        pan.x = touch.clientX - dragStart.x;
        pan.y = touch.clientY - dragStart.y;
        updateTransform();
        if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
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
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (e.touches.length === 0) {
        const duration = Date.now() - touchStartTime;
        isDragging = false;
        touchDistance = 0;
        
        if (holdTimer) {
            clearTimeout(holdTimer);
            holdTimer = null;
            
            if (!touchMoved && duration < 300 && e.changedTouches.length > 0) {
                const touch = e.changedTouches[0];
                const rect = canvas.getBoundingClientRect();
                const x = (touch.clientX - rect.left - rect.width/2 - pan.x) / zoom;
                const y = (touch.clientY - rect.top - rect.height/2 - pan.y) / zoom;
                const clicked = getNodeAtPosition(x, y);
                if (clicked) openFile(clicked);
            }
        }
    }
});

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
    `;
    btn.onclick = onClick;
    return btn;
}

controls.appendChild(makeCtrlBtn('+', () => { zoom = Math.min(2, zoom * 1.2); updateTransform(); }));
controls.appendChild(makeCtrlBtn('−', () => { zoom = Math.max(0.25, zoom * 0.8); updateTransform(); }));
controls.appendChild(makeCtrlBtn('⟲', () => { pan = {x:0, y:0}; zoom = CONFIG.initialZoom; updateTransform(); }));
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