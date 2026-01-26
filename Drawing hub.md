```dataviewjs
// ==========================================
// ACTIVITY TRACKER - REFINED OPULENCE EDITION
// ==========================================

// ==========================================
// GLOBAL STYLES & ANIMATIONS
// ==========================================
const style = document.createElement('style');
style.textContent = `
    img {
        pointer-events: none !important;
        user-select: none !important;
        -webkit-user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-user-drag: none !important;
    }
    
    /* Allow vertical scrolling on touch devices */
    .activity-card-container,
    .activity-card-container * {
        touch-action: pan-y !important;
    }
    
    
    /* Subtle breathing glow */
    @keyframes breathe {
        0%, 100% { box-shadow: inset 0 0 20px rgba(122, 154, 125, 0.03); }
        50% { box-shadow: inset 0 0 40px rgba(122, 154, 125, 0.08); }
    }
    
    /* Gentle pulse for center dot */
    @keyframes pulse-soft {
        0%, 100% { transform: scale(1); opacity: 0.8; }
        50% { transform: scale(1.2); opacity: 1; }
    }
    
    /* Floating dust motes */
    @keyframes float-up {
        0% { transform: translateY(0) translateX(0); opacity: 0; }
        10% { opacity: 0.4; }
        90% { opacity: 0.4; }
        100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
    }
    
    /* Scanline sweep */
    @keyframes scanline-sweep {
        0% { top: -100%; opacity: 0; }
        50% { opacity: 0.5; }
        100% { top: 100%; opacity: 0; }
    }
    
    /* Button press */
    @keyframes button-press {
        0% { transform: scale(1); }
        50% { transform: scale(0.96); }
        100% { transform: scale(1); }
    }
    
    /* Flash effect */
    @keyframes flash-out {
        0% { opacity: 0.8; transform: scale(0.5); }
        100% { opacity: 0; transform: scale(1.5); }
    }
    
    /* Modal animations */
    @keyframes modal-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes modal-slide-up {
        from { transform: translateY(30px) scale(0.98); opacity: 0; }
        to { transform: translateY(0) scale(1); opacity: 1; }
    }
    
    /* CTA reveal */
    @keyframes cta-reveal {
        from { transform: translate(-50%, -50%) scale(0.6) rotateX(60deg); opacity: 0; }
        to { transform: translate(-50%, -50%) scale(1) rotateX(0deg); opacity: 1; }
    }
    
    /* Skipped fade */
    @keyframes skipped-fade {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(0.98); opacity: 0.4; }
    }
    
    /* Elegant line drawing for corners */
    @keyframes draw-corner {
        from { width: 0; height: 0; }
        to { width: 18px; height: 18px; }
    }
