---
editor-width: 100
cssclasses:
  - hide-properties
---

```dataviewjs
// ==========================================
// SOCIAL SESSION - GLOBAL STYLES & CONFIG
// Warm Amber Theme
// ==========================================

const VAULT_NAME = "Alt society";
const SOCIAL_LOG_FILE = "Personal Life/04 Social/Social Log.md";

const THEME = {
    color: "#c9a456",
    colorHover: "#d9b466",
    colorBorder: "#3a352a",
    colorBorderHover: "#4a453a",
    colorMuted: "#7a756a",
    colorAccent: "#d9b466",
    colorWarm: "#c97a56",
    colorCool: "#6a9ac9"
};

// Styles
if (!document.getElementById('social-session-styles-v1')) {
    const style = document.createElement('style');
    style.id = 'social-session-styles-v1';
    style.textContent = `
        @keyframes social-breathe {
            0%, 100% { box-shadow: inset 0 0 20px rgba(201, 164, 86, 0.03); }
            50% { box-shadow: inset 0 0 40px rgba(201, 164, 86, 0.08); }
        }
        @keyframes social-fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .social-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0); display: flex; align-items: center;
            justify-content: center; z-index: 9999; backdrop-filter: blur(0px);
            transition: background 0.5s ease, backdrop-filter 0.5s ease;
        }
        .social-modal-overlay.visible {
            background: rgba(0,0,0,0.95); backdrop-filter: blur(4px);
        }
        .social-modal-content {
            background: #0a0a0a; padding: 32px; border: 1px solid #3a352a;
            max-width: 450px; max-height: 85vh; width: 90%;
            display: flex; flex-direction: column; gap: 20px;
            box-shadow: 0 40px 120px rgba(0,0,0,0.9); position: relative;
            opacity: 0; transform: translateY(30px);
            transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .social-modal-overlay.visible .social-modal-content {
            opacity: 1; transform: translateY(0);
        }
        .social-activity-btn {
            transition: all 0.3s ease; cursor: pointer;
        }
        .social-activity-btn:hover {
            transform: translateY(-2px);
        }
        .social-activity-btn.selected {
            border-color: #c9a456 !important;
            background: rgba(201, 164, 86, 0.1) !important;
        }
    `;
    document.head.appendChild(style);
}

// Activity types
const SOCIAL_ACTIVITIES = {
    call: { label: "Call", emoji: "📞", desc: "Phone/video call" },
    meetup: { label: "Meetup", emoji: "🤝", desc: "In-person meeting" },
    message: { label: "Message", emoji: "💬", desc: "Text conversation" },
    event: { label: "Event", emoji: "🎉", desc: "Social gathering" },
    coffee: { label: "Coffee", emoji: "☕", desc: "Casual catch-up" },
    dinner: { label: "Dinner", emoji: "🍽️", desc: "Meal together" }
};

window.SOCIAL_THEME = THEME;
window.SOCIAL_ACTIVITIES = SOCIAL_ACTIVITIES;
window.SOCIAL_LOG_FILE = SOCIAL_LOG_FILE;
window.VAULT_NAME = VAULT_NAME;

// Utility: Create decorative corners
window.createSocialCorners = function(container, color = THEME.color, size = 16) {
    ['TL', 'TR', 'BL', 'BR'].forEach(pos => {
        const corner = document.createElement('div');
        const isTop = pos.includes('T');
        const isLeft = pos.includes('L');
        corner.style.cssText = `
            position: absolute;
            ${isTop ? 'top: 0' : 'bottom: 0'};
            ${isLeft ? 'left: 0' : 'right: 0'};
            width: ${size}px; height: ${size}px;
            border-${isTop ? 'top' : 'bottom'}: 1px solid ${color};
            border-${isLeft ? 'left' : 'right'}: 1px solid ${color};
            z-index: 10; pointer-events: none;
        `;
        container.appendChild(corner);
    });
};

dv.paragraph("");
```

```dataviewjs
// ==========================================
// LOG SOCIAL INTERACTION - ACTION CARD
// ==========================================

const THEME = window.SOCIAL_THEME;
const ACTIVITIES = window.SOCIAL_ACTIVITIES;
const LOG_FILE = window.SOCIAL_LOG_FILE;
const VAULT_NAME = window.VAULT_NAME;
const createCorners = window.createSocialCorners;

// ==========================================
// DATA MANAGEMENT
// ==========================================
async function getSocialLog() {
    const file = app.vault.getAbstractFileByPath(LOG_FILE);
    if (!file) return {
        totalInteractions: 0,
        weeklyGoal: 5,
        currentStreak: 0,
        longestStreak: 0,
        lastInteractionDate: null,
        entries: []
    };

    const cache = app.metadataCache.getFileCache(file);
    const fm = cache?.frontmatter || {};
    return {
        totalInteractions: fm.totalInteractions || 0,
        weeklyGoal: fm.weeklyGoal || 5,
        currentStreak: fm.currentStreak || 0,
        longestStreak: fm.longestStreak || 0,
        lastInteractionDate: fm.lastInteractionDate || null,
        entries: fm.entries || []
    };
}

async function saveSocialLog(data) {
    const content = `---
totalInteractions: ${data.totalInteractions}
weeklyGoal: ${data.weeklyGoal}
currentStreak: ${data.currentStreak}
longestStreak: ${data.longestStreak}
lastInteractionDate: "${data.lastInteractionDate || ''}"
entries: ${JSON.stringify(data.entries)}
cssclasses:
  - hide-properties
---

# Social Log

> Track your social connections and interactions.
> This file is auto-managed by the Social session.

Last updated: ${moment().format("YYYY-MM-DD HH:mm")}
`;

    const file = app.vault.getAbstractFileByPath(LOG_FILE);
    if (file) {
        await app.vault.modify(file, content);
    } else {
        const folder = LOG_FILE.substring(0, LOG_FILE.lastIndexOf('/'));
        if (!app.vault.getAbstractFileByPath(folder)) {
            await app.vault.createFolder(folder);
        }
        await app.vault.create(LOG_FILE, content);
    }
}

async function logInteraction(activityType, person, notes) {
    const log = await getSocialLog();
    const today = moment().format('YYYY-MM-DD');

    // Check streak
    const lastDate = log.lastInteractionDate ? moment(log.lastInteractionDate) : null;
    const daysSinceLast = lastDate ? moment().diff(lastDate, 'days') : null;

    let newStreak = log.currentStreak;
    if (daysSinceLast === null || daysSinceLast > 1) {
        newStreak = 1;
    } else if (daysSinceLast === 1) {
        newStreak = log.currentStreak + 1;
    }

    const entry = {
        id: Date.now(),
        timestamp: moment().format(),
        date: today,
        activityType,
        person,
        notes: notes || null
    };

    log.entries.unshift(entry);
    if (log.entries.length > 100) {
        log.entries = log.entries.slice(0, 100);
    }

    log.totalInteractions++;
    log.currentStreak = newStreak;
    log.longestStreak = Math.max(log.longestStreak, newStreak);
    log.lastInteractionDate = today;

    await saveSocialLog(log);
    return entry;
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

function createModal(title, contentBuilder) {
    if (activeModal) {
        activeModal.parentNode.removeChild(activeModal);
        activeModal = null;
    }

    const modal = document.createElement("div");
    modal.className = "social-modal-overlay";
    activeModal = modal;

    const modalContent = document.createElement("div");
    modalContent.className = "social-modal-content";
    modal.appendChild(modalContent);

    const scrollWrapper = document.createElement('div');
    scrollWrapper.style.cssText = 'overflow-y: auto; max-height: calc(85vh - 60px); display: flex; flex-direction: column; gap: 20px;';
    modalContent.appendChild(scrollWrapper);

    if (createCorners) createCorners(modalContent, THEME.color);

    if (title) {
        const modalTitle = document.createElement("h2");
        modalTitle.textContent = title;
        modalTitle.style.cssText = `
            margin: 0; color: ${THEME.color}; font-size: 14px; font-weight: 500;
            font-family: "Times New Roman", serif; letter-spacing: 3px;
            text-align: center; text-transform: uppercase; opacity: 0.8;
        `;
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
// LOG INTERACTION MODAL
// ==========================================
function openLogModal() {
    let selectedActivity = 'meetup';
    let personName = '';

    createModal("Log Interaction", (content) => {
        // Activity type selection
        const activityLabel = document.createElement('div');
        activityLabel.textContent = 'Activity Type';
        activityLabel.style.cssText = `color: ${THEME.colorMuted}; font-size: 11px; letter-spacing: 1px; text-transform: uppercase;`;
        content.appendChild(activityLabel);

        const activityGrid = document.createElement('div');
        activityGrid.style.cssText = 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;';
        content.appendChild(activityGrid);

        const activityBtns = [];

        Object.entries(ACTIVITIES).forEach(([key, config]) => {
            const btn = document.createElement('div');
            btn.className = 'social-activity-btn';
            btn.style.cssText = `
                display: flex; flex-direction: column; align-items: center; gap: 6px;
                padding: 14px 8px; background: #0f0f0f;
                border: 1px solid ${key === selectedActivity ? THEME.color : THEME.colorBorder};
                text-align: center;
            `;

            if (key === selectedActivity) btn.classList.add('selected');

            btn.innerHTML = `
                <span style="font-size: 24px;">${config.emoji}</span>
                <span style="font-size: 11px; color: ${THEME.colorMuted}; text-transform: uppercase; letter-spacing: 0.5px;">${config.label}</span>
            `;

            btn.onclick = () => {
                activityBtns.forEach(b => {
                    b.classList.remove('selected');
                    b.style.borderColor = THEME.colorBorder;
                });
                btn.classList.add('selected');
                btn.style.borderColor = THEME.color;
                selectedActivity = key;
            };

            activityGrid.appendChild(btn);
            activityBtns.push(btn);
        });

        // Person input
        const personLabel = document.createElement('div');
        personLabel.textContent = 'Who did you connect with?';
        personLabel.style.cssText = `color: ${THEME.colorMuted}; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; margin-top: 8px;`;
        content.appendChild(personLabel);

        const personInput = document.createElement('input');
        personInput.type = 'text';
        personInput.placeholder = 'Name or group...';
        personInput.style.cssText = `
            width: 100%; padding: 14px; background: #0f0f0f;
            border: 1px solid ${THEME.colorBorder}; color: ${THEME.color};
            font-size: 14px; font-family: Georgia, serif; box-sizing: border-box;
        `;
        personInput.oninput = () => { personName = personInput.value; };
        content.appendChild(personInput);

        // Notes
        const notesLabel = document.createElement('div');
        notesLabel.textContent = 'Notes (optional)';
        notesLabel.style.cssText = `color: ${THEME.colorMuted}; font-size: 11px; letter-spacing: 1px; text-transform: uppercase;`;
        content.appendChild(notesLabel);

        const notesInput = document.createElement('textarea');
        notesInput.placeholder = 'What did you talk about? How did it go?';
        notesInput.style.cssText = `
            width: 100%; height: 80px; padding: 12px; background: #0f0f0f;
            border: 1px solid ${THEME.colorBorder}; color: ${THEME.color};
            font-size: 13px; font-family: Georgia, serif; resize: none; box-sizing: border-box;
        `;
        content.appendChild(notesInput);

        // Submit button
        const submitBtn = document.createElement('button');
        submitBtn.textContent = "LOG INTERACTION";
        submitBtn.style.cssText = `
            width: 100%; padding: 16px; background: ${THEME.color}; border: none;
            color: #0a0a0a; font-size: 14px; font-weight: 700; letter-spacing: 2px;
            cursor: pointer; transition: all 0.3s ease;
        `;
        submitBtn.onmouseover = () => { submitBtn.style.background = THEME.colorHover; };
        submitBtn.onmouseout = () => { submitBtn.style.background = THEME.color; };
        submitBtn.onclick = async () => {
            if (!personName.trim()) {
                new Notice('Please enter who you connected with');
                return;
            }

            await logInteraction(selectedActivity, personName.trim(), notesInput.value.trim());
            closeModal();
            new Notice(`Logged: ${ACTIVITIES[selectedActivity].emoji} ${personName}`);
            setTimeout(() => app.workspace.trigger('dataview:refresh-views'), 300);
        };
        content.appendChild(submitBtn);
    });
}

// ==========================================
// RENDER ACTION CARD
// ==========================================
const container = dv.el("div", "");
container.style.cssText = `max-width: 460px; margin: 20px auto; padding: 0;`;

const card = document.createElement('div');
card.style.cssText = `
    border: 1px solid ${THEME.colorBorder}; background: #0a0a0a;
    position: relative; overflow: visible; animation: social-breathe 8s ease-in-out infinite;
`;
container.appendChild(card);

if (createCorners) createCorners(card, THEME.color);

// Header
const headerSection = document.createElement('div');
headerSection.style.cssText = `
    padding: 24px 28px 20px 28px;
    background: linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 100%);
    border-bottom: 1px solid ${THEME.colorBorder};
