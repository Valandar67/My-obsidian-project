# MORPHEUS — Unified Obsidian Mobile Plugin Prompt

## Vision

Build a single, self-contained Obsidian plugin called **Morpheus** that replaces the current fragmented system (separate `Home.md` dataviewjs, `Drawing hub.md`, `Drawing Session.md`, and the `TrackHabitRank` main.js plugin) into **one cohesive app-like experience** on Obsidian Mobile.

Morpheus is a mythological life-operating system. It is your personal oracle — part habit tracker, part day planner, part progress dashboard, part session manager for creative activities. It should feel like opening a premium native app, not browsing a note.

---

## I. Architecture

### Single Plugin, Multiple Views

The plugin registers **one Obsidian `ItemView`** as its main interface (the "Morpheus Dashboard"), opened via a ribbon icon or command. All primary UI is rendered programmatically in TypeScript/JS. Markdown files are used as data storage (session logs, daily notes, skill trees).

**Two access modes:**
- **Mode A: Standalone App** — Open the full Morpheus Dashboard via ribbon icon or command palette. This is the primary experience.
- **Mode B: Embedded Widget** — For users who want to keep their `Home.md` as their entry point, Morpheus provides a lightweight **codeblock widget** (e.g., `` ```morpheus-dashboard``` ``) that renders a compact version of the dashboard directly inside any `.md` page. This lets users embed Morpheus into their existing homepage without abandoning it. The widget shows the Hero Greeting, Directive Card, and Day Map summary; tapping any section opens the full Morpheus `ItemView` for that context.

```
morpheus-plugin/
├── main.ts              → Plugin entry point, registers views + commands
├── views/
│   ├── DashboardView.ts → Main scrollable home (the "app")
│   ├── SessionView.ts   → Active session screen (drawing, workout, etc.)
│   └── OnboardingView.ts→ First-launch setup flow
├── engines/
│   ├── MorpheusEngine.ts→ Priority logic, day-map generation, suggestions
│   ├── BossEngine.ts    → Boss HP, tiers, Tartarus, damage calculations
│   ├── RewardEngine.ts  → Reward pools, claiming, banking
│   └── CalendarEngine.ts→ Calendar integration (read/write daily tasks)
├── components/
│   ├── HeroCard.ts      → "Good evening, Valantis" greeting with blur bg
│   ├── DayTimeline.ts   → Vertical colored timeline of the day's plan
│   ├── StatsRow.ts      → Objectives / Streak / Consistency trio
│   ├── WeeklyRhythm.ts  → Weekly bar chart + trend line
│   ├── ActivityGrid.ts  → Grid of activity cards (like Purposa "Tools")
│   ├── EudaimoniaBar.ts → XP progress bar with rank title
│   ├── RadarChart.ts    → Canvas-drawn activity balance radar
│   ├── SessionCard.ts   → Photo collage of recent sessions
│   └── QuoteFooter.ts   → Rotating stoic quote at bottom
├── modals/
│   ├── MorpheusDirectiveCard.ts  → "The Directive" dashboard card (expands to full-screen on tap)
│   ├── LogModal.ts      → Discipline/Flow/Skip logging
│   ├── SkillPickerModal.ts → Add skills to a session
│   └── TaskModal.ts     → Add/edit/reschedule a task
├── settings/
│   └── MorpheusSettings.ts → Unified settings tab
├── data/
│   ├── bosses.ts        → Boss definitions (13 tiers)
│   ├── defaultActivities.ts → Pre-built activity catalog (Body / Mind / Spirit)
│   ├── titles.ts        → Dynamic title definitions (Body/Mind/Spirit combinations × tiers)
│   └── themes.ts        → Theme definitions
└── styles.css           → Global plugin styles
```

### Data Model

All state lives in `plugin.settings` (persisted via Obsidian's `saveData`). Session files remain as markdown notes in the vault (they are the user's creative output). The plugin reads/writes these vault files for session tracking.