`;
document.head.appendChild(style);

// ==========================================
// PARSE ACTIVITY NAME
// ==========================================
const noteTitle = dv.current().file.name;
const activityName = noteTitle.replace(/ hub$/i, '').trim();

// ==========================================
// ACTIVITY CONFIGURATION
// ==========================================
const ACTIVITY_CONFIG = {
    "Workout": {
        folder: "Personal Life/01 Workout",
        field: "Workout",
        weeklyTarget: 7,
        color: "#9a8c7a",
        colorHover: "#aa9c8a",
        colorBorder: "#3a342a",
        colorLight: "#b8a890",
        description: "Νους υγιής εν σώματι υγιεί"
    },
    "Cardio": {
        folder: "Personal Life/02 Cardio",
        field: "Cardio",
        weeklyTarget: 4,
        icon: "🚴‍♂️",
        color: "#7a8c9a",
        colorHover: "#8a9caa",
        colorBorder: "#2a343a",
        colorLight: "#9aacba",
        description: "Endurance and vitality",
        motto: ""
    },
    "Reading": {
        folder: "Personal Life/03 Reading",
        field: "Reading",
        weeklyTarget: 6,
        icon: "📖",
        color: "#7a9a7d",
        colorHover: "#8aaa8d",
        colorBorder: "#2a3a2d",
        colorLight: "#9aba9d",
        description: "Knowledge and reflection",
        motto: ""
    },
    "Drumming": {
        folder: "Personal Life/04 Drumming",
        field: "Drumming",
        weeklyTarget: 6,
        icon: "🥁",
        color: "#9a7a7a",
        colorHover: "#aa8a8a",
        colorBorder: "#3a2a2a",
        colorLight: "#ba9a9a",
        description: "Rhythm and expression",
        motto: ""
    },
    "Health Study": {
        folder: "Personal Life/05 Health Study",
        field: "Health Study",
        weeklyTarget: 3,
        icon: "📚",
        color: "#7a9a7a",
        colorHover: "#8aaa8a",
        colorBorder: "#2a3a2a",
        colorLight: "#9aba9a",
        description: "Wellness and understanding",
        motto: ""
    },
    "Social": {
        folder: "Personal Life/06 Social",
        field: "Social",
        weeklyTarget: 2,
        color: "#9a867a",
        colorHover: "#aa968a",
        colorBorder: "#3a322a",
        colorLight: "#baa69a",
        description: "Connection and community",
        motto: ""
    },
    "Drawing": {
        folder: "Personal Life/07 Drawing",
        field: "Drawing",
        weeklyTarget: 4,
        icon: "🎨",
        color: "#7a949a",
        colorHover: "#8aa4aa",
        colorBorder: "#2a343a",
        colorLight: "#9ab4ba",
        description: "Creation and expression",
        motto: ""
    }
};

const config = ACTIVITY_CONFIG[activityName];

if (!config) {
    dv.paragraph(`⚠️ No configuration found for "${activityName}". Please add to ACTIVITY_CONFIG.`);
    return;
}

// ==========================================
// DECORATIVE CORNERS
// ==========================================
function createCorners(container, color) {
    const corners = ['TL', 'TR', 'BL', 'BR'];
    const cornerElements = {};
    
    corners.forEach(pos => {
        const corner = document.createElement('div');
        const isTop = pos.includes('T');
        const isLeft = pos.includes('L');
        
        corner.style.cssText = `
            position: absolute;
            ${isTop ? 'top: 0' : 'bottom: 0'};
            ${isLeft ? 'left: 0' : 'right: 0'};
            width: 18px;
            height: 18px;
            border-${isTop ? 'top' : 'bottom'}: 1px solid ${color};
            border-${isLeft ? 'left' : 'right'}: 1px solid ${color};
            z-index: 10;
            transition: all 0.4s ease;
        `;
        container.appendChild(corner);
        cornerElements[pos] = corner;
    });
    
    return cornerElements;
}

// ==========================================
// FLOATING DUST MOTES (Lightweight opulence)
// ==========================================
function addFloatingMotes(container, color, count = 3) {
    for (let i = 0; i < count; i++) {
        const mote = document.createElement('div');
        const size = 1 + Math.random() * 2;
        const left = 10 + Math.random() * 80;
        const delay = Math.random() * 10;
        const duration = 8 + Math.random() * 6;
        
        mote.style.cssText = `
            position: absolute;
            bottom: 10%;
            left: ${left}%;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: 50%;
            opacity: 0;
            pointer-events: none;
            animation: float-up ${duration}s ${delay}s ease-out infinite;
            z-index: 1;
        `;
        container.appendChild(mote);
    }
}

// ==========================================
// DATA CALCULATION FUNCTIONS
// ==========================================
const journalFormat = "YYYY-MM-DD";
const MAX_STREAK_GAP = 2;
const VAULT_NAME = "Alt society";

function getCurrentWeekStats() {
    const today = moment().startOf("day");
    const weekStart = today.clone().startOf("isoWeek");
    const weekEnd = today.clone().endOf("isoWeek");
    
    const pages = dv.pages(`"${config.folder}"`);
    
    const completions = pages
        .where(p => {
            const date = moment(p.file.name, journalFormat);
            return date.isValid() && 
                   date.isBetween(weekStart, weekEnd, null, "[]") &&
                   p[config.field] === true;
        })
        .map(p => ({
            date: moment(p.file.name, journalFormat),
            type: p[config.field + "-Type"] || "flow"
        }))
        .array();
    
    return {
        count: completions.length,
        target: config.weeklyTarget,
        disciplineWins: completions.filter(c => c.type === "discipline").length
    };
}

function getCurrentMonthStats() {
    const today = moment().startOf("day");
    const monthStart = today.clone().startOf("month");
    const monthEnd = today.clone().endOf("month");
    const daysInMonth = today.daysInMonth();
    
    const pages = dv.pages(`"${config.folder}"`);
    
    const completions = pages
        .where(p => {
            const date = moment(p.file.name, journalFormat);
            return date.isValid() && 
                   date.isBetween(monthStart, monthEnd, null, "[]") &&
                   p[config.field] === true;
        })
        .map(p => ({
            date: moment(p.file.name, journalFormat),
            type: p[config.field + "-Type"] || "flow"
        }))
        .array();
    
    const monthlyTarget = Math.round((config.weeklyTarget / 7) * daysInMonth);
    
    return {
        count: completions.length,
        target: monthlyTarget,
        disciplineWins: completions.filter(c => c.type === "discipline").length
    };
}

function calculateStreak() {
    const today = moment().startOf("day");
    const pages = dv.pages(`"${config.folder}"`);
    
    const completedDates = pages
        .where(p => p[config.field] === true)
        .map(p => moment(p.file.name, journalFormat))
        .filter(d => d.isValid() && d.isSameOrBefore(today))
        .array()
        .sort((a, b) => b.diff(a));
    
    if (completedDates.length === 0) return 0;
    
    const mostRecent = completedDates[0];
    const daysSinceLastCompletion = today.diff(mostRecent, 'days');
    
    if (daysSinceLastCompletion > MAX_STREAK_GAP) return 0;
    
    let streak = 0;
    for (let i = 0; i < completedDates.length; i++) {
        const currentDate = completedDates[i];
        streak++;
        
        if (i < completedDates.length - 1) {
            const nextDate = completedDates[i + 1];
            const daysBetween = currentDate.diff(nextDate, 'days') - 1;
            if (daysBetween > MAX_STREAK_GAP) break;
        }
    }
    
    return streak;
}

function getTotalDisciplineWins() {
    const pages = dv.pages(`"${config.folder}"`);
    return pages
        .where(p => p[config.field] === true && p[config.field + "-Type"] === "discipline")
        .length;
}

function getRecentSessions(limit = 5) {
    const pages = dv.pages(`"${config.folder}"`)
        .sort(p => p.file.name, 'desc')
        .limit(limit * 3)
        .array();
    
    return pages
        .filter(p => p[config.field] !== undefined && p[config.field] !== null)
        .slice(0, limit)
        .map(p => ({
            date: p.file.name,
            completed: p[config.field] === true,
            type: p[config.field + "-Type"] || "skipped"
        }));
}

// ==========================================
// APHORISMS
// ==========================================
const APHORISMS = {
    discipline: [
        "Discipline is the bridge between goals and accomplishment.",
        "The pain of discipline weighs ounces. The pain of regret weighs tons.",
        "We must all suffer from one of two pains: the pain of discipline or the pain of regret.",
        "Discipline is choosing between what you want now and what you want most.",
        "The successful warrior is the average man, with laser-like focus.",
        "Discipline is doing what needs to be done, even when you don't want to do it.",
        "True freedom is impossible without a mind made free by discipline.",
        "With self-discipline most anything is possible.",
        "Motivation gets you going, but discipline keeps you growing.",
        "Discipline is the soul of an army. It makes small numbers formidable."
    ],
    flow: [
        "Flow is being completely involved in an activity for its own sake.",
        "In the zone, time disappears and nothing else matters.",
        "The best moments usually occur when a person's body or mind is stretched.",
        "Mastery is not a commitment to a goal but to a constant pursuit.",
        "When you're in flow, the ego falls away.",
        "The quality of life depends on the quality of experience.",
        "Flow is the state where action and awareness merge.",
        "In flow, you're neither bored nor anxious.",
        "Peak performance requires peak experience.",
        "Momentum is a beautiful thing."
    ],
    skipped: [
        "Tomorrow is a new opportunity.",
        "One day does not define the pattern.",
        "Rest when necessary, but never quit.",
        "The path is walked one step at a time.",
        "Perfection is not required, persistence is.",
        "Even masters have off days.",
        "Progress is not always linear.",
        "The streak is not as important as the direction."
    ]
};

// ==========================================
// CALCULATE ALL STATS
// ==========================================
const weekStats = getCurrentWeekStats();
const monthStats = getCurrentMonthStats();
const currentStreak = calculateStreak();
const totalDisciplineWins = getTotalDisciplineWins();
const recentSessions = getRecentSessions();

// ==========================================
// RENDER MAIN CONTAINER
// ==========================================
const container = dv.el("div", "", {
    cls: "activity-card-container",
    attr: {
        style: `
            max-width: 480px;
            margin: 0 auto;
            padding: 0;
            touch-action: pan-y;
            overflow-x: hidden;
        `
    }
});

// ==========================================
// HEADER CARD WITH BREATHING ANIMATION
// ==========================================
const headerCard = document.createElement('div');
headerCard.style.cssText = `
    border: 1px solid ${config.colorBorder};
    padding: 0;
    margin-bottom: 30px;
    background: #0a0a0a;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
    overflow: hidden;
    position: relative;
    touch-action: pan-y;
    animation: breathe 6s ease-in-out infinite;
