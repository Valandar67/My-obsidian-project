---
banner(1): Obsidian/Images/'Cardio session'.jpg
---

```dataviewjs
// ==========================================
// CARDIO SESSION - SHIN RECOVERY TRACKER
// Tissue-Level Recovery & Load Tolerance System
// ver 1.0
// ==========================================

const VAULT_NAME = "Alt society";
const CARDIO_FOLDER = "Personal Life/02 Cardio";
const RECOVERY_LOG_FILE = "Personal Life/02 Cardio/Recovery Log.md";

const THEME = {
    color: "#7a8c9a",
    colorHover: "#8a9caa",
    colorBorder: "#2a3a4a",
    colorBorderHover: "#3a4a5a",
    colorMuted: "#5a6a7a",
    colorLight: "#90a8b8",
    colorWarning: "#9a7a6a",
    colorDanger: "#9a6a6a",
    colorSafe: "#7a9a7d",
    colorCaution: "#a89860"
};

// Pain intensity scale - ordinal, subjective but consistent
const PAIN_LEVELS = {
    0: { label: "None", emoji: "🟢", color: THEME.colorSafe, restHours: 0, desc: "No discomfort, tissue feels normal" },
    1: { label: "Trace", emoji: "🟡", color: THEME.colorCaution, restHours: 12, desc: "Barely perceptible, awareness without pain" },
    2: { label: "Mild", emoji: "🟠", color: THEME.colorWarning, restHours: 24, desc: "Noticeable during impact, resolves at rest" },
    3: { label: "Moderate", emoji: "🔴", color: THEME.colorDanger, restHours: 48, desc: "Present at rest, worse with load" },
    4: { label: "Significant", emoji: "🔴", color: "#8a5a5a", restHours: 96, desc: "Persistent ache, walking affected" },
    5: { label: "Severe", emoji: "⛔", color: "#6a3a3a", restHours: 168, desc: "Constant pain, consider medical consult" }
};

// Activity types and their impact profiles
const ACTIVITY_TYPES = {
    sprint: { label: "Sprint", emoji: "⚡", impactFactor: 3.0, desc: "High-impact, max force" },
    run: { label: "Run", emoji: "🏃", impactFactor: 2.0, desc: "Sustained impact loading" },
    jump: { label: "Jump", emoji: "🦘", impactFactor: 2.5, desc: "Plyometric stress" },
    walk: { label: "Walk", emoji: "🚶", impactFactor: 0.5, desc: "Low-impact recovery movement" },
    cycle: { label: "Cycle", emoji: "🚴", impactFactor: 0.2, desc: "Non-impact cardio" },
    swim: { label: "Swim", emoji: "🏊", impactFactor: 0.0, desc: "Zero impact, active recovery" }
};

const INTENSITY_LEVELS = {
    light: { label: "Light", multiplier: 0.5, color: THEME.colorSafe },
    moderate: { label: "Moderate", multiplier: 1.0, color: THEME.colorCaution },
    high: { label: "High", multiplier: 1.5, color: THEME.colorWarning },
    max: { label: "Max", multiplier: 2.0, color: THEME.colorDanger }
};

// ==========================================
// STYLES
// ==========================================
if (!document.getElementById('cardio-session-styles-v1')) {
    const style = document.createElement('style');
    style.id = 'cardio-session-styles-v1';
    style.textContent = `
        .cardio-container * { touch-action: pan-y !important; }
        @keyframes breathe {
            0%, 100% { box-shadow: inset 0 0 20px rgba(122, 140, 154, 0.03); }
            50% { box-shadow: inset 0 0 40px rgba(122, 140, 154, 0.08); }
        }
        @keyframes pulse-warning {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
        }
        @keyframes float-up {
            0% { transform: translateY(0); opacity: 0; }
            10% { opacity: 0.3; }
            90% { opacity: 0.3; }
            100% { transform: translateY(-80px); opacity: 0; }
        }
        .cardio-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0); display: flex; align-items: center;
            justify-content: center; z-index: 9999; backdrop-filter: blur(0px);
            transition: background 0.5s ease, backdrop-filter 0.5s ease;
        }
        .cardio-modal-overlay.visible {
            background: rgba(0,0,0,0.95); backdrop-filter: blur(4px);
        }
        .cardio-modal-content {
            background: #0a0a0a; padding: 32px; border: 1px solid #2a3a4a;
            max-width: 550px; max-height: 85vh; width: 90%;
            display: flex; flex-direction: column; gap: 20px;
            box-shadow: 0 40px 120px rgba(0,0,0,0.9); position: relative;
            opacity: 0; transform: translateY(30px);
            transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .cardio-modal-overlay.visible .cardio-modal-content {
            opacity: 1; transform: translateY(0);
        }
        .pain-level-btn {
            transition: all 0.3s ease; cursor: pointer;
        }
        .pain-level-btn:hover {
            transform: scale(1.05);
        }
        .pain-level-btn.selected {
            transform: scale(1.1);
            box-shadow: 0 0 20px currentColor;
        }
        .activity-card {
            transition: all 0.3s ease; cursor: pointer;
        }
        .activity-card:hover {
            transform: translateY(-2px);
        }
        .activity-card.selected {
            border-color: #7a8c9a !important;
            background: rgba(122, 140, 154, 0.1) !important;
        }
        .recovery-bar {
            height: 8px; background: #1a1a1a; border-radius: 4px; overflow: hidden;
        }
        .recovery-bar-fill {
            height: 100%; border-radius: 4px;
            transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .timeline-entry {
            transition: all 0.2s ease;
        }
        .timeline-entry:hover {
            background: #0f1214 !important;
        }
        .override-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 2px 8px;
            background: rgba(168, 152, 96, 0.2);
            border: 1px solid rgba(168, 152, 96, 0.4);
            border-radius: 3px;
            color: #a89860;
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 1px;
        }
    `;
    document.head.appendChild(style);
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
function createCorners(container, color, size = 18) {
    ['TL', 'TR', 'BL', 'BR'].forEach(pos => {
        const corner = document.createElement('div');
        const isTop = pos.includes('T'), isLeft = pos.includes('L');
        corner.style.cssText = `position: absolute; ${isTop ? 'top: 0' : 'bottom: 0'}; ${isLeft ? 'left: 0' : 'right: 0'}; width: ${size}px; height: ${size}px; border-${isTop ? 'top' : 'bottom'}: 1px solid ${color}; border-${isLeft ? 'left' : 'right'}: 1px solid ${color}; z-index: 10; pointer-events: none;`;
        container.appendChild(corner);
    });
}

function addFloatingMotes(container, color, count = 3) {
    for (let i = 0; i < count; i++) {
        const mote = document.createElement('div');
        mote.style.cssText = `position: absolute; bottom: 10%; left: ${10 + Math.random() * 80}%; width: ${1 + Math.random() * 2}px; height: ${1 + Math.random() * 2}px; background: ${color}; border-radius: 50%; opacity: 0; pointer-events: none; animation: float-up ${10 + Math.random() * 8}s ${Math.random() * 12}s ease-out infinite; z-index: 1;`;
        container.appendChild(mote);
    }
}

function formatDuration(hours) {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${Math.round(hours)}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    if (remainingHours === 0) return `${days}d`;
    return `${days}d ${remainingHours}h`;
}

function formatTimeAgo(timestamp) {
    const now = moment();
    const then = moment(timestamp);
    const hours = now.diff(then, 'hours');
    const days = now.diff(then, 'days');

    if (hours < 1) return `${now.diff(then, 'minutes')}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return then.format('MMM D');
}

