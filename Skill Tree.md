```dataviewjs
// ==========================================
// DRAWING SKILL TREE - CONSTELLATION EDITION
// v3.0 - Settings panel, layouts, star constellation effects
// ==========================================

const DEBUG_MODE = false;

function logDebug(...args) {
    if (DEBUG_MODE) console.log('[SkillTree]', ...args);
}

// ==========================================
// SETTINGS PERSISTENCE
// ==========================================
const SETTINGS_KEY = 'skill-tree-settings-v3';

function loadSettings() {
    try {
        const saved = localStorage.getItem(SETTINGS_KEY);
        if (saved) return JSON.parse(saved);
    } catch (e) {
        logDebug('Failed to load settings:', e);
    }
    return {
        skillFolder: "Home/Starts/Drawing/Skill tree",
        treeTitle: "",
        layoutStyle: "radial" // radial, top-down, bottom-up, left-right
    };
}

function saveSettings(settings) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
        logDebug('Failed to save settings:', e);
    }
}

let settings = loadSettings();

// ==========================================
// FULLSCREEN STATE
// ==========================================
const FULLSCREEN_KEY = 'skill-tree-fullscreen-v1';

function loadFullscreenState() {
    try {
        const saved = localStorage.getItem(FULLSCREEN_KEY);
        if (saved !== null) return saved === 'true';
    } catch (e) {}
    return false; // Default to minimized
}

function saveFullscreenState(isFullscreen) {
    try {
        localStorage.setItem(FULLSCREEN_KEY, isFullscreen ? 'true' : 'false');
    } catch (e) {}
}

let isFullscreen = loadFullscreenState();

// ==========================================
// CONFIGURATION
// ==========================================
const CONFIG = {
    // Level spacing for different layouts
    levelSpacing: 120,
    radii: [0, 160, 280, 380, 470, 560],

    // Arc settings for radial layout
    arcStart: -225,
    arcEnd: 45,
    arcCenter: -90,

    // Node sizes
    rootRadius: 40,
    nodeRadius: 32,

    // Canvas
    canvasSize: 1200,
    initialZoom: 0.6,

    // Timing
    longPressTime: 400,
    movementThreshold: 8,

    // Colors (Black & White constellation theme)
    bg: "#000000",
    nodeFill: "#ffffff",
    nodeStroke: "#888888",
    selectedGlow: "#ffffff",
    selectedFill: "#ffffff",
    connection: "#333333",
    connectionGlow: "rgba(255, 255, 255, 0.15)",
    text: "#ffffff",
    textMuted: "#666666",
    border: "#333333",
    borderHover: "#555555"
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

        /* ==========================================
           ANIMATIONS - Aligned with Workout Hub patterns
           ========================================== */

        /* Modal backdrop fade - matches Workout Hub modal-fade-in */
        @keyframes modal-fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        /* Modal content slide - matches Workout Hub modal-slide-up */
        @keyframes modal-slide-up {
            from { transform: translate(-50%, -50%) translateY(30px) scale(0.98); opacity: 0; }
            to { transform: translate(-50%, -50%) translateY(0) scale(1); opacity: 1; }
        }

        /* Button press feedback - matches Workout Hub button-press */
        @keyframes button-press {
            0% { transform: scale(1); }
            50% { transform: scale(0.96); }
            100% { transform: scale(1); }
        }

        /* Flash effect - matches Workout Hub flash-out */
        @keyframes flash-out {
            0% { opacity: 0.8; transform: scale(0.5); }
            100% { opacity: 0; transform: scale(1.5); }
        }

        /* Selection label fade */
        @keyframes fadeInLabel {
            from { opacity: 0; transform: translateX(-50%) scale(0.95); }
            to { opacity: 1; transform: translateX(-50%) scale(1); }
        }

        /* Soft pulse for selected items - restrained version */
        @keyframes pulse-soft {
            0%, 100% { box-shadow: 0 0 15px rgba(255, 255, 255, 0.3); }
            50% { box-shadow: 0 0 25px rgba(255, 255, 255, 0.5); }
        }

        /* Star twinkling - subtle opacity transition */
        @keyframes starTwinkle {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
        }

        /* Constellation ambient glow - subtle breathing */
        @keyframes constellationGlow {
            0%, 100% { box-shadow: 0 0 20px rgba(255,255,255,0.1), inset 0 0 30px rgba(255,255,255,0.02); }
            50% { box-shadow: 0 0 30px rgba(255,255,255,0.2), inset 0 0 40px rgba(255,255,255,0.05); }
        }

        /* Submenu slide transition */
        @keyframes slideIn {
            from { opacity: 0; transform: translateX(10px); }
            to { opacity: 1; transform: translateX(0); }
        }

        /* Touch ripple effect */
        @keyframes touch-ripple {
            0% {
                transform: translate(-50%, -50%) scale(0);
                opacity: 0.6;
            }
            100% {
                transform: translate(-50%, -50%) scale(2.5);
                opacity: 0;
            }
        }

        .touch-ripple {
            position: absolute;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%);
            pointer-events: none;
            animation: touch-ripple 0.5s ease-out forwards;
            z-index: 100;
        }

        /* Progress indicator for long operations */
        @keyframes progress-pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
        }

        .skill-progress-indicator {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.95);
            border: 1px solid #333;
            padding: 20px 32px;
            z-index: 10002;
            display: flex;
            align-items: center;
            gap: 16px;
            animation: modal-fade-in 0.2s ease;
        }

        .skill-progress-indicator .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid #333;
            border-top-color: #fff;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .skill-progress-indicator .message {
            color: #ccc;
            font-size: 13px;
            font-family: "Courier New", monospace;
            letter-spacing: 1px;
        }

        /* Selection indicator label - Enhanced */
        .skill-selection-label {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.95);
            border: 1px solid #444;
            color: #fff;
            padding: 8px 16px;
            font-size: 10px;
            font-weight: 400;
            font-family: "Courier New", monospace;
            letter-spacing: 2px;
            text-transform: uppercase;
            z-index: 1000;
            animation: fadeInLabel 0.3s ease forwards, pulse-soft 4s ease-in-out infinite;
            display: flex;
            align-items: center;
            gap: 10px;
            max-width: 80vw;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            box-shadow: 0 4px 20px rgba(0,0,0,0.6), 0 0 30px rgba(255,255,255,0.05);
        }

        .skill-selection-label::before {
            content: '◈';
            font-size: 12px;
            opacity: 0.8;
            animation: starTwinkle 2s ease-in-out infinite;
        }

        .skill-selection-label strong {
            color: #fff;
            text-shadow: 0 0 10px rgba(255,255,255,0.3);
        }

        .skill-selection-label .deselect {
            background: transparent;
            border: 1px solid #555;
            color: #999;
            width: 24px;
            height: 24px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            transition: all 0.3s ease;
            margin-left: 4px;
        }

        .skill-selection-label .deselect:hover {
            border-color: #fff;
            color: #fff;
            box-shadow: 0 0 12px rgba(255,255,255,0.4);
            animation: button-press 0.2s ease;
        }

        /* Edit Card Modal - matches Workout Hub modal timing */
        .skill-edit-card {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #0a0a0a;
            border: 1px solid #222;
            padding: 0;
            min-width: 320px;
            max-width: 90vw;
            max-height: 85vh;
            overflow: hidden;
            z-index: 10001;
            animation: modal-slide-up 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards, constellationGlow 6s ease-in-out infinite;
            box-shadow: 0 40px 120px rgba(0, 0, 0, 0.9);
            transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .skill-edit-card-header {
            background: linear-gradient(180deg, #111 0%, #0a0a0a 100%);
            border-bottom: 1px solid #222;
            position: relative;
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .skill-edit-card-header h3 {
            margin: 0;
            color: #fff;
            font-size: 11px;
            font-weight: 300;
            font-family: "Courier New", monospace;
            letter-spacing: 3px;
            text-transform: uppercase;
        }

        .skill-edit-card-header h3::before {
            content: '✧ ';
            opacity: 0.5;
        }

        .skill-edit-card-close {
            background: transparent;
            border: 1px solid #333;
            color: #666;
            width: 28px;
            height: 28px;
            cursor: pointer;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }

        .skill-edit-card-close:hover {
            border-color: #fff;
            color: #fff;
            box-shadow: 0 0 15px rgba(255,255,255,0.2);
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
            color: #555;
            font-size: 9px;
            font-family: "Courier New", monospace;
            text-transform: uppercase;
            letter-spacing: 3px;
            margin-bottom: 12px;
        }

        .skill-edit-section-title::before {
            content: '— ';
            opacity: 0.3;
        }

        .skill-edit-option {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 14px;
            background: transparent;
            margin-bottom: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 1px solid #1a1a1a;
            position: relative;
        }

        .skill-edit-option::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 2px;
            height: 0;
            background: #fff;
            transition: height 0.3s ease;
        }

        .skill-edit-option:hover {
            background: rgba(255,255,255,0.02);
            border-color: #333;
        }

        .skill-edit-option:hover::before {
            height: 60%;
        }

        .skill-edit-option:active {
            transform: scale(0.99);
        }

        .skill-edit-option-icon {
            width: 40px;
            height: 40px;
            background: transparent;
            border: 1px solid #222;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            transition: all 0.3s ease;
        }

        .skill-edit-option:hover .skill-edit-option-icon {
            border-color: #444;
            box-shadow: 0 0 10px rgba(255,255,255,0.05);
        }

        .skill-edit-option-icon.add { border-color: #2a2a2a; }
        .skill-edit-option-icon.edit { border-color: #2a2a2a; }
        .skill-edit-option-icon.delete { border-color: #2a2a2a; }
        .skill-edit-option-icon.move { border-color: #2a2a2a; }

        .skill-edit-option-text h4 {
            margin: 0 0 3px 0;
            color: #ccc;
            font-size: 13px;
            font-weight: 400;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            letter-spacing: 0.5px;
        }

        .skill-edit-option-text p {
            margin: 0;
            color: #555;
            font-size: 11px;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            font-style: normal;
        }

        /* Sub-menu panels */
        .skill-submenu {
            animation: slideIn 0.2s ease;
        }

        .skill-submenu-back {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 14px 20px;
            background: #0a0a0a;
            cursor: pointer;
            border-bottom: 1px solid #1a1a1a;
            color: #555;
            font-size: 11px;
            font-family: "Courier New", monospace;
            letter-spacing: 1px;
            transition: all 0.3s ease;
        }

        .skill-submenu-back:hover {
            background: #111;
            color: #fff;
        }

        /* Form inputs */
        .skill-form-group {
            margin-bottom: 15px;
        }

        .skill-form-group label {
            display: block;
            color: #555;
            font-size: 9px;
            font-family: "Courier New", monospace;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .skill-form-group input,
        .skill-form-group select {
            width: 100%;
            padding: 12px 14px;
            background: #0a0a0a;
            border: 1px solid #222;
            color: #fff;
            font-size: 14px;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            outline: none;
            transition: all 0.3s ease;
        }

        .skill-form-group input:focus,
        .skill-form-group select:focus {
            border-color: #444;
            box-shadow: 0 0 15px rgba(255,255,255,0.05);
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
            padding: 12px;
            border: 1px solid #222;
            background: transparent;
            font-size: 10px;
            font-weight: 400;
            font-family: "Courier New", monospace;
            letter-spacing: 2px;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .skill-form-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            transition: left 0.5s ease;
        }

        .skill-form-btn:hover::before {
            left: 100%;
        }

        .skill-form-btn.primary {
            background: #111;
            border-color: #333;
            color: #fff;
        }

        .skill-form-btn.primary:hover {
            background: #1a1a1a;
            box-shadow: 0 0 20px rgba(255,255,255,0.1);
        }

        .skill-form-btn.secondary {
            background: transparent;
            color: #666;
        }

        .skill-form-btn.secondary:hover {
            background: #111;
            color: #fff;
        }

        .skill-form-btn.danger {
            background: transparent;
            border-color: #333;
            color: #888;
        }

        .skill-form-btn.danger:hover {
            background: #1a1a1a;
            color: #fff;
        }

        /* Overlay - matches Workout Hub modal backdrop */
        .skill-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            z-index: 10000;
            animation: modal-fade-in 0.3s ease-out;
            backdrop-filter: blur(4px);
            transition: opacity 0.2s ease;
        }

        /* Icon grid */
        .skill-icon-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 6px;
            max-height: 200px;
            overflow-y: auto;
            padding: 5px;
        }

        .skill-icon-option {
            width: 46px;
            height: 46px;
            background: transparent;
            border: 1px solid #1a1a1a;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }

        .skill-icon-option:hover {
            background: rgba(255,255,255,0.03);
            border-color: #333;
        }

        .skill-icon-option.selected {
            border-color: #fff;
            background: rgba(255,255,255,0.05);
            box-shadow: 0 0 15px rgba(255,255,255,0.1);
        }

        .skill-icon-option svg {
            width: 22px;
            height: 22px;
        }

        .skill-tree-empty {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            color: #fff;
            max-width: 400px;
            padding: 40px;
            border: 1px solid #222;
            background: #0a0a0a;
            animation: constellationGlow 6s ease-in-out infinite;
        }
        .skill-tree-empty h2 {
            font-size: 11px;
            font-family: "Courier New", monospace;
            letter-spacing: 4px;
            text-transform: uppercase;
            margin-bottom: 20px;
            color: #fff;
        }
        .skill-tree-empty h2::before {
            content: '✦ ';
            opacity: 0.5;
        }
        .skill-tree-empty pre {
            background: #0a0a0a;
            border: 1px solid #222;
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
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .skill-tree-container.minimized {
            position: relative;
            width: 100%;
            height: 400px;
            border-radius: 8px;
            border: 1px solid #222;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }

        .skill-tree-container.minimized .skill-tree-canvas {
            transform-origin: center center;
        }

        /* Adjust controls position when minimized */
        .skill-tree-container.minimized .skill-tree-controls {
            bottom: 12px;
            right: 8px;
        }

        .skill-tree-container.minimized .skill-tree-controls button {
            width: 42px;
            height: 42px;
            font-size: 18px;
            box-shadow: none !important;
        }

        /* Hide title in minimized mode */
        .skill-tree-container.minimized .skill-tree-title {
            display: none !important;
        }

        /* Adjust selection label in minimized mode */
        .skill-tree-container.minimized .skill-selection-label {
            position: absolute !important;
            top: 10px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            padding: 6px 12px;
            font-size: 9px;
            max-width: calc(100% - 120px);
            z-index: 200;
            animation: none;
        }

        /* Adjust overlay in minimized mode */
        .skill-tree-container.minimized .skill-overlay {
            position: absolute;
            border-radius: 8px;
        }

        /* Adjust edit card in minimized mode */
        .skill-tree-container.minimized .skill-edit-card {
            position: absolute;
            max-height: 360px;
        }

        .skill-tree-container.minimized .skill-edit-card-body {
            max-height: 280px;
        }

        /* Adjust progress indicator in minimized mode */
        .skill-tree-container.minimized .skill-progress-indicator {
            position: absolute;
        }

        /* Adjust settings panel in minimized mode */
        .skill-tree-container.minimized .skill-settings-panel {
            position: absolute;
            height: 100%;
            max-height: 400px;
        }

        .skill-tree-container.minimized .skill-settings-body {
            max-height: 280px;
        }

        /* Adjust settings overlay in minimized mode */
        .skill-tree-container.minimized .skill-settings-overlay {
            position: absolute;
            border-radius: 8px;
        }

        @media (max-width: 768px) {
            .skill-selection-label {
                font-size: 16px;
                padding: 12px 24px;
            }
        }

        /* ==========================================
           SETTINGS PANEL STYLES
           ========================================== */
        .skill-settings-panel {
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
        }

        .skill-settings-panel.open {
            transform: translateX(0);
        }

        .skill-settings-header {
            padding: 24px 20px;
            border-bottom: 1px solid #222;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .skill-settings-header h3 {
            margin: 0;
            color: #fff;
            font-size: 10px;
            font-family: "Courier New", monospace;
            letter-spacing: 3px;
            text-transform: uppercase;
        }

        .skill-settings-header h3::before {
            content: '✧ ';
            opacity: 0.5;
        }

        .skill-settings-close {
            background: transparent;
            border: 1px solid #333;
            color: #666;
            width: 28px;
            height: 28px;
            cursor: pointer;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }

        .skill-settings-close:hover {
            border-color: #fff;
            color: #fff;
        }

        .skill-settings-body {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
        }

        .skill-settings-section {
            margin-bottom: 28px;
        }

        .skill-settings-section-title {
            color: #555;
            font-size: 9px;
            font-family: "Courier New", monospace;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 14px;
            padding-bottom: 8px;
            border-bottom: 1px solid #1a1a1a;
        }

        .skill-settings-section-title::before {
            content: '— ';
            opacity: 0.3;
        }

        .skill-settings-input {
            width: 100%;
            padding: 12px 14px;
            background: #111;
            border: 1px solid #222;
            color: #fff;
            font-size: 13px;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            outline: none;
            transition: all 0.3s ease;
            box-sizing: border-box;
        }

        .skill-settings-input:focus {
            border-color: #444;
            box-shadow: 0 0 15px rgba(255,255,255,0.05);
        }

        .skill-settings-input::placeholder {
            color: #444;
        }

        .skill-layout-options {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .skill-layout-option {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px;
            background: transparent;
            border: 1px solid #1a1a1a;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .skill-layout-option:hover {
            background: rgba(255,255,255,0.02);
            border-color: #333;
        }

        .skill-layout-option.active {
            border-color: #555;
            background: rgba(255,255,255,0.03);
        }

        .skill-layout-option.active::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 2px;
            background: #fff;
        }

        .skill-layout-option {
            position: relative;
        }

        .skill-layout-icon {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #333;
            color: #666;
            font-size: 14px;
        }

        .skill-layout-option.active .skill-layout-icon {
            border-color: #666;
            color: #fff;
        }

        .skill-layout-text h4 {
            margin: 0 0 2px 0;
            color: #ccc;
            font-size: 12px;
            font-weight: 400;
        }

        .skill-layout-text p {
            margin: 0;
            color: #555;
            font-size: 10px;
        }

        .skill-settings-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            z-index: 10000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }

        .skill-settings-overlay.open {
            opacity: 1;
            visibility: visible;
        }

        /* Fixed title at top - positioned below right icons */
        .skill-tree-title {
            position: fixed;
            top: 120px;
            left: 0;
            right: 0;
            width: 100%;
            text-align: center;
            color: #fff;
            font-size: 13px;
            font-family: "Courier New", monospace;
            letter-spacing: 3px;
            text-transform: uppercase;
            z-index: 100;
            pointer-events: none;
            text-shadow: 0 0 20px rgba(0,0,0,0.8);
        }

        .skill-tree-title::before,
        .skill-tree-title::after {
            content: '✦';
            margin: 0 10px;
            opacity: 0.4;
            font-size: 10px;
        }
    `;
    document.head.appendChild(style);
}