`;
container.appendChild(headerCard);

createCorners(headerCard, config.color);
addFloatingMotes(headerCard, config.color, 4);

const headerSection = document.createElement('div');
headerSection.style.cssText = `
    padding: 28px 32px;
    background: linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 100%);
    border-bottom: 1px solid ${config.colorBorder};
`;
headerCard.appendChild(headerSection);

// Icon and Title row
const iconTitle = document.createElement('div');
iconTitle.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 12px;
`;
headerSection.appendChild(iconTitle);

const iconSpan = document.createElement('span');
iconSpan.textContent = config.icon;
iconSpan.style.cssText = `font-size: 28px;`;
iconTitle.appendChild(iconSpan);

const titleH2 = document.createElement('h2');
titleH2.textContent = activityName;
titleH2.style.cssText = `
    margin: 0;
    color: ${config.color};
    font-size: 26px;
    font-weight: 600;
    font-family: "Times New Roman", serif;
    letter-spacing: 1px;
`;
iconTitle.appendChild(titleH2);

// Divider
const divider = document.createElement('div');
divider.style.cssText = `
    width: 40px;
    height: 1px;
    background: linear-gradient(90deg, transparent, ${config.color}, transparent);
    margin: 0 auto 14px auto;
`;
headerSection.appendChild(divider);

// Description
const descP = document.createElement('p');
descP.textContent = config.description;
descP.style.cssText = `
    margin: 0;
    color: #5a6a5d;
    font-size: 14px;
    line-height: 1.4;
    font-family: "Georgia", serif;
    font-style: italic;
    text-align: center;
`;
headerSection.appendChild(descP);

// Greek motto if exists
if (config.motto) {
    const mottoP = document.createElement('p');
    mottoP.textContent = config.motto;
    mottoP.style.cssText = `
        margin: 10px 0 0 0;
        color: ${config.colorHover};
        font-size: 16px;
        line-height: 1.4;
        font-family: "Times New Roman", serif;
        text-align: center;
        letter-spacing: 0.5px;
    `;
    headerSection.appendChild(mottoP);
}

// ==========================================
// STATS BARS
// ==========================================
const statsContainer = document.createElement('div');
statsContainer.style.cssText = 'padding: 0;';
headerCard.appendChild(statsContainer);