function calculateLoadScore(activityType, intensity, durationMins) {
    const activity = ACTIVITY_TYPES[activityType] || { impactFactor: 1.0 };
    const intensityData = INTENSITY_LEVELS[intensity] || { multiplier: 1.0 };
    return Math.round(activity.impactFactor * intensityData.multiplier * (durationMins / 10) * 10) / 10;
}

// ==========================================
// DATA MANAGEMENT
// ==========================================
async function getRecoveryLog() {
    const file = app.vault.getAbstractFileByPath(RECOVERY_LOG_FILE);
    if (!file) return {
        currentPain: 0,
        lastPainUpdate: null,
        restStarted: null,
        recommendedRestEnd: null,
        entries: [],
        stats: {
            totalFlareups: 0,
            avgRecoveryTime: 0,
            overrideCount: 0,
            successfulOverrides: 0
        }
    };

    const cache = app.metadataCache.getFileCache(file);
    const fm = cache?.frontmatter || {};
    return {
        currentPain: fm.currentPain || 0,
        lastPainUpdate: fm.lastPainUpdate || null,
        restStarted: fm.restStarted || null,
        recommendedRestEnd: fm.recommendedRestEnd || null,
        entries: fm.entries || [],
        stats: fm.stats || {
            totalFlareups: 0,
            avgRecoveryTime: 0,
            overrideCount: 0,
            successfulOverrides: 0
        }
    };
}

async function saveRecoveryLog(data) {
    const content = `---
currentPain: ${data.currentPain}
lastPainUpdate: "${data.lastPainUpdate || ''}"
restStarted: "${data.restStarted || ''}"
recommendedRestEnd: "${data.recommendedRestEnd || ''}"
entries: ${JSON.stringify(data.entries)}
stats:
  totalFlareups: ${data.stats.totalFlareups}
  avgRecoveryTime: ${data.stats.avgRecoveryTime}
  overrideCount: ${data.stats.overrideCount}
  successfulOverrides: ${data.stats.successfulOverrides}
cssclasses:
  - hide-properties
---

# Shin Recovery Log

> Tissue-level recovery tracking for tibial stress management.
> This file is auto-managed by the Cardio session tracker.

Last updated: ${moment().format("YYYY-MM-DD HH:mm")}
`;

    const file = app.vault.getAbstractFileByPath(RECOVERY_LOG_FILE);
    if (file) {
        await app.vault.modify(file, content);
    } else {
        const folder = RECOVERY_LOG_FILE.substring(0, RECOVERY_LOG_FILE.lastIndexOf('/'));
        if (!app.vault.getAbstractFileByPath(folder)) {
            await app.vault.createFolder(folder);
        }
        await app.vault.create(RECOVERY_LOG_FILE, content);
    }
}

async function logEntry(type, data) {
    const log = await getRecoveryLog();
    const entry = {
        id: Date.now(),
        type: type,
        timestamp: moment().format(),
        ...data
    };

    log.entries.unshift(entry);

    // Keep last 200 entries
    if (log.entries.length > 200) {
        log.entries = log.entries.slice(0, 200);
    }

    // Update current state based on entry type
    if (type === 'pain_report') {
        log.currentPain = data.painLevel;
        log.lastPainUpdate = entry.timestamp;

        // If pain increased to 3+, track as flareup
        if (data.painLevel >= 3 && data.previousPain < 3) {
            log.stats.totalFlareups++;
        }

        // Calculate recommended rest
        const painConfig = PAIN_LEVELS[data.painLevel];
        if (painConfig.restHours > 0) {
            log.restStarted = entry.timestamp;
            log.recommendedRestEnd = moment().add(painConfig.restHours, 'hours').format();
        } else {
            log.restStarted = null;
            log.recommendedRestEnd = null;
        }
    }

    if (type === 'exposure') {
        // An exposure event - track load
        entry.loadScore = calculateLoadScore(data.activityType, data.intensity, data.durationMins);
    }

    if (type === 'override') {
        log.stats.overrideCount++;
        log.restStarted = null;
        log.recommendedRestEnd = null;
    }

    await saveRecoveryLog(log);
    return entry;
}

function getRecentEntries(entries, limit = 10) {
    return entries.slice(0, limit);
}

function analyzeRecoveryPatterns(entries) {
    // Find flareup-to-recovery cycles
    const cycles = [];
    let currentCycle = null;

    const sorted = [...entries].sort((a, b) =>
        new Date(a.timestamp) - new Date(b.timestamp)
    );

    for (const entry of sorted) {
        if (entry.type === 'pain_report') {
            if (entry.painLevel >= 3 && !currentCycle) {
                // Start of flareup
                currentCycle = {
                    flareupStart: entry.timestamp,
                    peakPain: entry.painLevel,
                    exposureBefore: null,
                    recoveryTime: null,
                    hadOverride: false
                };

                // Look for exposure event before flareup
                const flareupTime = new Date(entry.timestamp);
                for (let i = sorted.indexOf(entry) - 1; i >= 0; i--) {
                    if (sorted[i].type === 'exposure') {
                        const expTime = new Date(sorted[i].timestamp);
                        const hoursBefore = (flareupTime - expTime) / (1000 * 60 * 60);
                        if (hoursBefore <= 48) {
                            currentCycle.exposureBefore = sorted[i];
                        }
                        break;
                    }
                }
            } else if (entry.painLevel <= 1 && currentCycle) {
                // Recovery achieved
                const recoveryEnd = new Date(entry.timestamp);
                const flareupStart = new Date(currentCycle.flareupStart);
                currentCycle.recoveryTime = (recoveryEnd - flareupStart) / (1000 * 60 * 60);
                cycles.push(currentCycle);
                currentCycle = null;
            } else if (currentCycle && entry.painLevel > currentCycle.peakPain) {
                currentCycle.peakPain = entry.painLevel;
            }
        }

        if (entry.type === 'override' && currentCycle) {
            currentCycle.hadOverride = true;
        }
    }

    return {
        cycles,
        avgRecoveryTime: cycles.length > 0
            ? cycles.reduce((sum, c) => sum + (c.recoveryTime || 0), 0) / cycles.length
            : null,
        overrideSuccessRate: cycles.filter(c => c.hadOverride).length > 0
            ? cycles.filter(c => c.hadOverride && c.recoveryTime < 72).length /
              cycles.filter(c => c.hadOverride).length
            : null,
        relapseAfterOverride: cycles.filter(c => c.hadOverride && c.recoveryTime > 96).length
    };
}

