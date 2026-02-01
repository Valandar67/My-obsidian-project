import {
  App,
  Plugin,
  Notice,
  TFile,
  ItemView,
  WorkspaceLeaf,
  PluginSettingTab,
  Setting,
  debounce,
  Modal
} from "obsidian";

const VIEW_TYPE_RANK = "Track-rank-view";
const VIEW_TYPE_MORPHEUS = "Morpheus-oracle-view";

/* ======================
   BOSS & RANK DEFINITIONS
====================== */

interface Boss {
  tier: [number, number];
  name: string;
  ranks: [string, string];
  description: string;
  lore: string;
  hpFormula: string;
}

const BOSSES: Boss[] = [
  {
    tier: [1, 2],
    name: "Shadow of Apathy",
    ranks: ["Doomscroller", "Redditor"],
    description: "The weight of inertia that keeps you scrolling instead of starting",
    lore: "Born from forgotten promises and unopened gym bags, the Shadow feeds on potential unrealized.",
    hpFormula: "weeklyTarget × 1.1"
  },
  {
    tier: [3, 4],
    name: "Siren's Call",
    ranks: ["Armchair General", "NPC"],
    description: "Distraction's sweet song that pulls focus from committed work",
    lore: "She sings of easier paths, of just one more video, of starting tomorrow instead.",
    hpFormula: "weeklyTarget × 1.2"
  },
  {
    tier: [5, 6],
    name: "Hydra of Habits",
    ranks: ["Apprentice", "Journeyman"],
    description: "The complexity of managing multiple routines simultaneously",
    lore: "Cut one head and two grow back. Each habit demands its own attention.",
    hpFormula: "weeklyTarget × 1.3"
  },
  {
    tier: [7, 8],
    name: "Minotaur's Maze",
    ranks: ["Citizen", "Athlete"],
    description: "The confusion and routine that traps even dedicated practitioners",
    lore: "Lost in corridors of habit, the path forward is never clear.",
    hpFormula: "weeklyTarget × 1.7"
  },
  {
    tier: [9, 10],
    name: "Medusa's Gaze",
    ranks: ["Scholar", "Huskarl"],
    description: "The paralysis that comes from overthinking or fear of failure",
    lore: "One glance and you are frozen, unable to act, unable to move.",
    hpFormula: "weeklyTarget × 1.9"
  },
  {
    tier: [11, 12],
    name: "Nemean Lion",
    ranks: ["Samurai", "Spartan"],
    description: "Seemingly invulnerable obstacles that require persistent effort",
    lore: "Its hide cannot be pierced by ordinary means. Only discipline cuts through.",
    hpFormula: "weeklyTarget × 2.1"
  },
  {
    tier: [13, 14],
    name: "Chimera",
    ranks: ["Templar", "Renaissance Man"],
    description: "Multi-headed beast requiring balanced attention across all domains",
    lore: "Lion, goat, and serpent - each head demands mastery of a different art.",
    hpFormula: "weeklyTarget × 2.3"
  },
  {
    tier: [15, 16],
    name: "Cerberus",
    ranks: ["Stoic", "Berserker"],
    description: "Guardian of transformation testing if habits have become identity",
    lore: "Three heads, three tests. Past the gate lies transformation.",
    hpFormula: "weeklyTarget × 2.5"
  },
  {
    tier: [17, 18],
    name: "Scylla & Charybdis",
    ranks: ["Olympian", "Jarl"],
    description: "The impossible choice between competing priorities",
    lore: "Between the rock and the whirlpool, both must somehow be honored.",
    hpFormula: "weeklyTarget × 2.7"
  },
  {
    tier: [19, 20],
    name: "The Furies",
    ranks: ["Sage", "Polymath"],
    description: "Internal voices of guilt and shame attacking even the successful",
    lore: "They whisper your failures, remind you of every skip, every weakness.",
    hpFormula: "weeklyTarget × 2.9"
  },
  {
    tier: [21, 22],
    name: "Typhon",
    ranks: ["Titan", "Grand Master"],
    description: "The force of chaos threatening to undo all progress",
    lore: "Father of all monsters, he seeks to return you to the beginning.",
    hpFormula: "weeklyTarget × 3.1"
  },
  {
    tier: [23, 24],
    name: "Kronos",
    ranks: ["Archon", "Einherjar"],
    description: "Time itself as an enemy, testing sustained intensity",
    lore: "The Titan who devours his children. Can you maintain as weeks become months?",
    hpFormula: "weeklyTarget × 3.3"
  },
  {
    tier: [25, 26],
    name: "Chaos Primordial",
    ranks: ["Jack of All Trades", "Master of All"],
    description: "The ultimate test of unshakeable discipline",
    lore: "Before creation, before order, only Chaos. To master it is to master yourself.",
    hpFormula: "weeklyTarget × 3.6"
  }
];

const RANK_TIER_COLORS: Record<number, string> = {
  1: "#6B7280", 2: "#6B7280",
  3: "#EF4444", 4: "#EF4444",
  5: "#F59E0B", 6: "#F59E0B",
  7: "#10B981", 8: "#10B981",
  9: "#3B82F6", 10: "#3B82F6",
  11: "#8B5CF6", 12: "#8B5CF6",
  13: "#EC4899", 14: "#EC4899",
  15: "#F97316", 16: "#F97316",
  17: "#06B6D4", 18: "#06B6D4",
  19: "#A855F7", 20: "#A855F7",
  21: "#DC2626", 22: "#DC2626",
  23: "#7C3AED", 24: "#7C3AED",
  25: "#BE185D", 26: "#BE185D"
};

function getBossForTier(tier: number): Boss | null {
  return BOSSES.find(b => tier >= b.tier[0] && tier <= b.tier[1]) || null;
}

function getRankNameForTier(tier: number): string {
  const boss = getBossForTier(tier);
  if (!boss) return "Unranked";
  const isFirstTier = tier === boss.tier[0];
  return isFirstTier ? boss.ranks[0] : boss.ranks[1];
}

function calculateBossHP(weeklyTarget: number, tier: number): number {
  const multiplier = 1 + (tier / 10);
  return Math.round(weeklyTarget * multiplier);
}

/* ======================
   ENGINE (INLINE)
====================== */

interface Completion {
  date: string; // YYYY-MM-DD
  completed: boolean;
}

interface StreakResult {
  streak: number;
  hp: number;
  earned: number;
  penalty: number;
  penaltyDays: number;
}

interface CustomHabitConfig {
  id: string;
  name: string;
  folder: string;
  field: string;
  hpPerDay: number;
  penaltyPerDay: number;
  enabled: boolean;
  trackingMode?: 'daily' | 'weekly';
  hpPerWeek?: number;
}

interface ActivitySnapshot {
  activityId: string;
  disabledDate: string;
  frozenHP: number;
  frozenStreak: number;
}

interface ActivityConfig {
  name: string;
  folder: string;
  field: string;
  hpPerDay: number;
  penaltyPerDay: number;
  trackingMode?: 'daily' | 'weekly';
  hpPerWeek?: number;
  weeklyTarget?: number; // For the user's specific configuration
}

interface PenanceTask {
  id: string;
  description: string;
  completed: boolean;
}

interface TempleTask {
  id: string;
  name: string;
  lastCompleted: string | null; // ISO date string
  intervalDays: number;
  emoji: string;
}

interface MorpheusDirective {
  activity: string;
  reason: string;
  mythContext: string;
  priority: 'death' | 'boss' | 'neglect' | 'weekly' | 'streak' | 'rest';
  quote: string;
}

interface TrackRankSettings {
  enabledActivities: Record<string, boolean>;
  customHabits: CustomHabitConfig[];

  // Boss system
  currentTier: number;
  bossMaxHP: number;
  bossCurrentHP: number;

  // Bonus systems
  consecutivePerfectWeeks: number;
  disciplineTokens: number;

  // Death & Tartarus
  inTartarus: boolean;
  tartarusPenanceTasks: PenanceTask[];
  tartarusStartDate: string | null;
  lastThresholdCheck: string | null;
  failedThresholdDays: number;

  // Temple Upkeep (Morpheus system)
  templeTasks: TempleTask[];
  lastMorpheusSummon: string | null;
  lastQuoteShown: string | null;

  // Legacy - kept for data migration
  rankGraceHP: number;
  rankGraceDays: number;
  rankBelowSince: string | null;
  activitySnapshots: Record<string, ActivitySnapshot>;

  snapshots: RankSnapshot[];
}

interface RankSnapshot {
  timestamp: string;
  totalHP: number;
  liveHP: number;
  historicalHP: number;
  rank: string;
  tier: number;
  bossName: string;
  perActivity: {
    name: string;
    hp: number;
    streak: number;
  }[];
}

const DEFAULT_SETTINGS: TrackRankSettings = {
  enabledActivities: {},
  customHabits: [],

  currentTier: 1,
  bossMaxHP: 35,
  bossCurrentHP: 35,

  consecutivePerfectWeeks: 0,
  disciplineTokens: 0,

  inTartarus: false,
  tartarusPenanceTasks: [],
  tartarusStartDate: null,
  lastThresholdCheck: null,
  failedThresholdDays: 0,

  templeTasks: [
    { id: "bathing", name: "Bathing", lastCompleted: null, intervalDays: 1, emoji: "🚿" },
    { id: "facial-hair", name: "Facial hair", lastCompleted: null, intervalDays: 2, emoji: "🪒" },
    { id: "nails", name: "Nails", lastCompleted: null, intervalDays: 7, emoji: "✂️" },
    { id: "haircut", name: "Haircut", lastCompleted: null, intervalDays: 21, emoji: "💈" }
  ],
  lastMorpheusSummon: null,
  lastQuoteShown: null,

  rankGraceHP: 20,
  rankGraceDays: 3,
  rankBelowSince: null,
  activitySnapshots: {},
  snapshots: [],
};

function todayISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function calculateLiveStreakWithDecay(
  completions: Completion[],
  hpPerDay: number,
  penaltyPerDay: number,
  asOf: Date = new Date()
): StreakResult {
  const today = new Date(asOf);
  today.setHours(0,0,0,0);

  const completedDates = completions
    .filter(c => c.completed)
    .map(c => {
      const d = new Date(c.date);
      d.setHours(0, 0, 0, 0);
      return d;
    })
    .filter(d => !isNaN(d.getTime()) && d <= today)
    .sort((a, b) => b.getTime() - a.getTime());

  if (completedDates.length === 0) {
    return {
      streak: 0,
      hp: 0,
      earned: 0,
      penalty: 0,
      penaltyDays: 0
    };
  }

  const mostRecent = completedDates[0];
  const daysSinceLastCompletion =
    Math.floor(
      (today.getTime() - mostRecent.getTime()) /
      (24 * 60 * 60 * 1000)
    );

  // NOTE: Penalty system kept for backward compatibility but not used in mythological system
  if (daysSinceLastCompletion > 2) {
    let baseStreak = 0;
    let checkDate = new Date(mostRecent);

    for (const date of completedDates) {
      if (date.getTime() === checkDate.getTime()) {
        baseStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (date < checkDate) {
        break;
      }
    }

    const earned = baseStreak * hpPerDay;
    return { streak: baseStreak, hp: earned, earned, penalty: 0, penaltyDays: 0 };
  }

  // Active streak
  let streak = 0;
  let checkDate = new Date(mostRecent);

  for (const date of completedDates) {
    if (date.getTime() === checkDate.getTime()) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (date < checkDate) {
      break;
    }
  }

  const earned = streak * hpPerDay;
  return { streak, hp: earned, earned, penalty: 0, penaltyDays: 0 };
}

function calculateWeeklyStreak(
  completions: Completion[],
  hpPerWeek: number,
  asOf: Date = new Date()
): StreakResult {
  const today = new Date(asOf);
  today.setHours(0, 0, 0, 0);

  const completedDates = completions
    .filter(c => c.completed)
    .map(c => {
      const d = new Date(c.date);
      d.setHours(0, 0, 0, 0);
      return d;
    })
    .filter(d => !isNaN(d.getTime()) && d <= today)
    .sort((a, b) => b.getTime() - a.getTime());

  if (completedDates.length === 0) {
    return { streak: 0, hp: 0, earned: 0, penalty: 0, penaltyDays: 0 };
  }

  function getWeek(date: Date): { year: number; week: number } {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return { year: d.getFullYear(), week: weekNo };
  }

  const weekMap = new Map<string, boolean>();
  completedDates.forEach(date => {
    const { year, week } = getWeek(date);
    weekMap.set(`${year}-W${week}`, true);
  });

  const currentWeek = getWeek(today);
  let streak = 0;
  let checkWeek = currentWeek;
  
  while (true) {
    const weekKey = `${checkWeek.year}-W${checkWeek.week}`;
    if (weekMap.has(weekKey)) {
      streak++;
      const prevWeekDate = new Date(checkWeek.year, 0, 1 + (checkWeek.week - 2) * 7);
      checkWeek = getWeek(prevWeekDate);
    } else {
      break;
    }
  }

  const earned = streak * hpPerWeek;
  return { streak, hp: earned, earned, penalty: 0, penaltyDays: 0 };
}

function getProgressBarColor(tier: number, inTartarus: boolean) {
  if (inTartarus) return "#DC2626"; // red for Tartarus
  return RANK_TIER_COLORS[tier] ?? "#6B7280";
}

function getCompletionsFromFolder(
  app: App,
  folderPath: string,
  fieldName: string
): Completion[] {
  const files = app.vault.getMarkdownFiles();

  return files
    .filter((file: TFile) => file.path.startsWith(folderPath))
    .map((file: TFile) => {
      const cache = app.metadataCache.getFileCache(file);
      const frontmatter = cache?.frontmatter;

      if (!frontmatter || typeof frontmatter[fieldName] !== "boolean") {
        return null;
      }

      const date = file.basename;

      return {
        date,
        completed: frontmatter[fieldName] === true
      };
    })
    .filter((c: Completion | null): c is Completion => c !== null);
}

// NEW: Get completions with type distinction
interface CompletionWithType extends Completion {
  type?: 'flow' | 'discipline' | 'skipped';
}

function getCompletionsWithType(
  app: App,
  folderPath: string,
  fieldName: string
): CompletionWithType[] {
  const files = app.vault.getMarkdownFiles();

  return files
    .filter((file: TFile) => file.path.startsWith(folderPath))
    .map((file: TFile) => {
      const cache = app.metadataCache.getFileCache(file);
      const frontmatter = cache?.frontmatter;

      if (!frontmatter) {
        return null;
      }

      const completed = frontmatter[fieldName] === true;
      const typeField = `${fieldName}-Type`;
      const type = frontmatter[typeField] as 'flow' | 'discipline' | 'skipped' | undefined;

      const date = file.basename;

      return {
        date,
        completed,
        type
      };
    })
    .filter((c: CompletionWithType | null): c is CompletionWithType => c !== null);
}

// NEW: Calculate damage dealt in a time period
function calculateDamageInPeriod(
  completions: CompletionWithType[],
  startDate: Date,
  endDate: Date,
  streakBonus: number = 0
): number {
  let baseDamage = 0;

  completions.forEach(c => {
    if (!c.completed) return;
    
    const date = new Date(c.date);
    date.setHours(0, 0, 0, 0);
    
    if (date >= startDate && date <= endDate) {
      // Determine damage based on type
      if (c.type === 'discipline') {
        baseDamage += 2;
      } else if (c.type === 'flow' || !c.type) {
        // Default to flow if type not specified (backward compatibility)
        baseDamage += 1;
      }
      // 'skipped' adds 0 damage
    }
  });

  // Apply streak bonus
  return Math.round(baseDamage * (1 + streakBonus));
}

// NEW: Get discipline win count
function countDisciplineWins(
  completions: CompletionWithType[]
): number {
  return completions.filter(c => c.completed && c.type === 'discipline').length;
}

function computeAllActivityHP(
  app: App,
  settings: TrackRankSettings
) {
  let historicalHP = 0;
  let liveHP = 0;
  let totalDisciplineWins = 0;

  const breakdown: {
    name: string;
    streak: number;
    hp: number;
    penaltyDays: number;
    disciplineWins: number;
  }[] = [];

  const allActivities = [
    ...ACTIVITIES
      .filter(a => settings.enabledActivities[a.name] ?? true)
      .map(a => ({
        name: a.name,
        folder: a.folder,
        field: a.field,
        hpPerDay: a.hpPerDay,
        penaltyPerDay: a.penaltyPerDay,
        trackingMode: a.trackingMode,
        hpPerWeek: a.hpPerWeek
      })),
    ...settings.customHabits.filter(h => h.enabled)
  ];

  for (const activity of allActivities) {
    const completions = getCompletionsFromFolder(
      app,
      activity.folder,
      activity.field
    );

    const completionsWithType = getCompletionsWithType(
      app,
      activity.folder,
      activity.field
    );

    let result: StreakResult;

    if (completions.length === 0) {
      result = {
        streak: 0,
        hp: 0,
        earned: 0,
        penalty: 0,
        penaltyDays: 0
      };
    } else {
      if (activity.trackingMode === 'weekly' && activity.hpPerWeek) {
        result = calculateWeeklyStreak(
          completions,
          activity.hpPerWeek
        );
      } else {
        result = calculateLiveStreakWithDecay(
          completions,
          activity.hpPerDay,
          activity.penaltyPerDay
        );
      }
    }

    const completedDates = completions
      .filter(c => c.completed)
      .map(c => new Date(c.date))
      .sort((a, b) => b.getTime() - a.getTime());

    let historicalCount = 0;

    if (activity.trackingMode === 'weekly') {
      historicalCount = Math.max(0, completedDates.length - result.streak);
      historicalHP += historicalCount * (activity.hpPerWeek || 0);
    } else {
      if (completedDates.length > 0 && result.streak > 0) {
        const streakStartDate = new Date(completedDates[0]);
        streakStartDate.setDate(streakStartDate.getDate() - result.streak + 1);
        
        historicalCount = completedDates.filter(
          d => d < streakStartDate
        ).length;
      } else {
        historicalCount = completedDates.length;
      }
      historicalHP += historicalCount * activity.hpPerDay;
    }

    liveHP += result.hp;

    // Count discipline wins for this activity
    const disciplineWins = countDisciplineWins(completionsWithType);
    totalDisciplineWins += disciplineWins;

    breakdown.push({
      name: activity.name,
      streak: result.streak,
      hp: result.hp,
      penaltyDays: result.penaltyDays,
      disciplineWins
    });
  }

  for (const [activityId, snapshot] of Object.entries(settings.activitySnapshots)) {
    const isDisabled = 
      !allActivities.some(a => ('id' in a ? a.id : a.name) === activityId);
    
    if (isDisabled) {
      historicalHP += snapshot.frozenHP;
      
      breakdown.push({
        name: activityId,
        streak: 0,
        hp: snapshot.frozenHP,
        penaltyDays: 0,
        disciplineWins: 0
      });
    }
  }

  const totalHP = historicalHP + liveHP;
  return {
    totalHP,
    breakdown,
    penalties: breakdown.filter(b => b.penaltyDays > 0),
    totalDisciplineWins
  };
}

function buildSnapshot(
  app: App,
  settings: TrackRankSettings
) {
  const { totalHP, breakdown } = computeAllActivityHP(app, settings);

  const liveHP = breakdown.reduce((s, b) => s + b.hp, 0);
  const historicalHP = totalHP - liveHP;

  const boss = getBossForTier(settings.currentTier);
  const rankName = getRankNameForTier(settings.currentTier);

  return {
    timestamp: new Date().toISOString(),
    totalHP,
    liveHP,
    historicalHP,
    rank: rankName,
    tier: settings.currentTier,
    bossName: boss?.name || "Unknown",
    perActivity: breakdown.map(b => ({
      name: b.name,
      hp: b.hp,
      streak: b.streak
    }))
  };
}

/* ======================
   DEATH THRESHOLD & TARTARUS
====================== */

function checkDeathThreshold(
  app: App,
  settings: TrackRankSettings
): boolean {
  // Calculate weekly target from all enabled activities
  const allActivities = [
    ...ACTIVITIES.filter(a => settings.enabledActivities[a.name] ?? true),
    ...settings.customHabits.filter(h => h.enabled)
  ];
  
  const weeklyTarget = allActivities.reduce((sum, a) => {
    if (a.trackingMode === 'weekly') {
      return sum + 1; // 1 activity per week
    }
    return sum + (a.weeklyTarget || 7); // Default 7 per week for daily
  }, 0);
  
  const requiredDamage = Math.ceil(weeklyTarget * 0.1); // 10% of weekly target, rounded up
  
  // Get last 3 days of activity
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 2); // 3 days = today, yesterday, day before
  
  let totalDamage = 0;
  
  // Check each activity for damage in last 3 days
  for (const activity of allActivities) {
    const completionsWithType = getCompletionsWithType(
      app,
      activity.folder,
      activity.field
    );
    
    // Calculate damage in this period (no streak bonus for threshold check)
    const damage = calculateDamageInPeriod(completionsWithType, startDate, today, 0);
    totalDamage += damage;
  }
  
  return totalDamage < requiredDamage;
}