`;
card.appendChild(headerSection);

const header = document.createElement('h3');
header.textContent = "Social";
header.style.cssText = `
    margin: 0 0 8px 0; color: ${THEME.color}; font-size: 13px; font-weight: 500;
    font-family: "Times New Roman", serif; letter-spacing: 3px; text-transform: uppercase; opacity: 0.7;
`;
headerSection.appendChild(header);

const desc = document.createElement('p');
desc.textContent = "Track your social connections";
desc.style.cssText = `
    margin: 0; color: ${THEME.colorMuted}; font-size: 14px; line-height: 1.4;
    font-family: "Georgia", serif; font-style: italic;
`;
headerSection.appendChild(desc);

// Log button
const buttonsSection = document.createElement('div');
buttonsSection.style.cssText = `padding: 20px; display: flex; flex-direction: column; gap: 12px;`;
card.appendChild(buttonsSection);

const logBtn = document.createElement('button');
logBtn.innerHTML = `<span style="margin-right: 8px;">🤝</span> Log Interaction`;
logBtn.style.cssText = `
    width: 100%; padding: 18px 24px; background: ${THEME.color}; border: none;
    color: #0a0a0a; font-size: 14px; font-weight: 600; letter-spacing: 1px;
    cursor: pointer; transition: all 0.3s ease; text-align: center;