function getLoadTrend(entries, weeks = 4) {
    const now = moment();
    const weeklyLoads = [];

    for (let w = 0; w < weeks; w++) {
        const weekStart = now.clone().subtract(w + 1, 'weeks');
        const weekEnd = now.clone().subtract(w, 'weeks');

        const weekEntries = entries.filter(e => {
            if (e.type !== 'exposure') return false;
            const entryTime = moment(e.timestamp);
            return entryTime.isAfter(weekStart) && entryTime.isBefore(weekEnd);
        });

        const totalLoad = weekEntries.reduce((sum, e) => sum + (e.loadScore || 0), 0);
        weeklyLoads.unshift({ week: w, load: totalLoad, sessions: weekEntries.length });
    }

    return weeklyLoads;
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

function createModal(title, contentBuilder, options = {}) {
    if (activeModal) {
        activeModal.parentNode.removeChild(activeModal);
        activeModal = null;
    }

    const modal = document.createElement("div");
    modal.className = "cardio-modal-overlay";
    activeModal = modal;

    const modalContent = document.createElement("div");
    modalContent.className = "cardio-modal-content";
    modalContent.style.maxWidth = options.maxWidth || '550px';
    modal.appendChild(modalContent);

    const scrollWrapper = document.createElement('div');
    scrollWrapper.style.cssText = 'overflow-y: auto; max-height: calc(85vh - 100px); display: flex; flex-direction: column; gap: 20px;';
    modalContent.appendChild(scrollWrapper);

    createCorners(modalContent, THEME.color);

    if (title) {
        const modalTitle = document.createElement("h2");
        modalTitle.textContent = title;
        modalTitle.style.cssText = `margin: 0; color: ${THEME.color}; font-size: 14px; font-weight: 500; font-family: "Times New Roman", serif; letter-spacing: 3px; text-align: center; text-transform: uppercase; opacity: 0.8;`;
        scrollWrapper.appendChild(modalTitle);

        const divider = document.createElement('div');
        divider.style.cssText = `width: 60px; height: 1px; background: linear-gradient(90deg, transparent, ${THEME.color}, transparent); margin: 0 auto;`;
        scrollWrapper.appendChild(divider);
    }

    contentBuilder(scrollWrapper);

    modal.onclick = (e) => { if (e.target === modal) closeModal(); };
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('visible'));

    return modal;
}

// ==========================================
// PAIN REPORT MODAL
// ==========================================
async function openPainReportModal() {
    const log = await getRecoveryLog();
    let selectedPain = log.currentPain;

    createModal("Report Pain Level", async (content) => {
        const instructionText = document.createElement('p');
        instructionText.textContent = "Rate your shin pain at this moment. Be consistent - this scale tracks your subjective experience over time.";
        instructionText.style.cssText = `margin: 0; color: ${THEME.colorMuted}; font-size: 12px; font-style: italic; text-align: center; line-height: 1.5;`;
        content.appendChild(instructionText);

        // Pain level grid - 2 columns for better mobile fit
        const painGrid = document.createElement('div');
        painGrid.style.cssText = 'display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 8px;';
        content.appendChild(painGrid);

        const painBtns = [];

        Object.entries(PAIN_LEVELS).forEach(([level, config]) => {
            const btn = document.createElement('div');
            btn.className = 'pain-level-btn';
            btn.style.cssText = `
                display: flex; flex-direction: column; align-items: center; gap: 4px;
                padding: 12px 8px; background: #0f0f0f;
                border: 2px solid ${parseInt(level) === selectedPain ? config.color : THEME.colorBorder};
                color: ${config.color}; text-align: center; min-width: 0;
            `;

            if (parseInt(level) === selectedPain) {
                btn.classList.add('selected');
            }

            btn.innerHTML = `
                <span style="font-size: 20px;">${config.emoji}</span>
                <span style="font-size: 16px; font-weight: 700;">${level}</span>
                <span style="font-size: 10px; color: ${THEME.colorMuted}; text-transform: uppercase; letter-spacing: 0.5px;">${config.label}</span>
            `;

            btn.onclick = () => {
                selectedPain = parseInt(level);
                painBtns.forEach(b => {
                    const lvl = parseInt(b.dataset.level);
                    b.classList.remove('selected');
                    b.style.borderColor = THEME.colorBorder;
                });
                btn.classList.add('selected');
                btn.style.borderColor = config.color;
                updateDescription();
            };

            btn.dataset.level = level;
            painGrid.appendChild(btn);
            painBtns.push(btn);
        });

        // Description display
        const descBox = document.createElement('div');
        descBox.style.cssText = `padding: 16px; background: #0c0c0c; border: 1px solid ${THEME.colorBorder}; border-left: 3px solid ${THEME.color};`;
        content.appendChild(descBox);

        const descTitle = document.createElement('div');
        descTitle.style.cssText = `color: ${THEME.color}; font-size: 13px; font-weight: 600; margin-bottom: 8px;`;
        descBox.appendChild(descTitle);

        const descText = document.createElement('div');
        descText.style.cssText = `color: ${THEME.colorMuted}; font-size: 12px; line-height: 1.5;`;
        descBox.appendChild(descText);

        const restInfo = document.createElement('div');
        restInfo.style.cssText = `margin-top: 12px; padding-top: 12px; border-top: 1px solid ${THEME.colorBorder}; color: ${THEME.colorMuted}; font-size: 11px;`;
        descBox.appendChild(restInfo);

        function updateDescription() {
            const config = PAIN_LEVELS[selectedPain];
            descTitle.textContent = `Level ${selectedPain}: ${config.label}`;
            descTitle.style.color = config.color;
            descText.textContent = config.desc;

            if (config.restHours > 0) {
                restInfo.innerHTML = `<strong style="color: ${config.color};">Recommended rest:</strong> ${formatDuration(config.restHours)} before next impact activity`;
            } else {
                restInfo.innerHTML = `<strong style="color: ${THEME.colorSafe};">Status:</strong> Clear for activity`;
            }
        }

        updateDescription();

        // Notes input
        const notesLabel = document.createElement('div');
        notesLabel.textContent = 'Notes (optional)';
        notesLabel.style.cssText = `color: ${THEME.colorMuted}; font-size: 11px; letter-spacing: 1px; text-transform: uppercase;`;
        content.appendChild(notesLabel);

        const notesInput = document.createElement('textarea');
        notesInput.placeholder = 'Any context: what triggered it, location, sensation type...';
        notesInput.style.cssText = `width: 100%; height: 60px; padding: 12px; background: #0f0f0f; border: 1px solid ${THEME.colorBorder}; color: ${THEME.color}; font-size: 13px; resize: none; box-sizing: border-box;`;
        content.appendChild(notesInput);

        // Submit button
        const submitBtn = document.createElement('button');
        submitBtn.textContent = "LOG PAIN LEVEL";
        submitBtn.style.cssText = `width: 100%; padding: 16px; background: ${THEME.color}; border: none; color: #0a0a0a; font-size: 14px; font-weight: 700; letter-spacing: 2px; cursor: pointer; transition: all 0.3s ease;`;
        submitBtn.onmouseover = () => { submitBtn.style.background = THEME.colorHover; };
        submitBtn.onmouseout = () => { submitBtn.style.background = THEME.color; };
        submitBtn.onclick = async () => {
            await logEntry('pain_report', {
                painLevel: selectedPain,
                previousPain: log.currentPain,
                notes: notesInput.value.trim() || null
            });

            closeModal();
            new Notice(`Pain level logged: ${selectedPain} (${PAIN_LEVELS[selectedPain].label})`);
            setTimeout(() => location.reload(), 300);
        };
        content.appendChild(submitBtn);
    });
}

