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

// Helper function for async delays
const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/* ======================
   DEBUG LOGGER (Ring Buffer)
====================== */

type LogCategory = 'CALC' | 'META' | 'TIME' | 'DMG' | 'THRESH' | 'SAVE' | 'PAUSE' | 'DEV';

interface LogEntry {
  timestamp: Date;
  category: LogCategory;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * DebugLogger - Ring buffer for internal event logging
 *
 * Stores the last 100 log entries with timestamps and categories.
 * Used by Developer Dashboard to show real-time calculation insights.
 *
 * Categories:
 * - CALC: Streak/HP calculations
 * - META: Metadata cache events
 * - TIME: Effective time calculations
 * - DMG: Damage dealt to boss
 * - THRESH: Death threshold checks
 * - SAVE: Settings save events
 * - PAUSE: Pause/resume events
 * - DEV: Developer actions
 */
class DebugLogger {
  private static instance: DebugLogger;
  private buffer: LogEntry[] = [];
  private readonly maxSize = 100;
  private enabled = true;

  private constructor() {}

  static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger();
    }
    return DebugLogger.instance;
  }

  /**
   * Logs a message to the ring buffer.
   */
  log(category: LogCategory, message: string, data?: Record<string, unknown>) {
    if (!this.enabled) return;

    const entry: LogEntry = {
      timestamp: new Date(),
      category,
      message,
      data
    };

    this.buffer.push(entry);

    // Ring buffer: remove oldest if over max size
    if (this.buffer.length > this.maxSize) {
      this.buffer.shift();
    }
  }

  /**
   * Gets all log entries (oldest first).
   */
  getAll(): LogEntry[] {
    return [...this.buffer];
  }

  /**
   * Gets log entries filtered by category.
   */
  getByCategory(category: LogCategory): LogEntry[] {
    return this.buffer.filter(e => e.category === category);
  }

  /**
   * Gets the last N log entries (newest first).
   */
  getLast(count: number): LogEntry[] {
    return this.buffer.slice(-count).reverse();
  }

  /**
   * Clears all log entries.
   */
  clear() {
    this.buffer = [];
  }

  /**
   * Enables or disables logging.
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  /**
   * Formats a log entry for display.
   */
  static formatEntry(entry: LogEntry): string {
    const time = entry.timestamp.toISOString().slice(11, 19); // HH:MM:SS
    const dataStr = entry.data ? ` | ${JSON.stringify(entry.data)}` : '';
    return `[${time}] [${entry.category}] ${entry.message}${dataStr}`;
  }
}

// Global logger instance
const debugLog = DebugLogger.getInstance();

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
  image?: string;  // Optional image path or URL
}

// Custom boss override - allows user to customize any boss
interface CustomBossOverride {
  tier: number;  // Which boss tier to override (1-13, where 1 = tiers 1-2, 2 = tiers 3-4, etc.)
  name?: string;
  ranks?: [string, string];
  description?: string;
  lore?: string;
  image?: string;
}

// Allows editing default activities (name, folder, field, damage values, etc.)
interface ActivityOverride {
  originalName: string;  // The original activity name to override
  name?: string;
  folder?: string;
  field?: string;
  damagePerCompletion?: number;
  weeklyTarget?: number;
  trackingMode?: 'daily' | 'weekly';
  damagePerWeek?: number;
}

// Tartarus task tier ranges: "low" (1-4), "mid" (5-12), "high" (13+)
type TartarusTierRange = "low" | "mid" | "high";

