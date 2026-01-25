---
banner(1): Obsidian/Images/'Workout session'.jpg
---

```dataviewjs
// ==========================================
// WORKOUT SESSION
// ver 3.7
// ==========================================

const VAULT_NAME = "Alt society";
const WORKOUT_FOLDER = "Personal Life/01 Workout";
const STATS_FILE = "Personal Life/Personal Stats.md";
const EXERCISE_DB_FOLDER = "Home/Activities/Exercises database";

const THEME = {
    color: "#9a8c7a",
    colorHover: "#aa9c8a",
    colorBorder: "#3a342a",
    colorBorderHover: "#4a443a",
    colorMuted: "#6a5a4a",
    colorLight: "#b8a890",
    colorDiscipline: "#a89860",
    colorFlow: "#6a8a9a",
    systemGreen: "#7a9a7d"
};

const MUSCLE_GROUPS = {
    "Neck": { subgroups: null, icon: "🦴" },
    "Back": { subgroups: ["Lats", "Traps", "Rhomboids", "Lower Back", "Rear Delts"], icon: "🔙" },
    "Chest": { subgroups: null, icon: "💪" },
    "Shoulders": { subgroups: ["Front Delts", "Side Delts", "Rear Delts"], icon: "🎯" },
    "Core": { subgroups: null, icon: "🎯" },
    "Legs": { subgroups: ["Quads", "Hamstrings", "Glutes", "Calves", "Adductors"], icon: "🦵" },
    "Arms": { subgroups: ["Biceps", "Triceps", "Forearms"], icon: "💪" }
};

const STRENGTH_LEVELS = {
    "Untrained": { color: "#6a6a6a", next: "Beginner", icon: "○" },
    "Beginner": { color: "#a89860", next: "Novice", icon: "◐" },
    "Novice": { color: "#7a9a7d", next: "Intermediate", icon: "◑" },
    "Intermediate": { color: "#6a8a9a", next: "Advanced", icon: "◕" },
    "Advanced": { color: "#8a7a9a", next: "Elite", icon: "●" },
    "Elite": { color: "#9a6a7a", next: null, icon: "★" }
};

// ==========================================
// STYLES
// ==========================================
if (!document.getElementById('workout-session-styles-v37')) {
    const style = document.createElement('style');
    style.id = 'workout-session-styles-v37';
    style.textContent = `
        .workout-container * { touch-action: pan-y !important; }
        @keyframes breathe { 0%, 100% { box-shadow: inset 0 0 20px rgba(154, 140, 122, 0.03); } 50% { box-shadow: inset 0 0 40px rgba(154, 140, 122, 0.08); } }
        @keyframes float-up { 0% { transform: translateY(0); opacity: 0; } 10% { opacity: 0.4; } 90% { opacity: 0.4; } 100% { transform: translateY(-100px) translateX(20px); opacity: 0; } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        .workout-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0); display: flex; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(0px); transition: background 0.5s ease, backdrop-filter 0.5s ease; }
        .workout-modal-overlay.visible { background: rgba(0,0,0,0.95); backdrop-filter: blur(4px); }
        .workout-modal-content { background: #0a0a0a; padding: 32px; border: 1px solid #3a342a; max-width: 600px; max-height: 85vh; width: 90%; display: flex; flex-direction: column; gap: 20px; box-shadow: 0 40px 120px rgba(0,0,0,0.9); position: relative; opacity: 0; transform: translateY(30px); transition: opacity 0.5s ease, transform 0.5s ease; }
        .workout-modal-overlay.visible .workout-modal-content { opacity: 1; transform: translateY(0); }
        .muscle-toggle { transition: all 0.3s ease; cursor: pointer; }
        .muscle-toggle.active { background: rgba(154, 140, 122, 0.3) !important; border-color: #9a8c7a !important; }
        .muscle-toggle:hover { transform: translateY(-2px); }
        .subgroup-container { max-height: 0; overflow: hidden; transition: max-height 0.4s ease, opacity 0.3s ease, padding 0.3s ease; opacity: 0; padding: 0 12px; }
        .subgroup-container.expanded { max-height: 200px; opacity: 1; padding: 12px; }
        .strength-bar { height: 6px; background: #1a1a1a; border-radius: 3px; overflow: hidden; }
        .strength-bar-fill { height: 100%; border-radius: 3px; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
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
        mote.style.cssText = `position: absolute; bottom: 10%; left: ${10 + Math.random() * 80}%; width: ${1 + Math.random() * 2}px; height: ${1 + Math.random() * 2}px; background: ${color}; border-radius: 50%; opacity: 0; pointer-events: none; animation: float-up ${8 + Math.random() * 6}s ${Math.random() * 10}s ease-out infinite; z-index: 1;`;
        container.appendChild(mote);
    }
}

function calculateAge(birthdate) {
    if (!birthdate) return 20;
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
    return age;
}

function formatBirthdate(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().split('T')[0];
}

function calculate1RM(weight, reps) {
    if (reps === 0 || weight === 0) return 0;
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps / 30));
}

// ==========================================
// PERSONAL STATS
// ==========================================
async function getPersonalStats() {
    const statsFile = app.vault.getAbstractFileByPath(STATS_FILE);
    if (!statsFile) return { weight: 61, height: 175, birthdate: "2005-11-29" };
    const cache = app.metadataCache.getFileCache(statsFile);
    const fm = cache?.frontmatter || {};
    return { weight: fm.Weight || 61, height: fm.Height || 175, birthdate: fm.Birthdate || "2005-11-29" };
}

async function updatePersonalStats(weight, height, birthdate) {
    const content = `---\nWeight: ${weight}\nHeight: ${height}\nBirthdate: "${birthdate}"\n---\n\n# Personal Stats\n\nUpdated: ${moment().format("YYYY-MM-DD HH:mm")}\n`;
    const statsFile = app.vault.getAbstractFileByPath(STATS_FILE);
    if (statsFile) { await app.vault.modify(statsFile, content); }
    else {
        const folder = STATS_FILE.substring(0, STATS_FILE.lastIndexOf('/'));
        if (!app.vault.getAbstractFileByPath(folder)) await app.vault.createFolder(folder);
        await app.vault.create(STATS_FILE, content);
    }
}

// ==========================================
// STRENGTH STANDARDS - REFACTORED
// ==========================================
function parseStandardValue(val) {
    if (typeof val !== 'string') val = String(val);
    val = val.trim();
    if (val.includes('<')) {
        const num = parseFloat(val.replace(/[<\s]/g, ''));
        return (!isNaN(num) && num > 0) ? num * 0.5 : 0.1;
    }
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
}

async function getStrengthStandard(exerciseName) {
    const filePath = `${EXERCISE_DB_FOLDER}/${exerciseName}.md`;
    const file = app.vault.getAbstractFileByPath(filePath);
    if (!file) return null;
    
    const cache = app.metadataCache.getFileCache(file);
    const isBodyweight = cache?.frontmatter?.Type === "Bodyweight";
    const content = await app.vault.read(file);
    const lines = content.split('\n');
    const bwTable = [], ageTable = [];
    let currentTable = null;
    
    for (const line of lines) {
        if (line.match(/\|\s*BW\s*\|/i)) { currentTable = 'bw'; continue; }
        if (line.match(/\|\s*Age\s*\|/i)) { currentTable = 'age'; continue; }
        if (line.startsWith('|---') || line.startsWith('| ---')) continue;
        
        const match = line.match(/\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/);
        if (match) {
            const row = { key: parseStandardValue(match[1]), beginner: parseStandardValue(match[2]), novice: parseStandardValue(match[3]), intermediate: parseStandardValue(match[4]), advanced: parseStandardValue(match[5]), elite: parseStandardValue(match[6]) };
            if (row.key > 0 && (row.beginner > 0 || row.novice > 0 || row.intermediate > 0)) {
                if (currentTable === 'bw') bwTable.push(row);
                else if (currentTable === 'age') ageTable.push(row);
            }
        }
    }
    return { bwTable, ageTable, isBodyweight, hasValidData: bwTable.length > 0 || ageTable.length > 0 };
}

function interpolateStandard(table, value) {
    if (!table || table.length === 0) return null;
    const sorted = [...table].sort((a, b) => a.key - b.key);
    let lower = sorted[0], upper = sorted[sorted.length - 1];
    for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i].key <= value && sorted[i + 1].key >= value) { lower = sorted[i]; upper = sorted[i + 1]; break; }
    }
    if (value <= lower.key) return { ...lower };
    if (value >= upper.key) return { ...upper };
    const ratio = (value - lower.key) / (upper.key - lower.key);
    return { key: value, beginner: lower.beginner + ratio * (upper.beginner - lower.beginner), novice: lower.novice + ratio * (upper.novice - lower.novice), intermediate: lower.intermediate + ratio * (upper.intermediate - lower.intermediate), advanced: lower.advanced + ratio * (upper.advanced - lower.advanced), elite: lower.elite + ratio * (upper.elite - lower.elite) };
}

async function getAveragedStandards(standards) {
    const stats = await getPersonalStats();
    const bwStd = interpolateStandard(standards.bwTable, stats.weight);
    const ageStd = interpolateStandard(standards.ageTable, calculateAge(stats.birthdate));
    if (bwStd && ageStd) return { beginner: (bwStd.beginner + ageStd.beginner) / 2, novice: (bwStd.novice + ageStd.novice) / 2, intermediate: (bwStd.intermediate + ageStd.intermediate) / 2, advanced: (bwStd.advanced + ageStd.advanced) / 2, elite: (bwStd.elite + ageStd.elite) / 2 };
    return bwStd || ageStd || null;
}

function determineStrengthLevel(currentValue, standards) {
    if (!standards || currentValue < 0) return { level: "Untrained", color: "#6a6a6a", progress: 0, nextTarget: standards?.beginner || 1 };
    const { beginner, novice, intermediate, advanced, elite } = standards;
    if (currentValue >= elite) return { level: "Elite", color: "#9a6a7a", progress: 100, nextTarget: null };
    if (currentValue >= advanced) return { level: "Advanced", color: "#8a7a9a", progress: ((currentValue - advanced) / (elite - advanced)) * 100, nextTarget: elite };
    if (currentValue >= intermediate) return { level: "Intermediate", color: "#6a8a9a", progress: ((currentValue - intermediate) / (advanced - intermediate)) * 100, nextTarget: advanced };
    if (currentValue >= novice) return { level: "Novice", color: "#7a9a7d", progress: ((currentValue - novice) / (intermediate - novice)) * 100, nextTarget: intermediate };
    if (currentValue >= beginner) return { level: "Beginner", color: "#a89860", progress: ((currentValue - beginner) / (novice - beginner)) * 100, nextTarget: novice };
    return { level: "Untrained", color: "#6a6a6a", progress: beginner > 0 ? Math.max(0, (currentValue / beginner) * 100) : 0, nextTarget: beginner };
}