---

## II. Design Language — "Elysian Dark"

### Unified Theme

Resolve the current 3-way color clash (green Home / red-gold plugin / gray Drawing) into a **single warm-dark aesthetic** inspired by the Stoica/Eudaimonia app screenshots:

**Background**: Deep warm black with subtle noise texture — `#0c0a09` base, never pure `#000`
**Cards**: Frosted glass effect — `rgba(20, 18, 16, 0.85)` with `backdrop-filter: blur(40px)`, no solid borders
**Primary text**: Warm white — `#f5f0e8`
**Secondary text**: Muted gold — `#928d85`
**Accent (interactive/highlight)**: Burnished gold — `#c9a84c`
**Danger/Tartarus**: Deep crimson — `#8b2d35`
**Success/streak**: Amber flame — `#d4940a`
**Activity colors**: Each activity category gets a signature color (see §IV)

### Typography

- **Display/Greeting**: A serif face for the large "Good evening, Valantis" — use `"Playfair Display", "Georgia", serif` at 32-40px, light weight
- **Headings**: `"Times New Roman", serif` — small caps, letter-spacing 3px, uppercase, 11-13px — for labels like "THE DIRECTIVE", "WEEKLY RHYTHM"
- **Body**: `"Georgia", serif` — 14px, italic for descriptions, regular for data
- **Data/Numbers**: `"SF Mono", "Courier New", monospace` — for stats, timers, HP values

### Key Visual Elements

1. **Hero Background**: A user-selectable blurred image (from vault) covering the top ~40% of the dashboard, with heavy vignette (`radial-gradient`) and dark overlay. The greeting text floats over it. Exactly like the "Good evening, Marcus" screenshot.

2. **Decorative Corners**: Keep your existing corner motif but use it sparingly — only on the main hero card and the Morpheus directive card. Gold (`#c9a84c`) lines, 16px.

3. **No borders**: Cards rely entirely on the frosted glass effect — no solid borders of any kind. Separation is achieved through spacing and subtle gradient dividers: `linear-gradient(90deg, transparent, rgba(201, 168, 76, 0.3), transparent)`.

4. **Glow indicators**: Active streaks, boss damage, and urgency states use subtle box-shadows: `box-shadow: 0 0 20px rgba(201, 168, 76, 0.15)`.

5. **Motion**: Staggered fade-in on load (each card delays +80ms). Smooth transitions on all interactive elements (0.3s ease). No janky reflows.

---

## III. Onboarding — First Launch

When the plugin detects no saved activities (first install), it shows a full-screen onboarding flow instead of the dashboard:

### Screen 1: "Who Are You Becoming?"

Inspired by the "Goals" app screenshot. Dark background, centered text:

> **"Who are you becoming?"**
> *Personalized growth based on who you're building — not generic checklists.*

Below, a **"My Why"** card — a gold-bordered text input where the user writes their core motivation. This gets saved and shown periodically on the dashboard.

### Screen 2: Choose Your Domains

Present 3 **root categories** as large tappable cards with icons. These are the fundamental pillars of growth — the user toggles ON the ones they identify with. Each category has pre-built activities, and users can add custom activities to any category:

| Category | Icon | Color | Pre-built Activities |
|----------|------|-------|---------------------|
| **Body** | ⚔️ | `#c9a84c` gold | Workout, Cardio, Stretching, Sports, Dance, Martial Arts |
| **Mind** | 📜 | `#6b8cce` blue | Reading, Study, Language, Writing, Drawing, Music, Photography, Coding |
| **Spirit** | 🏛️ | `#8b7ec8` purple | Meditation, Journaling, Philosophy, Prayer, Social, Family, Volunteering |

The user's **dynamic title** on the dashboard is generated based on which categories they use and how much activity they have in each. Titles reflect the user's actual engagement pattern, not just a static choice.

**Title generation logic:**