// NEW: Check perfect week status
function checkPerfectWeek(
  app: App,
  settings: TrackRankSettings
): boolean {
  const allActivities = [
    ...ACTIVITIES.filter(a => settings.enabledActivities[a.name] ?? true),
    ...settings.customHabits.filter(h => h.enabled)
  ];
  
  // Get current week boundaries (Monday to Sunday)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday, go back 6 days
  
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() + mondayOffset);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6); // Sunday
  
  // Check if week is complete (only check on Sunday or after)
  if (today < weekEnd) {
    return false; // Week not complete yet
  }
  
  // Check each activity met its target
  for (const activity of allActivities) {
    const completions = getCompletionsFromFolder(
      app,
      activity.folder,
      activity.field
    );
    
    // Count completions in this week
    let weekCount = 0;
    completions.forEach(c => {
      if (!c.completed) return;
      const date = new Date(c.date);
      date.setHours(0, 0, 0, 0);
      if (date >= weekStart && date <= weekEnd) {
        weekCount++;
      }
    });
    
    const target = activity.weeklyTarget || 7;
    
    if (weekCount < target) {
      return false; // This activity didn't meet target
    }
  }
  
  return true; // All activities met targets
}

// NEW: Get current week progress
function getCurrentWeekProgress(
  app: App,
  settings: TrackRankSettings
): { completed: number; target: number; byActivity: Array<{name: string; completed: number; target: number}> } {
  const allActivities = [
    ...ACTIVITIES.filter(a => settings.enabledActivities[a.name] ?? true),
    ...settings.customHabits.filter(h => h.enabled)
  ];
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() + mondayOffset);
  
  let totalCompleted = 0;
  let totalTarget = 0;
  const byActivity: Array<{name: string; completed: number; target: number}> = [];
  
  for (const activity of allActivities) {
    const completions = getCompletionsFromFolder(
      app,
      activity.folder,
      activity.field
    );
    
    let weekCount = 0;
    completions.forEach(c => {
      if (!c.completed) return;
      const date = new Date(c.date);
      date.setHours(0, 0, 0, 0);
      if (date >= weekStart && date <= today) {
        weekCount++;
      }
    });
    
    const target = activity.weeklyTarget || 7;
    
    totalCompleted += weekCount;
    totalTarget += target;
    
    byActivity.push({
      name: activity.name,
      completed: weekCount,
      target
    });
  }
  
  return {
    completed: totalCompleted,
    target: totalTarget,
    byActivity
  };
}

// NEW: Get streak bonus multiplier
function getStreakBonusMultiplier(consecutivePerfectWeeks: number): number {
  const bonuses = [0, 0.05, 0.12, 0.20, 0.30, 0.40];
  const index = Math.min(consecutivePerfectWeeks, 5);
  return bonuses[index];
}

function enterTartarus(settings: TrackRankSettings) {
  settings.inTartarus = true;
  settings.tartarusStartDate = todayISO();
  settings.bossCurrentHP = settings.bossMaxHP; // Reset boss
  settings.tartarusPenanceTasks = [];
  settings.failedThresholdDays = 0;
  
  new Notice("💀 You have entered TARTARUS. Complete penance to escape.");
}

function getPenanceTasksForTier(tier: number): PenanceTask[] {
  if (tier <= 4) {
    return [
      { id: "cold-shower-3", description: "Cold shower × 3 (separate days)", completed: false },
      { id: "fast-16h-3", description: "16-hour fast × 3 (separate days)", completed: false },
      { id: "wake-6am-3", description: "Wake before 6 AM × 3 (separate days)", completed: false }
    ];
  } else if (tier <= 12) {
    return [
      { id: "cold-shower-5", description: "Cold shower × 5", completed: false },
      { id: "fast-20h-3", description: "20-hour fast × 3", completed: false },
      { id: "all-activities-2", description: "Complete ALL activities in one day × 2", completed: false },
      { id: "pushups-200", description: "200 pushups total (split across 3+ days)", completed: false }
    ];
  } else {
    return [
      { id: "ice-bath-3", description: "Ice bath (2 minutes) × 3", completed: false },
      { id: "fast-24h-2", description: "24-hour fast × 2", completed: false },
      { id: "perfect-week", description: "Perfect week (all targets met)", completed: false },
      { id: "pushups-500", description: "500 pushups total (split across week)", completed: false },
      { id: "custom", description: "Self-designed penance task", completed: false }
    ];
  }
}

/* ======================
   MORPHEUS ORACLE SYSTEM
====================== */

async function loadQuotesFromFile(app: App, filePath: string): Promise<string[]> {
  try {
    const file = app.vault.getAbstractFileByPath(filePath);
    if (!file || !(file instanceof TFile)) return [];

    const content = await app.vault.read(file);
    const quotes: string[] = [];

    // Extract quotes between > markers
    const quoteMatches = content.matchAll(/^>\s*"([^"]+)"\s*\n>\s*—\s*(.+)$/gm);
    for (const match of quoteMatches) {
      quotes.push(`"${match[1]}" — ${match[2]}`);
    }

    return quotes;
  } catch (e) {
    console.error(`Failed to load quotes from ${filePath}:`, e);
    return [];
  }
}

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour < 6) return 'night';
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  if (hour < 22) return 'evening';
  return 'night';
}

function getGreeting(name: string = "Warrior"): string {
  const timeOfDay = getTimeOfDay();
  const greetings = {
    morning: `Good morning, ${name}.`,
    afternoon: `Good afternoon, ${name}.`,
    evening: `Good evening, ${name}.`,
    night: `The night watches, ${name}.`
  };
  return greetings[timeOfDay];
}