async function calculateStrengthLevel(exerciseName, weight, reps, maxReps = null) {
    const standards = await getStrengthStandard(exerciseName);
    if (!standards || !standards.hasValidData) return null;
    const avgStd = await getAveragedStandards(standards);
    if (!avgStd) return null;
    
    if (standards.isBodyweight) {
        const effectiveReps = maxReps !== null ? Math.max(reps, maxReps) : reps;
        const result = determineStrengthLevel(effectiveReps, avgStd);
        return { ...result, currentValue: effectiveReps, isBodyweight: true, unit: 'reps', displayLabel: 'Max Reps' };
    } else {
        if (weight <= 0) return null;
        const est1RM = calculate1RM(weight, reps);
        const result = determineStrengthLevel(est1RM, avgStd);
        return { ...result, currentValue: est1RM, isBodyweight: false, unit: 'kg', displayLabel: 'Est. 1RM' };
    }
}

async function hasStrengthStandard(exerciseName) {
    const standards = await getStrengthStandard(exerciseName);
    return standards !== null && standards.hasValidData;
}

// ==========================================
// WORKOUT DATA FUNCTIONS
// ==========================================
function getWorkoutsThisWeek() {
    const today = moment().startOf('day');
    const weekStart = today.clone().startOf('isoWeek');
    const weekEnd = today.clone().endOf('isoWeek');
    const workouts = [];
    app.vault.getMarkdownFiles().forEach(file => {
        if (!file.path.startsWith(WORKOUT_FOLDER)) return;
        const dateMatch = file.basename.match(/^(\d{4}-\d{2}-\d{2})/);
        if (!dateMatch) return;
        const fileDate = moment(dateMatch[1], "YYYY-MM-DD");
        if (fileDate.isValid() && fileDate.isBetween(weekStart, weekEnd, null, '[]')) {
            const fm = app.metadataCache.getFileCache(file)?.frontmatter;
            if (fm?.Workout === true) workouts.push({ date: fileDate, dayOfWeek: fileDate.isoWeekday(), file, type: fm["Workout-Type"] || "flow" });
        }
    });
    return workouts;
}

function getRecentWorkouts(limit = 5) {
    const files = app.vault.getMarkdownFiles().filter(f => f.path.startsWith(WORKOUT_FOLDER)).sort((a, b) => b.basename.localeCompare(a.basename));
    const workouts = [];
    for (const file of files) {
        if (workouts.length >= limit) break;
        const fm = app.metadataCache.getFileCache(file)?.frontmatter;
        if (fm?.Workout !== undefined) {
            const dateMatch = file.basename.match(/^(\d{4}-\d{2}-\d{2})/);
            workouts.push({ date: dateMatch ? dateMatch[1] : file.basename, completed: fm.Workout === true, type: fm["Workout-Type"] || "skipped", file, exercises: fm.exercises || [] });
        }
    }
    return workouts;
}

function getLastWorkoutForMuscleGroup(muscleGroup) {
    const files = app.vault.getMarkdownFiles().filter(f => f.path.startsWith(WORKOUT_FOLDER)).sort((a, b) => b.basename.localeCompare(a.basename));
    for (const file of files) {
        const fm = app.metadataCache.getFileCache(file)?.frontmatter;
        if (fm?.exercises && Array.isArray(fm.exercises)) {
            const relevant = fm.exercises.filter(ex => ex.muscle === muscleGroup || ex.muscleGroup === muscleGroup);
            if (relevant.length > 0) return { date: file.basename.match(/^(\d{4}-\d{2}-\d{2})/)?.[1], exercises: relevant, file };
        }
    }
    return null;
}

async function getExercisePR(exerciseName) {
    const standards = await getStrengthStandard(exerciseName);
    const isBodyweight = standards?.isBodyweight || false;
    const files = app.vault.getMarkdownFiles().filter(f => f.path.startsWith(WORKOUT_FOLDER));
    let bestSet = null, bestValue = 0;
    for (const file of files) {
        const fm = app.metadataCache.getFileCache(file)?.frontmatter;
        if (fm?.exercises && Array.isArray(fm.exercises) && fm.Workout === true) {
            const exercise = fm.exercises.find(ex => ex.name === exerciseName);
            if (exercise?.sets) {
                for (const set of exercise.sets) {
                    if (!set.isWarmup && set.completed) {
                        if (isBodyweight) {
                            if (set.reps > bestValue) { bestValue = set.reps; bestSet = { ...set, date: file.basename, prValue: bestValue, isBodyweight: true }; }
                        } else if (set.weight > 0) {
                            const est = calculate1RM(set.weight, set.reps);
                            if (est > bestValue) { bestValue = est; bestSet = { ...set, date: file.basename, estimated1RM: est, prValue: est, isBodyweight: false }; }
                        }
                    }
                }
            }
        }
    }
    return bestSet;
}

// ==========================================
// MODAL SYSTEM
// ==========================================
let activeModal = null;

function closeModal() {
    if (!activeModal) return;
    activeModal.classList.remove('visible');
    setTimeout(() => { if (activeModal?.parentNode) activeModal.parentNode.removeChild(activeModal); activeModal = null; }, 500);
}