`;
logBtn.onmouseover = () => { logBtn.style.background = THEME.colorHover; logBtn.style.transform = 'translateY(-2px)'; };
logBtn.onmouseout = () => { logBtn.style.background = THEME.color; logBtn.style.transform = 'translateY(0)'; };
logBtn.onclick = openLogModal;
buttonsSection.appendChild(logBtn);
```

```dataviewjs
// ==========================================
// SOCIAL STATS CARD
// ==========================================

const THEME = window.SOCIAL_THEME;
const LOG_FILE = window.SOCIAL_LOG_FILE;
const createCorners = window.createSocialCorners;

async function getStats() {
    const file = app.vault.getAbstractFileByPath(LOG_FILE);
    if (!file) return null;
    const cache = app.metadataCache.getFileCache(file);
    return cache?.frontmatter || null;
}

function getThisWeekCount(entries) {
    const weekStart = moment().startOf('week');
    return (entries || []).filter(e => moment(e.timestamp).isAfter(weekStart)).length;
}

const container = dv.el("div", "");
container.style.cssText = `max-width: 460px; margin: 20px auto; padding: 0;`;

const card = document.createElement('div');
card.style.cssText = `
    border: 1px solid ${THEME.colorBorder}; background: #0a0a0a;
    position: relative; overflow: visible;