// ==========================================
// LOG EXPOSURE MODAL
// ==========================================
async function openLogExposureModal() {
    const log = await getRecoveryLog();

    let selectedActivity = null;
    let selectedIntensity = 'moderate';
    let durationMins = 20;

    // Check if in rest period
    const inRestPeriod = log.recommendedRestEnd && moment().isBefore(moment(log.recommendedRestEnd));
    const hoursRemaining = inRestPeriod ? moment(log.recommendedRestEnd).diff(moment(), 'hours', true) : 0;

    createModal("Log Activity", async (content) => {
        // Warning if in rest period
        if (inRestPeriod && log.currentPain >= 2) {
            const warningBox = document.createElement('div');
            warningBox.style.cssText = `
                padding: 16px; background: rgba(154, 106, 106, 0.1);
                border: 1px solid ${THEME.colorDanger}; margin-bottom: 8px;
                animation: pulse-warning 2s ease-in-out infinite;
            `;
            warningBox.innerHTML = `
                <div style="color: ${THEME.colorDanger}; font-size: 13px; font-weight: 600; margin-bottom: 8px;">
                    ⚠️ Rest Period Active
                </div>
                <div style="color: ${THEME.colorMuted}; font-size: 12px; line-height: 1.5;">
                    Current pain: <strong style="color: ${PAIN_LEVELS[log.currentPain].color}">${log.currentPain}</strong> (${PAIN_LEVELS[log.currentPain].label})<br>
                    Recommended rest remaining: <strong>${formatDuration(hoursRemaining)}</strong><br><br>
                    Logging activity now will be recorded as an <strong style="color: ${THEME.colorCaution};">override</strong>.
                    This data helps track adaptation patterns.
                </div>
            `;
            content.appendChild(warningBox);
        }

        // Activity type selection
        const activityLabel = document.createElement('div');
        activityLabel.textContent = 'Activity Type';
        activityLabel.style.cssText = `color: ${THEME.colorMuted}; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;`;
        content.appendChild(activityLabel);

        const activityGrid = document.createElement('div');
        activityGrid.style.cssText = 'display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;';
        content.appendChild(activityGrid);

        const activityBtns = [];

        Object.entries(ACTIVITY_TYPES).forEach(([key, config]) => {
            const btn = document.createElement('div');
            btn.className = 'activity-card';
            btn.style.cssText = `
                display: flex; flex-direction: column; align-items: center; gap: 4px;
                padding: 10px 6px; background: #0f0f0f;
                border: 1px solid ${THEME.colorBorder}; text-align: center; min-width: 0;
            `;

            btn.innerHTML = `
                <span style="font-size: 18px;">${config.emoji}</span>
                <span style="font-size: 10px; color: ${THEME.color}; text-transform: uppercase; letter-spacing: 0.5px;">${config.label}</span>
                <span style="font-size: 8px; color: ${THEME.colorMuted};">Impact: ${config.impactFactor}x</span>
            `;

            btn.onclick = () => {
                selectedActivity = key;
                activityBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                updateLoadPreview();
            };

            btn.dataset.activity = key;
            activityGrid.appendChild(btn);
            activityBtns.push(btn);
        });

        // Intensity selection
        const intensityLabel = document.createElement('div');
        intensityLabel.textContent = 'Intensity';
        intensityLabel.style.cssText = `color: ${THEME.colorMuted}; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin-top: 16px; margin-bottom: 8px;`;
        content.appendChild(intensityLabel);

        const intensityRow = document.createElement('div');
        intensityRow.style.cssText = 'display: flex; gap: 8px;';
        content.appendChild(intensityRow);

        const intensityBtns = [];

        Object.entries(INTENSITY_LEVELS).forEach(([key, config]) => {
            const btn = document.createElement('button');
            btn.textContent = config.label;
            btn.style.cssText = `
                flex: 1; padding: 12px 8px;
                background: ${key === selectedIntensity ? 'rgba(122, 140, 154, 0.2)' : '#0f0f0f'};
                border: 1px solid ${key === selectedIntensity ? THEME.color : THEME.colorBorder};
                color: ${key === selectedIntensity ? THEME.color : THEME.colorMuted};
                font-size: 12px; cursor: pointer; transition: all 0.2s;
            `;

            btn.onclick = () => {
                selectedIntensity = key;
                intensityBtns.forEach((b, i) => {
                    const k = Object.keys(INTENSITY_LEVELS)[i];
                    b.style.background = k === selectedIntensity ? 'rgba(122, 140, 154, 0.2)' : '#0f0f0f';
                    b.style.borderColor = k === selectedIntensity ? THEME.color : THEME.colorBorder;
                    b.style.color = k === selectedIntensity ? THEME.color : THEME.colorMuted;
                });
                updateLoadPreview();
            };

            intensityRow.appendChild(btn);
            intensityBtns.push(btn);
        });

        // Duration input
        const durationLabel = document.createElement('div');
        durationLabel.textContent = 'Duration (minutes)';
        durationLabel.style.cssText = `color: ${THEME.colorMuted}; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin-top: 16px; margin-bottom: 8px;`;
        content.appendChild(durationLabel);

        const durationRow = document.createElement('div');
        durationRow.style.cssText = 'display: flex; align-items: center; gap: 12px;';
        content.appendChild(durationRow);

        const minusBtn = document.createElement('button');
        minusBtn.textContent = '−';
        minusBtn.style.cssText = `width: 40px; height: 40px; background: #0f0f0f; border: 1px solid ${THEME.colorBorder}; color: ${THEME.color}; font-size: 20px; cursor: pointer;`;
        minusBtn.onclick = () => {
            if (durationMins > 5) {
                durationMins -= 5;
                durationDisplay.textContent = `${durationMins} min`;
                updateLoadPreview();
            }
        };
        durationRow.appendChild(minusBtn);

        const durationDisplay = document.createElement('div');
        durationDisplay.textContent = `${durationMins} min`;
        durationDisplay.style.cssText = `flex: 1; text-align: center; font-size: 24px; font-weight: 600; color: ${THEME.color};`;
        durationRow.appendChild(durationDisplay);

        const plusBtn = document.createElement('button');
        plusBtn.textContent = '+';
        plusBtn.style.cssText = `width: 40px; height: 40px; background: #0f0f0f; border: 1px solid ${THEME.colorBorder}; color: ${THEME.color}; font-size: 20px; cursor: pointer;`;
        plusBtn.onclick = () => {
            durationMins += 5;
            durationDisplay.textContent = `${durationMins} min`;
            updateLoadPreview();
        };
        durationRow.appendChild(plusBtn);

        // Load score preview
        const loadPreview = document.createElement('div');
        loadPreview.style.cssText = `margin-top: 16px; padding: 16px; background: #0c0c0c; border: 1px solid ${THEME.colorBorder}; text-align: center;`;
        content.appendChild(loadPreview);

        function updateLoadPreview() {
            if (!selectedActivity) {
                loadPreview.innerHTML = `<span style="color: ${THEME.colorMuted}; font-style: italic;">Select an activity to see load score</span>`;
                return;
            }

            const loadScore = calculateLoadScore(selectedActivity, selectedIntensity, durationMins);
            const loadColor = loadScore < 3 ? THEME.colorSafe : loadScore < 6 ? THEME.colorCaution : THEME.colorDanger;

            loadPreview.innerHTML = `
                <div style="color: ${THEME.colorMuted}; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;">Estimated Load Score</div>
                <div style="color: ${loadColor}; font-size: 32px; font-weight: 700;">${loadScore}</div>
                <div style="color: ${THEME.colorMuted}; font-size: 11px; margin-top: 4px;">
                    ${loadScore < 3 ? 'Low impact - recovery friendly' : loadScore < 6 ? 'Moderate impact - monitor response' : 'High impact - significant tissue stress'}
                </div>
            `;
        }

        updateLoadPreview();

        // Notes input
        const notesLabel = document.createElement('div');
        notesLabel.textContent = 'Notes (optional)';
        notesLabel.style.cssText = `color: ${THEME.colorMuted}; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; margin-top: 16px;`;
        content.appendChild(notesLabel);

        const notesInput = document.createElement('textarea');
        notesInput.placeholder = 'Surface, footwear, conditions, how it felt...';
        notesInput.style.cssText = `width: 100%; height: 50px; padding: 12px; background: #0f0f0f; border: 1px solid ${THEME.colorBorder}; color: ${THEME.color}; font-size: 13px; resize: none; box-sizing: border-box; margin-top: 8px;`;
        content.appendChild(notesInput);

        // Submit button
        const submitBtn = document.createElement('button');
        submitBtn.textContent = inRestPeriod && log.currentPain >= 2 ? "LOG ACTIVITY (OVERRIDE REST)" : "LOG ACTIVITY";
        submitBtn.style.cssText = `
            width: 100%; padding: 16px; margin-top: 16px;
            background: ${inRestPeriod && log.currentPain >= 2 ? THEME.colorCaution : THEME.color};
            border: none; color: #0a0a0a; font-size: 14px; font-weight: 700;
            letter-spacing: 2px; cursor: pointer; transition: all 0.3s ease;
        `;
        submitBtn.onclick = async () => {
            if (!selectedActivity) {
                new Notice('Please select an activity type');
                return;
            }

            const isOverride = inRestPeriod && log.currentPain >= 2;

            // Log the exposure
            await logEntry('exposure', {
                activityType: selectedActivity,
                intensity: selectedIntensity,
                durationMins: durationMins,
                painAtTime: log.currentPain,
                notes: notesInput.value.trim() || null,
                wasOverride: isOverride
            });

            // If override, log that separately for tracking
            if (isOverride) {
                await logEntry('override', {
                    hoursEarly: hoursRemaining,
                    painAtOverride: log.currentPain,
                    activityType: selectedActivity
                });
            }

            closeModal();
            new Notice(`${ACTIVITY_TYPES[selectedActivity].label} logged${isOverride ? ' (override recorded)' : ''}`);
            setTimeout(() => location.reload(), 300);
        };
        content.appendChild(submitBtn);
    });
}