function createModal(title, contentBuilder, options = {}) {
    if (activeModal) { activeModal.parentNode.removeChild(activeModal); activeModal = null; }
    const modal = document.createElement("div");
    modal.className = "workout-modal-overlay";
    activeModal = modal;
    const modalContent = document.createElement("div");
    modalContent.className = "workout-modal-content";
    modalContent.style.maxWidth = options.maxWidth || '600px';
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
// MODALS
// ==========================================
async function openPersonalStatsModal() {
    const stats = await getPersonalStats();
    createModal("Personal Stats", (content) => {
        const form = document.createElement('div');
        form.style.cssText = 'display: flex; flex-direction: column; gap: 16px;';
        content.appendChild(form);
        
        // Birthdate
        const birthRow = document.createElement('div');
        birthRow.style.cssText = `display: flex; flex-direction: column; gap: 8px; padding: 12px 16px; background: #0f0f0f; border: 1px solid ${THEME.colorBorder};`;
        birthRow.innerHTML = `<span style="color: ${THEME.colorMuted}; font-size: 12px;">Birthdate</span>`;
        const birthInputRow = document.createElement('div');
        birthInputRow.style.cssText = 'display: flex; align-items: center; gap: 12px;';
        const birthInput = document.createElement('input');
        birthInput.type = 'date';
        birthInput.value = formatBirthdate(stats.birthdate);
        birthInput.style.cssText = `flex: 1; padding: 8px; background: #0a0a0a; border: 1px solid ${THEME.colorBorder}; color: ${THEME.color}; font-size: 1em;`;
        const ageDisplay = document.createElement('span');
        ageDisplay.textContent = `Age: ${calculateAge(stats.birthdate)}`;
        ageDisplay.style.cssText = `color: ${THEME.color}; font-size: 1.1em; font-weight: 600; min-width: 80px;`;
        birthInput.onchange = () => { ageDisplay.textContent = `Age: ${calculateAge(birthInput.value)}`; };
        birthInputRow.appendChild(birthInput);
        birthInputRow.appendChild(ageDisplay);
        birthRow.appendChild(birthInputRow);
        form.appendChild(birthRow);
        
        // Weight
        const weightRow = document.createElement('div');
        weightRow.style.cssText = `display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #0f0f0f; border: 1px solid ${THEME.colorBorder};`;
        weightRow.innerHTML = `<span style="color: ${THEME.colorMuted};">Weight (kg)</span>`;
        const weightInput = document.createElement('input');
        weightInput.type = 'number';
        weightInput.value = stats.weight;
        weightInput.style.cssText = `width: 80px; padding: 8px; background: #0a0a0a; border: 1px solid ${THEME.colorBorder}; color: ${THEME.color}; font-size: 1.1em; text-align: center;`;
        weightRow.appendChild(weightInput);
        form.appendChild(weightRow);
        
        // Height
        const heightRow = document.createElement('div');
        heightRow.style.cssText = `display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #0f0f0f; border: 1px solid ${THEME.colorBorder};`;
        heightRow.innerHTML = `<span style="color: ${THEME.colorMuted};">Height (cm)</span>`;
        const heightInput = document.createElement('input');
        heightInput.type = 'number';
        heightInput.value = stats.height;
        heightInput.style.cssText = `width: 80px; padding: 8px; background: #0a0a0a; border: 1px solid ${THEME.colorBorder}; color: ${THEME.color}; font-size: 1.1em; text-align: center;`;
        heightRow.appendChild(heightInput);
        form.appendChild(heightRow);
        
        const saveBtn = document.createElement('button');
        saveBtn.textContent = "SAVE STATS";
        saveBtn.style.cssText = `padding: 14px 24px; background: ${THEME.color}; color: #0a0a0a; border: none; font-size: 14px; font-weight: 600; letter-spacing: 2px; cursor: pointer;`;
        saveBtn.onclick = async () => {
            await updatePersonalStats(parseFloat(weightInput.value) || 61, parseFloat(heightInput.value) || 175, birthInput.value || "2005-11-29");
            new Notice("Personal stats updated!");
            closeModal();
            setTimeout(() => location.reload(), 300);
        };
        form.appendChild(saveBtn);
    });
}

async function openAddStrengthStandardModal() {
    createModal("Add Strength Standard", (content) => {
        const form = document.createElement('div');
        form.style.cssText = 'display: flex; flex-direction: column; gap: 16px;';
        content.appendChild(form);
        
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = "Exercise name (e.g., Dumbbell Curl)";
        nameInput.style.cssText = `padding: 12px; background: #0f0f0f; border: 1px solid ${THEME.colorBorder}; color: ${THEME.color}; font-size: 1em;`;
        form.appendChild(nameInput);
        
        let exerciseType = "Weighted";
        const typeContainer = document.createElement('div');
        typeContainer.style.cssText = 'display: flex; gap: 12px;';
        const weightedBtn = document.createElement('button');
        weightedBtn.textContent = "🏋️ Weighted";
        weightedBtn.style.cssText = `flex: 1; padding: 14px; background: rgba(154,140,122,0.2); border: 1px solid ${THEME.color}; color: ${THEME.color}; cursor: pointer;`;
        const bodyweightBtn = document.createElement('button');
        bodyweightBtn.textContent = "🤸 Bodyweight";
        bodyweightBtn.style.cssText = `flex: 1; padding: 14px; background: #0f0f0f; border: 1px solid ${THEME.colorBorder}; color: ${THEME.colorMuted}; cursor: pointer;`;
        weightedBtn.onclick = () => { exerciseType = "Weighted"; weightedBtn.style.background = "rgba(154,140,122,0.2)"; weightedBtn.style.borderColor = THEME.color; weightedBtn.style.color = THEME.color; bodyweightBtn.style.background = "#0f0f0f"; bodyweightBtn.style.borderColor = THEME.colorBorder; bodyweightBtn.style.color = THEME.colorMuted; };
        bodyweightBtn.onclick = () => { exerciseType = "Bodyweight"; bodyweightBtn.style.background = "rgba(154,140,122,0.2)"; bodyweightBtn.style.borderColor = THEME.color; bodyweightBtn.style.color = THEME.color; weightedBtn.style.background = "#0f0f0f"; weightedBtn.style.borderColor = THEME.colorBorder; weightedBtn.style.color = THEME.colorMuted; };
        typeContainer.appendChild(weightedBtn);
        typeContainer.appendChild(bodyweightBtn);
        form.appendChild(typeContainer);
        
        const infoText = document.createElement('p');
        infoText.innerHTML = `<strong>Weighted:</strong> Standards in kg (1RM)<br><strong>Bodyweight:</strong> Standards in reps<br><span style="opacity:0.7;">Use "< 1" for sub-1 rep standards.</span>`;
        infoText.style.cssText = `color: ${THEME.colorMuted}; font-size: 12px; line-height: 1.6;`;
        form.appendChild(infoText);
        
        const createBtn = document.createElement('button');
        createBtn.textContent = "CREATE & OPEN";
        createBtn.style.cssText = `padding: 14px 24px; background: ${THEME.color}; color: #0a0a0a; border: none; font-size: 14px; font-weight: 600; letter-spacing: 2px; cursor: pointer;`;
        createBtn.onclick = async () => {
            const exerciseName = nameInput.value.trim();
            if (!exerciseName) { new Notice("Please enter an exercise name"); return; }
            const filePath = `${EXERCISE_DB_FOLDER}/${exerciseName}.md`;
            const unitLabel = exerciseType === "Bodyweight" ? "reps" : "kg (1RM)";
            const fileContent = `---\nData: Strength Standard\nExercise: "${exerciseName}"\nType: ${exerciseType}\ncssclasses:\n  - hide-properties\n---\n\n# ${exerciseName} Strength Standards\n\n> Standards are in **${unitLabel}**\n\n## Bodyweight Table\n| BW  | Beg. | Nov. | Int. | Adv. | Elite |\n| --- | ---- | ---- | ---- | ---- | ----- |\n| 50  | 0    | 0    | 0    | 0    | 0     |\n| 60  | 0    | 0    | 0    | 0    | 0     |\n| 70  | 0    | 0    | 0    | 0    | 0     |\n| 80  | 0    | 0    | 0    | 0    | 0     |\n| 90  | 0    | 0    | 0    | 0    | 0     |\n\n## Age Table\n| Age | Beg. | Nov. | Int. | Adv. | Elite |\n| --- | ---- | ---- | ---- | ---- | ----- |\n| 15  | 0    | 0    | 0    | 0    | 0     |\n| 20  | 0    | 0    | 0    | 0    | 0     |\n| 30  | 0    | 0    | 0    | 0    | 0     |\n| 40  | 0    | 0    | 0    | 0    | 0     |\n| 50  | 0    | 0    | 0    | 0    | 0     |\n\n---\n\n\`\`\`dataviewjs\n// TABLE FIXER v1.0\nconst THEME = { color: "#9a8c7a", colorBorder: "#3a342a", colorMuted: "#6a5a4a" };\n\nconst container = dv.el("div", "", { attr: { style: "text-align: center; margin: 20px 0;" } });\n\nconst fixBtn = document.createElement(\'button\');\nfixBtn.textContent = "🔧 FIX PASTED TABLE SPACING";\nfixBtn.style.cssText = \`padding: 12px 24px; background: \${THEME.color}; color: #0a0a0a; border: none; font-size: 13px; font-weight: 600; letter-spacing: 2px; cursor: pointer; transition: all 0.3s ease;\`;\n\nfixBtn.onmouseover = () => { fixBtn.style.transform = "translateY(-2px)"; fixBtn.style.boxShadow = "0 4px 12px rgba(154, 140, 122, 0.4)"; };\nfixBtn.onmouseout = () => { fixBtn.style.transform = "translateY(0)"; fixBtn.style.boxShadow = "none"; };\n\nfixBtn.onclick = async () => {\n    const currentFile = dv.current().file.path;\n    const file = app.vault.getAbstractFileByPath(currentFile);\n    if (!file) { new Notice("❌ File not found"); return; }\n    \n    let content = await app.vault.read(file);\n    \n    // Fix table spacing - skip code blocks, only fix actual table rows\n    let inCodeBlock = false;\n    const fixedContent = content.split(\'\\n\').map(line => {\n        if (line.trim().startsWith(\'\`\`\`\')) { inCodeBlock = !inCodeBlock; return line; }\n        if (!inCodeBlock && line.trim().startsWith(\'|\') && line.trim().endsWith(\'|\')) {\n            const cells = line.split(\'|\').map(cell => cell.trim());\n            return \'| \' + cells.filter(c => c !== \'\').join(\' | \') + \' |\';\n        }\n        return line;\n    }).join(\'\\n\');\n    \n    await app.vault.modify(file, fixedContent);\n    new Notice("✅ Table spacing fixed! Refresh the page to see changes.");\n    \n    // Visual feedback\n    fixBtn.textContent = "✓ FIXED!";\n    fixBtn.style.background = "#7a9a7d";\n    setTimeout(() => {\n        fixBtn.textContent = "🔧 FIX PASTED TABLE SPACING";\n        fixBtn.style.background = THEME.color;\n    }, 2000);\n};\n\ncontainer.appendChild(fixBtn);\n\nconst helpText = document.createElement(\'p\');\nhelpText.textContent = "Use this if you pasted a table without proper spacing";\nhelpText.style.cssText = \`color: \${THEME.colorMuted}; font-size: 11px; font-style: italic; margin-top: 8px;\`;\ncontainer.appendChild(helpText);\n\`\`\`\n`;
            try {
                if (!app.vault.getAbstractFileByPath(EXERCISE_DB_FOLDER)) await app.vault.createFolder(EXERCISE_DB_FOLDER);
                if (!app.vault.getAbstractFileByPath(filePath)) await app.vault.create(filePath, fileContent);
                closeModal();
                setTimeout(() => { window.location.href = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent(filePath)}`; }, 300);
            } catch (error) { new Notice(`Error: ${error.message}`); }
        };
        form.appendChild(createBtn);
    });
}

function openStartWorkoutModal() {
    const selectedMuscles = new Set();
    const selectedSubgroups = new Map();
    
    createModal("Start New Workout", (content) => {
        const muscleGrid = document.createElement('div');
        muscleGrid.style.cssText = 'display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-bottom: 8px;';
        content.appendChild(muscleGrid);
        
        const subgroupArea = document.createElement('div');
        subgroupArea.style.cssText = 'display: flex; flex-direction: column; gap: 8px; width: 100%;';
        content.appendChild(subgroupArea);
        
        Object.entries(MUSCLE_GROUPS).forEach(([name, config]) => {
            const btn = document.createElement('button');
            btn.className = 'muscle-toggle';
            btn.textContent = `${config.icon} ${name}`;
            btn.style.cssText = `padding: 12px 18px; background: #0f0f0f; border: 1px solid ${THEME.colorBorder}; color: ${THEME.color}; font-size: 13px; letter-spacing: 1px;`;
            muscleGrid.appendChild(btn);
            
            let subgroupContainer = null;
            if (config.subgroups) {
                subgroupContainer = document.createElement('div');
                subgroupContainer.className = 'subgroup-container';
                subgroupContainer.style.cssText = `display: flex; flex-wrap: wrap; gap: 8px; background: #0c0c0c; border: 1px solid ${THEME.colorBorder}; border-radius: 4px;`;
                subgroupContainer.innerHTML = `<div style="width: 100%; color: ${THEME.colorMuted}; font-size: 11px; margin-bottom: 4px;">${name} subgroups:</div>`;
                selectedSubgroups.set(name, new Set());
                config.subgroups.forEach(sub => {
                    const subBtn = document.createElement('button');
                    subBtn.className = 'muscle-toggle';
                    subBtn.textContent = sub;
                    subBtn.style.cssText = `padding: 8px 14px; background: #0f0f0f; border: 1px solid ${THEME.colorBorder}; color: ${THEME.colorMuted}; font-size: 12px; cursor: pointer;`;
                    subBtn.onclick = (e) => { e.stopPropagation(); const subs = selectedSubgroups.get(name); if (subs.has(sub)) { subs.delete(sub); subBtn.classList.remove('active'); subBtn.style.color = THEME.colorMuted; } else { subs.add(sub); subBtn.classList.add('active'); subBtn.style.color = THEME.color; } };
                    subgroupContainer.appendChild(subBtn);
                });
                subgroupArea.appendChild(subgroupContainer);
            }
            
            btn.onclick = () => {
                if (selectedMuscles.has(name)) { selectedMuscles.delete(name); btn.classList.remove('active'); if (subgroupContainer) subgroupContainer.classList.remove('expanded'); }
                else { selectedMuscles.add(name); btn.classList.add('active'); if (subgroupContainer) subgroupContainer.classList.add('expanded'); }
            };
        });
        
        const quote = document.createElement('div');
        quote.style.cssText = `padding: 16px; background: #0c0c0c; border-left: 2px solid ${THEME.color}; margin: 16px 0;`;
        quote.innerHTML = `<p style="color: ${THEME.colorMuted}; font-style: italic; font-size: 12px; margin: 0;">"There is a general principle here: <strong style="color: ${THEME.color};">perform any amount of warming-up that you believe to be minimally required.</strong>"</p><p style="color: ${THEME.colorMuted}; font-size: 11px; margin: 8px 0 0 0; text-align: right;">— Mike Mentzer</p>`;
        content.appendChild(quote);
        
        const startBtn = document.createElement('button');
        startBtn.textContent = "🏋️ START WORKOUT";
        startBtn.style.cssText = `width: 100%; padding: 16px 24px; background: ${THEME.color}; border: none; color: #0a0a0a; font-size: 15px; font-weight: 700; letter-spacing: 2px; cursor: pointer;`;
        startBtn.onclick = async () => {
            if (selectedMuscles.size === 0) { new Notice("Please select at least one muscle group"); return; }
            await createWorkoutNote(selectedMuscles, selectedSubgroups);
            closeModal();
        };
        content.appendChild(startBtn);
    });
}

// ==========================================
// CREATE WORKOUT NOTE
// ==========================================
async function createWorkoutNote(selectedMuscles, selectedSubgroups) {
    const today = moment().format("YYYY-MM-DD");
    const filePath = `${WORKOUT_FOLDER}/${today}.md`;
    
    const muscleGroupsArray = [];
    selectedMuscles.forEach(muscle => {
        const subs = selectedSubgroups.get(muscle);
        if (subs && subs.size > 0) subs.forEach(sub => muscleGroupsArray.push(sub));
        else muscleGroupsArray.push(muscle);
    });
    
    const previousExercisesData = {};
    muscleGroupsArray.forEach(muscle => {
        const lastWorkout = getLastWorkoutForMuscleGroup(muscle);
        if (lastWorkout) previousExercisesData[muscle] = lastWorkout.exercises;
    });
    
    const exercisesArray = [];
    Object.entries(previousExercisesData).forEach(([muscle, exercises]) => {
        exercises.forEach(ex => {
            exercisesArray.push({
                name: ex.name, muscle, muscleGroup: muscle,
                sets: ex.sets ? ex.sets.map(s => ({ weight: s.weight || 0, reps: s.reps || 10, completed: false, isWarmup: s.isWarmup || false })) : [{ weight: 0, reps: 10, completed: false, isWarmup: false }]
            });
        });
    });
    
    const inlineCode = generateWorkoutInlineCode(muscleGroupsArray, exercisesArray);
    const content = `---\nWorkout: false\nWorkout-Type: ""\nTimestamp: "${moment().format()}"\nmuscleGroups: ${JSON.stringify(muscleGroupsArray)}\nexercises: ${JSON.stringify(exercisesArray)}\ncurrentMuscleIndex: 0\ncssclasses:\n  - hide-properties\nbanner: "![[Workout session.jpg]]"\n---\n\n\`\`\`dataviewjs\n${inlineCode}\n\`\`\`\n`;
    
    try {
        if (!app.vault.getAbstractFileByPath(WORKOUT_FOLDER)) await app.vault.createFolder(WORKOUT_FOLDER);
        const existingFile = app.vault.getAbstractFileByPath(filePath);
        if (existingFile) await app.vault.modify(existingFile, content);
        else await app.vault.create(filePath, content);
        window.location.href = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent(filePath)}`;
    } catch (error) { new Notice(`Error: ${error.message}`); }
}

// ==========================================
// INLINE CODE GENERATOR
// ==========================================
function generateWorkoutInlineCode(muscleGroups, exercisesArray) {
    return `// IN-WORKOUT TRACKER v3.7
const VAULT_NAME="${VAULT_NAME}",WORKOUT_FOLDER="${WORKOUT_FOLDER}",STATS_FILE="${STATS_FILE}",EXERCISE_DB_FOLDER="${EXERCISE_DB_FOLDER}";
const THEME={color:"#9a8c7a",colorHover:"#aa9c8a",colorBorder:"#3a342a",colorMuted:"#6a5a4a",colorDiscipline:"#a89860",colorFlow:"#6a8a9a"};
const STRENGTH_LEVELS={"Untrained":{color:"#6a6a6a",icon:"○"},"Beginner":{color:"#a89860",icon:"◐"},"Novice":{color:"#7a9a7d",icon:"◑"},"Intermediate":{color:"#6a8a9a",icon:"◕"},"Advanced":{color:"#8a7a9a",icon:"●"},"Elite":{color:"#9a6a7a",icon:"★"}};
const currentFile=dv.current().file,fm=dv.current();
const MUSCLE_GROUPS=fm.muscleGroups||${JSON.stringify(muscleGroups)};
let exercises=fm.exercises||${JSON.stringify(exercisesArray)};
let currentMuscleIndex=fm.currentMuscleIndex||0;

if(!document.getElementById('w-inline-v37')){const s=document.createElement('style');s.id='w-inline-v37';s.textContent='.set-row{transition:all .3s ease}.set-row:hover{background:#1a1814!important}.set-row.completed{opacity:.6}.ctrl-btn{width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:#0f0f0f;border:1px solid #3a342a;color:#9a8c7a;cursor:pointer;font-size:16px;flex-shrink:0}.ctrl-btn:hover{background:#9a8c7a;color:#0a0a0a}@keyframes breathe{0%,100%{box-shadow:inset 0 0 20px rgba(154,140,122,.03)}50%{box-shadow:inset 0 0 40px rgba(154,140,122,.08)}}.strength-bar{height:6px;background:#1a1a1a;border-radius:3px;overflow:hidden}.strength-bar-fill{height:100%;border-radius:3px;transition:width .6s cubic-bezier(.4,0,.2,1)}.strength-title-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:4px;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase}.pr-info-box{display:flex;flex-direction:column;gap:4px;padding:10px 12px;background:rgba(168,152,96,.1);border:1px solid rgba(168,152,96,.3);border-radius:4px;margin-top:8px}.missing-standard-warning{display:flex;align-items:center;gap:8px;padding:8px 12px;background:rgba(154,106,106,.1);border:1px dashed rgba(154,106,106,.4);border-radius:4px;color:#9a6a6a;font-size:11px;font-style:italic;margin-top:8px}.warmup-indicator{font-size:9px;color:#6a8a9a;padding:2px 6px;background:rgba(106,138,154,.15);border-radius:3px}';document.head.appendChild(s);}

function addCorners(el,color,size=14){['TL','TR','BL','BR'].forEach(pos=>{const c=document.createElement('div');const isTop=pos.includes('T'),isLeft=pos.includes('L');c.style.cssText='position:absolute;'+(isTop?'top:0':'bottom:0')+';'+(isLeft?'left:0':'right:0')+';width:'+size+'px;height:'+size+'px;border-'+(isTop?'top':'bottom')+':1px solid '+color+';border-'+(isLeft?'left':'right')+':1px solid '+color+';z-index:10;pointer-events:none;';el.appendChild(c);});}
function calculate1RM(w,r){if(r===0||w===0)return 0;if(r===1)return w;return Math.round(w*(1+r/30));}
function updateWarmupWeights(ex,newW){const warmups=ex.sets.filter(s=>s.isWarmup);[0.5,0.7,0.85].forEach((p,i)=>{if(warmups[i])warmups[i].weight=Math.round(newW*p);});}
function getFirstWorkingSetIndex(sets){return sets.findIndex(s=>!s.isWarmup);}

async function getPersonalStats(){const f=app.vault.getAbstractFileByPath(STATS_FILE);if(!f)return{weight:61,height:175,birthdate:"2005-11-29"};const c=app.metadataCache.getFileCache(f);const fm=c?.frontmatter||{};return{weight:fm.Weight||61,height:fm.Height||175,birthdate:fm.Birthdate||"2005-11-29"};}
function calculateAge(bd){if(!bd)return 20;const b=new Date(bd),t=new Date();let a=t.getFullYear()-b.getFullYear();if(t.getMonth()<b.getMonth()||(t.getMonth()===b.getMonth()&&t.getDate()<b.getDate()))a--;return a;}
function parseStandardValue(v){if(typeof v!=='string')v=String(v);v=v.trim();if(v.includes('<')){const n=parseFloat(v.replace(/[<\\s]/g,''));return(!isNaN(n)&&n>0)?n*0.5:0.1;}const n=parseFloat(v);return isNaN(n)?0:n;}

async function getStrengthStandard(name){const fp=EXERCISE_DB_FOLDER+"/"+name+".md";const f=app.vault.getAbstractFileByPath(fp);if(!f)return null;const c=app.metadataCache.getFileCache(f);const isBW=c?.frontmatter?.Type==="Bodyweight";const content=await app.vault.read(f);const lines=content.split('\\n');const bwT=[],ageT=[];let ct=null;for(const line of lines){if(line.match(/\|\s*BW\s*\|/i)){ct='bw';continue;}if(line.match(/\|\s*Age\s*\|/i)){ct='age';continue;}if(line.startsWith('|---')||line.startsWith('| ---'))continue;
const m=line.match(/\\|\\s*([^|]+)\\s*\\|\\s*([^|]+)\\s*\\|\\s*([^|]+)\\s*\\|\\s*([^|]+)\\s*\\|\\s*([^|]+)\\s*\\|\\s*([^|]+)\\s*\\|/);if(m){const row={key:parseStandardValue(m[1]),beginner:parseStandardValue(m[2]),novice:parseStandardValue(m[3]),intermediate:parseStandardValue(m[4]),advanced:parseStandardValue(m[5]),elite:parseStandardValue(m[6])};if(row.key>0&&(row.beginner>0||row.novice>0||row.intermediate>0)){if(ct==='bw')bwT.push(row);else if(ct==='age')ageT.push(row);}}}return{bwTable:bwT,ageTable:ageT,isBodyweight:isBW,hasValidData:bwT.length>0||ageT.length>0};}

function interpolateStandard(t,v){if(!t||t.length===0)return null;const s=[...t].sort((a,b)=>a.key-b.key);let lo=s[0],hi=s[s.length-1];for(let i=0;i<s.length-1;i++){if(s[i].key<=v&&s[i+1].key>=v){lo=s[i];hi=s[i+1];break;}}if(v<=lo.key)return{...lo};if(v>=hi.key)return{...hi};const r=(v-lo.key)/(hi.key-lo.key);return{key:v,beginner:lo.beginner+r*(hi.beginner-lo.beginner),novice:lo.novice+r*(hi.novice-lo.novice),intermediate:lo.intermediate+r*(hi.intermediate-lo.intermediate),advanced:lo.advanced+r*(hi.advanced-lo.advanced),elite:lo.elite+r*(hi.elite-lo.elite)};}

async function getAveragedStandards(std){const st=await getPersonalStats();const bw=interpolateStandard(std.bwTable,st.weight);const ag=interpolateStandard(std.ageTable,calculateAge(st.birthdate));if(bw&&ag)return{beginner:(bw.beginner+ag.beginner)/2,novice:(bw.novice+ag.novice)/2,intermediate:(bw.intermediate+ag.intermediate)/2,advanced:(bw.advanced+ag.advanced)/2,elite:(bw.elite+ag.elite)/2};return bw||ag||null;}

function determineStrengthLevel(cv,std){if(!std||cv<0)return{level:"Untrained",color:"#6a6a6a",progress:0,nextTarget:std?.beginner||1};const{beginner:b,novice:n,intermediate:i,advanced:a,elite:e}=std;if(cv>=e)return{level:"Elite",color:"#9a6a7a",progress:100,nextTarget:null};if(cv>=a)return{level:"Advanced",color:"#8a7a9a",progress:((cv-a)/(e-a))*100,nextTarget:e};if(cv>=i)return{level:"Intermediate",color:"#6a8a9a",progress:((cv-i)/(a-i))*100,nextTarget:a};if(cv>=n)return{level:"Novice",color:"#7a9a7d",progress:((cv-n)/(i-n))*100,nextTarget:i};if(cv>=b)return{level:"Beginner",color:"#a89860",progress:((cv-b)/(n-b))*100,nextTarget:n};return{level:"Untrained",color:"#6a6a6a",progress:b>0?Math.max(0,(cv/b)*100):0,nextTarget:b};}

async function calculateStrengthLevel(name,w,r,maxR=null){const std=await getStrengthStandard(name);if(!std||!std.hasValidData)return null;const avg=await getAveragedStandards(std);if(!avg)return null;if(std.isBodyweight){const eff=maxR!==null?Math.max(r,maxR):r;const res=determineStrengthLevel(eff,avg);return{...res,currentValue:eff,isBodyweight:true,unit:'reps',displayLabel:'Max Reps'};}else{if(w<=0)return null;const est=calculate1RM(w,r);const res=determineStrengthLevel(est,avg);return{...res,currentValue:est,isBodyweight:false,unit:'kg',displayLabel:'Est. 1RM'};}}

async function hasStrengthStandard(name){const std=await getStrengthStandard(name);return std!==null&&std.hasValidData;}

async function getExercisePR(name){const std=await getStrengthStandard(name);const isBW=std?.isBodyweight||false;const files=app.vault.getMarkdownFiles().filter(f=>f.path.startsWith(WORKOUT_FOLDER));let best=null,bestV=0;for(const file of files){const fm=app.metadataCache.getFileCache(file)?.frontmatter;if(fm?.exercises&&Array.isArray(fm.exercises)&&fm.Workout===true){const ex=fm.exercises.find(e=>e.name===name);if(ex?.sets){for(const set of ex.sets){if(!set.isWarmup&&set.completed){if(isBW){if(set.reps>bestV){bestV=set.reps;best={...set,date:file.basename,prValue:bestV,isBodyweight:true};}}else if(set.weight>0){const est=calculate1RM(set.weight,set.reps);if(est>bestV){bestV=est;best={...set,date:file.basename,estimated1RM:est,prValue:est,isBodyweight:false};}}}}}}}return best;}

async function saveToFile(){const f=app.vault.getAbstractFileByPath(currentFile.path);if(!f)return;let c=await app.vault.read(f);c=c.replace(/exercises: \\[.*?\\](?=\\n)/s,'exercises: '+JSON.stringify(exercises));c=c.replace(/currentMuscleIndex: \\d+/,'currentMuscleIndex: '+currentMuscleIndex);await app.vault.modify(f,c);}

const container=dv.el("div","",{attr:{style:"max-width:500px;margin:0 auto;padding:20px 0;"}});

async function render(){container.innerHTML='';const currentMuscle=MUSCLE_GROUPS[currentMuscleIndex]||"No Muscle";const muscleExercises=exercises.filter(e=>e.muscle===currentMuscle||e.muscleGroup===currentMuscle);
const header=document.createElement('div');header.style.cssText='text-align:center;margin-bottom:24px;padding:20px;background:#0a0a0a;border:1px solid '+THEME.colorBorder+';position:relative;animation:breathe 6s ease-in-out infinite;';container.appendChild(header);addCorners(header,THEME.color);
const title=document.createElement('h2');title.textContent=currentMuscle.toUpperCase();title.style.cssText='margin:0;color:'+THEME.color+';font-size:24px;font-weight:600;letter-spacing:4px;';header.appendChild(title);
const progress=document.createElement('div');progress.textContent=(currentMuscleIndex+1)+' / '+MUSCLE_GROUPS.length;progress.style.cssText='color:'+THEME.colorMuted+';font-size:12px;margin-top:8px;';header.appendChild(progress);
const exContainer=document.createElement('div');exContainer.style.cssText='display:flex;flex-direction:column;gap:16px;';container.appendChild(exContainer);
if(muscleExercises.length===0){const empty=document.createElement('div');empty.style.cssText='text-align:center;padding:40px 20px;background:#0f0f0f;border:1px dashed '+THEME.colorBorder+';';empty.innerHTML='<p style="color:'+THEME.colorMuted+';margin:0;">No exercises for '+currentMuscle+' yet.</p>';exContainer.appendChild(empty);}else{for(const ex of muscleExercises){await renderExercise(exContainer,ex);}}
const addExBtn=document.createElement('button');addExBtn.textContent="+ ADD EXERCISE";addExBtn.style.cssText='width:100%;padding:14px;background:transparent;border:1px dashed '+THEME.colorBorder+';color:'+THEME.colorMuted+';font-size:13px;letter-spacing:2px;cursor:pointer;margin-top:16px;';addExBtn.onmouseover=()=>{addExBtn.style.borderColor=THEME.color;addExBtn.style.color=THEME.color;};addExBtn.onmouseout=()=>{addExBtn.style.borderColor=THEME.colorBorder;addExBtn.style.color=THEME.colorMuted;};addExBtn.onclick=()=>openAddExerciseModal(currentMuscle);container.appendChild(addExBtn);
const nav=document.createElement('div');nav.style.cssText='display:flex;gap:12px;margin-top:24px;';container.appendChild(nav);
if(currentMuscleIndex>0){const prevBtn=document.createElement('button');prevBtn.textContent="← PREVIOUS";prevBtn.style.cssText='flex:1;padding:14px;background:#0f0f0f;border:1px solid '+THEME.colorBorder+';color:'+THEME.colorMuted+';cursor:pointer;';prevBtn.onclick=async()=>{currentMuscleIndex--;await saveToFile();};nav.appendChild(prevBtn);}
if(currentMuscleIndex<MUSCLE_GROUPS.length-1){const nextBtn=document.createElement('button');nextBtn.textContent="NEXT MUSCLE →";nextBtn.style.cssText='flex:1;padding:14px;background:'+THEME.color+';border:none;color:#0a0a0a;font-weight:600;letter-spacing:1px;cursor:pointer;';nextBtn.onclick=async()=>{currentMuscleIndex++;await saveToFile();};nav.appendChild(nextBtn);}else{const finishBtn=document.createElement('button');finishBtn.textContent="✓ FINISH WORKOUT";finishBtn.style.cssText='flex:1;padding:14px;background:#7a9a7d;border:none;color:#0a0a0a;font-weight:600;letter-spacing:1px;cursor:pointer;';finishBtn.onclick=()=>openFinishModal();nav.appendChild(finishBtn);}}

async function renderExercise(container,ex){const card=document.createElement('div');card.style.cssText='background:#0a0a0a;border:1px solid '+THEME.colorBorder+';padding:16px;position:relative;';container.appendChild(card);addCorners(card,THEME.color,12);
const exHeader=document.createElement('div');exHeader.style.cssText='display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid '+THEME.colorBorder+';';card.appendChild(exHeader);
const leftCol=document.createElement('div');leftCol.style.cssText='flex:1;';exHeader.appendChild(leftCol);
const exTitle=document.createElement('h3');exTitle.textContent=ex.name;exTitle.style.cssText='margin:0 0 8px 0;color:'+THEME.color+';font-size:16px;letter-spacing:1px;';leftCol.appendChild(exTitle);
const hasStd=await hasStrengthStandard(ex.name);const pr=await getExercisePR(ex.name);
const workingSets=ex.sets.filter(s=>!s.isWarmup);let bestW=0,bestR=0,maxR=0;workingSets.forEach(s=>{if(s.reps>maxR)maxR=s.reps;if(s.weight>bestW||(s.weight===bestW&&s.reps>bestR)){bestW=s.weight;bestR=s.reps;}});
if(hasStd){let sl;if(pr){sl=pr.isBodyweight?await calculateStrengthLevel(ex.name,0,pr.prValue,pr.prValue):await calculateStrengthLevel(ex.name,pr.weight,pr.reps);}else if(bestW>0||maxR>0){sl=await calculateStrengthLevel(ex.name,bestW,bestR,maxR);}
if(sl){const li=STRENGTH_LEVELS[sl.level];const badge=document.createElement('div');badge.className='strength-title-badge';badge.style.cssText+='background:'+sl.color+'25;border:1px solid '+sl.color+'60;color:'+sl.color+';';badge.innerHTML=(li?.icon||'○')+' '+sl.level.toUpperCase();leftCol.appendChild(badge);
const rmD=document.createElement('div');rmD.style.cssText='font-size:11px;color:'+THEME.colorMuted+';margin-top:6px;';rmD.innerHTML='<strong style="color:'+THEME.color+'">'+sl.displayLabel+': '+sl.currentValue+sl.unit+'</strong>';if(sl.nextTarget)rmD.innerHTML+=' → Next: '+Math.round(sl.nextTarget)+sl.unit;leftCol.appendChild(rmD);
const pb=document.createElement('div');pb.className='strength-bar';pb.style.marginTop='6px';leftCol.appendChild(pb);const fill=document.createElement('div');fill.className='strength-bar-fill';fill.style.cssText='width:'+Math.min(100,sl.progress)+'%;background:'+sl.color+';';pb.appendChild(fill);}}else{const warn=document.createElement('div');warn.className='missing-standard-warning';warn.innerHTML='⚠️ Missing standards for "<strong>'+ex.name+'</strong>"';leftCol.appendChild(warn);}
if(pr){const prBox=document.createElement('div');prBox.className='pr-info-box';const prT=document.createElement('div');prT.style.cssText='font-size:11px;color:#a89860;font-weight:700;letter-spacing:1px;';prT.textContent=pr.isBodyweight?'🏆 ALL-TIME PR: '+pr.prValue+' reps':'🏆 ALL-TIME PR: '+pr.estimated1RM+'kg (1RM)';prBox.appendChild(prT);const prD=document.createElement('div');prD.style.cssText='font-size:10px;color:'+THEME.colorMuted+';';prD.textContent=pr.isBodyweight?'Best set: '+pr.reps+' reps':'Set: '+pr.weight+'kg × '+pr.reps+' reps';prBox.appendChild(prD);const beat=document.createElement('div');beat.style.cssText='font-size:11px;color:#7a9a7d;margin-top:4px;font-weight:600;';beat.textContent=pr.isBodyweight?'🎯 Beat it: '+(pr.reps+1)+'+ reps':'🎯 Beat it: '+pr.weight+'kg × '+(pr.reps+1)+' or '+Math.round(pr.weight*1.025)+'kg × '+pr.reps;prBox.appendChild(beat);leftCol.appendChild(prBox);}
const delExBtn=document.createElement('button');delExBtn.textContent='🗑️';delExBtn.style.cssText='background:transparent;border:none;cursor:pointer;font-size:14px;opacity:0.5;';delExBtn.onclick=()=>{const idx=exercises.findIndex(e=>e===ex);if(idx>-1){exercises.splice(idx,1);render();}};exHeader.appendChild(delExBtn);
const setsContainer=document.createElement('div');setsContainer.style.cssText='display:flex;flex-direction:column;gap:8px;';card.appendChild(setsContainer);const warmupRefs=[];ex.sets.forEach((set,setIdx)=>{const refs=renderSet(setsContainer,set,setIdx,ex,warmupRefs);if(set.isWarmup&&refs.weightInput)warmupRefs.push(refs.weightInput);});
const addSetBtn=document.createElement('button');addSetBtn.textContent="+ Add Set";addSetBtn.style.cssText='margin-top:8px;padding:8px 12px;background:transparent;border:1px dashed '+THEME.colorBorder+';color:'+THEME.colorMuted+';font-size:12px;cursor:pointer;';addSetBtn.onclick=()=>{const last=ex.sets[ex.sets.length-1]||{weight:0,reps:10};ex.sets.push({weight:last.weight,reps:last.reps,completed:false,isWarmup:false});render();};card.appendChild(addSetBtn);}

function renderSet(container,set,setIdx,ex,warmupRefs){const row=document.createElement('div');row.className='set-row'+(set.completed?' completed':'');row.style.cssText='display:grid;grid-template-columns:auto 1fr auto auto;align-items:center;gap:12px;padding:12px;background:#0f0f0f;border:1px solid '+THEME.colorBorder+';';container.appendChild(row);const refs={weightInput:null};
const cb=document.createElement('div');cb.style.cssText='width:24px;height:24px;border:2px solid '+(set.completed?'#7a9a7d':THEME.colorBorder)+';background:'+(set.completed?'#7a9a7d':'transparent')+';display:flex;align-items:center;justify-content:center;cursor:pointer;color:#0a0a0a;font-weight:bold;';cb.textContent=set.completed?'✓':'';cb.onclick=()=>{set.completed=!set.completed;cb.style.borderColor=set.completed?'#7a9a7d':THEME.colorBorder;cb.style.background=set.completed?'#7a9a7d':'transparent';cb.textContent=set.completed?'✓':'';row.className='set-row'+(set.completed?' completed':'');};row.appendChild(cb);
const mid=document.createElement('div');mid.style.cssText='display:flex;align-items:center;gap:12px;flex-wrap:wrap;';row.appendChild(mid);
const wWrap=document.createElement('div');wWrap.style.cssText='display:flex;align-items:center;gap:4px;';mid.appendChild(wWrap);const wInput=document.createElement('input');wInput.type='number';wInput.value=set.weight;wInput.style.cssText='width:50px;padding:6px;background:#0a0a0a;border:1px solid '+THEME.colorBorder+';color:'+THEME.color+';text-align:center;font-size:14px;font-weight:600;';const firstW=getFirstWorkingSetIndex(ex.sets);const isFirst=!set.isWarmup&&setIdx===firstW;wInput.onchange=(e)=>{const nw=parseFloat(e.target.value)||0;set.weight=nw;if(isFirst){updateWarmupWeights(ex,nw);const ws=ex.sets.filter(s=>s.isWarmup);warmupRefs.forEach((inp,i)=>{if(ws[i])inp.value=ws[i].weight;});}};wWrap.appendChild(wInput);refs.weightInput=wInput;const kgL=document.createElement('span');kgL.textContent='kg';kgL.style.cssText='color:'+THEME.colorMuted+';font-size:12px;';wWrap.appendChild(kgL);
const rWrap=document.createElement('div');rWrap.style.cssText='display:flex;align-items:center;gap:4px;';mid.appendChild(rWrap);const minusBtn=document.createElement('button');minusBtn.className='ctrl-btn';minusBtn.textContent='−';minusBtn.onclick=()=>{if(set.reps>1){set.reps--;rDisp.textContent=set.reps+'×';}};rWrap.appendChild(minusBtn);const rDisp=document.createElement('span');rDisp.textContent=set.reps+'×';rDisp.style.cssText='color:'+THEME.color+';font-size:14px;font-weight:600;min-width:30px;text-align:center;';rWrap.appendChild(rDisp);const plusBtn=document.createElement('button');plusBtn.className='ctrl-btn';plusBtn.textContent='+';plusBtn.onclick=()=>{set.reps++;rDisp.textContent=set.reps+'×';};rWrap.appendChild(plusBtn);
if(set.isWarmup){const badge=document.createElement('span');badge.className='warmup-indicator';badge.textContent='⚡ Warmup';mid.appendChild(badge);}
if(ex.sets.length>1){const delBtn=document.createElement('button');delBtn.textContent='×';delBtn.style.cssText='width:28px;height:28px;background:transparent;border:1px solid #3a2828;color:#6a4a4a;cursor:pointer;font-size:16px;';delBtn.onclick=()=>{ex.sets.splice(setIdx,1);render();};row.appendChild(delBtn);}else{const ph=document.createElement('div');ph.style.width='28px';row.appendChild(ph);}return refs;}

function openAddExerciseModal(muscle){const modal=document.createElement('div');modal.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);display:flex;align-items:center;justify-content:center;z-index:9999;backdrop-filter:blur(4px);';
const content=document.createElement('div');content.style.cssText='background:#0a0a0a;padding:28px 20px;max-width:550px;width:90%;max-height:85vh;overflow-y:auto;display:flex;flex-direction:column;gap:16px;position:relative;';modal.appendChild(content);addCorners(content,THEME.color);
const title=document.createElement('h3');title.textContent='Add Exercise - '+muscle;title.style.cssText='color:'+THEME.color+';margin:0 0 16px 0;letter-spacing:2px;';content.appendChild(title);
const nameInput=document.createElement('input');nameInput.type='text';nameInput.placeholder='Exercise name...';nameInput.style.cssText='width:100%;padding:12px;background:#0f0f0f;border:1px solid '+THEME.colorBorder+';color:'+THEME.color+';font-size:14px;box-sizing:border-box;';content.appendChild(nameInput);
const warmupL=document.createElement('div');warmupL.textContent='Include warmup sets?';warmupL.style.cssText='color:'+THEME.colorMuted+';font-size:12px;';content.appendChild(warmupL);
const warmupC=document.createElement('div');warmupC.style.cssText='display:flex;gap:8px;';content.appendChild(warmupC);let incWarmup=true;
const wYes=document.createElement('button');wYes.textContent='Yes (suggested)';wYes.style.cssText='flex:1;padding:10px;background:rgba(154,140,122,0.2);border:1px solid '+THEME.color+';color:'+THEME.color+';cursor:pointer;';wYes.onclick=()=>{incWarmup=true;wYes.style.background='rgba(154,140,122,0.2)';wYes.style.borderColor=THEME.color;wNo.style.background='#0f0f0f';wNo.style.borderColor=THEME.colorBorder;};warmupC.appendChild(wYes);
const wNo=document.createElement('button');wNo.textContent='No';wNo.style.cssText='flex:1;padding:10px;background:#0f0f0f;border:1px solid '+THEME.colorBorder+';color:'+THEME.colorMuted+';cursor:pointer;';wNo.onclick=()=>{incWarmup=false;wNo.style.background='rgba(154,140,122,0.2)';wNo.style.borderColor=THEME.color;wYes.style.background='#0f0f0f';wYes.style.borderColor=THEME.colorBorder;};warmupC.appendChild(wNo);
const weightL=document.createElement('div');weightL.textContent='Working weight (kg) - 0 for bodyweight';weightL.style.cssText='color:'+THEME.colorMuted+';font-size:12px;';content.appendChild(weightL);
const weightInput=document.createElement('input');weightInput.type='number';weightInput.placeholder='0';weightInput.style.cssText='width:100%;padding:12px;background:#0f0f0f;border:1px solid '+THEME.colorBorder+';color:'+THEME.color+';font-size:14px;box-sizing:border-box;';content.appendChild(weightInput);
const btnC=document.createElement('div');btnC.style.cssText='display:flex;gap:12px;';content.appendChild(btnC);
const cancelBtn=document.createElement('button');cancelBtn.textContent='Cancel';cancelBtn.style.cssText='flex:1;padding:12px;background:#0f0f0f;border:1px solid '+THEME.colorBorder+';color:'+THEME.colorMuted+';cursor:pointer;';cancelBtn.onclick=()=>document.body.removeChild(modal);btnC.appendChild(cancelBtn);
const addBtn=document.createElement('button');addBtn.textContent='Add Exercise';addBtn.style.cssText='flex:1;padding:12px;background:'+THEME.color+';border:none;color:#0a0a0a;font-weight:600;cursor:pointer;';addBtn.onclick=()=>{const name=nameInput.value.trim();if(!name){new Notice('Please enter an exercise name');return;}const ww=parseFloat(weightInput.value)||0;const sets=[];if(incWarmup&&ww>0){sets.push({weight:Math.round(ww*0.5),reps:10,completed:false,isWarmup:true});sets.push({weight:Math.round(ww*0.7),reps:6,completed:false,isWarmup:true});sets.push({weight:Math.round(ww*0.85),reps:3,completed:false,isWarmup:true});}sets.push({weight:ww,reps:10,completed:false,isWarmup:false});sets.push({weight:ww,reps:10,completed:false,isWarmup:false});sets.push({weight:ww,reps:10,completed:false,isWarmup:false});exercises.push({name,muscle,muscleGroup:muscle,sets});document.body.removeChild(modal);render();};btnC.appendChild(addBtn);
modal.onclick=(e)=>{if(e.target===modal)document.body.removeChild(modal);};document.body.appendChild(modal);nameInput.focus();}

async function openFinishModal(){await saveToFile();const summaryData=[];for(const ex of exercises){const completed=ex.sets.filter(s=>!s.isWarmup&&s.completed);if(completed.length>0){const hasStd=await hasStrengthStandard(ex.name);const pr=await getExercisePR(ex.name);let bestW=0,bestR=0,maxR=0,sessionBest=0;for(const s of completed){if(s.reps>maxR)maxR=s.reps;if(s.weight>0){const est=calculate1RM(s.weight,s.reps);if(est>sessionBest){sessionBest=est;bestW=s.weight;bestR=s.reps;}}else if(s.reps>sessionBest){sessionBest=s.reps;bestR=s.reps;}}const sl=await calculateStrengthLevel(ex.name,bestW,bestR,maxR);summaryData.push({name:ex.name,muscle:ex.muscle,bestW,bestR,maxR,sessionBest,sl,hasStd,pr});}}
const modal=document.createElement('div');modal.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);display:flex;align-items:center;justify-content:center;z-index:9999;backdrop-filter:blur(4px);';
const content=document.createElement('div');content.style.cssText='background:#0a0a0a;padding:28px 20px;border:1px solid '+THEME.colorBorder+';max-width:550px;width:90%;max-height:85vh;display:flex;flex-direction:column;position:relative;';modal.appendChild(content);addCorners(content,THEME.color);
const scroll=document.createElement('div');scroll.style.cssText='overflow-y:auto;display:flex;flex-direction:column;gap:16px;flex:1;';content.appendChild(scroll);
const title=document.createElement('h2');title.textContent="WORKOUT COMPLETE";title.style.cssText='margin:0;color:#7a9a7d;font-size:16px;font-weight:700;letter-spacing:3px;text-align:center;';scroll.appendChild(title);
if(summaryData.length>0){const sec=document.createElement('div');sec.style.cssText='display:flex;flex-direction:column;gap:12px;';scroll.appendChild(sec);const secT=document.createElement('div');secT.textContent='SESSION SUMMARY';secT.style.cssText='color:'+THEME.colorMuted+';font-size:11px;letter-spacing:2px;text-align:center;';sec.appendChild(secT);
for(const ex of summaryData){const card=document.createElement('div');card.style.cssText='padding:14px;background:#0c0c0c;border:1px solid '+THEME.colorBorder+';border-radius:6px;';sec.appendChild(card);
const hdr=document.createElement('div');hdr.style.cssText='display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;';card.appendChild(hdr);const nm=document.createElement('span');nm.textContent=ex.name;nm.style.cssText='color:'+THEME.color+';font-weight:600;font-size:14px;';hdr.appendChild(nm);
if(ex.sl){const li=STRENGTH_LEVELS[ex.sl.level];const badge=document.createElement('span');badge.style.cssText='display:inline-flex;align-items:center;gap:4px;padding:4px 10px;background:'+ex.sl.color+'20;border:1px solid '+ex.sl.color+'50;border-radius:4px;color:'+ex.sl.color+';font-size:11px;font-weight:700;letter-spacing:1px;';badge.textContent=(li?.icon||'○')+' '+ex.sl.level.toUpperCase();hdr.appendChild(badge);}
const stats=document.createElement('div');stats.style.cssText='display:flex;justify-content:space-between;margin-bottom:8px;font-size:12px;';card.appendChild(stats);const setI=document.createElement('span');setI.textContent=ex.sl?.isBodyweight?'Best: '+ex.maxR+' reps':'Best: '+ex.bestW+'kg × '+ex.bestR;setI.style.cssText='color:'+THEME.colorMuted+';';stats.appendChild(setI);if(ex.sl){const rmI=document.createElement('span');rmI.textContent=ex.sl.displayLabel+': '+ex.sl.currentValue+ex.sl.unit;rmI.style.cssText='color:'+THEME.color+';font-weight:600;';stats.appendChild(rmI);}
if(ex.pr){const prC=document.createElement('div');prC.style.cssText='font-size:11px;margin-bottom:8px;padding:6px 8px;background:rgba(168,152,96,0.1);border-radius:4px;';const cv=ex.sl?.currentValue||ex.sessionBest;if(cv>ex.pr.prValue){prC.style.background='rgba(122,154,125,0.15)';prC.innerHTML='<span style="color:#7a9a7d;font-weight:700;">🎉 NEW PR!</span> <span style="color:'+THEME.colorMuted+';">Previous: '+ex.pr.prValue+' → Now: '+cv+'</span>';}else if(cv===ex.pr.prValue){prC.innerHTML='<span style="color:#a89860;">🏆 Matched PR:</span> <span style="color:'+THEME.colorMuted+';">'+ex.pr.prValue+'</span>';}else{prC.innerHTML='<span style="color:'+THEME.colorMuted+';">🏆 PR: '+ex.pr.prValue+'</span> <span style="color:#6a6a6a;">(today: '+cv+')</span>';}card.appendChild(prC);}
if(ex.sl&&ex.sl.nextTarget){const pb=document.createElement('div');pb.className='strength-bar';pb.style.marginTop='8px';card.appendChild(pb);const fill=document.createElement('div');fill.className='strength-bar-fill';fill.style.cssText='width:'+Math.min(100,ex.sl.progress)+'%;background:'+ex.sl.color+';';pb.appendChild(fill);const ti=document.createElement('div');ti.style.cssText='display:flex;justify-content:space-between;font-size:9px;color:'+THEME.colorMuted+';margin-top:4px;';ti.innerHTML='<span>Current: '+ex.sl.currentValue+ex.sl.unit+'</span><span>Next: '+Math.round(ex.sl.nextTarget)+ex.sl.unit+'</span>';card.appendChild(ti);}}}
const feelT=document.createElement('h3');feelT.textContent="How did it feel?";feelT.style.cssText='margin:8px 0 0 0;color:'+THEME.color+';font-size:13px;letter-spacing:3px;text-align:center;text-transform:uppercase;opacity:0.8;';scroll.appendChild(feelT);
const btns=document.createElement('div');btns.style.cssText='display:flex;flex-direction:column;gap:10px;';scroll.appendChild(btns);
function createBtn(icon,btnT,desc,bC,aC,onClick){const btn=document.createElement('div');btn.style.cssText='display:flex;align-items:center;gap:16px;padding:16px 20px;background:#0c0c0c;border:1px solid '+bC+';cursor:pointer;';btns.appendChild(btn);const iconEl=document.createElement('div');iconEl.textContent=icon;iconEl.style.cssText='font-size:24px;width:40px;text-align:center;';btn.appendChild(iconEl);const tw=document.createElement('div');tw.style.cssText='flex:1;';btn.appendChild(tw);const tEl=document.createElement('div');tEl.textContent=btnT;tEl.style.cssText='color:'+aC+';font-size:14px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:4px;';tw.appendChild(tEl);const dEl=document.createElement('div');dEl.textContent=desc;dEl.style.cssText='color:#5a5a5a;font-size:11px;font-style:italic;';tw.appendChild(dEl);const arrow=document.createElement('div');arrow.textContent='→';arrow.style.cssText='color:'+bC+';font-size:18px;opacity:0.5;';btn.appendChild(arrow);btn.onmouseover=()=>{btn.style.borderColor=aC;btn.style.background='#101010';arrow.style.color=aC;arrow.style.opacity='1';};btn.onmouseout=()=>{btn.style.borderColor=bC;btn.style.background='#0c0c0c';arrow.style.color=bC;arrow.style.opacity='0.5';};btn.onclick=async()=>{document.body.removeChild(modal);await onClick();};}
createBtn('💎','Discipline','Pushed through resistance','#4a4030',THEME.colorDiscipline,()=>finishWorkout('discipline'));createBtn('🌊','Flow','Felt natural and effortless','#304050',THEME.colorFlow,()=>finishWorkout('flow'));
modal.onclick=(e)=>{if(e.target===modal)document.body.removeChild(modal);};document.body.appendChild(modal);}

async function finishWorkout(type){const f=app.vault.getAbstractFileByPath(currentFile.path);if(!f)return;let c=await app.vault.read(f);c=c.replace(/Workout: false/,'Workout: true');c=c.replace(/Workout-Type: ""/,'Workout-Type: "'+type+'"');await app.vault.modify(f,c);new Notice('🎉 Workout logged as '+(type==='discipline'?'Discipline Win':'Flow State')+'!');setTimeout(()=>{window.location.href='obsidian://open?vault='+encodeURIComponent(VAULT_NAME)+'&file='+encodeURIComponent('Home/Activities/Workout hub');},500);}

render();`;
}

// ==========================================
// RENDER MAIN HUB
// ==========================================
const container = dv.el("div", "", { cls: "workout-container", attr: { style: "max-width: 480px; margin: 0 auto; padding: 0;" } });

const headerCard = document.createElement('div');
headerCard.style.cssText = `border: 1px solid ${THEME.colorBorder}; padding: 0; margin-bottom: 30px; background: #0a0a0a; box-shadow: 0 20px 60px rgba(0,0,0,0.8); overflow: hidden; position: relative; animation: breathe 6s ease-in-out infinite;`;
container.appendChild(headerCard);
createCorners(headerCard, THEME.color);
addFloatingMotes(headerCard, THEME.color, 4);

const headerSection = document.createElement('div');
headerSection.style.cssText = `padding: 28px 32px; background: linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 100%); border-bottom: 1px solid ${THEME.colorBorder};`;
headerCard.appendChild(headerSection);

const iconTitle = document.createElement('div');
iconTitle.style.cssText = 'display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 12px;';
iconTitle.innerHTML = `<span style="font-size: 28px;">🏋️</span><h2 style="margin: 0; color: ${THEME.color}; font-size: 26px; font-weight: 600; letter-spacing: 1px;">Workout</h2>`;
headerSection.appendChild(iconTitle);

const divider = document.createElement('div');
divider.style.cssText = `width: 40px; height: 1px; background: linear-gradient(90deg, transparent, ${THEME.color}, transparent); margin: 0 auto 14px auto;`;
headerSection.appendChild(divider);

const descP = document.createElement('p');
descP.textContent = "Strength and discipline";
descP.style.cssText = `margin: 0; color: ${THEME.colorMuted}; font-size: 14px; font-style: italic; text-align: center;`;
headerSection.appendChild(descP);

const mottoP = document.createElement('p');
mottoP.textContent = "Νους υγιής εν σώματι υγιεί";
mottoP.style.cssText = `margin: 10px 0 0 0; color: ${THEME.colorHover}; font-size: 16px; text-align: center; letter-spacing: 0.5px;`;
headerSection.appendChild(mottoP);

const statsSection = document.createElement('div');
statsSection.style.cssText = `padding: 20px 32px; background: #0f0f0f; border-bottom: 1px solid ${THEME.colorBorder}; display: flex; justify-content: space-between; align-items: center;`;
headerCard.appendChild(statsSection);

const statsInfo = document.createElement('div');
statsSection.appendChild(statsInfo);
getPersonalStats().then(stats => {
    const age = calculateAge(stats.birthdate);
    statsInfo.innerHTML = `<span style="color: ${THEME.colorMuted}; font-size: 12px;">Age: <strong style="color: ${THEME.color}">${age}</strong></span><span style="margin: 0 16px; color: ${THEME.colorBorder};">|</span><span style="color: ${THEME.colorMuted}; font-size: 12px;">Weight: <strong style="color: ${THEME.color}">${stats.weight}kg</strong></span><span style="margin: 0 16px; color: ${THEME.colorBorder};">|</span><span style="color: ${THEME.colorMuted}; font-size: 12px;">Height: <strong style="color: ${THEME.color}">${stats.height}cm</strong></span>`;
});

const editStatsBtn = document.createElement('button');
editStatsBtn.textContent = "✏️";
editStatsBtn.style.cssText = `padding: 6px 10px; background: transparent; border: 1px solid ${THEME.colorBorder}; color: ${THEME.colorMuted}; cursor: pointer;`;
editStatsBtn.onmouseover = () => { editStatsBtn.style.borderColor = THEME.color; editStatsBtn.style.color = THEME.color; };
editStatsBtn.onmouseout = () => { editStatsBtn.style.borderColor = THEME.colorBorder; editStatsBtn.style.color = THEME.colorMuted; };
editStatsBtn.onclick = () => openPersonalStatsModal();
statsSection.appendChild(editStatsBtn);

const weeklySection = document.createElement('div');
weeklySection.style.cssText = 'padding: 20px 32px; background: #0a0a0a;';
headerCard.appendChild(weeklySection);

const weeklyTitle = document.createElement('div');
weeklyTitle.textContent = "This Week";
weeklyTitle.style.cssText = `color: ${THEME.colorMuted}; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px; text-align: center;`;
weeklySection.appendChild(weeklyTitle);

const weeklyGrid = document.createElement('div');
weeklyGrid.style.cssText = 'display: flex; justify-content: space-between; gap: 8px;';
weeklySection.appendChild(weeklyGrid);

const workoutsThisWeek = getWorkoutsThisWeek();
const workoutDaysMap = new Map();
workoutsThisWeek.forEach(w => workoutDaysMap.set(w.dayOfWeek, w));

const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const today = moment();
const todayDayOfWeek = today.isoWeekday();

dayLabels.forEach((label, index) => {
    const dayNum = index + 1;
    const workout = workoutDaysMap.get(dayNum);
    const isCompleted = !!workout;
    const isToday = dayNum === todayDayOfWeek;
    const isPast = dayNum < todayDayOfWeek;
    
    let bgColor = '#0f0f0f';
    let textColor = THEME.color;
    let displayText = label;
    
    if (isCompleted) {
        if (workout.type === 'discipline') {
            bgColor = THEME.colorDiscipline;
            textColor = '#0a0a0a';
            displayText = '💎';
        } else if (workout.type === 'flow') {
            bgColor = THEME.colorFlow;
            textColor = '#0a0a0a';
            displayText = '🌊';
        } else {
            bgColor = THEME.color;
            textColor = '#0a0a0a';
            displayText = '✓';
        }
    } else if (isPast) {
        textColor = '#6a4a4a';
    } else {
        textColor = THEME.colorMuted;
    }
    
    const dayCell = document.createElement('div');
    dayCell.style.cssText = `flex: 1; text-align: center; padding: 10px 0; background: ${bgColor}; border: 1px solid ${isToday ? THEME.colorHover : THEME.colorBorder}; color: ${textColor}; font-size: 13px; font-weight: ${isToday ? '700' : '500'}; cursor: ${isCompleted ? 'pointer' : 'default'}; transition: all 0.2s ease;`;
    
    if (isCompleted) {
        dayCell.onmouseover = () => { dayCell.style.transform = "translateY(-2px)"; dayCell.style.boxShadow = "0 4px 12px rgba(154, 140, 122, 0.3)"; };
        dayCell.onmouseout = () => { dayCell.style.transform = "translateY(0)"; dayCell.style.boxShadow = "none"; };
        dayCell.onclick = () => { window.location.href = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent(workout.file.path)}`; };
    }
    
    dayCell.textContent = displayText;
    weeklyGrid.appendChild(dayCell);
});

// ==========================================
// ACTION BUTTONS
// ==========================================
const actionsContainer = document.createElement('div');
actionsContainer.style.cssText = 'display: flex; flex-direction: column; gap: 12px; margin-bottom: 30px;';
container.appendChild(actionsContainer);

const startBtn = document.createElement('button');
startBtn.innerHTML = `<span style="font-size: 20px;">🏋️</span> START NEW WORKOUT`;
startBtn.style.cssText = `width: 100%; padding: 20px 24px; background: ${THEME.color}; border: none; color: #0a0a0a; font-size: 15px; font-weight: 700; letter-spacing: 2px; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 12px;`;
startBtn.onmouseover = () => { startBtn.style.background = THEME.colorHover; startBtn.style.transform = "translateY(-2px)"; startBtn.style.boxShadow = "0 8px 24px rgba(154, 140, 122, 0.3)"; };
startBtn.onmouseout = () => { startBtn.style.background = THEME.color; startBtn.style.transform = "translateY(0)"; startBtn.style.boxShadow = "none"; };
startBtn.onclick = () => openStartWorkoutModal();
actionsContainer.appendChild(startBtn);

const secondaryRow = document.createElement('div');
secondaryRow.style.cssText = 'display: flex; gap: 12px;';
actionsContainer.appendChild(secondaryRow);

const addStandardBtn = document.createElement('button');
addStandardBtn.textContent = "📊 Add Strength Standard";
addStandardBtn.style.cssText = `flex: 1; padding: 14px; background: #0f0f0f; border: 1px solid ${THEME.colorBorder}; color: ${THEME.color}; font-size: 12px; letter-spacing: 1px; cursor: pointer; transition: all 0.3s ease;`;
addStandardBtn.onmouseover = () => { addStandardBtn.style.borderColor = THEME.color; addStandardBtn.style.background = "#1a1814"; };
addStandardBtn.onmouseout = () => { addStandardBtn.style.borderColor = THEME.colorBorder; addStandardBtn.style.background = "#0f0f0f"; };
addStandardBtn.onclick = () => openAddStrengthStandardModal();
secondaryRow.appendChild(addStandardBtn);

// ==========================================
// RECENT SESSIONS CARD
// ==========================================
const sessionsCard = document.createElement('div');
sessionsCard.style.cssText = `border: 1px solid ${THEME.colorBorder}; padding: 32px; background: #0a0a0a; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8); position: relative; animation: breathe 10s ease-in-out infinite;`;
container.appendChild(sessionsCard);
createCorners(sessionsCard, THEME.color);
addFloatingMotes(sessionsCard, THEME.color, 2);

const sessionsTitle = document.createElement('h3');
sessionsTitle.textContent = 'Recent Sessions';
sessionsTitle.style.cssText = `margin: 0 0 20px 0; color: ${THEME.color}; font-size: 13px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; opacity: 0.7;`;
sessionsCard.appendChild(sessionsTitle);

const sessionsList = document.createElement('div');
sessionsList.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';
sessionsCard.appendChild(sessionsList);

const recentWorkouts = getRecentWorkouts(5);

recentWorkouts.forEach(workout => {
    const item = document.createElement('div');
    item.style.cssText = `display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #0f0f0f; border-radius: 4px; border: 1px solid ${THEME.colorBorder}; transition: all 0.2s ease; cursor: pointer;`;
    sessionsList.appendChild(item);
    
    item.onmouseover = () => { item.style.borderColor = THEME.color; item.style.background = '#1a1814'; };
    item.onmouseout = () => { item.style.borderColor = THEME.colorBorder; item.style.background = '#0f0f0f'; };
    item.onclick = () => { window.location.href = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent(workout.file.path)}`; };
    
    const dateLabel = document.createElement('div');
    dateLabel.textContent = moment(workout.date, "YYYY-MM-DD").format("MMM D, YYYY");
    dateLabel.style.cssText = `font-size: 13px; color: ${THEME.color};`;
    item.appendChild(dateLabel);
    
    const typeLabel = document.createElement('div');
    typeLabel.style.cssText = 'display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;';
    item.appendChild(typeLabel);
    
    const typeEmoji = workout.type === "discipline" ? "💎" : workout.type === "flow" ? "🌊" : workout.completed ? "✓" : "⏭️";
    const typeColor = workout.type === "discipline" ? THEME.colorDiscipline : workout.type === "flow" ? THEME.colorFlow : workout.completed ? "#7a9a7d" : "#6a6a6a";
    const typeText = workout.type === "discipline" ? "Discipline" : workout.type === "flow" ? "Flow" : workout.completed ? "Done" : "Skipped";
    
    typeLabel.innerHTML = `<span>${typeEmoji}</span><span style="color: ${typeColor};">${typeText}</span>`;
});

if (recentWorkouts.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.textContent = "No sessions recorded yet. Start tracking above!";
    emptyMsg.style.cssText = `text-align: center; padding: 20px; color: ${THEME.colorMuted}; font-style: italic;`;
    sessionsList.appendChild(emptyMsg);
}
```