`;
container.appendChild(card);

if (createCorners) createCorners(card, THEME.color);

// Header
const headerSection = document.createElement('div');
headerSection.style.cssText = `
    padding: 24px 28px 20px 28px;
    background: linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 100%);
    border-bottom: 1px solid ${THEME.colorBorder};
`;
card.appendChild(headerSection);

const header = document.createElement('h3');
header.textContent = "Statistics";
header.style.cssText = `
    margin: 0 0 8px 0; color: ${THEME.color}; font-size: 13px; font-weight: 500;
    font-family: "Times New Roman", serif; letter-spacing: 3px; text-transform: uppercase; opacity: 0.7;
`;
headerSection.appendChild(header);

// Stats grid
const statsSection = document.createElement('div');
statsSection.style.cssText = `padding: 20px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;`;
card.appendChild(statsSection);

// Render stats
getStats().then(stats => {
    const data = stats || { totalInteractions: 0, currentStreak: 0, longestStreak: 0, entries: [] };
    const thisWeek = getThisWeekCount(data.entries);

    const statItems = [
        { label: "This Week", value: thisWeek, icon: "📅", color: THEME.color },
        { label: "Total", value: data.totalInteractions || 0, icon: "🤝", color: THEME.colorAccent },
        { label: "Streak", value: `${data.currentStreak || 0} days`, icon: "🔥", color: THEME.colorWarm },
        { label: "Best Streak", value: `${data.longestStreak || 0} days`, icon: "⭐", color: THEME.colorCool }
    ];

    statItems.forEach(item => {
        const statCard = document.createElement('div');
        statCard.style.cssText = `
            padding: 16px; background: #0f0f0f; border: 1px solid ${THEME.colorBorder};
            text-align: center; transition: all 0.3s ease;
        `;

        statCard.onmouseenter = () => { statCard.style.borderColor = item.color; statCard.style.transform = 'translateY(-2px)'; };
        statCard.onmouseleave = () => { statCard.style.borderColor = THEME.colorBorder; statCard.style.transform = 'translateY(0)'; };

        const icon = document.createElement('div');
        icon.textContent = item.icon;
        icon.style.cssText = `font-size: 20px; margin-bottom: 8px;`;
        statCard.appendChild(icon);

        const value = document.createElement('div');
        value.textContent = item.value;
        value.style.cssText = `color: ${item.color}; font-size: 18px; font-weight: 600; font-family: "Courier New", monospace;`;
        statCard.appendChild(value);

        const label = document.createElement('div');
        label.textContent = item.label;
        label.style.cssText = `color: ${THEME.colorMuted}; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; margin-top: 4px;`;
        statCard.appendChild(label);

        statsSection.appendChild(statCard);
    });
});
```