// ==========================================
// MAIN CONTAINER
// ==========================================
const mainContainer = dv.el("div", "");
mainContainer.className = 'skill-tree-container' + (isFullscreen ? '' : ' minimized');

// Apply initial styles based on fullscreen state
function applyContainerStyles() {
    if (isFullscreen) {
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
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        `;
    } else {
        mainContainer.style.cssText = `
            position: relative;
            width: 100%;
            height: 400px;
            background: ${CONFIG.bg};
            overflow: hidden;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: none;
            border-radius: 8px;
            border: 1px solid #222;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        `;
    }
}
applyContainerStyles();

// toggleFullscreen function - button created in controls section
let fullscreenBtn; // Will be assigned in controls section

function toggleFullscreen() {
    isFullscreen = !isFullscreen;
    saveFullscreenState(isFullscreen);

    if (isFullscreen) {
        mainContainer.classList.remove('minimized');
    } else {
        mainContainer.classList.add('minimized');
    }

    applyContainerStyles();

    // Update button icon and title
    if (fullscreenBtn) {
        fullscreenBtn.textContent = isFullscreen ? '⤡' : '⤢';
        fullscreenBtn.title = isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen';
        fullscreenBtn.setAttribute('aria-label', isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen');
    }

    // Re-adjust canvas transform after transition
    setTimeout(() => {
        updateTransform();
        render();
    }, 50);
}

// ==========================================
// CONSTELLATION BACKGROUND (Transform-Aligned)
// Stars now exist in main canvas coordinate system
// and pan/zoom with content
// ==========================================
let stars = [];
let constellationLines = [];

function initStars() {
    stars = [];
    // LOW-KEY EFFECT: Reduced from 70 to 40 stars for subtler appearance
    const numStars = 40;

    // Position stars in radial pattern around nodes (clustered near skills)
    // Use the same radii as skill nodes for clustering effect
    for (let i = 0; i < numStars; i++) {
        // Pick a random radius from skill tree radii range
        const radiusIndex = Math.floor(Math.random() * (CONFIG.radii.length - 1)) + 1;
        const baseRadius = CONFIG.radii[radiusIndex];

        // Add randomness around the radius (±30% variation)
        const radiusVariation = (Math.random() - 0.5) * baseRadius * 0.6;
        const radius = baseRadius + radiusVariation;

        // Random angle (270° arc like skills)
        const arcStart = CONFIG.arcStart * Math.PI / 180;
        const arcEnd = CONFIG.arcEnd * Math.PI / 180;
        const angle = arcStart + Math.random() * (arcEnd - arcStart + 2 * Math.PI) % (2 * Math.PI);

        // Convert polar to cartesian (centered at 0,0)
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        stars.push({
            x: x,
            y: y,
            // LOW-KEY: Smaller stars (0.5-1.5 instead of 1.0-3.0)
            radius: Math.random() * 1.0 + 0.5,
            // LOW-KEY: Dimmer stars (0.1-0.35 instead of 0.2-0.8)
            alpha: Math.random() * 0.25 + 0.1
        });
    }

    // Create constellation lines between nearby stars (more subtle)
    constellationLines = [];
    for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
            const dx = stars[i].x - stars[j].x;
            const dy = stars[i].y - stars[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            // LOW-KEY: Reduced connection probability (0.08 instead of 0.15)
            if (dist < 180 && Math.random() < 0.08) {
                constellationLines.push({
                    from: i,
                    to: j,
                    // LOW-KEY: Very subtle lines (0.01-0.04 alpha)
                    alpha: Math.random() * 0.03 + 0.01
                });
            }
        }
    }

    logDebug('Initialized', stars.length, 'stars with', constellationLines.length, 'connections');
}