// ==========================================
// INSIGHTS MODAL
// ==========================================
async function openInsightsModal() {
    const log = await getRecoveryLog();
    const analysis = analyzeRecoveryPatterns(log.entries);
    const loadTrend = getLoadTrend(log.entries, 4);

    createModal("Recovery Insights", (content) => {
        // Summary stats
        const statsGrid = document.createElement('div');
        statsGrid.style.cssText = 'display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;';
        content.appendChild(statsGrid);

        const statItems = [
            { label: 'Total Flareups', value: log.stats.totalFlareups, color: THEME.colorDanger },
            { label: 'Avg Recovery', value: analysis.avgRecoveryTime ? `${Math.round(analysis.avgRecoveryTime)}h` : '—', color: THEME.color },
            { label: 'Override Count', value: log.stats.overrideCount, color: THEME.colorCaution },
            { label: 'Override Success', value: analysis.overrideSuccessRate !== null ? `${Math.round(analysis.overrideSuccessRate * 100)}%` : '—', color: THEME.colorSafe }
        ];

        statItems.forEach(item => {
            const statBox = document.createElement('div');
            statBox.style.cssText = `padding: 16px; background: #0f0f0f; border: 1px solid ${THEME.colorBorder}; text-align: center;`;
            statBox.innerHTML = `
                <div style="color: ${THEME.colorMuted}; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">${item.label}</div>
                <div style="color: ${item.color}; font-size: 24px; font-weight: 700;">${item.value}</div>
            `;
            statsGrid.appendChild(statBox);
        });

        // Weekly load trend
        const trendSection = document.createElement('div');
        trendSection.style.cssText = `margin-top: 8px; padding: 16px; background: #0c0c0c; border: 1px solid ${THEME.colorBorder};`;
        content.appendChild(trendSection);

        const trendTitle = document.createElement('div');
        trendTitle.textContent = 'Weekly Load Trend';
        trendTitle.style.cssText = `color: ${THEME.colorMuted}; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px;`;
        trendSection.appendChild(trendTitle);

        const trendBars = document.createElement('div');
        trendBars.style.cssText = 'display: flex; gap: 8px; align-items: flex-end; height: 100px;';
        trendSection.appendChild(trendBars);

        const maxLoad = Math.max(...loadTrend.map(w => w.load), 1);

        loadTrend.forEach((week, idx) => {
            const barContainer = document.createElement('div');
            barContainer.style.cssText = 'flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;';

            const bar = document.createElement('div');
            const height = (week.load / maxLoad) * 80;
            bar.style.cssText = `width: 100%; height: ${Math.max(height, 4)}px; background: ${THEME.color}; transition: height 0.5s ease;`;
            barContainer.appendChild(bar);

            const label = document.createElement('div');
            label.textContent = idx === 3 ? 'This wk' : `-${3 - idx}w`;
            label.style.cssText = `font-size: 9px; color: ${THEME.colorMuted};`;
            barContainer.appendChild(label);

            const value = document.createElement('div');
            value.textContent = week.load.toFixed(1);
            value.style.cssText = `font-size: 10px; color: ${THEME.color}; font-weight: 600;`;
            barContainer.appendChild(value);

            trendBars.appendChild(barContainer);
        });

        // Interpretation
        const interpretSection = document.createElement('div');
        interpretSection.style.cssText = `margin-top: 16px; padding: 16px; background: #0c0c0c; border-left: 3px solid ${THEME.color};`;
        content.appendChild(interpretSection);

        const interpretTitle = document.createElement('div');
        interpretTitle.textContent = 'Pattern Analysis';
        interpretTitle.style.cssText = `color: ${THEME.color}; font-size: 12px; font-weight: 600; margin-bottom: 12px;`;
        interpretSection.appendChild(interpretTitle);

        const interpretText = document.createElement('div');
        interpretText.style.cssText = `color: ${THEME.colorMuted}; font-size: 12px; line-height: 1.6;`;

        let interpretation = '';

        if (analysis.cycles.length < 2) {
            interpretation = 'Insufficient data for pattern analysis. Continue logging to build insight.';
        } else {
            // Recovery trend
            const recentCycles = analysis.cycles.slice(-3);
            const olderCycles = analysis.cycles.slice(0, -3);

            if (olderCycles.length > 0) {
                const recentAvg = recentCycles.reduce((s, c) => s + (c.recoveryTime || 0), 0) / recentCycles.length;
                const olderAvg = olderCycles.reduce((s, c) => s + (c.recoveryTime || 0), 0) / olderCycles.length;

                if (recentAvg < olderAvg * 0.8) {
                    interpretation += '📈 <strong style="color: ' + THEME.colorSafe + '">Recovery improving</strong> - recent cycles resolve faster than earlier ones.<br><br>';
                } else if (recentAvg > olderAvg * 1.2) {
                    interpretation += '📉 <strong style="color: ' + THEME.colorDanger + '">Recovery slowing</strong> - consider reducing load intensity.<br><br>';
                } else {
                    interpretation += '➡️ <strong>Recovery stable</strong> - consistent healing rate across cycles.<br><br>';
                }
            }

            // Override analysis
            if (analysis.overrideSuccessRate !== null) {
                if (analysis.overrideSuccessRate > 0.7) {
                    interpretation += '✅ Override history suggests your body adapts well to early return. Trust your judgment.<br><br>';
                } else if (analysis.overrideSuccessRate < 0.4) {
                    interpretation += '⚠️ Overrides frequently lead to extended recovery. Consider honoring rest periods more consistently.<br><br>';
                }
            }

            // Load trend analysis
            const totalRecentLoad = loadTrend.slice(-2).reduce((s, w) => s + w.load, 0);
            const totalOlderLoad = loadTrend.slice(0, 2).reduce((s, w) => s + w.load, 0);

            if (totalRecentLoad > totalOlderLoad * 1.3) {
                interpretation += '⬆️ Load trending up - monitor for delayed onset symptoms.';
            } else if (totalRecentLoad < totalOlderLoad * 0.7) {
                interpretation += '⬇️ Load decreasing - tissue should be recovering well.';
            }
        }

        interpretText.innerHTML = interpretation || 'Keep logging to generate insights.';
        interpretSection.appendChild(interpretText);

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'CLOSE';
        closeBtn.style.cssText = `width: 100%; padding: 14px; margin-top: 16px; background: #0f0f0f; border: 1px solid ${THEME.colorBorder}; color: ${THEME.color}; font-size: 12px; letter-spacing: 2px; cursor: pointer;`;
        closeBtn.onclick = () => closeModal();
        content.appendChild(closeBtn);
    });
}