```dataviewjs
// ==========================================
// RECENT INTERACTIONS - TIMELINE
// ==========================================

const THEME = window.SOCIAL_THEME;
const ACTIVITIES = window.SOCIAL_ACTIVITIES;
const LOG_FILE = window.SOCIAL_LOG_FILE;
const createCorners = window.createSocialCorners;

async function getRecentEntries() {
    const file = app.vault.getAbstractFileByPath(LOG_FILE);
    if (!file) return [];
    const cache = app.metadataCache.getFileCache(file);
    const fm = cache?.frontmatter || {};
    return (fm.entries || []).slice(0, 5);
}

const container = dv.el("div", "");
container.style.cssText = `max-width: 460px; margin: 20px auto; padding: 0;`;

const card = document.createElement('div');
card.style.cssText = `
    border: 1px solid ${THEME.colorBorder}; background: #0a0a0a;
    position: relative; overflow: visible;
`;
container.appendChild(card);

if (createCorners) createCorners(card, THEME.color);

// Header
const headerSection = document.createElement('div');
headerSection.style.cssText = `
    padding: 24px 28px 20px 28px;
    background: linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 100%);
    border-bottom: 1px solid ${THEME.colorBorder};
`;
card.appendChild(headerSection);

const header = document.createElement('h3');
header.textContent = "Recent";
header.style.cssText = `
    margin: 0 0 8px 0; color: ${THEME.color}; font-size: 13px; font-weight: 500;
    font-family: "Times New Roman", serif; letter-spacing: 3px; text-transform: uppercase; opacity: 0.7;