interface CustomTartarusTasks {
  tierRange: TartarusTierRange;
  tasks: { id: string; description: string }[];
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

/**
 * Gets the boss for a tier with custom overrides applied.
 * @param tier - The tier number (1-26)
 * @param settings - Plugin settings containing customBosses
 * @returns Boss with custom overrides merged in, or null if not found
 */
function getCustomizedBossForTier(tier: number, settings: TrackRankSettings): Boss | null {
  const baseBoss = getBossForTier(tier);
  if (!baseBoss) return null;

  // Find the boss index (1-13) from the tier
  const bossIndex = Math.ceil(tier / 2);

  // Look for custom override
  const override = settings.customBosses?.find(c => c.tier === bossIndex);
  if (!override) return baseBoss;

  // Merge override with base boss
  return {
    ...baseBoss,
    name: override.name || baseBoss.name,
    ranks: override.ranks || baseBoss.ranks,
    description: override.description || baseBoss.description,
    lore: override.lore || baseBoss.lore,
    image: override.image || baseBoss.image
  };
}

function getRankNameForTier(tier: number, settings?: TrackRankSettings): string {
  const boss = settings ? getCustomizedBossForTier(tier, settings) : getBossForTier(tier);
  if (!boss) return "Unranked";
  const isFirstTier = tier === boss.tier[0];
  return isFirstTier ? boss.ranks[0] : boss.ranks[1];
}

/**
 * Calculate boss HP based on tier and settings.
 * Two modes:
 * 1. Auto Dynamic HP: Tier 1 = lowest weeklyTarget × 4, Max tier = total weekly × multiplier
 * 2. Manual: Linear interpolation between min/max multipliers
 */
function calculateBossHP(
  weeklyTarget: number,
  tier: number,
  settings?: TrackRankSettings,
  lowestWeeklyTarget?: number
): number {
  const maxTier = settings?.maxTier ?? 14;

  // Auto Dynamic HP mode
  if (settings?.useAutoDynamicHP && lowestWeeklyTarget !== undefined) {
    // Tier 1 HP = lowest activity's weekly target × 4 (monthly goal)
    const tier1HP = lowestWeeklyTarget * 4;
    // Max tier HP = total weekly target × multiplier
    const maxTierHP = weeklyTarget * (settings.autoDynamicHPMaxMultiplier ?? 1.5);

    // Linear interpolation between tier 1 and max tier
    const progress = (tier - 1) / Math.max(1, maxTier - 1);
    const hp = tier1HP + (maxTierHP - tier1HP) * progress;

    return Math.round(hp);
  }

  // Manual multiplier mode (original behavior)
  const minMult = settings?.bossHPMultiplierMin ?? 1.1;
  const maxMult = settings?.bossHPMultiplierMax ?? 2.4;

  // Linear interpolation between min and max multiplier based on tier
  const progress = (tier - 1) / Math.max(1, maxTier - 1);
  const multiplier = minMult + (maxMult - minMult) * progress;

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
  damagePerCompletion: number;  // Damage dealt to boss per completion
  enabled: boolean;
  trackingMode?: 'daily' | 'weekly';
  damagePerWeek?: number;  // For weekly tracking mode
  weeklyTarget?: number;
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
  damagePerCompletion: number;  // Damage dealt to boss per completion
  trackingMode?: 'daily' | 'weekly';
  damagePerWeek?: number;  // For weekly tracking mode
  weeklyTarget?: number;
  _originalName?: string; // Internal: tracks original name for overridden activities
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

/* ======================
   REWARD SYSTEM TYPES
====================== */

type RewardTier = 'micro' | 'mini' | 'standard' | 'quality' | 'premium';
type RewardType = 'activity' | 'boss' | 'streak';

interface RewardOption {
  id: string;
  description: string;
}

interface RewardPool {
  tier: RewardTier;
  options: RewardOption[];
}

interface ClaimedReward {
  id: string;
  description: string;
  rewardTier: RewardTier;
  rewardType: RewardType;
  claimedAt: string;  // ISO timestamp
  expiresAt: string;  // ISO timestamp (7 days after earning)
  earnedAt: string;   // ISO timestamp when earned
  used: boolean;
}

interface PendingReward {
  id: string;
  rewardTier: RewardTier;
  rewardType: RewardType;
  earnedAt: string;   // ISO timestamp
  expiresAt: string;  // ISO timestamp (7 days from earned)
}

interface BankedReward {
  id: string;
  rewardTier: RewardTier;
  rewardType: RewardType;
  bankedAt: string;   // ISO timestamp
}

// Reward thresholds by tier
interface RewardThresholds {
  activityInterval: number;  // Activities needed per reward
  streakInterval: number;    // Perfect weeks needed per reward
}

const REWARD_THRESHOLDS: Record<RewardTier, RewardThresholds> = {
  micro:    { activityInterval: 1,  streakInterval: 1 },  // Tiers 1-4
  mini:     { activityInterval: 3,  streakInterval: 2 },  // Tiers 5-10
  standard: { activityInterval: 8,  streakInterval: 3 },  // Tiers 11-16
  quality:  { activityInterval: 15, streakInterval: 4 },  // Tiers 17-22
  premium:  { activityInterval: 30, streakInterval: 5 },  // Tiers 23-26
};

function getRewardTierForPlayerTier(playerTier: number): RewardTier {
  if (playerTier <= 4) return 'micro';
  if (playerTier <= 10) return 'mini';
  if (playerTier <= 16) return 'standard';
  if (playerTier <= 22) return 'quality';
  return 'premium';
}

function canBankRewards(playerTier: number): boolean {
  return playerTier >= 11;
}

function getMaxBankedRewards(): number {
  return 3;
}

interface TrackRankSettings {
  enabledActivities: Record<string, boolean>;
  customHabits: CustomHabitConfig[];
  activityOverrides: ActivityOverride[];  // Overrides for default activities

  // Boss system
  currentTier: number;
  bossMaxHP: number;
  bossCurrentHP: number;
  tierAdvancedAt50Percent: boolean; // Tracks if tier was advanced when boss dropped below 50% HP

  // Bonus systems
  consecutivePerfectWeeks: number;
  disciplineTokens: number;
  disciplineCompletionCount: number; // Tracks discipline completions for token earning (every 5 = 1 token)

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

  // Pause System - freezes all time-dependent mechanics
  systemState: 'active' | 'paused';
  pauseStartTime: string | null;  // ISO timestamp when paused
  totalPausedTime: number;        // Accumulated milliseconds paused

  // Developer tools - date simulation
  simulatedDate: string | null;   // ISO date for testing (overrides getEffectiveNow)

  // Boss customization
  customBosses: CustomBossOverride[];
  customTartarusTasks: CustomTartarusTasks[];
  tartarusImage: string | null;  // Custom image URL for Tartarus display
  hadesWrathApplied: boolean;    // True if tasks were doubled due to Hades Wrath

  // Direct damage tracking - counts completions per activity to detect new ones
  lastCompletionCounts: Record<string, number>;

  // Boss HP scaling - affects difficulty progression
  useAutoDynamicHP: boolean;    // If true, auto-calculate HP based on least demanding activity
  autoDynamicHPMaxMultiplier: number;  // Multiplier for max tier when using auto HP (default 1.5)
  bossHPMultiplierMin: number;  // HP multiplier at Tier 1 (default 1.1) - used when NOT auto
  bossHPMultiplierMax: number;  // HP multiplier at max tier (default 2.4) - used when NOT auto
  maxTier: number;              // Maximum tier in the system (default 14)

  // Legacy - kept for data migration
  rankGraceHP: number;
  rankGraceDays: number;
  rankBelowSince: string | null;
  activitySnapshots: Record<string, ActivitySnapshot>;

  snapshots: RankSnapshot[];

  // Reward System
  rewardPools: RewardPool[];
  activityRewardCounter: number;      // Tracks activities since last reward
  streakRewardCounter: number;        // Tracks perfect weeks since last streak reward
  pendingRewards: PendingReward[];    // Rewards earned but not yet claimed
  claimedRewards: ClaimedReward[];    // Rewards that have been claimed (with history)
  bankedRewards: BankedReward[];      // Rewards saved for later (tiers 11+)
  lastRewardCheck: string | null;     // ISO timestamp of last reward expiration check
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
  activityOverrides: [],

  currentTier: 1,
  bossMaxHP: 35,
  bossCurrentHP: 35,
  tierAdvancedAt50Percent: false,

  consecutivePerfectWeeks: 0,
  disciplineTokens: 0,
  disciplineCompletionCount: 0,

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

  // Pause system defaults
  systemState: 'active',
  pauseStartTime: null,
  totalPausedTime: 0,

  // Developer tools defaults
  simulatedDate: null,

  // Boss customization defaults
  customBosses: [],
  customTartarusTasks: [],
  tartarusImage: null,
  hadesWrathApplied: false,

  // Direct damage tracking
  lastCompletionCounts: {},

  // Boss HP scaling defaults
  useAutoDynamicHP: false,          // Default: use manual multipliers
  autoDynamicHPMaxMultiplier: 1.5,  // Max tier HP = total weekly × this
  bossHPMultiplierMin: 1.1,         // Tier 1 = weeklyTarget × 1.1 (manual mode)
  bossHPMultiplierMax: 2.4,         // Max tier = weeklyTarget × 2.4 (manual mode)
  maxTier: 14,                      // 7 bosses × 2 tiers each = 14

  rankGraceHP: 20,
  rankGraceDays: 3,
  rankBelowSince: null,
  activitySnapshots: {},
  snapshots: [],

  // Reward System defaults
  rewardPools: [
    {
      tier: 'micro',
      options: [
        { id: 'micro-1', description: '[Add your micro reward 1]' },
        { id: 'micro-2', description: '[Add your micro reward 2]' },
        { id: 'micro-3', description: '[Add your micro reward 3]' },
      ]
    },
    {
      tier: 'mini',
      options: [
        { id: 'mini-1', description: '[Add your mini reward 1]' },
        { id: 'mini-2', description: '[Add your mini reward 2]' },
        { id: 'mini-3', description: '[Add your mini reward 3]' },
      ]
    },
    {
      tier: 'standard',
      options: [
        { id: 'standard-1', description: '[Add your standard reward 1]' },
        { id: 'standard-2', description: '[Add your standard reward 2]' },
        { id: 'standard-3', description: '[Add your standard reward 3]' },
      ]
    },
    {
      tier: 'quality',
      options: [
        { id: 'quality-1', description: '[Add your quality reward 1]' },
        { id: 'quality-2', description: '[Add your quality reward 2]' },
        { id: 'quality-3', description: '[Add your quality reward 3]' },
      ]
    },
    {
      tier: 'premium',
      options: [
        { id: 'premium-1', description: '[Add your premium reward 1]' },
        { id: 'premium-2', description: '[Add your premium reward 2]' },
        { id: 'premium-3', description: '[Add your premium reward 3]' },
      ]
    }
  ],
  activityRewardCounter: 0,
  streakRewardCounter: 0,
  pendingRewards: [],
  claimedRewards: [],
  bankedRewards: [],
  lastRewardCheck: null,
};

function todayISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

/**
 * Gets the effective "now" date accounting for pause system and date simulation.
 *
 * When paused: Returns the time when the system was paused (frozen in time)
 * When active: Returns current time minus total accumulated pause duration
 * When simulated: Returns the simulated date (developer override)
 *
 * @param settings - The plugin settings containing pause state
 * @returns Date object representing the effective current time
 */
function getEffectiveNow(settings: TrackRankSettings): Date {
  // Developer simulation override takes precedence
  if (settings.simulatedDate) {
    const simDate = new Date(settings.simulatedDate);
    simDate.setHours(12, 0, 0, 0); // Midday to avoid timezone issues
    return simDate;
  }

  // When paused, return the moment we paused (time is frozen)
  if (settings.systemState === 'paused' && settings.pauseStartTime) {
    return new Date(settings.pauseStartTime);
  }

  // When active, subtract total paused time to get effective "now"
  // This ensures time appears to have passed normally, excluding paused periods
  return new Date(Date.now() - settings.totalPausedTime);
}

/**
 * Gets today's date as ISO string, accounting for pause system.
 *
 * @param settings - The plugin settings containing pause state
 * @returns ISO date string (YYYY-MM-DD) for the effective "today"
 */
function getEffectiveTodayISO(settings: TrackRankSettings): string {
  const d = getEffectiveNow(settings);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

/**
 * Calculate streak for an activity (consecutive days completed).
 * Used for streak bonus damage multiplier.
 * The "hp" values in return are for backward compatibility/stats display only.
 */
function calculateLiveStreakWithDecay(
  completions: Completion[],
  damagePerCompletion: number,
  asOf?: Date,
  settings?: TrackRankSettings
): StreakResult {
  // Use effective now if settings provided, otherwise fall back to asOf or current time
  const effectiveNow = settings ? getEffectiveNow(settings) : (asOf || new Date());
  const today = new Date(effectiveNow);
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

  // If more than 2 days since last completion, streak is broken
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

    const earned = baseStreak * damagePerCompletion;
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

  const earned = streak * damagePerCompletion;
  return { streak, hp: earned, earned, penalty: 0, penaltyDays: 0 };
}

/**
 * Calculate streak for weekly-tracked activities.
 * Used for streak bonus damage multiplier.
 */
function calculateWeeklyStreak(
  completions: Completion[],
  damagePerWeek: number,
  asOf?: Date,
  settings?: TrackRankSettings
): StreakResult {
  // Use effective now if settings provided, otherwise fall back to asOf or current time
  const effectiveNow = settings ? getEffectiveNow(settings) : (asOf || new Date());
  const today = new Date(effectiveNow);
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

  const earned = streak * damagePerWeek;
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
  // Normalize folder path to ensure exact folder matching (not partial matches)
  const normalizedFolder = folderPath.endsWith('/') ? folderPath : folderPath + '/';

  return files
    .filter((file: TFile) => file.path === folderPath || file.path.startsWith(normalizedFolder))
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

/**
 * Count discipline completions for an activity.
 * Checks for [fieldName]-Type = "discipline" in frontmatter.
 */
function countDisciplineCompletions(
  app: App,
  folderPath: string,
  fieldName: string
): number {
  const files = app.vault.getMarkdownFiles();
  const normalizedFolder = folderPath.endsWith('/') ? folderPath : folderPath + '/';

  let count = 0;
  files
    .filter((file: TFile) => file.path === folderPath || file.path.startsWith(normalizedFolder))
    .forEach((file: TFile) => {
      const cache = app.metadataCache.getFileCache(file);
      const frontmatter = cache?.frontmatter;
      if (!frontmatter) return;

      const completed = frontmatter[fieldName] === true;
      const typeField = `${fieldName}-Type`;
      const type = frontmatter[typeField];

      if (completed && type === 'discipline') {
        count++;
      }
    });

  return count;
}

/**
 * Get damage multiplier based on consecutive perfect weeks.
 * Progression: 1 week = 5%, 2 weeks = 12%, 3 weeks = 20%, 4 weeks = 30%, 5+ weeks = 40%
 * Returns 1.0 for no bonus, 1.05 for 5% bonus, etc.
 */
function getStreakBonusMultiplier(consecutivePerfectWeeks: number): number {
  if (consecutivePerfectWeeks <= 0) return 1.0;
  if (consecutivePerfectWeeks === 1) return 1.05;  // 5% bonus
  if (consecutivePerfectWeeks === 2) return 1.12;  // 12% bonus
  if (consecutivePerfectWeeks === 3) return 1.20;  // 20% bonus
  if (consecutivePerfectWeeks === 4) return 1.30;  // 30% bonus
  return 1.40;  // 40% bonus for 5+ weeks
}

/**
 * Compute activity stats for dashboard display.
 * NOTE: This is now for STATS/DISPLAY ONLY - not for damage calculation.
 * The new direct damage system uses processNewCompletions() instead.
 */
function computeActivityStats(
  app: App,
  settings: TrackRankSettings
) {
  let totalCompletions = 0;

  const breakdown: {
    name: string;
    streak: number;
    completions: number;
  }[] = [];

  const allActivities = [
    ...getEffectiveActivities(settings)
      .filter(a => settings.enabledActivities[a._originalName!] ?? true)
      .map(a => ({
        name: a.name,
        folder: a.folder,
        field: a.field,
        damagePerCompletion: a.damagePerCompletion,
        trackingMode: a.trackingMode,
        damagePerWeek: a.damagePerWeek,
        weeklyTarget: a.weeklyTarget
      })),
    ...settings.customHabits.filter(h => h.enabled)
  ];

  for (const activity of allActivities) {
    const completions = getCompletionsFromFolder(
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
      if (activity.trackingMode === 'weekly' && activity.damagePerWeek) {
        result = calculateWeeklyStreak(
          completions,
          activity.damagePerWeek,
          undefined,
          settings
        );
      } else {
        result = calculateLiveStreakWithDecay(
          completions,
          activity.damagePerCompletion,
          undefined,
          settings
        );
      }
    }

    const completedCount = completions.filter(c => c.completed).length;
    totalCompletions += completedCount;

    breakdown.push({
      name: activity.name,
      streak: result.streak,
      completions: completedCount
    });
  }

  return {
    totalCompletions,
    breakdown
  };
}

// Keep old function name as alias for backward compatibility with existing code
function computeAllActivityHP(
  app: App,
  settings: TrackRankSettings
) {
  const stats = computeActivityStats(app, settings);

  // Convert to old format for backward compatibility
  const breakdown = stats.breakdown.map(b => ({
    name: b.name,
    streak: b.streak,
    hp: b.completions, // completions count as "hp" for display
    penaltyDays: 0
  }));

  return {
    totalHP: stats.totalCompletions,
    historicalHP: stats.totalCompletions,
    liveHP: 0,
    breakdown,
    penalties: []
  };
}

function buildSnapshot(
  app: App,
  settings: TrackRankSettings
) {
  const { totalHP, breakdown } = computeAllActivityHP(app, settings);

  const liveHP = breakdown.reduce((s, b) => s + b.hp, 0);
  const historicalHP = totalHP - liveHP;

  const boss = getCustomizedBossForTier(settings.currentTier, settings);
  const rankName = getRankNameForTier(settings.currentTier, settings);

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
  // If paused, don't check death threshold - time is frozen
  if (settings.systemState === 'paused') {
    return false;
  }

  // Calculate weekly target from all enabled activities
  const allActivities = [
    ...getEffectiveActivities(settings).filter(a => settings.enabledActivities[a._originalName!] ?? true),
    ...settings.customHabits.filter(h => h.enabled)
  ];

  const weeklyTarget = allActivities.reduce((sum, a) => {
    if (a.trackingMode === 'weekly') {
      return sum + 1;
    }
    return sum + (a.weeklyTarget || 7);
  }, 0);

  const requiredCompletions = Math.ceil(weeklyTarget * 0.1); // 10% of weekly target

  // Get last 3 days of activity
  const effectiveNow = getEffectiveNow(settings);
  const today = new Date(effectiveNow);
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 2); // 3 days

  let totalCompletions = 0;

  // Simple: count completions in last 3 days
  for (const activity of allActivities) {
    const completions = getCompletionsFromFolder(app, activity.folder, activity.field);
    completions.forEach(c => {
      if (!c.completed) return;
      const date = new Date(c.date);
      date.setHours(0, 0, 0, 0);
      if (date >= startDate && date <= today) {
        totalCompletions++;
      }
    });
  }

  return totalCompletions < requiredCompletions;
}

// Check perfect week status using effective time (pause-aware)
function checkPerfectWeek(
  app: App,
  settings: TrackRankSettings
): boolean {
  // If paused, don't check perfect week - time is frozen
  if (settings.systemState === 'paused') {
    return false;
  }

  const allActivities = [
    ...getEffectiveActivities(settings).filter(a => settings.enabledActivities[a._originalName!] ?? true),
    ...settings.customHabits.filter(h => h.enabled)
  ];

  // Get current week boundaries (Monday to Sunday) using effective time
  const effectiveNow = getEffectiveNow(settings);
  const today = new Date(effectiveNow);
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

// Get current week progress using effective time (pause-aware)
function getCurrentWeekProgress(
  app: App,
  settings: TrackRankSettings
): { completed: number; target: number; byActivity: Array<{name: string; completed: number; target: number}> } {
  const allActivities = [
    ...getEffectiveActivities(settings).filter(a => settings.enabledActivities[a._originalName!] ?? true),
    ...settings.customHabits.filter(h => h.enabled)
  ];

  // Use effective time for pause-aware calculations
  const effectiveNow = getEffectiveNow(settings);
  const today = new Date(effectiveNow);
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

function enterTartarus(settings: TrackRankSettings) {
  settings.inTartarus = true;
  settings.tartarusStartDate = getEffectiveTodayISO(settings);
  settings.bossCurrentHP = settings.bossMaxHP; // Reset boss
  settings.tartarusPenanceTasks = [];
  settings.failedThresholdDays = 0;
  settings.hadesWrathApplied = false; // Reset Hades Wrath for new Tartarus entry

  new Notice("You have entered TARTARUS. Complete penance to escape.");
}

// Default Tartarus tasks by tier range
const DEFAULT_TARTARUS_TASKS: Record<TartarusTierRange, { id: string; description: string }[]> = {
  low: [
    { id: "cold-shower-3", description: "Cold shower × 3 (separate days)" },
    { id: "fast-16h-3", description: "16-hour fast × 3 (separate days)" },
    { id: "wake-6am-3", description: "Wake before 6 AM × 3 (separate days)" }
  ],
  mid: [
    { id: "cold-shower-5", description: "Cold shower × 5" },
    { id: "fast-20h-3", description: "20-hour fast × 3" },
    { id: "all-activities-2", description: "Complete ALL activities in one day × 2" },
    { id: "pushups-200", description: "200 pushups total (split across 3+ days)" }
  ],
  high: [
    { id: "ice-bath-3", description: "Ice bath (2 minutes) × 3" },
    { id: "fast-24h-2", description: "24-hour fast × 2" },
    { id: "perfect-week", description: "Perfect week (all targets met)" },
    { id: "pushups-500", description: "500 pushups total (split across week)" },
    { id: "custom", description: "Self-designed penance task" }
  ]
};

function getTierRange(tier: number): TartarusTierRange {
  if (tier <= 4) return "low";
  if (tier <= 12) return "mid";
  return "high";
}

function getPenanceTasksForTier(tier: number, settings?: TrackRankSettings): PenanceTask[] {
  const tierRange = getTierRange(tier);

  // Check for custom tasks
  const customTasks = settings?.customTartarusTasks?.find(t => t.tierRange === tierRange);

  // Use custom tasks if available, otherwise use defaults
  const taskTemplates = customTasks?.tasks?.length
    ? customTasks.tasks
    : DEFAULT_TARTARUS_TASKS[tierRange];

  return taskTemplates.map(t => ({
    id: t.id,
    description: t.description,
    completed: false
  }));
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

function getTimeOfDay(settings: TrackRankSettings): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date(getEffectiveNow(settings)).getHours();
  if (hour < 6) return 'night';
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  if (hour < 22) return 'evening';
  return 'night';
}

function getGreeting(settings: TrackRankSettings, name: string = "Warrior"): string {
  const timeOfDay = getTimeOfDay(settings);
  const greetings: Record<string, string> = {
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
    ...getEffectiveActivities(settings).filter(a => settings.enabledActivities[a._originalName!] ?? true),
    ...settings.customHabits.filter(h => h.enabled)
  ];

  const today = new Date(getEffectiveNow(settings));
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
    const mostNeglected = await getMostNeglectedActivity(app, allActivities, settings);
    return {
      activity: mostNeglected?.name || "Any activity",
      reason: "Death approaches. Act now or face Tartarus.",
      mythContext: "The Fates draw near. One more day of weakness and you descend to the depths.",
      priority: 'death',
      quote: await getRandomQuote(app, settings)
    };
  }

  // 2. BOSS PROXIMITY - High priority
  const bossHPPercent = settings.bossCurrentHP / settings.bossMaxHP;
  if (bossHPPercent < 0.15) {
    const boss = getCustomizedBossForTier(settings.currentTier, settings);
    const bestForBoss = await getBestActivityForBoss(app, allActivities);
    if (bestForBoss) {
      return {
        activity: bestForBoss.name,
        reason: `${boss?.name} staggers. ${Math.ceil(settings.bossCurrentHP)} blows remain.`,
        mythContext: `The beast bleeds. You smell victory. Strike now while ${boss?.name} falters.`,
        priority: 'boss',
        quote: await getRandomQuote(app, settings)
      };
    }
  }

  // 3. LONGEST NEGLECT - Medium priority
  const neglectedActivity = await getMostNeglectedActivity(app, allActivities, settings);
  if (neglectedActivity) {
    const daysSinceLastCompletion = await getDaysSinceLastCompletion(app, neglectedActivity, settings);

    if (daysSinceLastCompletion >= 3) {
      return {
        activity: neglectedActivity.name,
        reason: `${daysSinceLastCompletion} days since you last did this. The skill atrophies.`,
        mythContext: getNeglectMythContext(neglectedActivity.name, daysSinceLastCompletion),
        priority: 'neglect',
        quote: await getRandomQuote(app, settings)
      };
    }
  }

  // 4. WEEKLY TARGETS - Medium priority
  const weekProgress = getCurrentWeekProgress(app, settings);
  const behindSchedule = weekProgress.byActivity.find(a => {
    const daysLeft = 7 - new Date(getEffectiveNow(settings)).getDay(); // Days left in week
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
  const timeOfDay = getTimeOfDay(settings);
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
  activities: (ActivityConfig | CustomHabitConfig)[],
  settings: TrackRankSettings
): Promise<ActivityConfig | CustomHabitConfig | null> {
  if (activities.length === 0) return null;

  let mostNeglected = activities[0];
  let longestGap = 0;

  for (const activity of activities) {
    const daysSince = await getDaysSinceLastCompletion(app, activity, settings);
    if (daysSince > longestGap) {
      longestGap = daysSince;
      mostNeglected = activity;
    }
  }

  return mostNeglected;
}

async function getDaysSinceLastCompletion(
  app: App,
  activity: ActivityConfig | CustomHabitConfig,
  settings: TrackRankSettings
): Promise<number> {
  const completions = getCompletionsFromFolder(app, activity.folder, activity.field);

  if (completions.length === 0) return 999;

  const completed = completions
    .filter(c => c.completed)
    .map(c => new Date(c.date))
    .sort((a, b) => b.getTime() - a.getTime());

  if (completed.length === 0) return 999;

  const today = new Date(getEffectiveNow(settings));
  today.setHours(0, 0, 0, 0);
  const lastDate = completed[0];

  return Math.floor((today.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000));
}

async function getBestActivityForBoss(
  app: App,
  activities: (ActivityConfig | CustomHabitConfig)[]
): Promise<ActivityConfig | CustomHabitConfig | null> {
  if (activities.length === 0) return null;

  // Prioritize activities with highest weekly target (most impactful)
  return activities.reduce((best, current) => {
    const bestTarget = best.weeklyTarget || 7;
    const currentTarget = current.weeklyTarget || 7;
    return currentTarget > bestTarget ? current : best;
  }, activities[0]);
}

function getNeglectMythContext(activityName: string, days: number): string {
  const contexts: Record<string, string> = {
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
  const reasons: Record<string, string> = {
    morning: "The dawn favors action. Strike while your will is fresh.",
    afternoon: "Midday brings clarity. Feed the mind while the sun shines.",
    evening: "Dusk calls for creation. The night muse awakens.",
    night: "The quiet hours favor reflection. Let wisdom speak."
  };

  return reasons[timeOfDay] || "The time is right for this pursuit.";
}

function getTimeBasedMythContext(timeOfDay: string): string {
  const contexts: Record<string, string> = {
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
    damagePerCompletion: 1,
    weeklyTarget: 7
  },
  {
    name: "Cardio",
    folder: "Personal Life/02 Cardio",
    field: "Cardio",
    damagePerCompletion: 1,
    weeklyTarget: 4
  },
  {
    name: "Reading",
    folder: "Personal Life/03 Reading",
    field: "Reading",
    damagePerCompletion: 1,
    weeklyTarget: 6
  },
  {
    name: "Drumming",
    folder: "Personal Life/04 Drumming",
    field: "Drumming",
    damagePerCompletion: 1,
    weeklyTarget: 6
  },
  {
    name: "Health Study",
    folder: "Personal Life/05 Health Study",
    field: "Health Study",
    damagePerCompletion: 1,
    weeklyTarget: 3
  },
  {
    name: "Social",
    folder: "Personal Life/06 Social",
    field: "Social",
    damagePerCompletion: 1,
    weeklyTarget: 2
  },
  {
    name: "Drawing",
    folder: "Personal Life/07 Drawing",
    field: "Drawing",
    damagePerCompletion: 1,
    weeklyTarget: 4
  }
];

/**
 * Get activities with user overrides applied.
 * Merges default ACTIVITIES with any custom overrides from settings.
 * Returns activities with _originalName set for proper enabledActivities lookup.
 */
function getEffectiveActivities(settings: TrackRankSettings): ActivityConfig[] {
  return ACTIVITIES.map(activity => {
    const override = settings.activityOverrides?.find(o => o.originalName === activity.name);
    if (!override) return { ...activity, _originalName: activity.name };

    return {
      ...activity,
      _originalName: activity.name,  // Always track original name for enabledActivities lookup
      name: override.name ?? activity.name,
      folder: override.folder ?? activity.folder,
      field: override.field ?? activity.field,
      damagePerCompletion: override.damagePerCompletion ?? activity.damagePerCompletion,
      weeklyTarget: override.weeklyTarget ?? activity.weeklyTarget,
      trackingMode: override.trackingMode ?? activity.trackingMode,
      damagePerWeek: override.damagePerWeek ?? activity.damagePerWeek,
    };
  });
}

/**
 * Get a single activity by its original name, with overrides applied.
 */
function getEffectiveActivity(originalName: string, settings: TrackRankSettings): ActivityConfig | undefined {
  const activity = ACTIVITIES.find(a => a.name === originalName);
  if (!activity) return undefined;

  const override = settings.activityOverrides?.find(o => o.originalName === originalName);
  if (!override) return { ...activity, _originalName: activity.name };

  return {
    ...activity,
    _originalName: activity.name,
    name: override.name ?? activity.name,
    folder: override.folder ?? activity.folder,
    field: override.field ?? activity.field,
    damagePerCompletion: override.damagePerCompletion ?? activity.damagePerCompletion,
    weeklyTarget: override.weeklyTarget ?? activity.weeklyTarget,
    trackingMode: override.trackingMode ?? activity.trackingMode,
    damagePerWeek: override.damagePerWeek ?? activity.damagePerWeek,
  };
}

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
    const boss = getCustomizedBossForTier(settings.currentTier, settings);
    const rankName = getRankNameForTier(settings.currentTier, settings);
    
    const barColor = getProgressBarColor(settings.currentTier, settings.inTartarus);

    const wrapper = content.createDiv({
      cls: "track-habit-rank-container",
      attr: {
        style: `
          max-width: 420px;
          margin: 0 auto;
          padding: 24px;
          text-align: center;
          background: #0a0a0a;
          border: 1px solid #2a3a2d;
          position: relative;
          font-family: "Georgia", serif;
        `
      }
    });

    // Add decorative corners
    const cornerPositions = [
      { top: '0', left: '0', borderTop: true, borderLeft: true },
      { top: '0', right: '0', borderTop: true, borderRight: true },
      { bottom: '0', left: '0', borderBottom: true, borderLeft: true },
      { bottom: '0', right: '0', borderBottom: true, borderRight: true }
    ];
    cornerPositions.forEach(pos => {
      const corner = wrapper.createDiv({
        attr: {
          style: `
            position: absolute;
            ${pos.top !== undefined ? `top: ${pos.top}` : ''};
            ${pos.bottom !== undefined ? `bottom: ${pos.bottom}` : ''};
            ${pos.left !== undefined ? `left: ${pos.left}` : ''};
            ${pos.right !== undefined ? `right: ${pos.right}` : ''};
            width: 18px;
            height: 18px;
            ${pos.borderTop ? 'border-top: 1px solid #7a9a7d;' : ''}
            ${pos.borderBottom ? 'border-bottom: 1px solid #7a9a7d;' : ''}
            ${pos.borderLeft ? 'border-left: 1px solid #7a9a7d;' : ''}
            ${pos.borderRight ? 'border-right: 1px solid #7a9a7d;' : ''}
            pointer-events: none;
            z-index: 10;
          `
        }
      });
    });

    // PAUSE INDICATOR BANNER - shown when system is paused
    if (settings.systemState === 'paused') {
      const pauseBanner = wrapper.createDiv({
        cls: "track-habit-rank-pause-banner",
        attr: {
          style: `
            background: #0f0f0f;
            padding: 20px 24px;
            margin-bottom: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            border: 1px solid #7C3AED;
            position: relative;
          `
        }
      });

      pauseBanner.createEl("div", {
        text: "SYSTEM PAUSED",
        attr: {
          style: `
            font-family: "Times New Roman", serif;
            font-size: 13px;
            font-weight: 500;
            letter-spacing: 3px;
            text-transform: uppercase;
            color: #7C3AED;
          `
        }
      });

      pauseBanner.createEl("div", {
        text: `Paused for: ${this.plugin.getPauseDurationDisplay()}`,
        attr: {
          style: `
            font-family: "Georgia", serif;
            font-size: 13px;
            font-style: italic;
            color: #5a6a5d;
          `
        }
      });

      // Resume button with touch-friendly size
      const resumeBtn = pauseBanner.createEl("button", {
        text: "Resume System",
        cls: "track-habit-rank-btn",
        attr: {
          style: `
            margin-top: 8px;
            padding: 12px 24px;
            min-height: 44px;
            min-width: 120px;
            background: #0f0f0f;
            color: #7C3AED;
            border: 1px solid #7C3AED;
            cursor: pointer;
            font-family: "Times New Roman", serif;
            font-size: 12px;
            font-weight: 500;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            transition: all 0.3s ease;
          `
        }
      });

      resumeBtn.onclick = async () => {
        await this.plugin.toggleSystemState();
      };
    }

    // ==========================================
    // BOSS/TARTARUS IMAGE & NAME DISPLAY
    // ==========================================
    if (settings.inTartarus) {
      // TARTARUS DISPLAY
      const tartarusImage = settings.tartarusImage;

      if (tartarusImage) {
        const imgContainer = wrapper.createDiv({
          attr: {
            style: `
              margin-bottom: 16px;
              display: flex;
              justify-content: center;
            `
          }
        });

        const img = imgContainer.createEl("img", {
          attr: {
            src: tartarusImage,
            alt: "Tartarus",
            style: `
              max-width: 200px;
              max-height: 200px;
              border: 1px solid #DC2626;
              object-fit: cover;
              filter: grayscale(0.3) contrast(1.2) brightness(0.9);
              transition: filter 0.4s ease;
            `
          }
        });

        img.onerror = () => {
          imgContainer.empty();
          imgContainer.createEl("div", {
            text: "💀",
            attr: {
              style: `
                font-size: 80px;
                line-height: 1;
                filter: drop-shadow(0 4px 8px rgba(220, 38, 38, 0.5));
              `
            }
          });
        };
      } else {
        // Default Tartarus icon
        wrapper.createEl("div", {
          text: "💀",
          attr: {
            style: `
              font-size: 80px;
              line-height: 1;
              margin-bottom: 12px;
              filter: drop-shadow(0 4px 8px rgba(220, 38, 38, 0.5));
            `
          }
        });
      }

      // Tartarus title
      wrapper.createEl("div", {
        text: "TARTARUS",
        attr: {
          style: `
            font-family: "Times New Roman", serif;
            font-size: 13px;
            letter-spacing: 3px;
            opacity: 0.7;
            margin-bottom: 12px;
            text-transform: uppercase;
            color: #DC2626;
            font-weight: 500;
          `
        }
      });

      // Rank title (still shown)
      wrapper.createEl("div", {
        text: rankName,
        attr: {
          style: `
            font-family: "Times New Roman", serif;
            font-size: 2.2em;
            font-weight: 500;
            letter-spacing: 2px;
            margin-bottom: 6px;
            color: #DC2626;
          `
        }
      });
    } else {
      // BOSS DISPLAY
      const bossImage = boss?.image;

      if (bossImage) {
        const imgContainer = wrapper.createDiv({
          attr: {
            style: `
              margin-bottom: 16px;
              display: flex;
              justify-content: center;
            `
          }
        });

        const img = imgContainer.createEl("img", {
          attr: {
            src: bossImage,
            alt: boss?.name || "Boss",
            style: `
              max-width: 200px;
              max-height: 200px;
              border: 1px solid #2a3a2d;
              object-fit: cover;
              filter: grayscale(0.3) contrast(1.2) brightness(0.9);
              transition: filter 0.4s ease, transform 0.4s ease;
            `
          }
        });

        img.onerror = () => {
          imgContainer.remove();
        };
      }

      // Boss name
      wrapper.createEl("div", {
        text: boss?.name || "No Boss",
        attr: {
          style: `
            font-family: "Times New Roman", serif;
            font-size: 13px;
            letter-spacing: 3px;
            opacity: 0.7;
            margin-bottom: 12px;
            text-transform: uppercase;
            color: #7a9a7d;
          `
        }
      });

      // Rank title
      wrapper.createEl("div", {
        text: rankName,
        attr: {
          style: `
            font-family: "Times New Roman", serif;
            font-size: 2.2em;
            font-weight: 500;
            letter-spacing: 2px;
            margin-bottom: 6px;
            color: #7a9a7d;
          `
        }
      });
    }

    // Boss HP
    const hpPercent = Math.round((settings.bossCurrentHP / settings.bossMaxHP) * 100);
    wrapper.createEl("div", {
      text: `${settings.bossCurrentHP}/${settings.bossMaxHP} HP (${hpPercent}%)`,
      attr: {
        style: `
          font-family: "Times New Roman", serif;
          font-size: 14px;
          letter-spacing: 0.5px;
          color: #7a9a7d;
          opacity: 0.85;
          margin-bottom: 12px;
        `
      }
    });

    // HP Bar
    const bar = wrapper.createDiv({
      cls: "track-habit-rank-progress",
      attr: {
        style: `
          width: 100%;
          height: 12px;
          background: #2a3a2d;
          overflow: hidden;
          margin-bottom: 16px;
        `
      }
    });

    bar.createDiv({
      cls: "track-habit-rank-progress-fill",
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
            font-family: "Georgia", serif;
            font-size: 13px;
            font-style: italic;
            color: #5a6a5d;
            margin-bottom: 20px;
            line-height: 1.5;
          `
        }
      });
    }

    // Weekly progress section
    const weekProgress = getCurrentWeekProgress(this.app, settings);
    const weekPercentComplete = weekProgress.target > 0
      ? Math.round((weekProgress.completed / weekProgress.target) * 100)
      : 0;

    wrapper.createEl("div", {
      text: `This Week: ${weekProgress.completed}/${weekProgress.target} (${weekPercentComplete}%)`,
      cls: "track-habit-rank-metric",
      attr: {
        style: `
          font-family: "Times New Roman", serif;
          font-size: 14px;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
          color: #7a9a7d;
        `
      }
    });

    // Perfect week streak (no damage bonus, just display)
    if (settings.consecutivePerfectWeeks > 0) {
      wrapper.createEl("div", {
        text: `🔥 Perfect Weeks: ${settings.consecutivePerfectWeeks}`,
        cls: "track-habit-rank-metric track-habit-rank-metric-streak",
        attr: {
          style: `
            font-family: "Times New Roman", serif;
            font-size: 14px;
            letter-spacing: 0.5px;
            margin-bottom: 16px;
            color: #F59E0B;
          `
        }
      });
    }

    // Reward Progress Section
    this.renderRewardSection(wrapper);

    // Death warning (if not in Tartarus and not paused)
    if (!settings.inTartarus && settings.systemState === 'active') {
      const allActivities = [
        ...getEffectiveActivities(settings).filter(a => settings.enabledActivities[a._originalName!] ?? true),
        ...this.plugin.settings.customHabits.filter(h => h.enabled)
      ];

      const weeklyTarget = allActivities.reduce((sum, a) => {
        return sum + (a.weeklyTarget || 7);
      }, 0);

      const requiredCompletions = Math.ceil(weeklyTarget * 0.1);

      const effectiveNow = getEffectiveNow(settings);
      const today = new Date(effectiveNow);
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 2);

      let totalCompletions = 0;
      for (const activity of allActivities) {
        const completions = getCompletionsFromFolder(this.app, activity.folder, activity.field);
        completions.forEach(c => {
          if (!c.completed) return;
          const date = new Date(c.date);
          date.setHours(0, 0, 0, 0);
          if (date >= startDate && date <= today) {
            totalCompletions++;
          }
        });
      }

      if (totalCompletions < requiredCompletions) {
        const warningBox = wrapper.createDiv({
          cls: "track-habit-rank-warning track-habit-rank-warning-danger",
          attr: {
            style: `
              margin: 16px 0;
              padding: 16px 20px;
              background: #0f0f0f;
              border: 1px solid rgba(239, 68, 68, 0.4);
            `
          }
        });

        warningBox.createEl("div", {
          text: "⚠️ LOW ACTIVITY WARNING",
          cls: "track-habit-rank-warning-title",
          attr: {
            style: `
              font-family: "Times New Roman", serif;
              font-size: 12px;
              font-weight: 500;
              letter-spacing: 2px;
              text-transform: uppercase;
              color: #EF4444;
              margin-bottom: 8px;
            `
          }
        });

        warningBox.createEl("div", {
          text: `Last 3 days: ${totalCompletions} completions | Required: ${requiredCompletions}`,
          cls: "track-habit-rank-warning-text",
          attr: {
            style: `
              font-family: "Georgia", serif;
              font-size: 13px;
              font-style: italic;
              color: #5a6a5d;
            `
          }
        });

        warningBox.createEl("div", {
          text: `Failed checks: ${settings.failedThresholdDays}/3`,
          attr: {
            style: `
              font-family: "Times New Roman", serif;
              font-size: 12px;
              letter-spacing: 0.5px;
              color: #EF4444;
              margin-top: 8px;
            `
          }
        });
      }
    }

    // Tartarus warning
    if (settings.inTartarus) {
      const warningBox = wrapper.createDiv({
        cls: "track-habit-rank-warning track-habit-rank-warning-tartarus",
        attr: {
          style: `
            margin: 16px 0;
            padding: 16px 20px;
            background: #0f0f0f;
            border: 1px solid rgba(220, 38, 38, 0.5);
          `
        }
      });

      warningBox.createEl("div", {
        text: "💀 YOU ARE IN TARTARUS",
        cls: "track-habit-rank-warning-title",
        attr: {
          style: `
            font-family: "Times New Roman", serif;
            font-size: 13px;
            font-weight: 500;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #DC2626;
            margin-bottom: 10px;
          `
        }
      });

      // Use effective time for pause-aware Tartarus days calculation
      const effectiveNow = getEffectiveNow(settings);
      const daysIn = settings.tartarusStartDate
        ? Math.floor((effectiveNow.getTime() - new Date(settings.tartarusStartDate).getTime()) / (24 * 60 * 60 * 1000))
        : 0;

      const requiredTasks = settings.currentTier <= 4 ? 3 : settings.currentTier <= 12 ? 4 : 5;
      const completedTasks = settings.tartarusPenanceTasks.filter(t => t.completed).length;

      warningBox.createEl("div", {
        text: `Days: ${daysIn} | Tasks: ${completedTasks}/${requiredTasks}`,
        cls: "track-habit-rank-warning-text",
        attr: {
          style: `
            font-family: "Georgia", serif;
            font-size: 13px;
            font-style: italic;
            color: #5a6a5d;
          `
        }
      });

      // Button to view penance tasks
      const viewBtn = warningBox.createEl("button", {
        text: "View Penance Tasks",
        cls: "track-habit-rank-btn track-habit-rank-btn-danger",
        attr: {
          style: `
            margin-top: 12px;
            padding: 12px 20px;
            min-height: 44px;
            background: #0f0f0f;
            color: #DC2626;
            border: 1px solid #DC2626;
            cursor: pointer;
            font-family: "Times New Roman", serif;
            font-size: 12px;
            font-weight: 500;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            transition: all 0.3s ease;
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
            font-family: "Georgia", serif;
            font-size: 12px;
            font-style: italic;
            color: #5a6a5d;
            margin-top: 16px;
          `
        }
      });
    } else {
      wrapper.createEl("div", {
        text: "FINAL TIER REACHED",
        attr: {
          style: `
            font-family: "Times New Roman", serif;
            font-size: 13px;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #F59E0B;
            margin-top: 16px;
          `
        }
      });
    }

    // Pause/Resume toggle button (only show when not paused - pause banner has resume button)
    if (settings.systemState === 'active') {
      const pauseSection = wrapper.createDiv({
        attr: {
          style: `
            margin-top: 24px;
            padding-top: 16px;
            border-top: 1px solid #2a3a2d;
          `
        }
      });

      const pauseBtn = pauseSection.createEl("button", {
        text: "Pause System",
        cls: "track-habit-rank-btn",
        attr: {
          style: `
            padding: 12px 24px;
            min-height: 44px;
            min-width: 120px;
            background: #0f0f0f;
            color: #7C3AED;
            border: 1px solid #7C3AED;
            cursor: pointer;
            font-family: "Times New Roman", serif;
            font-size: 12px;
            font-weight: 500;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            transition: all 0.3s ease;
          `
        }
      });

      pauseBtn.onclick = async () => {
        await this.plugin.toggleSystemState();
      };

      // TODO: configurable - Show total accumulated pause time if any
      if (this.plugin.settings.totalPausedTime > 0) {
        pauseSection.createEl("div", {
          text: `Total paused: ${this.plugin.getTotalPausedDisplay()}`,
          attr: {
            style: `
              margin-top: 10px;
              font-family: "Georgia", serif;
              font-size: 12px;
              font-style: italic;
              color: #5a6a5d;
            `
          }
        });
      }
    }
  }

  /**
   * Render the reward progress section on the dashboard.
   */
  renderRewardSection(wrapper: HTMLElement) {
    const settings = this.plugin.settings;
    const rewardProgress = this.plugin.getRewardProgress();

    const tierDisplayNames: Record<RewardTier, string> = {
      micro: 'Micro',
      mini: 'Mini',
      standard: 'Standard',
      quality: 'Quality',
      premium: 'Premium'
    };

    // Reward section container
    const rewardSection = wrapper.createDiv({
      cls: "track-habit-rank-reward-section",
      attr: {
        style: `
          margin: 16px 0;
          padding: 16px;
          background: #0f0f0f;
          border: 1px solid #2a3a2d;
        `
      }
    });

    // Section header
    rewardSection.createEl("div", {
      text: `${tierDisplayNames[rewardProgress.rewardTier]} Rewards`,
      attr: {
        style: `
          font-family: "Times New Roman", serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #7a9a7d;
          margin-bottom: 12px;
        `
      }
    });

    // Activity progress
    const activityRemaining = rewardProgress.activityThreshold - rewardProgress.activityProgress;
    rewardSection.createEl("div", {
      text: `Next activity reward: ${activityRemaining} more completion${activityRemaining !== 1 ? 's' : ''}`,
      attr: {
        style: `
          font-family: "Georgia", serif;
          font-size: 12px;
          color: #5a6a5d;
          margin-bottom: 4px;
        `
      }
    });

    // Streak progress
    const streakRemaining = rewardProgress.streakThreshold - rewardProgress.streakProgress;
    rewardSection.createEl("div", {
      text: `Next streak reward: ${streakRemaining} more perfect week${streakRemaining !== 1 ? 's' : ''}`,
      attr: {
        style: `
          font-family: "Georgia", serif;
          font-size: 12px;
          color: #5a6a5d;
          margin-bottom: 8px;
        `
      }
    });

    // Pending rewards indicator
    if (rewardProgress.pendingCount > 0) {
      const pendingBox = rewardSection.createDiv({
        attr: {
          style: `
            margin-top: 8px;
            padding: 10px 12px;
            background: rgba(245, 158, 11, 0.1);
            border: 1px solid #F59E0B;
          `
        }
      });

      pendingBox.createEl("div", {
        text: `${rewardProgress.pendingCount} unclaimed reward${rewardProgress.pendingCount !== 1 ? 's' : ''} waiting!`,
        attr: {
          style: `
            font-family: "Times New Roman", serif;
            font-size: 12px;
            color: #F59E0B;
          `
        }
      });
    }

    // Banked rewards indicator (only for tiers 11+)
    if (canBankRewards(settings.currentTier) && rewardProgress.bankedCount > 0) {
      rewardSection.createEl("div", {
        text: `Banked: ${rewardProgress.bankedCount}/${getMaxBankedRewards()}`,
        attr: {
          style: `
            margin-top: 8px;
            font-family: "Georgia", serif;
            font-size: 12px;
            color: #8B5CF6;
          `
        }
      });
    }

    // View rewards button
    const viewBtn = rewardSection.createEl("button", {
      text: "View Rewards",
      cls: "track-habit-rank-btn",
      attr: {
        style: `
          margin-top: 12px;
          padding: 10px 16px;
          min-height: 44px;
          background: #0f0f0f;
          color: #7a9a7d;
          border: 1px solid #7a9a7d;
          cursor: pointer;
          font-family: "Times New Roman", serif;
          font-size: 11px;
          letter-spacing: 1px;
          text-transform: uppercase;
          transition: all 0.3s ease;
        `
      }
    });

    viewBtn.onclick = () => {
      new RewardLogModal(this.app, this.plugin).open();
    };
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
      attr: {
        style: `
          margin-bottom: 16px;
          font-family: "Georgia", serif;
          font-size: 13px;
          font-style: italic;
          color: #5a6a5d;
        `
      }
    });

    // Show available tokens
    contentEl.createEl("div", {
      text: `💎 Available Discipline Tokens: ${settings.disciplineTokens}/3`,
      attr: {
        style: `
          margin-bottom: 16px;
          padding: 12px 16px;
          background: #0f0f0f;
          border: 1px solid #2a3a2d;
          font-family: "Times New Roman", serif;
          font-size: 14px;
          letter-spacing: 0.5px;
          color: #7a9a7d;
        `
      }
    });

    if (settings.disciplineTokens === 3) {
      const escapeBtn = contentEl.createEl("button", {
        text: "Spend 3 Tokens to Escape Immediately",
        cls: "track-habit-rank-btn track-habit-rank-btn-primary",
        attr: {
          style: `
            width: 100%;
            padding: 14px 20px;
            min-height: 44px;
            margin-bottom: 16px;
            background: #7a9a7d;
            color: #0a0a0a;
            border: 1px solid #7a9a7d;
            cursor: pointer;
            font-family: "Times New Roman", serif;
            font-size: 12px;
            font-weight: 500;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            transition: all 0.3s ease;
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
      settings.tartarusPenanceTasks = getPenanceTasksForTier(settings.currentTier, settings);
    }

    const requiredTasks = settings.currentTier <= 4 ? 3 : settings.currentTier <= 12 ? 4 : 5;
    // No minimum days required - escape as soon as tasks are complete

    contentEl.createEl("div", {
      text: `Complete ${requiredTasks} tasks to escape Tartarus`,
      attr: {
        style: `
          margin-bottom: 16px;
          font-family: "Times New Roman", serif;
          font-size: 13px;
          letter-spacing: 1px;
          color: #7a9a7d;
        `
      }
    });

    // Render each task
    settings.tartarusPenanceTasks.forEach((task, index) => {
      const taskBox = contentEl.createDiv({
        attr: {
          style: `
            margin-bottom: 12px;
            padding: 16px;
            border: 1px solid ${task.completed ? '#7a9a7d' : '#2a3a2d'};
            background: ${task.completed ? 'rgba(122, 154, 125, 0.1)' : '#0f0f0f'};
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
          cls: "track-habit-rank-btn",
          attr: {
            style: `
              margin-top: 12px;
              padding: 10px 16px;
              min-height: 44px;
              background: #0f0f0f;
              border: 1px solid #8B5CF6;
              color: #8B5CF6;
              cursor: pointer;
              font-family: "Times New Roman", serif;
              font-size: 11px;
              letter-spacing: 1px;
              text-transform: uppercase;
              transition: all 0.3s ease;
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

    // Check if can escape - just need to complete tasks (no minimum days)
    const completedCount = settings.tartarusPenanceTasks.filter(t => t.completed).length;
    const effectiveNow = getEffectiveNow(settings);
    const daysInTartarus = settings.tartarusStartDate
      ? Math.floor((effectiveNow.getTime() - new Date(settings.tartarusStartDate).getTime()) / (24 * 60 * 60 * 1000))
      : 0;

    // Pause indicator in Tartarus
    if (settings.systemState === 'paused') {
      contentEl.createEl("div", {
        text: "⏸️ SYSTEM PAUSED - Hades Wrath timer is frozen",
        cls: "track-habit-rank-warning",
        attr: {
          style: `
            margin: 16px 0;
            padding: 16px 20px;
            background: #0f0f0f;
            border: 1px solid #7C3AED;
            color: #7C3AED;
            font-family: "Times New Roman", serif;
            font-size: 12px;
            letter-spacing: 1px;
            text-transform: uppercase;
            text-align: center;
          `
        }
      });
    }

    // Hades Wrath warning (only show when not paused)
    if (!settings.hadesWrathApplied && daysInTartarus >= 2 && completedCount < requiredTasks && settings.systemState !== 'paused') {
      contentEl.createEl("div", {
        text: `⚠️ HADES WRATH in ${3 - daysInTartarus} day(s)! Complete tasks or they will DOUBLE!`,
        cls: "track-habit-rank-warning",
        attr: {
          style: `
            margin: 16px 0;
            padding: 16px 20px;
            background: #0f0f0f;
            border: 1px solid #F59E0B;
            color: #F59E0B;
            font-family: "Times New Roman", serif;
            font-size: 12px;
            letter-spacing: 1px;
            text-transform: uppercase;
            text-align: center;
          `
        }
      });
    }

    if (settings.hadesWrathApplied) {
      contentEl.createEl("div", {
        text: "⚡ HADES WRATH ACTIVE - Tasks have been doubled!",
        cls: "track-habit-rank-warning",
        attr: {
          style: `
            margin: 16px 0;
            padding: 16px 20px;
            background: #0f0f0f;
            border: 1px solid #DC2626;
            color: #DC2626;
            font-family: "Times New Roman", serif;
            font-size: 12px;
            letter-spacing: 1px;
            text-transform: uppercase;
            text-align: center;
          `
        }
      });
    }

    if (completedCount >= requiredTasks) {
      const escapeBtn = contentEl.createEl("button", {
        text: "Escape Tartarus",
        cls: "track-habit-rank-btn track-habit-rank-btn-primary",
        attr: {
          style: `
            width: 100%;
            padding: 14px 20px;
            min-height: 44px;
            margin-top: 20px;
            background: #7a9a7d;
            color: #0a0a0a;
            border: 1px solid #7a9a7d;
            cursor: pointer;
            font-family: "Times New Roman", serif;
            font-size: 13px;
            font-weight: 500;
            letter-spacing: 2px;
            text-transform: uppercase;
            transition: all 0.3s ease;
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
        text: `Need: ${requiredTasks - completedCount} more task(s) to escape`,
        attr: {
          style: `
            margin-top: 20px;
            padding: 12px 16px;
            background: #0f0f0f;
            border: 1px solid rgba(239, 68, 68, 0.4);
            text-align: center;
            font-family: "Times New Roman", serif;
            font-size: 13px;
            letter-spacing: 0.5px;
            color: #EF4444;
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
    const greeting = getGreeting(this.plugin.settings, "Valantis");
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
    const boss = getCustomizedBossForTier(this.plugin.settings.currentTier, this.plugin.settings);
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
    const today = new Date(getEffectiveNow(this.plugin.settings));
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
   REWARD SELECTION MODAL
====================== */

class RewardSelectionModal extends Modal {
  plugin: TrackHabitRankPlugin;
  pendingReward: PendingReward;
  onComplete: () => void;

  constructor(app: App, plugin: TrackHabitRankPlugin, pendingReward: PendingReward, onComplete: () => void) {
    super(app);
    this.plugin = plugin;
    this.pendingReward = pendingReward;
    this.onComplete = onComplete;
  }

  onOpen() {
    const { contentEl } = this;
    const settings = this.plugin.settings;

    contentEl.empty();

    // Find the reward pool for this tier
    const pool = settings.rewardPools.find(p => p.tier === this.pendingReward.rewardTier);
    const options = pool?.options || [];

    // Header
    const tierDisplayNames: Record<RewardTier, string> = {
      micro: 'Micro',
      mini: 'Mini',
      standard: 'Standard',
      quality: 'Quality',
      premium: 'Premium'
    };

    const typeDisplayNames: Record<RewardType, string> = {
      activity: 'Activity',
      boss: 'Boss',
      streak: 'Streak'
    };

    new Setting(contentEl)
      .setName(`${tierDisplayNames[this.pendingReward.rewardTier]} Reward Earned!`)
      .setDesc(`${typeDisplayNames[this.pendingReward.rewardType]} milestone reached`)
      .setHeading();

    // Expiration warning
    const expiresAt = new Date(this.pendingReward.expiresAt);
    const now = new Date(getEffectiveNow(settings));
    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

    contentEl.createEl("div", {
      text: `Expires in ${daysLeft} days - claim now or bank it!`,
      attr: {
        style: `
          margin-bottom: 16px;
          padding: 12px 16px;
          background: #0f0f0f;
          border: 1px solid ${daysLeft <= 2 ? '#F59E0B' : '#2a3a2d'};
          font-family: "Georgia", serif;
          font-size: 13px;
          font-style: italic;
          color: ${daysLeft <= 2 ? '#F59E0B' : '#5a6a5d'};
        `
      }
    });

    // Reward options
    contentEl.createEl("div", {
      text: "Choose one reward:",
      attr: {
        style: `
          margin-bottom: 12px;
          font-family: "Times New Roman", serif;
          font-size: 14px;
          letter-spacing: 0.5px;
          color: #7a9a7d;
        `
      }
    });

    if (options.length === 0) {
      contentEl.createEl("div", {
        text: "No rewards configured for this tier. Add rewards in settings.",
        attr: {
          style: `
            margin-bottom: 16px;
            padding: 16px;
            background: #0f0f0f;
            border: 1px solid rgba(239, 68, 68, 0.4);
            font-family: "Georgia", serif;
            font-size: 13px;
            color: #EF4444;
          `
        }
      });
    } else {
      options.forEach((option, index) => {
        const optionBox = contentEl.createDiv({
          attr: {
            style: `
              margin-bottom: 12px;
              padding: 16px;
              border: 1px solid #2a3a2d;
              background: #0f0f0f;
              cursor: pointer;
              transition: all 0.2s ease;
            `
          }
        });

        optionBox.createEl("div", {
          text: option.description,
          attr: {
            style: `
              font-family: "Times New Roman", serif;
              font-size: 14px;
              color: #e5e7eb;
            `
          }
        });

        optionBox.onmouseenter = () => {
          optionBox.style.borderColor = '#7a9a7d';
          optionBox.style.background = 'rgba(122, 154, 125, 0.1)';
        };
        optionBox.onmouseleave = () => {
          optionBox.style.borderColor = '#2a3a2d';
          optionBox.style.background = '#0f0f0f';
        };

        optionBox.onclick = async () => {
          await this.claimReward(option);
        };
      });
    }

    // Banking option (only for tiers 11+)
    if (canBankRewards(settings.currentTier)) {
      const bankedCount = settings.bankedRewards.length;
      const maxBanked = getMaxBankedRewards();

      if (bankedCount < maxBanked) {
        const bankSection = contentEl.createDiv({
          attr: {
            style: `
              margin-top: 20px;
              padding-top: 16px;
              border-top: 1px solid #2a3a2d;
            `
          }
        });

        bankSection.createEl("div", {
          text: `Or bank this reward for later (${bankedCount}/${maxBanked} banked)`,
          attr: {
            style: `
              margin-bottom: 12px;
              font-family: "Times New Roman", serif;
              font-size: 13px;
              color: #5a6a5d;
            `
          }
        });

        const bankBtn = bankSection.createEl("button", {
          text: "Bank Reward",
          cls: "track-habit-rank-btn",
          attr: {
            style: `
              padding: 12px 24px;
              min-height: 44px;
              background: #0f0f0f;
              color: #8B5CF6;
              border: 1px solid #8B5CF6;
              cursor: pointer;
              font-family: "Times New Roman", serif;
              font-size: 12px;
              font-weight: 500;
              letter-spacing: 1.5px;
              text-transform: uppercase;
              transition: all 0.3s ease;
            `
          }
        });

        bankBtn.onclick = async () => {
          await this.bankReward();
        };
      } else {
        contentEl.createEl("div", {
          text: `Maximum rewards banked (${maxBanked}/${maxBanked})`,
          attr: {
            style: `
              margin-top: 20px;
              padding: 12px 16px;
              background: #0f0f0f;
              border: 1px solid rgba(139, 92, 246, 0.3);
              font-family: "Times New Roman", serif;
              font-size: 12px;
              color: #8B5CF6;
              text-align: center;
            `
          }
        });
      }
    }

    // Close button
    const closeSection = contentEl.createDiv({
      attr: {
        style: `
          margin-top: 20px;
          text-align: center;
        `
      }
    });

    closeSection.createEl("button", {
      text: "Decide Later",
      cls: "track-habit-rank-btn",
      attr: {
        style: `
          padding: 10px 20px;
          min-height: 44px;
          background: transparent;
          color: #5a6a5d;
          border: 1px solid #2a3a2d;
          cursor: pointer;
          font-family: "Times New Roman", serif;
          font-size: 11px;
          letter-spacing: 1px;
          text-transform: uppercase;
        `
      }
    }).onclick = () => this.close();
  }

  async claimReward(option: RewardOption) {
    const settings = this.plugin.settings;
    const now = new Date().toISOString();

    // Create claimed reward
    const claimed: ClaimedReward = {
      id: `claimed-${Date.now()}`,
      description: option.description,
      rewardTier: this.pendingReward.rewardTier,
      rewardType: this.pendingReward.rewardType,
      claimedAt: now,
      earnedAt: this.pendingReward.earnedAt,
      expiresAt: this.pendingReward.expiresAt,
      used: false
    };

    // Add to claimed rewards and remove from pending
    settings.claimedRewards.push(claimed);
    settings.pendingRewards = settings.pendingRewards.filter(r => r.id !== this.pendingReward.id);

    await this.plugin.saveSettings();
    this.plugin.refreshRankView();

    new Notice(`Reward claimed: ${option.description}`);
    this.onComplete();
    this.close();
  }

  async bankReward() {
    const settings = this.plugin.settings;

    // Create banked reward
    const banked: BankedReward = {
      id: `banked-${Date.now()}`,
      rewardTier: this.pendingReward.rewardTier,
      rewardType: this.pendingReward.rewardType,
      bankedAt: new Date().toISOString()
    };

    // Add to banked rewards and remove from pending
    settings.bankedRewards.push(banked);
    settings.pendingRewards = settings.pendingRewards.filter(r => r.id !== this.pendingReward.id);

    await this.plugin.saveSettings();
    this.plugin.refreshRankView();

    new Notice(`Reward banked for later (${settings.bankedRewards.length}/${getMaxBankedRewards()})`);
    this.onComplete();
    this.close();
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

/* ======================
   REWARD LOG MODAL
====================== */

class RewardLogModal extends Modal {
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
      .setName("Reward Log")
      .setDesc("Track your earned rewards and their status")
      .setHeading();

    const tierDisplayNames: Record<RewardTier, string> = {
      micro: 'Micro',
      mini: 'Mini',
      standard: 'Standard',
      quality: 'Quality',
      premium: 'Premium'
    };

    const typeDisplayNames: Record<RewardType, string> = {
      activity: 'Activity',
      boss: 'Boss',
      streak: 'Streak'
    };

    // Pending Rewards Section
    if (settings.pendingRewards.length > 0) {
      contentEl.createEl("div", {
        text: `Pending Rewards (${settings.pendingRewards.length})`,
        attr: {
          style: `
            margin-top: 16px;
            margin-bottom: 12px;
            font-family: "Times New Roman", serif;
            font-size: 14px;
            font-weight: 500;
            letter-spacing: 1px;
            text-transform: uppercase;
            color: #F59E0B;
          `
        }
      });

      settings.pendingRewards.forEach(reward => {
        const expiresAt = new Date(reward.expiresAt);
        const now = new Date(getEffectiveNow(settings));
        const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

        const rewardBox = contentEl.createDiv({
          attr: {
            style: `
              margin-bottom: 12px;
              padding: 16px;
              border: 1px solid ${daysLeft <= 2 ? '#F59E0B' : '#2a3a2d'};
              background: #0f0f0f;
            `
          }
        });

        rewardBox.createEl("div", {
          text: `${tierDisplayNames[reward.rewardTier]} ${typeDisplayNames[reward.rewardType]} Reward`,
          attr: {
            style: `
              font-family: "Times New Roman", serif;
              font-size: 14px;
              color: #e5e7eb;
              margin-bottom: 8px;
            `
          }
        });

        rewardBox.createEl("div", {
          text: `Expires in ${daysLeft} days`,
          attr: {
            style: `
              font-family: "Georgia", serif;
              font-size: 12px;
              color: ${daysLeft <= 2 ? '#F59E0B' : '#5a6a5d'};
            `
          }
        });

        const claimBtn = rewardBox.createEl("button", {
          text: "Claim Now",
          cls: "track-habit-rank-btn",
          attr: {
            style: `
              margin-top: 12px;
              padding: 10px 16px;
              min-height: 44px;
              background: #0f0f0f;
              color: #7a9a7d;
              border: 1px solid #7a9a7d;
              cursor: pointer;
              font-family: "Times New Roman", serif;
              font-size: 11px;
              letter-spacing: 1px;
              text-transform: uppercase;
            `
          }
        });

        claimBtn.onclick = () => {
          this.close();
          new RewardSelectionModal(this.app, this.plugin, reward, () => {
            new RewardLogModal(this.app, this.plugin).open();
          }).open();
        };
      });
    }

    // Banked Rewards Section
    if (settings.bankedRewards.length > 0) {
      contentEl.createEl("div", {
        text: `Banked Rewards (${settings.bankedRewards.length}/${getMaxBankedRewards()})`,
        attr: {
          style: `
            margin-top: 20px;
            margin-bottom: 12px;
            font-family: "Times New Roman", serif;
            font-size: 14px;
            font-weight: 500;
            letter-spacing: 1px;
            text-transform: uppercase;
            color: #8B5CF6;
          `
        }
      });

      settings.bankedRewards.forEach(reward => {
        const rewardBox = contentEl.createDiv({
          attr: {
            style: `
              margin-bottom: 12px;
              padding: 16px;
              border: 1px solid #8B5CF6;
              background: rgba(139, 92, 246, 0.1);
            `
          }
        });

        rewardBox.createEl("div", {
          text: `${tierDisplayNames[reward.rewardTier]} ${typeDisplayNames[reward.rewardType]} Reward`,
          attr: {
            style: `
              font-family: "Times New Roman", serif;
              font-size: 14px;
              color: #e5e7eb;
              margin-bottom: 8px;
            `
          }
        });

        rewardBox.createEl("div", {
          text: `Banked on ${new Date(reward.bankedAt).toLocaleDateString()}`,
          attr: {
            style: `
              font-family: "Georgia", serif;
              font-size: 12px;
              color: #5a6a5d;
            `
          }
        });

        const redeemBtn = rewardBox.createEl("button", {
          text: "Redeem",
          cls: "track-habit-rank-btn",
          attr: {
            style: `
              margin-top: 12px;
              padding: 10px 16px;
              min-height: 44px;
              background: #0f0f0f;
              color: #8B5CF6;
              border: 1px solid #8B5CF6;
              cursor: pointer;
              font-family: "Times New Roman", serif;
              font-size: 11px;
              letter-spacing: 1px;
              text-transform: uppercase;
            `
          }
        });

        redeemBtn.onclick = () => {
          // Convert banked reward to pending reward for selection
          const pendingReward: PendingReward = {
            id: reward.id,
            rewardTier: reward.rewardTier,
            rewardType: reward.rewardType,
            earnedAt: reward.bankedAt,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
          };

          // Remove from banked
          settings.bankedRewards = settings.bankedRewards.filter(r => r.id !== reward.id);

          this.close();
          new RewardSelectionModal(this.app, this.plugin, pendingReward, () => {
            this.plugin.saveSettings();
            new RewardLogModal(this.app, this.plugin).open();
          }).open();
        };
      });
    }

    // Claimed Rewards Section (recent history)
    const recentClaimed = settings.claimedRewards
      .filter(r => !r.used)
      .sort((a, b) => new Date(b.claimedAt).getTime() - new Date(a.claimedAt).getTime())
      .slice(0, 10);

    if (recentClaimed.length > 0) {
      contentEl.createEl("div", {
        text: "Active Rewards",
        attr: {
          style: `
            margin-top: 20px;
            margin-bottom: 12px;
            font-family: "Times New Roman", serif;
            font-size: 14px;
            font-weight: 500;
            letter-spacing: 1px;
            text-transform: uppercase;
            color: #7a9a7d;
          `
        }
      });

      recentClaimed.forEach(reward => {
        const rewardBox = contentEl.createDiv({
          attr: {
            style: `
              margin-bottom: 12px;
              padding: 16px;
              border: 1px solid #7a9a7d;
              background: rgba(122, 154, 125, 0.1);
            `
          }
        });

        rewardBox.createEl("div", {
          text: reward.description,
          attr: {
            style: `
              font-family: "Times New Roman", serif;
              font-size: 14px;
              color: #e5e7eb;
              margin-bottom: 8px;
            `
          }
        });

        rewardBox.createEl("div", {
          text: `${tierDisplayNames[reward.rewardTier]} | Claimed ${new Date(reward.claimedAt).toLocaleDateString()}`,
          attr: {
            style: `
              font-family: "Georgia", serif;
              font-size: 12px;
              color: #5a6a5d;
            `
          }
        });

        const markUsedBtn = rewardBox.createEl("button", {
          text: "Mark as Used",
          cls: "track-habit-rank-btn",
          attr: {
            style: `
              margin-top: 12px;
              padding: 10px 16px;
              min-height: 44px;
              background: transparent;
              color: #5a6a5d;
              border: 1px solid #2a3a2d;
              cursor: pointer;
              font-family: "Times New Roman", serif;
              font-size: 11px;
              letter-spacing: 1px;
              text-transform: uppercase;
            `
          }
        });

        markUsedBtn.onclick = async () => {
          reward.used = true;
          await this.plugin.saveSettings();
          this.onOpen(); // Re-render
          new Notice("Reward marked as used");
        };
      });
    }

    // Empty state
    if (settings.pendingRewards.length === 0 && settings.bankedRewards.length === 0 && recentClaimed.length === 0) {
      contentEl.createEl("div", {
        text: "No rewards yet. Keep completing activities to earn rewards!",
        attr: {
          style: `
            margin-top: 20px;
            padding: 20px;
            text-align: center;
            font-family: "Georgia", serif;
            font-size: 14px;
            font-style: italic;
            color: #5a6a5d;
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
   DEVELOPER CONTROL CENTER
====================== */

const VIEW_TYPE_DEV_DASHBOARD = "Track-rank-dev-dashboard";

/**
 * DeveloperDashboardView - Comprehensive developer control center
 *
 * Provides 100% transparency into internal state, calculations, and tracking logic.
 * Includes sections for:
 * - System Status (pause state, effective date, tier info)
 * - Activity Inspector (per-activity calculation breakdowns)
 * - Threshold Monitor (death threshold calculations)
 * - Debug Console (log stream with category filters)
 * - Manual Overrides (date simulation, force states)
 */
class DeveloperDashboardView extends ItemView {
  plugin: TrackHabitRankPlugin;
  private collapsedSections: Set<string> = new Set();

  constructor(leaf: WorkspaceLeaf, plugin: TrackHabitRankPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return VIEW_TYPE_DEV_DASHBOARD;
  }

  getDisplayText(): string {
    return "Developer Dashboard";
  }

  getIcon(): string {
    return "bug";
  }

  async onOpen(): Promise<void> {
    this.render();
    return Promise.resolve();
  }

  render() {
    const content = this.contentEl;
    content.empty();

    const settings = this.plugin.settings;

    const wrapper = content.createDiv({
      cls: "track-habit-rank-container track-habit-rank-dev-dashboard",
      attr: {
        style: `
          max-width: 600px;
          margin: 0 auto;
          padding: 16px;
        `
      }
    });

    // Header
    wrapper.createEl("h2", {
      text: "Developer Control Center",
      attr: { style: "margin-bottom: 8px; text-align: center;" }
    });

    wrapper.createEl("div", {
      text: "100% transparency into internal state and calculations",
      attr: {
        style: `
          text-align: center;
          font-size: 0.85em;
          opacity: 0.7;
          margin-bottom: 20px;
        `
      }
    });

    // Refresh button
    const refreshBtn = wrapper.createEl("button", {
      text: "Refresh Data",
      cls: "track-habit-rank-btn",
      attr: {
        style: `
          display: block;
          margin: 0 auto 20px auto;
          padding: 8px 16px;
          min-height: 44px;
        `
      }
    });
    refreshBtn.onclick = () => this.render();

    // Section A: System Status
    this.renderSystemStatusSection(wrapper, settings);

    // Section B: Boss System
    this.renderBossSystemSection(wrapper, settings);

    // Section C: Activity Inspector
    this.renderActivityInspectorSection(wrapper, settings);

    // Section D: Threshold Monitor
    this.renderThresholdMonitorSection(wrapper, settings);

    // Section E: Tartarus State
    if (settings.inTartarus) {
      this.renderTartarusSection(wrapper, settings);
    }

    // Section F: Manual Overrides
    this.renderManualOverridesSection(wrapper, settings);

    // Section G: Debug Console
    this.renderDebugConsoleSection(wrapper);
  }

  private createCollapsibleSection(
    parent: HTMLElement,
    id: string,
    title: string
  ): { header: HTMLElement; content: HTMLElement } {
    const section = parent.createDiv({
      cls: `track-habit-rank-dev-section ${this.collapsedSections.has(id) ? 'collapsed' : ''}`
    });

    const header = section.createDiv({
      cls: "track-habit-rank-dev-section-header"
    });

    header.createEl("span", { text: title, attr: { style: "font-weight: 600;" } });
    header.createEl("span", {
      text: this.collapsedSections.has(id) ? "+" : "-",
      attr: { style: "font-size: 1.2em;" }
    });

    header.onclick = () => {
      if (this.collapsedSections.has(id)) {
        this.collapsedSections.delete(id);
      } else {
        this.collapsedSections.add(id);
      }
      this.render();
    };

    const contentDiv = section.createDiv({
      cls: "track-habit-rank-dev-section-content"
    });

    return { header, content: contentDiv };
  }

  private renderSystemStatusSection(parent: HTMLElement, settings: TrackRankSettings) {
    const { content } = this.createCollapsibleSection(parent, "system-status", "System Status");

    const effectiveNow = getEffectiveNow(settings);
    const effectiveToday = getEffectiveTodayISO(settings);

    const rows: [string, string][] = [
      ["System State", settings.systemState.toUpperCase()],
      ["Effective Now", effectiveNow.toISOString()],
      ["Effective Today", effectiveToday],
      ["Real Time", new Date().toISOString()],
      ["Pause Start", settings.pauseStartTime || "N/A"],
      ["Total Paused", this.plugin.getTotalPausedDisplay()],
      ["Simulated Date", settings.simulatedDate || "None (using real time)"]
    ];

    this.renderDataTable(content, rows);

    // Pause state indicator
    if (settings.systemState === 'paused') {
      content.createEl("div", {
        text: `Currently paused for: ${this.plugin.getPauseDurationDisplay()}`,
        attr: {
          style: `
            margin-top: 12px;
            padding: 8px;
            background: rgba(124, 58, 237, 0.15);
            border-radius: 6px;
            text-align: center;
            font-weight: 600;
            color: #7C3AED;
          `
        }
      });
    }
  }

  private renderBossSystemSection(parent: HTMLElement, settings: TrackRankSettings) {
    const { content } = this.createCollapsibleSection(parent, "boss-system", "Boss System");

    const boss = getCustomizedBossForTier(settings.currentTier, settings);
    const rankName = getRankNameForTier(settings.currentTier, settings);
    const hpPercent = Math.round((settings.bossCurrentHP / settings.bossMaxHP) * 100);

    const rows: [string, string][] = [
      ["Current Tier", `${settings.currentTier}/26`],
      ["Boss Name", boss?.name || "Unknown"],
      ["Rank Title", rankName],
      ["HP State", `${settings.bossCurrentHP}/${settings.bossMaxHP} (${hpPercent}%)`],
      ["In Tartarus", settings.inTartarus ? "YES" : "No"],
      ["Perfect Weeks", `${settings.consecutivePerfectWeeks}`],
      ["Failed Threshold Days", `${settings.failedThresholdDays}/3`]
    ];

    this.renderDataTable(content, rows);

    // Boss lore
    if (boss?.lore) {
      content.createEl("div", {
        text: boss.lore,
        attr: {
          style: `
            margin-top: 12px;
            padding: 8px;
            background: var(--background-secondary);
            border-radius: 6px;
            font-size: 0.85em;
            font-style: italic;
            opacity: 0.8;
          `
        }
      });
    }
  }

  private renderActivityInspectorSection(parent: HTMLElement, settings: TrackRankSettings) {
    const { content } = this.createCollapsibleSection(parent, "activity-inspector", "Activity Inspector");

    const allActivities = [
      ...getEffectiveActivities(settings)
        .filter(a => settings.enabledActivities[a._originalName!] ?? true)
        .map(a => ({
          name: a.name,
          folder: a.folder,
          field: a.field,
          damagePerCompletion: a.damagePerCompletion,
          trackingMode: a.trackingMode,
          damagePerWeek: a.damagePerWeek,
          weeklyTarget: a.weeklyTarget
        })),
      ...settings.customHabits.filter(h => h.enabled)
    ];

    if (allActivities.length === 0) {
      content.createEl("div", {
        text: "No activities enabled",
        attr: { style: "opacity: 0.6; text-align: center; padding: 12px;" }
      });
      return;
    }

    for (const activity of allActivities) {
      const activityBox = content.createDiv({
        attr: {
          style: `
            margin-bottom: 12px;
            padding: 10px;
            border: 1px solid var(--background-modifier-border);
            border-radius: 6px;
          `
        }
      });

      activityBox.createEl("div", {
        text: activity.name,
        attr: { style: "font-weight: 600; margin-bottom: 8px;" }
      });

      const completions = getCompletionsFromFolder(
        this.app,
        activity.folder,
        activity.field
      );

      let result: StreakResult;
      if (activity.trackingMode === 'weekly' && activity.damagePerWeek) {
        result = calculateWeeklyStreak(completions, activity.damagePerWeek, undefined, settings);
      } else {
        result = calculateLiveStreakWithDecay(
          completions,
          activity.damagePerCompletion,
          undefined,
          settings
        );
      }

      const completedDates = completions.filter(c => c.completed).length;

      const rows: [string, string][] = [
        ["Folder", activity.folder],
        ["Raw Completions", `${completedDates} files`],
        ["Current Streak", `${result.streak} days`],
        ["Calculated HP", `${result.hp}`],
        ["Tracking Mode", activity.trackingMode || 'daily'],
        ["Weekly Target", `${activity.weeklyTarget || 7}`]
      ];

      this.renderDataTable(activityBox, rows, true);
    }
  }

  private renderThresholdMonitorSection(parent: HTMLElement, settings: TrackRankSettings) {
    const { content } = this.createCollapsibleSection(parent, "threshold-monitor", "Death Threshold Monitor");

    const allActivities = [
      ...getEffectiveActivities(settings).filter(a => settings.enabledActivities[a._originalName!] ?? true),
      ...settings.customHabits.filter(h => h.enabled)
    ];

    const weeklyTarget = allActivities.reduce((sum, a) => {
      return sum + (a.weeklyTarget || 7);
    }, 0);

    const requiredCompletions = Math.ceil(weeklyTarget * 0.1);

    const effectiveNow = getEffectiveNow(settings);
    const today = new Date(effectiveNow);
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 2);

    let totalCompletions = 0;
    for (const activity of allActivities) {
      const completions = getCompletionsFromFolder(this.app, activity.folder, activity.field);
      completions.forEach(c => {
        if (!c.completed) return;
        const date = new Date(c.date);
        date.setHours(0, 0, 0, 0);
        if (date >= startDate && date <= today) {
          totalCompletions++;
        }
      });
    }

    const belowThreshold = totalCompletions < requiredCompletions;
    const status = belowThreshold
      ? (settings.failedThresholdDays >= 2 ? "DEATH IMMINENT" : "WARNING")
      : "SAFE";

    const rows: [string, string][] = [
      ["Weekly Target (total)", `${weeklyTarget}`],
      ["Required 3-day Completions", `${requiredCompletions} (10% of weekly)`],
      ["3-day Window", `${startDate.toISOString().slice(0, 10)} → ${today.toISOString().slice(0, 10)}`],
      ["Actual Completions", `${totalCompletions}`],
      ["Status", status],
      ["Failed Days Counter", `${settings.failedThresholdDays}/3`]
    ];

    this.renderDataTable(content, rows);

    // Status indicator
    const statusColor = status === "SAFE" ? "#10B981"
      : status === "WARNING" ? "#F59E0B"
      : "#EF4444";

    content.createEl("div", {
      text: status,
      attr: {
        style: `
          margin-top: 12px;
          padding: 10px;
          background: ${statusColor}22;
          border: 2px solid ${statusColor};
          border-radius: 6px;
          text-align: center;
          font-weight: 700;
          color: ${statusColor};
        `
      }
    });
  }

  private renderTartarusSection(parent: HTMLElement, settings: TrackRankSettings) {
    const { content } = this.createCollapsibleSection(parent, "tartarus", "Tartarus State");

    const effectiveNow = getEffectiveNow(settings);
    const daysIn = settings.tartarusStartDate
      ? Math.floor((effectiveNow.getTime() - new Date(settings.tartarusStartDate).getTime()) / (24 * 60 * 60 * 1000))
      : 0;

    const requiredTasks = settings.currentTier <= 4 ? 3 : settings.currentTier <= 12 ? 4 : 5;
    const completedTasks = settings.tartarusPenanceTasks.filter(t => t.completed).length;

    const rows: [string, string][] = [
      ["Days in Tartarus", `${daysIn}`],
      ["Tartarus Start", settings.tartarusStartDate || "N/A"],
      ["Required Tasks", `${requiredTasks}`],
      ["Completed Tasks", `${completedTasks}/${requiredTasks}`],
      ["Tokens Available", `${settings.disciplineTokens}/3`]
    ];

    this.renderDataTable(content, rows);

    // Penance tasks list
    if (settings.tartarusPenanceTasks.length > 0) {
      content.createEl("div", {
        text: "Penance Tasks:",
        attr: { style: "font-weight: 600; margin-top: 12px; margin-bottom: 8px;" }
      });

      settings.tartarusPenanceTasks.forEach(task => {
        content.createEl("div", {
          text: `${task.completed ? "✓" : "○"} ${task.description}`,
          attr: {
            style: `
              padding: 4px 8px;
              font-size: 0.85em;
              opacity: ${task.completed ? 0.6 : 1};
              ${task.completed ? 'text-decoration: line-through;' : ''}
            `
          }
        });
      });
    }
  }

  private renderManualOverridesSection(parent: HTMLElement, settings: TrackRankSettings) {
    const { content } = this.createCollapsibleSection(parent, "manual-overrides", "Manual Overrides (Developer Tools)");

    // Warning
    content.createEl("div", {
      text: "⚠️ These tools can break game state. Use with caution.",
      attr: {
        style: `
          margin-bottom: 12px;
          padding: 8px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 6px;
          font-size: 0.85em;
          color: #EF4444;
        `
      }
    });

    // Simulate Date
    const dateSection = content.createDiv({ attr: { style: "margin-bottom: 16px;" } });
    dateSection.createEl("div", {
      text: "Simulate Date (override effective time):",
      attr: { style: "font-weight: 600; margin-bottom: 8px;" }
    });

    const dateInput = dateSection.createEl("input", {
      attr: {
        type: "date",
        value: settings.simulatedDate || "",
        style: `
          padding: 8px;
          border: 1px solid var(--background-modifier-border);
          border-radius: 4px;
          margin-right: 8px;
        `
      }
    });

    const setDateBtn = dateSection.createEl("button", {
      text: "Set Date",
      cls: "track-habit-rank-btn",
      attr: { style: "padding: 8px 12px; margin-right: 8px; min-height: 44px;" }
    });
    setDateBtn.onclick = async () => {
      const newDate = (dateInput as HTMLInputElement).value || null;
      this.plugin.settings.simulatedDate = newDate;
      debugLog.log('DEV', 'Date simulation set', { simulatedDate: newDate });
      await this.plugin.saveSettings();
      this.plugin.refreshRankView();
      this.render();
      new Notice(this.plugin.settings.simulatedDate
        ? `Date simulation active: ${this.plugin.settings.simulatedDate}`
        : "Date simulation cleared");
    };

    const clearDateBtn = dateSection.createEl("button", {
      text: "Clear",
      cls: "track-habit-rank-btn",
      attr: { style: "padding: 8px 12px; min-height: 44px;" }
    });
    clearDateBtn.onclick = async () => {
      debugLog.log('DEV', 'Date simulation cleared');
      this.plugin.settings.simulatedDate = null;
      await this.plugin.saveSettings();
      this.plugin.refreshRankView();
      this.render();
      new Notice("Date simulation cleared - using real time");
    };

    // Quick Actions
    content.createEl("div", {
      text: "Quick Actions:",
      attr: { style: "font-weight: 600; margin-bottom: 8px;" }
    });

    const actionsRow = content.createDiv({
      attr: { style: "display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;" }
    });

    // Force Tartarus
    const forceTartarusBtn = actionsRow.createEl("button", {
      text: "Force Tartarus",
      cls: "track-habit-rank-btn",
      attr: { style: "padding: 8px 12px; min-height: 44px; background: rgba(220, 38, 38, 0.15); color: #DC2626;" }
    });
    forceTartarusBtn.onclick = async () => {
      debugLog.log('DEV', 'Force Tartarus triggered');
      enterTartarus(this.plugin.settings);
      await this.plugin.saveSettings();
      this.plugin.refreshRankView();
      this.render();
      new Notice("Forced entry into Tartarus");
    };

    // Reset Boss HP
    const resetBossBtn = actionsRow.createEl("button", {
      text: "Reset Boss HP",
      cls: "track-habit-rank-btn",
      attr: { style: "padding: 8px 12px; min-height: 44px;" }
    });
    resetBossBtn.onclick = async () => {
      const prevHP = this.plugin.settings.bossCurrentHP;
      this.plugin.settings.bossCurrentHP = this.plugin.settings.bossMaxHP;
      debugLog.log('DEV', 'Boss HP reset', { prevHP, newHP: this.plugin.settings.bossMaxHP });
      await this.plugin.saveSettings();
      this.plugin.refreshRankView();
      this.render();
      new Notice("Boss HP reset to max");
    };

    // Add Token
    const addTokenBtn = actionsRow.createEl("button", {
      text: "+1 Token",
      cls: "track-habit-rank-btn",
      attr: { style: "padding: 8px 12px; min-height: 44px;" }
    });
    addTokenBtn.onclick = async () => {
      const prevTokens = this.plugin.settings.disciplineTokens;
      this.plugin.settings.disciplineTokens = Math.min(3, this.plugin.settings.disciplineTokens + 1);
      debugLog.log('DEV', 'Token added', { prevTokens, newTokens: this.plugin.settings.disciplineTokens });
      await this.plugin.saveSettings();
      this.plugin.refreshRankView();
      this.render();
      new Notice(`Token added (${this.plugin.settings.disciplineTokens}/3)`);
    };

    // Escape Tartarus
    if (settings.inTartarus) {
      const escapeBtn = actionsRow.createEl("button", {
        text: "Escape Tartarus",
        cls: "track-habit-rank-btn",
        attr: { style: "padding: 8px 12px; min-height: 44px; background: rgba(34, 197, 94, 0.15); color: #10B981;" }
      });
      escapeBtn.onclick = async () => {
        debugLog.log('DEV', 'Escape Tartarus triggered (developer override)');
        this.plugin.settings.inTartarus = false;
        this.plugin.settings.tartarusPenanceTasks = [];
        this.plugin.settings.tartarusStartDate = null;
        await this.plugin.saveSettings();
        this.plugin.refreshRankView();
        this.render();
        new Notice("Escaped Tartarus (developer override)");
      };
    }

    // Reset Pause Time
    const resetPauseBtn = actionsRow.createEl("button", {
      text: "Reset Pause Time",
      cls: "track-habit-rank-btn",
      attr: { style: "padding: 8px 12px; min-height: 44px;" }
    });
    resetPauseBtn.onclick = async () => {
      const prevPausedTime = this.plugin.settings.totalPausedTime;
      this.plugin.settings.totalPausedTime = 0;
      debugLog.log('DEV', 'Total pause time reset', {
        prevPausedTime: Math.round(prevPausedTime / 1000) + 's'
      });
      await this.plugin.saveSettings();
      this.plugin.refreshRankView();
      this.render();
      new Notice("Total paused time reset to 0");
    };
  }

  private renderDataTable(parent: HTMLElement, rows: [string, string][], compact = false) {
    const table = parent.createEl("table", {
      attr: {
        style: `
          width: 100%;
          font-size: ${compact ? '0.8em' : '0.85em'};
          border-collapse: collapse;
        `
      }
    });

    rows.forEach(([label, value]) => {
      const row = table.createEl("tr");
      row.createEl("td", {
        text: label,
        attr: {
          style: `
            padding: ${compact ? '3px 6px' : '4px 8px'};
            opacity: 0.7;
            white-space: nowrap;
          `
        }
      });
      row.createEl("td", {
        text: value,
        attr: {
          style: `
            padding: ${compact ? '3px 6px' : '4px 8px'};
            font-family: monospace;
            word-break: break-all;
          `
        }
      });
    });
  }

  private renderDebugConsoleSection(parent: HTMLElement) {
    const { content } = this.createCollapsibleSection(parent, "debug-console", "Debug Console");

    // Controls row
    const controlsRow = content.createDiv({
      attr: { style: "display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;" }
    });

    const clearBtn = controlsRow.createEl("button", {
      text: "Clear Logs",
      cls: "track-habit-rank-btn",
      attr: { style: "padding: 6px 12px; min-height: 36px; font-size: 0.85em;" }
    });
    clearBtn.onclick = () => {
      debugLog.clear();
      this.render();
    };

    const refreshLogsBtn = controlsRow.createEl("button", {
      text: "Refresh",
      cls: "track-habit-rank-btn",
      attr: { style: "padding: 6px 12px; min-height: 36px; font-size: 0.85em;" }
    });
    refreshLogsBtn.onclick = () => this.render();

    // Log count
    const entries = debugLog.getAll();
    controlsRow.createEl("span", {
      text: `${entries.length} entries`,
      attr: { style: "align-self: center; font-size: 0.85em; opacity: 0.7;" }
    });

    // Log console
    const console = content.createDiv({
      cls: "track-habit-rank-log-console",
      attr: { style: "max-height: 300px; overflow-y: auto;" }
    });

    if (entries.length === 0) {
      console.createEl("div", {
        text: "No log entries yet. Perform actions to see logs.",
        attr: {
          style: `
            padding: 16px;
            text-align: center;
            opacity: 0.6;
          `
        }
      });
    } else {
      // Show newest first
      const recentEntries = debugLog.getLast(50);
      recentEntries.forEach(entry => {
        const categoryClass = `log-${entry.category.toLowerCase()}`;
        const entryEl = console.createDiv({
          cls: `track-habit-rank-log-entry ${categoryClass}`,
          attr: {
            style: `
              padding: 4px 8px;
              border-bottom: 1px solid var(--background-modifier-border);
              font-family: monospace;
              font-size: 0.8em;
            `
          }
        });

        const time = entry.timestamp.toISOString().slice(11, 19);
        entryEl.createEl("span", {
          text: `[${time}]`,
          attr: { style: "opacity: 0.5; margin-right: 4px;" }
        });

        entryEl.createEl("span", {
          text: `[${entry.category}]`,
          attr: { style: "font-weight: 600; margin-right: 4px;" }
        });

        entryEl.createEl("span", { text: entry.message });

        if (entry.data) {
          entryEl.createEl("span", {
            text: ` | ${JSON.stringify(entry.data)}`,
            attr: { style: "opacity: 0.7;" }
          });
        }
      });
    }
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

    // Add mobile-friendly class to container
    containerEl.addClass('track-habit-rank-settings');

    new Setting(containerEl)
      .setName("Mythological Habit Tracker")
      .setDesc("Configure your activities and boss progression")
      .setHeading();

    // ==========================================
    // SYSTEM & DEVELOPER TOOLS SECTION
    // ==========================================
    new Setting(containerEl)
      .setName("System & Developer Tools")
      .setHeading();

    // --- Pause System ---
    const pauseSection = containerEl.createDiv({
      cls: "track-habit-rank-section",
      attr: {
        style: `
          margin: 12px 0;
          padding: 16px;
          border: 1px solid var(--background-modifier-border);
          border-radius: 8px;
          background: var(--background-secondary);
        `
      }
    });

    pauseSection.createEl("div", {
      text: "Pause System",
      attr: { style: "font-weight: 600; margin-bottom: 12px; font-size: 1em;" }
    });

    // Pause status display
    const pauseStatus = pauseSection.createDiv({
      attr: {
        style: `
          padding: 10px 12px;
          border-radius: 6px;
          margin-bottom: 12px;
          text-align: center;
          font-weight: 600;
          ${this.plugin.settings.systemState === 'paused'
            ? 'background: rgba(124, 58, 237, 0.15); color: #7C3AED; border: 1px solid rgba(124, 58, 237, 0.3);'
            : 'background: rgba(34, 197, 94, 0.15); color: #10B981; border: 1px solid rgba(34, 197, 94, 0.3);'
          }
        `
      }
    });

    if (this.plugin.settings.systemState === 'paused') {
      pauseStatus.setText(`PAUSED - ${this.plugin.getPauseDurationDisplay()}`);
    } else {
      pauseStatus.setText("ACTIVE - System running normally");
    }

    // Pause toggle button (large, touch-friendly)
    const pauseBtn = pauseSection.createEl("button", {
      text: this.plugin.settings.systemState === 'paused' ? "Resume System" : "Pause System",
      cls: "track-habit-rank-btn",
      attr: {
        style: `
          width: 100%;
          padding: 14px 20px;
          min-height: 50px;
          font-size: 1em;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          border: none;
          ${this.plugin.settings.systemState === 'paused'
            ? 'background: #10B981; color: white;'
            : 'background: #7C3AED; color: white;'
          }
        `
      }
    });

    pauseBtn.onclick = async () => {
      await this.plugin.toggleSystemState();
      this.display(); // Refresh settings display
    };

    // Total accumulated pause time
    if (this.plugin.settings.totalPausedTime > 0 || this.plugin.settings.systemState === 'paused') {
      pauseSection.createEl("div", {
        text: `Total pause time: ${this.plugin.getTotalPausedDisplay()}`,
        attr: {
          style: `
            margin-top: 10px;
            font-size: 0.85em;
            opacity: 0.7;
            text-align: center;
          `
        }
      });
    }

    // --- Developer Dashboard ---
    const devSection = containerEl.createDiv({
      cls: "track-habit-rank-section",
      attr: {
        style: `
          margin: 12px 0;
          padding: 16px;
          border: 1px solid var(--background-modifier-border);
          border-radius: 8px;
          background: var(--background-secondary);
        `
      }
    });

    devSection.createEl("div", {
      text: "Developer Dashboard",
      attr: { style: "font-weight: 600; margin-bottom: 12px; font-size: 1em;" }
    });

    // Open Developer Dashboard button
    const openDashboardBtn = devSection.createEl("button", {
      text: "Open Developer Dashboard",
      cls: "track-habit-rank-btn",
      attr: {
        style: `
          width: 100%;
          padding: 14px 20px;
          min-height: 50px;
          font-size: 1em;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          background: var(--interactive-accent);
          color: var(--text-on-accent);
          border: none;
          margin-bottom: 12px;
        `
      }
    });

    openDashboardBtn.onclick = () => {
      this.plugin.activateDevDashboard();
    };

    // Debug logging toggle
    new Setting(devSection)
      .setName("Debug logging")
      .setDesc("Enable detailed logging in Developer Dashboard")
      .addToggle(toggle =>
        toggle
          .setValue(true) // Always enabled for now
          .onChange(enabled => {
            debugLog.setEnabled(enabled);
            new Notice(enabled ? "Debug logging enabled" : "Debug logging disabled");
          })
      );

    // --- Quick Stats ---
    const statsSection = containerEl.createDiv({
      cls: "track-habit-rank-section",
      attr: {
        style: `
          margin: 12px 0;
          padding: 16px;
          border: 1px solid var(--background-modifier-border);
          border-radius: 8px;
          background: var(--background-secondary);
        `
      }
    });

    statsSection.createEl("div", {
      text: "Quick Stats",
      attr: { style: "font-weight: 600; margin-bottom: 12px; font-size: 1em;" }
    });

    const statsGrid = statsSection.createDiv({
      attr: {
        style: `
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        `
      }
    });

    // Effective Date
    const effectiveNow = getEffectiveNow(this.plugin.settings);
    const effectiveDate = effectiveNow.toISOString().slice(0, 10);
    const isSimulated = !!this.plugin.settings.simulatedDate;

    this.createStatCard(statsGrid, "Effective Date", effectiveDate, isSimulated ? "#F59E0B" : "#10B981");

    // Boss HP
    const hpPercent = Math.round((this.plugin.settings.bossCurrentHP / this.plugin.settings.bossMaxHP) * 100);
    const hpColor = hpPercent > 50 ? "#10B981" : hpPercent > 20 ? "#F59E0B" : "#EF4444";
    this.createStatCard(statsGrid, "Boss HP", `${this.plugin.settings.bossCurrentHP}/${this.plugin.settings.bossMaxHP}`, hpColor);

    // Failed Threshold Days
    const thresholdColor = this.plugin.settings.failedThresholdDays === 0 ? "#10B981"
      : this.plugin.settings.failedThresholdDays === 1 ? "#F59E0B"
      : "#EF4444";
    this.createStatCard(statsGrid, "Threshold Days", `${this.plugin.settings.failedThresholdDays}/3`, thresholdColor);

    // Tier
    const tierColor = this.plugin.settings.inTartarus ? "#DC2626" : "#7C3AED";
    this.createStatCard(statsGrid, "Current Tier", `${this.plugin.settings.currentTier}/26`, tierColor);

    // Simulated date indicator
    if (isSimulated) {
      statsSection.createEl("div", {
        text: `Date simulated: ${this.plugin.settings.simulatedDate}`,
        attr: {
          style: `
            margin-top: 10px;
            padding: 8px;
            background: rgba(245, 158, 11, 0.15);
            border: 1px solid rgba(245, 158, 11, 0.3);
            border-radius: 6px;
            font-size: 0.85em;
            color: #F59E0B;
            text-align: center;
          `
        }
      });
    }

    // Tartarus warning
    if (this.plugin.settings.inTartarus) {
      statsSection.createEl("div", {
        text: "IN TARTARUS - Complete penance to escape",
        attr: {
          style: `
            margin-top: 10px;
            padding: 10px;
            background: rgba(220, 38, 38, 0.15);
            border: 2px solid #DC2626;
            border-radius: 6px;
            font-size: 0.9em;
            color: #DC2626;
            font-weight: 700;
            text-align: center;
          `
        }
      });
    }

    // ==========================================
    // BOSS PROGRESSION SECTION
    // ==========================================
    new Setting(containerEl)
      .setName("Boss Progression")
      .setHeading();

    // Get stats for display
    const stats = this.getWeeklyTargetStats();

    // Difficulty scaling info
    const difficultyInfo = containerEl.createDiv({
      attr: {
        style: `
          margin-bottom: 16px;
          padding: 12px;
          background: var(--background-secondary);
          border-radius: 8px;
          font-size: 0.85em;
        `
      }
    });

    if (this.plugin.settings.useAutoDynamicHP) {
      // Auto mode info
      const tier1HP = stats.lowest * 4;
      const maxTierHP = Math.round(stats.total * this.plugin.settings.autoDynamicHPMaxMultiplier);
      const currentHP = calculateBossHP(stats.total, this.plugin.settings.currentTier, this.plugin.settings, stats.lowest);

      difficultyInfo.createEl("div", {
        text: `AUTO MODE: Current Tier ${this.plugin.settings.currentTier} HP = ${currentHP}`,
        attr: { style: "font-weight: 600; margin-bottom: 4px; color: #22C55E;" }
      });

      difficultyInfo.createEl("div", {
        text: `Tier 1: ${tier1HP} HP (${stats.lowest} lowest × 4 weeks)`,
        attr: { style: "opacity: 0.8; margin-bottom: 2px;" }
      });

      difficultyInfo.createEl("div", {
        text: `Tier ${this.plugin.settings.maxTier}: ${maxTierHP} HP (${stats.total} total × ${this.plugin.settings.autoDynamicHPMaxMultiplier})`,
        attr: { style: "opacity: 0.7;" }
      });
    } else {
      // Manual mode info
      const currentMultiplier = (
        this.plugin.settings.bossHPMultiplierMin +
        (this.plugin.settings.bossHPMultiplierMax - this.plugin.settings.bossHPMultiplierMin) *
        ((this.plugin.settings.currentTier - 1) / Math.max(1, this.plugin.settings.maxTier - 1))
      ).toFixed(2);

      difficultyInfo.createEl("div", {
        text: `MANUAL MODE: Tier ${this.plugin.settings.currentTier} HP = ${stats.total} × ${currentMultiplier}`,
        attr: { style: "font-weight: 600; margin-bottom: 4px;" }
      });

      difficultyInfo.createEl("div", {
        text: `Range: Tier 1 (×${this.plugin.settings.bossHPMultiplierMin}) → Tier ${this.plugin.settings.maxTier} (×${this.plugin.settings.bossHPMultiplierMax})`,
        attr: { style: "opacity: 0.7;" }
      });
    }

    // Auto Dynamic HP toggle
    new Setting(containerEl)
      .setName("Auto-calculate HP (Dynamic Mode)")
      .setDesc("ON: Tier 1 = easiest activity × 4 weeks, Max tier = all activities × multiplier. OFF: Use manual multipliers.")
      .addToggle(t =>
        t
          .setValue(this.plugin.settings.useAutoDynamicHP)
          .onChange(async v => {
            this.plugin.settings.useAutoDynamicHP = v;
            // Recalculate boss max HP only - preserve current HP
            const stats = this.getWeeklyTargetStats();
            const newMaxHP = calculateBossHP(
              stats.total,
              this.plugin.settings.currentTier,
              this.plugin.settings,
              stats.lowest
            );
            // Only update maxHP, leave currentHP unchanged
            this.plugin.settings.bossMaxHP = newMaxHP;
            // Clamp currentHP if it exceeds new max
            if (this.plugin.settings.bossCurrentHP > newMaxHP) {
              this.plugin.settings.bossCurrentHP = newMaxHP;
            }
            await this.plugin.saveSettings();
            this.plugin.refreshRankView();
            this.display();
          })
      );

    // Show different settings based on mode
    if (this.plugin.settings.useAutoDynamicHP) {
      // Auto mode: only show max tier multiplier
      new Setting(containerEl)
        .setName("Max tier multiplier")
        .setDesc(`Max tier HP = total weekly target (${stats.total}) × this value`)
        .addText(t =>
          t
            .setPlaceholder("1.5")
            .setValue(String(this.plugin.settings.autoDynamicHPMaxMultiplier))
            .onChange(async v => {
              const num = parseFloat(v);
              if (!isNaN(num) && num >= 0.5 && num <= 10) {
                this.plugin.settings.autoDynamicHPMaxMultiplier = num;
                const stats = this.getWeeklyTargetStats();
                const newMaxHP = calculateBossHP(
                  stats.total,
                  this.plugin.settings.currentTier,
                  this.plugin.settings,
                  stats.lowest
                );
                this.plugin.settings.bossMaxHP = newMaxHP;
                if (this.plugin.settings.bossCurrentHP > newMaxHP) {
                  this.plugin.settings.bossCurrentHP = newMaxHP;
                }
                await this.plugin.saveSettings();
                this.plugin.refreshRankView();
                this.display();
              }
            })
        );
    } else {
      // Manual mode: show min/max multipliers
      new Setting(containerEl)
        .setName("Starting difficulty (Tier 1)")
        .setDesc("HP multiplier at Tier 1. Lower = easier start.")
        .addText(t =>
          t
            .setPlaceholder("1.1")
            .setValue(String(this.plugin.settings.bossHPMultiplierMin))
            .onChange(async v => {
              const num = parseFloat(v);
              if (!isNaN(num) && num >= 0.5 && num <= 5) {
                this.plugin.settings.bossHPMultiplierMin = num;
                const stats = this.getWeeklyTargetStats();
                const newMaxHP = calculateBossHP(
                  stats.total,
                  this.plugin.settings.currentTier,
                  this.plugin.settings,
                  stats.lowest
                );
                this.plugin.settings.bossMaxHP = newMaxHP;
                if (this.plugin.settings.bossCurrentHP > newMaxHP) {
                  this.plugin.settings.bossCurrentHP = newMaxHP;
                }
                await this.plugin.saveSettings();
                this.plugin.refreshRankView();
                this.display();
              }
            })
        );

      new Setting(containerEl)
        .setName("End game difficulty (Max Tier)")
        .setDesc("HP multiplier at the highest tier. Higher = harder end game.")
        .addText(t =>
          t
            .setPlaceholder("2.4")
            .setValue(String(this.plugin.settings.bossHPMultiplierMax))
            .onChange(async v => {
              const num = parseFloat(v);
              if (!isNaN(num) && num >= 0.5 && num <= 10) {
                this.plugin.settings.bossHPMultiplierMax = num;
                const stats = this.getWeeklyTargetStats();
                const newMaxHP = calculateBossHP(
                  stats.total,
                  this.plugin.settings.currentTier,
                  this.plugin.settings,
                  stats.lowest
                );
                this.plugin.settings.bossMaxHP = newMaxHP;
                if (this.plugin.settings.bossCurrentHP > newMaxHP) {
                  this.plugin.settings.bossCurrentHP = newMaxHP;
                }
                await this.plugin.saveSettings();
                this.plugin.refreshRankView();
                this.display();
              }
            })
        );
    }

    // Maximum tier setting (always shown)
    new Setting(containerEl)
      .setName("Maximum tier")
      .setDesc("The highest tier in the progression system (default 14 = 7 bosses × 2 tiers)")
      .addText(t =>
        t
          .setPlaceholder("14")
          .setValue(String(this.plugin.settings.maxTier))
          .onChange(async v => {
            const num = parseInt(v);
            if (!isNaN(num) && num >= 2 && num <= 100) {
              this.plugin.settings.maxTier = num;
              const stats = this.getWeeklyTargetStats();
              const newMaxHP = calculateBossHP(
                stats.total,
                this.plugin.settings.currentTier,
                this.plugin.settings,
                stats.lowest
              );
              this.plugin.settings.bossMaxHP = newMaxHP;
              if (this.plugin.settings.bossCurrentHP > newMaxHP) {
                this.plugin.settings.bossCurrentHP = newMaxHP;
              }
              await this.plugin.saveSettings();
              this.plugin.refreshRankView();
              this.display();
            }
          })
      );

    // Reset difficulty to defaults
    new Setting(containerEl)
      .setName("Reset difficulty scaling")
      .setDesc("Restore default difficulty settings")
      .addButton(btn =>
        btn
          .setButtonText("Reset Defaults")
          .onClick(async () => {
            this.plugin.settings.useAutoDynamicHP = false;
            this.plugin.settings.autoDynamicHPMaxMultiplier = 1.5;
            this.plugin.settings.bossHPMultiplierMin = 1.1;
            this.plugin.settings.bossHPMultiplierMax = 2.4;
            this.plugin.settings.maxTier = 14;
            const stats = this.getWeeklyTargetStats();
            const newMaxHP = calculateBossHP(
              stats.total,
              this.plugin.settings.currentTier,
              this.plugin.settings,
              stats.lowest
            );
            this.plugin.settings.bossMaxHP = newMaxHP;
            if (this.plugin.settings.bossCurrentHP > newMaxHP) {
              this.plugin.settings.bossCurrentHP = newMaxHP;
            }
            await this.plugin.saveSettings();
            this.plugin.refreshRankView();
            this.display();
            new Notice("Difficulty scaling reset to defaults");
          })
      );

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
            const stats = this.getWeeklyTargetStats();
            this.plugin.settings.bossMaxHP = calculateBossHP(stats.total, 1, this.plugin.settings, stats.lowest);
            this.plugin.settings.bossCurrentHP = this.plugin.settings.bossMaxHP;
            this.plugin.settings.consecutivePerfectWeeks = 0;
            this.plugin.settings.disciplineTokens = 0;
            this.plugin.settings.disciplineCompletionCount = 0;
            this.plugin.settings.tierAdvancedAt50Percent = false;
            this.plugin.settings.inTartarus = false;
            await this.plugin.saveSettings();
            this.plugin.refreshRankView();
            new Notice("Boss progression reset to Tier 1");
          })
      );

    // ==========================================
    // BOSS EDITOR SECTION
    // ==========================================
    new Setting(containerEl)
      .setName("Boss Editor")
      .setDesc("Customize boss names, descriptions, lore, and images")
      .setHeading();

    // Reset all customizations button
    new Setting(containerEl)
      .setName("Reset all boss customizations")
      .setDesc("Restore all bosses to their default values")
      .addButton(btn =>
        btn
          .setButtonText("Reset All")
          .setWarning()
          .onClick(async () => {
            this.plugin.settings.customBosses = [];
            await this.plugin.saveSettings();
            this.plugin.refreshRankView();
            this.display();
            new Notice("All boss customizations reset");
          })
      );

    // Create collapsible editor for each boss
    BOSSES.forEach((boss, index) => {
      const bossIndex = index + 1; // 1-7
      const customOverride = this.plugin.settings.customBosses?.find(c => c.tier === bossIndex);

      const bossContainer = containerEl.createDiv({
        cls: "track-habit-rank-dev-section",
        attr: {
          style: `
            margin-top: 12px;
            border: 1px solid var(--background-modifier-border);
            border-radius: 8px;
            overflow: hidden;
          `
        }
      });

      // Collapsible header
      const header = bossContainer.createDiv({
        cls: "track-habit-rank-dev-section-header",
        attr: {
          style: `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            background: var(--background-secondary);
            cursor: pointer;
            min-height: 44px;
          `
        }
      });

      const currentName = customOverride?.name || boss.name;
      const tierRange = `Tiers ${boss.tier[0]}-${boss.tier[1]}`;
      const isCustomized = customOverride ? " ✏️" : "";

      header.createEl("span", {
        text: `${tierRange}: ${currentName}${isCustomized}`,
        attr: {
          style: "font-weight: 600;"
        }
      });

      const expandIcon = header.createEl("span", {
        text: "▼",
        attr: {
          style: "transition: transform 0.2s;"
        }
      });

      // Content section (initially collapsed)
      const content = bossContainer.createDiv({
        cls: "track-habit-rank-dev-section-content",
        attr: {
          style: `
            padding: 12px 16px;
            display: none;
          `
        }
      });

      // Toggle collapse on header click
      let isExpanded = false;
      header.addEventListener("click", () => {
        isExpanded = !isExpanded;
        content.style.display = isExpanded ? "block" : "none";
        expandIcon.style.transform = isExpanded ? "rotate(180deg)" : "rotate(0deg)";
      });

      // Boss Name
      new Setting(content)
        .setName("Boss Name")
        .addText(t =>
          t
            .setPlaceholder(boss.name)
            .setValue(customOverride?.name || "")
            .onChange(async v => {
              this.updateBossOverride(bossIndex, "name", v || undefined);
              await this.plugin.saveSettings();
              this.plugin.refreshRankView();
            })
        );

      // Rank 1 (lower tier)
      new Setting(content)
        .setName(`Rank at Tier ${boss.tier[0]}`)
        .addText(t =>
          t
            .setPlaceholder(boss.ranks[0])
            .setValue(customOverride?.ranks?.[0] || "")
            .onChange(async v => {
              const currentRanks = customOverride?.ranks || [...boss.ranks];
              const newRanks: [string, string] = [v || boss.ranks[0], currentRanks[1]];
              this.updateBossOverride(bossIndex, "ranks", newRanks);
              await this.plugin.saveSettings();
              this.plugin.refreshRankView();
            })
        );

      // Rank 2 (higher tier)
      new Setting(content)
        .setName(`Rank at Tier ${boss.tier[1]}`)
        .addText(t =>
          t
            .setPlaceholder(boss.ranks[1])
            .setValue(customOverride?.ranks?.[1] || "")
            .onChange(async v => {
              const currentRanks = customOverride?.ranks || [...boss.ranks];
              const newRanks: [string, string] = [currentRanks[0], v || boss.ranks[1]];
              this.updateBossOverride(bossIndex, "ranks", newRanks);
              await this.plugin.saveSettings();
              this.plugin.refreshRankView();
            })
        );

      // Description
      new Setting(content)
        .setName("Description")
        .addTextArea(t =>
          t
            .setPlaceholder(boss.description)
            .setValue(customOverride?.description || "")
            .onChange(async v => {
              this.updateBossOverride(bossIndex, "description", v || undefined);
              await this.plugin.saveSettings();
              this.plugin.refreshRankView();
            })
        );

      // Lore
      new Setting(content)
        .setName("Lore")
        .addTextArea(t =>
          t
            .setPlaceholder(boss.lore)
            .setValue(customOverride?.lore || "")
            .onChange(async v => {
              this.updateBossOverride(bossIndex, "lore", v || undefined);
              await this.plugin.saveSettings();
              this.plugin.refreshRankView();
            })
        );

      // Image URL
      new Setting(content)
        .setName("Image URL")
        .setDesc("URL to boss image (external link or vault path)")
        .addText(t =>
          t
            .setPlaceholder("https://... or vault/path/to/image.png")
            .setValue(customOverride?.image || "")
            .onChange(async v => {
              this.updateBossOverride(bossIndex, "image", v || undefined);
              await this.plugin.saveSettings();
              this.plugin.refreshRankView();
            })
        );

      // Reset this boss button
      new Setting(content)
        .addButton(btn =>
          btn
            .setButtonText("Reset This Boss")
            .onClick(async () => {
              this.plugin.settings.customBosses = this.plugin.settings.customBosses?.filter(
                c => c.tier !== bossIndex
              ) || [];
              await this.plugin.saveSettings();
              this.plugin.refreshRankView();
              this.display();
              new Notice(`${boss.name} reset to defaults`);
            })
        );
    });

    // ==========================================
    // TARTARUS TASK EDITOR SECTION
    // ==========================================
    new Setting(containerEl)
      .setName("Tartarus Task Editor")
      .setDesc("Customize penance tasks for each tier range")
      .setHeading();

    // Tartarus Image setting
    new Setting(containerEl)
      .setName("Tartarus Image")
      .setDesc("Custom image URL shown when in Tartarus (leave empty for default skull)")
      .addText(t =>
        t
          .setPlaceholder("https://... or vault/path/to/image.png")
          .setValue(this.plugin.settings.tartarusImage || "")
          .onChange(async v => {
            this.plugin.settings.tartarusImage = v || null;
            await this.plugin.saveSettings();
            this.plugin.refreshRankView();
          })
      );

    // Reset all Tartarus customizations button
    new Setting(containerEl)
      .setName("Reset all Tartarus tasks")
      .setDesc("Restore all penance tasks to their default values")
      .addButton(btn =>
        btn
          .setButtonText("Reset All")
          .setWarning()
          .onClick(async () => {
            this.plugin.settings.customTartarusTasks = [];
            this.plugin.settings.tartarusImage = null;
            await this.plugin.saveSettings();
            this.plugin.refreshRankView();
            this.display();
            new Notice("All Tartarus customizations reset");
          })
      );

    // Tartarus tier ranges
    const tartarusTierRanges: { range: TartarusTierRange; label: string; tiers: string }[] = [
      { range: "low", label: "Early Game", tiers: "Tiers 1-4" },
      { range: "mid", label: "Mid Game", tiers: "Tiers 5-12" },
      { range: "high", label: "End Game", tiers: "Tiers 13+" }
    ];

    tartarusTierRanges.forEach(({ range, label, tiers }) => {
      const customTasks = this.plugin.settings.customTartarusTasks?.find(t => t.tierRange === range);
      const currentTasks = customTasks?.tasks || DEFAULT_TARTARUS_TASKS[range];

      const tartarusContainer = containerEl.createDiv({
        cls: "track-habit-rank-dev-section",
        attr: {
          style: `
            margin-top: 12px;
            border: 1px solid var(--background-modifier-border);
            border-radius: 8px;
            overflow: hidden;
          `
        }
      });

      // Collapsible header
      const header = tartarusContainer.createDiv({
        cls: "track-habit-rank-dev-section-header",
        attr: {
          style: `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            background: var(--background-secondary);
            cursor: pointer;
            min-height: 44px;
          `
        }
      });

      const isCustomized = customTasks ? " ✏️" : "";

      header.createEl("span", {
        text: `${label} (${tiers})${isCustomized}`,
        attr: {
          style: "font-weight: 600;"
        }
      });

      const expandIcon = header.createEl("span", {
        text: "▼",
        attr: {
          style: "transition: transform 0.2s;"
        }
      });

      // Content section (initially collapsed)
      const content = tartarusContainer.createDiv({
        cls: "track-habit-rank-dev-section-content",
        attr: {
          style: `
            padding: 12px 16px;
            display: none;
          `
        }
      });

      // Toggle collapse on header click
      let isExpanded = false;
      header.addEventListener("click", () => {
        isExpanded = !isExpanded;
        content.style.display = isExpanded ? "block" : "none";
        expandIcon.style.transform = isExpanded ? "rotate(180deg)" : "rotate(0deg)";
      });

      // Info text
      content.createEl("div", {
        text: `Default: ${DEFAULT_TARTARUS_TASKS[range].length} tasks`,
        attr: {
          style: `
            font-size: 0.85em;
            opacity: 0.7;
            margin-bottom: 12px;
          `
        }
      });

      // Display current tasks with edit fields
      currentTasks.forEach((task, taskIndex) => {
        const taskBox = content.createDiv({
          attr: {
            style: `
              margin-bottom: 8px;
              padding: 8px;
              background: var(--background-primary);
              border-radius: 6px;
              border: 1px solid var(--background-modifier-border);
            `
          }
        });

        new Setting(taskBox)
          .setName(`Task ${taskIndex + 1}`)
          .addText(t =>
            t
              .setPlaceholder(DEFAULT_TARTARUS_TASKS[range][taskIndex]?.description || "Task description")
              .setValue(task.description)
              .onChange(async v => {
                this.updateTartarusTask(range, taskIndex, v);
                await this.plugin.saveSettings();
              })
          )
          .addButton(btn =>
            btn
              .setButtonText("×")
              .setWarning()
              .onClick(async () => {
                this.removeTartarusTask(range, taskIndex);
                await this.plugin.saveSettings();
                this.display();
              })
          );
      });

      // Add task button
      new Setting(content)
        .addButton(btn =>
          btn
            .setButtonText("+ Add Task")
            .setCta()
            .onClick(async () => {
              this.addTartarusTask(range);
              await this.plugin.saveSettings();
              this.display();
            })
        );

      // Reset this tier range button
      new Setting(content)
        .addButton(btn =>
          btn
            .setButtonText("Reset to Defaults")
            .onClick(async () => {
              this.plugin.settings.customTartarusTasks = this.plugin.settings.customTartarusTasks?.filter(
                t => t.tierRange !== range
              ) || [];
              await this.plugin.saveSettings();
              this.display();
              new Notice(`${label} Tartarus tasks reset to defaults`);
            })
        );
    });

    new Setting(containerEl)
      .setName("Default activities")
      .setHeading();

    // Use effective activities to show customized values, but track by original name
    getEffectiveActivities(this.plugin.settings).forEach(activity => {
      const originalName = activity._originalName!;
      new Setting(containerEl)
        .setName(activity.name)
        .setDesc(`${activity.folder} - Target: ${activity.weeklyTarget}/week`)
        .addToggle(toggle =>
          toggle
            .setValue(
              this.plugin.settings.enabledActivities[originalName] ?? true
            )
            .onChange(async value => {
              const currentlyEnabled = this.plugin.settings.enabledActivities[originalName] ?? true;
              const aboutToDisable = currentlyEnabled && !value;
              
              if (aboutToDisable) {
                const completions = getCompletionsFromFolder(
                  this.app,
                  activity.folder,
                  activity.field
                );

                let result: StreakResult;
                if (activity.trackingMode === 'weekly' && activity.damagePerWeek) {
                  result = calculateWeeklyStreak(
                    completions,
                    activity.damagePerWeek,
                    undefined,
                    this.plugin.settings
                  );
                } else {
                  result = calculateLiveStreakWithDecay(
                    completions,
                    activity.damagePerCompletion,
                    undefined,
                    this.plugin.settings
                  );
                }

                // Count total completions for snapshot
                const completedCount = completions.filter(c => c.completed).length;
                const totalHP = completedCount; // Store completion count as "HP" for backward compat

                this.plugin.settings.activitySnapshots[originalName] = {
                  activityId: originalName,
                  disabledDate: getEffectiveTodayISO(this.plugin.settings),
                  frozenHP: totalHP,
                  frozenStreak: result.streak
                };
              }
              
              if (!aboutToDisable && value) {
                delete this.plugin.settings.activitySnapshots[originalName];
              }

              this.plugin.settings.enabledActivities[originalName] = value;

              // Recalculate boss max HP for current tier, preserve current HP
              const stats = this.getWeeklyTargetStats();
              const newMaxHP = calculateBossHP(stats.total, this.plugin.settings.currentTier, this.plugin.settings, stats.lowest);
              this.plugin.settings.bossMaxHP = newMaxHP;
              if (this.plugin.settings.bossCurrentHP > newMaxHP) {
                this.plugin.settings.bossCurrentHP = newMaxHP;
              }

              await this.plugin.saveSettings();
              this.plugin.refreshRankView();
            })
        );
    });

    // ==========================================
    // ACTIVITY EDITOR SECTION
    // ==========================================
    new Setting(containerEl)
      .setName("Activity Editor")
      .setDesc("Edit default activity properties (name, folder, field, HP values, weekly target)")
      .setHeading();

    // Reset all activity customizations button
    new Setting(containerEl)
      .setName("Reset all activity customizations")
      .setDesc("Restore all activities to their default values")
      .addButton(btn =>
        btn
          .setButtonText("Reset All")
          .setWarning()
          .onClick(async () => {
            this.plugin.settings.activityOverrides = [];
            await this.plugin.saveSettings();
            this.plugin.refreshRankView();
            this.display();
            new Notice("All activity customizations reset");
          })
      );

    // Create collapsible editor for each default activity
    ACTIVITIES.forEach(activity => {
      const override = this.plugin.settings.activityOverrides?.find(o => o.originalName === activity.name);

      const activityContainer = containerEl.createDiv({
        cls: "track-habit-rank-dev-section",
        attr: {
          style: `
            margin-top: 12px;
            border: 1px solid var(--background-modifier-border);
            border-radius: 8px;
            overflow: hidden;
          `
        }
      });

      // Collapsible header
      const header = activityContainer.createDiv({
        cls: "track-habit-rank-dev-section-header",
        attr: {
          style: `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            background: var(--background-secondary);
            cursor: pointer;
            min-height: 44px;
          `
        }
      });

      const displayName = override?.name || activity.name;
      const isCustomized = override ? " ✏️" : "";

      header.createEl("span", {
        text: `${displayName}${isCustomized}`,
        attr: {
          style: "font-weight: 600;"
        }
      });

      const expandIcon = header.createEl("span", {
        text: "▼",
        attr: {
          style: "transition: transform 0.2s;"
        }
      });

      // Content section (initially collapsed)
      const content = activityContainer.createDiv({
        cls: "track-habit-rank-dev-section-content",
        attr: {
          style: `
            padding: 12px 16px;
            display: none;
          `
        }
      });

      // Toggle collapse on header click
      let isExpanded = false;
      header.addEventListener("click", () => {
        isExpanded = !isExpanded;
        content.style.display = isExpanded ? "block" : "none";
        expandIcon.style.transform = isExpanded ? "rotate(180deg)" : "rotate(0deg)";
      });

      // Activity Name
      new Setting(content)
        .setName("Display Name")
        .setDesc("How this activity appears in the UI")
        .addText(t =>
          t
            .setPlaceholder(activity.name)
            .setValue(override?.name || "")
            .onChange(async v => {
              this.updateActivityOverride(activity.name, "name", v || undefined);
              await this.plugin.saveSettings();
              this.plugin.refreshRankView();
            })
        );

      // Folder path
      new Setting(content)
        .setName("Folder Path")
        .setDesc("Vault folder to scan for completion files")
        .addText(t =>
          t
            .setPlaceholder(activity.folder)
            .setValue(override?.folder || "")
            .onChange(async v => {
              this.updateActivityOverride(activity.name, "folder", v || undefined);
              await this.plugin.saveSettings();
              this.plugin.refreshRankView();
            })
        );

      // Field name
      new Setting(content)
        .setName("Field Name")
        .setDesc("Frontmatter/checkbox field to track")
        .addText(t =>
          t
            .setPlaceholder(activity.field)
            .setValue(override?.field || "")
            .onChange(async v => {
              this.updateActivityOverride(activity.name, "field", v || undefined);
              await this.plugin.saveSettings();
              this.plugin.refreshRankView();
            })
        );

      // Damage per completion
      new Setting(content)
        .setName("Damage per Completion")
        .setDesc("Boss damage dealt per activity completion")
        .addText(t =>
          t
            .setPlaceholder(String(activity.damagePerCompletion))
            .setValue(override?.damagePerCompletion !== undefined ? String(override.damagePerCompletion) : "")
            .onChange(async v => {
              const num = parseInt(v);
              this.updateActivityOverride(activity.name, "damagePerCompletion", isNaN(num) ? undefined : num);
              await this.plugin.saveSettings();
              this.plugin.refreshRankView();
            })
        );

      // Weekly target
      new Setting(content)
        .setName("Weekly Target")
        .setDesc("Target completions per week")
        .addText(t =>
          t
            .setPlaceholder(String(activity.weeklyTarget || 7))
            .setValue(override?.weeklyTarget !== undefined ? String(override.weeklyTarget) : "")
            .onChange(async v => {
              const num = parseInt(v);
              this.updateActivityOverride(activity.name, "weeklyTarget", isNaN(num) ? undefined : num);
              // Recalculate boss max HP, preserve current HP
              const stats = this.getWeeklyTargetStats();
              const newMaxHP = calculateBossHP(stats.total, this.plugin.settings.currentTier, this.plugin.settings, stats.lowest);
              this.plugin.settings.bossMaxHP = newMaxHP;
              if (this.plugin.settings.bossCurrentHP > newMaxHP) {
                this.plugin.settings.bossCurrentHP = newMaxHP;
              }
              await this.plugin.saveSettings();
              this.plugin.refreshRankView();
            })
        );

      // Reset button for this activity
      new Setting(content)
        .setName("Reset this activity")
        .setDesc("Restore to default values")
        .addButton(btn =>
          btn
            .setButtonText("Reset")
            .onClick(async () => {
              this.plugin.settings.activityOverrides = this.plugin.settings.activityOverrides.filter(
                o => o.originalName !== activity.name
              );
              await this.plugin.saveSettings();
              this.plugin.refreshRankView();
              this.display();
              new Notice(`${activity.name} reset to defaults`);
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
              damagePerCompletion: 1,
              enabled: true,
              weeklyTarget: 7
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
                if (habit.trackingMode === 'weekly' && habit.damagePerWeek) {
                  result = calculateWeeklyStreak(
                    completions,
                    habit.damagePerWeek,
                    undefined,
                    this.plugin.settings
                  );
                } else {
                  result = calculateLiveStreakWithDecay(
                    completions,
                    habit.damagePerCompletion,
                    undefined,
                    this.plugin.settings
                  );
                }

                // Count total completions for snapshot
                const completedCount = completions.filter(c => c.completed).length;
                const totalHP = completedCount; // Store completion count as "HP" for backward compat

                this.plugin.settings.activitySnapshots[habit.id] = {
                  activityId: habit.id,
                  disabledDate: getEffectiveTodayISO(this.plugin.settings),
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
        .setName("Damage per completion")
        .setDesc("Boss damage dealt per completion")
        .addText(t =>
          t
            .setValue(String(habit.damagePerCompletion))
            .onChange(async v => {
              habit.damagePerCompletion = Number(v) || 1;
              await this.plugin.saveSettings();
              this.plugin.refreshRankView();
            })
        );

      new Setting(box)
        .setName("Weekly target")
        .setDesc("Completions needed per week to avoid Tartarus")
        .addText(t =>
          t
            .setValue(String(habit.weeklyTarget || 7))
            .onChange(async v => {
              habit.weeklyTarget = Number(v) || 7;
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
          .setName("Damage per week")
          .setDesc("Damage for weekly completion")
          .addText(t =>
            t
              .setValue(String(habit.damagePerWeek || 7))
              .onChange(async v => {
                habit.damagePerWeek = Number(v) || 7;
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

    // ==========================================
    // REWARD POOLS CONFIGURATION
    // ==========================================
    this.renderRewardPoolsSection(containerEl);
  }

  /**
   * Render the reward pools configuration section.
   */
  renderRewardPoolsSection(containerEl: HTMLElement) {
    new Setting(containerEl)
      .setName("Reward Pools")
      .setDesc("Configure rewards for each tier level (3-7 options per pool)")
      .setHeading();

    const tierDisplayNames: Record<RewardTier, string> = {
      micro: 'Micro (Tiers 1-4)',
      mini: 'Mini (Tiers 5-10)',
      standard: 'Standard (Tiers 11-16)',
      quality: 'Quality (Tiers 17-22)',
      premium: 'Premium (Tiers 23-26)'
    };

    const tiers: RewardTier[] = ['micro', 'mini', 'standard', 'quality', 'premium'];

    tiers.forEach(tier => {
      const pool = this.plugin.settings.rewardPools?.find(p => p.tier === tier) || { tier, options: [] };

      const poolContainer = containerEl.createDiv({
        cls: "track-habit-rank-dev-section",
        attr: {
          style: `
            margin-top: 12px;
            border: 1px solid var(--background-modifier-border);
            border-radius: 8px;
            overflow: hidden;
          `
        }
      });

      // Collapsible header
      let isExpanded = false;
      const header = poolContainer.createDiv({
        attr: {
          style: `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            background: var(--background-secondary);
            cursor: pointer;
            user-select: none;
          `
        }
      });

      header.createEl("span", {
        text: `${tierDisplayNames[tier]} (${pool.options.length} rewards)`,
        attr: { style: "font-weight: 600;" }
      });

      const expandIcon = header.createEl("span", {
        text: "▼",
        attr: { style: "transition: transform 0.2s ease;" }
      });

      const content = poolContainer.createDiv({
        attr: { style: "display: none; padding: 16px;" }
      });

      header.addEventListener("click", () => {
        isExpanded = !isExpanded;
        content.style.display = isExpanded ? "block" : "none";
        expandIcon.style.transform = isExpanded ? "rotate(180deg)" : "rotate(0deg)";
      });

      // Display current rewards with edit fields
      pool.options.forEach((option, optionIndex) => {
        const optionBox = content.createDiv({
          attr: {
            style: `
              margin-bottom: 8px;
              padding: 8px;
              background: var(--background-primary);
              border-radius: 6px;
              border: 1px solid var(--background-modifier-border);
            `
          }
        });

        new Setting(optionBox)
          .setName(`Reward ${optionIndex + 1}`)
          .addText(t =>
            t
              .setPlaceholder("Reward description")
              .setValue(option.description)
              .onChange(async v => {
                this.updateRewardOption(tier, optionIndex, v);
                await this.plugin.saveSettings();
              })
          )
          .addButton(btn =>
            btn
              .setButtonText("×")
              .setWarning()
              .onClick(async () => {
                this.removeRewardOption(tier, optionIndex);
                await this.plugin.saveSettings();
                this.display();
              })
          );
      });

      // Add reward button (max 7)
      if (pool.options.length < 7) {
        new Setting(content)
          .addButton(btn =>
            btn
              .setButtonText("+ Add Reward")
              .setCta()
              .onClick(async () => {
                this.addRewardOption(tier);
                await this.plugin.saveSettings();
                this.display();
              })
          );
      }
    });

    // Reset all reward pools
    new Setting(containerEl)
      .setName("Reset all reward pools")
      .setDesc("Restore reward pools to default placeholders")
      .addButton(btn =>
        btn
          .setButtonText("Reset All Pools")
          .setWarning()
          .onClick(async () => {
            this.plugin.settings.rewardPools = DEFAULT_SETTINGS.rewardPools;
            await this.plugin.saveSettings();
            this.display();
            new Notice("Reward pools reset to defaults");
          })
      );
  }

  /**
   * Update a reward option description.
   */
  updateRewardOption(tier: RewardTier, index: number, description: string) {
    let pool = this.plugin.settings.rewardPools?.find(p => p.tier === tier);
    if (!pool) {
      pool = { tier, options: [] };
      this.plugin.settings.rewardPools = this.plugin.settings.rewardPools || [];
      this.plugin.settings.rewardPools.push(pool);
    }
    if (pool.options[index]) {
      pool.options[index].description = description;
    }
  }

  /**
   * Add a new reward option to a pool.
   */
  addRewardOption(tier: RewardTier) {
    let pool = this.plugin.settings.rewardPools?.find(p => p.tier === tier);
    if (!pool) {
      pool = { tier, options: [] };
      this.plugin.settings.rewardPools = this.plugin.settings.rewardPools || [];
      this.plugin.settings.rewardPools.push(pool);
    }
    const newId = `${tier}-${Date.now()}`;
    pool.options.push({ id: newId, description: '[New reward]' });
  }

  /**
   * Remove a reward option from a pool.
   */
  removeRewardOption(tier: RewardTier, index: number) {
    const pool = this.plugin.settings.rewardPools?.find(p => p.tier === tier);
    if (pool && pool.options[index]) {
      pool.options.splice(index, 1);
    }
  }

  calculateWeeklyTarget(): number {
    const allActivities = [
      ...getEffectiveActivities(this.plugin.settings).filter(a => this.plugin.settings.enabledActivities[a._originalName!] ?? true),
      ...this.plugin.settings.customHabits.filter(h => h.enabled)
    ];

    return allActivities.reduce((sum, a) => {
      return sum + (a.weeklyTarget || 7);
    }, 0);
  }

  /**
   * Get both total and lowest weekly target for dynamic HP calculation.
   */
  getWeeklyTargetStats(): { total: number; lowest: number } {
    const allActivities = [
      ...getEffectiveActivities(this.plugin.settings).filter(a => this.plugin.settings.enabledActivities[a._originalName!] ?? true),
      ...this.plugin.settings.customHabits.filter(h => h.enabled)
    ];

    if (allActivities.length === 0) {
      return { total: 7, lowest: 1 };
    }

    const targets = allActivities.map(a => a.weeklyTarget || 7);
    return {
      total: targets.reduce((sum, t) => sum + t, 0),
      lowest: Math.min(...targets)
    };
  }

  /**
   * Creates a mobile-friendly stat card for the Quick Stats section.
   */
  createStatCard(parent: HTMLElement, label: string, value: string, color: string) {
    const card = parent.createDiv({
      attr: {
        style: `
          padding: 12px;
          border-radius: 8px;
          background: ${color}15;
          border: 1px solid ${color}40;
          text-align: center;
        `
      }
    });

    card.createEl("div", {
      text: label,
      attr: {
        style: `
          font-size: 0.75em;
          opacity: 0.8;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        `
      }
    });

    card.createEl("div", {
      text: value,
      attr: {
        style: `
          font-size: 1.1em;
          font-weight: 700;
          color: ${color};
          font-family: monospace;
        `
      }
    });
  }

  /**
   * Updates or creates a boss override in customBosses array.
   * If all fields are undefined/empty, removes the override entirely.
   */
  updateBossOverride(bossIndex: number, field: keyof CustomBossOverride, value: unknown) {
    if (!this.plugin.settings.customBosses) {
      this.plugin.settings.customBosses = [];
    }

    let override = this.plugin.settings.customBosses.find(c => c.tier === bossIndex);

    if (!override) {
      // Create new override
      override = { tier: bossIndex };
      this.plugin.settings.customBosses.push(override);
    }

    // Update the specific field (type-safe)
    if (field === "tier") return; // Don't allow changing tier
    if (field === "name") override.name = value as string | undefined;
    else if (field === "ranks") override.ranks = value as [string, string] | undefined;
    else if (field === "description") override.description = value as string | undefined;
    else if (field === "lore") override.lore = value as string | undefined;
    else if (field === "image") override.image = value as string | undefined;

    // Clean up: if all custom fields are empty/undefined, remove the override
    const hasCustomizations =
      override.name ||
      override.ranks ||
      override.description ||
      override.lore ||
      override.image;

    if (!hasCustomizations) {
      this.plugin.settings.customBosses = this.plugin.settings.customBosses.filter(
        c => c.tier !== bossIndex
      );
    }
  }

  /**
   * Helper method to update activity overrides.
   * Creates override if none exists, cleans up if all fields are empty.
   */
  updateActivityOverride(originalName: string, field: keyof ActivityOverride, value: unknown) {
    if (!this.plugin.settings.activityOverrides) {
      this.plugin.settings.activityOverrides = [];
    }

    let override = this.plugin.settings.activityOverrides.find(o => o.originalName === originalName);

    if (!override) {
      // Create new override
      override = { originalName };
      this.plugin.settings.activityOverrides.push(override);
    }

    // Update the specific field (type-safe)
    if (field === "originalName") return; // Don't allow changing originalName
    if (field === "name") override.name = value as string | undefined;
    else if (field === "folder") override.folder = value as string | undefined;
    else if (field === "field") override.field = value as string | undefined;
    else if (field === "damagePerCompletion") override.damagePerCompletion = value as number | undefined;
    else if (field === "weeklyTarget") override.weeklyTarget = value as number | undefined;
    else if (field === "trackingMode") override.trackingMode = value as 'daily' | 'weekly' | undefined;
    else if (field === "damagePerWeek") override.damagePerWeek = value as number | undefined;

    // Clean up: if all custom fields are empty/undefined, remove the override
    const hasCustomizations =
      override.name ||
      override.folder ||
      override.field ||
      override.damagePerCompletion !== undefined ||
      override.weeklyTarget !== undefined ||
      override.trackingMode ||
      override.damagePerWeek !== undefined;

    if (!hasCustomizations) {
      this.plugin.settings.activityOverrides = this.plugin.settings.activityOverrides.filter(
        o => o.originalName !== originalName
      );
    }
  }

  /**
   * Updates a Tartarus task description at a specific index for a tier range.
   * Creates custom entry if none exists.
   */
  updateTartarusTask(tierRange: TartarusTierRange, taskIndex: number, description: string) {
    if (!this.plugin.settings.customTartarusTasks) {
      this.plugin.settings.customTartarusTasks = [];
    }

    let customEntry = this.plugin.settings.customTartarusTasks.find(t => t.tierRange === tierRange);

    if (!customEntry) {
      // Create new custom entry based on defaults
      customEntry = {
        tierRange,
        tasks: DEFAULT_TARTARUS_TASKS[tierRange].map(t => ({ id: t.id, description: t.description }))
      };
      this.plugin.settings.customTartarusTasks.push(customEntry);
    }

    // Update the task description
    if (taskIndex < customEntry.tasks.length) {
      customEntry.tasks[taskIndex].description = description;
      customEntry.tasks[taskIndex].id = `custom-${taskIndex}-${Date.now()}`;
    }
  }

  /**
   * Adds a new Tartarus task to a tier range.
   */
  addTartarusTask(tierRange: TartarusTierRange) {
    if (!this.plugin.settings.customTartarusTasks) {
      this.plugin.settings.customTartarusTasks = [];
    }

    let customEntry = this.plugin.settings.customTartarusTasks.find(t => t.tierRange === tierRange);

    if (!customEntry) {
      // Create new custom entry based on defaults
      customEntry = {
        tierRange,
        tasks: DEFAULT_TARTARUS_TASKS[tierRange].map(t => ({ id: t.id, description: t.description }))
      };
      this.plugin.settings.customTartarusTasks.push(customEntry);
    }

    // Add new task
    customEntry.tasks.push({
      id: `custom-${Date.now()}`,
      description: "New penance task"
    });
  }

  /**
   * Removes a Tartarus task from a tier range.
   */
  removeTartarusTask(tierRange: TartarusTierRange, taskIndex: number) {
    if (!this.plugin.settings.customTartarusTasks) return;

    let customEntry = this.plugin.settings.customTartarusTasks.find(t => t.tierRange === tierRange);

    if (!customEntry) {
      // Create entry from defaults first (so we can remove from it)
      customEntry = {
        tierRange,
        tasks: DEFAULT_TARTARUS_TASKS[tierRange].map(t => ({ id: t.id, description: t.description }))
      };
      this.plugin.settings.customTartarusTasks.push(customEntry);
    }

    // Remove the task
    if (taskIndex < customEntry.tasks.length) {
      customEntry.tasks.splice(taskIndex, 1);
    }

    // If no tasks left, remove the custom entry entirely
    if (customEntry.tasks.length === 0) {
      this.plugin.settings.customTartarusTasks = this.plugin.settings.customTartarusTasks.filter(
        t => t.tierRange !== tierRange
      );
    }
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

    // Register Developer Dashboard view
    this.registerView(
      VIEW_TYPE_DEV_DASHBOARD,
      (leaf) => new DeveloperDashboardView(leaf, this)
    );

    const refresh = debounce(async () => {
      debugLog.log('META', 'Metadata cache changed - running checks');
      await this.processNewCompletions(); // Direct damage system: activity → boss damage
      await this.checkBossDefeated();
      await this.checkDeathThreshold();
      await this.checkPerfectWeek();
      await this.checkRewardExpiration(); // Check for expired rewards
      await this.saveSettings();
      this.refreshRankView();
    }, 300);

    this.registerEvent(
      this.app.metadataCache.on("changed", refresh)
    );

    // Also listen for file creation - wait for metadata to be indexed before processing
    this.registerEvent(
      this.app.vault.on("create", async (file) => {
        // Only refresh for markdown files
        if (file instanceof TFile && file.extension === "md") {
          debugLog.log('META', 'New file created - waiting for metadata', { path: file.path });

          // Wait for metadata to be available (poll up to 2 seconds)
          let attempts = 0;
          const maxAttempts = 20;
          while (attempts < maxAttempts) {
            const cache = this.app.metadataCache.getFileCache(file);
            if (cache?.frontmatter) {
              debugLog.log('META', 'Metadata ready for new file', {
                path: file.path,
                attempts,
                frontmatterKeys: Object.keys(cache.frontmatter)
              });
              refresh();
              return;
            }
            await sleep(100);
            attempts++;
          }

          // Fallback: run refresh anyway after timeout (metadata might still become available via metadataCache.on("changed"))
          debugLog.log('META', 'Metadata not available after timeout, running refresh anyway', { path: file.path });
          refresh();
        }
      })
    );

    // Listen for file renames too
    this.registerEvent(
      this.app.vault.on("rename", (file, oldPath) => {
        if (file instanceof TFile && file.extension === "md") {
          debugLog.log('META', 'File renamed - running refresh', { oldPath, newPath: file.path });
          refresh();
        }
      })
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
        await this.dealDamage(5);
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

    this.addCommand({
      id: "open-reward-log",
      name: "Open Reward Log",
      callback: () => {
        new RewardLogModal(this.app, this).open();
      }
    });

    this.addCommand({
      id: "toggle-system-pause",
      name: "Toggle System Pause",
      callback: async () => {
        await this.toggleSystemState();
      }
    });

    this.addCommand({
      id: "open-dev-dashboard",
      name: "[DEV] Open Developer Dashboard",
      callback: () => this.activateDevDashboard()
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
      const stats = this.getWeeklyTargetStats();
      this.settings.bossMaxHP = calculateBossHP(stats.total, this.settings.currentTier, this.settings, stats.lowest);
      this.settings.bossCurrentHP = this.settings.bossMaxHP;
    }

    // Migrate custom habits from old field names to new damage-based names
    if (this.settings.customHabits) {
      this.settings.customHabits.forEach((habit: any) => {
        // hpPerDay → damagePerCompletion
        if (habit.hpPerDay !== undefined && habit.damagePerCompletion === undefined) {
          habit.damagePerCompletion = habit.hpPerDay;
          delete habit.hpPerDay;
        }
        // hpPerWeek → damagePerWeek
        if (habit.hpPerWeek !== undefined && habit.damagePerWeek === undefined) {
          habit.damagePerWeek = habit.hpPerWeek;
          delete habit.hpPerWeek;
        }
        // Remove penaltyPerDay (no longer used)
        if (habit.penaltyPerDay !== undefined) {
          delete habit.penaltyPerDay;
        }
        // Ensure damagePerCompletion has a default
        if (habit.damagePerCompletion === undefined) {
          habit.damagePerCompletion = 1;
        }
        // Ensure weeklyTarget has a default
        if (habit.weeklyTarget === undefined) {
          habit.weeklyTarget = 7;
        }
      });
    }

    // Migrate activity overrides from old field names
    if (this.settings.activityOverrides) {
      this.settings.activityOverrides.forEach((override: any) => {
        // hpPerDay → damagePerCompletion
        if (override.hpPerDay !== undefined) {
          override.damagePerCompletion = override.hpPerDay;
          delete override.hpPerDay;
        }
        // hpPerWeek → damagePerWeek
        if (override.hpPerWeek !== undefined) {
          override.damagePerWeek = override.hpPerWeek;
          delete override.hpPerWeek;
        }
        // Remove penaltyPerDay (no longer used)
        if (override.penaltyPerDay !== undefined) {
          delete override.penaltyPerDay;
        }
      });
    }

    // Remove deprecated lastProcessedTotalHP (replaced by lastCompletionCounts)
    if (data.lastProcessedTotalHP !== undefined) {
      delete data.lastProcessedTotalHP;
    }

    // Initialize lastCompletionCounts if not set (for existing users)
    // This prevents dealing all historical damage at once on first load
    if (!this.settings.lastCompletionCounts || Object.keys(this.settings.lastCompletionCounts).length === 0) {
      this.settings.lastCompletionCounts = {};

      // Get all enabled activities and count their current completions
      const allActivities = [
        ...getEffectiveActivities(this.settings)
          .filter(a => this.settings.enabledActivities[a._originalName!] ?? true),
        ...this.settings.customHabits.filter(h => h.enabled)
      ];

      for (const activity of allActivities) {
        const activityKey = '_originalName' in activity ? activity._originalName! : ('id' in activity ? activity.id : activity.name);
        const completions = getCompletionsFromFolder(this.app, activity.folder, activity.field);
        const count = completions.filter(c => c.completed).length;
        this.settings.lastCompletionCounts[activityKey] = count;
      }

      debugLog.log('DMG', 'Initialized lastCompletionCounts for existing user', {
        counts: this.settings.lastCompletionCounts,
        bossHP: `${this.settings.bossCurrentHP}/${this.settings.bossMaxHP}`
      });
    }

    await this.saveSettings();
  }

  calculateWeeklyTarget(): number {
    const allActivities = [
      ...getEffectiveActivities(this.settings).filter(a => this.settings.enabledActivities[a._originalName!] ?? true),
      ...this.settings.customHabits.filter(h => h.enabled)
    ];

    return allActivities.reduce((sum, a) => {
      return sum + (a.weeklyTarget || 7);
    }, 0);
  }

  /**
   * Get both total and lowest weekly target for dynamic HP calculation.
   */
  getWeeklyTargetStats(): { total: number; lowest: number } {
    const allActivities = [
      ...getEffectiveActivities(this.settings).filter(a => this.settings.enabledActivities[a._originalName!] ?? true),
      ...this.settings.customHabits.filter(h => h.enabled)
    ];

    if (allActivities.length === 0) {
      return { total: 7, lowest: 1 };
    }

    const targets = allActivities.map(a => a.weeklyTarget || 7);
    return {
      total: targets.reduce((sum, t) => sum + t, 0),
      lowest: Math.min(...targets)
    };
  }

  /**
   * Toggles the system between paused and active states.
   *
   * When PAUSING:
   * - Records the current time as pauseStartTime
   * - All time-dependent calculations freeze at this moment
   *
   * When RESUMING:
   * - Calculates how long the system was paused
   * - Adds that duration to totalPausedTime
   * - Clears pauseStartTime
   * - Time-dependent calculations will skip the paused duration
   *
   * @returns The new system state after toggle
   */
  async toggleSystemState(): Promise<'active' | 'paused'> {
    if (this.settings.systemState === 'active') {
      // PAUSE the system
      this.settings.systemState = 'paused';
      this.settings.pauseStartTime = new Date().toISOString();
      debugLog.log('PAUSE', 'System PAUSED', { pauseStartTime: this.settings.pauseStartTime });
      new Notice("System PAUSED - All time-dependent mechanics frozen");
    } else {
      // RESUME the system
      let pauseDuration = 0;
      if (this.settings.pauseStartTime) {
        const pauseStart = new Date(this.settings.pauseStartTime).getTime();
        pauseDuration = Date.now() - pauseStart;
        this.settings.totalPausedTime += pauseDuration;
      }
      this.settings.systemState = 'active';
      this.settings.pauseStartTime = null;
      debugLog.log('PAUSE', 'System RESUMED', {
        pauseDuration: Math.round(pauseDuration / 1000) + 's',
        totalPausedTime: Math.round(this.settings.totalPausedTime / 1000) + 's'
      });
      new Notice("System RESUMED - Time-dependent mechanics active");
    }

    await this.saveSettings();
    this.refreshRankView();
    return this.settings.systemState;
  }

  /**
   * Gets the formatted pause duration for display.
   *
   * @returns Human-readable pause duration string
   */
  getPauseDurationDisplay(): string {
    if (this.settings.systemState !== 'paused' || !this.settings.pauseStartTime) {
      return "Not paused";
    }

    const pauseStart = new Date(this.settings.pauseStartTime).getTime();
    const duration = Date.now() - pauseStart;

    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Gets the total accumulated pause time for display.
   *
   * @returns Human-readable total paused time string
   */
  getTotalPausedDisplay(): string {
    let total = this.settings.totalPausedTime;

    // Add current pause duration if paused
    if (this.settings.systemState === 'paused' && this.settings.pauseStartTime) {
      const pauseStart = new Date(this.settings.pauseStartTime).getTime();
      total += Date.now() - pauseStart;
    }

    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Process new activity completions and deal damage to boss.
   * Simple logic: detect completion → deal damage.
   * In Tartarus: track completions but don't deal damage.
   */
  async processNewCompletions() {
    // Don't process if paused
    if (this.settings.systemState === 'paused') {
      return;
    }

    // Initialize lastCompletionCounts if needed
    if (!this.settings.lastCompletionCounts) {
      this.settings.lastCompletionCounts = {};
    }

    // Get all enabled activities
    const allActivities = [
      ...getEffectiveActivities(this.settings)
        .filter(a => this.settings.enabledActivities[a._originalName!] ?? true),
      ...this.settings.customHabits.filter(h => h.enabled)
    ];

    let totalNewDamage = 0;
    let totalNewCompletions = 0;
    let totalNewDiscipline = 0;

    for (const activity of allActivities) {
      const activityKey = '_originalName' in activity ? activity._originalName! : ('id' in activity ? activity.id : activity.name);
      const disciplineKey = `${activityKey}_discipline`;

      // Get current completions
      const completions = getCompletionsFromFolder(
        this.app,
        activity.folder,
        activity.field
      );

      // Get discipline completions for this activity
      const currentDisciplineCount = countDisciplineCompletions(
        this.app,
        activity.folder,
        activity.field
      );

      const currentCount = completions.filter(c => c.completed).length;
      const lastCount = this.settings.lastCompletionCounts[activityKey] || 0;
      const lastDisciplineCount = this.settings.lastCompletionCounts[disciplineKey] || 0;
      const newCompletions = currentCount - lastCount;
      const newDiscipline = Math.max(0, currentDisciplineCount - lastDisciplineCount);

      if (newCompletions > 0) {
        // Always update tracking (even in Tartarus)
        this.settings.lastCompletionCounts[activityKey] = currentCount;
        this.settings.lastCompletionCounts[disciplineKey] = currentDisciplineCount;

        // Track discipline for tokens (works in and out of Tartarus)
        if (newDiscipline > 0) {
          this.settings.disciplineCompletionCount += newDiscipline;
          totalNewDiscipline += newDiscipline;

          // Award tokens for every 5 discipline completions (max 3 tokens)
          while (this.settings.disciplineCompletionCount >= 5 && this.settings.disciplineTokens < 3) {
            this.settings.disciplineCompletionCount -= 5;
            this.settings.disciplineTokens += 1;
            new Notice('🎖️ Earned 1 Discipline Token! (5 discipline completions)');
          }
        }

        // Only accumulate damage if NOT in Tartarus
        if (!this.settings.inTartarus) {
          // Discipline completions do 2x damage
          const regularCompletions = newCompletions - newDiscipline;
          const regularDamage = regularCompletions * activity.damagePerCompletion;
          const disciplineDamage = newDiscipline * activity.damagePerCompletion * 2;

          totalNewDamage += regularDamage + disciplineDamage;
          totalNewCompletions += newCompletions;
        }
      } else if (newCompletions < 0) {
        // Count decreased (file deleted?) - just update tracking
        this.settings.lastCompletionCounts[activityKey] = currentCount;
        this.settings.lastCompletionCounts[disciplineKey] = currentDisciplineCount;
      } else if (currentDisciplineCount !== lastDisciplineCount) {
        // No new completions but discipline type changed on existing completion
        this.settings.lastCompletionCounts[disciplineKey] = currentDisciplineCount;
      }
    }

    // Deal accumulated damage (only if not in Tartarus)
    if (totalNewDamage > 0 && !this.settings.inTartarus) {
      // Apply streak bonus multiplier
      const streakMultiplier = getStreakBonusMultiplier(this.settings.consecutivePerfectWeeks);
      const finalDamage = Math.round(totalNewDamage * streakMultiplier);

      this.settings.bossCurrentHP = Math.max(0, this.settings.bossCurrentHP - finalDamage);

      // Show notification
      const bossName = getCustomizedBossForTier(this.settings.currentTier, this.settings)?.name || 'Boss';
      let message = `💥 ${finalDamage} damage dealt to ${bossName}! (${totalNewCompletions} completion${totalNewCompletions > 1 ? 's' : ''})`;
      if (totalNewDiscipline > 0) {
        message += ` [discipline 2x]`;
      }
      if (streakMultiplier > 1) {
        const bonusPercent = Math.round((streakMultiplier - 1) * 100);
        message += ` [${this.settings.consecutivePerfectWeeks}wk streak +${bonusPercent}%]`;
      }
      new Notice(message);

      // Track activity rewards (only when dealing damage, not in Tartarus)
      await this.trackActivityReward(totalNewCompletions);
    }
  }

  async dealDamage(damage: number) {
    // No damage while in Tartarus
    if (this.settings.inTartarus) {
      return;
    }

    // Apply streak bonus multiplier
    const streakMultiplier = getStreakBonusMultiplier(this.settings.consecutivePerfectWeeks);
    const finalDamage = Math.round(damage * streakMultiplier);

    this.settings.bossCurrentHP = Math.max(0, this.settings.bossCurrentHP - finalDamage);
    await this.saveSettings();
    await this.checkBossDefeated();
    this.refreshRankView();
  }

  async checkBossDefeated() {
    const currentTier = this.settings.currentTier;
    const currentHP = this.settings.bossCurrentHP;
    const maxHP = this.settings.bossMaxHP;

    // Check 1: HP below 50% - advance tier within same boss (first tier only)
    // First tier of a boss = odd tier (1, 3, 5, 7, etc.)
    const isFirstTierOfBoss = currentTier % 2 === 1;
    const hpBelow50Percent = currentHP > 0 && currentHP <= maxHP * 0.5;

    if (isFirstTierOfBoss && hpBelow50Percent && !this.settings.tierAdvancedAt50Percent && currentTier < 26) {
      // Advance tier within the same boss (rank up)
      this.settings.currentTier = currentTier + 1;
      this.settings.tierAdvancedAt50Percent = true;

      const newRank = getRankNameForTier(this.settings.currentTier, this.settings);
      const boss = getCustomizedBossForTier(this.settings.currentTier, this.settings);

      await this.saveSettings();
      new Notice(`⚔️ Rank Up! You are now ${newRank}! Keep fighting ${boss?.name}!`);
      return;
    }

    // Check 2: HP is 0 - boss defeated, advance to next boss
    if (currentHP <= 0 && currentTier < 26) {
      const oldTier = this.settings.currentTier;

      // Advance to next tier (next boss)
      this.settings.currentTier = oldTier + 1;

      // Reset 50% tracker for the new boss
      this.settings.tierAdvancedAt50Percent = false;

      // Calculate new boss HP
      const stats = this.getWeeklyTargetStats();
      this.settings.bossMaxHP = calculateBossHP(stats.total, this.settings.currentTier, this.settings, stats.lowest);
      this.settings.bossCurrentHP = this.settings.bossMaxHP;

      const newRank = getRankNameForTier(this.settings.currentTier, this.settings);
      const newBoss = getCustomizedBossForTier(this.settings.currentTier, this.settings);

      // Award boss reward
      await this.awardBossReward(oldTier);

      await this.saveSettings();
      new Notice(`🎉 Boss Defeated! You are now ${newRank}! Face ${newBoss?.name}!`);
    }
  }

  async checkDeathThreshold() {
    // Check Hades Wrath if in Tartarus
    if (this.settings.inTartarus) {
      await this.checkHadesWrath();
      debugLog.log('THRESH', 'Death threshold check skipped (in Tartarus), checked Hades Wrath instead');
      return;
    }

    const belowThreshold = checkDeathThreshold(this.app, this.settings);
    debugLog.log('THRESH', 'Death threshold check', {
      belowThreshold,
      failedDays: this.settings.failedThresholdDays
    });

    if (belowThreshold) {
      this.settings.failedThresholdDays++;
      debugLog.log('THRESH', 'Failed day incremented (warning only)', { failedDays: this.settings.failedThresholdDays });
      // Note: No longer automatically entering Tartarus after 3 failed days
      // Tartarus entry is now manual (dev tools) or triggered by other game events
    } else {
      this.settings.failedThresholdDays = 0;
    }
  }

  /**
   * Hades Wrath System: If in Tartarus and tasks not completed within 3 days,
   * double the penance tasks (one-time penalty).
   */
  async checkHadesWrath() {
    if (!this.settings.inTartarus || this.settings.hadesWrathApplied) {
      return; // Not in Tartarus or wrath already applied
    }

    // If paused, don't check Hades Wrath
    if (this.settings.systemState === 'paused') {
      return;
    }

    const effectiveNow = getEffectiveNow(this.settings);
    const daysInTartarus = this.settings.tartarusStartDate
      ? Math.floor((effectiveNow.getTime() - new Date(this.settings.tartarusStartDate).getTime()) / (24 * 60 * 60 * 1000))
      : 0;

    // Check if any tasks are completed
    const completedCount = this.settings.tartarusPenanceTasks.filter(t => t.completed).length;
    const requiredTasks = this.settings.currentTier <= 4 ? 3 : this.settings.currentTier <= 12 ? 4 : 5;

    // If 3+ days in Tartarus and NOT all tasks completed → HADES WRATH
    if (daysInTartarus >= 3 && completedCount < requiredTasks) {
      debugLog.log('THRESH', 'HADES WRATH TRIGGERED - Tasks doubled!', { daysInTartarus, completedCount, requiredTasks });

      // Double the incomplete tasks by adding duplicates
      const incompleteTasks = this.settings.tartarusPenanceTasks.filter(t => !t.completed);
      const duplicateTasks = incompleteTasks.map(t => ({
        id: `${t.id}-wrath-${Date.now()}`,
        description: `${t.description} (Hades Wrath)`,
        completed: false
      }));

      this.settings.tartarusPenanceTasks = [
        ...this.settings.tartarusPenanceTasks,
        ...duplicateTasks
      ];

      this.settings.hadesWrathApplied = true;
      await this.saveSettings();
      this.refreshRankView();

      new Notice("⚡ HADES WRATH! Your incomplete tasks have been doubled!");
    }
  }

  async checkPerfectWeek() {
    if (this.settings.inTartarus) return;

    const isPerfectWeek = checkPerfectWeek(this.app, this.settings);

    if (isPerfectWeek) {
      this.settings.consecutivePerfectWeeks++;
      debugLog.log('CALC', 'Perfect week achieved!', { streak: this.settings.consecutivePerfectWeeks });

      // Award discipline token for perfect week (max 3)
      if (this.settings.disciplineTokens < 3) {
        this.settings.disciplineTokens++;
        debugLog.log('DMG', 'Discipline token earned', { tokens: this.settings.disciplineTokens });
        new Notice(`Perfect Week! Discipline token earned (${this.settings.disciplineTokens}/3)`);
      } else {
        new Notice(`🔥 Perfect Week! Streak: ${this.settings.consecutivePerfectWeeks}`);
      }

      // Track streak rewards
      await this.trackStreakReward();

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

  /**
   * Opens the Developer Dashboard view in a new leaf.
   * Provides 100% transparency into internal state and calculations.
   */
  async activateDevDashboard() {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(VIEW_TYPE_DEV_DASHBOARD)[0];

    if (!leaf) {
      const newLeaf = workspace.getLeaf('tab');
      if (!newLeaf) return;
      await newLeaf.setViewState({ type: VIEW_TYPE_DEV_DASHBOARD, active: true });
      leaf = newLeaf;
    }

    await workspace.revealLeaf(leaf);
  }

  /**
   * Refreshes the Developer Dashboard view if open.
   */
  refreshDevDashboard() {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_DEV_DASHBOARD);
    leaves.forEach(leaf => {
      const view = leaf.view as DeveloperDashboardView;
      view.render();
    });
  }

  /* ======================
     REWARD SYSTEM METHODS
  ====================== */

  /**
   * Track activity completions for activity rewards.
   * Awards a reward when the threshold is reached based on current tier.
   */
  async trackActivityReward(newCompletions: number) {
    // Initialize reward arrays if needed
    if (!this.settings.pendingRewards) this.settings.pendingRewards = [];
    if (!this.settings.claimedRewards) this.settings.claimedRewards = [];
    if (!this.settings.bankedRewards) this.settings.bankedRewards = [];

    const rewardTier = getRewardTierForPlayerTier(this.settings.currentTier);
    const thresholds = REWARD_THRESHOLDS[rewardTier];

    // Increment counter
    this.settings.activityRewardCounter += newCompletions;

    // Check if we've reached the threshold
    while (this.settings.activityRewardCounter >= thresholds.activityInterval) {
      this.settings.activityRewardCounter -= thresholds.activityInterval;

      // Create pending reward
      const pendingReward = this.createPendingReward(rewardTier, 'activity');
      this.settings.pendingRewards.push(pendingReward);

      debugLog.log('DMG', 'Activity reward earned!', { rewardTier, type: 'activity' });

      // Show modal for reward selection
      new RewardSelectionModal(this.app, this, pendingReward, () => {
        this.refreshRankView();
      }).open();
    }
  }

  /**
   * Award a boss reward when a boss is defeated.
   * Always triggers regardless of tier.
   */
  async awardBossReward(defeatedAtTier: number) {
    // Initialize reward arrays if needed
    if (!this.settings.pendingRewards) this.settings.pendingRewards = [];

    const rewardTier = getRewardTierForPlayerTier(defeatedAtTier);

    // Create pending reward
    const pendingReward = this.createPendingReward(rewardTier, 'boss');
    this.settings.pendingRewards.push(pendingReward);

    debugLog.log('DMG', 'Boss reward earned!', { rewardTier, type: 'boss', defeatedAtTier });

    // Show modal for reward selection (after a short delay to let boss defeat message show)
    setTimeout(() => {
      new RewardSelectionModal(this.app, this, pendingReward, () => {
        this.refreshRankView();
      }).open();
    }, 1500);
  }

  /**
   * Track perfect weeks for streak rewards.
   * Awards a reward when the threshold is reached based on current tier.
   */
  async trackStreakReward() {
    // Initialize reward arrays if needed
    if (!this.settings.pendingRewards) this.settings.pendingRewards = [];

    const rewardTier = getRewardTierForPlayerTier(this.settings.currentTier);
    const thresholds = REWARD_THRESHOLDS[rewardTier];

    // Increment counter
    this.settings.streakRewardCounter++;

    // Check if we've reached the threshold
    if (this.settings.streakRewardCounter >= thresholds.streakInterval) {
      this.settings.streakRewardCounter = 0;

      // Create pending reward
      const pendingReward = this.createPendingReward(rewardTier, 'streak');
      this.settings.pendingRewards.push(pendingReward);

      debugLog.log('DMG', 'Streak reward earned!', { rewardTier, type: 'streak', weeks: this.settings.consecutivePerfectWeeks });

      // Show modal for reward selection
      new RewardSelectionModal(this.app, this, pendingReward, () => {
        this.refreshRankView();
      }).open();
    }
  }

  /**
   * Create a new pending reward with 7-day expiration.
   */
  createPendingReward(tier: RewardTier, type: RewardType): PendingReward {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    return {
      id: `pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      rewardTier: tier,
      rewardType: type,
      earnedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    };
  }

  /**
   * Check for expired rewards and remove them.
   * Called periodically to clean up unclaimed rewards.
   */
  async checkRewardExpiration() {
    if (!this.settings.pendingRewards) return;

    const now = new Date(getEffectiveNow(this.settings));
    const expiredRewards: PendingReward[] = [];
    const validRewards: PendingReward[] = [];

    this.settings.pendingRewards.forEach(reward => {
      const expiresAt = new Date(reward.expiresAt);
      if (expiresAt < now) {
        expiredRewards.push(reward);
      } else {
        validRewards.push(reward);
      }
    });

    if (expiredRewards.length > 0) {
      this.settings.pendingRewards = validRewards;
      await this.saveSettings();

      expiredRewards.forEach(reward => {
        debugLog.log('DMG', 'Reward expired', { rewardTier: reward.rewardTier, type: reward.rewardType });
      });

      if (expiredRewards.length === 1) {
        new Notice(`A reward has expired unclaimed!`);
      } else {
        new Notice(`${expiredRewards.length} rewards have expired unclaimed!`);
      }
    }
  }

  /**
   * Get reward progress information for display on dashboard.
   */
  getRewardProgress(): {
    activityProgress: number;
    activityThreshold: number;
    streakProgress: number;
    streakThreshold: number;
    pendingCount: number;
    bankedCount: number;
    rewardTier: RewardTier;
  } {
    const rewardTier = getRewardTierForPlayerTier(this.settings.currentTier);
    const thresholds = REWARD_THRESHOLDS[rewardTier];

    return {
      activityProgress: this.settings.activityRewardCounter || 0,
      activityThreshold: thresholds.activityInterval,
      streakProgress: this.settings.streakRewardCounter || 0,
      streakThreshold: thresholds.streakInterval,
      pendingCount: this.settings.pendingRewards?.length || 0,
      bankedCount: this.settings.bankedRewards?.length || 0,
      rewardTier
    };
  }

  onunload() {
    // Cleanup if needed
  }
}