function createStatBar(label, value, maxValue, sublabel = "") {
    const progress = Math.min(value / maxValue, 1);
    const percentage = Math.round(progress * 100);
    
    const barWrapper = document.createElement('div');
    barWrapper.style.cssText = `
        padding: 20px 32px;
        background: #0f0f0f;
        border-top: 1px solid ${config.colorBorder};
        position: relative;
        overflow: hidden;
        touch-action: pan-y;
    `;
    statsContainer.appendChild(barWrapper);
    
    // Filled portion
    const fill = document.createElement('div');
    fill.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: ${percentage}%;
        background: ${config.color};
        opacity: 0.15;
        transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    barWrapper.appendChild(fill);
    
    const content = document.createElement('div');
    content.style.cssText = `
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
    barWrapper.appendChild(content);
    
    const leftSide = document.createElement('div');
    content.appendChild(leftSide);
    
    const labelDiv = document.createElement('div');
    labelDiv.textContent = label;
    labelDiv.style.cssText = `
        font-size: 11px;
        color: #5a6a5d;
        letter-spacing: 2px;
        text-transform: uppercase;
        margin-bottom: 4px;
        font-family: "Times New Roman", serif;
    `;
    leftSide.appendChild(labelDiv);
    
    if (sublabel) {
        const subDiv = document.createElement('div');
        subDiv.textContent = sublabel;
        subDiv.style.cssText = `
            font-size: 12px;
            color: #5a6a5d;
            font-style: italic;
            font-family: "Georgia", serif;
        `;
        leftSide.appendChild(subDiv);
    }
    
    const rightSide = document.createElement('div');
    rightSide.style.cssText = 'text-align: right;';
    content.appendChild(rightSide);
    
    const valueDiv = document.createElement('div');
    valueDiv.textContent = value;
    valueDiv.style.cssText = `
        font-size: 28px;
        font-weight: 700;
        color: ${config.color};
        line-height: 1;
    `;
    rightSide.appendChild(valueDiv);
    
    const maxDiv = document.createElement('div');
    maxDiv.textContent = `/ ${maxValue}`;
    maxDiv.style.cssText = `
        font-size: 14px;
        color: #5a6a5d;
        margin-top: 2px;
    `;
    rightSide.appendChild(maxDiv);
    
    return barWrapper;
}

createStatBar(
    "Week", 
    weekStats.count, 
    weekStats.target,
    weekStats.count >= weekStats.target ? "Complete ✓" : "In progress"
);

createStatBar(
    "Streak", 
    currentStreak,
    Math.max(currentStreak, config.weeklyTarget),
    currentStreak > 0 ? `${currentStreak} days` : "Start today"
);

createStatBar(
    "Discipline", 
    totalDisciplineWins,
    Math.max(totalDisciplineWins, 10),
    "Total wins"
);

createStatBar(
    "Month", 
    monthStats.count,
    monthStats.target,
    `${Math.round(monthStats.count / monthStats.target * 100)}%`
);

// ==========================================
// ACTION BUTTONS
// ==========================================
const buttonsCard = document.createElement('div');
buttonsCard.style.cssText = `
    display: flex;
    gap: 16px;
    margin-bottom: 30px;
`;
container.appendChild(buttonsCard);

function createImageButton(container, options) {
    const { imageName, title, subtitle, onClick, ctaText = "ENTER" } = options;
    
    const btn = document.createElement('div');
    btn.style.cssText = `
        flex: 1;
        border: 1px solid ${config.colorBorder};
        padding: 0;
        background: #0f0f0f;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
        position: relative;
        box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.5), 0 4px 16px rgba(0, 0, 0, 0.4);
        touch-action: pan-y;
        -webkit-tap-highlight-color: transparent;
    `;
    container.appendChild(btn);
    
    const corners = createCorners(btn, config.color);
    
    // Image container
    const imageContainer = document.createElement('div');
    imageContainer.style.cssText = `
        width: 100%;
        height: 140px;
        overflow: hidden;
        background: #000000;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
    `;
    btn.appendChild(imageContainer);
    
    // Image
    const image = document.createElement("img");
    image.src = app.vault.adapter.getResourcePath(`Obsidian/Images/${imageName}.jpg`);
    image.onerror = () => {
        image.src = app.vault.adapter.getResourcePath(`Obsidian/Images/${imageName}.png`);
    };
    image.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        filter: grayscale(0.2) contrast(1.1) sepia(0.15);
    `;
    imageContainer.appendChild(image);
    
    // Scanline overlay
    const scanline = document.createElement('div');
    scanline.style.cssText = `
        position: absolute;
        top: -100%;
        left: 0;
        right: 0;
        height: 100%;
        background: linear-gradient(180deg, 
            transparent 0%, 
            ${config.color}30 50%, 
            transparent 100%);
        pointer-events: none;
        opacity: 0;
    `;
    imageContainer.appendChild(scanline);
    
    // Glow overlay
    const glowOverlay = document.createElement('div');
    glowOverlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at center, ${config.color}20 0%, transparent 70%);
        opacity: 0;
        transition: opacity 0.6s ease;
        pointer-events: none;
        mix-blend-mode: overlay;
    `;
    imageContainer.appendChild(glowOverlay);
    
    // CTA overlay
    const ctaOverlay = document.createElement('div');
    ctaOverlay.textContent = ctaText;
    ctaOverlay.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.6) rotateX(60deg);
        color: ${config.colorHover};
        font-weight: 600;
        font-family: "Times New Roman", serif;
        font-size: 16px;
        letter-spacing: 4px;
        opacity: 0;
        transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        pointer-events: none;
        text-shadow: 0 0 20px ${config.color};
        background: rgba(10, 10, 10, 0.95);
        padding: 12px 24px;
        border: 1px solid ${config.color};
    `;
    imageContainer.appendChild(ctaOverlay);
    
    // Text section
    const textSection = document.createElement('div');
    textSection.style.cssText = `
        padding: 16px 18px;
        background: #0f0f0f;
    `;
    btn.appendChild(textSection);
    
    const titleEl = document.createElement('h4');
    titleEl.textContent = title;
    titleEl.style.cssText = `
        margin: 0 0 6px 0;
        color: ${config.color};
        font-size: 14px;
        font-weight: 500;
        font-family: "Times New Roman", serif;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        transition: all 0.3s ease;
    `;
    textSection.appendChild(titleEl);
    
    const subtitleEl = document.createElement('p');
    subtitleEl.textContent = subtitle;
    subtitleEl.style.cssText = `
        margin: 0;
        color: ${config.color};
        font-size: 12px;
        line-height: 1.5;
        font-family: "Georgia", serif;
        font-style: italic;
        opacity: 0.7;
        transition: all 0.3s ease;
    `;
    textSection.appendChild(subtitleEl);
    
    // Parallax effect on mouse move
    imageContainer.onmousemove = (e) => {
        const rect = imageContainer.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
        image.style.transform = `scale(1.08) translate(${x}px, ${y}px) rotateY(${x * 0.3}deg) rotateX(${-y * 0.3}deg)`;
    };
    
    btn.onmouseover = () => {
        btn.style.borderColor = config.color;
        btn.style.boxShadow = `inset 0 0 40px ${config.color}15, 0 8px 32px ${config.color}10`;
        image.style.filter = "grayscale(0) contrast(1.2) brightness(1.15) saturate(1.3) sepia(0.1)";
        glowOverlay.style.opacity = "1";
        scanline.style.opacity = "1";
        scanline.style.animation = "scanline-sweep 1.5s ease-out";
        ctaOverlay.style.opacity = "1";
        ctaOverlay.style.transform = "translate(-50%, -50%) scale(1) rotateX(0deg)";
        titleEl.style.color = config.colorHover;
        subtitleEl.style.color = config.colorHover;
        subtitleEl.style.opacity = "0.9";
        
        // Expand corners
        Object.values(corners).forEach(c => {
            c.style.width = "28px";
            c.style.height = "28px";
        });
    };
    
    btn.onmouseout = () => {
        btn.style.borderColor = config.colorBorder;
        btn.style.boxShadow = "inset 0 0 30px rgba(0, 0, 0, 0.5), 0 4px 16px rgba(0, 0, 0, 0.4)";
        image.style.transform = "scale(1)";
        image.style.filter = "grayscale(0.2) contrast(1.1) sepia(0.15)";
        glowOverlay.style.opacity = "0";
        scanline.style.opacity = "0";
        scanline.style.animation = "none";
        ctaOverlay.style.opacity = "0";
        ctaOverlay.style.transform = "translate(-50%, -50%) scale(0.6) rotateX(60deg)";
        titleEl.style.color = config.color;
        subtitleEl.style.color = config.color;
        subtitleEl.style.opacity = "0.7";
        
        // Reset corners
        Object.values(corners).forEach(c => {
            c.style.width = "18px";
            c.style.height = "18px";
        });
    };
    
    btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        btn.style.animation = "button-press 0.3s ease-out";
        ctaOverlay.style.transform = "translate(-50%, -50%) scale(1.1) rotateX(0deg)";
        
        // Flash effect
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: radial-gradient(circle, ${config.color}60 0%, transparent 60%);
            animation: flash-out 0.4s ease-out forwards;
            pointer-events: none;
            z-index: 20;
        `;
        imageContainer.appendChild(flash);
        
        setTimeout(() => {
            flash.remove();
            btn.style.animation = "none";
            if (onClick) onClick();
        }, 300);
    };
    
    return btn;
}

// START BUTTON
createImageButton(buttonsCard, {
    imageName: activityName,
    title: "Start",
    subtitle: "Begin session",
    ctaText: "ENTER",
    onClick: () => {
        const noteName = `${activityName} Session`;
        const notePath = `Home/Starts/${activityName}/${noteName}`;
        const uri = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent(notePath)}`;
        window.location.href = uri;
    }
});