async function getMorpheusDirective(
  app: App,
  settings: TrackRankSettings
): Promise<MorpheusDirective> {
  const allActivities = [
    ...ACTIVITIES.filter(a => settings.enabledActivities[a.name] ?? true),
    ...settings.customHabits.filter(h => h.enabled)
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. DEATH THRESHOLD - Highest priority
  if (settings.inTartarus) {
    return {
      activity: "Escape Tartarus",
      reason: "You are trapped in the underworld. Complete your penance to return.",
      mythContext: "The gates of Tartarus close behind those who falter. Only through suffering is redemption earned.",
      priority: 'death',
      quote: await getRandomQuote(app, settings)
    };
  }

  const belowThreshold = checkDeathThreshold(app, settings);
  if (belowThreshold && settings.failedThresholdDays >= 2) {
    // One more day and Tartarus beckons
    const mostNeglected = await getMostNeglectedActivity(app, allActivities);
    return {
      activity: mostNeglected.name,
      reason: "Death approaches. Act now or face Tartarus.",
      mythContext: "The Fates draw near. One more day of weakness and you descend to the depths.",
      priority: 'death',
      quote: await getRandomQuote(app, settings)
    };
  }

  // 2. BOSS PROXIMITY - High priority
  const bossHPPercent = settings.bossCurrentHP / settings.bossMaxHP;
  if (bossHPPercent < 0.15) {
    const boss = getBossForTier(settings.currentTier);
    const bestForBoss = await getBestActivityForBoss(app, allActivities);
    return {
      activity: bestForBoss.name,
      reason: `${boss?.name} staggers. ${Math.ceil(settings.bossCurrentHP)} blows remain.`,
      mythContext: `The beast bleeds. You smell victory. Strike now while ${boss?.name} falters.`,
      priority: 'boss',
      quote: await getRandomQuote(app, settings)
    };
  }

  // 3. LONGEST NEGLECT - Medium priority
  const neglectedActivity = await getMostNeglectedActivity(app, allActivities);
  const daysSinceLastCompletion = await getDaysSinceLastCompletion(app, neglectedActivity);

  if (daysSinceLastCompletion >= 3) {
    return {
      activity: neglectedActivity.name,
      reason: `${daysSinceLastCompletion} days since you last did this. The skill atrophies.`,
      mythContext: getNeglectMythContext(neglectedActivity.name, daysSinceLastCompletion),
      priority: 'neglect',
      quote: await getRandomQuote(app, settings)
    };
  }

  // 4. WEEKLY TARGETS - Medium priority
  const weekProgress = getCurrentWeekProgress(app, settings);
  const behindSchedule = weekProgress.byActivity.find(a => {
    const daysLeft = 7 - new Date().getDay(); // Days left in week
    const needed = a.target - a.completed;
    return needed > daysLeft;
  });

  if (behindSchedule) {
    return {
      activity: behindSchedule.name,
      reason: `Behind schedule. ${behindSchedule.completed}/${behindSchedule.target} this week.`,
      mythContext: "Time is the enemy. The week closes and your goal slips away. Reclaim it.",
      priority: 'weekly',
      quote: await getRandomQuote(app, settings)
    };
  }

  // 5. TIME OF DAY - Favor certain activities
  const timeOfDay = getTimeOfDay();
  const preferredActivity = getTimeBasedActivity(allActivities, timeOfDay);

  if (preferredActivity) {
    return {
      activity: preferredActivity.name,
      reason: getTimeBasedReason(preferredActivity.name, timeOfDay),
      mythContext: getTimeBasedMythContext(timeOfDay),
      priority: 'streak',
      quote: await getRandomQuote(app, settings)
    };
  }

  // 6. DEFAULT - Any activity that needs work
  const anyActivity = allActivities[Math.floor(Math.random() * allActivities.length)];
  return {
    activity: anyActivity.name,
    reason: "The path forward is clear. Choose action over inertia.",
    mythContext: "Every step matters. Every choice compounds. The gods favor those who move.",
    priority: 'streak',
    quote: await getRandomQuote(app, settings)
  };
}

async function getRandomQuote(app: App, settings: TrackRankSettings): Promise<string> {
  const stoicQuotes = await loadQuotesFromFile(app, "Quotes/Stoicism.md");
  const personalQuotes = await loadQuotesFromFile(app, "Quotes/Personal.md");

  // Weight: 80% stoic, 20% personal
  const usePersonal = Math.random() < 0.2 && personalQuotes.length > 0;
  const quotePool = usePersonal ? personalQuotes : stoicQuotes;

  if (quotePool.length === 0) {
    return '"The obstacle is the way." — Marcus Aurelius';
  }

  // Avoid showing the same quote twice in a row
  let quote = quotePool[Math.floor(Math.random() * quotePool.length)];
  if (quote === settings.lastQuoteShown && quotePool.length > 1) {
    quote = quotePool[Math.floor(Math.random() * quotePool.length)];
  }

  return quote;
}

async function getMostNeglectedActivity(
  app: App,
  activities: (ActivityConfig | CustomHabitConfig)[]
): Promise<ActivityConfig | CustomHabitConfig> {
  let mostNeglected = activities[0];
  let longestGap = 0;

  for (const activity of activities) {
    const daysSince = await getDaysSinceLastCompletion(app, activity);
    if (daysSince > longestGap) {
      longestGap = daysSince;
      mostNeglected = activity;
    }
  }

  return mostNeglected;
}

async function getDaysSinceLastCompletion(
  app: App,
  activity: ActivityConfig | CustomHabitConfig
): Promise<number> {
  const completions = getCompletionsFromFolder(app, activity.folder, activity.field);

  if (completions.length === 0) return 999;

  const completed = completions
    .filter(c => c.completed)
    .map(c => new Date(c.date))
    .sort((a, b) => b.getTime() - a.getTime());

  if (completed.length === 0) return 999;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastDate = completed[0];

  return Math.floor((today.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000));
}

async function getBestActivityForBoss(
  app: App,
  activities: (ActivityConfig | CustomHabitConfig)[]
): Promise<ActivityConfig | CustomHabitConfig> {
  // Prioritize activities with highest weekly target (most impactful)
  return activities.reduce((best, current) => {
    const bestTarget = best.weeklyTarget || 7;
    const currentTarget = current.weeklyTarget || 7;
    return currentTarget > bestTarget ? current : best;
  }, activities[0]);
}

function getNeglectMythContext(activityName: string, days: number): string {
  const contexts = {
    Workout: `${days} days without iron. Your muscles forget their strength. Heracles would weep.`,
    Cardio: `${days} days without the run. Your lungs grow lazy. The messenger god frowns.`,
    Reading: `${days} days without wisdom. The mind grows dull. Athena turns her gaze away.`,
    Drumming: `${days} days of silence. The rhythm fades. Apollo's lyre gathers dust.`,
    "Health Study": `${days} days without learning. Ignorance creeps in. Asclepius waits.`,
    Social: `${days} days alone. Connection withers. Even Achilles needed Patroclus.`,
    Drawing: `${days} days without creation. The muse abandons you. Inspiration flees.`
  };

  return contexts[activityName] || `${days} days since you honored this practice. The gods notice your absence.`;
}

function getTimeBasedActivity(
  activities: (ActivityConfig | CustomHabitConfig)[],
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
): (ActivityConfig | CustomHabitConfig) | null {
  const preferences = {
    morning: ['Workout', 'Cardio'],
    afternoon: ['Health Study', 'Reading'],
    evening: ['Drumming', 'Drawing', 'Social'],
    night: ['Reading']
  };

  const preferred = preferences[timeOfDay];
  return activities.find(a => preferred.includes(a.name)) || null;
}

function getTimeBasedReason(activityName: string, timeOfDay: string): string {
  const reasons = {
    morning: "The dawn favors action. Strike while your will is fresh.",
    afternoon: "Midday brings clarity. Feed the mind while the sun shines.",
    evening: "Dusk calls for creation. The night muse awakens.",
    night: "The quiet hours favor reflection. Let wisdom speak."
  };

  return reasons[timeOfDay] || "The time is right for this pursuit.";
}

function getTimeBasedMythContext(timeOfDay: string): string {
  const contexts = {
    morning: "Eos the dawn goddess blesses those who move with first light.",
    afternoon: "Helios rides high. Channel the sun's power while it burns.",
    evening: "Twilight is the hour of makers. Hephaestus works best in shadows.",
    night: "Nyx covers the world. In darkness, the wise find truth."
  };

  return contexts[timeOfDay] || "The gods watch. Make this moment count.";
}

/* ======================
   ACTIVITIES - USER CONFIG
====================== */

const ACTIVITIES: ActivityConfig[] = [
  {
    name: "Workout",
    folder: "Personal Life/01 Workout",
    field: "Workout",
    hpPerDay: 1,
    penaltyPerDay: 2,
    weeklyTarget: 7
  },
  {
    name: "Cardio",
    folder: "Personal Life/02 Cardio",
    field: "Cardio",
    hpPerDay: 1,
    penaltyPerDay: 2,
    weeklyTarget: 4
  },
  {
    name: "Reading",
    folder: "Personal Life/03 Reading",
    field: "Reading",
    hpPerDay: 1,
    penaltyPerDay: 2,
    weeklyTarget: 6
  },
  {
    name: "Drumming",
    folder: "Personal Life/04 Drumming",
    field: "Drumming",
    hpPerDay: 1,
    penaltyPerDay: 2,
    weeklyTarget: 6
  },
  {
    name: "Health Study",
    folder: "Personal Life/05 Health Study",
    field: "Health Study",
    hpPerDay: 1,
    penaltyPerDay: 2,
    weeklyTarget: 3
  },
  {
    name: "Social",
    folder: "Personal Life/06 Social",
    field: "Social",
    hpPerDay: 1,
    penaltyPerDay: 2,
    weeklyTarget: 2
  },
  {
    name: "Drawing",
    folder: "Personal Life/07 Drawing",
    field: "Drawing",
    hpPerDay: 1,
    penaltyPerDay: 2,
    weeklyTarget: 4
  }
];

/* ======================
   VIEW
====================== */

class TrackRankView extends ItemView {
  plugin: TrackHabitRankPlugin;

  constructor(leaf: WorkspaceLeaf, plugin: TrackHabitRankPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return VIEW_TYPE_RANK;
  }

  getDisplayText(): string {
    return "Boss Dashboard";
  }

  async onOpen(): Promise<void> {
    this.render();
    return Promise.resolve();
  }

  render() {
    const content = this.contentEl;
    content.empty();

    const settings = this.plugin.settings;
    const boss = getBossForTier(settings.currentTier);
    const rankName = getRankNameForTier(settings.currentTier);
    
    const barColor = getProgressBarColor(settings.currentTier, settings.inTartarus);

    const wrapper = content.createDiv({
      attr: {
        style: `
          max-width: 420px;
          margin: 0 auto;
          padding: 24px;
          text-align: center;
        `
      }
    });

    // Boss name
    wrapper.createEl("div", {
      text: boss?.name || "No Boss",
      attr: {
        style: `
          font-size: 0.75em;
          letter-spacing: 0.25em;
          opacity: 0.6;
          margin-bottom: 12px;
          text-transform: uppercase;
        `
      }
    });

    // Rank title
    wrapper.createEl("div", {
      text: rankName,
      attr: {
        style: `
          font-size: 2.2em;
          font-weight: 700;
          margin-bottom: 6px;
        `
      }
    });

    // Boss HP
    const hpPercent = Math.round((settings.bossCurrentHP / settings.bossMaxHP) * 100);
    wrapper.createEl("div", {
      text: `${settings.bossCurrentHP}/${settings.bossMaxHP} HP (${hpPercent}%)`,
      attr: {
        style: `
          font-size: 1.1em;
          opacity: 0.85;
          margin-bottom: 12px;
        `
      }
    });

    // HP Bar
    const bar = wrapper.createDiv({
      attr: {
        style: `
          width: 100%;
          height: 16px;
          background: var(--background-modifier-border);
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 16px;
        `
      }
    });

    bar.createDiv({
      attr: {
        style: `
          width: ${hpPercent}%;
          height: 100%;
          background: ${barColor};
          transition: width 0.3s ease, background 0.3s ease;
        `
      }
    });

    // Boss lore
    if (boss?.lore) {
      wrapper.createEl("div", {
        text: boss.lore,
        attr: {
          style: `
            font-size: 0.85em;
            opacity: 0.7;
            font-style: italic;
            margin-bottom: 20px;
            line-height: 1.4;
          `
        }
      });
    }

    // Weekly progress section
    const weekProgress = getCurrentWeekProgress(this.app, settings);
    const weekPercentComplete = Math.round((weekProgress.completed / weekProgress.target) * 100);
    
    wrapper.createEl("div", {
      text: `This Week: ${weekProgress.completed}/${weekProgress.target} (${weekPercentComplete}%)`,
      attr: {
        style: `
          font-size: 0.9em;
          margin-bottom: 8px;
          font-weight: 600;
        `
      }
    });

    // Discipline tokens
    const { totalDisciplineWins } = computeAllActivityHP(this.app, settings);
    wrapper.createEl("div", {
      text: `💎 Discipline Tokens: ${settings.disciplineTokens}/3 (${totalDisciplineWins} total wins)`,
      attr: {
        style: `
          font-size: 0.9em;
          margin-bottom: 8px;
          font-weight: 600;
        `
      }
    });

    // Perfect week streak
    if (settings.consecutivePerfectWeeks > 0) {
      const bonusPercent = Math.round(getStreakBonusMultiplier(settings.consecutivePerfectWeeks) * 100);
      wrapper.createEl("div", {
        text: `🔥 Perfect Weeks: ${settings.consecutivePerfectWeeks} (+${bonusPercent}% damage)`,
        attr: {
          style: `
            font-size: 0.9em;
            margin-bottom: 16px;
            color: #F59E0B;
            font-weight: 600;
          `
        }
      });
    }

    // Death warning (if not in Tartarus)
    if (!settings.inTartarus) {
      const allActivities = [
        ...ACTIVITIES.filter(a => settings.enabledActivities[a.name] ?? true),
        ...this.plugin.settings.customHabits.filter(h => h.enabled)
      ];
      
      const weeklyTarget = allActivities.reduce((sum, a) => {
        return sum + (a.weeklyTarget || 7);
      }, 0);
      
      const requiredDamage = Math.ceil(weeklyTarget * 0.1);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 2);
      
      let totalDamage = 0;
      for (const activity of allActivities) {
        const completionsWithType = getCompletionsWithType(
          this.app,
          activity.folder,
          activity.field
        );
        totalDamage += calculateDamageInPeriod(completionsWithType, startDate, today, 0);
      }
      
      if (totalDamage < requiredDamage) {
        const warningBox = wrapper.createDiv({
          attr: {
            style: `
              margin: 16px 0;
              padding: 10px 12px;
              border-radius: 8px;
              background: rgba(239, 68, 68, 0.12);
              border: 1px solid rgba(239, 68, 68, 0.4);
            `
          }
        });

        warningBox.createEl("div", {
          text: "⚠️ LOW ACTIVITY WARNING",
          attr: {
            style: `
              font-weight: 700;
              color: #EF4444;
              margin-bottom: 4px;
            `
          }
        });

        warningBox.createEl("div", {
          text: `Last 3 days: ${totalDamage} damage | Required: ${requiredDamage}`,
          attr: {
            style: `
              font-size: 0.85em;
              opacity: 0.9;
            `
          }
        });

        warningBox.createEl("div", {
          text: `Failed checks: ${settings.failedThresholdDays}/3`,
          attr: {
            style: `
              font-size: 0.85em;
              font-weight: 600;
              color: #EF4444;
              margin-top: 4px;
            `
          }
        });
      }
    }

    // Tartarus warning
    if (settings.inTartarus) {
      const warningBox = wrapper.createDiv({
        attr: {
          style: `
            margin: 16px 0;
            padding: 12px;
            border-radius: 8px;
            background: rgba(220, 38, 38, 0.15);
            border: 2px solid rgba(220, 38, 38, 0.5);
          `
        }
      });

      warningBox.createEl("div", {
        text: "💀 YOU ARE IN TARTARUS",
        attr: {
          style: `
            font-weight: 700;
            color: #DC2626;
            font-size: 1.1em;
            margin-bottom: 8px;
          `
        }
      });

      const daysIn = settings.tartarusStartDate 
        ? Math.floor((Date.now() - new Date(settings.tartarusStartDate).getTime()) / (24 * 60 * 60 * 1000))
        : 0;

      const requiredTasks = settings.currentTier <= 4 ? 3 : settings.currentTier <= 12 ? 4 : 5;
      const completedTasks = settings.tartarusPenanceTasks.filter(t => t.completed).length;

      warningBox.createEl("div", {
        text: `Days: ${daysIn} | Tasks: ${completedTasks}/${requiredTasks}`,
        attr: {
          style: `
            font-size: 0.9em;
            opacity: 0.9;
          `
        }
      });

      // Button to view penance tasks
      const viewBtn = warningBox.createEl("button", {
        text: "View Penance Tasks",
        attr: {
          style: `
            margin-top: 8px;
            padding: 6px 12px;
            background: #DC2626;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
          `
        }
      });

      viewBtn.onclick = () => {
        new PenanceModal(this.app, this.plugin).open();
      };
    }

    // Next rank info
    const nextTier = settings.currentTier + 1;
    if (nextTier <= 26) {
      const nextRank = getRankNameForTier(nextTier);
      wrapper.createEl("div", {
        text: `Next: ${nextRank} (defeat boss to advance)`,
        attr: {
          style: `
            font-size: 0.75em;
            opacity: 0.6;
            margin-top: 16px;
          `
        }
      });
    } else {
      wrapper.createEl("div", {
        text: "🏆 FINAL TIER REACHED",
        attr: {
          style: `
            font-size: 0.9em;
            color: #F59E0B;
            font-weight: 700;
            margin-top: 16px;
          `
        }
      });
    }
  }
}