// Draw stars on main canvas - lights up constellation smoothly based on selected node importance
function drawStars(selectedNodeData = null, transitionFactor = 0) {
    const cx = CONFIG.canvasSize / 2;
    const cy = CONFIG.canvasSize / 2;

    // Calculate target activation radius based on importance (0-4)
    let targetActivationRadius = 0;
    let activationX = 0;
    let activationY = 0;
    let targetIntensity = 0;

    if (selectedNodeData) {
        activationX = cx + selectedNodeData.x;
        activationY = cy + selectedNodeData.y;
        const importance = selectedNodeData.importance || 0;
        // LOW-KEY: Smaller activation radius (importance * 50 instead of 80)
        targetActivationRadius = importance * 50 + (importance > 0 ? 15 : 0);
        // LOW-KEY: Lower intensity (0.15 + importance * 0.1 instead of 0.3 + 0.175)
        targetIntensity = 0.15 + (importance * 0.1);
    }

    // Apply smooth transition factor
    const activationRadius = targetActivationRadius * transitionFactor;
    const activationIntensity = targetIntensity * transitionFactor;

    // Draw constellation lines
    constellationLines.forEach(line => {
        const s1 = stars[line.from];
        const s2 = stars[line.to];

        let lineAlpha = line.alpha;
        if (activationRadius > 0) {
            const midX = cx + (s1.x + s2.x) / 2;
            const midY = cy + (s1.y + s2.y) / 2;
            const dist = Math.sqrt(Math.pow(midX - activationX, 2) + Math.pow(midY - activationY, 2));
            if (dist < activationRadius) {
                const proximityFactor = 1 - (dist / activationRadius);
                // LOW-KEY: Lower max alpha (0.25 instead of 0.6)
                lineAlpha = Math.min(0.25, line.alpha + proximityFactor * activationIntensity * 0.3);
            }
        }

        ctx.beginPath();
        ctx.moveTo(cx + s1.x, cy + s1.y);
        ctx.lineTo(cx + s2.x, cy + s2.y);
        ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
    });

    // Draw stars - brightness based on proximity with smooth transition
    // LOW-KEY: More subtle activation effect
    stars.forEach(star => {
        let starAlpha = star.alpha;
        let starRadius = star.radius;

        if (activationRadius > 0) {
            const starX = cx + star.x;
            const starY = cy + star.y;
            const dist = Math.sqrt(Math.pow(starX - activationX, 2) + Math.pow(starY - activationY, 2));

            if (dist < activationRadius) {
                const proximityFactor = 1 - (dist / activationRadius);
                // LOW-KEY: Max alpha 0.5 instead of 1.0, smaller multiplier
                starAlpha = Math.min(0.5, star.alpha + proximityFactor * activationIntensity * 0.8);
                // LOW-KEY: Smaller radius increase (0.25 instead of 0.5)
                starRadius = star.radius * (1 + proximityFactor * 0.25 * transitionFactor);
            }
        }

        ctx.beginPath();
        ctx.arc(cx + star.x, cy + star.y, starRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${starAlpha})`;
        ctx.fill();
    });
}

initStars();

// ==========================================
// DATA LOADING FROM OBSIDIAN NOTES
// ==========================================
function loadSkillsFromFolder() {
    const pages = dv.pages(`"${settings.skillFolder}"`);
    const skills = [];

    for (const page of pages) {
        let parent = page.parent || null;
        if (parent) {
            parent = String(parent).replace(/^\[\[/, '').replace(/\]\]$/, '');
            if (parent.includes('/')) {
                parent = parent.split('/').pop();
            }
        }

        // Parse importance level (0-4), default to 0
        let importance = parseInt(page.importance) || 0;
        importance = Math.max(0, Math.min(4, importance)); // Clamp to 0-4

        skills.push({
            id: page.file.name,
            name: page.file.name,
            parent: parent,
            icon: page.icon || 'default',
            order: page.order || 0,
            importance: importance,  // 0=none, 1=low, 2=medium, 3=high, 4=pinnacle
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
// LAYOUT ALGORITHMS - Multiple styles
// ==========================================

// Radial layout (original style - nodes radiate from center)
function layoutRadial(node, level = 0, inheritedAngle = CONFIG.arcCenter) {
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
                layoutRadial(node.children[0], 1, CONFIG.arcCenter);
            } else {
                const step = usableArc / (childCount - 1);
                node.children.forEach((child, i) => {
                    const childAngle = CONFIG.arcStart + padding + (i * step);
                    layoutRadial(child, 1, childAngle);
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
                layoutRadial(child, level + 1, childAngle);
            });
        }
    }
}

// Top-down layout (knowledge flowing down)
function layoutTopDown(node, level = 0, xOffset = 0) {
    if (!node) return;

    node.level = level;
    const spacing = CONFIG.levelSpacing;

    // Calculate subtree width
    function getSubtreeWidth(n) {
        if (!n.children || n.children.length === 0) return 100;
        return n.children.reduce((sum, child) => sum + getSubtreeWidth(child), 0);
    }

    node.y = -200 + level * spacing; // Start from top
    node.x = xOffset;

    if (node.children && node.children.length > 0) {
        const totalWidth = getSubtreeWidth(node);
        let currentX = xOffset - totalWidth / 2;

        node.children.forEach(child => {
            const childWidth = getSubtreeWidth(child);
            layoutTopDown(child, level + 1, currentX + childWidth / 2);
            currentX += childWidth;
        });
    }
}

// Bottom-up layout (like a real tree from roots)
function layoutBottomUp(node, level = 0, xOffset = 0) {
    if (!node) return;

    node.level = level;
    const spacing = CONFIG.levelSpacing;

    // Calculate subtree width
    function getSubtreeWidth(n) {
        if (!n.children || n.children.length === 0) return 100;
        return n.children.reduce((sum, child) => sum + getSubtreeWidth(child), 0);
    }

    node.y = 200 - level * spacing; // Start from bottom
    node.x = xOffset;

    if (node.children && node.children.length > 0) {
        const totalWidth = getSubtreeWidth(node);
        let currentX = xOffset - totalWidth / 2;

        node.children.forEach(child => {
            const childWidth = getSubtreeWidth(child);
            layoutBottomUp(child, level + 1, currentX + childWidth / 2);
            currentX += childWidth;
        });
    }
}

// Left-to-right layout (timeline style)
function layoutLeftRight(node, level = 0, yOffset = 0) {
    if (!node) return;

    node.level = level;
    const spacing = CONFIG.levelSpacing + 120; // Increased spacing to prevent title overlap

    // Calculate subtree height with more vertical space
    function getSubtreeHeight(n) {
        if (!n.children || n.children.length === 0) return 120; // Increased from 80
        return n.children.reduce((sum, child) => sum + getSubtreeHeight(child), 0);
    }

    node.x = -300 + level * spacing; // Start from left
    node.y = yOffset;

    if (node.children && node.children.length > 0) {
        const totalHeight = getSubtreeHeight(node);
        let currentY = yOffset - totalHeight / 2;

        node.children.forEach(child => {
            const childHeight = getSubtreeHeight(child);
            layoutLeftRight(child, level + 1, currentY + childHeight / 2);
            currentY += childHeight;
        });
    }
}

// Main layout function - delegates to selected style
function layoutTree(node) {
    if (!node) return;

    switch (settings.layoutStyle) {
        case 'top-down':
            layoutTopDown(node, 0, 0);
            break;
        case 'bottom-up':
            layoutBottomUp(node, 0, 0);
            break;
        case 'left-right':
            layoutLeftRight(node, 0, 0);
            break;
        case 'radial':
        default:
            layoutRadial(node, 0, CONFIG.arcCenter);
            break;
    }
}

// ==========================================
// CANVAS SETUP (High DPI support with accessibility)
// ==========================================
const canvas = document.createElement('canvas');
canvas.className = 'skill-tree-canvas';
canvas.setAttribute('role', 'application');
canvas.setAttribute('aria-label', 'Skill tree visualization. Use mouse or touch to pan and zoom. Hold on a node to select it.');
canvas.setAttribute('tabindex', '0');

// High DPI scaling for crisp rendering
const dpr = window.devicePixelRatio || 1;
canvas.width = CONFIG.canvasSize * dpr;
canvas.height = CONFIG.canvasSize * dpr;
canvas.style.width = CONFIG.canvasSize + 'px';
canvas.style.height = CONFIG.canvasSize + 'px';
canvas.style.cssText += `
    position: absolute;
    top: 50%;
    left: 50%;
    transform-origin: center;
`;
mainContainer.appendChild(canvas);

const ctx = canvas.getContext('2d');
ctx.scale(dpr, dpr); // Scale context for high DPI

// ==========================================
// SETTINGS UI - Button, Panel, and Title
// ==========================================

// Title display (fixed at top, doesn't move with zoom/pan)
let titleElement = null;
function updateTitleDisplay() {
    if (settings.treeTitle) {
        if (!titleElement) {
            titleElement = document.createElement('div');
            titleElement.className = 'skill-tree-title';
            mainContainer.appendChild(titleElement);
        }
        titleElement.textContent = settings.treeTitle;
        titleElement.style.display = 'block';
    } else if (titleElement) {
        titleElement.style.display = 'none';
    }
}

// Settings button reference - will be added to control bar later
let settingsBtn = null;

// Settings panel overlay
const settingsOverlay = document.createElement('div');
settingsOverlay.className = 'skill-settings-overlay';
mainContainer.appendChild(settingsOverlay);

// Settings panel
const settingsPanel = document.createElement('div');
settingsPanel.className = 'skill-settings-panel';
settingsPanel.innerHTML = `
    <div class="skill-settings-header">
        <h3>Settings</h3>
        <button class="skill-settings-close">×</button>
    </div>
    <div class="skill-settings-body">
        <div class="skill-settings-section">
            <div class="skill-settings-section-title">Skill Folder</div>
            <input type="text" class="skill-settings-input" id="settings-folder"
                   placeholder="Path to skill notes folder"
                   value="${settings.skillFolder}">
        </div>

        <div class="skill-settings-section">
            <div class="skill-settings-section-title">Tree Title</div>
            <input type="text" class="skill-settings-input" id="settings-title"
                   placeholder="Optional title (shown at top)"
                   value="${settings.treeTitle || ''}">
        </div>

        <div class="skill-settings-section">
            <div class="skill-settings-section-title">Layout Style</div>
            <div class="skill-layout-options">
                <div class="skill-layout-option ${settings.layoutStyle === 'radial' ? 'active' : ''}" data-layout="radial">
                    <div class="skill-layout-icon">◉</div>
                    <div class="skill-layout-text">
                        <h4>Radial</h4>
                        <p>Nodes radiate outward from center</p>
                    </div>
                </div>
                <div class="skill-layout-option ${settings.layoutStyle === 'top-down' ? 'active' : ''}" data-layout="top-down">
                    <div class="skill-layout-icon">↓</div>
                    <div class="skill-layout-text">
                        <h4>Top-Down</h4>
                        <p>Knowledge flows downward</p>
                    </div>
                </div>
                <div class="skill-layout-option ${settings.layoutStyle === 'bottom-up' ? 'active' : ''}" data-layout="bottom-up">
                    <div class="skill-layout-icon">↑</div>
                    <div class="skill-layout-text">
                        <h4>Bottom-Up</h4>
                        <p>Like a tree growing from roots</p>
                    </div>
                </div>
                <div class="skill-layout-option ${settings.layoutStyle === 'left-right' ? 'active' : ''}" data-layout="left-right">
                    <div class="skill-layout-icon">→</div>
                    <div class="skill-layout-text">
                        <h4>Left-to-Right</h4>
                        <p>Timeline progression style</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
`;
mainContainer.appendChild(settingsPanel);

// Settings event handlers
function openSettings() {
    settingsPanel.classList.add('open');
    settingsOverlay.classList.add('open');
}

function closeSettings() {
    settingsPanel.classList.remove('open');
    settingsOverlay.classList.remove('open');
}

function applySettings() {
    const folderInput = settingsPanel.querySelector('#settings-folder');
    const titleInput = settingsPanel.querySelector('#settings-title');

    const oldFolder = settings.skillFolder;
    const oldLayout = settings.layoutStyle;

    settings.skillFolder = folderInput.value.trim() || settings.skillFolder;
    settings.treeTitle = titleInput.value.trim();

    saveSettings(settings);
    updateTitleDisplay();

    // Only reload tree data if folder changed
    if (oldFolder !== settings.skillFolder) {
        reloadTree();
    }
    // Just re-layout if only layout style changed (no data reload needed)
    else if (oldLayout !== settings.layoutStyle) {
        refreshLayout();
    }
}

function refreshLayout() {
    if (treeRoot) {
        svgIconCacheWhite.clear();
        svgIconCacheBlack.clear();
        layoutTree(treeRoot);
        render();
    }
}

function reloadTree() {
    const skills = loadSkillsFromFolder();
    treeRoot = buildTree(skills);
    allNodes = [];

    function collectNodes(node) {
        if (!node) return;
        allNodes.push(node);
        if (node.children) node.children.forEach(collectNodes);
    }

    // Clear icon caches
    svgIconCacheWhite.clear();
    svgIconCacheBlack.clear();

    if (treeRoot) {
        layoutTree(treeRoot);
        collectNodes(treeRoot);
    }
    render();
}

settingsOverlay.addEventListener('click', closeSettings);
settingsPanel.querySelector('.skill-settings-close').addEventListener('click', closeSettings);

// Layout option selection
settingsPanel.querySelectorAll('.skill-layout-option').forEach(option => {
    option.addEventListener('click', () => {
        settingsPanel.querySelectorAll('.skill-layout-option').forEach(o => o.classList.remove('active'));
        option.classList.add('active');
        settings.layoutStyle = option.dataset.layout;
        applySettings();
    });
});

// Input change handlers
settingsPanel.querySelector('#settings-folder').addEventListener('change', applySettings);
settingsPanel.querySelector('#settings-title').addEventListener('change', applySettings);

// Initialize title display
updateTitleDisplay();

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

// Per-node transition state (node.id -> value 0..1)
// Each node independently animates between 0 (default) and 1 (selected)
const nodeTransitions = new Map();
let animationFrameId = null;

function getNodeTransition(nodeId) {
    return nodeTransitions.get(nodeId) || 0;
}

function startTransitionLoop() {
    if (animationFrameId) return; // Already running
    animationFrameId = requestAnimationFrame(animationTick);
}

function animationTick() {
    const speed = 0.12; // Per-frame lerp factor
    let anyActive = false;

    allNodes.forEach(node => {
        const target = (selectedNode && selectedNode.id === node.id) ? 1 : 0;
        const current = getNodeTransition(node.id);

        if (Math.abs(current - target) > 0.01) {
            const next = current + (target - current) * speed;
            nodeTransitions.set(node.id, next);
            anyActive = true;
        } else if (current !== target) {
            nodeTransitions.set(node.id, target);
        }
    });

    render();

    if (anyActive) {
        animationFrameId = requestAnimationFrame(animationTick);
    } else {
        animationFrameId = null;
    }
}


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

// Smooth panning with requestAnimationFrame
let rafPending = false;
let targetPan = { x: 0, y: 0 };

function smoothUpdateTransform() {
    pan.x = targetPan.x;
    pan.y = targetPan.y;
    updateTransform();
    rafPending = false;
}

function requestPanUpdate(x, y) {
    targetPan.x = x;
    targetPan.y = y;
    if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(smoothUpdateTransform);
    }
}

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

    // Subtle glow effect
    ctx.strokeStyle = CONFIG.connectionGlow;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Main line
    ctx.strokeStyle = CONFIG.connection;
    ctx.lineWidth = 1.5;
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

    // Per-node transition: 0 = default (black), 1 = selected (white)
    const t = getNodeTransition(node.id);

    // Glow interpolates with transition
    const baseGlow = isRoot ? 25 : 15;
    ctx.shadowBlur = baseGlow + (35 - baseGlow) * t;
    ctx.shadowColor = `rgba(255, 255, 255, ${0.5 + 0.3 * t})`;

    // Outer ring (fades in with selection)
    if (t > 0.01) {
        ctx.beginPath();
        ctx.arc(x, y, radius + 6, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 * t})`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Node fill: interpolate black → white
    const fillValue = Math.round(255 * t);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${fillValue}, ${fillValue}, ${fillValue})`;
    ctx.fill();

    // Border: interpolate dim → bright
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + 0.7 * t})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Draw icon with transition value for smooth color change
    drawIcon(x, y, radius * 0.55, node.icon || 'default', t);

    // Text
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

    const lineHeight = 14;
    const textY = y + radius + 10;

    // Draw text
    ctx.fillStyle = CONFIG.text;
    lines.forEach((line, i) => {
        ctx.fillText(line, x, textY + (i * lineHeight));
    });
}

// ==========================================
// ENHANCED ICON SYSTEM WITH IMAGE SUPPORT
// Supports: SVG icons, PNG, JPG, SVG files
// ==========================================
const customImageCache = new Map();
const imageLoadingState = new Map(); // 'loading' | 'loaded' | 'error'
// Icon caches are defined in drawIcon section below

// Check if icon value is a custom image path
function isCustomImagePath(iconValue) {
    if (!iconValue || typeof iconValue !== 'string') return false;
    const lower = iconValue.toLowerCase();
    return lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') ||
           lower.endsWith('.svg') || lower.endsWith('.gif') || lower.endsWith('.webp');
}

// Load custom image and cache it
function loadCustomImage(imagePath, callback) {
    if (customImageCache.has(imagePath)) {
        callback(customImageCache.get(imagePath));
        return;
    }

    if (imageLoadingState.get(imagePath) === 'loading') {
        return; // Still loading, will re-render when done
    }

    imageLoadingState.set(imagePath, 'loading');
    logDebug('Loading custom icon image:', imagePath);

    const img = new Image();
    img.crossOrigin = 'anonymous';

    // Build the full path
    // User should provide path relative to vault root, e.g., "Obsidian/Images/myicon.png"
    // Or an absolute path starting with /
    let fullPath;
    try {
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            fullPath = imagePath;
        } else {
            // Use Obsidian's resource path resolver
            fullPath = app.vault.adapter.getResourcePath(imagePath);
        }
    } catch (e) {
        logDebug('Error resolving image path:', e);
        fullPath = imagePath;
    }

    img.onload = () => {
        customImageCache.set(imagePath, img);
        imageLoadingState.set(imagePath, 'loaded');
        logDebug('Custom icon image loaded:', imagePath);
        render(); // Re-render to show the loaded image
    };

    img.onerror = () => {
        imageLoadingState.set(imagePath, 'error');
        logDebug('Custom icon image failed:', imagePath,
            '- Use a path relative to vault root (e.g., "Images/icon.png") or full URL');
        render();
    };

    img.src = fullPath;
}

// Icon caches: one for white icons (default), one for black icons (selected)
const svgIconCacheWhite = new Map();
const svgIconCacheBlack = new Map();

function drawIcon(x, y, size, iconName, t = 0) {
    // t: 0 = default (white icon), 1 = selected (black icon)

    // Custom image path handling
    if (isCustomImagePath(iconName)) {
        const state = imageLoadingState.get(iconName);

        if (state === 'loaded' && customImageCache.has(iconName)) {
            const img = customImageCache.get(iconName);
            ctx.save();

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.clip();

            const imgAspect = img.width / img.height;
            let drawWidth, drawHeight, drawX, drawY;
            if (imgAspect > 1) {
                drawHeight = size * 2;
                drawWidth = drawHeight * imgAspect;
                drawX = x - drawWidth / 2;
                drawY = y - size;
            } else {
                drawWidth = size * 2;
                drawHeight = drawWidth / imgAspect;
                drawX = x - size;
                drawY = y - drawHeight / 2;
            }

            // Smooth invert transition (1 = inverted/white, 0 = normal)
            const invertAmount = 1 - t;
            if (invertAmount > 0.01) {
                ctx.filter = `invert(${invertAmount})`;
            }
            ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
            ctx.restore();
            return;
        } else if (state === 'error') {
            ctx.save();
            ctx.strokeStyle = '#ff6b6b';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            const s = size * 0.6;
            ctx.beginPath();
            ctx.moveTo(x - s, y - s);
            ctx.lineTo(x + s, y + s);
            ctx.moveTo(x + s, y - s);
            ctx.lineTo(x - s, y + s);
            ctx.stroke();
            ctx.restore();
            return;
        } else {
            if (state !== 'loading') {
                loadCustomImage(iconName, () => {});
            }
            return;
        }
    }

    // SVG icon: blend white and black versions based on t
    const icon = ICONS[iconName] || ICONS.default;
    ctx.save();

    // Draw white icon (fades out as t increases)
    if (t < 0.99) {
        if (svgIconCacheWhite.has(iconName)) {
            ctx.globalAlpha = 1 - t;
            ctx.drawImage(svgIconCacheWhite.get(iconName), x - size, y - size, size * 2, size * 2);
        } else {
            const svgNS = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(svgNS, "svg");
            svg.setAttribute("viewBox", icon.viewBox);
            svg.setAttribute("width", size * 2);
            svg.setAttribute("height", size * 2);
            svg.innerHTML = icon.path.replace(/currentColor/g, "#ffffff");
            const svgData = new XMLSerializer().serializeToString(svg);
            const img = new Image();
            img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
            img.onload = () => { svgIconCacheWhite.set(iconName, img); render(); };
            if (img.complete) { svgIconCacheWhite.set(iconName, img); }
        }
    }

    // Draw black icon (fades in as t increases)
    if (t > 0.01) {
        if (svgIconCacheBlack.has(iconName)) {
            ctx.globalAlpha = t;
            ctx.drawImage(svgIconCacheBlack.get(iconName), x - size, y - size, size * 2, size * 2);
        } else {
            const svgNS = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(svgNS, "svg");
            svg.setAttribute("viewBox", icon.viewBox);
            svg.setAttribute("width", size * 2);
            svg.setAttribute("height", size * 2);
            svg.innerHTML = icon.path.replace(/currentColor/g, "#000000");
            const svgData = new XMLSerializer().serializeToString(svg);
            const img = new Image();
            img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
            img.onload = () => { svgIconCacheBlack.set(iconName, img); render(); };
            if (img.complete) { svgIconCacheBlack.set(iconName, img); }
        }
    }

    ctx.restore();
}

// Render function - simple and stateless
function render() {
    ctx.clearRect(0, 0, CONFIG.canvasSize, CONFIG.canvasSize);

    // Draw stars (brighter near selected node)
    drawStars(selectedNode, selectedNode ? 1 : 0);

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

    // Draw all nodes
    allNodes.forEach(node => drawNode(node));
}

// Initial render
render();

// ==========================================
// VISUAL FEEDBACK HELPERS
// ==========================================

// Touch ripple effect for mobile feedback
function createTouchRipple(clientX, clientY) {
    const ripple = document.createElement('div');
    ripple.className = 'touch-ripple';
    ripple.style.left = clientX + 'px';
    ripple.style.top = clientY + 'px';
    mainContainer.appendChild(ripple);

    // Remove after animation
    setTimeout(() => {
        if (ripple.parentNode) {
            ripple.remove();
        }
    }, 500);

    logDebug('Touch ripple at:', clientX, clientY);
}

// Progress indicator for long operations
let currentProgressIndicator = null;

function showProgressIndicator(message = 'Loading...') {
    hideProgressIndicator();

    const indicator = document.createElement('div');
    indicator.className = 'skill-progress-indicator';
    indicator.setAttribute('role', 'status');
    indicator.setAttribute('aria-live', 'polite');
    indicator.innerHTML = `
        <div class="spinner" aria-hidden="true"></div>
        <span class="message">${message}</span>
    `;

    mainContainer.appendChild(indicator);
    currentProgressIndicator = indicator;
    logDebug('Progress indicator shown:', message);
}

function hideProgressIndicator() {
    if (currentProgressIndicator) {
        currentProgressIndicator.style.opacity = '0';
        setTimeout(() => {
            if (currentProgressIndicator && currentProgressIndicator.parentNode) {
                currentProgressIndicator.remove();
            }
            currentProgressIndicator = null;
        }, 200);
    }
}

// ==========================================
// SELECTION SYSTEM
// ==========================================

function selectNode(node) {
    selectedNode = node;
    updateEditButton();
    showSelectionLabel(node);
    startTransitionLoop();
}

function deselectNode() {
    selectedNode = null;
    updateEditButton();
    hideSelectionLabel();
    startTransitionLoop();
}

function showSelectionLabel(node) {
    hideSelectionLabel();

    const label = document.createElement('div');
    label.className = 'skill-selection-label';
    label.innerHTML = `
        <span>Selected: <strong>${node.name}</strong></span>
        <button class="deselect" title="Deselect">✕</button>
    `;

    // Apply inline styles for minimized mode to ensure containment
    if (!isFullscreen) {
        label.style.cssText = `
            position: absolute !important;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            padding: 6px 12px;
            font-size: 9px;
            max-width: calc(100% - 120px);
            z-index: 200;
            animation: none;
            background: rgba(0, 0, 0, 0.95);
            border: 1px solid #444;
            color: #fff;
            font-family: "Courier New", monospace;
            letter-spacing: 2px;
            text-transform: uppercase;
            display: flex;
            align-items: center;
            gap: 10px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        `;
    }

    label.querySelector('.deselect').onclick = () => deselectNode();

    mainContainer.appendChild(label);
    selectionLabel = label;
}

function hideSelectionLabel() {
    if (selectionLabel) {
        selectionLabel.remove();
        selectionLabel = null;
    }
}

// ==========================================
// EDIT BUTTON STATE UPDATE (button created in controls section)
// ==========================================
function updateEditButton() {
    if (typeof updateEditCtrlButton === 'function') {
        updateEditCtrlButton();
    }
}

// ==========================================
// EDIT CARD MODAL WITH NAVIGATION STACK
// ==========================================
let currentOverlay = null;
let currentCard = null;

// Navigation stack for modal state preservation
let modalNavStack = [];
let modalCurrentView = null;

// Store the current view state before navigating
function pushModalView(viewName, viewData, contentHTML) {
    if (modalCurrentView) {
        modalNavStack.push({
            name: modalCurrentView.name,
            data: modalCurrentView.data,
            html: modalCurrentView.html,
            scrollTop: currentCard?.querySelector('.skill-edit-card-body')?.scrollTop || 0
        });
    }
    modalCurrentView = { name: viewName, data: viewData, html: contentHTML };
    logDebug('Modal nav push:', viewName, 'Stack depth:', modalNavStack.length);
}

// Pop previous view from stack
function popModalView() {
    if (modalNavStack.length > 0) {
        const prev = modalNavStack.pop();
        modalCurrentView = prev;
        logDebug('Modal nav pop:', prev.name, 'Stack depth:', modalNavStack.length);
        return prev;
    }
    return null;
}

// Check if we can go back
function canGoBack() {
    return modalNavStack.length > 0;
}

// Clear navigation stack
function clearModalNav() {
    modalNavStack = [];
    modalCurrentView = null;
}

function closeEditCard() {
    if (currentOverlay) {
        currentOverlay.style.opacity = '0';
        setTimeout(() => {
            if (currentOverlay && currentOverlay.parentNode) {
                currentOverlay.remove();
            }
            currentOverlay = null;
        }, 200);
    }
    if (currentCard) {
        currentCard.style.opacity = '0';
        currentCard.style.transform = 'translate(-50%, -50%) scale(0.95)';
        setTimeout(() => {
            if (currentCard && currentCard.parentNode) {
                currentCard.remove();
            }
            currentCard = null;
        }, 200);
    }
    clearModalNav();
}

function showEditCard(node, isBack = false) {
    // If not coming from back navigation, clear stack and close existing
    if (!isBack) {
        closeEditCard();
        clearModalNav();
    }

    if (!currentOverlay) {
        const overlay = document.createElement('div');
        overlay.className = 'skill-overlay';
        overlay.onclick = closeEditCard;
        mainContainer.appendChild(overlay);
        currentOverlay = overlay;
    }

    if (!currentCard) {
        const card = document.createElement('div');
        card.className = 'skill-edit-card';
        card.onclick = (e) => e.stopPropagation();
        mainContainer.appendChild(card);
        currentCard = card;
    }

    const mainViewHTML = `
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
                    <div class="skill-edit-option-icon" style="border-color: #333;">📄</div>
                    <div class="skill-edit-option-text">
                        <h4>Open File</h4>
                        <p>Navigate to this skill's note</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    currentCard.innerHTML = mainViewHTML;

    // Store this as the root view
    if (!isBack) {
        pushModalView('main', { node }, mainViewHTML);
    }

    currentCard.querySelector('.skill-edit-card-close').onclick = closeEditCard;

    currentCard.querySelectorAll('.skill-edit-option').forEach(opt => {
        opt.onclick = () => {
            const action = opt.dataset.action;
            handleEditAction(action, node);
        };
    });
}

// Navigate back in modal stack with smooth transition
function navigateBack(node) {
    const prevView = popModalView();
    if (prevView) {
        const body = currentCard.querySelector('.skill-edit-card-body');
        if (body) {
            // Slide out current view
            body.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
            body.style.opacity = '0';
            body.style.transform = 'translateX(20px)';

            setTimeout(() => {
                // Restore previous view based on name
                switch (prevView.name) {
                    case 'main':
                        showEditCard(node, true);
                        break;
                    case 'add':
                        showAddSubmenu(node, true);
                        break;
                    default:
                        showEditCard(node, true);
                }

                // Slide in restored view
                const newBody = currentCard.querySelector('.skill-edit-card-body');
                if (newBody) {
                    newBody.style.transition = 'none';
                    newBody.style.opacity = '0';
                    newBody.style.transform = 'translateX(-20px)';
                    requestAnimationFrame(() => {
                        newBody.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
                        newBody.style.opacity = '1';
                        newBody.style.transform = 'translateX(0)';
                        // Restore scroll position
                        if (prevView.scrollTop) {
                            newBody.scrollTop = prevView.scrollTop;
                        }
                    });
                }
            }, 150);
        }
    }
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
function showAddSubmenu(node, isBack = false) {
    const body = currentCard.querySelector('.skill-edit-card-body');

    const html = `
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

    body.innerHTML = html;

    // Push to navigation stack
    if (!isBack) {
        pushModalView('add', { node }, html);
    }

    body.querySelector('.skill-submenu-back').onclick = () => navigateBack(node);

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

    const html = `
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

                <div class="skill-form-group" style="margin-top: 16px;">
                    <label>Or use custom image</label>
                    <input type="text" id="custom-icon-path" placeholder="e.g., Images/myicon.png">
                    <p style="color: #666; font-size: 11px; margin-top: 6px; line-height: 1.4;">
                        Enter path relative to vault root (e.g., <code style="background:#222;padding:2px 4px;border-radius:2px;">Obsidian/Images/icon.png</code>)
                        or a full URL. Supports: PNG, JPG, SVG, GIF, WebP
                    </p>
                </div>

                <div class="skill-form-group" style="margin-top: 16px;">
                    <label>Importance Level</label>
                    <select id="skill-importance">
                        <option value="0">0 - None</option>
                        <option value="1">1 - Low</option>
                        <option value="2">2 - Medium</option>
                        <option value="3">3 - High</option>
                        <option value="4">4 - Pinnacle</option>
                    </select>
                </div>

                <input type="hidden" id="selected-icon" value="default">

                <div class="skill-form-actions">
                    <button class="skill-form-btn secondary" id="cancel-add">Cancel</button>
                    <button class="skill-form-btn primary" id="confirm-add">Create Skill</button>
                </div>
            </div>
        </div>
    `;

    body.innerHTML = html;

    // Push to navigation stack
    pushModalView('addForm', { node, type }, html);

    body.querySelector('.skill-submenu-back').onclick = () => navigateBack(node);
    body.querySelector('#cancel-add').onclick = closeEditCard;

    // Handle icon grid selection
    body.querySelectorAll('.skill-icon-option').forEach(opt => {
        opt.onclick = () => {
            body.querySelectorAll('.skill-icon-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            body.querySelector('#selected-icon').value = opt.dataset.icon;
            body.querySelector('#custom-icon-path').value = ''; // Clear custom path
        };
    });

    // Handle custom image path input
    body.querySelector('#custom-icon-path').oninput = (e) => {
        const path = e.target.value.trim();
        if (path) {
            body.querySelectorAll('.skill-icon-option').forEach(o => o.classList.remove('selected'));
            body.querySelector('#selected-icon').value = path;
        }
    };

    body.querySelector('#confirm-add').onclick = async () => {
        const name = body.querySelector('#new-skill-name').value.trim();
        const customPath = body.querySelector('#custom-icon-path').value.trim();
        const icon = customPath || body.querySelector('#selected-icon').value;
        const importance = parseInt(body.querySelector('#skill-importance').value) || 0;

        if (!name) {
            new Notice('Please enter a skill name');
            return;
        }

        await createNewSkill(name, icon, node, type, importance);
    };

    setTimeout(() => body.querySelector('#new-skill-name').focus(), 100);
}

async function createNewSkill(name, icon, referenceNode, type, importance = 0) {
    showProgressIndicator('Creating skill...');

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
importance: ${importance}
---

# ${name}

`;

    const filePath = `${settings.skillFolder}/${name}.md`;

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

        hideProgressIndicator();
        new Notice(`Created: ${name}`);
        closeEditCard();
        deselectNode();
        setTimeout(refreshTree, 500);
    } catch (err) {
        hideProgressIndicator();
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

    const html = `
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
                    <label>Importance Level</label>
                    <select id="edit-skill-importance">
                        <option value="0" ${(node.importance || 0) === 0 ? 'selected' : ''}>0 - None</option>
                        <option value="1" ${(node.importance || 0) === 1 ? 'selected' : ''}>1 - Low</option>
                        <option value="2" ${(node.importance || 0) === 2 ? 'selected' : ''}>2 - Medium</option>
                        <option value="3" ${(node.importance || 0) === 3 ? 'selected' : ''}>3 - High</option>
                        <option value="4" ${(node.importance || 0) === 4 ? 'selected' : ''}>4 - Pinnacle</option>
                    </select>
                </div>

                <div class="skill-form-group">
                    <label>Icon</label>
                    <div class="skill-icon-grid" id="icon-grid">
                        ${Object.keys(ICONS).map(iconName => `
                            <div class="skill-icon-option ${iconName === (node.icon || 'default') && !isCustomImagePath(node.icon) ? 'selected' : ''}" data-icon="${iconName}" title="${iconName}">
                                ${renderIconSVG(iconName)}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="skill-form-group" style="margin-top: 16px;">
                    <label>Or use custom image</label>
                    <input type="text" id="custom-icon-path" value="${isCustomImagePath(node.icon) ? node.icon : ''}" placeholder="e.g., Images/myicon.png">
                    <p style="color: #666; font-size: 11px; margin-top: 6px; line-height: 1.4;">
                        Enter path relative to vault root (e.g., <code style="background:#222;padding:2px 4px;border-radius:2px;">Obsidian/Images/icon.png</code>)
                        or a full URL. Supports: PNG, JPG, SVG, GIF, WebP
                    </p>
                </div>

                <input type="hidden" id="selected-icon" value="${node.icon || 'default'}">

                <div class="skill-form-actions">
                    <button class="skill-form-btn secondary" id="cancel-edit">Cancel</button>
                    <button class="skill-form-btn primary" id="confirm-edit">Save Changes</button>
                </div>
            </div>
        </div>
    `;

    body.innerHTML = html;

    // Push to navigation stack
    pushModalView('edit', { node }, html);

    body.querySelector('.skill-submenu-back').onclick = () => navigateBack(node);
    body.querySelector('#cancel-edit').onclick = closeEditCard;

    // Handle icon grid selection
    body.querySelectorAll('.skill-icon-option').forEach(opt => {
        opt.onclick = () => {
            body.querySelectorAll('.skill-icon-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            body.querySelector('#selected-icon').value = opt.dataset.icon;
            body.querySelector('#custom-icon-path').value = ''; // Clear custom path
        };
    });

    // Handle custom image path input
    body.querySelector('#custom-icon-path').oninput = (e) => {
        const path = e.target.value.trim();
        if (path) {
            body.querySelectorAll('.skill-icon-option').forEach(o => o.classList.remove('selected'));
            body.querySelector('#selected-icon').value = path;
        }
    };

    body.querySelector('#confirm-edit').onclick = async () => {
        const newName = body.querySelector('#edit-skill-name').value.trim();
        const newParent = body.querySelector('#edit-skill-parent').value;
        const customPath = body.querySelector('#custom-icon-path').value.trim();
        const newIcon = customPath || body.querySelector('#selected-icon').value;
        const newImportance = parseInt(body.querySelector('#edit-skill-importance').value) || 0;

        if (!newName) {
            new Notice('Name cannot be empty');
            return;
        }

        await updateSkill(node, newName, newParent, newIcon, newImportance);
    };
}

async function updateSkill(node, newName, newParent, newIcon, newImportance = 0) {
    try {
        const file = app.vault.getAbstractFileByPath(node.file);
        if (!file) {
            new Notice('File not found');
            return;
        }

        await app.fileManager.processFrontMatter(file, (fm) => {
            fm.parent = newParent || '';
            fm.icon = newIcon;
            fm.importance = newImportance;
        });

        if (newName !== node.name) {
            const newPath = `${settings.skillFolder}/${newName}.md`;
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
        setTimeout(refreshTree, 500);
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

    const html = `
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

    body.innerHTML = html;

    // Push to navigation stack
    pushModalView('move', { node, siblings, currentIndex }, html);

    body.querySelector('.skill-submenu-back').onclick = () => navigateBack(node);

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
        setTimeout(refreshTree, 500);
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

    const html = `
        <div class="skill-submenu">
            <div class="skill-submenu-back">
                ← Back to options
            </div>
            <div style="padding: 20px;">
                <div class="skill-edit-section-title" style="color: #888;">Delete Skill</div>

                <div style="background: #111; border: 1px solid #333; border-radius: 0; padding: 20px; margin: 20px 0;">
                    <p style="color: #ccc; margin: 0 0 10px 0; font-size: 14px;">
                        ⚠️ Are you sure you want to delete "${node.name}"?
                    </p>
                    ${hasChildren ? `
                        <p style="color: #888; margin: 0; font-size: 13px;">
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

    body.innerHTML = html;

    // Push to navigation stack
    pushModalView('delete', { node }, html);

    body.querySelector('.skill-submenu-back').onclick = () => navigateBack(node);
    body.querySelector('#cancel-delete').onclick = closeEditCard;
    body.querySelector('#confirm-delete').onclick = () => deleteSkill(node);
}

async function deleteSkill(node) {
    showProgressIndicator('Deleting skill...');

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

        hideProgressIndicator();
        new Notice(`Deleted: ${node.name}`);
        closeEditCard();
        deselectNode();
        setTimeout(refreshTree, 500);
    } catch (err) {
        hideProgressIndicator();
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
    let filePath = null;
    if (node.file) {
        filePath = node.file;
    } else if (!node.isImplicit) {
        filePath = `${settings.skillFolder}/${node.name}.md`;
    }

    if (filePath) {
        // Flash the node briefly before navigating
        nodeTransitions.set(node.id, 1);
        render();

        setTimeout(() => {
            const file = app.vault.getAbstractFileByPath(filePath);
            if (file) {
                app.workspace.getLeaf(false).openFile(file);
            } else {
                app.workspace.openLinkText(filePath, '', false);
            }
            // Reset transition after navigation
            nodeTransitions.set(node.id, 0);
            render();
        }, 250);
    }
}

// ==========================================
// KEYBOARD SUPPORT
// ==========================================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && selectedNode) {
        logDebug('ESC pressed - deselecting node');
        deselectNode();
    }
});