`;
headerSection.appendChild(header);

const desc = document.createElement('p');
desc.textContent = "Latest social interactions";
desc.style.cssText = `
    margin: 0; color: ${THEME.colorMuted}; font-size: 14px; line-height: 1.4;
    font-family: "Georgia", serif; font-style: italic;
`;
headerSection.appendChild(desc);

// Timeline section
const timelineSection = document.createElement('div');
timelineSection.style.cssText = `padding: 16px 20px;`;
card.appendChild(timelineSection);

// Render entries
getRecentEntries().then(entries => {
    if (entries.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.style.cssText = `text-align: center; padding: 32px 20px; color: ${THEME.colorMuted};`;
        emptyMsg.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 12px; opacity: 0.3;">🤝</div>
            <div style="font-family: Georgia, serif; font-style: italic; font-size: 13px;">No interactions logged yet</div>
            <div style="font-family: 'Courier New', monospace; font-size: 10px; letter-spacing: 1px; margin-top: 8px; opacity: 0.5;">LOG YOUR FIRST CONNECTION</div>
        `;
        timelineSection.appendChild(emptyMsg);
        return;
    }

    entries.forEach((entry, index) => {
        const item = document.createElement('div');
        item.style.cssText = `
            display: flex; align-items: flex-start; gap: 16px;
            padding: 14px 16px; margin-bottom: ${index < entries.length - 1 ? '8px' : '0'};
            background: #0f0f0f; border: 1px solid ${THEME.colorBorder};
            transition: all 0.3s ease;
        `;

        item.onmouseenter = () => { item.style.borderColor = THEME.color; item.style.background = '#121210'; };
        item.onmouseleave = () => { item.style.borderColor = THEME.colorBorder; item.style.background = '#0f0f0f'; };

        // Activity emoji
        const emojiCol = document.createElement('div');
        emojiCol.style.cssText = `font-size: 24px; min-width: 36px; text-align: center;`;
        emojiCol.textContent = ACTIVITIES[entry.activityType]?.emoji || '💬';
        item.appendChild(emojiCol);

        // Content
        const contentCol = document.createElement('div');
        contentCol.style.cssText = `flex: 1; min-width: 0;`;

        const personName = document.createElement('div');
        personName.textContent = entry.person || 'Someone';
        personName.style.cssText = `
            color: ${THEME.color}; font-size: 14px; font-family: "Times New Roman", serif;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px;
        `;
        contentCol.appendChild(personName);

        const meta = document.createElement('div');
        const entryDate = moment(entry.timestamp || entry.date);
        meta.textContent = `${ACTIVITIES[entry.activityType]?.label || 'Chat'} · ${entryDate.fromNow()}`;
        meta.style.cssText = `color: ${THEME.colorMuted}; font-size: 11px;`;
        contentCol.appendChild(meta);

        if (entry.notes) {
            const notes = document.createElement('div');
            notes.textContent = entry.notes;
            notes.style.cssText = `
                margin-top: 8px; padding: 8px 10px;
                background: rgba(201, 164, 86, 0.05); border-left: 2px solid ${THEME.colorBorder};
                color: ${THEME.colorMuted}; font-size: 12px; font-family: Georgia, serif;
                font-style: italic; line-height: 1.4; overflow: hidden;
                text-overflow: ellipsis; white-space: nowrap;
            `;
            contentCol.appendChild(notes);
        }

        item.appendChild(contentCol);
        timelineSection.appendChild(item);
    });
});
```

<div style="height: 40px;"></div>