// LOG BUTTON
createImageButton(buttonsCard, {
    imageName: "Log",
    title: "Log",
    subtitle: "Record activity",
    ctaText: "LOG",
    onClick: () => {
        openLogModal();
    }
});

// ==========================================
// LOG MODAL - REWORKED BUTTONS
// ==========================================
function openLogModal() {
    const modal = document.createElement("div");
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
        z-index: 9999;
        backdrop-filter: blur(4px);
        animation: modal-fade-in 0.3s ease-out;
    `;
    
    const modalContent = document.createElement("div");
    modalContent.style.cssText = `
        background: #0a0a0a;
        padding: 28px 20px;
        border: 1px solid ${config.colorBorder};
        max-width: 400px;
        width: 90%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        box-shadow: 0 40px 120px rgba(0, 0, 0, 0.9);
        animation: modal-slide-up 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
    `;
    modal.appendChild(modalContent);
    
    createCorners(modalContent, config.color);
    
    // Modal title
    const modalTitle = document.createElement("h2");
    modalTitle.textContent = "How did it feel?";
    modalTitle.style.cssText = `
        margin: 0;
        color: ${config.color};
        font-size: 13px;
        font-weight: 500;
        font-family: "Times New Roman", serif;
        letter-spacing: 3px;
        text-align: center;
        text-transform: uppercase;
        opacity: 0.8;
    `;
    modalContent.appendChild(modalTitle);
    
    // Buttons container - VERTICAL LAYOUT
    const buttonsContainer = document.createElement("div");
    buttonsContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;
    `;
    modalContent.appendChild(buttonsContainer);
    
    // Close on backdrop click
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.animation = "modal-fade-in 0.25s ease-out reverse";
            setTimeout(() => document.body.removeChild(modal), 200);
        }
    };
    
    // Create elegant modal button
    function createModalButton(options) {
        const { icon, title, description, borderColor, accentColor, onClick, isSkipped = false } = options;
        
        const btn = document.createElement("div");
        btn.style.cssText = `
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 16px 20px;
            background: ${isSkipped ? '#0c0808' : '#0c0c0c'};
            border: 1px solid ${borderColor};
            transition: all 0.3s ease;
            -webkit-tap-highlight-color: transparent;
            overflow: hidden;
            position: relative;
        `;
        buttonsContainer.appendChild(btn);
        
        // Icon
        const iconEl = document.createElement('div');
        iconEl.textContent = icon;
        iconEl.style.cssText = `
            font-size: 24px;
            width: 40px;
            text-align: center;
            flex-shrink: 0;
        `;
        btn.appendChild(iconEl);
        
        // Text container
        const textContainer = document.createElement('div');
        textContainer.style.cssText = `
            flex: 1;
            min-width: 0;
        `;
        btn.appendChild(textContainer);
        
        // Title
        const titleEl = document.createElement('div');
        titleEl.textContent = title;
        titleEl.style.cssText = `
            color: ${accentColor};
            font-size: 14px;
            font-weight: 600;
            font-family: "Times New Roman", serif;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            margin-bottom: 4px;
            transition: all 0.3s ease;
        `;
        textContainer.appendChild(titleEl);
        
        // Description
        const descEl = document.createElement('div');
        descEl.textContent = description;
        descEl.style.cssText = `
            color: #5a5a5a;
            font-size: 11px;
            font-family: "Georgia", serif;
            font-style: italic;
        `;
        textContainer.appendChild(descEl);
        
        // Arrow
        const arrow = document.createElement('div');
        arrow.textContent = '→';
        arrow.style.cssText = `
            color: ${borderColor};
            font-size: 18px;
            transition: all 0.3s ease;
            opacity: 0.5;
        `;
        btn.appendChild(arrow);
        
        btn.onmouseover = () => {
            btn.style.borderColor = accentColor;
            btn.style.background = isSkipped ? '#100a0a' : '#101010';
            titleEl.style.color = accentColor;
            arrow.style.color = accentColor;
            arrow.style.opacity = "1";
            arrow.style.transform = "translateX(4px)";
        };
        
        btn.onmouseout = () => {
            btn.style.borderColor = borderColor;
            btn.style.background = isSkipped ? '#0c0808' : '#0c0c0c';
            titleEl.style.color = accentColor;
            arrow.style.color = borderColor;
            arrow.style.opacity = "0.5";
            arrow.style.transform = "translateX(0)";
        };
        
        btn.onclick = async (e) => {
            e.stopPropagation();
            
            if (isSkipped) {
                btn.style.animation = "skipped-fade 0.5s ease-out forwards";
                setTimeout(async () => {
                    if (onClick) await onClick();
                    document.body.removeChild(modal);
                }, 350);
            } else {
                btn.style.animation = "button-press 0.25s ease-out";
                setTimeout(async () => {
                    if (onClick) await onClick();
                    document.body.removeChild(modal);
                }, 180);
            }
        };
        
        return btn;
    }
    
    // DISCIPLINE BUTTON
    createModalButton({
        icon: "💎",
        title: "Discipline",
        description: "Pushed through resistance",
        borderColor: "#4a4030",
        accentColor: "#b8a060",
        onClick: () => logActivity("discipline")
    });
    
    // FLOW BUTTON
    createModalButton({
        icon: "🌊",
        title: "Flow",
        description: "Felt natural and effortless",
        borderColor: "#304050",
        accentColor: "#6090b0",
        onClick: () => logActivity("flow")
    });
    
    // SKIPPED BUTTON
    createModalButton({
        icon: "⏭️",
        title: "Skipped",
        description: "Not today",
        borderColor: "#3a2828",
        accentColor: "#6a4a4a",
        onClick: () => logActivity("skipped"),
        isSkipped: true
    });
    
    document.body.appendChild(modal);
}