// ==========================================
// MAIN RENDER
// ==========================================
const container = dv.el("div", "", { cls: "cardio-container", attr: { style: "max-width: 480px; margin: 0 auto; padding: 0;" } });

async function render() {
    const log = await getRecoveryLog();
    const painConfig = PAIN_LEVELS[log.currentPain];
    const inRestPeriod = log.recommendedRestEnd && moment().isBefore(moment(log.recommendedRestEnd));
    const hoursRemaining = inRestPeriod ? moment(log.recommendedRestEnd).diff(moment(), 'hours', true) : 0;
    const restProgress = inRestPeriod && log.restStarted
        ? Math.min(100, ((moment() - moment(log.restStarted)) / (moment(log.recommendedRestEnd) - moment(log.restStarted))) * 100)
        : 100;

    // ==========================================
    // HEADER CARD
    // ==========================================
    const headerCard = document.createElement('div');
    headerCard.style.cssText = `border: 1px solid ${THEME.colorBorder}; padding: 0; margin-bottom: 24px; background: #0a0a0a; box-shadow: 0 20px 60px rgba(0,0,0,0.8); overflow: hidden; position: relative; animation: breathe 8s ease-in-out infinite;`;
    container.appendChild(headerCard);
    createCorners(headerCard, THEME.color);
    addFloatingMotes(headerCard, THEME.color, 3);

    const headerSection = document.createElement('div');
    headerSection.style.cssText = `padding: 28px 32px; background: linear-gradient(180deg, #0f1214 0%, #0a0a0a 100%); border-bottom: 1px solid ${THEME.colorBorder};`;
    headerCard.appendChild(headerSection);

    const iconTitle = document.createElement('div');
    iconTitle.style.cssText = 'display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 12px;';
    iconTitle.innerHTML = `<span style="font-size: 28px;">🦵</span><h2 style="margin: 0; color: ${THEME.color}; font-size: 24px; font-weight: 600; letter-spacing: 1px;">Shin Recovery</h2>`;
    headerSection.appendChild(iconTitle);

    const divider = document.createElement('div');
    divider.style.cssText = `width: 40px; height: 1px; background: linear-gradient(90deg, transparent, ${THEME.color}, transparent); margin: 0 auto 14px auto;`;
    headerSection.appendChild(divider);

    const descP = document.createElement('p');
    descP.textContent = "Tissue recovery & load tolerance tracking";
    descP.style.cssText = `margin: 0; color: ${THEME.colorMuted}; font-size: 13px; font-style: italic; text-align: center;`;
    headerSection.appendChild(descP);

    // ==========================================
    // CURRENT STATUS SECTION
    // ==========================================
    const statusSection = document.createElement('div');
    statusSection.style.cssText = `padding: 24px 32px; background: #0c0e10;`;
    headerCard.appendChild(statusSection);

    const statusTitle = document.createElement('div');
    statusTitle.textContent = 'Current Status';
    statusTitle.style.cssText = `color: ${THEME.colorMuted}; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 16px; text-align: center;`;
    statusSection.appendChild(statusTitle);

    // Pain level display
    const painDisplay = document.createElement('div');
    painDisplay.style.cssText = 'display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 20px;';
    statusSection.appendChild(painDisplay);

    const painEmoji = document.createElement('div');
    painEmoji.textContent = painConfig.emoji;
    painEmoji.style.cssText = 'font-size: 48px;';
    painDisplay.appendChild(painEmoji);

    const painInfo = document.createElement('div');
    painInfo.innerHTML = `
        <div style="font-size: 36px; font-weight: 700; color: ${painConfig.color};">${log.currentPain}</div>
        <div style="font-size: 14px; color: ${painConfig.color}; text-transform: uppercase; letter-spacing: 2px;">${painConfig.label}</div>
    `;
    painDisplay.appendChild(painInfo);

    // Last update
    if (log.lastPainUpdate) {
        const lastUpdate = document.createElement('div');
        lastUpdate.textContent = `Last reported: ${formatTimeAgo(log.lastPainUpdate)}`;
        lastUpdate.style.cssText = `color: ${THEME.colorMuted}; font-size: 11px; text-align: center; margin-bottom: 16px;`;
        statusSection.appendChild(lastUpdate);
    }

    // Rest status bar
    if (inRestPeriod) {
        const restBox = document.createElement('div');
        restBox.style.cssText = `padding: 16px; background: rgba(154, 122, 106, 0.1); border: 1px solid ${THEME.colorWarning}; margin-bottom: 16px;`;
        statusSection.appendChild(restBox);

        const restTitle = document.createElement('div');
        restTitle.style.cssText = `display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;`;
        restTitle.innerHTML = `
            <span style="color: ${THEME.colorWarning}; font-size: 12px; font-weight: 600; letter-spacing: 1px;">⏳ REST PERIOD ACTIVE</span>
            <span style="color: ${THEME.colorMuted}; font-size: 11px;">${formatDuration(hoursRemaining)} remaining</span>
        `;
        restBox.appendChild(restTitle);

        const progressBar = document.createElement('div');
        progressBar.className = 'recovery-bar';
        restBox.appendChild(progressBar);

        const progressFill = document.createElement('div');
        progressFill.className = 'recovery-bar-fill';
        progressFill.style.cssText = `width: ${restProgress}%; background: linear-gradient(90deg, ${THEME.colorWarning}, ${THEME.colorSafe});`;
        progressBar.appendChild(progressFill);

        const progressLabels = document.createElement('div');
        progressLabels.style.cssText = `display: flex; justify-content: space-between; margin-top: 8px; font-size: 10px; color: ${THEME.colorMuted};`;
        progressLabels.innerHTML = `
            <span>Started ${formatTimeAgo(log.restStarted)}</span>
            <span>${Math.round(restProgress)}% complete</span>
        `;
        restBox.appendChild(progressLabels);
    } else if (log.currentPain === 0) {
        const clearBox = document.createElement('div');
        clearBox.style.cssText = `padding: 16px; background: rgba(122, 154, 125, 0.1); border: 1px solid ${THEME.colorSafe}; text-align: center;`;
        clearBox.innerHTML = `
            <div style="color: ${THEME.colorSafe}; font-size: 13px; font-weight: 600;">✅ Clear for Activity</div>
            <div style="color: ${THEME.colorMuted}; font-size: 11px; margin-top: 4px;">No restrictions. Monitor response to load.</div>
        `;
        statusSection.appendChild(clearBox);
    }

    // ==========================================
    // ACTION BUTTONS
    // ==========================================
    const actionsContainer = document.createElement('div');
    actionsContainer.style.cssText = 'display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;';
    container.appendChild(actionsContainer);

    // Report pain button
    const painBtn = document.createElement('button');
    painBtn.innerHTML = `<span style="font-size: 18px;">📊</span> REPORT PAIN LEVEL`;
    painBtn.style.cssText = `width: 100%; padding: 18px 24px; background: ${THEME.color}; border: none; color: #0a0a0a; font-size: 14px; font-weight: 700; letter-spacing: 2px; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 12px;`;
    painBtn.onmouseover = () => { painBtn.style.background = THEME.colorHover; painBtn.style.transform = "translateY(-2px)"; };
    painBtn.onmouseout = () => { painBtn.style.background = THEME.color; painBtn.style.transform = "translateY(0)"; };
    painBtn.onclick = () => openPainReportModal();
    actionsContainer.appendChild(painBtn);

    // Log activity button
    const activityBtn = document.createElement('button');
    const activityLabel = inRestPeriod && log.currentPain >= 2 ? "LOG ACTIVITY (OVERRIDE)" : "LOG ACTIVITY";
    const activityColor = inRestPeriod && log.currentPain >= 2 ? THEME.colorCaution : '#0f0f0f';
    const activityBorderColor = inRestPeriod && log.currentPain >= 2 ? THEME.colorCaution : THEME.colorBorder;

    activityBtn.innerHTML = `<span style="font-size: 18px;">🏃</span> ${activityLabel}`;
    activityBtn.style.cssText = `width: 100%; padding: 16px 24px; background: ${activityColor}; border: 1px solid ${activityBorderColor}; color: ${inRestPeriod && log.currentPain >= 2 ? '#0a0a0a' : THEME.color}; font-size: 13px; font-weight: 600; letter-spacing: 2px; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 12px;`;
    activityBtn.onmouseover = () => { activityBtn.style.borderColor = THEME.color; activityBtn.style.background = inRestPeriod && log.currentPain >= 2 ? THEME.colorHover : '#1a1a1a'; };
    activityBtn.onmouseout = () => { activityBtn.style.borderColor = activityBorderColor; activityBtn.style.background = activityColor; };
    activityBtn.onclick = () => openLogExposureModal();
    actionsContainer.appendChild(activityBtn);

    // View insights button
    const insightsBtn = document.createElement('button');
    insightsBtn.innerHTML = `<span style="font-size: 16px;">📈</span> View Recovery Insights`;
    insightsBtn.style.cssText = `width: 100%; padding: 14px 24px; background: #0f0f0f; border: 1px solid ${THEME.colorBorder}; color: ${THEME.colorMuted}; font-size: 12px; letter-spacing: 1px; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 10px;`;
    insightsBtn.onmouseover = () => { insightsBtn.style.borderColor = THEME.color; insightsBtn.style.color = THEME.color; };
    insightsBtn.onmouseout = () => { insightsBtn.style.borderColor = THEME.colorBorder; insightsBtn.style.color = THEME.colorMuted; };
    insightsBtn.onclick = () => openInsightsModal();
    actionsContainer.appendChild(insightsBtn);

    // ==========================================
    // RECENT TIMELINE
    // ==========================================
    const timelineCard = document.createElement('div');
    timelineCard.style.cssText = `border: 1px solid ${THEME.colorBorder}; padding: 24px; background: #0a0a0a; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8); position: relative;`;
    container.appendChild(timelineCard);
    createCorners(timelineCard, THEME.color);

    const timelineTitle = document.createElement('h3');
    timelineTitle.textContent = 'Recent Activity';
    timelineTitle.style.cssText = `margin: 0 0 16px 0; color: ${THEME.color}; font-size: 12px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; opacity: 0.7;`;
    timelineCard.appendChild(timelineTitle);

    const timelineList = document.createElement('div');
    timelineList.style.cssText = 'display: flex; flex-direction: column; gap: 8px;';
    timelineCard.appendChild(timelineList);

    const recentEntries = getRecentEntries(log.entries, 8);

    if (recentEntries.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.textContent = "No entries yet. Start by reporting your current pain level.";
        emptyMsg.style.cssText = `text-align: center; padding: 24px; color: ${THEME.colorMuted}; font-style: italic;`;
        timelineList.appendChild(emptyMsg);
    } else {
        recentEntries.forEach(entry => {
            const item = document.createElement('div');
            item.className = 'timeline-entry';
            item.style.cssText = `display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: #0c0c0c; border: 1px solid ${THEME.colorBorder}; transition: all 0.2s ease;`;
            timelineList.appendChild(item);

            let emoji, label, detail, color;

            if (entry.type === 'pain_report') {
                const painLevel = PAIN_LEVELS[entry.painLevel];
                emoji = painLevel.emoji;
                label = `Pain: ${entry.painLevel}`;
                detail = painLevel.label;
                color = painLevel.color;
            } else if (entry.type === 'exposure') {
                const activity = ACTIVITY_TYPES[entry.activityType];
                emoji = activity.emoji;
                label = activity.label;
                detail = `${entry.durationMins}min • ${entry.intensity} • Load: ${entry.loadScore || '?'}`;
                color = THEME.color;
            } else if (entry.type === 'override') {
                emoji = '⚡';
                label = 'Override';
                detail = `${formatDuration(entry.hoursEarly)} early`;
                color = THEME.colorCaution;
            } else {
                emoji = '📝';
                label = entry.type;
                detail = '';
                color = THEME.colorMuted;
            }

            const emojiEl = document.createElement('div');
            emojiEl.textContent = emoji;
            emojiEl.style.cssText = 'font-size: 18px; width: 28px; text-align: center;';
            item.appendChild(emojiEl);

            const infoEl = document.createElement('div');
            infoEl.style.cssText = 'flex: 1;';
            infoEl.innerHTML = `
                <div style="color: ${color}; font-size: 13px; font-weight: 600;">${label}</div>
                <div style="color: ${THEME.colorMuted}; font-size: 11px;">${detail}</div>
            `;
            item.appendChild(infoEl);

            const timeEl = document.createElement('div');
            timeEl.textContent = formatTimeAgo(entry.timestamp);
            timeEl.style.cssText = `color: ${THEME.colorMuted}; font-size: 10px;`;
            item.appendChild(timeEl);

            // Override badge
            if (entry.wasOverride) {
                const badge = document.createElement('span');
                badge.className = 'override-badge';
                badge.textContent = 'OVERRIDE';
                item.appendChild(badge);
            }
        });
    }

    // ==========================================
    // REFERENCE GUIDE
    // ==========================================
    const guideCard = document.createElement('div');
    guideCard.style.cssText = `margin-top: 24px; border: 1px dashed ${THEME.colorBorder}; padding: 20px; background: #0a0a0a;`;
    container.appendChild(guideCard);

    const guideTitle = document.createElement('div');
    guideTitle.textContent = 'Pain Scale Reference';
    guideTitle.style.cssText = `color: ${THEME.colorMuted}; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px; text-align: center;`;
    guideCard.appendChild(guideTitle);

    const guideGrid = document.createElement('div');
    guideGrid.style.cssText = 'display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px;';
    guideCard.appendChild(guideGrid);

    Object.entries(PAIN_LEVELS).forEach(([level, config]) => {
        const cell = document.createElement('div');
        cell.style.cssText = `padding: 6px; background: #0c0c0c; border: 1px solid ${THEME.colorBorder}; text-align: center; min-width: 0;`;
        cell.innerHTML = `
            <div style="font-size: 12px;">${config.emoji}</div>
            <div style="font-size: 14px; font-weight: 700; color: ${config.color};">${level}</div>
            <div style="font-size: 8px; color: ${THEME.colorMuted}; text-transform: uppercase;">${config.label}</div>
            <div style="font-size: 7px; color: ${THEME.colorMuted}; margin-top: 2px;">Rest: ${formatDuration(config.restHours)}</div>
        `;
        guideGrid.appendChild(cell);
    });
}

render();
```