The system calculates each category's **weight** (percentage of total activity completions). A category is "dominant" if it holds ≥ 40% of total activity, "present" if ≥ 15%, and "minor" if < 15%.

**Single-category dominant titles (one category ≥ 70%):**
| Dominant | Light (< 50 sessions) | Mid (50-200) | Heavy (200+) |
|----------|----------------------|--------------|--------------|
| Body | Athlete | Warrior | Titan |
| Mind | Student | Scholar | Polymath |
| Spirit | Seeker | Sage | Oracle |

**Two-category combination titles (two categories each ≥ 30%):**
| Combination | Light | Mid | Heavy |
|-------------|-------|-----|-------|
| Body + Mind | Disciplined Thinker | Philosopher-King | Renaissance Titan |
| Body + Spirit | Ascetic | Templar | Olympian Monk |
| Mind + Spirit | Contemplative | Mystic Scholar | Enlightened One |

**Balanced titles (all three categories ≥ 25%):**
| Light | Mid | Heavy |
|-------|-----|-------|
| Initiate of Balance | Renaissance Soul | Eudaimon |

These title tables are the defaults. Users can override their title in Settings if desired.

### Screen 3: Pick Activities

Within each chosen category, show the pre-built activities as toggle chips. The user can also **add custom activities** with a name, folder path, property name, weekly target, and category assignment.

### Screen 4: Set Your Rhythm

For each chosen activity, set:
- **Weekly target** (1-7 days)
- **Preferred time** (Morning / Afternoon / Evening / Anytime)
- **Neglect threshold** (days before Morpheus warns — default 3)
- **Priority level** (1-10 scale, labeled: 1-3 = Foundation, 4-6 = Growth, 7-10 = Aspiration)
- **Has sessions?** (toggle — if yes, this activity opens a session view like Drawing currently does)

### Screen 5: Ready

> **"The Oracle awakens."**
> *Morpheus will guide your days. Trust the process.*

CTA button: **"Enter the Arena"** → Opens the dashboard.

---

## IV. The Dashboard — Main View

A single vertical scroll view. The user opens the plugin and sees this. It should feel like opening the Stoica/Eudaimonia app.

### Section 1: Hero Greeting

Full-width, ~350px tall. User's chosen background image with heavy blur + dark vignette overlay.

Centered text:
```
Good evening, Valantis.
```
(Time-appropriate greeting — morning/afternoon/evening/night)

Below the greeting, a subtitle pulled from context:
- If streak is active: *"12 days strong. Keep the flame."*
- If Tartarus: *"The underworld awaits your penance."*
- If boss nearly dead: *"One final blow remains."*
- Default: *"Step by step, you shape your path."*

### Section 2: Identity & Eudaimonia Bar

Inspired directly by the Stoica screenshot. A frosted glass card showing:

**Top row**: The user's active categories with level progress:
```
⚔️ Body       📜 Mind       🏛️ Spirit
lv 4  62/100   lv 2  34/100   lv 7  89/100
```
Category XP is earned by completing activities in that category. Every 100 XP = 1 level.

**Dynamic title**: Below the categories, the user's current title is displayed (e.g., "Philosopher-King" for a Body+Mind user). The title updates automatically as activity distribution shifts over time.

**Middle row**: Three stat pills:
```
⊙ 347 tasks completed    🔥 12 day streak    📅 56 days of presence
```

**Bottom**: Two buttons — `Your Progress` | `Reflect` (Reflect opens a journaling prompt or daily note)

**Eudaimonia Index**: A horizontal XP bar spanning the card width. The "Eudaimonia Index" is the overall level calculated from all category levels combined. Roman numeral suffix (Eudaimonia Index XXI). Progress toward next **chapter** (every 10 levels = 1 chapter). Chapters have themed names (see §VIII).

### Section 3: The Day Map (Morpheus Timeline)

**This is the core daily planning feature.** Inspired by the "Your day at a glance" screenshot.