/* ======================
   PENANCE MODAL
====================== */

class PenanceModal extends Modal {
  plugin: TrackHabitRankPlugin;

  constructor(app: App, plugin: TrackHabitRankPlugin) {
    super(app);
    this.plugin = plugin;
  }

  onOpen() {
    const { contentEl } = this;
    const settings = this.plugin.settings;

    contentEl.empty();

    new Setting(contentEl)
      .setName("Tartarus Penance Tasks")
      .setHeading();

    contentEl.createEl("p", {
      text: "Complete the required tasks to escape Tartarus and resume your journey.",
      attr: { style: "margin-bottom: 16px; opacity: 0.8;" }
    });

    // Show available tokens
    contentEl.createEl("div", {
      text: `💎 Available Discipline Tokens: ${settings.disciplineTokens}/3`,
      attr: {
        style: `
          margin-bottom: 16px;
          padding: 8px;
          background: rgba(139, 92, 246, 0.1);
          border-radius: 6px;
          font-weight: 600;
        `
      }
    });

    if (settings.disciplineTokens === 3) {
      const escapeBtn = contentEl.createEl("button", {
        text: "Spend 3 Tokens to Escape Immediately",
        attr: {
          style: `
            width: 100%;
            padding: 12px;
            margin-bottom: 16px;
            background: #8B5CF6;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 700;
            font-size: 1em;
          `
        }
      });

      escapeBtn.onclick = async () => {
        settings.disciplineTokens = 0;
        settings.inTartarus = false;
        settings.tartarusPenanceTasks = [];
        settings.tartarusStartDate = null;
        await this.plugin.saveSettings();
        this.plugin.refreshRankView();
        new Notice("You have escaped Tartarus using 3 discipline tokens!");
        this.close();
      };
    }

    // Initialize penance tasks if empty
    if (settings.tartarusPenanceTasks.length === 0) {
      settings.tartarusPenanceTasks = getPenanceTasksForTier(settings.currentTier);
    }

    const requiredTasks = settings.currentTier <= 4 ? 3 : settings.currentTier <= 12 ? 4 : 5;
    const minDays = requiredTasks;

    contentEl.createEl("div", {
      text: `Select and complete ${requiredTasks} tasks (minimum ${minDays} days)`,
      attr: {
        style: `
          margin-bottom: 12px;
          font-weight: 600;
          opacity: 0.9;
        `
      }
    });

    // Render each task
    settings.tartarusPenanceTasks.forEach((task, index) => {
      const taskBox = contentEl.createDiv({
        attr: {
          style: `
            margin-bottom: 12px;
            padding: 12px;
            border-radius: 8px;
            border: 1px solid var(--background-modifier-border);
            background: ${task.completed ? 'rgba(34, 197, 94, 0.1)' : 'transparent'};
          `
        }
      });

      new Setting(taskBox)
        .setName(task.description)
        .addToggle(toggle => 
          toggle
            .setValue(task.completed)
            .onChange(async (value) => {
              task.completed = value;
              await this.plugin.saveSettings();
              this.onOpen(); // Re-render
            })
        );

      // Token skip button
      if (!task.completed && settings.disciplineTokens > 0) {
        const skipBtn = taskBox.createEl("button", {
          text: "Spend 1 Token to Skip",
          attr: {
            style: `
              margin-top: 8px;
              padding: 4px 8px;
              background: rgba(139, 92, 246, 0.2);
              border: 1px solid #8B5CF6;
              border-radius: 4px;
              cursor: pointer;
              font-size: 0.85em;
            `
          }
        });

        skipBtn.onclick = async () => {
          task.completed = true;
          settings.disciplineTokens--;
          await this.plugin.saveSettings();
          this.onOpen();
          new Notice("Task skipped using 1 discipline token");
        };
      }
    });

    // Check if can escape
    const completedCount = settings.tartarusPenanceTasks.filter(t => t.completed).length;
    const daysInTartarus = settings.tartarusStartDate
      ? Math.floor((Date.now() - new Date(settings.tartarusStartDate).getTime()) / (24 * 60 * 60 * 1000))
      : 0;

    if (completedCount >= requiredTasks && daysInTartarus >= minDays) {
      const escapeBtn = contentEl.createEl("button", {
        text: "Escape Tartarus",
        attr: {
          style: `
            width: 100%;
            padding: 12px;
            margin-top: 16px;
            background: #22C55E;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 700;
            font-size: 1.1em;
          `
        }
      });

      escapeBtn.onclick = async () => {
        settings.inTartarus = false;
        settings.tartarusPenanceTasks = [];
        settings.tartarusStartDate = null;
        await this.plugin.saveSettings();
        this.plugin.refreshRankView();
        new Notice("You have escaped Tartarus! The boss awaits...");
        this.close();
      };
    } else {
      contentEl.createEl("div", {
        text: `Need: ${requiredTasks - completedCount} more tasks, ${Math.max(0, minDays - daysInTartarus)} more days`,
        attr: {
          style: `
            margin-top: 16px;
            padding: 8px;
            background: rgba(239, 68, 68, 0.1);
            border-radius: 4px;
            text-align: center;
            font-weight: 600;
          `
        }
      });
    }
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

/* ======================
   MORPHEUS ORACLE MODAL
====================== */

class MorpheusModal extends Modal {
  plugin: TrackHabitRankPlugin;
  directive: MorpheusDirective | null = null;

  constructor(app: App, plugin: TrackHabitRankPlugin) {
    super(app);
    this.plugin = plugin;
  }

  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    // Load directive
    this.directive = await getMorpheusDirective(this.app, this.plugin.settings);
    this.plugin.settings.lastMorpheusSummon = todayISO();
    this.plugin.settings.lastQuoteShown = this.directive.quote;
    await this.plugin.saveSettings();

    // Container styling
    contentEl.style.cssText = `
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 30px;
      text-align: center;
      background: linear-gradient(180deg, #0a0a0a 0%, #050505 100%);
      border: 2px solid #2a3a2d;
      position: relative;
    `;

    // Time-based greeting
    const greeting = getGreeting("Valantis");
    const greetingEl = contentEl.createEl("div", {
      text: greeting,
      attr: {
        style: `
          font-size: 1.1em;
          color: #7a9a7d;
          margin-bottom: 30px;
          font-family: "Georgia", serif;
          letter-spacing: 0.5px;
        `
      }
    });

    // Divider
    contentEl.createEl("div", {
      attr: {
        style: `
          width: 80%;
          height: 1px;
          background: linear-gradient(90deg, transparent, #2a3a2d, transparent);
          margin: 0 auto 30px auto;
        `
      }
    });

    // THE DIRECTIVE header
    contentEl.createEl("div", {
      text: "THE DIRECTIVE",
      attr: {
        style: `
          font-size: 0.75em;
          letter-spacing: 0.3em;
          color: #5a6a5d;
          margin-bottom: 20px;
          text-transform: uppercase;
          font-family: "Times New Roman", serif;
        `
      }
    });

    // Activity command
    const activityEl = contentEl.createEl("div", {
      text: this.directive.activity,
      attr: {
        style: `
          font-size: 2em;
          font-weight: 700;
          color: #7a9a7d;
          margin-bottom: 16px;
          font-family: "Times New Roman", serif;
          text-transform: uppercase;
          letter-spacing: 2px;
        `
      }
    });

    // Reason
    contentEl.createEl("div", {
      text: this.directive.reason,
      attr: {
        style: `
          font-size: 1.1em;
          color: #8aaa8d;
          margin-bottom: 12px;
          font-family: "Georgia", serif;
          font-style: italic;
        `
      }
    });

    // Mythological context
    contentEl.createEl("div", {
      text: this.directive.mythContext,
      attr: {
        style: `
          font-size: 0.95em;
          color: #5a6a5d;
          margin-bottom: 30px;
          line-height: 1.6;
          font-family: "Georgia", serif;
          font-style: italic;
        `
      }
    });

    // Divider
    contentEl.createEl("div", {
      attr: {
        style: `
          width: 80%;
          height: 1px;
          background: linear-gradient(90deg, transparent, #2a3a2d, transparent);
          margin: 0 auto 30px auto;
        `
      }
    });

    // Boss status (if relevant)
    const boss = getBossForTier(this.plugin.settings.currentTier);
    const bossHPPercent = Math.round((this.plugin.settings.bossCurrentHP / this.plugin.settings.bossMaxHP) * 100);

    if (boss) {
      contentEl.createEl("div", {
        text: `${boss.name} — ${this.plugin.settings.bossCurrentHP}/${this.plugin.settings.bossMaxHP} HP (${bossHPPercent}%)`,
        attr: {
          style: `
            font-size: 0.85em;
            color: #5a6a5d;
            margin-bottom: 20px;
            font-family: "Times New Roman", serif;
            letter-spacing: 1px;
          `
        }
      });
    }

    // Divider
    contentEl.createEl("div", {
      attr: {
        style: `
          width: 80%;
          height: 1px;
          background: linear-gradient(90deg, transparent, #2a3a2d, transparent);
          margin: 0 auto 30px auto;
        `
      }
    });

    // Stoic quote
    const quoteEl = contentEl.createEl("blockquote", {
      text: this.directive.quote,
      attr: {
        style: `
          font-size: 0.9em;
          color: #7a9a7d;
          font-style: italic;
          font-family: "Georgia", serif;
          line-height: 1.6;
          border-left: 2px solid #2a3a2d;
          padding-left: 16px;
          margin: 0 auto;
          max-width: 90%;
        `
      }
    });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

/* ======================
   TEMPLE UPKEEP MODAL
====================== */

class TempleModal extends Modal {
  plugin: TrackHabitRankPlugin;

  constructor(app: App, plugin: TrackHabitRankPlugin) {
    super(app);
    this.plugin = plugin;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    new Setting(contentEl)
      .setName("Temple Upkeep")
      .setDesc("Maintenance tasks for the vessel")
      .setHeading();

    const settings = this.plugin.settings;

    // Initialize temple tasks if empty
    if (settings.templeTasks.length === 0) {
      settings.templeTasks = DEFAULT_SETTINGS.templeTasks;
    }

    settings.templeTasks.forEach(task => {
      const taskBox = contentEl.createDiv({
        attr: {
          style: `
            margin-bottom: 16px;
            padding: 16px;
            border-radius: 8px;
            border: 1px solid var(--background-modifier-border);
            background: ${this.getTaskStatusColor(task)};
          `
        }
      });

      const status = this.getTaskStatus(task);
      const statusEmoji = this.getTaskStatusEmoji(status);

      new Setting(taskBox)
        .setName(`${task.emoji} ${task.name}`)
        .setDesc(`${statusEmoji} ${status} — Every ${task.intervalDays} day${task.intervalDays > 1 ? 's' : ''}`)
        .addButton(btn =>
          btn
            .setButtonText("Mark Complete")
            .onClick(async () => {
              task.lastCompleted = todayISO();
              await this.plugin.saveSettings();
              this.onOpen(); // Re-render
              new Notice(`${task.name} marked complete`);
            })
        );
    });
  }

  getTaskStatus(task: TempleTask): string {
    if (!task.lastCompleted) return "Never completed";

    const lastDate = new Date(task.lastCompleted);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastDate.setHours(0, 0, 0, 0);

    const daysSince = Math.floor((today.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000));

    if (daysSince === 0) return "Completed today";
    if (daysSince < task.intervalDays) return `Fresh (${daysSince}d ago)`;
    if (daysSince === task.intervalDays) return "Due today";
    return `Overdue (${daysSince}d ago)`;
  }

  getTaskStatusEmoji(status: string): string {
    if (status.includes("today")) return "✓";
    if (status.includes("Fresh")) return "✓";
    if (status.includes("Due")) return "⚠️";
    if (status.includes("Overdue")) return "❗";
    return "○";
  }

  getTaskStatusColor(task: TempleTask): string {
    const status = this.getTaskStatus(task);
    if (status.includes("Overdue")) return "rgba(239, 68, 68, 0.1)";
    if (status.includes("Due")) return "rgba(245, 158, 11, 0.1)";
    if (status.includes("Fresh") || status.includes("today")) return "rgba(34, 197, 94, 0.1)";
    return "transparent";
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

/* ======================
   SETTINGS TAB
====================== */

class TrackRankSettingTab extends PluginSettingTab {
  plugin: TrackHabitRankPlugin;

  constructor(app: App, plugin: TrackHabitRankPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Mythological Habit Tracker")
      .setDesc("Configure your activities and boss progression")
      .setHeading();

    // Boss reset button
    new Setting(containerEl)
      .setName("Reset boss progression")
      .setDesc("⚠️ Resets to Tier 1 and full HP")
      .addButton(btn =>
        btn
          .setButtonText("Reset")
          .setWarning()
          .onClick(async () => {
            this.plugin.settings.currentTier = 1;
            const weeklyTarget = this.calculateWeeklyTarget();
            this.plugin.settings.bossMaxHP = calculateBossHP(weeklyTarget, 1);
            this.plugin.settings.bossCurrentHP = this.plugin.settings.bossMaxHP;
            this.plugin.settings.consecutivePerfectWeeks = 0;
            this.plugin.settings.disciplineTokens = 0;
            this.plugin.settings.inTartarus = false;
            await this.plugin.saveSettings();
            this.plugin.refreshRankView();
            new Notice("Boss progression reset to Tier 1");
          })
      );

    new Setting(containerEl)
      .setName("Default activities")
      .setHeading();

    ACTIVITIES.forEach(activity => {
      new Setting(containerEl)
        .setName(activity.name)
        .setDesc(`${activity.folder} - Target: ${activity.weeklyTarget}/week`)
        .addToggle(toggle =>
          toggle
            .setValue(
              this.plugin.settings.enabledActivities[activity.name] ?? true
            )
            .onChange(async value => {
              const currentlyEnabled = this.plugin.settings.enabledActivities[activity.name] ?? true;
              const aboutToDisable = currentlyEnabled && !value;
              
              if (aboutToDisable) {
                const completions = getCompletionsFromFolder(
                  this.app,
                  activity.folder,
                  activity.field
                );
                
                let result: StreakResult;
                if (activity.trackingMode === 'weekly' && activity.hpPerWeek) {
                  result = calculateWeeklyStreak(
                    completions,
                    activity.hpPerWeek
                  );
                } else {
                  result = calculateLiveStreakWithDecay(
                    completions,
                    activity.hpPerDay,
                    activity.penaltyPerDay
                  );
                }
                
                const completedDates = completions
                  .filter(c => c.completed)
                  .map(c => new Date(c.date))
                  .sort((a, b) => b.getTime() - a.getTime());
                
                let historicalCount = 0;
                let historicalHP = 0;
                
                if (activity.trackingMode === 'weekly') {
                  historicalCount = Math.max(0, completedDates.length - result.streak);
                  historicalHP = historicalCount * (activity.hpPerWeek || 0);
                } else {
                  if (completedDates.length > 0 && result.streak > 0) {
                    const streakStartDate = new Date(completedDates[0]);
                    streakStartDate.setDate(streakStartDate.getDate() - result.streak + 1);
                    historicalCount = completedDates.filter(d => d < streakStartDate).length;
                  } else {
                    historicalCount = completedDates.length;
                  }
                  historicalHP = historicalCount * activity.hpPerDay;
                }
                
                const totalHP = historicalHP + result.hp;
                
                this.plugin.settings.activitySnapshots[activity.name] = {
                  activityId: activity.name,
                  disabledDate: todayISO(),
                  frozenHP: totalHP,
                  frozenStreak: result.streak
                };
              }
              
              if (!aboutToDisable && value) {
                delete this.plugin.settings.activitySnapshots[activity.name];
              }
              
              this.plugin.settings.enabledActivities[activity.name] = value;
              
              // Recalculate boss HP for current tier
              const weeklyTarget = this.calculateWeeklyTarget();
              this.plugin.settings.bossMaxHP = calculateBossHP(weeklyTarget, this.plugin.settings.currentTier);
              
              await this.plugin.saveSettings();
              this.plugin.refreshRankView();
            })
        );
    });

    new Setting(containerEl)
      .setName("Custom habits")
      .setHeading();

    new Setting(containerEl)
      .setName("Add custom habit")
      .setDesc("Track any checkbox-based habit")
      .addButton(btn =>
        btn
          .setButtonText("Add habit")
          .setCta()
          .onClick(async () => {
            this.plugin.settings.customHabits.push({
              id: crypto.randomUUID(),
              name: "New habit",
              folder: "",
              field: "",
              hpPerDay: 1,
              penaltyPerDay: 2,
              enabled: true
            });

            await this.plugin.saveSettings();
            this.display();
          })
      );

    this.plugin.settings.customHabits.forEach((habit, index) => {
      const box = containerEl.createDiv({
        attr: {
          style: `
            margin-top: 12px;
            padding: 12px;
            border-radius: 8px;
            border: 1px solid var(--background-modifier-border);
          `
        }
      });

      new Setting(box)
        .setName("Enabled")
        .addToggle(t =>
          t
            .setValue(habit.enabled)
            .onChange(async v => {
              const currentlyEnabled = habit.enabled;
              const aboutToDisable = currentlyEnabled && !v;
              
              if (aboutToDisable) {
                const completions = getCompletionsFromFolder(
                  this.app,
                  habit.folder,
                  habit.field
                );
                
                let result: StreakResult;
                if (habit.trackingMode === 'weekly' && habit.hpPerWeek) {
                  result = calculateWeeklyStreak(
                    completions,
                    habit.hpPerWeek
                  );
                } else {
                  result = calculateLiveStreakWithDecay(
                    completions,
                    habit.hpPerDay,
                    habit.penaltyPerDay
                  );
                }
                
                const completedDates = completions
                  .filter(c => c.completed)
                  .map(c => new Date(c.date))
                  .sort((a, b) => b.getTime() - a.getTime());
                
                let historicalCount = 0;
                let historicalHP = 0;
                
                if (habit.trackingMode === 'weekly') {
                  historicalCount = Math.max(0, completedDates.length - result.streak);
                  historicalHP = historicalCount * (habit.hpPerWeek || 0);
                } else {
                  if (completedDates.length > 0 && result.streak > 0) {
                    const streakStartDate = new Date(completedDates[0]);
                    streakStartDate.setDate(streakStartDate.getDate() - result.streak + 1);
                    historicalCount = completedDates.filter(d => d < streakStartDate).length;
                  } else {
                    historicalCount = completedDates.length;
                  }
                  historicalHP = historicalCount * habit.hpPerDay;
                }
                
                const totalHP = historicalHP + result.hp;
                
                this.plugin.settings.activitySnapshots[habit.id] = {
                  activityId: habit.id,
                  disabledDate: todayISO(),
                  frozenHP: totalHP,
                  frozenStreak: result.streak
                };
              }
              
              if (!aboutToDisable && v) {
                delete this.plugin.settings.activitySnapshots[habit.id];
              }
              
              habit.enabled = v;
              await this.plugin.saveSettings();
              this.plugin.refreshRankView();
            })
        );

      new Setting(box)
        .setName("Name")
        .addText(t =>
          t
            .setPlaceholder("Habit name")
            .setValue(habit.name)
            .onChange(async v => {
              habit.name = v;
              await this.plugin.saveSettings();
            })
        );

      new Setting(box)
        .setName("Folder")
        .setDesc("Folder containing 'YYYY-MM-DD' notes")
        .addText(t =>
          t
            .setPlaceholder("Personal Life/01 Workout")
            .setValue(habit.folder)
            .onChange(async v => {
              habit.folder = v;
              await this.plugin.saveSettings();
            })
        );

      new Setting(box)
        .setName("Property")
        .setDesc("Checkbox property name")
        .addText(t =>
          t
            .setPlaceholder("Workout")
            .setValue(habit.field)
            .onChange(async v => {
              habit.field = v;
              await this.plugin.saveSettings();
            })
        );

      new Setting(box)
        .setName("HP / day")
        .addText(t =>
          t
            .setValue(String(habit.hpPerDay))
            .onChange(async v => {
              habit.hpPerDay = Number(v) || 0;
              await this.plugin.saveSettings();
              this.plugin.refreshRankView();
            })
        );

      new Setting(box)
        .setName("Tracking mode")
        .setDesc("Daily = consecutive days, weekly = 1+ per week")
        .addDropdown(d =>
          d
            .addOption('daily', 'Daily')
            .addOption('weekly', 'Weekly')
            .setValue(habit.trackingMode || 'daily')
            .onChange(async v => {
              habit.trackingMode = v as 'daily' | 'weekly';
              await this.plugin.saveSettings();
              this.plugin.refreshRankView();
            })
        );

      if (habit.trackingMode === 'weekly') {
        new Setting(box)
          .setName("HP / week")
          .addText(t =>
            t
              .setValue(String(habit.hpPerWeek || 7))
              .onChange(async v => {
                habit.hpPerWeek = Number(v) || 0;
                await this.plugin.saveSettings();
                this.plugin.refreshRankView();
              })
          );
      }

      new Setting(box)
        .addButton(btn =>
          btn
            .setButtonText("Delete")
            .setWarning()
            .onClick(async () => {
              this.plugin.settings.customHabits.splice(index, 1);
              await this.plugin.saveSettings();
              this.display();
              this.plugin.refreshRankView();
            })
        );
    });
  }

  calculateWeeklyTarget(): number {
    const allActivities = [
      ...ACTIVITIES.filter(a => this.plugin.settings.enabledActivities[a.name] ?? true),
      ...this.plugin.settings.customHabits.filter(h => h.enabled)
    ];
    
    return allActivities.reduce((sum, a) => {
      return sum + (a.weeklyTarget || 7);
    }, 0);
  }
}

/* ======================
   PLUGIN
====================== */

export default class TrackHabitRankPlugin extends Plugin {
  settings!: TrackRankSettings;

  async onload() {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      await this.loadData()
    );

    // Data migration: rename RR fields to HP
    await this.migrateSettings();

    this.registerView(
      VIEW_TYPE_RANK,
      (leaf) => new TrackRankView(leaf, this)
    );

    const refresh = debounce(async () => {
      await this.checkBossDefeated();
      await this.checkDeathThreshold();
      await this.checkPerfectWeek();
      await this.saveSettings();
      this.refreshRankView();
    }, 300);

    this.registerEvent(
      this.app.metadataCache.on("changed", refresh)
    );

    this.addCommand({
      id: "open-boss-dashboard",
      name: "Open boss dashboard",
      callback: () => this.activateView()
    });

    this.addCommand({
      id: "manual-damage-test",
      name: "[DEV] Deal 5 damage to boss",
      callback: async () => {
        if (this.settings.inTartarus) {
          new Notice("Cannot deal damage while in Tartarus");
          return;
        }
        await this.dealDamage(5, false);
        new Notice("💥 5 damage dealt to boss (manual test)");
      }
    });

    this.addCommand({
      id: "add-discipline-token",
      name: "[DEV] Add discipline token",
      callback: async () => {
        this.settings.disciplineTokens = Math.min(3, this.settings.disciplineTokens + 1);
        await this.saveSettings();
        this.refreshRankView();
        new Notice(`💎 Token added (${this.settings.disciplineTokens}/3)`);
      }
    });

    this.addCommand({
      id: "test-perfect-week",
      name: "[DEV] Toggle perfect week streak",
      callback: async () => {
        this.settings.consecutivePerfectWeeks =
          (this.settings.consecutivePerfectWeeks + 1) % 6; // Cycle 0-5
        await this.saveSettings();
        this.refreshRankView();
        new Notice(`Perfect weeks: ${this.settings.consecutivePerfectWeeks}`);
      }
    });

    this.addCommand({
      id: "summon-morpheus",
      name: "Summon Morpheus",
      callback: () => {
        new MorpheusModal(this.app, this).open();
      }
    });

    this.addCommand({
      id: "open-temple-upkeep",
      name: "Open Temple Upkeep",
      callback: () => {
        new TempleModal(this.app, this).open();
      }
    });

    this.addSettingTab(new TrackRankSettingTab(this.app, this));
  }

  async migrateSettings() {
    // Check if old RR fields exist and convert to HP
    const data = this.settings as any;
    
    if (data.rankGraceRR !== undefined) {
      data.rankGraceHP = data.rankGraceRR;
      delete data.rankGraceRR;
    }
    
    // Migrate snapshots if they use old field names
    if (data.activitySnapshots) {
      Object.values(data.activitySnapshots).forEach((snap: any) => {
        if (snap.frozenRR !== undefined && snap.frozenHP === undefined) {
          snap.frozenHP = snap.frozenRR;
          delete snap.frozenRR;
        }
      });
    }
    
    if (data.snapshots) {
      data.snapshots.forEach((snap: any) => {
        if (snap.totalRR !== undefined && snap.totalHP === undefined) {
          snap.totalHP = snap.totalRR;
          snap.liveHP = snap.liveRR || 0;
          snap.historicalHP = snap.historicalRR || 0;
          delete snap.totalRR;
          delete snap.liveRR;
          delete snap.historicalRR;
        }
      });
    }

    // Initialize boss HP if not set
    if (!this.settings.bossMaxHP || this.settings.bossMaxHP === 0) {
      const weeklyTarget = this.calculateWeeklyTarget();
      this.settings.bossMaxHP = calculateBossHP(weeklyTarget, this.settings.currentTier);
      this.settings.bossCurrentHP = this.settings.bossMaxHP;
    }
    
    await this.saveSettings();
  }

  calculateWeeklyTarget(): number {
    const allActivities = [
      ...ACTIVITIES.filter(a => this.settings.enabledActivities[a.name] ?? true),
      ...this.settings.customHabits.filter(h => h.enabled)
    ];
    
    return allActivities.reduce((sum, a) => {
      return sum + (a.weeklyTarget || 7);
    }, 0);
  }

  async dealDamage(damage: number, isDiscipline: boolean) {
    this.settings.bossCurrentHP = Math.max(0, this.settings.bossCurrentHP - damage);
    await this.saveSettings();
    await this.checkBossDefeated();
    this.refreshRankView();
  }

  async checkBossDefeated() {
    if (this.settings.bossCurrentHP <= 0 && this.settings.currentTier < 26) {
      // Boss defeated!
      const oldTier = this.settings.currentTier;
      const boss = getBossForTier(oldTier);
      
      // Advance to next tier (skip 1 if defeating first tier of a boss pair)
      const isFirstTierOfBoss = boss && oldTier === boss.tier[0];
      this.settings.currentTier = isFirstTierOfBoss ? oldTier + 1 : oldTier + 1;
      
      // If we just completed both tiers of a boss, advance to next boss
      if (boss && oldTier === boss.tier[1]) {
        this.settings.currentTier = oldTier + 1;
      }
      
      // Calculate new boss HP
      const weeklyTarget = this.calculateWeeklyTarget();
      this.settings.bossMaxHP = calculateBossHP(weeklyTarget, this.settings.currentTier);
      this.settings.bossCurrentHP = this.settings.bossMaxHP;
      
      const newRank = getRankNameForTier(this.settings.currentTier);
      const newBoss = getBossForTier(this.settings.currentTier);
      
      await this.saveSettings();
      
      new Notice(`🎉 Boss Defeated! You are now ${newRank}! Face ${newBoss?.name}!`);
    }
  }

  async checkDeathThreshold() {
    if (this.settings.inTartarus) return;

    const belowThreshold = checkDeathThreshold(this.app, this.settings);

    if (belowThreshold) {
      this.settings.failedThresholdDays++;

      if (this.settings.failedThresholdDays >= 3) {
        enterTartarus(this.settings);
        await this.saveSettings();
        this.refreshRankView();
      }
    } else {
      this.settings.failedThresholdDays = 0;
    }
  }

  async checkPerfectWeek() {
    if (this.settings.inTartarus) return;

    const isPerfectWeek = checkPerfectWeek(this.app, this.settings);

    if (isPerfectWeek) {
      this.settings.consecutivePerfectWeeks++;

      // Award discipline token for perfect week (max 3)
      if (this.settings.disciplineTokens < 3) {
        this.settings.disciplineTokens++;
        new Notice(`🔥 Perfect Week! Discipline token earned (${this.settings.disciplineTokens}/3)`);
      } else {
        new Notice(`🔥 Perfect Week! Streak: ${this.settings.consecutivePerfectWeeks}`);
      }

      await this.saveSettings();
      this.refreshRankView();
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async activateView() {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(VIEW_TYPE_RANK)[0];
    
    if (!leaf) {
      const rightLeaf = workspace.getRightLeaf(false);
      if (!rightLeaf) return;
      await rightLeaf.setViewState({ type: VIEW_TYPE_RANK, active: true });
      leaf = rightLeaf;
    }
    
    await workspace.revealLeaf(leaf);
  }

  refreshRankView() {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_RANK);
    leaves.forEach(leaf => {
      const view = leaf.view as TrackRankView;
      view.render();
    });
  }

  onunload() {
    // Cleanup if needed
  }
}