// Mouse events - FIXED: removed -pan.x / -pan.y
let mouseDownTime = 0;
let mouseDownPos = { x: 0, y: 0 };

canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();

    const rect = canvas.getBoundingClientRect();
    // FIXED: Removed - pan.x and - pan.y
    const x = (e.clientX - rect.left - rect.width/2) / zoom;
    const y = (e.clientY - rect.top - rect.height/2) / zoom;

    mouseDownTime = Date.now();
    mouseDownPos = { x: e.clientX, y: e.clientY };

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

    const duration = Date.now() - mouseDownTime;
    const moveDistance = Math.hypot(e.clientX - mouseDownPos.x, e.clientY - mouseDownPos.y);
    const wasQuickTap = duration < 300 && moveDistance < 10;

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
    } else if (wasQuickTap && !wasDragging && selectedNode) {
        // Deselect on empty canvas tap when a node is selected
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width/2) / zoom;
        const y = (e.clientY - rect.top - rect.height/2) / zoom;
        const clicked = getNodeAtPosition(x, y);
        if (!clicked) {
            logDebug('Empty tap - deselecting node');
            deselectNode();
        }
    }
});

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    zoom = Math.max(0.25, Math.min(2, zoom * delta));
    updateTransform();
});

// Touch events - Optimized for smooth single-finger panning
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();

    touchState.active = true;
    touchState.isHold = false;
    touchState.startTime = Date.now();
    touchState.startPos = {
        x: (touch.clientX - rect.left - rect.width/2) / zoom,
        y: (touch.clientY - rect.top - rect.height/2) / zoom
    };
    touchState.currentPos = { ...touchState.startPos };

    const clickedNode = getNodeAtPosition(touchState.startPos.x, touchState.startPos.y);

    if (clickedNode) {
        // Create touch ripple for visual feedback
        createTouchRipple(touch.clientX, touch.clientY);

        touchState.nodeAtStart = clickedNode;
        touchState.holdTimer = setTimeout(() => {
            if (touchState.active && !touchState.isHold) {
                touchState.isHold = true;
                selectNode(clickedNode);
                if (navigator.vibrate) navigator.vibrate(50);
            }
        }, CONFIG.longPressTime);
    } else {
        // Start panning immediately on empty space
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

        // Cancel hold timer if moved significantly
        if (distance > CONFIG.movementThreshold && touchState.holdTimer) {
            clearTimeout(touchState.holdTimer);
            touchState.holdTimer = null;
            // Start dragging if we were on a node but moved
            if (touchState.nodeAtStart && !isDragging) {
                isDragging = true;
                dragStart = { x: touch.clientX - pan.x, y: touch.clientY - pan.y };
            }
        }

        // Use requestAnimationFrame for smooth panning
        if (isDragging) {
            requestPanUpdate(touch.clientX - dragStart.x, touch.clientY - dragStart.y);
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
        // Short tap
        if (touchState.nodeAtStart) {
            openFile(touchState.nodeAtStart);
        } else if (selectedNode) {
            // Deselect on empty canvas tap when a node is selected
            logDebug('Empty touch tap - deselecting node');
            deselectNode();
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
// ZOOM & EDIT CONTROLS (with ARIA accessibility)
// ==========================================
const controlsWrapper = document.createElement('div');
controlsWrapper.className = 'skill-tree-controls';
controlsWrapper.setAttribute('role', 'toolbar');
controlsWrapper.setAttribute('aria-label', 'Skill tree controls');
// Smaller positioning in minimized mode
const ctrlBottom = isFullscreen ? '100px' : '10px';
const ctrlRight = isFullscreen ? '20px' : '10px';
const ctrlGap = isFullscreen ? '12px' : '8px';
controlsWrapper.style.cssText = `
    position: absolute;
    bottom: ${ctrlBottom};
    right: ${ctrlRight};
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${ctrlGap};
    z-index: 100;
`;

// Container for collapsible zoom buttons
const zoomContainer = document.createElement('div');
zoomContainer.setAttribute('role', 'group');
zoomContainer.setAttribute('aria-label', 'Zoom controls');
const zoomGap = isFullscreen ? '12px' : '6px';
zoomContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: ${zoomGap};
    overflow: hidden;
    transition: max-height 0.3s ease, opacity 0.3s ease;
    max-height: 0;
    opacity: 0;
`;

let zoomControlsVisible = false;

function makeCtrlBtn(text, onClick, isSpecial = false, ariaLabel = '') {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.setAttribute('aria-label', ariaLabel || text);
    // Smaller buttons in minimized mode
    const btnSize = isFullscreen ? '52px' : '42px';
    const fontSize = isFullscreen ? '20px' : '18px';
    // All buttons now have consistent black/dark style
    btn.style.cssText = `
        width: ${btnSize};
        height: ${btnSize};
        background: ${isSpecial ? 'transparent' : 'rgba(0, 0, 0, 0.8)'};
        border: 1px solid ${isSpecial ? '#333' : '#444'};
        color: ${isSpecial ? '#666' : '#fff'};
        font-size: ${fontSize};
        font-weight: 300;
        cursor: pointer;
        box-shadow: ${isSpecial ? 'none' : (isFullscreen ? '0 0 15px rgba(0, 0, 0, 0.5)' : 'none')};
        touch-action: manipulation;
        transition: all 0.3s ease;
    `;
    btn.onmouseenter = () => {
        if (!isSpecial) {
            btn.style.borderColor = '#666';
            btn.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.2)';
        }
    };
    btn.onmouseleave = () => {
        if (!isSpecial) {
            btn.style.borderColor = '#444';
            btn.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.5)';
        }
    };
    btn.onclick = (e) => {
        btn.style.animation = 'button-press 0.2s ease';
        setTimeout(() => { btn.style.animation = ''; }, 200);
        onClick(e);
    };
    return btn;
}

// Zoom buttons (collapsible) with accessibility labels
const zoomInBtn = makeCtrlBtn('+', () => { zoom = Math.min(2, zoom * 1.2); updateTransform(); }, false, 'Zoom in');
const zoomOutBtn = makeCtrlBtn('−', () => { zoom = Math.max(0.25, zoom * 0.8); updateTransform(); }, false, 'Zoom out');
const resetBtn = makeCtrlBtn('⟲', () => { pan = {x:0, y:0}; zoom = CONFIG.initialZoom; updateTransform(); deselectNode(); }, false, 'Reset view');

zoomContainer.appendChild(zoomInBtn);
zoomContainer.appendChild(zoomOutBtn);
zoomContainer.appendChild(resetBtn);

// Toggle button (always visible)
const toggleBtn = makeCtrlBtn('+', () => {
    zoomControlsVisible = !zoomControlsVisible;
    if (zoomControlsVisible) {
        zoomContainer.style.maxHeight = '250px';
        zoomContainer.style.opacity = '1';
        toggleBtn.textContent = '−';
    } else {
        zoomContainer.style.maxHeight = '0';
        zoomContainer.style.opacity = '0';
        toggleBtn.textContent = '+';
    }
}, true);
toggleBtn.title = 'Toggle zoom controls';

// Edit button (always visible, independent)
const editCtrlBtn = makeCtrlBtn('✎', () => {
    if (selectedNode) {
        showEditCard(selectedNode);
    }
}, true);
editCtrlBtn.style.opacity = '0.4';
editCtrlBtn.style.cursor = 'not-allowed';
editCtrlBtn.title = 'Hold a node to select, then tap to edit';

// Settings button (in control bar)
settingsBtn = makeCtrlBtn('⚙', openSettings, false, 'Open settings');
settingsBtn.title = 'Settings';

// Fullscreen button (in control bar)
fullscreenBtn = makeCtrlBtn(isFullscreen ? '⤡' : '⤢', toggleFullscreen, false, isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen');
fullscreenBtn.title = isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen';

// Update edit button state
function updateEditCtrlButton() {
    if (selectedNode) {
        editCtrlBtn.style.opacity = '1';
        editCtrlBtn.style.cursor = 'pointer';
        editCtrlBtn.style.background = 'rgba(255, 255, 255, 0.9)';
        editCtrlBtn.style.borderColor = '#fff';
        editCtrlBtn.style.color = '#000';
        // Smaller shadow in minimized mode to prevent overflow
        editCtrlBtn.style.boxShadow = isFullscreen ? '0 0 25px rgba(255, 255, 255, 0.4)' : 'none';
    } else {
        editCtrlBtn.style.opacity = '0.4';
        editCtrlBtn.style.cursor = 'not-allowed';
        editCtrlBtn.style.background = 'transparent';
        editCtrlBtn.style.borderColor = '#333';
        editCtrlBtn.style.color = '#666';
        editCtrlBtn.style.boxShadow = 'none';
    }
}

controlsWrapper.appendChild(zoomContainer);
controlsWrapper.appendChild(toggleBtn);
controlsWrapper.appendChild(editCtrlBtn);
controlsWrapper.appendChild(settingsBtn);
controlsWrapper.appendChild(fullscreenBtn);
mainContainer.appendChild(controlsWrapper);

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
            <code>${settings.skillFolder}/</code>
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
function refreshTree() {
    const skills = loadSkillsFromFolder();
    if (skills.length === 0) {
        treeRoot = null;
        allNodes = [];
        render();
    } else {
        treeRoot = buildTree(skills);
        if (treeRoot) {
            layoutTree(treeRoot);
            allNodes = collectAllNodes(treeRoot);
            render();
        }
    }
}

const skills = loadSkillsFromFolder();

if (skills.length === 0) {
    showEmptyState();
} else {
    treeRoot = buildTree(skills);
    if (treeRoot) {
        layoutTree(treeRoot);
        allNodes = collectAllNodes(treeRoot);
        render();
    } else {
        showEmptyState();
    }
}

```