A vertical timeline with colored blocks showing the day's planned activities. Each block shows:
- Colored bar on the left (activity category color)
- Activity icon
- Activity name + time range + duration
- Checkbox (done/not done)
- Current time indicator (red horizontal line with timestamp)

**How the Day Map is built:**

1. Morpheus Engine runs at plugin load and generates a suggested schedule based on:
   - **Time-based overrides** (Workout always 6-9am)
   - **Priority + neglect** (highest priority neglected activities placed first)
   - **Blocking rules** (if Activity A blocks B, B doesn't appear until A is done)
   - **Chains** (B only appears after A is completed today)
   - **Alternating rules** (if Workout was done yesterday, suggest Cardio)
   - **Calendar tasks** (imported from Obsidian's Daily Notes or a calendar plugin)
   - **User's preferred times** per activity
2. The user sees the suggested day and can:
   - **Accept** an activity → opens the session view or marks as done
   - **Skip** → moves to "skipped" state, Morpheus adjusts
   - **Reschedule** → drag/tap to move to another time slot or another day
   - **Add task** → opens a quick-add modal (title, time, duration)
3. **Midday check-in**: If the user opens the dashboard midday, they see what's done (strikethrough + checkmark), what's current (highlighted), and what's upcoming (dimmed).

**At the bottom of the timeline:**
```
End of day: 6 hrs, 23 min remaining
[+ Create event]
```

### Section 4: Morpheus Directive Card

A standout card (with decorative corners) showing the **current top suggestion** from the Morpheus Engine. It lives on the dashboard as a **compact persistent card**, always visible. Tapping it expands into a **full-screen view** with the full lore text, motivational quote, and action buttons.

**Compact state** (on dashboard):
```
┌─────────────────────────────────────┐
│  THE DIRECTIVE              🟠      │
│  DRAWING — 4 days neglected         │
│  [BEGIN SESSION]     [NOT NOW]      │
└─────────────────────────────────────┘
```

**Expanded state** (full-screen, on tap):
```
┌─────────────────────────────────────┐
│  THE DIRECTIVE                      │
│                                     │
│  DRAWING                            │
│  4 days since you last practiced.   │
│  The skill atrophies.               │
│                                     │
│  "The beast within you grows weak   │
│   without the discipline of line    │
│   and form."                        │
│                                     │
│  [BEGIN SESSION]     [NOT NOW]      │
└─────────────────────────────────────┘
```

**BEGIN SESSION** opens the Session View for that activity.
**NOT NOW** dismisses and shows the next suggestion.

Priority badge in the corner: 🔴 Death / 🟡 Boss / 🟠 Neglect / 🔵 Weekly / ⚪ Streak

### Section 5: Boss Status

Compact horizontal card:
```
⚔️ Hydra of Habits — 23/45 HP (51%)
   ████████████░░░░░░░░░  Tier 3 · Apprentice
```

Tap to expand into the full boss view with lore, tier figure image, and damage history. If in Tartarus, this card turns crimson with a pulsing border.

### Section 6: Weekly Rhythm

Inspired by the study dashboard screenshot. A frosted glass card with:

**Top stat row**: 4 horizontal pills
```
📖 Active hours: 14.2h | ☕ Break time: 2.1h | ⚡ Active days: 5/7 | 📈 Best day: Tue
```

**Bar chart**: 7 vertical bars (Mon-Sun) showing total activity time per day. Color-coded by activity category (stacked bars). Current day highlighted.

**Trend line**: Overlaid line showing hours trend across the week.

### Section 7: Activity Grid

A 2-column grid of activity cards — one for each active activity. Inspired by Purposa's "Tools" grid.

Each card shows:
- Activity icon + name
- Category color accent
- Last done indicator (green dot = today, yellow = yesterday, red = 3+ days)
- Weekly progress ring (3/5 sessions this week)
- Tap to open the activity's hub view (session history, skill tree, stats)

### Section 8: Monthly Overview

Calendar heatmap (like the study dashboard screenshot):
- Grid of days for the current month
- Each day colored by intensity (0 = gray, light activity = pale blue, heavy = deep blue/gold)
- Tap a day to see breakdown: study time, breaks, focus score, sessions completed

**Below the calendar**: `Best day: — | Average: — | Total: —`

**Tab switcher**: `Hours` | `Productivity` | `Mood`

### Section 9: Recent Sessions Collage

Keep your existing scattered photo collage concept from Drawing hub but generalize it to all session-based activities. Show the last 5 sessions as tilted photo cards with date stamps. Tap to open the session note.

### Section 10: Stoic Quote Footer

A centered, italicized quote from the user's Quotes folder. Rotates each time the dashboard loads.

```
"You have power over your mind — not outside events.
 Realize this, and you will find strength."
                                    — Marcus Aurelius
```

---

## V. The Session View

When a user taps "BEGIN SESSION" on any session-based activity (Drawing, Music, etc.), the plugin opens a dedicated **Session View** that replaces the dashboard.

### Session Screen Layout

**Top bar**: Activity name + elapsed timer + [FINISH] button

**Middle**: The session content area — this is where the user works. For drawing, it shows:
- The skill picker (current session's tagged skills)
- [Add Skills] button → opens the skill constellation picker (keep existing constellation UI but in-plugin)
- Reference images or notes (if the user has linked any)

**Bottom bar**: Session type indicator (Discipline ◆ / Flow ≈) + duration

### Finishing a Session

Tapping [FINISH] opens a modal:
1. **How did it feel?** → Three options: Discipline (◆), Flow (≈), Skipped (○)
2. Saves an aphorism to the session note
3. Updates the activity's frontmatter (property: true, type, timestamp, duration, endTime)
4. Creates the session markdown file in the vault (same folder structure as current: `Home/Starts/{Activity}/Sessions/Session {date} {time}.md`)
5. Returns to the dashboard with the activity marked done on the Day Map

---

## VI. Morpheus Engine — Priority & Scheduling Logic

### Configuration Schema

Each activity has these configurable rules (editable in Settings):

```typescript
interface ActivityConfig {
  id: string;
  name: string;
  category: "body" | "mind" | "spirit";
  enabled: boolean;
  
  // Tracking
  folder: string;              // Vault folder with YYYY-MM-DD notes
  property: string;            // Frontmatter property to check
  damagePerCompletion: number; // Boss HP damage
  weeklyTarget: number;        // Sessions per week
  trackingMode: "daily" | "weekly";
  hasSession: boolean;         // Opens session view vs. just logs
  sessionFolder?: string;      // Where session notes are created
  skillFolder?: string;        // For skill tree (if applicable)
  
  // Priority
  priority: number;            // 1-10 (10 = highest)
  neglectThreshold: number;    // Days before warning (default: 3)
  
  // Scheduling
  preferredTime: "morning" | "afternoon" | "evening" | "anytime";
  timeOverride?: {             // Force-suggest during these hours
    startHour: number;
    endHour: number;
  };
  estimatedDuration: number;   // Minutes per session
  
  // Advanced Rules
  blocks?: string[];           // Activity IDs this blocks when neglected
  alternatesWith?: string;     // Activity ID to alternate with
  chainAfter?: string;         // Only suggest after this activity is done today
}
```

### Suggestion Algorithm (Enhanced)

The engine runs this waterfall, now priority-aware:

```
1. DEATH CHECK
   → In Tartarus? → Suggest "Escape Tartarus"
   → Below death threshold for 2+ days? → Suggest highest-priority neglected activity

2. BOSS FINISH
   → Boss HP < 15%? → Suggest the activity with highest damage potential

3. NEGLECT + PRIORITY (NEW)
   → Find all activities where daysSinceLastDone >= that activity's neglectThreshold
   → Sort by priority (highest first)
   → Check blocking rules: if the top activity blocks others, filter those out
   → Check alternating rules: if top activity was done yesterday and has an alternate, suggest alternate
   → Return the highest-priority neglected activity

4. WEEKLY CATCH-UP
   → Find activities behind on weekly target where (remaining sessions > remaining days)
   → Sort by priority
   → Return highest priority behind-schedule activity

5. CHAIN CHECK (NEW)
   → If any activity has chainAfter and that prerequisite was done today, suggest it

6. TIME-BASED
   → Check timeOverrides: any activity with a forced time window matching now?
   → Check preferredTime: suggest activities tagged for this time of day
   → Sort by priority

7. BALANCED FALLBACK
   → Suggest the activity with the longest gap since last completion
```

### Day Map Generation

The Day Map is generated once per day (or on manual refresh) by the engine:

```
1. Collect all enabled activities with their preferredTime + timeOverride + estimatedDuration
2. Build time slots: Morning (6-12), Afternoon (12-18), Evening (18-23)
3. Place time-override activities first (fixed slots)
4. Place neglected activities in their preferred time slots, sorted by priority
5. Place remaining weekly-target activities to fill gaps
6. Import calendar tasks/events from Daily Notes or calendar plugin
7. Leave buffer time between activities (15 min default)
8. Present as the vertical timeline
```

---

## VII. Calendar Integration

Morpheus integrates with the user's existing task/calendar workflow:

### Option A: Daily Notes Integration
- Read tasks from the user's Daily Note (`YYYY-MM-DD.md`) in a configured folder
- Parse `- [ ] Task name @time` format
- Display these as events on the Day Map
- When user checks off a task on the Day Map, Morpheus writes the completion back to the daily note

### Option B: Tasks Plugin Integration
- If the Tasks plugin is installed, read tasks with due dates
- Display on Day Map
- Support "postpone to tomorrow" (updates the due date)

### Option C: Built-in Quick Tasks
- Morpheus has its own simple task system stored in settings
- Tasks have: title, date, time, duration, done status
- UI for quick-add, drag to reschedule, postpone to tomorrow
- These appear on the Day Map alongside Morpheus's activity suggestions

All three options can coexist. The Day Map merges them into one unified timeline.

---

## VIII. Progress & Analytics

### The Eudaimonia Index

A composite score calculated from:
```
Eudaimonia Index = sum of all category levels
Category Level = floor(categoryXP / 100)
Category XP = (completions in that category × 10) + (streak bonus) + (discipline bonus)
```

Displayed as: **"Chapter II: Explorer · Eudaimonia Index XXI"** (chapter title changes every 10 levels)

Chapter progression:
```
Chapter I   (1-10):   Initiate
Chapter II  (11-20):  Explorer
Chapter III (21-30):  Journeyman
Chapter IV  (31-40):  Adept
Chapter V   (41-50):  Philosopher
Chapter VI  (51-60):  Master
Chapter VII (61-70):  Sage
Chapter VIII(71-80):  Oracle
Chapter IX  (81-90):  Titan
Chapter X   (91-100): Olympian
```

### Progress View (Tab within Dashboard or separate scrollable section)

Accessible via a `D | W | M | Y` tab switcher (like Purposa):

- **Daily**: Today's stats — time per activity, focus score, sessions completed
- **Weekly**: Bar chart of daily totals, streak indicator, best day, comparison to last week
- **Monthly**: Calendar heatmap, total hours, total sessions, avg daily, best day
- **Yearly**: Month-by-month trend line, total stats, category distribution pie chart

### Metrics Tracked

Per activity per day:
- Completed (boolean)
- Session duration (if applicable)
- Session type (discipline/flow/skipped)
- Skills practiced (if applicable)

Aggregated:
- Total sessions, total hours
- Current streak, longest streak
- Days of presence (any activity done)
- Focus score: sessions completed / sessions planned (from Day Map)
- Consistency: days active / days in period

---

## IX. Reward System

Keep the existing tiered reward system (micro/mini/standard/quality/premium) but display rewards as a gallery within the dashboard rather than a separate modal. Show pending unclaimed rewards as a pulsing notification badge on the dashboard.

---

## X. The Temple (Self-Care Tracker)

Keep the existing temple tasks (Bathing, Facial Hair, Nails, Haircut) as a small collapsible section on the dashboard. Show them as icon + "due in X days" chips.

---

## XI. Settings

A single settings tab with collapsible sections:

1. **Profile**: Name, "My Why", background image, theme color override
2. **Activities**: Add/edit/remove activities, set all config fields from §VI
3. **Categories**: Assign colors to Body / Mind / Spirit, override dynamic title
4. **Morpheus Rules**: Global neglect threshold, blocking rules, chains, alternates
5. **Boss Progression**: Current tier, HP scaling, custom boss names/lore/images
6. **Rewards**: Edit reward pools
7. **Calendar**: Choose integration mode (Daily Notes / Tasks plugin / Built-in)
8. **Temple**: Edit self-care tasks + intervals
9. **Advanced**: Simulated date, pause system, data export, developer dashboard

---

## XII. Mobile-First Design Rules

Since this is primarily used on Obsidian Mobile:

1. **All touch targets ≥ 44px** — buttons, cards, chips
2. **No hover-only interactions** — everything works on tap
3. **Swipe gestures**: Swipe left on a Day Map item to skip, swipe right to complete
4. **Bottom-sheet modals** — modals slide up from bottom, not center popups (better for thumb reach)
5. **Pull to refresh** — pull down on dashboard to regenerate Day Map
6. **Scroll performance** — minimize DOM nodes, use virtual scrolling for long lists
7. **Offline-first** — everything works without network (it's a vault plugin)
8. **Safe area padding** — respect mobile notch/home indicator
9. **Haptic-ready** — structure interactions so haptic feedback can be added via mobile APIs

---

## XIII. Contradictions Resolved

| Previous Contradiction | Resolution |
|---|---|
| **3 different color palettes** (green, red-gold, gray) | One unified "Elysian Dark" palette: warm blacks + burnished gold + category accent colors |
| **Home.md is a markdown file with dataviewjs** | Dashboard is a plugin `ItemView` (Mode A). Users can also keep `Home.md` as their entry point via an embedded Morpheus codeblock widget (Mode B) |
| **Drawing is a separate set of .md files** | Drawing becomes one activity within Morpheus. Session creation/tracking is handled by the plugin. Skill tree is rendered in-plugin. |
| **Morpheus is only a command/modal** | Morpheus is the entire app. The Directive is a persistent compact card on the dashboard that expands to full-screen on tap — both a card and a detail view, never a disruptive popup |
| **No onboarding** | Full 5-step first-launch flow with identity, categories, activity selection |
| **No day planning** | Day Map timeline is the central feature |
| **No calendar** | Three integration options, all feeding into the Day Map |
| **Activities are not categorized** | 3 root categories (Body / Mind / Spirit) with colors, levels, dynamic combination titles, and composite Eudaimonia Index |
| **No progress analytics** | D/W/M/Y views with charts, heatmaps, trends |
| **Each activity hub is a separate .md** | Activity hubs are views within the plugin — tap a grid card to see that activity's stats + sessions + skill tree |
| **Settings scattered across plugin + localStorage** | One unified settings object, one settings tab |
| **Decorative corners everywhere** | Corners used sparingly — hero card + directive card only. Rest uses frosted glass |

---

## XIV. Migration Path

For users with existing data:

1. On first load, detect existing `TrackHabitRank` settings → import all state (boss HP, tier, streaks, rewards, etc.)
2. Detect existing session folders (`Home/Starts/Drawing/Sessions/`) → index them for the session collage
3. Detect existing `localStorage` skill-tree settings → migrate to plugin settings
4. The old `Home.md`, `Drawing hub.md`, `Drawing Session.md` files remain in the vault but are no longer needed for UI — they become archival

---

## XV. Summary of Features Inspired by Reference Screenshots

| Feature | Source App | Implementation |
|---|---|---|
| Blurred hero image with "Good evening, Name" | Stoica/Eudaimonia | Hero Greeting (§IV.1) |
| Category levels (Discipline lv2, Science lv8) | Stoica | Body / Mind / Spirit categories with dynamic titles (§IV.2) |
| Eudaimonia Index XXI with XP bar | Stoica | Eudaimonia Bar (§IV.2) |
| Objectives / Streak / Consistency trio | Stoica | Stats Row (§IV.2) |
| XP Growth This Week chart | Stoica | Weekly Rhythm (§IV.6) |
| Skills section | Stoica | Activity Grid (§IV.7) |
| Your Progress / Reflect buttons | Stoica | Progress View (§VIII) + Journaling integration |
| Stoic quote at bottom | Stoica | Quote Footer (§IV.10) |
| Colored vertical day timeline | Day Planner app | Day Map (§IV.3) |
| Time blocks with checkboxes + current time line | Day Planner app | Day Map (§IV.3) |
| "Create event" button | Day Planner app | Task Modal (§IV.3) |
| D / W / M / Y tab switcher | Purposa | Progress View tabs (§VIII) |
| Streak counter + "Today is your next 1%" | Purposa | Hero subtitle (§IV.1) |
| Daily Mission card | Purposa | Morpheus Directive (§IV.4) |
| Tools grid (Dream Board, Focus Timer, etc.) | Purposa | Activity Grid (§IV.7) |
| Monthly progress chart (Hours/Productivity/Mood) | Purposa | Monthly Overview (§IV.8) |
| Best day / Average / Total stats | Purposa | Monthly Overview footer (§IV.8) |
| "Not Today" concept | Purposa | "NOT NOW" on Directive + skip on Day Map |
| "My Why" + personalized goals | Goals app | Onboarding (§III) + Profile settings |
| Goals as colored category cards | Goals app | Body / Mind / Spirit cards in onboarding + identity section |
| Study hours trend + daily focus bars | Study dashboard | Weekly Rhythm (§IV.6) |
| Monthly calendar heatmap | Study dashboard | Monthly Overview (§IV.8) |
| Focus score / Focus vs Break / Active days | Study dashboard | Stats Row + Weekly Rhythm |
| Weekly Rhythm (Study, Breaks, Active days, Best day) | Study dashboard | Weekly Rhythm (§IV.6) |
| Victories / Tools / Progress tabs | Purposa | Could map to Dashboard / Activities / Progress |

---

## XVI. Development Order (Suggested)

1. **Phase 1 — Core Shell**: Plugin scaffold, DashboardView, settings migration, Hero Greeting, basic activity list
2. **Phase 2 — Morpheus Engine**: Priority system, suggestion algorithm, Directive card
3. **Phase 3 — Day Map**: Timeline component, accept/skip/reschedule, midday view
4. **Phase 4 — Sessions**: Session creation, timer, skill picker, finish flow, session collage
5. **Phase 5 — Progress**: Eudaimonia Index, category levels, D/W/M/Y analytics, charts
6. **Phase 6 — Calendar**: Daily notes integration, task management, cross-day rescheduling
7. **Phase 7 — Onboarding**: First-launch flow, activity picker, identity titles
8. **Phase 8 — Polish**: Animations, blur effects, mobile gestures, performance optimization




**Home.md compatibility** is addressed via Mode B (Embedded Widget) — see §I. Users who prefer their `Home.md` as a homepage can embed the Morpheus dashboard widget directly into it using a codeblock, so they never feel like they're leaving their familiar workspace.