// ==========================================
// LOG ACTIVITY FUNCTION
// ==========================================
async function logActivity(type) {
    const today = moment().format("YYYY-MM-DD");
    const filePath = `${config.folder}/${today}.md`;
    
    const aphorismList = type === "discipline" ? APHORISMS.discipline : 
                         type === "flow" ? APHORISMS.flow : APHORISMS.skipped;
    const aphorism = aphorismList[Math.floor(Math.random() * aphorismList.length)];
    
    const isCompleted = type !== "skipped";
    
    const content = `---
${config.field}: ${isCompleted}
${config.field}-Type: "${type}"
Timestamp: "${moment().format()}"
---

> ${aphorism}

`;
    
    try {
        const file = app.vault.getAbstractFileByPath(filePath);
        if (file) {
            await app.vault.modify(file, content);
        } else {
            await app.vault.create(filePath, content);
        }
        
        const typeLabels = {
            discipline: "Discipline Win",
            flow: "Flow State",
            skipped: "Skipped"
        };
        
        new Notice(`${activityName} logged as ${typeLabels[type]}`);
        
        setTimeout(() => {
            const uri = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${encodeURIComponent(filePath)}`;
            window.location.href = uri;
        }, 250);
    } catch (error) {
        new Notice(`Error: ${error.message}`);
    }
}

// ==========================================
// WEEKLY/MONTHLY RADAR WITH ELEGANT TOUCHES
// ==========================================
const radarCard = document.createElement('div');
radarCard.style.cssText = `
    border: 1px solid ${config.colorBorder};
    padding: 32px;
    margin-bottom: 30px;
    background: #0a0a0a;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
    position: relative;
    touch-action: pan-y;
    animation: breathe 8s ease-in-out infinite;
`;
container.appendChild(radarCard);

createCorners(radarCard, config.color);
addFloatingMotes(radarCard, config.color, 3);

const radarHeader = document.createElement('div');
radarHeader.style.cssText = `
    text-align: center;
    margin-bottom: 24px;
`;
radarCard.appendChild(radarHeader);

const today = moment();
let viewMode = 'weekly';

const radarTitle = document.createElement('div');
radarTitle.textContent = 'Weekly Progress';
radarTitle.style.cssText = `
    font-size: 13px;
    font-weight: 500;
    color: #7a9a7d;
    letter-spacing: 3px;
    text-transform: uppercase;
    opacity: 0.7;
    margin-bottom: 6px;
    font-family: "Times New Roman", serif;
`;
radarHeader.appendChild(radarTitle);

const radarSubtitle = document.createElement('div');
radarSubtitle.textContent = `Week ${today.isoWeek()}`;
radarSubtitle.style.cssText = `
    font-size: 12px;
    color: #5a6a5d;
    font-family: "Georgia", serif;
    font-style: italic;
`;
radarHeader.appendChild(radarSubtitle);

// Canvas wrapper
const canvasWrapper = document.createElement('div');
canvasWrapper.style.cssText = `
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
    position: relative;
`;
radarCard.appendChild(canvasWrapper);

// Create canvas
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

const dpr = window.devicePixelRatio || 1;
const logicalSize = 300;

canvas.width = logicalSize * dpr;
canvas.height = logicalSize * dpr;
canvas.style.width = logicalSize + "px";
canvas.style.height = logicalSize + "px";

ctx.scale(dpr, dpr);
canvasWrapper.appendChild(canvas);

const centerX = logicalSize / 2;
const centerY = logicalSize / 2;

function drawRadar(mode) {
    ctx.clearRect(0, 0, logicalSize, logicalSize);
    
    const pages = dv.pages(`"${config.folder}"`);
    let dateRange, gridLabels;
    
    if (mode === 'weekly') {
        const weekStart = today.clone().startOf("isoWeek");
        dateRange = Array.from({length: 7}, (_, i) => weekStart.clone().add(i, 'days'));
        gridLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    } else {
        const monthStart = today.clone().startOf('month');
        const daysInMonth = today.daysInMonth();
        dateRange = Array.from({length: daysInMonth}, (_, i) => monthStart.clone().add(i, 'days'));
        gridLabels = dateRange.map(d => d.date());
    }
    
    const completionData = dateRange.map(date => {
        const dayPage = pages.find(p => {
            const pageDate = moment(p.file.name, journalFormat);
            return pageDate.isValid() && pageDate.isSame(date, 'day');
        });
        const completed = dayPage && dayPage[config.field] === true;
        const type = dayPage && dayPage[config.field + "-Type"] ? dayPage[config.field + "-Type"] : null;
        const isFuture = date.isAfter(today, 'day');
        return { date, completed, type, isFuture };
    });
    
    const numDays = completionData.length;
    const radius = 100;
    const dotRadius = 6;
    
    // Draw circle outline
    ctx.strokeStyle = `${config.color}33`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw center dot with subtle glow
    ctx.fillStyle = config.color;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw completion dots
    completionData.forEach((day, i) => {
        const angle = (Math.PI * 2 * i / numDays) - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        // Draw connecting line
        ctx.strokeStyle = `${config.color}1A`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        // Draw dot
        if (day.isFuture) {
            ctx.fillStyle = "rgba(107, 114, 128, 0.3)";
        } else if (day.completed) {
            ctx.fillStyle = day.type === "discipline" ? "#b8a060" : config.color;
        } else {
            ctx.fillStyle = "#ef4444";
        }
        
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw label
        const labelRadius = radius + 25;
        const labelX = centerX + Math.cos(angle) * labelRadius;
        const labelY = centerY + Math.sin(angle) * labelRadius;
        
        ctx.font = "11px system-ui, -apple-system, sans-serif";
        ctx.fillStyle = day.isFuture ? "rgba(150, 150, 150, 0.4)" : "rgba(150, 150, 150, 0.8)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(gridLabels[i], labelX, labelY);
    });
}

drawRadar(viewMode);

// Toggle container
const toggleWrapper = document.createElement('div');
toggleWrapper.style.cssText = `
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    margin-top: 20px;
`;
radarCard.appendChild(toggleWrapper);

const toggleSwitch = document.createElement("div");
toggleSwitch.style.cssText = `
    width: 55px;
    height: 33px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 31px;
    position: relative;
    transition: all 0.3s;
    -webkit-tap-highlight-color: transparent;
`;

const toggleKnob = document.createElement("div");
toggleKnob.style.cssText = `
    width: 27px;
    height: 27px;
    background: white;
    border-radius: 50%;
    position: absolute;
    top: 2px;
    left: 2px;
    transition: left 0.3s;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;

const labelW = document.createElement("span");
labelW.textContent = "W";
labelW.style.cssText = `
    position: absolute;
    left: 11px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 11px;
    font-weight: 600;
    color: var(--text-muted);
    pointer-events: none;
    z-index: 1;
`;

const labelM = document.createElement("span");
labelM.textContent = "M";
labelM.style.cssText = `
    position: absolute;
    right: 11px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 11px;
    font-weight: 600;
    color: var(--text-muted);
    pointer-events: none;
    z-index: 1;
`;

toggleSwitch.appendChild(labelW);
toggleSwitch.appendChild(labelM);
toggleSwitch.appendChild(toggleKnob);

toggleSwitch.addEventListener("click", () => {
    viewMode = viewMode === 'weekly' ? 'monthly' : 'weekly';
    
    if (viewMode === 'monthly') {
        toggleSwitch.style.background = `${config.color}4D`;
        toggleSwitch.style.borderColor = `${config.color}99`;
        toggleKnob.style.left = '25px';
        radarTitle.textContent = 'Monthly Progress';
        radarSubtitle.textContent = today.format('MMMM YYYY');
    } else {
        toggleSwitch.style.background = 'rgba(255, 255, 255, 0.05)';
        toggleSwitch.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        toggleKnob.style.left = '2px';
        radarTitle.textContent = 'Weekly Progress';
        radarSubtitle.textContent = `Week ${today.isoWeek()}`;
    }
    
    drawRadar(viewMode);
});

toggleWrapper.appendChild(toggleSwitch);

// ==========================================
// RECENT SESSIONS WITH SUBTLE ELEGANCE
// ==========================================
const sessionsCard = document.createElement('div');
sessionsCard.style.cssText = `
    border: 1px solid ${config.colorBorder};
    padding: 32px;
    background: #0a0a0a;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
    position: relative;
    touch-action: pan-y;
    animation: breathe 10s ease-in-out infinite;
`;
container.appendChild(sessionsCard);

createCorners(sessionsCard, config.color);
addFloatingMotes(sessionsCard, config.color, 2);

const sessionsTitle = document.createElement('h3');
sessionsTitle.textContent = 'Recent Sessions';
sessionsTitle.style.cssText = `
    margin: 0 0 20px 0;
    color: #7a9a7d;
    font-size: 13px;
    font-weight: 500;
    font-family: "Times New Roman", serif;
    letter-spacing: 3px;
    text-transform: uppercase;
    opacity: 0.7;
`;
sessionsCard.appendChild(sessionsTitle);

const sessionsList = document.createElement('div');
sessionsList.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 10px;
`;
sessionsCard.appendChild(sessionsList);

recentSessions.forEach(session => {
    const item = document.createElement('div');
    item.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: #0f0f0f;
        border-radius: 4px;
        border: 1px solid #2a3a2d;
        transition: all 0.2s ease;
    `;
    sessionsList.appendChild(item);
    
    item.onmouseover = () => {
        item.style.borderColor = config.color;
        item.style.background = '#121212';
    };
    
    item.onmouseout = () => {
        item.style.borderColor = '#2a3a2d';
        item.style.background = '#0f0f0f';
    };
    
    const dateLabel = document.createElement('div');
    dateLabel.textContent = moment(session.date, "YYYY-MM-DD").format("MMM D, YYYY");
    dateLabel.style.cssText = `
        font-size: 13px;
        color: ${config.color};
        font-family: "Georgia", serif;
    `;
    item.appendChild(dateLabel);
    
    const typeLabel = document.createElement('div');
    typeLabel.style.cssText = `
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 600;
        font-family: "Times New Roman", serif;
        letter-spacing: 1px;
        text-transform: uppercase;
    `;
    item.appendChild(typeLabel);
    
    const typeEmoji = session.type === "discipline" ? "💎" : 
                      session.type === "flow" ? "🌊" : "⏭️";
    const typeColor = session.type === "discipline" ? "#b8a060" : 
                      session.type === "flow" ? "#3B82F6" : "#6B7280";
    const typeText = session.type === "discipline" ? "Discipline" : 
                     session.type === "flow" ? "Flow" : "Skipped";
    
    const emojiSpan = document.createElement('span');
    emojiSpan.textContent = typeEmoji;
    typeLabel.appendChild(emojiSpan);
    
    const textSpan = document.createElement('span');
    textSpan.textContent = typeText;
    textSpan.style.cssText = `color: ${typeColor};`;
    typeLabel.appendChild(textSpan);
});

if (recentSessions.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.textContent = "No sessions recorded yet. Start tracking above!";
    emptyMsg.style.cssText = `
        text-align: center;
        padding: 20px;
        color: #5a6a5d;
        font-style: italic;
        font-family: "Georgia", serif;
    `;
    sessionsList.appendChild(emptyMsg);
}
```
