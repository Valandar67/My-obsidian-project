"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => TrackHabitRankPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var VIEW_TYPE_RANK = "Track-rank-view";
var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var DebugLogger = class _DebugLogger {
  constructor() {
    this.buffer = [];
    this.maxSize = 100;
    this.enabled = true;
  }
  static getInstance() {
    if (!_DebugLogger.instance) {
      _DebugLogger.instance = new _DebugLogger();
    }
    return _DebugLogger.instance;
  }
  /**
   * Logs a message to the ring buffer.
   */
  log(category, message, data) {
    if (!this.enabled) return;
    const entry = {
      timestamp: /* @__PURE__ */ new Date(),
      category,
      message,
      data
    };
    this.buffer.push(entry);
    if (this.buffer.length > this.maxSize) {
      this.buffer.shift();
    }
  }
  /**
   * Gets all log entries (oldest first).
   */
  getAll() {
    return [...this.buffer];
  }
  /**
   * Gets log entries filtered by category.
   */
  getByCategory(category) {
    return this.buffer.filter((e) => e.category === category);
  }
  /**
   * Gets the last N log entries (newest first).
   */
  getLast(count) {
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
  setEnabled(enabled) {
    this.enabled = enabled;
  }
  /**
   * Formats a log entry for display.
   */
  static formatEntry(entry) {
    const time = entry.timestamp.toISOString().slice(11, 19);
    const dataStr = entry.data ? ` | ${JSON.stringify(entry.data)}` : "";
    return `[${time}] [${entry.category}] ${entry.message}${dataStr}`;
  }
};
var debugLog = DebugLogger.getInstance();
var BOSSES = [
  {
    tier: 1,
    name: "Shadow of Apathy",
    rank: "Doomscroller",
    description: "The weight of inertia that keeps you scrolling instead of starting",
    lore: "Born from forgotten promises and unopened gym bags, the Shadow feeds on potential unrealized.",
    hpFormula: "weeklyTarget \xD7 1.1"
  },
  {
    tier: 2,
    name: "Siren's Call",
    rank: "Armchair General",
    description: "Distraction's sweet song that pulls focus from committed work",
    lore: "She sings of easier paths, of just one more video, of starting tomorrow instead.",
    hpFormula: "weeklyTarget \xD7 1.2"
  },
  {
    tier: 3,
    name: "Hydra of Habits",
    rank: "Apprentice",
    description: "The complexity of managing multiple routines simultaneously",
    lore: "Cut one head and two grow back. Each habit demands its own attention.",
    hpFormula: "weeklyTarget \xD7 1.3"
  },
  {
    tier: 4,
    name: "Minotaur's Maze",
    rank: "Citizen",
    description: "The confusion and routine that traps even dedicated practitioners",
    lore: "Lost in corridors of habit, the path forward is never clear.",
    hpFormula: "weeklyTarget \xD7 1.7"
  },
  {
    tier: 5,
    name: "Medusa's Gaze",
    rank: "Scholar",
    description: "The paralysis that comes from overthinking or fear of failure",
    lore: "One glance and you are frozen, unable to act, unable to move.",
    hpFormula: "weeklyTarget \xD7 1.9"
  },
  {
    tier: 6,
    name: "Nemean Lion",
    rank: "Samurai",
    description: "Seemingly invulnerable obstacles that require persistent effort",
    lore: "Its hide cannot be pierced by ordinary means. Only discipline cuts through.",
    hpFormula: "weeklyTarget \xD7 2.1"
  },
  {
    tier: 7,
    name: "Chimera",
    rank: "Templar",
    description: "Multi-headed beast requiring balanced attention across all domains",
    lore: "Lion, goat, and serpent - each head demands mastery of a different art.",
    hpFormula: "weeklyTarget \xD7 2.3"
  },
  {
    tier: 8,
    name: "Cerberus",
    rank: "Stoic",
    description: "Guardian of transformation testing if habits have become identity",
    lore: "Three heads, three tests. Past the gate lies transformation.",
    hpFormula: "weeklyTarget \xD7 2.5"
  },
  {
    tier: 9,
    name: "Scylla & Charybdis",
    rank: "Olympian",
    description: "The impossible choice between competing priorities",
    lore: "Between the rock and the whirlpool, both must somehow be honored.",
    hpFormula: "weeklyTarget \xD7 2.7"
  },
  {
    tier: 10,
    name: "The Furies",
    rank: "Sage",
    description: "Internal voices of guilt and shame attacking even the successful",
    lore: "They whisper your failures, remind you of every skip, every weakness.",
    hpFormula: "weeklyTarget \xD7 2.9"
  },
  {
    tier: 11,
    name: "Typhon",
    rank: "Titan",
    description: "The force of chaos threatening to undo all progress",
    lore: "Father of all monsters, he seeks to return you to the beginning.",
    hpFormula: "weeklyTarget \xD7 3.1"
  },
  {
    tier: 12,
    name: "Kronos",
    rank: "Archon",
    description: "Time itself as an enemy, testing sustained intensity",
    lore: "The Titan who devours his children. Can you maintain as weeks become months?",
    hpFormula: "weeklyTarget \xD7 3.3"
  },
  {
    tier: 13,
    name: "Chaos Primordial",
    rank: "Master of All",
    description: "The ultimate test of unshakeable discipline",
    lore: "Before creation, before order, only Chaos. To master it is to master yourself.",
    hpFormula: "weeklyTarget \xD7 3.6"
  }
];
var RANK_TIER_COLORS = {
  1: "#6B7280",
  2: "#EF4444",
  3: "#F59E0B",
  4: "#10B981",
  5: "#3B82F6",
  6: "#8B5CF6",
  7: "#EC4899",
  8: "#F97316",
  9: "#06B6D4",
  10: "#A855F7",
  11: "#DC2626",
  12: "#7C3AED",
  13: "#c9a227"   // Royal gold
};
function getBossForTier(tier) {
  return BOSSES.find((b) => b.tier === tier) || null;
}
function getCustomizedBossForTier(tier, settings) {
  const baseBoss = getBossForTier(tier);
  if (!baseBoss) return null;
  const override = settings.customBosses?.find((c) => c.tier === tier);
  if (!override) return baseBoss;
  return {
    ...baseBoss,
    name: override.name || baseBoss.name,
    rank: override.rank || baseBoss.rank,
    description: override.description || baseBoss.description,
    lore: override.lore || baseBoss.lore,
    image: override.image || baseBoss.image
  };
}
function getRankNameForTier(tier, settings) {
  const boss = settings ? getCustomizedBossForTier(tier, settings) : getBossForTier(tier);
  if (!boss) return "Unranked";
  return boss.rank;
}
function calculateBossHP(weeklyTarget, tier, settings, lowestWeeklyTarget) {
  const maxTier = settings?.maxTier ?? 13;
  if (settings?.useAutoDynamicHP && lowestWeeklyTarget !== void 0) {
    const tier1HP = lowestWeeklyTarget * 4;
    const maxTierHP = weeklyTarget * (settings.autoDynamicHPMaxMultiplier ?? 1.5);
    const progress2 = (tier - 1) / Math.max(1, maxTier - 1);
    const hp = tier1HP + (maxTierHP - tier1HP) * progress2;
    return Math.round(hp);
  }
  const minMult = settings?.bossHPMultiplierMin ?? 1.1;
  const maxMult = settings?.bossHPMultiplierMax ?? 2.4;
  const progress = (tier - 1) / Math.max(1, maxTier - 1);
  const multiplier = minMult + (maxMult - minMult) * progress;
  return Math.round(weeklyTarget * multiplier);
}
var REWARD_THRESHOLDS = {
  micro: { activityInterval: 1, streakInterval: 1 },
  // Tiers 1-2
  mini: { activityInterval: 3, streakInterval: 2 },
  // Tiers 3-5
  standard: { activityInterval: 8, streakInterval: 3 },
  // Tiers 6-8
  quality: { activityInterval: 15, streakInterval: 4 },
  // Tiers 9-11
  premium: { activityInterval: 30, streakInterval: 5 }
  // Tiers 12-13
};
function getRewardTierForPlayerTier(playerTier) {
  if (playerTier <= 2) return "micro";
  if (playerTier <= 5) return "mini";
  if (playerTier <= 8) return "standard";
  if (playerTier <= 11) return "quality";
  return "premium";
}
function getRewardPoolsForType(settings, rewardType) {
  if (rewardType === "activity") return settings.activityRewardPools || [];
  if (rewardType === "streak") return settings.streakRewardPools || [];
  if (rewardType === "boss") return settings.bossRewardPools || [];
  // Fallback: try legacy shared pool
  return settings.rewardPools || [];
}
function canBankRewards(playerTier) {
  return playerTier >= 6;
}
function getMaxBankedRewards() {
  return 3;
}
var DEFAULT_SETTINGS = {
  enabledActivities: {},
  customHabits: [],
  activityOverrides: [],
  currentTier: 1,
  bossMaxHP: 35,
  bossCurrentHP: 35,
  consecutivePerfectWeeks: 0,
  disciplineTokens: 0,
  disciplineCompletionCount: 0,
  inTartarus: false,
  tartarusPenanceTasks: [],
  tartarusStartDate: null,
  lastThresholdCheck: null,
  failedThresholdDays: 0,
  templeTasks: [
    { id: "bathing", name: "Bathing", lastCompleted: null, intervalDays: 1, emoji: "\u{1F6BF}" },
    { id: "facial-hair", name: "Facial hair", lastCompleted: null, intervalDays: 2, emoji: "\u{1FA92}" },
    { id: "nails", name: "Nails", lastCompleted: null, intervalDays: 7, emoji: "\u2702\uFE0F" },
    { id: "haircut", name: "Haircut", lastCompleted: null, intervalDays: 21, emoji: "\u{1F488}" }
  ],
  lastMorpheusSummon: null,
  lastQuoteShown: null,
  // Pause system defaults
  systemState: "active",
  pauseStartTime: null,
  totalPausedTime: 0,
  // Developer tools defaults
  simulatedDate: null,
  // Boss customization defaults
  customBosses: [],
  customTartarusTasks: [],
  tartarusImage: null,
  tartarusBackgroundImage: null,
  hadesWrathApplied: false,
  // HP threshold boss images
  bossStartOfDayHP: null,
  lastHPResetDate: null,
  // Direct damage tracking
  lastCompletionCounts: {},
  // Boss HP scaling defaults
  useAutoDynamicHP: false,
  // Default: use manual multipliers
  autoDynamicHPMaxMultiplier: 1.5,
  // Max tier HP = total weekly × this
  bossHPMultiplierMin: 1.1,
  // Tier 1 = weeklyTarget × 1.1 (manual mode)
  bossHPMultiplierMax: 2.4,
  // Max tier = weeklyTarget × 2.4 (manual mode)
  maxTier: 13,
  // 13 bosses, 1 tier each
  rankGraceHP: 20,
  rankGraceDays: 3,
  rankBelowSince: null,
  activitySnapshots: {},
  snapshots: [],
  // Reward System defaults — separate pools for each reward source
  activityRewardPools: [
    { tier: "micro", options: [{ id: "act-micro-1", description: "[Activity micro reward 1]", image: "", emoji: "🎁" }] },
    { tier: "mini", options: [{ id: "act-mini-1", description: "[Activity mini reward 1]", image: "", emoji: "🎯" }] },
    { tier: "standard", options: [{ id: "act-std-1", description: "[Activity standard reward 1]", image: "", emoji: "⚔️" }] },
    { tier: "quality", options: [{ id: "act-qual-1", description: "[Activity quality reward 1]", image: "", emoji: "🔮" }] },
    { tier: "premium", options: [{ id: "act-prem-1", description: "[Activity premium reward 1]", image: "", emoji: "🏛️" }] }
  ],
  streakRewardPools: [
    { tier: "micro", options: [{ id: "str-micro-1", description: "[Streak micro reward 1]", image: "", emoji: "✨" }] },
    { tier: "mini", options: [{ id: "str-mini-1", description: "[Streak mini reward 1]", image: "", emoji: "🏆" }] },
    { tier: "standard", options: [{ id: "str-std-1", description: "[Streak standard reward 1]", image: "", emoji: "🛡️" }] },
    { tier: "quality", options: [{ id: "str-qual-1", description: "[Streak quality reward 1]", image: "", emoji: "⚡" }] },
    { tier: "premium", options: [{ id: "str-prem-1", description: "[Streak premium reward 1]", image: "", emoji: "⭐" }] }
  ],
  bossRewardPools: [
    { tier: "micro", options: [{ id: "boss-micro-1", description: "[Boss micro reward 1]", image: "", emoji: "🌟" }] },
    { tier: "mini", options: [{ id: "boss-mini-1", description: "[Boss mini reward 1]", image: "", emoji: "💎" }] },
    { tier: "standard", options: [{ id: "boss-std-1", description: "[Boss standard reward 1]", image: "", emoji: "👑" }] },
    { tier: "quality", options: [{ id: "boss-qual-1", description: "[Boss quality reward 1]", image: "", emoji: "🌙" }] },
    { tier: "premium", options: [{ id: "boss-prem-1", description: "[Boss premium reward 1]", image: "", emoji: "🔱" }] }
  ],
  activityRewardCounter: 0,
  streakRewardCounter: 0,
  pendingRewards: [],
  claimedRewards: [],
  bankedRewards: [],
  lastRewardCheck: null,
  // Tier figure settings
  tierFigures: [],  // Array of { tier, image, position ('left'|'right'), hideTierTitle, scale, offsetX, offsetY }
  showTierFigure: false,
  // Dashboard background image (9:16 aspect ratio, vignette auto-applied)
  dashboardBgImage: "",
  // Theme settings
  activeTheme: "auto",
  userPrimaryColor: "#613134",
  customTheme: {
    primary: "#613134",
    secondary: "#faddb3",
    accent: "#967b4d",
    muted: "#928d85"
  }
};
function todayISO() {
  const d = /* @__PURE__ */ new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}
function getEffectiveNow(settings) {
  if (settings.simulatedDate) {
    const simDate = new Date(settings.simulatedDate);
    simDate.setHours(12, 0, 0, 0);
    return simDate;
  }
  if (settings.systemState === "paused" && settings.pauseStartTime) {
    return new Date(settings.pauseStartTime);
  }
  return new Date(Date.now() - settings.totalPausedTime);
}
function getEffectiveTodayISO(settings) {
  const d = getEffectiveNow(settings);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}
function calculateLiveStreakWithDecay(completions, damagePerCompletion, asOf, settings) {
  const effectiveNow = settings ? getEffectiveNow(settings) : asOf || /* @__PURE__ */ new Date();
  const today = new Date(effectiveNow);
  today.setHours(0, 0, 0, 0);
  const completedDates = completions.filter((c) => c.completed).map((c) => {
    const d = new Date(c.date);
    d.setHours(0, 0, 0, 0);
    return d;
  }).filter((d) => !isNaN(d.getTime()) && d <= today).sort((a, b) => b.getTime() - a.getTime());
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
  const daysSinceLastCompletion = Math.floor(
    (today.getTime() - mostRecent.getTime()) / (24 * 60 * 60 * 1e3)
  );
  if (daysSinceLastCompletion > 2) {
    let baseStreak = 0;
    let checkDate2 = new Date(mostRecent);
    for (const date of completedDates) {
      if (date.getTime() === checkDate2.getTime()) {
        baseStreak++;
        checkDate2.setDate(checkDate2.getDate() - 1);
      } else if (date < checkDate2) {
        break;
      }
    }
    const earned2 = baseStreak * damagePerCompletion;
    return { streak: baseStreak, hp: earned2, earned: earned2, penalty: 0, penaltyDays: 0 };
  }
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
function calculateWeeklyStreak(completions, damagePerWeek, asOf, settings) {
  const effectiveNow = settings ? getEffectiveNow(settings) : asOf || /* @__PURE__ */ new Date();
  const today = new Date(effectiveNow);
  today.setHours(0, 0, 0, 0);
  const completedDates = completions.filter((c) => c.completed).map((c) => {
    const d = new Date(c.date);
    d.setHours(0, 0, 0, 0);
    return d;
  }).filter((d) => !isNaN(d.getTime()) && d <= today).sort((a, b) => b.getTime() - a.getTime());
  if (completedDates.length === 0) {
    return { streak: 0, hp: 0, earned: 0, penalty: 0, penaltyDays: 0 };
  }
  function getWeek(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 864e5 + 1) / 7);
    return { year: d.getFullYear(), week: weekNo };
  }
  const weekMap = /* @__PURE__ */ new Map();
  completedDates.forEach((date) => {
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
function getProgressBarColor(tier, inTartarus) {
  if (inTartarus) return "#613134";
  return RANK_TIER_COLORS[tier] ?? "#928d85";
}

/**
 * Get tier-based HP bar color scheme
 * Tiers 1-3: Sickly green, 4-6: Yellow/gold, 7-9: Purple, 10-12: Crimson, 13: Royal gold
 */
function getTierHPBarColors(tier, inTartarus) {
  if (inTartarus) {
    return {
      fill: 'linear-gradient(180deg, #613134 0%, #4a2528 30%, #3a1d20 70%, #2a1518 100%)',
      border: '#613134',
      glow: 'rgba(97, 49, 52, 0.3)',
      accent: '#613134'
    };
  }

  if (tier <= 3) {
    // Sickly green (tiers 1-3)
    return {
      fill: 'linear-gradient(180deg, #6a8a5a 0%, #4a6a3a 30%, #3a5a2a 70%, #2a4a1a 100%)',
      border: '#3a4a30',
      glow: 'rgba(106, 138, 90, 0.3)',
      accent: '#6a8a5a'
    };
  } else if (tier <= 6) {
    // Yellow/gold (tiers 4-6)
    return {
      fill: 'linear-gradient(180deg, #b8a070 0%, #9a8860 30%, #8a7850 70%, #6a5840 100%)',
      border: '#4a4030',
      glow: 'rgba(184, 160, 112, 0.3)',
      accent: '#b8a070'
    };
  } else if (tier <= 9) {
    // Purple (tiers 7-9)
    return {
      fill: 'linear-gradient(180deg, #8a6a9a 0%, #6a4a7a 30%, #5a3a6a 70%, #4a2a5a 100%)',
      border: '#4a3050',
      glow: 'rgba(138, 106, 154, 0.3)',
      accent: '#8a6a9a'
    };
  } else if (tier <= 12) {
    // Crimson (tiers 10-12)
    return {
      fill: 'linear-gradient(180deg, #9a4a4a 0%, #7a3030 30%, #6a2020 70%, #5a1010 100%)',
      border: '#4a2020',
      glow: 'rgba(154, 74, 74, 0.3)',
      accent: '#9a4a4a'
    };
  } else {
    // Tier 13: Royal gold with dark crimson undertones
    return {
      fill: 'linear-gradient(180deg, #c9a227 0%, #a08020 20%, #8b6914 40%, #6a3010 60%, #5a2010 80%, #4a1510 100%)',
      border: '#5a3010',
      glow: 'rgba(201, 162, 39, 0.4)',
      accent: '#c9a227'
    };
  }
}

/**
 * Calculate optimal HP segment configuration for dynamic scaling
 * Ensures 6-12 segments using "nice" HP values (1, 2, 5, 10, 25, 50, 100)
 */
function calculateHPSegments(maxHP) {
  const niceNumbers = [1, 2, 5, 10, 25, 50, 100];

  // Edge case: very low HP
  if (maxHP < 6) {
    return {
      segmentCount: maxHP,
      hpPerSegment: 1
    };
  }

  // Find the optimal nice number that gives 6-12 segments
  for (const hpPerSegment of niceNumbers) {
    const segmentCount = Math.ceil(maxHP / hpPerSegment);
    if (segmentCount >= 6 && segmentCount <= 12) {
      return { segmentCount, hpPerSegment };
    }
  }

  // Fallback: if no nice number works perfectly, find the closest
  let bestConfig = { segmentCount: 10, hpPerSegment: Math.ceil(maxHP / 10) };
  let bestDiff = Infinity;

  for (const hpPerSegment of niceNumbers) {
    const segmentCount = Math.ceil(maxHP / hpPerSegment);
    const diff = Math.abs(segmentCount - 9); // Target around 9 segments
    if (diff < bestDiff && segmentCount >= 6 && segmentCount <= 12) {
      bestDiff = diff;
      bestConfig = { segmentCount, hpPerSegment };
    }
  }

  // If still outside bounds, force within 6-12
  if (bestConfig.segmentCount < 6) {
    bestConfig.hpPerSegment = Math.ceil(maxHP / 6);
    bestConfig.segmentCount = Math.ceil(maxHP / bestConfig.hpPerSegment);
  } else if (bestConfig.segmentCount > 12) {
    bestConfig.hpPerSegment = Math.ceil(maxHP / 12);
    bestConfig.segmentCount = Math.ceil(maxHP / bestConfig.hpPerSegment);
  }

  return bestConfig;
}

function getCompletionsFromFolder(app, folderPath, fieldName) {
  const files = app.vault.getMarkdownFiles();
  const normalizedFolder = folderPath.endsWith("/") ? folderPath : folderPath + "/";
  return files.filter((file) => file.path === folderPath || file.path.startsWith(normalizedFolder)).map((file) => {
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
  }).filter((c) => c !== null);
}
function countDisciplineCompletions(app, folderPath, fieldName) {
  const files = app.vault.getMarkdownFiles();
  const normalizedFolder = folderPath.endsWith("/") ? folderPath : folderPath + "/";
  let count = 0;
  files.filter((file) => file.path === folderPath || file.path.startsWith(normalizedFolder)).forEach((file) => {
    const cache = app.metadataCache.getFileCache(file);
    const frontmatter = cache?.frontmatter;
    if (!frontmatter) return;
    const completed = frontmatter[fieldName] === true;
    const typeField = `${fieldName}-Type`;
    const type = frontmatter[typeField];
    if (completed && type === "discipline") {
      count++;
    }
  });
  return count;
}
function getStreakBonusMultiplier(consecutivePerfectWeeks) {
  if (consecutivePerfectWeeks <= 0) return 1;
  if (consecutivePerfectWeeks === 1) return 1.05;
  if (consecutivePerfectWeeks === 2) return 1.12;
  if (consecutivePerfectWeeks === 3) return 1.2;
  if (consecutivePerfectWeeks === 4) return 1.3;
  return 1.4;
}
function checkDeathThreshold(app, settings) {
  if (settings.systemState === "paused") {
    return false;
  }
  const allActivities = [
    ...getEffectiveActivities(settings).filter((a) => settings.enabledActivities[a._originalName] ?? true),
    ...settings.customHabits.filter((h) => h.enabled)
  ];
  const weeklyTarget = allActivities.reduce((sum, a) => {
    if (a.trackingMode === "weekly") {
      return sum + 1;
    }
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
    const completions = getCompletionsFromFolder(app, activity.folder, activity.field);
    completions.forEach((c) => {
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
function checkPerfectWeek(app, settings) {
  if (settings.systemState === "paused") {
    return false;
  }
  const allActivities = [
    ...getEffectiveActivities(settings).filter((a) => settings.enabledActivities[a._originalName] ?? true),
    ...settings.customHabits.filter((h) => h.enabled)
  ];
  const effectiveNow = getEffectiveNow(settings);
  const today = new Date(effectiveNow);
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() + mondayOffset);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  if (today < weekEnd) {
    return false;
  }
  for (const activity of allActivities) {
    const completions = getCompletionsFromFolder(
      app,
      activity.folder,
      activity.field
    );
    let weekCount = 0;
    completions.forEach((c) => {
      if (!c.completed) return;
      const date = new Date(c.date);
      date.setHours(0, 0, 0, 0);
      if (date >= weekStart && date <= weekEnd) {
        weekCount++;
      }
    });
    const target = activity.weeklyTarget || 7;
    if (weekCount < target) {
      return false;
    }
  }
  return true;
}
function getCurrentWeekProgress(app, settings) {
  const allActivities = [
    ...getEffectiveActivities(settings).filter((a) => settings.enabledActivities[a._originalName] ?? true),
    ...settings.customHabits.filter((h) => h.enabled)
  ];
  const effectiveNow = getEffectiveNow(settings);
  const today = new Date(effectiveNow);
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() + mondayOffset);
  let totalCompleted = 0;
  let totalTarget = 0;
  const byActivity = [];
  for (const activity of allActivities) {
    const completions = getCompletionsFromFolder(
      app,
      activity.folder,
      activity.field
    );
    let weekCount = 0;
    completions.forEach((c) => {
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
function enterTartarus(settings) {
  settings.inTartarus = true;
  settings.tartarusStartDate = getEffectiveTodayISO(settings);
  settings.bossCurrentHP = settings.bossMaxHP;
  settings.tartarusPenanceTasks = getPenanceTasksForTier(settings.currentTier, settings);
  settings.failedThresholdDays = 0;
  settings.hadesWrathApplied = false;
  new import_obsidian.Notice("You have entered TARTARUS. Complete penance to escape.");
}
var DEFAULT_TARTARUS_TASKS = {
  low: [
    { id: "cold-shower-3", description: "Cold shower \xD7 3 (separate days)" },
    { id: "fast-16h-3", description: "16-hour fast \xD7 3 (separate days)" },
    { id: "wake-6am-3", description: "Wake before 6 AM \xD7 3 (separate days)" }
  ],
  mid: [
    { id: "cold-shower-5", description: "Cold shower \xD7 5" },
    { id: "fast-20h-3", description: "20-hour fast \xD7 3" },
    { id: "all-activities-2", description: "Complete ALL activities in one day \xD7 2" },
    { id: "pushups-200", description: "200 pushups total (split across 3+ days)" }
  ],
  high: [
    { id: "ice-bath-3", description: "Ice bath (2 minutes) \xD7 3" },
    { id: "fast-24h-2", description: "24-hour fast \xD7 2" },
    { id: "perfect-week", description: "Perfect week (all targets met)" },
    { id: "pushups-500", description: "500 pushups total (split across week)" },
    { id: "custom", description: "Self-designed penance task" }
  ]
};
function getTierRange(tier) {
  if (tier <= 4) return "low";
  if (tier <= 9) return "mid";
  return "high";
}
function getPenanceTasksForTier(tier, settings) {
  const tierRange = getTierRange(tier);
  const customTasks = settings?.customTartarusTasks?.find((t) => t.tierRange === tierRange);
  const taskTemplates = customTasks?.tasks?.length ? customTasks.tasks : DEFAULT_TARTARUS_TASKS[tierRange];
  return taskTemplates.map((t) => ({
    id: t.id,
    description: t.description,
    completed: false
  }));
}
async function loadQuotesFromFile(app, filePath) {
  try {
    const file = app.vault.getAbstractFileByPath(filePath);
    if (!file || !(file instanceof import_obsidian.TFile)) return [];
    const content = await app.vault.read(file);
    const quotes = [];
    const quoteMatches = content.matchAll(/^>\s*"([^"]+)"\s*\n>\s*—\s*(.+)$/gm);
    for (const match of quoteMatches) {
      quotes.push(`"${match[1]}" \u2014 ${match[2]}`);
    }
    return quotes;
  } catch (e) {
    console.error(`Failed to load quotes from ${filePath}:`, e);
    return [];
  }
}
function getTimeOfDay(settings) {
  const hour = new Date(getEffectiveNow(settings)).getHours();
  if (hour < 6) return "night";
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  if (hour < 22) return "evening";
  return "night";
}
function getGreeting(settings, name = "Warrior") {
  const timeOfDay = getTimeOfDay(settings);
  const greetings = {
    morning: `Good morning, ${name}.`,
    afternoon: `Good afternoon, ${name}.`,
    evening: `Good evening, ${name}.`,
    night: `The night watches, ${name}.`
  };
  return greetings[timeOfDay];
}
async function getMorpheusDirective(app, settings) {
  const allActivities = [
    ...getEffectiveActivities(settings).filter((a) => settings.enabledActivities[a._originalName] ?? true),
    ...settings.customHabits.filter((h) => h.enabled)
  ];
  const today = new Date(getEffectiveNow(settings));
  today.setHours(0, 0, 0, 0);
  if (settings.inTartarus) {
    return {
      activity: "Escape Tartarus",
      reason: "You are trapped in the underworld. Complete your penance to return.",
      mythContext: "The gates of Tartarus close behind those who falter. Only through suffering is redemption earned.",
      priority: "death",
      quote: await getRandomQuote(app, settings)
    };
  }
  const belowThreshold = checkDeathThreshold(app, settings);
  if (belowThreshold && settings.failedThresholdDays >= 2) {
    const mostNeglected = await getMostNeglectedActivity(app, allActivities, settings);
    return {
      activity: mostNeglected?.name || "Any activity",
      reason: "Death approaches. Act now or face Tartarus.",
      mythContext: "The Fates draw near. One more day of weakness and you descend to the depths.",
      priority: "death",
      quote: await getRandomQuote(app, settings)
    };
  }
  const bossHPPercent = settings.bossCurrentHP / settings.bossMaxHP;
  if (bossHPPercent < 0.15) {
    const boss = getCustomizedBossForTier(settings.currentTier, settings);
    const bestForBoss = await getBestActivityForBoss(app, allActivities);
    if (bestForBoss) {
      return {
        activity: bestForBoss.name,
        reason: `${boss?.name} staggers. ${Math.ceil(settings.bossCurrentHP)} blows remain.`,
        mythContext: `The beast bleeds. You smell victory. Strike now while ${boss?.name} falters.`,
        priority: "boss",
        quote: await getRandomQuote(app, settings)
      };
    }
  }
  const neglectedActivity = await getMostNeglectedActivity(app, allActivities, settings);
  if (neglectedActivity) {
    const daysSinceLastCompletion = await getDaysSinceLastCompletion(app, neglectedActivity, settings);
    if (daysSinceLastCompletion >= 3) {
      return {
        activity: neglectedActivity.name,
        reason: `${daysSinceLastCompletion} days since you last did this. The skill atrophies.`,
        mythContext: getNeglectMythContext(neglectedActivity.name, daysSinceLastCompletion),
        priority: "neglect",
        quote: await getRandomQuote(app, settings)
      };
    }
  }
  const weekProgress = getCurrentWeekProgress(app, settings);
  const behindSchedule = weekProgress.byActivity.find((a) => {
    const daysLeft = 7 - new Date(getEffectiveNow(settings)).getDay();
    const needed = a.target - a.completed;
    return needed > daysLeft;
  });
  if (behindSchedule) {
    return {
      activity: behindSchedule.name,
      reason: `Behind schedule. ${behindSchedule.completed}/${behindSchedule.target} this week.`,
      mythContext: "Time is the enemy. The week closes and your goal slips away. Reclaim it.",
      priority: "weekly",
      quote: await getRandomQuote(app, settings)
    };
  }
  const timeOfDay = getTimeOfDay(settings);
  const preferredActivity = getTimeBasedActivity(allActivities, timeOfDay);
  if (preferredActivity) {
    return {
      activity: preferredActivity.name,
      reason: getTimeBasedReason(preferredActivity.name, timeOfDay),
      mythContext: getTimeBasedMythContext(timeOfDay),
      priority: "streak",
      quote: await getRandomQuote(app, settings)
    };
  }
  const anyActivity = allActivities[Math.floor(Math.random() * allActivities.length)];
  return {
    activity: anyActivity.name,
    reason: "The path forward is clear. Choose action over inertia.",
    mythContext: "Every step matters. Every choice compounds. The gods favor those who move.",
    priority: "streak",
    quote: await getRandomQuote(app, settings)
  };
}
async function getRandomQuote(app, settings) {
  const stoicQuotes = await loadQuotesFromFile(app, "Quotes/Stoicism.md");
  const personalQuotes = await loadQuotesFromFile(app, "Quotes/Personal.md");
  const usePersonal = Math.random() < 0.2 && personalQuotes.length > 0;
  const quotePool = usePersonal ? personalQuotes : stoicQuotes;
  if (quotePool.length === 0) {
    return '"The obstacle is the way." \u2014 Marcus Aurelius';
  }
  let quote = quotePool[Math.floor(Math.random() * quotePool.length)];
  if (quote === settings.lastQuoteShown && quotePool.length > 1) {
    quote = quotePool[Math.floor(Math.random() * quotePool.length)];
  }
  return quote;
}
async function getMostNeglectedActivity(app, activities, settings) {
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
async function getDaysSinceLastCompletion(app, activity, settings) {
  const completions = getCompletionsFromFolder(app, activity.folder, activity.field);
  if (completions.length === 0) return 999;
  const completed = completions.filter((c) => c.completed).map((c) => new Date(c.date)).sort((a, b) => b.getTime() - a.getTime());
  if (completed.length === 0) return 999;
  const today = new Date(getEffectiveNow(settings));
  today.setHours(0, 0, 0, 0);
  const lastDate = completed[0];
  return Math.floor((today.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1e3));
}
async function getBestActivityForBoss(app, activities) {
  if (activities.length === 0) return null;
  return activities.reduce((best, current) => {
    const bestTarget = best.weeklyTarget || 7;
    const currentTarget = current.weeklyTarget || 7;
    return currentTarget > bestTarget ? current : best;
  }, activities[0]);
}
function getNeglectMythContext(activityName, days) {
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
function getTimeBasedActivity(activities, timeOfDay) {
  const preferences = {
    morning: ["Workout", "Cardio"],
    afternoon: ["Health Study", "Reading"],
    evening: ["Drumming", "Drawing", "Social"],
    night: ["Reading"]
  };
  const preferred = preferences[timeOfDay];
  return activities.find((a) => preferred.includes(a.name)) || null;
}
function getTimeBasedReason(activityName, timeOfDay) {
  const reasons = {
    morning: "The dawn favors action. Strike while your will is fresh.",
    afternoon: "Midday brings clarity. Feed the mind while the sun shines.",
    evening: "Dusk calls for creation. The night muse awakens.",
    night: "The quiet hours favor reflection. Let wisdom speak."
  };
  return reasons[timeOfDay] || "The time is right for this pursuit.";
}
function getTimeBasedMythContext(timeOfDay) {
  const contexts = {
    morning: "Eos the dawn goddess blesses those who move with first light.",
    afternoon: "Helios rides high. Channel the sun's power while it burns.",
    evening: "Twilight is the hour of makers. Hephaestus works best in shadows.",
    night: "Nyx covers the world. In darkness, the wise find truth."
  };
  return contexts[timeOfDay] || "The gods watch. Make this moment count.";
}
var ACTIVITIES = [
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
function getEffectiveActivities(settings) {
  return ACTIVITIES.map((activity) => {
    const override = settings.activityOverrides?.find((o) => o.originalName === activity.name);
    if (!override) return { ...activity, _originalName: activity.name };
    return {
      ...activity,
      _originalName: activity.name,
      // Always track original name for enabledActivities lookup
      name: override.name ?? activity.name,
      folder: override.folder ?? activity.folder,
      field: override.field ?? activity.field,
      damagePerCompletion: override.damagePerCompletion ?? activity.damagePerCompletion,
      weeklyTarget: override.weeklyTarget ?? activity.weeklyTarget,
      trackingMode: override.trackingMode ?? activity.trackingMode,
      damagePerWeek: override.damagePerWeek ?? activity.damagePerWeek
    };
  });
}
var TrackRankView = class extends import_obsidian.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
  }
  getViewType() {
    return VIEW_TYPE_RANK;
  }
  getDisplayText() {
    return "Boss Dashboard";
  }
  async onOpen() {
    this._renderIntervals = [];
    this.render();
    return Promise.resolve();
  }
  render() {
    // Clear previous animation intervals to prevent stacking on re-render
    if (this._renderIntervals) {
      this._renderIntervals.forEach(id => clearInterval(id));
      this._renderIntervals = [];
    }
    const content = this.contentEl;
    content.empty();
    const settings = this.plugin.settings;
    const boss = getCustomizedBossForTier(settings.currentTier, settings);
    const rankName = getRankNameForTier(settings.currentTier, settings);
    const barColor = getProgressBarColor(settings.currentTier, settings.inTartarus);

    // Theme presets
    const THEME_PRESETS = {
      "age-of-concern": { primary: "#613134", secondary: "#faddb3", accent: "#967b4d", muted: "#928d85" },
      "dark-knight": { primary: "#1a1a2e", secondary: "#e0e0e0", accent: "#4a7c8f", muted: "#6c6c7e" },
      "forest-spirit": { primary: "#2d4a3e", secondary: "#d4e8c2", accent: "#7a9a5d", muted: "#8a9a85" },
      "obsidian-gold": { primary: "#1a1a1a", secondary: "#f0d060", accent: "#c9a227", muted: "#808080" },
      "blood-moon": { primary: "#4a1020", secondary: "#f0c0a0", accent: "#c04040", muted: "#8a6060" },
      "ocean-depths": { primary: "#0f2a3f", secondary: "#b8d8e8", accent: "#3a7ca5", muted: "#7090a0" },
      "amethyst": { primary: "#2d1b4e", secondary: "#e0d0f0", accent: "#8a5cf6", muted: "#7a6a8a" },
      "parchment": { primary: "#5a4a3a", secondary: "#f5ead0", accent: "#a0804a", muted: "#9a8a7a" },
    };

    // Helper to darken a hex color
    const darkenHex = (hex, factor) => {
      const r = parseInt(hex.slice(1,3), 16);
      const g = parseInt(hex.slice(3,5), 16);
      const b = parseInt(hex.slice(5,7), 16);
      return `#${Math.round(r*factor).toString(16).padStart(2,'0')}${Math.round(g*factor).toString(16).padStart(2,'0')}${Math.round(b*factor).toString(16).padStart(2,'0')}`;
    };

    // Helper to lighten a hex color
    const lightenHex = (hex, factor) => {
      const r = parseInt(hex.slice(1,3), 16);
      const g = parseInt(hex.slice(3,5), 16);
      const b = parseInt(hex.slice(5,7), 16);
      const lr = Math.min(255, Math.round(r + (255 - r) * factor));
      const lg = Math.min(255, Math.round(g + (255 - g) * factor));
      const lb = Math.min(255, Math.round(b + (255 - b) * factor));
      return `#${lr.toString(16).padStart(2,'0')}${lg.toString(16).padStart(2,'0')}${lb.toString(16).padStart(2,'0')}`;
    };

    // Helper to desaturate a hex color toward grey
    const desaturateHex = (hex, factor) => {
      const r = parseInt(hex.slice(1,3), 16);
      const g = parseInt(hex.slice(3,5), 16);
      const b = parseInt(hex.slice(5,7), 16);
      const grey = Math.round(r * 0.299 + g * 0.587 + b * 0.114);
      const dr = Math.round(r + (grey - r) * factor);
      const dg = Math.round(g + (grey - g) * factor);
      const db = Math.round(b + (grey - b) * factor);
      return `#${dr.toString(16).padStart(2,'0')}${dg.toString(16).padStart(2,'0')}${db.toString(16).padStart(2,'0')}`;
    };

    // Auto-theme: derive all 4 colors from a single primary color
    const deriveThemeFromPrimary = (primary) => {
      return {
        primary: primary,
        secondary: lightenHex(primary, 0.82),
        accent: lightenHex(desaturateHex(primary, 0.3), 0.45),
        muted: desaturateHex(lightenHex(primary, 0.4), 0.6)
      };
    };

    // Resolve active theme colors
    const activeTheme = settings.activeTheme || "auto";
    let themeColors;
    if (activeTheme === "auto") {
      themeColors = deriveThemeFromPrimary(settings.userPrimaryColor || "#613134");
    } else if (activeTheme === "custom") {
      themeColors = settings.customTheme || THEME_PRESETS["age-of-concern"];
    } else {
      themeColors = THEME_PRESETS[activeTheme] || deriveThemeFromPrimary(settings.userPrimaryColor || "#613134");
    }

    const colors = {
      buccaneer: themeColors.primary,
      peachYellow: themeColors.secondary,
      leather: themeColors.accent,
      naturalGrey: themeColors.muted,
      gold: themeColors.accent,
      goldLight: themeColors.accent,
      goldMuted: themeColors.accent,
      goldBorder: themeColors.primary,
      green: themeColors.accent,
      greenBorder: themeColors.primary,
      bg: darkenHex(themeColors.primary, 0.35),
      bgLight: darkenHex(themeColors.primary, 0.45),
      bgCard: darkenHex(themeColors.primary, 0.40),
      text: themeColors.secondary,
      textMuted: themeColors.muted,
      greenMuted: themeColors.muted,
      danger: themeColors.primary,
      dangerLight: themeColors.primary,
      dangerMuted: themeColors.primary,
      accent: themeColors.accent
    };

    // HP reset check is handled in the data layer (refresh), not here
    const wrapper = content.createDiv({
      cls: "track-habit-rank-container",
      attr: {
        style: `
          max-width: 420px;
          margin: 0 auto;
          padding: 28px;
          text-align: center;
          background: ${colors.bg};
          border: 1px solid rgba(150, 123, 77, 0.3);
          position: relative;
          font-family: "Georgia", serif;
          overflow: hidden;
          animation: borderGlow 8s ease-in-out infinite;
        `
      }
    });

    // 9:16 Background image with vignette
    if (settings.dashboardBgImage) {
      let bgImageUrl = settings.dashboardBgImage;
      if (!bgImageUrl.startsWith('http://') && !bgImageUrl.startsWith('https://') && !bgImageUrl.startsWith('data:')) {
        try { bgImageUrl = this.app.vault.adapter.getResourcePath(bgImageUrl); } catch (e) {}
      }
      const bgLayer = wrapper.createDiv({
        attr: {
          style: `
            position: absolute;
            inset: 0;
            z-index: 0;
            background-image: url('${bgImageUrl}');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
          `
        }
      });
      // Vignette overlay
      bgLayer.createDiv({
        attr: {
          style: `
            position: absolute;
            inset: 0;
            background: radial-gradient(ellipse at center, transparent 30%, rgba(26, 20, 16, 0.7) 70%, rgba(26, 20, 16, 0.95) 100%);
            pointer-events: none;
          `
        }
      });
      // Top/bottom fade
      bgLayer.createDiv({
        attr: {
          style: `
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, rgba(26, 20, 16, 0.6) 0%, transparent 20%, transparent 70%, rgba(26, 20, 16, 0.8) 100%);
            pointer-events: none;
          `
        }
      });
    }

    // Add ornate art deco gold corners (moodboard style)
    const cornerSVG = `
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0 L40 0 L40 4 L4 4 L4 40 L0 40 Z" fill="${colors.goldMuted}"/>
        <path d="M0 0 L32 0 L32 2 L2 2 L2 32 L0 32 Z" fill="${colors.gold}"/>
        <path d="M8 0 L12 0 L12 8 L8 8 Z" fill="${colors.goldMuted}"/>
        <path d="M0 8 L8 8 L8 12 L0 12 Z" fill="${colors.goldMuted}"/>
        <circle cx="6" cy="6" r="2" fill="${colors.gold}"/>
      </svg>
    `;

    // Add aura particle effects
    this.addAuraParticles(wrapper, settings.inTartarus ? colors.dangerMuted : colors.goldMuted);

    const cornerPositions = [
      { top: "0", left: "0", borderTop: true, borderLeft: true },
      { top: "0", right: "0", borderTop: true, borderRight: true },
      { bottom: "0", left: "0", borderBottom: true, borderLeft: true },
      { bottom: "0", right: "0", borderBottom: true, borderRight: true }
    ];
    const cornerColor = settings.inTartarus ? colors.buccaneer : colors.leather;
    cornerPositions.forEach((pos) => {
      const corner = wrapper.createDiv({
        attr: {
          style: `
            position: absolute;
            ${pos.top !== void 0 ? `top: ${pos.top}` : ""};
            ${pos.bottom !== void 0 ? `bottom: ${pos.bottom}` : ""};
            ${pos.left !== void 0 ? `left: ${pos.left}` : ""};
            ${pos.right !== void 0 ? `right: ${pos.right}` : ""};
            width: 18px;
            height: 18px;
            ${pos.borderTop ? `border-top: 1px solid ${cornerColor};` : ""}
            ${pos.borderBottom ? `border-bottom: 1px solid ${cornerColor};` : ""}
            ${pos.borderLeft ? `border-left: 1px solid ${cornerColor};` : ""}
            ${pos.borderRight ? `border-right: 1px solid ${cornerColor};` : ""}
            pointer-events: none;
            z-index: 10;
          `
        }
      });
    });
    if (settings.systemState === "paused") {
      const pauseBanner = wrapper.createDiv({
        cls: "track-habit-rank-pause-banner",
        attr: {
          style: `
            background: ${colors.bg};
            padding: 20px 24px;
            margin-bottom: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            border: 1px solid ${colors.naturalGrey};
            position: relative;
            z-index: 1;
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
            color: ${colors.naturalGrey};
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
            color: ${colors.textMuted};
          `
        }
      });
      const resumeBtn = pauseBanner.createEl("button", {
        text: "Resume System",
        cls: "track-habit-rank-btn",
        attr: {
          style: `
            margin-top: 8px;
            padding: 12px 24px;
            min-height: 44px;
            min-width: 120px;
            background: ${colors.bg};
            color: ${colors.naturalGrey};
            border: 1px solid ${colors.naturalGrey};
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
    if (settings.inTartarus) {
      // Gothic Tartarus styling - matching moodboard aesthetic
      if (!document.getElementById('track-habit-rank-tartarus-gothic')) {
        const tartarusStyle = document.createElement('style');
        tartarusStyle.id = 'track-habit-rank-tartarus-gothic';
        tartarusStyle.textContent = `
          @keyframes darkBreath {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.7; }
          }
          @keyframes subtleEmber {
            0%, 100% { transform: translateY(0); opacity: 0.3; }
            50% { transform: translateY(-5px); opacity: 0.5; }
          }
          .tartarus-gothic-bg {
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg,
              #120e0a 0%,
              #1a1410 30%,
              #1e1812 50%,
              #1a1410 70%,
              #120e0a 100%
            );
            z-index: 0;
          }
          .tartarus-gothic-bg::before {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(ellipse at 50% 90%, rgba(97, 49, 52, 0.12) 0%, transparent 50%);
            animation: darkBreath 8s ease-in-out infinite;
          }
          .tartarus-gothic-frame {
            position: absolute;
            inset: 8px;
            border: 1px solid rgba(150, 123, 77, 0.25);
            pointer-events: none;
            z-index: 1;
          }
          .tartarus-gothic-frame::before {
            content: '';
            position: absolute;
            inset: 4px;
            border: 1px solid rgba(150, 123, 77, 0.15);
          }
          .tartarus-corner-ornament {
            position: absolute;
            width: 24px;
            height: 24px;
            z-index: 2;
          }
          .tartarus-corner-ornament svg {
            width: 100%;
            height: 100%;
          }
        `;
        document.head.appendChild(tartarusStyle);
      }

      // Add gothic background
      wrapper.createDiv({ cls: 'tartarus-gothic-bg' });

      // 9:16 Background image with vignette (Tartarus-specific or fallback to dashboard)
      const tartarusBgSrc = settings.tartarusBackgroundImage || settings.dashboardBgImage;
      if (tartarusBgSrc) {
        let tartBgUrl = tartarusBgSrc;
        if (!tartBgUrl.startsWith('http://') && !tartBgUrl.startsWith('https://') && !tartBgUrl.startsWith('data:')) {
          try { tartBgUrl = this.app.vault.adapter.getResourcePath(tartBgUrl); } catch (e) {}
        }
        const tartBgLayer = wrapper.createDiv({
          attr: {
            style: `
              position: absolute;
              inset: 0;
              z-index: 0;
              background-image: url('${tartBgUrl}');
              background-size: cover;
              background-position: center;
              background-repeat: no-repeat;
            `
          }
        });
        tartBgLayer.createDiv({
          attr: {
            style: `
              position: absolute;
              inset: 0;
              background: radial-gradient(ellipse at center, transparent 30%, rgba(26, 20, 16, 0.7) 70%, rgba(26, 20, 16, 0.95) 100%);
              pointer-events: none;
            `
          }
        });
        tartBgLayer.createDiv({
          attr: {
            style: `
              position: absolute;
              inset: 0;
              background: linear-gradient(180deg, rgba(26, 20, 16, 0.6) 0%, transparent 20%, transparent 70%, rgba(26, 20, 16, 0.8) 100%);
              pointer-events: none;
            `
          }
        });
      }

      // Add inner frame with gold/burgundy corners
      const gothicFrame = wrapper.createDiv({ cls: 'tartarus-gothic-frame' });

      // Corner ornaments (art deco style with burgundy)
      const tartarusCornerSVG = `
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0 L24 0 L24 3 L3 3 L3 24 L0 24 Z" fill="rgba(97, 49, 52, 0.4)"/>
          <path d="M0 0 L18 0 L18 1.5 L1.5 1.5 L1.5 18 L0 18 Z" fill="rgba(150, 123, 77, 0.4)"/>
          <circle cx="4" cy="4" r="1.5" fill="rgba(150, 123, 77, 0.5)"/>
        </svg>
      `;

      const tartarusCornerPositions = [
        { top: '4px', left: '4px', transform: 'rotate(0deg)' },
        { top: '4px', right: '4px', transform: 'rotate(90deg)' },
        { bottom: '4px', left: '4px', transform: 'rotate(-90deg)' },
        { bottom: '4px', right: '4px', transform: 'rotate(180deg)' }
      ];

      tartarusCornerPositions.forEach(pos => {
        const corner = wrapper.createDiv({ cls: 'tartarus-corner-ornament' });
        corner.innerHTML = tartarusCornerSVG;
        Object.assign(corner.style, pos, { position: 'absolute' });
      });

      // Tartarus content container (above the background)
      const tartarusContent = wrapper.createDiv({
        attr: {
          style: `
            position: relative;
            z-index: 3;
            padding: 40px 16px 60px 16px;
          `
        }
      });

      const tartarusImage = settings.tartarusImage;
      if (tartarusImage) {
        let resolvedTartImg = tartarusImage;
        if (!tartarusImage.startsWith('http://') && !tartarusImage.startsWith('https://') && !tartarusImage.startsWith('data:')) {
          try { resolvedTartImg = this.app.vault.adapter.getResourcePath(tartarusImage); } catch (e) {}
        }
        // Full-width Tartarus image with heavy gradient fade (same as boss image)
        const tartImgWrap = wrapper.createDiv({
          attr: {
            style: `
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              z-index: 0;
              overflow: hidden;
              pointer-events: none;
              -webkit-mask-image: linear-gradient(to bottom, white 0%, white 25%, transparent 100%);
              mask-image: linear-gradient(to bottom, white 0%, white 25%, transparent 100%);
            `
          }
        });
        tartImgWrap.createEl("img", {
          attr: {
            src: resolvedTartImg,
            alt: "Tartarus",
            style: `
              width: 100%;
              display: block;
              object-fit: cover;
              filter: contrast(1.1) brightness(0.7) sepia(0.15);
              animation: fadeSlideIn 0.8s ease-out;
            `
          }
        }).onerror = function() { tartImgWrap.remove(); };
        // Spacer to push content below the image
        tartarusContent.createDiv({
          attr: { style: "width: 100%; padding-top: 45%; pointer-events: none;" }
        });
      }

      // TARTARUS title - Gothic elegance
      tartarusContent.createEl("div", {
        text: "TARTARUS",
        attr: {
          style: `
            font-family: "Times New Roman", serif;
            font-size: 2.4em;
            font-weight: 600;
            letter-spacing: 8px;
            margin-bottom: 8px;
            text-transform: uppercase;
            color: ${colors.peachYellow};
            text-shadow: 0 2px 8px rgba(26, 20, 16, 0.6), 0 0 2px rgba(0, 0, 0, 1);
          `
        }
      });

      // Decorative divider
      tartarusContent.createEl("div", {
        attr: {
          style: `
            width: 120px;
            height: 1px;
            background: linear-gradient(90deg, transparent 0%, ${colors.danger} 30%, ${colors.gold} 50%, ${colors.danger} 70%, transparent 100%);
            margin: 0 auto 12px auto;
            opacity: 0.6;
          `
        }
      });

      // Subtitle - muted gold accent
      tartarusContent.createEl("div", {
        text: "The Pit of Eternal Penance",
        attr: {
          style: `
            font-family: "Georgia", serif;
            font-size: 12px;
            font-style: italic;
            letter-spacing: 2px;
            margin-bottom: 32px;
            color: ${colors.naturalGrey};
          `
        }
      });

      // Penance progress — inline on the dashboard
      const effectiveNowTart = getEffectiveNow(settings);
      const daysInTart = settings.tartarusStartDate ? Math.floor((effectiveNowTart.getTime() - new Date(settings.tartarusStartDate).getTime()) / (24 * 60 * 60 * 1e3)) : 0;
      const baseReqTart = settings.currentTier <= 4 ? 3 : settings.currentTier <= 9 ? 4 : 5;
      const reqTart = settings.hadesWrathApplied ? settings.tartarusPenanceTasks.length : baseReqTart;
      const completedTart = settings.tartarusPenanceTasks.filter((t) => t.completed).length;

      // Days counter
      tartarusContent.createEl("div", {
        text: `Day ${daysInTart}`,
        attr: {
          style: `
            font-family: "Times New Roman", serif;
            font-size: 28px;
            font-weight: 600;
            letter-spacing: 4px;
            margin-bottom: 6px;
            color: ${colors.peachYellow};
            text-shadow: 0 0 12px rgba(200, 80, 20, 0.3);
          `
        }
      });
      tartarusContent.createEl("div", {
        text: "of imprisonment",
        attr: {
          style: `
            font-family: "Georgia", serif;
            font-size: 10px;
            letter-spacing: 3px;
            text-transform: uppercase;
            margin-bottom: 28px;
            color: ${colors.naturalGrey};
            opacity: 0.7;
          `
        }
      });

      // Task progress bar
      const progressFraction = reqTart > 0 ? completedTart / reqTart : 0;
      const progressBox = tartarusContent.createDiv({
        attr: {
          style: `
            margin: 0 auto 10px auto;
            max-width: 260px;
          `
        }
      });
      const progressTrack = progressBox.createDiv({
        attr: {
          style: `
            width: 100%;
            height: 6px;
            background: rgba(150, 123, 77, 0.15);
            border-radius: 3px;
            overflow: hidden;
            border: 1px solid rgba(150, 123, 77, 0.2);
          `
        }
      });
      progressTrack.createDiv({
        attr: {
          style: `
            width: ${Math.round(progressFraction * 100)}%;
            height: 100%;
            background: linear-gradient(90deg, ${colors.danger}, ${colors.leather});
            border-radius: 3px;
            transition: width 0.4s ease;
          `
        }
      });
      progressBox.createEl("div", {
        text: `${completedTart} of ${reqTart} tasks completed`,
        attr: {
          style: `
            font-family: "Times New Roman", serif;
            font-size: 11px;
            letter-spacing: 1px;
            margin-top: 6px;
            color: ${colors.naturalGrey};
          `
        }
      });

      // Hades' Wrath warning if active
      if (settings.hadesWrathApplied) {
        tartarusContent.createEl("div", {
          text: "HADES' WRATH \u2014 Tasks have been doubled",
          attr: {
            style: `
              font-family: "Times New Roman", serif;
              font-size: 10px;
              letter-spacing: 2px;
              text-transform: uppercase;
              margin-top: 12px;
              padding: 8px 16px;
              color: ${colors.danger};
              border: 1px solid ${colors.danger};
              background: rgba(97, 49, 52, 0.1);
            `
          }
        });
      } else if (daysInTart >= 2 && completedTart < reqTart && settings.systemState !== "paused") {
        tartarusContent.createEl("div", {
          text: `Hades' Wrath in ${3 - daysInTart} day(s)`,
          attr: {
            style: `
              font-family: "Times New Roman", serif;
              font-size: 10px;
              letter-spacing: 2px;
              text-transform: uppercase;
              margin-top: 12px;
              padding: 8px 16px;
              color: ${colors.leather};
              border: 1px solid rgba(150, 123, 77, 0.3);
              background: rgba(150, 123, 77, 0.05);
            `
          }
        });
      }

      // Atmospheric lore
      const tartarusLore = [
        "Here the wicked are purified through suffering, that they may ascend once more.",
        "No soul escapes Tartarus unchanged. The fire burns away weakness.",
        "The gates will open only for those who endure what they once fled.",
        "Even the Titans were cast here. Only discipline breaks the chains.",
        "Deeper than Hades, darker than night. Redemption is earned in agony."
      ];
      const loreIndex = daysInTart % tartarusLore.length;
      tartarusContent.createEl("div", {
        text: tartarusLore[loreIndex],
        attr: {
          style: `
            font-family: "Georgia", serif;
            font-size: 11px;
            font-style: italic;
            line-height: 1.6;
            max-width: 280px;
            margin: 28px auto 0 auto;
            color: ${colors.naturalGrey};
            opacity: 0.6;
          `
        }
      });

      // Tartarus fire — layered flames and floating embers
      const fireContainer = wrapper.createDiv({
        attr: {
          style: `
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 160px;
            z-index: 2;
            pointer-events: none;
            overflow: hidden;
          `
        }
      });

      // Layer 1: Base glow — warm ambient light at the bottom edge
      fireContainer.createDiv({
        attr: {
          style: `
            position: absolute;
            bottom: 0;
            left: -10%;
            right: -10%;
            height: 40px;
            background: radial-gradient(ellipse at 50% 100%, rgba(200, 80, 20, 0.35) 0%, rgba(150, 50, 10, 0.15) 50%, transparent 80%);
            animation: fireGlow 3s ease-in-out infinite;
            filter: blur(12px);
          `
        }
      });

      // Layer 2: Dynamic embers — spawned by JS, drift with changing wind
      // Reduced spawn rate on mobile to save battery
      const isMobile = this.app.isMobile;
      const emberSpawnRate = isMobile ? 800 : 350;
      const seedCount = isMobile ? 2 : 4;

      let windX = 0;
      const windInterval = setInterval(() => {
        windX = -30 + Math.random() * 60;
      }, 5000);
      this._renderIntervals.push(windInterval);

      const spawnEmber = () => {
        const size = 2 + Math.random() * 3;
        const x = 5 + Math.random() * 90;
        const rise = 80 + Math.random() * 60;
        const dur = 2000 + Math.random() * 2000;
        const drift = windX + (Math.random() * 20 - 10);
        const r = 255, g = 150 + Math.floor(Math.random() * 90), b = 30 + Math.floor(Math.random() * 60);

        const ember = fireContainer.createDiv({
          attr: {
            style: `
              position: absolute;
              bottom: 5px;
              left: ${x}%;
              width: ${size}px;
              height: ${size}px;
              background: rgba(${r}, ${g}, ${b}, 0.9);
              border-radius: 50%;
              opacity: 0;
              box-shadow: 0 0 ${size + 2}px rgba(${r}, ${g}, ${b}, 0.6);
              pointer-events: none;
            `
          }
        });

        const anim = ember.animate([
          { transform: 'translateY(0) translateX(0) scale(1)', opacity: 0 },
          { opacity: 0.85, offset: 0.08 },
          { opacity: 0.6, offset: 0.4 },
          { transform: `translateY(-${rise}px) translateX(${drift}px) scale(0.3)`, opacity: 0 }
        ], { duration: dur, easing: 'ease-out', fill: 'forwards' });

        anim.onfinish = () => ember.remove();
      };

      // Spawn embers at staggered intervals (tracked for cleanup on re-render)
      const emberInterval = setInterval(() => {
        if (fireContainer.isConnected) {
          spawnEmber();
        } else {
          clearInterval(emberInterval);
        }
      }, emberSpawnRate);
      this._renderIntervals.push(emberInterval);
      // Seed a few immediately
      for (let i = 0; i < seedCount; i++) {
        setTimeout(() => spawnEmber(), i * 80);
      }

      // Note: No boss info, HP bar, or rewards shown in Tartarus
      // User can only see penance tasks via the warning box below
    } else {
      // Get HP-threshold appropriate boss image
      const hpPercent = settings.bossCurrentHP / settings.bossMaxHP;
      const bossOverride = settings.customBosses?.find((c) => c.tier === settings.currentTier);
      let bossImage = boss?.image;
      if (bossOverride) {
        if (hpPercent <= 0.2 && bossOverride.image20) {
          bossImage = bossOverride.image20;
        } else if (hpPercent <= 0.5 && bossOverride.image50) {
          bossImage = bossOverride.image50;
        } else if (bossOverride.image) {
          bossImage = bossOverride.image;
        }
      }

      // Check for tier figure
      const tierFigure = settings.tierFigures?.find(f => f.tier === settings.currentTier);
      const showFigure = settings.showTierFigure && tierFigure?.image;
      const figurePosition = tierFigure?.position || 'left';
      const figureScale = tierFigure?.scale || 1.0;
      const figureOffsetX = tierFigure?.offsetX || 0;
      const figureOffsetY = tierFigure?.offsetY || 0;

      // Boss image — full width, positioned at top with heavy fade from below
      if (bossImage) {
        let resolvedBossImage = bossImage;
        if (!bossImage.startsWith('http://') && !bossImage.startsWith('https://') && !bossImage.startsWith('data:')) {
          try { resolvedBossImage = this.app.vault.adapter.getResourcePath(bossImage); } catch (e) {}
        }
        const bossImgWrap = wrapper.createDiv({
          attr: {
            style: `
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              z-index: 0;
              overflow: hidden;
              pointer-events: none;
              -webkit-mask-image: linear-gradient(to bottom, white 0%, white 25%, transparent 100%);
              mask-image: linear-gradient(to bottom, white 0%, white 25%, transparent 100%);
            `
          }
        });
        bossImgWrap.createEl("img", {
          attr: {
            src: resolvedBossImage,
            alt: boss?.name || "Boss",
            style: `
              width: 100%;
              display: block;
              object-fit: cover;
              filter: contrast(1.05) brightness(0.9);
              animation: fadeSlideIn 0.8s ease-out;
            `
          }
        }).onerror = function() { bossImgWrap.remove(); };
        // Click the boss image area to show boss reward
        bossImgWrap.style.pointerEvents = "auto";
        bossImgWrap.style.cursor = "pointer";
        bossImgWrap.onclick = () => { new BossRewardModal(this.app, this.plugin).open(); };
      }

      // Tier figure — overlaid absolutely, doesn't affect boss image centering
      // Rendered later, alongside the boss title, so it sits at the right height
      let tierFigureDiv = null;
      if (showFigure) {
        let figImgPath = tierFigure.image;
        if (!figImgPath.startsWith('http://') && !figImgPath.startsWith('https://') && !figImgPath.startsWith('data:')) {
          try { figImgPath = this.app.vault.adapter.getResourcePath(figImgPath); } catch (e) {}
        }
        const figureSize = Math.round(160 * figureScale);
        const figureMaxH = Math.round(240 * figureScale);
        // Store for insertion alongside boss title
        tierFigureDiv = { src: figImgPath, size: figureSize, maxH: figureMaxH };
      }

      // Spacer to push content below the full-width boss image
      if (bossImage) {
        wrapper.createDiv({
          attr: {
            style: `
              width: 100%;
              padding-top: 55%;
              position: relative;
              z-index: 1;
            `
          }
        });
      }

      // Title area — contains boss name, rank, and tier figure behind them
      const titleArea = wrapper.createDiv({
        attr: {
          style: `
            position: relative;
            z-index: 1;
            overflow: visible;
          `
        }
      });

      // Tier figure — sits behind the boss title at its height
      if (tierFigureDiv) {
        const posStyle = figurePosition === 'right'
          ? `right: ${figureOffsetX}px; left: auto;`
          : `left: ${figureOffsetX}px; right: auto;`;
        const figDiv = titleArea.createDiv({
          attr: {
            style: `
              position: absolute;
              ${posStyle}
              bottom: ${-20 + figureOffsetY}px;
              z-index: 0;
              pointer-events: none;
              animation: fadeSlideIn 1s 0.3s ease-out both;
            `
          }
        });
        const figImg = figDiv.createEl("img", {
          attr: {
            src: tierFigureDiv.src,
            alt: "Tier Figure",
            style: `
              max-width: ${tierFigureDiv.size}px;
              max-height: ${tierFigureDiv.maxH}px;
              object-fit: contain;
              filter: contrast(1.05) drop-shadow(0 2px 8px rgba(0,0,0,0.5));
            `
          }
        });
        figImg.onerror = () => figDiv.remove();
      }

      // Boss name is PRIMARY (large, commanding) with fade-in
      titleArea.createEl("div", {
        text: boss?.name || "No Boss",
        attr: {
          style: `
            font-family: "Times New Roman", serif;
            font-size: 2.2em;
            font-weight: 600;
            letter-spacing: 3px;
            margin-bottom: 8px;
            text-transform: uppercase;
            color: ${colors.gold};
            text-shadow: 0 2px 12px rgba(154, 140, 122, 0.3);
            position: relative;
            z-index: 1;
            animation: fadeSlideIn 0.6s ease-out;
          `
        }
      });

      // User title is SECONDARY (smaller, subdued) - hide if tier figure has hideTierTitle
      if (!(tierFigure?.hideTierTitle && tierFigure?.image)) {
        titleArea.createEl("div", {
          text: rankName,
          attr: {
            style: `
              font-family: "Times New Roman", serif;
              font-size: 12px;
              font-weight: 400;
              letter-spacing: 2px;
              margin-bottom: 16px;
              text-transform: uppercase;
              color: ${colors.greenMuted};
              opacity: 0.8;
              position: relative;
              z-index: 1;
              animation: fadeSlideIn 0.8s 0.15s ease-out both;
            `
          }
        });
      }
    }

    // Only show HP bar, stats, and rewards when NOT in Tartarus
    if (!settings.inTartarus) {
    const hpPercent = Math.round(settings.bossCurrentHP / settings.bossMaxHP * 100);

    // Calculate HP percentages
    const hpFillPercent = (settings.bossCurrentHP / settings.bossMaxHP) * 100;
    const startOfDayHP = settings.bossStartOfDayHP ?? settings.bossCurrentHP;
    const startOfDayPercent = (startOfDayHP / settings.bossMaxHP) * 100;

    // === MINIMAL RED HP BAR ===
    const hpBarContainer = wrapper.createDiv({
      attr: {
        style: `
          position: relative;
          margin: 0 auto 6px auto;
          max-width: 320px;
          z-index: 1;
        `
      }
    });

    // HP text above bar
    hpBarContainer.createEl("div", {
      text: `${settings.bossCurrentHP} / ${settings.bossMaxHP}`,
      attr: {
        style: `
          font-family: "Georgia", serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 1px;
          color: ${colors.peachYellow};
          text-align: center;
          margin-bottom: 4px;
          opacity: 0.9;
        `
      }
    });

    // HP bar track
    const hpTrack = hpBarContainer.createDiv({
      attr: {
        style: `
          position: relative;
          height: 10px;
          background: rgba(146, 141, 133, 0.15);
          overflow: hidden;
        `
      }
    });

    // Damage linger layer
    if (startOfDayPercent > hpFillPercent) {
      hpTrack.createDiv({
        attr: {
          style: `
            position: absolute;
            left: 0; top: 0; bottom: 0;
            width: ${startOfDayPercent}%;
            background: rgba(150, 123, 77, 0.35);
            transition: width 0.8s ease;
          `
        }
      });
    }

    // Main HP fill - Leather tone
    hpTrack.createDiv({
      attr: {
        style: `
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: ${hpFillPercent}%;
          background: ${colors.leather};
          transition: width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        `
      }
    });

    // Damage dealt today indicator
    if (startOfDayPercent > hpFillPercent) {
      const damageDealt = startOfDayHP - settings.bossCurrentHP;
      hpBarContainer.createEl("div", {
        text: `\u2212${damageDealt} today`,
        attr: {
          style: `
            font-family: "Georgia", serif;
            font-size: 9px;
            color: ${colors.naturalGrey};
            text-align: right;
            margin-top: 2px;
            font-style: italic;
            opacity: 0.8;
          `
        }
      });
    }

    if (boss?.lore) {
      wrapper.createEl("div", {
        text: boss.lore,
        attr: {
          style: `
            font-family: "Georgia", serif;
            font-size: 12px;
            font-style: italic;
            color: ${colors.textMuted};
            margin-bottom: 20px;
            line-height: 1.5;
            opacity: 0.8;
            position: relative;
            z-index: 1;
          `
        }
      });
    }

    // Streak indicator (compact, only if streak exists)
    if (settings.consecutivePerfectWeeks > 0) {
      wrapper.createEl("div", {
        text: `${settings.consecutivePerfectWeeks}wk streak`,
        attr: {
          style: `
            font-family: "Georgia", serif;
            font-size: 9px;
            letter-spacing: 0.5px;
            color: ${colors.naturalGrey};
            text-align: center;
            margin-bottom: 12px;
            opacity: 0.6;
            z-index: 1;
            position: relative;
          `
        }
      });
    }

    // Reward boxes
    this.renderRewardBoxes(wrapper, colors);
    } // End of !inTartarus block for HP bar and rewards

    if (!settings.inTartarus && settings.systemState === "active") {
      const allActivities = [
        ...getEffectiveActivities(settings).filter((a) => settings.enabledActivities[a._originalName] ?? true),
        ...this.plugin.settings.customHabits.filter((h) => h.enabled)
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
        completions.forEach((c) => {
          if (!c.completed) return;
          const date = new Date(c.date);
          date.setHours(0, 0, 0, 0);
          if (date >= startDate && date <= today) {
            totalCompletions++;
          }
        });
      }
      // Moved to death threshold monitor section for cleaner display
    }
    if (settings.inTartarus) {
      const warningBox = wrapper.createDiv({
        cls: "track-habit-rank-warning track-habit-rank-warning-tartarus",
        attr: {
          style: `
            margin: 16px 0;
            padding: 16px 20px;
            background: rgba(26, 20, 16, 0.85);
            border: 1px solid ${colors.naturalGrey};
            position: relative;
            z-index: 1;
          `
        }
      });

      warningBox.createEl("div", {
        text: "YOU ARE IN TARTARUS",
        cls: "track-habit-rank-warning-title",
        attr: {
          style: `
            font-family: "Times New Roman", serif;
            font-size: 13px;
            font-weight: 500;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: ${colors.peachYellow};
            margin-bottom: 10px;
          `
        }
      });
      const effectiveNow = getEffectiveNow(settings);
      const daysIn = settings.tartarusStartDate ? Math.floor((effectiveNow.getTime() - new Date(settings.tartarusStartDate).getTime()) / (24 * 60 * 60 * 1e3)) : 0;
      const baseReq = settings.currentTier <= 4 ? 3 : settings.currentTier <= 9 ? 4 : 5;
      const requiredTasks = settings.hadesWrathApplied ? settings.tartarusPenanceTasks.length : baseReq;
      const completedTasks = settings.tartarusPenanceTasks.filter((t) => t.completed).length;
      const remainingTasks = requiredTasks - completedTasks;
      warningBox.createEl("div", {
        text: `Day ${daysIn} | ${remainingTasks > 0 ? `${remainingTasks} task${remainingTasks !== 1 ? 's' : ''} remaining` : 'All tasks complete'}`,
        cls: "track-habit-rank-warning-text",
        attr: {
          style: `
            font-family: "Georgia", serif;
            font-size: 13px;
            font-style: italic;
            color: ${colors.naturalGrey};
          `
        }
      });
      const viewBtn = warningBox.createEl("button", {
        text: "View Penance Tasks",
        cls: "track-habit-rank-btn track-habit-rank-btn-danger",
        attr: {
          style: `
            margin-top: 12px;
            padding: 12px 20px;
            min-height: 44px;
            background: ${colors.bg};
            color: ${colors.leather};
            border: 1px solid ${colors.leather};
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
    // Death threshold monitor - calm and advisory
    if (!settings.inTartarus && settings.systemState === "active") {
      this.renderDeathThresholdMonitor(wrapper, colors);
    }

    if (settings.systemState === "active") {
      const pauseSection = wrapper.createDiv({
        attr: {
          style: `
            margin-top: 24px;
            padding-top: 16px;
            border-top: 1px solid rgba(150, 123, 77, 0.3);
            z-index: 1;
            position: relative;
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
            background: ${colors.bg};
            color: ${colors.naturalGrey};
            border: 1px solid ${colors.naturalGrey};
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
      if (this.plugin.settings.totalPausedTime > 0) {
        pauseSection.createEl("div", {
          text: `Total paused: ${this.plugin.getTotalPausedDisplay()}`,
          attr: {
            style: `
              margin-top: 10px;
              font-family: "Georgia", serif;
              font-size: 12px;
              font-style: italic;
              color: ${colors.naturalGrey};
            `
          }
        });
      }
    }

  }
  /**
   * Render the reward progress section on the dashboard.
   */
  renderRewardSection(wrapper) {
    const settings = this.plugin.settings;
    const rewardProgress = this.plugin.getRewardProgress();
    const tierDisplayNames = {
      micro: "Micro",
      mini: "Mini",
      standard: "Standard",
      quality: "Quality",
      premium: "Premium"
    };
    const rewardSection = wrapper.createDiv({
      cls: "track-habit-rank-reward-section",
      attr: {
        style: `
          margin: 16px 0;
          padding: 16px;
          background: #1a1410;
          border: 1px solid #613134;
        `
      }
    });
    rewardSection.createEl("div", {
      text: `${tierDisplayNames[rewardProgress.rewardTier]} Rewards`,
      attr: {
        style: `
          font-family: "Times New Roman", serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #967b4d;
          margin-bottom: 12px;
        `
      }
    });
    const activityRemaining = rewardProgress.activityThreshold - rewardProgress.activityProgress;
    rewardSection.createEl("div", {
      text: `Next activity reward: ${activityRemaining} more completion${activityRemaining !== 1 ? "s" : ""}`,
      attr: {
        style: `
          font-family: "Georgia", serif;
          font-size: 12px;
          color: #928d85;
          margin-bottom: 4px;
        `
      }
    });
    const streakRemaining = rewardProgress.streakThreshold - rewardProgress.streakProgress;
    rewardSection.createEl("div", {
      text: `Next streak reward: ${streakRemaining} more perfect week${streakRemaining !== 1 ? "s" : ""}`,
      attr: {
        style: `
          font-family: "Georgia", serif;
          font-size: 12px;
          color: #928d85;
          margin-bottom: 8px;
        `
      }
    });
    if (rewardProgress.pendingCount > 0) {
      const pendingBox = rewardSection.createDiv({
        attr: {
          style: `
            margin-top: 8px;
            padding: 10px 12px;
            background: rgba(150, 123, 77, 0.1);
            border: 1px solid #967b4d;
          `
        }
      });
      pendingBox.createEl("div", {
        text: `${rewardProgress.pendingCount} unclaimed reward${rewardProgress.pendingCount !== 1 ? "s" : ""} waiting!`,
        attr: {
          style: `
            font-family: "Times New Roman", serif;
            font-size: 12px;
            color: #967b4d;
          `
        }
      });
    }
    if (canBankRewards(settings.currentTier) && rewardProgress.bankedCount > 0) {
      rewardSection.createEl("div", {
        text: `Banked: ${rewardProgress.bankedCount}/${getMaxBankedRewards()}`,
        attr: {
          style: `
            margin-top: 8px;
            font-family: "Georgia", serif;
            font-size: 12px;
            color: #928d85;
          `
        }
      });
    }
    const viewBtn = rewardSection.createEl("button", {
      text: "View Rewards",
      cls: "track-habit-rank-btn",
      attr: {
        style: `
          margin-top: 12px;
          padding: 10px 16px;
          min-height: 44px;
          background: #1a1410;
          color: #967b4d;
          border: 1px solid #967b4d;
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

  /**
   * Add floating aura particle effects to container
   */
  addAuraParticles(container, color, count = 5) {
    const particleContainer = container.createDiv({
      attr: {
        style: `
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 1;
        `
      }
    });

    for (let i = 0; i < count; i++) {
      particleContainer.createDiv({
        attr: {
          style: `
            position: absolute;
            bottom: ${10 + Math.random() * 20}%;
            left: ${10 + Math.random() * 80}%;
            width: ${1 + Math.random() * 2}px;
            height: ${1 + Math.random() * 2}px;
            background: ${color};
            border-radius: 50%;
            opacity: 0;
            animation: floatUp ${8 + Math.random() * 6}s ${Math.random() * 10}s ease-out infinite;
          `
        }
      });
    }

    // Shimmer sweep — a subtle diagonal light pass across the container
    particleContainer.createDiv({
      attr: {
        style: `
          position: absolute;
          top: 0;
          left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.03) 50%, transparent 60%);
          animation: shimmerSweep 12s 3s ease-in-out infinite;
          pointer-events: none;
        `
      }
    });

    // Ember drift — tiny warm dots drifting sideways (3 extra, very subtle)
    for (let i = 0; i < 3; i++) {
      particleContainer.createDiv({
        attr: {
          style: `
            position: absolute;
            bottom: ${5 + Math.random() * 40}%;
            left: ${Math.random() * 100}%;
            width: 1px;
            height: 1px;
            background: ${color};
            border-radius: 50%;
            opacity: 0;
            animation: emberDrift ${10 + Math.random() * 8}s ${Math.random() * 12}s ease-in-out infinite;
          `
        }
      });
    }

    // Add keyframes if not already present
    if (!document.getElementById('track-habit-rank-particle-styles')) {
      const style = document.createElement('style');
      style.id = 'track-habit-rank-particle-styles';
      style.textContent = `
        @keyframes floatUp {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.4; }
          90% { opacity: 0.4; }
          100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
        }
        @keyframes breathe {
          0%, 100% { box-shadow: inset 0 0 20px rgba(154, 140, 122, 0.03); }
          50% { box-shadow: inset 0 0 40px rgba(154, 140, 122, 0.08); }
        }
        @keyframes shimmerSweep {
          0% { left: -100%; opacity: 0; }
          10% { opacity: 1; }
          50% { left: 200%; opacity: 1; }
          51% { opacity: 0; }
          100% { left: 200%; opacity: 0; }
        }
        @keyframes emberDrift {
          0% { transform: translate(0, 0) scale(1); opacity: 0; }
          15% { opacity: 0.3; }
          50% { transform: translate(30px, -40px) scale(1.5); opacity: 0.25; }
          85% { opacity: 0.15; }
          100% { transform: translate(50px, -80px) scale(0.5); opacity: 0; }
        }
        @keyframes fadeSlideIn {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes borderGlow {
          0%, 100% { border-color: rgba(150, 123, 77, 0.2); }
          50% { border-color: rgba(150, 123, 77, 0.5); }
        }
        @keyframes fireFlicker {
          0%, 100% { transform: scaleY(1) scaleX(1); opacity: 0.7; }
          25% { transform: scaleY(1.3) scaleX(0.85); opacity: 0.5; }
          50% { transform: scaleY(0.8) scaleX(1.15); opacity: 0.8; }
          75% { transform: scaleY(1.1) scaleX(0.9); opacity: 0.55; }
        }
        @keyframes emberFloat {
          0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
          10% { opacity: 0.8; }
          50% { transform: translateY(-60px) translateX(15px) scale(0.6); opacity: 0.5; }
          100% { transform: translateY(-120px) translateX(-10px) scale(0.2); opacity: 0; }
        }
        @keyframes fireGlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Render minimal rough-edge reward rectangles (Activity, Streak, Boss)
   */
  renderRewardBoxes(wrapper, colors) {
    const settings = this.plugin.settings;
    const rewardProgress = this.plugin.getRewardProgress();

    const activityRemaining = rewardProgress.activityThreshold - rewardProgress.activityProgress;
    const streakRemaining = rewardProgress.streakThreshold - rewardProgress.streakProgress;
    const activityClaimable = activityRemaining <= 0;
    const streakClaimable = streakRemaining <= 0;
    const bossPending = (settings.pendingRewards || []).filter(r => r.rewardType === 'boss').length;

    // Get all reward options from the pool for the current tier
    const getPoolOptions = (poolType) => {
      const pools = getRewardPoolsForType(settings, poolType);
      const pool = pools.find(p => p.tier === rewardProgress.rewardTier);
      return pool?.options || [];
    };
    const actOptions = getPoolOptions("activity");
    const strOptions = getPoolOptions("streak");
    const bossOptions = getPoolOptions("boss");

    const container = wrapper.createDiv({
      attr: {
        style: `
          display: flex;
          gap: 6px;
          justify-content: center;
          margin: 12px auto;
          max-width: 360px;
          z-index: 1;
          position: relative;
          animation: fadeSlideIn 0.5s 0.3s ease-out both;
        `
      }
    });

    // Create rough-edge reward box helper
    const createRewardBox = (parent, { title, current, total, remaining, isClaimable, type, subtitle, poolOptions }) => {
      const box = parent.createDiv({
        attr: {
          style: `
            flex: 1;
            padding: 10px 8px 8px;
            background: rgba(26, 20, 16, 0.7);
            border: 1px solid ${isClaimable ? colors.leather : colors.buccaneer};
            box-shadow: 1px 0 0 ${colors.buccaneer}, -1px 0 0 ${colors.buccaneer}, 0 1px 0 ${colors.buccaneer}, 0 -1px 0 ${colors.buccaneer}, 2px 2px 0 rgba(97, 49, 52, 0.3), -1px -1px 0 rgba(97, 49, 52, 0.2);
            cursor: pointer;
            transition: border-color 0.2s ease, transform 0.15s ease;
            text-align: center;
            min-height: 90px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          `
        }
      });

      // Icon slot — fixed 24x24, shows image or emoji
      const iconSlot = box.createDiv({
        attr: { style: "width: 24px; height: 24px; margin-bottom: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;" }
      });

      let previewIndex = 0;
      const renderIcon = (idx) => {
        iconSlot.empty();
        if (!poolOptions || poolOptions.length === 0) return;
        const opt = poolOptions[idx % poolOptions.length];
        const opacityStyle = isClaimable ? '1' : '0.5';
        const filterStyle = isClaimable ? 'none' : 'grayscale(0.5)';
        if (opt.image) {
          let resolvedImg = opt.image;
          if (!opt.image.startsWith('http://') && !opt.image.startsWith('https://') && !opt.image.startsWith('data:')) {
            try { resolvedImg = this.plugin.app.vault.adapter.getResourcePath(opt.image); } catch (e) {}
          }
          const rwdImg = iconSlot.createEl("img", {
            attr: {
              src: resolvedImg,
              style: `width: 24px; height: 24px; object-fit: cover; border-radius: 50%; opacity: ${opacityStyle}; filter: ${filterStyle};`
            }
          });
          rwdImg.onerror = () => {
            rwdImg.remove();
            if (opt.emoji) iconSlot.createEl("span", {
              text: opt.emoji,
              attr: { style: `font-size: 18px; line-height: 24px; opacity: ${opacityStyle};` }
            });
          };
        } else if (opt.emoji) {
          iconSlot.createEl("span", {
            text: opt.emoji,
            attr: { style: `font-size: 18px; line-height: 24px; opacity: ${opacityStyle};` }
          });
        }
      };
      renderIcon(0);

      // Title
      box.createEl("div", {
        text: title.toUpperCase(),
        attr: {
          style: `
            font-family: "Times New Roman", serif;
            font-size: 9px;
            font-weight: 600;
            letter-spacing: 2px;
            color: ${colors.naturalGrey};
            margin-bottom: 3px;
          `
        }
      });

      // Progress / Claim
      const progressEl = box.createEl("div", {
        text: isClaimable ? "CLAIM" : subtitle || `${current}/${total}`,
        attr: {
          style: `
            font-family: "Georgia", serif;
            font-size: 12px;
            font-weight: 600;
            color: ${isClaimable ? colors.leather : colors.peachYellow};
            margin-bottom: 2px;
          `
        }
      });

      // Remaining
      if (!isClaimable && remaining !== undefined) {
        box.createEl("div", {
          text: `${remaining} to go`,
          attr: {
            style: `
              font-family: "Georgia", serif;
              font-size: 8px;
              color: ${colors.naturalGrey};
              opacity: 0.7;
            `
          }
        });
      }

      // Dots indicator
      if (poolOptions && poolOptions.length > 1) {
        const dots = box.createDiv({ attr: { style: "margin-top: 3px;" } });
        const updateDots = (idx) => {
          dots.empty();
          for (let i = 0; i < poolOptions.length; i++) {
            dots.createEl("span", {
              text: "\u2022",
              attr: { style: `font-size: 7px; color: ${i === idx % poolOptions.length ? colors.leather : colors.naturalGrey}; margin: 0 1px; opacity: ${i === idx % poolOptions.length ? '1' : '0.3'};` }
            });
          }
        };
        updateDots(0);

        // Click cycles icon + dots
        box.onclick = async (e) => {
          if (isClaimable && e.target === progressEl) {
            const pendingReward = settings.pendingRewards?.find(r => r.rewardType === type);
            if (pendingReward) {
              new RewardSelectionModal(this.plugin.app, this.plugin, pendingReward, () => {
                this.plugin.refreshRankView();
              }).open();
            }
            return;
          }
          previewIndex++;
          renderIcon(previewIndex);
          updateDots(previewIndex);
        };
      } else {
        // Single or no options — click claims or shows notice
        box.onclick = async () => {
          if (isClaimable) {
            const pendingReward = settings.pendingRewards?.find(r => r.rewardType === type);
            if (pendingReward) {
              new RewardSelectionModal(this.plugin.app, this.plugin, pendingReward, () => {
                this.plugin.refreshRankView();
              }).open();
            }
          }
        };
      }
    };

    createRewardBox(container, {
      title: 'Activity',
      current: rewardProgress.activityProgress,
      total: rewardProgress.activityThreshold,
      remaining: activityRemaining,
      isClaimable: activityClaimable,
      type: 'activity',
      poolOptions: actOptions
    });

    createRewardBox(container, {
      title: 'Streak',
      current: rewardProgress.streakProgress,
      total: rewardProgress.streakThreshold,
      remaining: streakRemaining,
      isClaimable: streakClaimable,
      type: 'streak',
      poolOptions: strOptions
    });

    createRewardBox(container, {
      title: 'Boss',
      current: 0,
      total: 1,
      remaining: undefined,
      isClaimable: bossPending > 0,
      type: 'boss',
      subtitle: bossPending > 0 ? `${bossPending} LOOT` : 'Defeat boss',
      poolOptions: bossOptions
    });

    // Unclaimed rewards chest
    this.renderUnclaimedRewardsBox(wrapper, colors);
  }

  /**
   * Render a separate unclaimed rewards box showing all pending rewards
   */
  renderUnclaimedRewardsBox(wrapper, colors) {
    const settings = this.plugin.settings;
    const pending = settings.pendingRewards || [];
    if (pending.length === 0) return;

    const box = wrapper.createDiv({
      attr: {
        style: `
          margin: 8px auto;
          max-width: 360px;
          padding: 10px 14px;
          background: rgba(26, 20, 16, 0.8);
          border: 1px solid ${colors.leather};
          box-shadow: 1px 0 0 ${colors.buccaneer}, -1px 0 0 ${colors.buccaneer}, 0 1px 0 ${colors.buccaneer}, 0 -1px 0 ${colors.buccaneer}, 2px 2px 0 rgba(97, 49, 52, 0.3);
          z-index: 1;
          position: relative;
        `
      }
    });

    box.createEl("div", {
      text: "UNCLAIMED REWARDS",
      attr: {
        style: `
          font-family: "Times New Roman", serif;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 2px;
          color: ${colors.leather};
          margin-bottom: 6px;
        `
      }
    });

    const typeLabels = { activity: 'Activity', streak: 'Streak', boss: 'Boss' };
    const list = box.createDiv({ attr: { style: "display: flex; flex-wrap: wrap; gap: 6px;" } });

    pending.forEach((reward) => {
      const expiresAt = new Date(reward.expiresAt);
      const now = new Date(getEffectiveNow(settings));
      const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1e3));
      const urgent = daysLeft <= 2;

      const chip = list.createDiv({
        attr: {
          style: `
            padding: 4px 8px;
            background: ${urgent ? `rgba(150, 123, 77, 0.15)` : `rgba(26, 20, 16, 0.5)`};
            border: 1px solid ${urgent ? colors.leather : colors.buccaneer};
            cursor: pointer;
            transition: border-color 0.2s ease;
          `
        }
      });

      chip.createEl("span", {
        text: `${typeLabels[reward.rewardType] || 'Reward'} \u2022 ${reward.rewardTier}`,
        attr: {
          style: `
            font-family: "Georgia", serif;
            font-size: 10px;
            color: ${colors.peachYellow};
          `
        }
      });

      chip.createEl("span", {
        text: ` (${daysLeft}d)`,
        attr: {
          style: `
            font-family: "Georgia", serif;
            font-size: 9px;
            color: ${urgent ? colors.leather : colors.naturalGrey};
          `
        }
      });

      chip.onclick = () => {
        new RewardSelectionModal(this.plugin.app, this.plugin, reward, () => {
          this.plugin.refreshRankView();
        }).open();
      };
    });
  }

  /**
   * Create a center-focused reward card
   */
  createCenterCard(container, { emoji, image, name, effect, isEarned, isLocked }, isCenter, colors, onClick) {
    const card = container.createDiv({
      cls: `center-card ${isCenter ? 'center' : 'side'} ${isEarned ? 'earned' : ''} ${isLocked ? 'locked' : ''}`,
      attr: {
        style: `
          width: ${isCenter ? '110px' : '90px'};
          height: ${isCenter ? '140px' : '120px'};
          background: ${colors.bgLight};
          border: 1px solid ${isEarned ? colors.gold : colors.greenBorder};
          display: flex;
          flex-direction: column;
          cursor: pointer;
          overflow: hidden;
          position: relative;
        `
      }
    });

    // Top section - image or emoji
    const imageSection = card.createDiv({
      attr: {
        style: `
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(180deg, ${colors.bgLight} 0%, ${colors.bg} 100%);
          position: relative;
        `
      }
    });

    if (image) {
      const img = imageSection.createEl("img", {
        attr: {
          src: image,
          alt: name,
          style: `max-width: ${isCenter ? '60px' : '45px'}; max-height: ${isCenter ? '55px' : '40px'}; object-fit: contain;`
        }
      });
      img.onerror = () => {
        img.remove();
        imageSection.createEl("div", { text: emoji, attr: { style: `font-size: ${isCenter ? '36px' : '28px'};` } });
      };
    } else {
      imageSection.createEl("div", { text: emoji, attr: { style: `font-size: ${isCenter ? '36px' : '28px'};` } });
    }

    // Lock icon for locked cards
    if (isLocked) {
      imageSection.createEl("div", {
        text: "🔒",
        attr: {
          style: `
            position: absolute;
            top: 4px;
            right: 4px;
            font-size: ${isCenter ? '14px' : '10px'};
            opacity: 0.6;
          `
        }
      });
    }

    // Rune shimmer for earned cards
    if (isEarned) {
      const shimmer = card.createDiv({
        attr: {
          style: `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, ${colors.gold}, transparent);
            animation: runeShimmer 2s ease-in-out infinite;
          `
        }
      });
    }

    // Text section
    const textSection = card.createDiv({
      attr: {
        style: `
          padding: ${isCenter ? '8px' : '6px'};
          background: ${colors.bg};
          border-top: 1px solid ${colors.greenBorder};
        `
      }
    });

    textSection.createEl("div", {
      text: name.length > (isCenter ? 16 : 12) ? name.substring(0, isCenter ? 14 : 10) + "..." : name,
      attr: {
        style: `
          font-family: "Georgia", serif;
          font-size: ${isCenter ? '10px' : '8px'};
          color: ${isLocked ? colors.textMuted : colors.text};
          margin-bottom: 2px;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        `
      }
    });

    textSection.createEl("div", {
      text: effect,
      attr: {
        style: `
          font-family: "Georgia", serif;
          font-size: ${isCenter ? '9px' : '7px'};
          color: ${isEarned ? colors.gold : colors.textMuted};
          opacity: 0.8;
        `
      }
    });

    card.onclick = onClick;
    return card;
  }

  // Legacy method kept for compatibility
  createRewardCard(container, { emoji, image, name, effect, isEarned, isLocked, colors }, onClick) {
    return this.createCenterCard(container, { emoji, image, name, effect, isEarned, isLocked }, true, colors, onClick);
  }

  /**
   * @deprecated Use createCenterCard instead
   */
  _legacyCreateRewardCard(container, { emoji, image, name, effect, isEarned, isLocked, colors }, onClick) {
    const card = container.createDiv({
      cls: `reward-card ${isEarned ? 'earned' : ''} ${isLocked ? 'locked' : ''}`,
      attr: {
        style: `
          width: 100px;
          height: 130px;
          background: ${colors.bgLight};
          border: 1px solid ${isEarned ? colors.gold : colors.greenBorder};
          display: flex;
          flex-direction: column;
          cursor: pointer;
          overflow: hidden;
          position: relative;
        `
      }
    });

    // Top half - image or emoji
    const imageSection = card.createDiv({
      attr: {
        style: `
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(180deg, ${colors.bgLight} 0%, ${colors.bg} 100%);
          position: relative;
          overflow: hidden;
        `
      }
    });

    if (image) {
      const img = imageSection.createEl("img", {
        attr: {
          src: image,
          alt: name,
          style: `
            max-width: 60px;
            max-height: 50px;
            object-fit: contain;
          `
        }
      });
      img.onerror = () => {
        img.remove();
        imageSection.createEl("div", {
          text: emoji,
          attr: { style: "font-size: 32px;" }
        });
      };
    } else {
      imageSection.createEl("div", {
        text: emoji,
        attr: { style: "font-size: 32px;" }
      });
    }

    // Lock icon overlay for locked cards
    if (isLocked) {
      imageSection.createEl("div", {
        text: "🔒",
        attr: {
          style: `
            position: absolute;
            top: 4px;
            right: 4px;
            font-size: 12px;
            opacity: 0.7;
          `
        }
      });
    }

    // Shine effect for earned cards
    if (isEarned) {
      card.createDiv({
        attr: {
          style: `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%);
            background-size: 200% 100%;
            animation: cardShine 3s ease-in-out infinite;
            pointer-events: none;
          `
        }
      });
    }

    // Bottom half - name and effect
    const textSection = card.createDiv({
      attr: {
        style: `
          padding: 8px 6px;
          background: ${colors.bg};
          border-top: 1px solid ${colors.greenBorder};
        `
      }
    });

    textSection.createEl("div", {
      text: name.length > 18 ? name.substring(0, 16) + "..." : name,
      attr: {
        style: `
          font-family: "Georgia", serif;
          font-size: 9px;
          color: ${isLocked ? colors.textMuted : colors.text};
          margin-bottom: 2px;
          line-height: 1.2;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        `
      }
    });

    textSection.createEl("div", {
      text: effect,
      attr: {
        style: `
          font-family: "Georgia", serif;
          font-size: 8px;
          color: ${isEarned ? colors.gold : colors.textMuted};
          opacity: 0.8;
        `
      }
    });

    card.onclick = onClick;
    return card;
  }

  /**
   * Render death threshold monitor - calm and advisory
   */
  renderDeathThresholdMonitor(wrapper, colors) {
    const settings = this.plugin.settings;
    const allActivities = [
      ...getEffectiveActivities(settings).filter((a) => settings.enabledActivities[a._originalName] ?? true),
      ...settings.customHabits.filter((h) => h.enabled)
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
      completions.forEach((c) => {
        if (!c.completed) return;
        const date = new Date(c.date);
        date.setHours(0, 0, 0, 0);
        if (date >= startDate && date <= today) {
          totalCompletions++;
        }
      });
    }

    const isInDanger = totalCompletions < requiredCompletions;
    const activitiesNeeded = requiredCompletions - totalCompletions;

    if (!isInDanger) return; // Don't show if safe

    const monitorBox = wrapper.createDiv({
      attr: {
        style: `
          margin: 16px 0;
          padding: 12px 16px;
          background: ${colors.bgLight};
          border: 1px solid ${colors.goldBorder};
          opacity: 0.9;
        `
      }
    });

    // Calm, advisory header
    monitorBox.createEl("div", {
      text: "Activity Advisory",
      attr: {
        style: `
          font-family: "Times New Roman", serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: ${colors.goldMuted};
          margin-bottom: 6px;
        `
      }
    });

    // Advisory message - not punitive
    const message = activitiesNeeded === 1
      ? "One more activity will restore balance."
      : `${activitiesNeeded} activities will restore balance.`;

    monitorBox.createEl("div", {
      text: message,
      attr: {
        style: `
          font-family: "Georgia", serif;
          font-size: 12px;
          font-style: italic;
          color: ${colors.textMuted};
          line-height: 1.4;
        `
      }
    });

    // Subtle progress indicator
    monitorBox.createEl("div", {
      text: `${totalCompletions}/${requiredCompletions} (3-day minimum)`,
      attr: {
        style: `
          font-family: "Georgia", serif;
          font-size: 10px;
          color: ${colors.goldMuted};
          margin-top: 6px;
          opacity: 0.8;
        `
      }
    });
  }

  /**
   * Render activity radar - subtle and atmospheric
   */
  renderActivityRadar(wrapper, colors) {
    const settings = this.plugin.settings;
    const allActivities = [
      ...getEffectiveActivities(settings).filter((a) => settings.enabledActivities[a._originalName] ?? true),
      ...settings.customHabits.filter((h) => h.enabled)
    ];

    if (allActivities.length === 0) return;

    const radarContainer = wrapper.createDiv({
      attr: {
        style: `
          margin: 20px 0 16px 0;
          padding: 16px;
          background: ${colors.bgLight};
          border: 1px solid ${colors.greenBorder};
          opacity: 0.85;
        `
      }
    });

    radarContainer.createEl("div", {
      text: "Activity Pulse",
      attr: {
        style: `
          font-family: "Times New Roman", serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: ${colors.greenMuted};
          margin-bottom: 12px;
          opacity: 0.8;
        `
      }
    });

    // Create simple radar dots
    const dotsContainer = radarContainer.createDiv({
      attr: {
        style: `
          display: flex;
          justify-content: center;
          gap: 4px;
          flex-wrap: wrap;
        `
      }
    });

    const effectiveNow = getEffectiveNow(settings);
    const today = new Date(effectiveNow);
    today.setHours(0, 0, 0, 0);

    // Get today's status for each activity
    allActivities.forEach((activity) => {
      const completions = getCompletionsFromFolder(this.app, activity.folder, activity.field);

      // Check if completed today
      const completedToday = completions.some((c) => {
        if (!c.completed) return false;
        const date = new Date(c.date);
        date.setHours(0, 0, 0, 0);
        return date.getTime() === today.getTime();
      });

      // Get days since last completion
      const completedDates = completions
        .filter((c) => c.completed)
        .map((c) => new Date(c.date))
        .sort((a, b) => b.getTime() - a.getTime());

      let daysSince = 999;
      if (completedDates.length > 0) {
        const lastDate = completedDates[0];
        lastDate.setHours(0, 0, 0, 0);
        daysSince = Math.floor((today.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000));
      }

      // Determine dot color and opacity
      let dotColor = colors.greenMuted;
      let dotOpacity = "0.3";

      if (completedToday) {
        dotColor = colors.gold;
        dotOpacity = "1";
      } else if (daysSince <= 1) {
        dotColor = colors.green;
        dotOpacity = "0.7";
      } else if (daysSince >= 3) {
        dotColor = colors.dangerMuted;
        dotOpacity = "0.6";
      }

      const dot = dotsContainer.createDiv({
        attr: {
          title: `${activity.name}: ${completedToday ? 'Done today' : daysSince === 0 ? 'Done today' : daysSince + 'd ago'}`,
          style: `
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: ${dotColor};
            opacity: ${dotOpacity};
            transition: all 0.3s ease;
          `
        }
      });
    });

    // Legend
    radarContainer.createEl("div", {
      text: `${allActivities.length} tracked`,
      attr: {
        style: `
          font-family: "Georgia", serif;
          font-size: 9px;
          color: ${colors.textMuted};
          margin-top: 8px;
          opacity: 0.6;
        `
      }
    });
  }
};
var PenanceModal = class extends import_obsidian.Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
  }
  onOpen() {
    const { contentEl } = this;
    const settings = this.plugin.settings;
    contentEl.empty();
    new import_obsidian.Setting(contentEl).setName("Tartarus Penance Tasks").setHeading();
    contentEl.createEl("p", {
      text: "Complete the required tasks to escape Tartarus and resume your journey.",
      attr: {
        style: `
          margin-bottom: 16px;
          font-family: "Georgia", serif;
          font-size: 13px;
          font-style: italic;
          color: #928d85;
        `
      }
    });
    contentEl.createEl("div", {
      text: `\u{1F48E} Available Discipline Tokens: ${settings.disciplineTokens}/3`,
      attr: {
        style: `
          margin-bottom: 16px;
          padding: 12px 16px;
          background: #1a1410;
          border: 1px solid #613134;
          font-family: "Times New Roman", serif;
          font-size: 14px;
          letter-spacing: 0.5px;
          color: #967b4d;
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
            background: #967b4d;
            color: #1a1410;
            border: 1px solid #967b4d;
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
        settings.hadesWrathApplied = false;
        await this.plugin.saveSettings();
        this.plugin.refreshRankView();
        new import_obsidian.Notice("You have escaped Tartarus using 3 discipline tokens!");
        this.close();
      };
    }
    if (settings.tartarusPenanceTasks.length === 0) {
      settings.tartarusPenanceTasks = getPenanceTasksForTier(settings.currentTier, settings);
    }
    const baseRequired = settings.currentTier <= 4 ? 3 : settings.currentTier <= 9 ? 4 : 5;
    const requiredTasks = settings.hadesWrathApplied ? settings.tartarusPenanceTasks.length : baseRequired;
    contentEl.createEl("div", {
      text: `Complete ${requiredTasks} tasks to escape Tartarus`,
      attr: {
        style: `
          margin-bottom: 16px;
          font-family: "Times New Roman", serif;
          font-size: 13px;
          letter-spacing: 1px;
          color: #967b4d;
        `
      }
    });
    settings.tartarusPenanceTasks.forEach((task, index) => {
      const taskBox = contentEl.createDiv({
        attr: {
          style: `
            margin-bottom: 12px;
            padding: 16px;
            border: 1px solid ${task.completed ? "#967b4d" : "#613134"};
            background: ${task.completed ? "rgba(150, 123, 77, 0.1)" : "#1a1410"};
          `
        }
      });
      new import_obsidian.Setting(taskBox).setName(task.description).addToggle(
        (toggle) => toggle.setValue(task.completed).onChange(async (value) => {
          task.completed = value;
          await this.plugin.saveSettings();
          this.onOpen();
        })
      );
      if (!task.completed && settings.disciplineTokens > 0) {
        const skipBtn = taskBox.createEl("button", {
          text: "Spend 1 Token to Skip",
          cls: "track-habit-rank-btn",
          attr: {
            style: `
              margin-top: 12px;
              padding: 10px 16px;
              min-height: 44px;
              background: #1a1410;
              border: 1px solid #928d85;
              color: #928d85;
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
          new import_obsidian.Notice("Task skipped using 1 discipline token");
        };
      }
    });
    const completedCount = settings.tartarusPenanceTasks.filter((t) => t.completed).length;
    const effectiveNow = getEffectiveNow(settings);
    const daysInTartarus = settings.tartarusStartDate ? Math.floor((effectiveNow.getTime() - new Date(settings.tartarusStartDate).getTime()) / (24 * 60 * 60 * 1e3)) : 0;
    if (settings.systemState === "paused") {
      contentEl.createEl("div", {
        text: "\u23F8\uFE0F SYSTEM PAUSED - Hades Wrath timer is frozen",
        cls: "track-habit-rank-warning",
        attr: {
          style: `
            margin: 16px 0;
            padding: 16px 20px;
            background: #1a1410;
            border: 1px solid #928d85;
            color: #928d85;
            font-family: "Times New Roman", serif;
            font-size: 12px;
            letter-spacing: 1px;
            text-transform: uppercase;
            text-align: center;
          `
        }
      });
    }
    if (!settings.hadesWrathApplied && daysInTartarus >= 2 && completedCount < requiredTasks && settings.systemState !== "paused") {
      contentEl.createEl("div", {
        text: `\u26A0\uFE0F HADES WRATH in ${3 - daysInTartarus} day(s)! Complete tasks or they will DOUBLE!`,
        cls: "track-habit-rank-warning",
        attr: {
          style: `
            margin: 16px 0;
            padding: 16px 20px;
            background: #1a1410;
            border: 1px solid #967b4d;
            color: #967b4d;
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
        text: "\u26A1 HADES WRATH ACTIVE - Tasks have been doubled!",
        cls: "track-habit-rank-warning",
        attr: {
          style: `
            margin: 16px 0;
            padding: 16px 20px;
            background: #1a1410;
            border: 1px solid #613134;
            color: #613134;
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
            background: #967b4d;
            color: #1a1410;
            border: 1px solid #967b4d;
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
        settings.hadesWrathApplied = false;
        await this.plugin.saveSettings();
        this.plugin.refreshRankView();
        new import_obsidian.Notice("You have escaped Tartarus! The boss awaits...");
        this.close();
      };
    } else {
      contentEl.createEl("div", {
        text: `Need: ${requiredTasks - completedCount} more task(s) to escape`,
        attr: {
          style: `
            margin-top: 20px;
            padding: 12px 16px;
            background: #1a1410;
            border: 1px solid rgba(97, 49, 52, 0.4);
            text-align: center;
            font-family: "Times New Roman", serif;
            font-size: 13px;
            letter-spacing: 0.5px;
            color: #613134;
          `
        }
      });
    }
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
};
var MorpheusModal = class extends import_obsidian.Modal {
  constructor(app, plugin) {
    super(app);
    this.directive = null;
    this.plugin = plugin;
  }
  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.directive = await getMorpheusDirective(this.app, this.plugin.settings);
    this.plugin.settings.lastMorpheusSummon = todayISO();
    this.plugin.settings.lastQuoteShown = this.directive.quote;
    await this.plugin.saveSettings();
    contentEl.style.cssText = `
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 30px;
      text-align: center;
      background: linear-gradient(180deg, #1a1410 0%, #1a1410 100%);
      border: 2px solid #613134;
      position: relative;
    `;
    const greeting = getGreeting(this.plugin.settings, "Valantis");
    const greetingEl = contentEl.createEl("div", {
      text: greeting,
      attr: {
        style: `
          font-size: 1.1em;
          color: #967b4d;
          margin-bottom: 30px;
          font-family: "Georgia", serif;
          letter-spacing: 0.5px;
        `
      }
    });
    contentEl.createEl("div", {
      attr: {
        style: `
          width: 80%;
          height: 1px;
          background: linear-gradient(90deg, transparent, #613134, transparent);
          margin: 0 auto 30px auto;
        `
      }
    });
    contentEl.createEl("div", {
      text: "THE DIRECTIVE",
      attr: {
        style: `
          font-size: 0.75em;
          letter-spacing: 0.3em;
          color: #928d85;
          margin-bottom: 20px;
          text-transform: uppercase;
          font-family: "Times New Roman", serif;
        `
      }
    });
    const activityEl = contentEl.createEl("div", {
      text: this.directive.activity,
      attr: {
        style: `
          font-size: 2em;
          font-weight: 700;
          color: #967b4d;
          margin-bottom: 16px;
          font-family: "Times New Roman", serif;
          text-transform: uppercase;
          letter-spacing: 2px;
        `
      }
    });
    contentEl.createEl("div", {
      text: this.directive.reason,
      attr: {
        style: `
          font-size: 1.1em;
          color: #928d85;
          margin-bottom: 12px;
          font-family: "Georgia", serif;
          font-style: italic;
        `
      }
    });
    contentEl.createEl("div", {
      text: this.directive.mythContext,
      attr: {
        style: `
          font-size: 0.95em;
          color: #928d85;
          margin-bottom: 30px;
          line-height: 1.6;
          font-family: "Georgia", serif;
          font-style: italic;
        `
      }
    });
    contentEl.createEl("div", {
      attr: {
        style: `
          width: 80%;
          height: 1px;
          background: linear-gradient(90deg, transparent, #613134, transparent);
          margin: 0 auto 30px auto;
        `
      }
    });
    const boss = getCustomizedBossForTier(this.plugin.settings.currentTier, this.plugin.settings);
    const bossHPPercent = Math.round(this.plugin.settings.bossCurrentHP / this.plugin.settings.bossMaxHP * 100);
    if (boss) {
      contentEl.createEl("div", {
        text: `${boss.name} \u2014 ${this.plugin.settings.bossCurrentHP}/${this.plugin.settings.bossMaxHP} HP (${bossHPPercent}%)`,
        attr: {
          style: `
            font-size: 0.85em;
            color: #928d85;
            margin-bottom: 20px;
            font-family: "Times New Roman", serif;
            letter-spacing: 1px;
          `
        }
      });
    }
    contentEl.createEl("div", {
      attr: {
        style: `
          width: 80%;
          height: 1px;
          background: linear-gradient(90deg, transparent, #613134, transparent);
          margin: 0 auto 30px auto;
        `
      }
    });
    const quoteEl = contentEl.createEl("blockquote", {
      text: this.directive.quote,
      attr: {
        style: `
          font-size: 0.9em;
          color: #967b4d;
          font-style: italic;
          font-family: "Georgia", serif;
          line-height: 1.6;
          border-left: 2px solid #613134;
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
};
var TempleModal = class extends import_obsidian.Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    new import_obsidian.Setting(contentEl).setName("Temple Upkeep").setDesc("Maintenance tasks for the vessel").setHeading();
    const settings = this.plugin.settings;
    if (settings.templeTasks.length === 0) {
      settings.templeTasks = DEFAULT_SETTINGS.templeTasks;
    }
    settings.templeTasks.forEach((task) => {
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
      new import_obsidian.Setting(taskBox).setName(`${task.emoji} ${task.name}`).setDesc(`${statusEmoji} ${status} \u2014 Every ${task.intervalDays} day${task.intervalDays > 1 ? "s" : ""}`).addButton(
        (btn) => btn.setButtonText("Mark Complete").onClick(async () => {
          task.lastCompleted = todayISO();
          await this.plugin.saveSettings();
          this.onOpen();
          new import_obsidian.Notice(`${task.name} marked complete`);
        })
      );
    });
  }
  getTaskStatus(task) {
    if (!task.lastCompleted) return "Never completed";
    const lastDate = new Date(task.lastCompleted);
    const today = new Date(getEffectiveNow(this.plugin.settings));
    today.setHours(0, 0, 0, 0);
    lastDate.setHours(0, 0, 0, 0);
    const daysSince = Math.floor((today.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1e3));
    if (daysSince === 0) return "Completed today";
    if (daysSince < task.intervalDays) return `Fresh (${daysSince}d ago)`;
    if (daysSince === task.intervalDays) return "Due today";
    return `Overdue (${daysSince}d ago)`;
  }
  getTaskStatusEmoji(status) {
    if (status.includes("today")) return "\u2713";
    if (status.includes("Fresh")) return "\u2713";
    if (status.includes("Due")) return "\u26A0\uFE0F";
    if (status.includes("Overdue")) return "\u2757";
    return "\u25CB";
  }
  getTaskStatusColor(task) {
    const status = this.getTaskStatus(task);
    if (status.includes("Overdue")) return "rgba(97, 49, 52, 0.1)";
    if (status.includes("Due")) return "rgba(150, 123, 77, 0.1)";
    if (status.includes("Fresh") || status.includes("today")) return "rgba(150, 123, 77, 0.1)";
    return "transparent";
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
};
var RewardSelectionModal = class extends import_obsidian.Modal {
  constructor(app, plugin, pendingReward, onComplete) {
    super(app);
    this.plugin = plugin;
    this.pendingReward = pendingReward;
    this.onComplete = onComplete;
  }
  onOpen() {
    const { contentEl } = this;
    const settings = this.plugin.settings;
    contentEl.empty();
    const pools = getRewardPoolsForType(settings, this.pendingReward.rewardType);
    const pool = pools.find((p) => p.tier === this.pendingReward.rewardTier);
    const options = pool?.options || [];
    const tierDisplayNames = {
      micro: "Micro",
      mini: "Mini",
      standard: "Standard",
      quality: "Quality",
      premium: "Premium"
    };
    const typeDisplayNames = {
      activity: "Activity",
      boss: "Boss",
      streak: "Streak"
    };
    new import_obsidian.Setting(contentEl).setName(`${tierDisplayNames[this.pendingReward.rewardTier]} Reward Earned!`).setDesc(`${typeDisplayNames[this.pendingReward.rewardType]} milestone reached`).setHeading();
    const expiresAt = new Date(this.pendingReward.expiresAt);
    const now = new Date(getEffectiveNow(settings));
    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1e3));
    contentEl.createEl("div", {
      text: `Expires in ${daysLeft} days - claim now or bank it!`,
      attr: {
        style: `
          margin-bottom: 16px;
          padding: 12px 16px;
          background: #1a1410;
          border: 1px solid ${daysLeft <= 2 ? "#967b4d" : "#613134"};
          font-family: "Georgia", serif;
          font-size: 13px;
          font-style: italic;
          color: ${daysLeft <= 2 ? "#967b4d" : "#928d85"};
        `
      }
    });
    contentEl.createEl("div", {
      text: "Choose one reward:",
      attr: {
        style: `
          margin-bottom: 12px;
          font-family: "Times New Roman", serif;
          font-size: 14px;
          letter-spacing: 0.5px;
          color: #967b4d;
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
            background: #1a1410;
            border: 1px solid rgba(97, 49, 52, 0.4);
            font-family: "Georgia", serif;
            font-size: 13px;
            color: #613134;
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
              border: 1px solid #613134;
              background: #1a1410;
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
              color: #faddb3;
            `
          }
        });
        optionBox.onmouseenter = () => {
          optionBox.style.borderColor = "#967b4d";
          optionBox.style.background = "rgba(150, 123, 77, 0.1)";
        };
        optionBox.onmouseleave = () => {
          optionBox.style.borderColor = "#613134";
          optionBox.style.background = "#1a1410";
        };
        optionBox.onclick = async () => {
          await this.claimReward(option);
        };
      });
    }
    if (canBankRewards(settings.currentTier)) {
      const bankedCount = settings.bankedRewards.length;
      const maxBanked = getMaxBankedRewards();
      if (bankedCount < maxBanked) {
        const bankSection = contentEl.createDiv({
          attr: {
            style: `
              margin-top: 20px;
              padding-top: 16px;
              border-top: 1px solid #613134;
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
              color: #928d85;
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
              background: #1a1410;
              color: #928d85;
              border: 1px solid #928d85;
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
              background: #1a1410;
              border: 1px solid rgba(146, 141, 133, 0.3);
              font-family: "Times New Roman", serif;
              font-size: 12px;
              color: #928d85;
              text-align: center;
            `
          }
        });
      }
    }
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
          color: #928d85;
          border: 1px solid #613134;
          cursor: pointer;
          font-family: "Times New Roman", serif;
          font-size: 11px;
          letter-spacing: 1px;
          text-transform: uppercase;
        `
      }
    }).onclick = () => this.close();
  }
  async claimReward(option) {
    const settings = this.plugin.settings;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const claimed = {
      id: `claimed-${Date.now()}`,
      selectedOptionId: option.id,
      description: option.description,
      emoji: option.emoji || "",
      image: option.image || "",
      rewardTier: this.pendingReward.rewardTier,
      rewardType: this.pendingReward.rewardType,
      claimedAt: now,
      earnedAt: this.pendingReward.earnedAt,
      expiresAt: this.pendingReward.expiresAt,
      used: false
    };
    settings.claimedRewards.push(claimed);
    settings.pendingRewards = settings.pendingRewards.filter((r) => r.id !== this.pendingReward.id);
    await this.plugin.saveSettings();
    this.plugin.refreshRankView();
    new import_obsidian.Notice(`Reward claimed: ${option.description}`);
    this.onComplete();
    this.close();
  }
  async bankReward() {
    const settings = this.plugin.settings;
    const banked = {
      id: `banked-${Date.now()}`,
      rewardTier: this.pendingReward.rewardTier,
      rewardType: this.pendingReward.rewardType,
      bankedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    settings.bankedRewards.push(banked);
    settings.pendingRewards = settings.pendingRewards.filter((r) => r.id !== this.pendingReward.id);
    await this.plugin.saveSettings();
    this.plugin.refreshRankView();
    new import_obsidian.Notice(`Reward banked for later (${settings.bankedRewards.length}/${getMaxBankedRewards()})`);
    this.onComplete();
    this.close();
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
};
var BossRewardModal = class extends import_obsidian.Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
  }

  onOpen() {
    const { contentEl } = this;
    const settings = this.plugin.settings;
    contentEl.empty();

    contentEl.style.maxWidth = "360px";
    contentEl.style.background = "#1a1410";
    contentEl.style.padding = "24px";
    contentEl.style.borderRadius = "12px";

    const rewardProgress = this.plugin.getRewardProgress();
    const bossPools = getRewardPoolsForType(settings, "boss");
    const currentPool = bossPools.find(p => p.tier === rewardProgress.rewardTier);
    const bossRewards = currentPool?.options || [];

    // Header
    contentEl.createEl("div", {
      text: "Boss Reward",
      attr: {
        style: `
          font-family: "Times New Roman", serif;
          font-size: 16px;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #c9a227;
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(201, 162, 39, 0.3);
        `
      }
    });

    // Check if boss reward is available
    const bossDefeated = settings.bossCurrentHP <= 0;
    const pendingBossReward = settings.pendingRewards?.find(r => r.rewardType === 'boss');

    if (pendingBossReward || bossDefeated) {
      // Show claimable boss reward
      const rewardOption = bossRewards[0] || { emoji: '👑', description: 'Boss Defeated Reward' };

      const rewardCard = contentEl.createDiv({
        attr: {
          style: `
            background: linear-gradient(160deg, #22201c 0%, #181614 100%);
            border: 2px solid rgba(201, 162, 39, 0.5);
            border-radius: 8px;
            padding: 24px;
            text-align: center;
            margin-bottom: 16px;
          `
        }
      });

      if (rewardOption.image) {
        const img = rewardCard.createEl("img", {
          attr: {
            src: rewardOption.image,
            style: "max-width: 80px; max-height: 80px; margin-bottom: 12px; border-radius: 8px;"
          }
        });
        img.onerror = () => {
          img.remove();
          rewardCard.createEl("div", { text: rewardOption.emoji || '👑', attr: { style: "font-size: 48px; margin-bottom: 12px;" } });
        };
      } else {
        rewardCard.createEl("div", {
          text: rewardOption.emoji || '👑',
          attr: { style: "font-size: 48px; margin-bottom: 12px;" }
        });
      }

      rewardCard.createEl("div", {
        text: rewardOption.description || 'Boss Reward',
        attr: {
          style: `
            font-family: "Georgia", serif;
            font-size: 14px;
            color: #e8eaec;
            margin-bottom: 16px;
          `
        }
      });

      const claimBtn = rewardCard.createEl("button", {
        text: "Claim Reward",
        attr: {
          style: `
            background: linear-gradient(180deg, #c9a227 0%, #8b6914 100%);
            color: #1a1410;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-family: "Times New Roman", serif;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 1px;
            text-transform: uppercase;
            cursor: pointer;
          `
        }
      });
      claimBtn.onclick = async () => {
        if (pendingBossReward) {
          settings.pendingRewards = settings.pendingRewards.filter(r => r !== pendingBossReward);
          settings.claimedRewards = settings.claimedRewards || [];
          settings.claimedRewards.push({
            ...pendingBossReward,
            claimedAt: new Date().toISOString(),
            used: false
          });
          await this.plugin.saveSettings();
          this.plugin.refreshRankView();
        }
        this.close();
        new import_obsidian.Notice("Boss reward claimed!");
      };
    } else {
      // Show progress toward boss reward
      const hpPercent = Math.round((settings.bossCurrentHP / settings.bossMaxHP) * 100);
      const damageNeeded = settings.bossCurrentHP;

      contentEl.createDiv({
        attr: {
          style: `
            text-align: center;
            padding: 20px;
          `
        }
      }).innerHTML = `
        <div style="font-size: 40px; margin-bottom: 12px; opacity: 0.5;">👑</div>
        <div style="font-family: Georgia, serif; font-size: 13px; color: #8a8a8a; margin-bottom: 8px;">
          Defeat the boss to claim this reward
        </div>
        <div style="font-family: Georgia, serif; font-size: 16px; color: #c9a227;">
          ${damageNeeded} damage remaining
        </div>
        <div style="font-family: Georgia, serif; font-size: 11px; color: #6a6a6a; margin-top: 8px;">
          (${hpPercent}% HP left)
        </div>
      `;
    }

    // Close button
    const closeBtn = contentEl.createEl("button", {
      text: "Close",
      attr: {
        style: `
          display: block;
          width: 100%;
          background: transparent;
          color: #8a8a8a;
          border: 1px solid #3a3a3a;
          padding: 10px;
          border-radius: 6px;
          font-family: "Georgia", serif;
          font-size: 12px;
          cursor: pointer;
          margin-top: 12px;
        `
      }
    });
    closeBtn.onclick = () => this.close();
  }

  onClose() {
    this.contentEl.empty();
  }
};

var RewardLogModal = class _RewardLogModal extends import_obsidian.Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
  }

  onOpen() {
    const { contentEl } = this;
    const settings = this.plugin.settings;
    contentEl.empty();

    // Add modal styles
    contentEl.style.maxWidth = "500px";
    contentEl.style.background = "#1a1410";
    contentEl.style.padding = "20px";

    const colors = {
      buccaneer: "#613134",
      peachYellow: "#faddb3",
      leather: "#967b4d",
      naturalGrey: "#928d85",
      gold: "#967b4d",
      goldLight: "#967b4d",
      goldMuted: "#967b4d",
      goldBorder: "#613134",
      green: "#967b4d",
      greenMuted: "#928d85",
      greenBorder: "#613134",
      bg: "#1a1410",
      bgLight: "#221c16",
      text: "#faddb3",
      textMuted: "#928d85",
      danger: "#613134",
      accent: "#967b4d"
    };

    const tierDisplayNames = {
      micro: "Micro",
      mini: "Mini",
      standard: "Standard",
      quality: "Quality",
      premium: "Premium"
    };
    const typeDisplayNames = {
      activity: "Activity",
      boss: "Boss",
      streak: "Streak"
    };

    // Header
    contentEl.createEl("div", {
      text: "Reward Armory",
      attr: {
        style: `
          font-family: "Times New Roman", serif;
          font-size: 18px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: ${colors.gold};
          text-align: center;
          margin-bottom: 20px;
        `
      }
    });

    // Earned/Active Rewards Carousel
    const earnedRewards = [
      ...settings.pendingRewards.map(r => ({ ...r, status: 'pending' })),
      ...settings.bankedRewards.map(r => ({ ...r, status: 'banked' })),
      ...settings.claimedRewards.filter(r => !r.used).map(r => ({ ...r, status: 'active' }))
    ];

    if (earnedRewards.length > 0) {
      contentEl.createEl("div", {
        text: "Your Rewards",
        attr: {
          style: `
            font-family: "Times New Roman", serif;
            font-size: 12px;
            font-weight: 500;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            color: ${colors.goldMuted};
            margin-bottom: 12px;
          `
        }
      });

      // Carousel for earned rewards
      const carousel = contentEl.createDiv({
        attr: {
          style: `
            display: flex;
            gap: 12px;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            padding: 8px 0 16px 0;
            margin-bottom: 20px;
          `
        }
      });
      carousel.style.scrollbarWidth = "none";

      earnedRewards.forEach((reward) => {
        // Look up option: try stored selectedOptionId first, then fall back to pool lookup
        let option = null;
        if (reward.selectedOptionId) {
          const rwdPools = getRewardPoolsForType(settings, reward.rewardType || "activity");
          const pool = rwdPools.find(p => p.tier === reward.rewardTier);
          option = pool?.options?.find(o => o.id === reward.selectedOptionId) || null;
        }
        // For claimed rewards without pool match, reconstruct from stored data
        if (!option && reward.description) {
          option = { description: reward.description, emoji: reward.emoji || "", image: reward.image || "" };
        }

        const statusColors = {
          pending: "#967b4d",
          banked: "#928d85",
          active: "#6a9a5d"
        };

        const card = carousel.createDiv({
          attr: {
            style: `
              flex: 0 0 auto;
              width: 120px;
              scroll-snap-align: start;
              background: ${colors.bgLight};
              border: 1px solid ${statusColors[reward.status]};
              cursor: pointer;
              transition: transform 0.2s ease;
            `
          }
        });
        card.onmouseenter = () => { card.style.transform = "translateY(-4px)"; };
        card.onmouseleave = () => { card.style.transform = "translateY(0)"; };

        // Image section
        const imageSection = card.createDiv({
          attr: {
            style: `
              height: 70px;
              display: flex;
              justify-content: center;
              align-items: center;
              background: linear-gradient(180deg, ${colors.bgLight} 0%, ${colors.bg} 100%);
            `
          }
        });

        if (option?.image) {
          const img = imageSection.createEl("img", {
            attr: {
              src: option.image,
              style: "max-width: 50px; max-height: 50px; object-fit: contain;"
            }
          });
          img.onerror = () => {
            img.remove();
            imageSection.createEl("div", { text: option?.emoji || "🎁", attr: { style: "font-size: 28px;" } });
          };
        } else {
          imageSection.createEl("div", { text: option?.emoji || "🎁", attr: { style: "font-size: 28px;" } });
        }

        // Text section
        const textSection = card.createDiv({
          attr: {
            style: `
              padding: 8px;
              border-top: 1px solid ${colors.greenBorder};
            `
          }
        });

        const name = option?.description || `${tierDisplayNames[reward.rewardTier]} Reward`;
        textSection.createEl("div", {
          text: name.length > 16 ? name.substring(0, 14) + "..." : name,
          attr: {
            style: `
              font-family: "Georgia", serif;
              font-size: 10px;
              color: ${colors.text};
              margin-bottom: 4px;
            `
          }
        });

        const statusText = reward.status === 'pending' ? 'Claim' : reward.status === 'banked' ? 'Banked' : 'Active';
        textSection.createEl("div", {
          text: statusText,
          attr: {
            style: `
              font-family: "Georgia", serif;
              font-size: 9px;
              color: ${statusColors[reward.status]};
            `
          }
        });

        card.onclick = () => {
          if (reward.status === 'pending') {
            this.close();
            new RewardSelectionModal(this.app, this.plugin, reward, () => {
              new _RewardLogModal(this.app, this.plugin).open();
            }).open();
          } else if (reward.status === 'banked') {
            const pendingReward = {
              id: reward.id,
              rewardTier: reward.rewardTier,
              rewardType: reward.rewardType,
              earnedAt: reward.bankedAt,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString()
            };
            settings.bankedRewards = settings.bankedRewards.filter((r) => r.id !== reward.id);
            this.close();
            new RewardSelectionModal(this.app, this.plugin, pendingReward, () => {
              this.plugin.saveSettings();
              new _RewardLogModal(this.app, this.plugin).open();
            }).open();
          } else if (reward.status === 'active') {
            const claimedRef = settings.claimedRewards.find(r => r.id === reward.id);
            if (claimedRef) claimedRef.used = true;
            this.plugin.saveSettings();
            this.plugin.refreshRankView();
            this.onOpen();
            new import_obsidian.Notice("Reward marked as used");
          }
        };
      });
    }

    // Available Rewards Grid — show from all 3 pools for current tier
    const rewardProgress = this.plugin.getRewardProgress();
    const allPoolTypes = ["activity", "streak", "boss"];
    const allCurrentOptions = [];
    allPoolTypes.forEach(pType => {
      const pools = getRewardPoolsForType(settings, pType);
      const p = pools.find(p2 => p2.tier === rewardProgress.rewardTier);
      if (p?.options) p.options.forEach(o => allCurrentOptions.push({ ...o, _poolType: pType }));
    });

    contentEl.createEl("div", {
      text: `Available ${tierDisplayNames[rewardProgress.rewardTier]} Rewards`,
      attr: {
        style: `
          font-family: "Times New Roman", serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: ${colors.greenMuted};
          margin-bottom: 12px;
        `
      }
    });

    const activityRemaining = rewardProgress.activityThreshold - rewardProgress.activityProgress;
    contentEl.createEl("div", {
      text: `${activityRemaining} activities until next reward`,
      attr: {
        style: `
          font-family: "Georgia", serif;
          font-size: 11px;
          font-style: italic;
          color: ${colors.textMuted};
          margin-bottom: 16px;
        `
      }
    });

    // Grid view for available rewards
    const grid = contentEl.createDiv({
      attr: {
        style: `
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        `
      }
    });

    if (allCurrentOptions.length > 0) {
      allCurrentOptions.forEach((option) => {
        const card = grid.createDiv({
          attr: {
            style: `
              background: ${colors.bgLight};
              border: 1px solid ${colors.greenBorder};
              filter: grayscale(0.6) brightness(0.8);
              opacity: 0.7;
              transition: all 0.2s ease;
            `
          }
        });
        card.onmouseenter = () => {
          card.style.filter = "grayscale(0.3) brightness(0.9)";
          card.style.opacity = "0.9";
        };
        card.onmouseleave = () => {
          card.style.filter = "grayscale(0.6) brightness(0.8)";
          card.style.opacity = "0.7";
        };

        // Image section
        const imageSection = card.createDiv({
          attr: {
            style: `
              height: 60px;
              display: flex;
              justify-content: center;
              align-items: center;
              position: relative;
            `
          }
        });

        if (option.image) {
          const img = imageSection.createEl("img", {
            attr: {
              src: option.image,
              style: "max-width: 40px; max-height: 40px; object-fit: contain;"
            }
          });
          img.onerror = () => {
            img.remove();
            imageSection.createEl("div", { text: option.emoji || "🎁", attr: { style: "font-size: 24px;" } });
          };
        } else {
          imageSection.createEl("div", { text: option.emoji || "🎁", attr: { style: "font-size: 24px;" } });
        }

        // Lock icon
        imageSection.createEl("div", {
          text: "🔒",
          attr: {
            style: `
              position: absolute;
              top: 4px;
              right: 4px;
              font-size: 10px;
              opacity: 0.6;
            `
          }
        });

        // Text section
        const textSection = card.createDiv({
          attr: {
            style: `
              padding: 6px;
              border-top: 1px solid ${colors.greenBorder};
            `
          }
        });

        textSection.createEl("div", {
          text: option.description.length > 14 ? option.description.substring(0, 12) + "..." : option.description,
          attr: {
            style: `
              font-family: "Georgia", serif;
              font-size: 9px;
              color: ${colors.textMuted};
            `
          }
        });
      });
    }

    // Empty state
    const rewardProgressCheck = this.plugin.getRewardProgress ? this.plugin.getRewardProgress() : null;
    const hasAvailableRewards = rewardProgressCheck && ["activity", "streak", "boss"].some(type => {
      const pools = getRewardPoolsForType(settings, type);
      return pools.some(p => p.options && p.options.length > 0);
    });
    if (earnedRewards.length === 0 && !hasAvailableRewards) {
      contentEl.createEl("div", {
        text: "No rewards yet. Keep completing activities to earn rewards!",
        attr: {
          style: `
            padding: 20px;
            text-align: center;
            font-family: "Georgia", serif;
            font-size: 14px;
            font-style: italic;
            color: ${colors.textMuted};
          `
        }
      });
    }
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
};
var VIEW_TYPE_DEV_DASHBOARD = "Track-rank-dev-dashboard";
var DeveloperDashboardView = class extends import_obsidian.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.collapsedSections = /* @__PURE__ */ new Set();
    this.plugin = plugin;
  }
  getViewType() {
    return VIEW_TYPE_DEV_DASHBOARD;
  }
  getDisplayText() {
    return "Developer Dashboard";
  }
  getIcon() {
    return "bug";
  }
  async onOpen() {
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
    this.renderSystemStatusSection(wrapper, settings);
    this.renderBossSystemSection(wrapper, settings);
    this.renderActivityInspectorSection(wrapper, settings);
    this.renderThresholdMonitorSection(wrapper, settings);
    if (settings.inTartarus) {
      this.renderTartarusSection(wrapper, settings);
    }
    this.renderManualOverridesSection(wrapper, settings);
    this.renderDebugConsoleSection(wrapper);
  }
  createCollapsibleSection(parent, id, title) {
    const section = parent.createDiv({
      cls: `track-habit-rank-dev-section ${this.collapsedSections.has(id) ? "collapsed" : ""}`
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
  renderSystemStatusSection(parent, settings) {
    const { content } = this.createCollapsibleSection(parent, "system-status", "System Status");
    const effectiveNow = getEffectiveNow(settings);
    const effectiveToday = getEffectiveTodayISO(settings);
    const rows = [
      ["System State", settings.systemState.toUpperCase()],
      ["Effective Now", effectiveNow.toISOString()],
      ["Effective Today", effectiveToday],
      ["Real Time", (/* @__PURE__ */ new Date()).toISOString()],
      ["Pause Start", settings.pauseStartTime || "N/A"],
      ["Total Paused", this.plugin.getTotalPausedDisplay()],
      ["Simulated Date", settings.simulatedDate || "None (using real time)"]
    ];
    this.renderDataTable(content, rows);
    if (settings.systemState === "paused") {
      content.createEl("div", {
        text: `Currently paused for: ${this.plugin.getPauseDurationDisplay()}`,
        attr: {
          style: `
            margin-top: 12px;
            padding: 8px;
            background: rgba(146, 141, 133, 0.15);
            border-radius: 6px;
            text-align: center;
            font-weight: 600;
            color: #928d85;
          `
        }
      });
    }
  }
  renderBossSystemSection(parent, settings) {
    const { content } = this.createCollapsibleSection(parent, "boss-system", "Boss System");
    const boss = getCustomizedBossForTier(settings.currentTier, settings);
    const rankName = getRankNameForTier(settings.currentTier, settings);
    const hpPercent = Math.round(settings.bossCurrentHP / settings.bossMaxHP * 100);
    const rows = [
      ["Current Tier", `${settings.currentTier}/${settings.maxTier || 13}`],
      ["Boss Name", boss?.name || "Unknown"],
      ["Rank Title", rankName],
      ["HP State", `${settings.bossCurrentHP}/${settings.bossMaxHP} (${hpPercent}%)`],
      ["In Tartarus", settings.inTartarus ? "YES" : "No"],
      ["Perfect Weeks", `${settings.consecutivePerfectWeeks}`],
      ["Failed Threshold Days", `${settings.failedThresholdDays}/3`]
    ];
    this.renderDataTable(content, rows);
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
  renderActivityInspectorSection(parent, settings) {
    const { content } = this.createCollapsibleSection(parent, "activity-inspector", "Activity Inspector");
    const allActivities = [
      ...getEffectiveActivities(settings).filter((a) => settings.enabledActivities[a._originalName] ?? true).map((a) => ({
        name: a.name,
        folder: a.folder,
        field: a.field,
        damagePerCompletion: a.damagePerCompletion,
        trackingMode: a.trackingMode,
        damagePerWeek: a.damagePerWeek,
        weeklyTarget: a.weeklyTarget
      })),
      ...settings.customHabits.filter((h) => h.enabled)
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
      let result;
      if (activity.trackingMode === "weekly" && activity.damagePerWeek) {
        result = calculateWeeklyStreak(completions, activity.damagePerWeek, void 0, settings);
      } else {
        result = calculateLiveStreakWithDecay(
          completions,
          activity.damagePerCompletion,
          void 0,
          settings
        );
      }
      const completedDates = completions.filter((c) => c.completed).length;
      const rows = [
        ["Folder", activity.folder],
        ["Raw Completions", `${completedDates} files`],
        ["Current Streak", `${result.streak} days`],
        ["Calculated HP", `${result.hp}`],
        ["Tracking Mode", activity.trackingMode || "daily"],
        ["Weekly Target", `${activity.weeklyTarget || 7}`]
      ];
      this.renderDataTable(activityBox, rows, true);
    }
  }
  renderThresholdMonitorSection(parent, settings) {
    const { content } = this.createCollapsibleSection(parent, "threshold-monitor", "Death Threshold Monitor");
    const allActivities = [
      ...getEffectiveActivities(settings).filter((a) => settings.enabledActivities[a._originalName] ?? true),
      ...settings.customHabits.filter((h) => h.enabled)
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
      completions.forEach((c) => {
        if (!c.completed) return;
        const date = new Date(c.date);
        date.setHours(0, 0, 0, 0);
        if (date >= startDate && date <= today) {
          totalCompletions++;
        }
      });
    }
    const belowThreshold = totalCompletions < requiredCompletions;
    const status = belowThreshold ? settings.failedThresholdDays >= 2 ? "DEATH IMMINENT" : "WARNING" : "SAFE";
    const rows = [
      ["Weekly Target (total)", `${weeklyTarget}`],
      ["Required 3-day Completions", `${requiredCompletions} (10% of weekly)`],
      ["3-day Window", `${startDate.toISOString().slice(0, 10)} \u2192 ${today.toISOString().slice(0, 10)}`],
      ["Actual Completions", `${totalCompletions}`],
      ["Status", status],
      ["Failed Days Counter", `${settings.failedThresholdDays}/3`]
    ];
    this.renderDataTable(content, rows);
    const statusColor = status === "SAFE" ? "#967b4d" : status === "WARNING" ? "#967b4d" : "#613134";
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
  renderTartarusSection(parent, settings) {
    const { content } = this.createCollapsibleSection(parent, "tartarus", "Tartarus State");
    const effectiveNow = getEffectiveNow(settings);
    const daysIn = settings.tartarusStartDate ? Math.floor((effectiveNow.getTime() - new Date(settings.tartarusStartDate).getTime()) / (24 * 60 * 60 * 1e3)) : 0;
    const requiredTasks = settings.currentTier <= 4 ? 3 : settings.currentTier <= 9 ? 4 : 5;
    const completedTasks = settings.tartarusPenanceTasks.filter((t) => t.completed).length;
    const rows = [
      ["Days in Tartarus", `${daysIn}`],
      ["Tartarus Start", settings.tartarusStartDate || "N/A"],
      ["Required Tasks", `${requiredTasks}`],
      ["Completed Tasks", `${completedTasks}/${requiredTasks}`],
      ["Tokens Available", `${settings.disciplineTokens}/3`]
    ];
    this.renderDataTable(content, rows);
    if (settings.tartarusPenanceTasks.length > 0) {
      content.createEl("div", {
        text: "Penance Tasks:",
        attr: { style: "font-weight: 600; margin-top: 12px; margin-bottom: 8px;" }
      });
      settings.tartarusPenanceTasks.forEach((task) => {
        content.createEl("div", {
          text: `${task.completed ? "\u2713" : "\u25CB"} ${task.description}`,
          attr: {
            style: `
              padding: 4px 8px;
              font-size: 0.85em;
              opacity: ${task.completed ? 0.6 : 1};
              ${task.completed ? "text-decoration: line-through;" : ""}
            `
          }
        });
      });
    }
  }
  renderManualOverridesSection(parent, settings) {
    const { content } = this.createCollapsibleSection(parent, "manual-overrides", "Manual Overrides (Developer Tools)");
    content.createEl("div", {
      text: "\u26A0\uFE0F These tools can break game state. Use with caution.",
      attr: {
        style: `
          margin-bottom: 12px;
          padding: 8px;
          background: rgba(97, 49, 52, 0.1);
          border: 1px solid rgba(97, 49, 52, 0.3);
          border-radius: 6px;
          font-size: 0.85em;
          color: #613134;
        `
      }
    });
    // Add "Choose Boss" option to developer dashboard
    const bossSection = content.createDiv({ attr: { style: "margin-bottom: 16px;" } });
    bossSection.createEl("div", {
      text: "Choose Boss Tier:",
      attr: { style: "font-weight: 600; margin-bottom: 8px;" }
    });

    const bossRow = bossSection.createDiv({
      attr: { style: "display: flex; align-items: center; gap: 8px; flex-wrap: wrap;" }
    });

    const tierSelect = bossRow.createEl("select", {
      attr: {
        style: `
          padding: 8px 12px;
          border: 1px solid var(--background-modifier-border);
          border-radius: 4px;
          background: var(--background-secondary);
          color: var(--text-normal);
          min-width: 180px;
        `
      }
    });

    // Add tier options — capped to actual number of bosses
    const maxTierOpt = Math.min(settings.maxTier || 13, BOSSES.length);
    for (let t = 1; t <= maxTierOpt; t++) {
      const boss = getCustomizedBossForTier(t, settings);
      const opt = tierSelect.createEl("option", {
        text: `Tier ${t}: ${boss?.name || 'Unknown'}`,
        attr: { value: t.toString() }
      });
      if (t === settings.currentTier) opt.selected = true;
    }

    const setTierBtn = bossRow.createEl("button", {
      text: "Set Tier",
      cls: "track-habit-rank-btn",
      attr: { style: "padding: 8px 16px; min-height: 44px;" }
    });
    setTierBtn.onclick = async () => {
      const newTier = parseInt(tierSelect.value);
      const oldTier = this.plugin.settings.currentTier;
      this.plugin.settings.currentTier = newTier;

      // Calculate weekly stats to get proper HP
      const weekProgress = getCurrentWeekProgress(this.app, this.plugin.settings);
      const allActivities = [
        ...getEffectiveActivities(this.plugin.settings).filter((a) => this.plugin.settings.enabledActivities[a._originalName] ?? true),
        ...this.plugin.settings.customHabits.filter((h) => h.enabled)
      ];
      const weeklyTargets = allActivities.map(a => a.weeklyTarget || 7);
      const totalWeeklyTarget = weeklyTargets.reduce((sum, t) => sum + t, 0);
      const lowestWeeklyTarget = weeklyTargets.length > 0 ? Math.min(...weeklyTargets) : 7;

      // Calculate new HP for the tier
      const newMaxHP = calculateBossHP(totalWeeklyTarget, newTier, this.plugin.settings, lowestWeeklyTarget);
      this.plugin.settings.bossMaxHP = newMaxHP;
      this.plugin.settings.bossCurrentHP = newMaxHP;

      debugLog.log("DEV", "Boss tier changed", { oldTier, newTier, newMaxHP });
      await this.plugin.saveSettings();
      this.plugin.refreshRankView();
      this.render();
      new import_obsidian.Notice(`Changed to Tier ${newTier} (HP: ${newMaxHP})`);
    };

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
      const newDate = dateInput.value || null;
      this.plugin.settings.simulatedDate = newDate;
      debugLog.log("DEV", "Date simulation set", { simulatedDate: newDate });
      await this.plugin.saveSettings();
      this.plugin.refreshRankView();
      this.render();
      new import_obsidian.Notice(this.plugin.settings.simulatedDate ? `Date simulation active: ${this.plugin.settings.simulatedDate}` : "Date simulation cleared");
    };
    const clearDateBtn = dateSection.createEl("button", {
      text: "Clear",
      cls: "track-habit-rank-btn",
      attr: { style: "padding: 8px 12px; min-height: 44px;" }
    });
    clearDateBtn.onclick = async () => {
      debugLog.log("DEV", "Date simulation cleared");
      this.plugin.settings.simulatedDate = null;
      await this.plugin.saveSettings();
      this.plugin.refreshRankView();
      this.render();
      new import_obsidian.Notice("Date simulation cleared - using real time");
    };
    content.createEl("div", {
      text: "Quick Actions:",
      attr: { style: "font-weight: 600; margin-bottom: 8px;" }
    });
    const actionsRow = content.createDiv({
      attr: { style: "display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;" }
    });
    const forceTartarusBtn = actionsRow.createEl("button", {
      text: "Force Tartarus",
      cls: "track-habit-rank-btn",
      attr: { style: "padding: 8px 12px; min-height: 44px; background: rgba(97, 49, 52, 0.15); color: #613134;" }
    });
    forceTartarusBtn.onclick = async () => {
      debugLog.log("DEV", "Force Tartarus triggered");
      enterTartarus(this.plugin.settings);
      await this.plugin.saveSettings();
      this.plugin.refreshRankView();
      this.render();
      new import_obsidian.Notice("Forced entry into Tartarus");
    };
    const resetBossBtn = actionsRow.createEl("button", {
      text: "Reset Boss HP",
      cls: "track-habit-rank-btn",
      attr: { style: "padding: 8px 12px; min-height: 44px;" }
    });
    resetBossBtn.onclick = async () => {
      const prevHP = this.plugin.settings.bossCurrentHP;
      this.plugin.settings.bossCurrentHP = this.plugin.settings.bossMaxHP;
      debugLog.log("DEV", "Boss HP reset", { prevHP, newHP: this.plugin.settings.bossMaxHP });
      await this.plugin.saveSettings();
      this.plugin.refreshRankView();
      this.render();
      new import_obsidian.Notice("Boss HP reset to max");
    };
    const addTokenBtn = actionsRow.createEl("button", {
      text: "+1 Token",
      cls: "track-habit-rank-btn",
      attr: { style: "padding: 8px 12px; min-height: 44px;" }
    });
    addTokenBtn.onclick = async () => {
      const prevTokens = this.plugin.settings.disciplineTokens;
      this.plugin.settings.disciplineTokens = Math.min(3, this.plugin.settings.disciplineTokens + 1);
      debugLog.log("DEV", "Token added", { prevTokens, newTokens: this.plugin.settings.disciplineTokens });
      await this.plugin.saveSettings();
      this.plugin.refreshRankView();
      this.render();
      new import_obsidian.Notice(`Token added (${this.plugin.settings.disciplineTokens}/3)`);
    };
    if (settings.inTartarus) {
      const escapeBtn = actionsRow.createEl("button", {
        text: "Escape Tartarus",
        cls: "track-habit-rank-btn",
        attr: { style: "padding: 8px 12px; min-height: 44px; background: rgba(150, 123, 77, 0.15); color: #967b4d;" }
      });
      escapeBtn.onclick = async () => {
        debugLog.log("DEV", "Escape Tartarus triggered (developer override)");
        this.plugin.settings.inTartarus = false;
        this.plugin.settings.tartarusPenanceTasks = [];
        this.plugin.settings.tartarusStartDate = null;
        await this.plugin.saveSettings();
        this.plugin.refreshRankView();
        this.render();
        new import_obsidian.Notice("Escaped Tartarus (developer override)");
      };
    }
    const resetPauseBtn = actionsRow.createEl("button", {
      text: "Reset Pause Time",
      cls: "track-habit-rank-btn",
      attr: { style: "padding: 8px 12px; min-height: 44px;" }
    });
    resetPauseBtn.onclick = async () => {
      const prevPausedTime = this.plugin.settings.totalPausedTime;
      this.plugin.settings.totalPausedTime = 0;
      debugLog.log("DEV", "Total pause time reset", {
        prevPausedTime: Math.round(prevPausedTime / 1e3) + "s"
      });
      await this.plugin.saveSettings();
      this.plugin.refreshRankView();
      this.render();
      new import_obsidian.Notice("Total paused time reset to 0");
    };
  }
  renderDataTable(parent, rows, compact = false) {
    const table = parent.createEl("table", {
      attr: {
        style: `
          width: 100%;
          font-size: ${compact ? "0.8em" : "0.85em"};
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
            padding: ${compact ? "3px 6px" : "4px 8px"};
            opacity: 0.7;
            white-space: nowrap;
          `
        }
      });
      row.createEl("td", {
        text: value,
        attr: {
          style: `
            padding: ${compact ? "3px 6px" : "4px 8px"};
            font-family: monospace;
            word-break: break-all;
          `
        }
      });
    });
  }
  renderDebugConsoleSection(parent) {
    const { content } = this.createCollapsibleSection(parent, "debug-console", "Debug Console");
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
    const entries = debugLog.getAll();
    controlsRow.createEl("span", {
      text: `${entries.length} entries`,
      attr: { style: "align-self: center; font-size: 0.85em; opacity: 0.7;" }
    });
    const console2 = content.createDiv({
      cls: "track-habit-rank-log-console",
      attr: { style: "max-height: 300px; overflow-y: auto;" }
    });
    if (entries.length === 0) {
      console2.createEl("div", {
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
      const recentEntries = debugLog.getLast(50);
      recentEntries.forEach((entry) => {
        const categoryClass = `log-${entry.category.toLowerCase()}`;
        const entryEl = console2.createDiv({
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
};
var TrackRankSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  /**
   * Create a collapsible section in settings
   */
  createCollapsibleSection(parent, title, icon, defaultOpen = false) {
    const section = parent.createDiv({
      attr: {
        style: `
          margin: 8px 0;
          border: 1px solid var(--background-modifier-border);
          border-radius: 8px;
          overflow: hidden;
        `
      }
    });
    const header = section.createDiv({
      attr: {
        style: `
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: var(--background-secondary);
          cursor: pointer;
          user-select: none;
          min-height: 44px;
        `
      }
    });
    const arrow = header.createEl("span", {
      text: defaultOpen ? "\u25BC" : "\u25B6",
      attr: { style: "font-size: 10px; transition: transform 0.2s; width: 12px;" }
    });
    header.createEl("span", {
      text: icon ? `${icon}  ${title}` : title,
      attr: { style: "font-weight: 600; font-size: 0.95em;" }
    });
    const body = section.createDiv({
      attr: { style: `padding: 0 16px; display: ${defaultOpen ? 'block' : 'none'};` }
    });
    header.addEventListener("click", () => {
      const isOpen = body.style.display !== "none";
      body.style.display = isOpen ? "none" : "block";
      body.style.padding = isOpen ? "0 16px" : "12px 16px";
      arrow.textContent = isOpen ? "\u25B6" : "\u25BC";
    });
    if (defaultOpen) body.style.padding = "12px 16px";
    return body;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass("track-habit-rank-settings");

    // Main header
    containerEl.createEl("div", {
      text: "Mythological Habit Tracker",
      attr: { style: "font-size: 1.3em; font-weight: 700; margin-bottom: 4px; padding: 8px 0;" }
    });

    // Quick stats bar (always visible, compact)
    const effectiveNow = getEffectiveNow(this.plugin.settings);
    const hpPercent = Math.round(this.plugin.settings.bossCurrentHP / this.plugin.settings.bossMaxHP * 100);
    const statusBar = containerEl.createDiv({
      attr: {
        style: `
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
          padding: 8px 12px;
          margin-bottom: 12px;
          background: var(--background-secondary);
          border-radius: 6px;
          font-size: 0.8em;
          color: var(--text-muted);
        `
      }
    });
    statusBar.createEl("span", { text: `Tier ${this.plugin.settings.currentTier}/${this.plugin.settings.maxTier || 13}` });
    statusBar.createEl("span", { text: `HP ${this.plugin.settings.bossCurrentHP}/${this.plugin.settings.bossMaxHP} (${hpPercent}%)` });
    statusBar.createEl("span", {
      text: this.plugin.settings.systemState === "paused" ? "PAUSED" : this.plugin.settings.inTartarus ? "TARTARUS" : "ACTIVE",
      attr: { style: `font-weight: 600; color: ${this.plugin.settings.inTartarus ? 'var(--text-error)' : 'var(--text-normal)'};` }
    });

    // ===== 1. APPEARANCE =====
    const themeBody = this.createCollapsibleSection(containerEl, "Appearance", "", false);
    this.renderThemeSection(themeBody);

    // ===== 2. HABITS & ACTIVITIES =====
    const activitiesBody = this.createCollapsibleSection(containerEl, "Habits & Activities", "", false);
    this.renderActivitiesSection(activitiesBody);

    // ===== 3. BOSS PROGRESSION =====
    const bossBody = this.createCollapsibleSection(containerEl, "Boss Progression", "", false);
    this.renderBossProgressionSection(bossBody);

    // ===== 4. REWARDS =====
    const rewardsBody = this.createCollapsibleSection(containerEl, "Rewards", "", false);
    this.renderRewardPoolsSection(rewardsBody);

    // ===== 5. TARTARUS =====
    const tartarusBody = this.createCollapsibleSection(containerEl, "Tartarus", "", false);
    this.renderTartarusSection(tartarusBody);

    // ===== 6. TEMPLE UPKEEP =====
    const templeBody = this.createCollapsibleSection(containerEl, "Temple Upkeep", "", false);
    this.renderTempleUpkeepSection(templeBody);

    // ===== 7. SYSTEM =====
    const systemBody = this.createCollapsibleSection(containerEl, "System", "", false);
    this.renderSystemSection(systemBody);
  }

  /**
   * Theme & Appearance section
   */
  renderThemeSection(body) {
    const THEME_PRESETS = {
      "age-of-concern": { label: "Age of Concern", primary: "#613134", secondary: "#faddb3", accent: "#967b4d", muted: "#928d85" },
      "dark-knight": { label: "Dark Knight", primary: "#1a1a2e", secondary: "#e0e0e0", accent: "#4a7c8f", muted: "#6c6c7e" },
      "forest-spirit": { label: "Forest Spirit", primary: "#2d4a3e", secondary: "#d4e8c2", accent: "#7a9a5d", muted: "#8a9a85" },
      "obsidian-gold": { label: "Obsidian Gold", primary: "#1a1a1a", secondary: "#f0d060", accent: "#c9a227", muted: "#808080" },
      "blood-moon": { label: "Blood Moon", primary: "#4a1020", secondary: "#f0c0a0", accent: "#c04040", muted: "#8a6060" },
      "ocean-depths": { label: "Ocean Depths", primary: "#0f2a3f", secondary: "#b8d8e8", accent: "#3a7ca5", muted: "#7090a0" },
      "amethyst": { label: "Amethyst", primary: "#2d1b4e", secondary: "#e0d0f0", accent: "#8a5cf6", muted: "#7a6a8a" },
      "parchment": { label: "Parchment", primary: "#5a4a3a", secondary: "#f5ead0", accent: "#a0804a", muted: "#9a8a7a" },
    };

    // Preset selector
    new import_obsidian.Setting(body).setName("Theme preset").setDesc("Choose a color theme or pick your own primary color").addDropdown(
      (d) => {
        d.addOption("auto", "Auto (from your color)");
        Object.keys(THEME_PRESETS).forEach(k => d.addOption(k, THEME_PRESETS[k].label));
        d.addOption("custom", "Custom (4 colors)");
        d.setValue(this.plugin.settings.activeTheme || "auto");
        d.onChange(async (v) => {
          this.plugin.settings.activeTheme = v;
          if (v !== "custom" && v !== "auto") {
            const preset = THEME_PRESETS[v];
            this.plugin.settings.customTheme = { primary: preset.primary, secondary: preset.secondary, accent: preset.accent, muted: preset.muted };
          }
          await this.plugin.saveSettings();
          this.plugin.refreshRankView();
          this.display();
        });
      }
    );

    // Auto theme: single primary color picker
    if (this.plugin.settings.activeTheme === "auto") {
      body.createEl("div", { text: "YOUR COLOR", attr: { style: "font-size: 0.75em; font-weight: 600; letter-spacing: 1.5px; margin-bottom: 8px; color: var(--text-muted);" } });
      body.createEl("div", {
        text: "Pick one color and the entire theme will be derived from it.",
        attr: { style: "font-size: 0.8em; color: var(--text-muted); margin-bottom: 8px;" }
      });
      const colorRow = body.createDiv({ attr: { style: "display: flex; gap: 12px; align-items: center; margin-bottom: 12px;" } });
      const colorInput = colorRow.createEl("input", {
        attr: {
          type: "color",
          value: this.plugin.settings.userPrimaryColor || "#613134",
          style: "width: 48px; height: 48px; border: none; padding: 0; cursor: pointer; background: none;"
        }
      });
      const hexLabel = colorRow.createEl("span", {
        text: this.plugin.settings.userPrimaryColor || "#613134",
        attr: { style: "font-family: monospace; font-size: 14px; color: var(--text-normal);" }
      });
      colorInput.addEventListener("input", async (e) => {
        const val = e.target.value;
        hexLabel.textContent = val;
        this.plugin.settings.userPrimaryColor = val;
        await this.plugin.saveSettings();
        this.plugin.refreshRankView();
      });
      // Also allow typing hex directly
      new import_obsidian.Setting(body).setName("Or type hex code").addText(
        (t) => {
          t.setPlaceholder("#613134")
            .setValue(this.plugin.settings.userPrimaryColor || "#613134")
            .onChange(async (v) => {
              if (/^#[0-9a-fA-F]{6}$/.test(v)) {
                this.plugin.settings.userPrimaryColor = v;
                colorInput.value = v;
                hexLabel.textContent = v;
                await this.plugin.saveSettings();
                this.plugin.refreshRankView();
              }
            });
          t.inputEl.style.fontFamily = "monospace";
          t.inputEl.style.width = "90px";
        }
      );
    }

    // Preview swatches - show derived colors
    const lightenHex2 = (hex, factor) => {
      const r = parseInt(hex.slice(1,3), 16);
      const g = parseInt(hex.slice(3,5), 16);
      const b = parseInt(hex.slice(5,7), 16);
      const lr = Math.min(255, Math.round(r + (255 - r) * factor));
      const lg = Math.min(255, Math.round(g + (255 - g) * factor));
      const lb = Math.min(255, Math.round(b + (255 - b) * factor));
      return `#${lr.toString(16).padStart(2,'0')}${lg.toString(16).padStart(2,'0')}${lb.toString(16).padStart(2,'0')}`;
    };
    const desaturateHex2 = (hex, factor) => {
      const r = parseInt(hex.slice(1,3), 16);
      const g = parseInt(hex.slice(3,5), 16);
      const b = parseInt(hex.slice(5,7), 16);
      const grey = Math.round(r * 0.299 + g * 0.587 + b * 0.114);
      return `#${Math.round(r + (grey - r) * factor).toString(16).padStart(2,'0')}${Math.round(g + (grey - g) * factor).toString(16).padStart(2,'0')}${Math.round(b + (grey - b) * factor).toString(16).padStart(2,'0')}`;
    };
    let theme;
    if (this.plugin.settings.activeTheme === "auto") {
      const p = this.plugin.settings.userPrimaryColor || "#613134";
      theme = { primary: p, secondary: lightenHex2(p, 0.82), accent: lightenHex2(desaturateHex2(p, 0.3), 0.45), muted: desaturateHex2(lightenHex2(p, 0.4), 0.6) };
    } else {
      theme = this.plugin.settings.customTheme || THEME_PRESETS["age-of-concern"];
    }
    const swatchRow = body.createDiv({
      attr: { style: "display: flex; gap: 8px; margin: 8px 0 16px 0; align-items: center;" }
    });
    [
      { color: theme.primary, label: "Primary" },
      { color: theme.secondary, label: "Text" },
      { color: theme.accent, label: "Accent" },
      { color: theme.muted, label: "Muted" },
    ].forEach(s => {
      const sw = swatchRow.createDiv({ attr: { style: "text-align: center;" } });
      sw.createDiv({
        attr: {
          style: `width: 36px; height: 36px; border-radius: 4px; background: ${s.color}; border: 1px solid var(--background-modifier-border); margin-bottom: 2px;`
        }
      });
      sw.createEl("div", { text: s.label, attr: { style: "font-size: 9px; color: var(--text-muted);" } });
    });

    // Custom hex inputs (only when custom theme selected)
    if (this.plugin.settings.activeTheme === "custom") {
      body.createEl("div", { text: "CUSTOM HEX COLORS", attr: { style: "font-size: 0.75em; font-weight: 600; letter-spacing: 1.5px; margin-bottom: 8px; color: var(--text-muted);" } });

      const hexFields = [
        { key: "primary", label: "Primary (borders, dark elements)", placeholder: "#613134" },
        { key: "secondary", label: "Text (main text color)", placeholder: "#faddb3" },
        { key: "accent", label: "Accent (HP bar, highlights)", placeholder: "#967b4d" },
        { key: "muted", label: "Muted (subtle text, info)", placeholder: "#928d85" },
      ];

      hexFields.forEach(f => {
        new import_obsidian.Setting(body).setName(f.label).addText(
          (t) => {
            t.setPlaceholder(f.placeholder)
              .setValue(this.plugin.settings.customTheme?.[f.key] || "")
              .onChange(async (v) => {
                if (/^#[0-9a-fA-F]{6}$/.test(v) || v === "") {
                  if (!this.plugin.settings.customTheme) this.plugin.settings.customTheme = { primary: "#613134", secondary: "#faddb3", accent: "#967b4d", muted: "#928d85" };
                  this.plugin.settings.customTheme[f.key] = v || f.placeholder;
                  await this.plugin.saveSettings();
                  this.plugin.refreshRankView();
                }
              });
            t.inputEl.style.fontFamily = "monospace";
            t.inputEl.style.width = "90px";
          }
        );
      });
    }

    // Background image
    body.createEl("div", { text: "BACKGROUND", attr: { style: "font-size: 0.75em; font-weight: 600; letter-spacing: 1.5px; margin: 16px 0 8px 0; color: var(--text-muted);" } });
    new import_obsidian.Setting(body).setName("Dashboard background image").setDesc("URL or vault path to a 9:16 image (vignette auto-applied)").addText(
      (t) => t.setPlaceholder("vault/path/to/image.png").setValue(this.plugin.settings.dashboardBgImage || "").onChange(async (v) => {
        this.plugin.settings.dashboardBgImage = v;
        await this.plugin.saveSettings();
        this.plugin.refreshRankView();
      })
    );

    // Tier figure
    body.createEl("div", { text: "TIER FIGURE", attr: { style: "font-size: 0.75em; font-weight: 600; letter-spacing: 1.5px; margin: 16px 0 8px 0; color: var(--text-muted);" } });
    new import_obsidian.Setting(body).setName("Show tier figure").setDesc("Display your avatar/champion on the boss dashboard").addToggle(
      (t) => t.setValue(this.plugin.settings.showTierFigure).onChange(async (v) => {
        this.plugin.settings.showTierFigure = v;
        await this.plugin.saveSettings();
        this.plugin.refreshRankView();
        this.display();
      })
    );

    if (this.plugin.settings.showTierFigure) {
      for (let tier = 1; tier <= this.plugin.settings.maxTier; tier++) {
          const tierFigure = this.plugin.settings.tierFigures?.find(f => f.tier === tier);
          const figureContainer = body.createDiv({
            attr: { style: "margin-top: 8px; border: 1px solid var(--background-modifier-border); border-radius: 6px; overflow: hidden;" }
          });
          const figHeader = figureContainer.createDiv({
            attr: { style: "display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--background-secondary); cursor: pointer; user-select: none;" }
          });
          figHeader.createEl("span", { text: `Tier ${tier}${tierFigure?.image ? ' \u2713' : ''}`, attr: { style: "font-size: 0.85em; font-weight: 500;" } });
          const figArrow = figHeader.createEl("span", { text: "\u25B6", attr: { style: "font-size: 9px;" } });
          const figureContent = figureContainer.createDiv({ attr: { style: "display: none; padding: 8px 12px;" } });
          figHeader.addEventListener("click", () => {
            const isOpen = figureContent.style.display !== "none";
            figureContent.style.display = isOpen ? "none" : "block";
            figArrow.textContent = isOpen ? "\u25B6" : "\u25BC";
          });

          // Image path
          new import_obsidian.Setting(figureContent).setName("Figure image").addText(
            (t) => t.setPlaceholder("vault/path/to/figure.png").setValue(tierFigure?.image || "").onChange(async (v) => {
              this.updateTierFigure(tier, 'image', v);
              await this.plugin.saveSettings();
              this.plugin.refreshRankView();
              this.display();
            })
          );

          // Preview + controls (only if image is set)
          if (tierFigure?.image) {
            // Live preview box
            const previewBox = figureContent.createDiv({
              attr: {
                style: `
                  position: relative;
                  width: 100%;
                  height: 200px;
                  background: #1a1410;
                  border: 1px solid var(--background-modifier-border);
                  border-radius: 6px;
                  overflow: hidden;
                  margin-bottom: 12px;
                `
              }
            });
            let figSrc = tierFigure.image;
            if (!figSrc.startsWith('http://') && !figSrc.startsWith('https://') && !figSrc.startsWith('data:')) {
              try { figSrc = this.plugin.app.vault.adapter.getResourcePath(figSrc); } catch (e) {}
            }
            let liveScale = tierFigure.scale || 1.0;
            let liveOffX = tierFigure.offsetX || 0;
            let liveOffY = tierFigure.offsetY || 0;
            let livePos = tierFigure.position || 'left';

            const previewFig = previewBox.createEl("img", { attr: { src: figSrc } });
            previewFig.onerror = () => previewFig.remove();

            const previewLabel = previewBox.createEl("div", {
              attr: {
                style: `
                  position: absolute;
                  bottom: 4px;
                  right: 8px;
                  font-size: 9px;
                  font-family: monospace;
                  color: rgba(255,255,255,0.4);
                `
              }
            });

            // Helper: update preview image position/size without re-rendering
            const updatePreview = () => {
              const pSize = Math.round(100 * liveScale);
              const pMaxH = Math.round(160 * liveScale);
              const posCSS = livePos === 'right'
                ? `right: ${10 + liveOffX * 0.5}px; left: auto;`
                : `left: ${10 + liveOffX * 0.5}px; right: auto;`;
              previewFig.style.cssText = `
                position: absolute;
                bottom: ${10 + liveOffY * 0.5}px;
                ${posCSS}
                max-width: ${pSize}px;
                max-height: ${pMaxH}px;
                object-fit: contain;
                filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5));
                transition: all 0.15s ease;
              `;
              previewLabel.textContent = `${livePos.toUpperCase()} \u2022 ${Math.round(liveScale * 100)}% \u2022 X:${liveOffX} Y:${liveOffY}`;
            };
            updatePreview();

            // Position (left/right)
            new import_obsidian.Setting(figureContent).setName("Side").setDesc("Left or right side of the dashboard").addDropdown(
              (d) => d.addOption("left", "Left").addOption("right", "Right").setValue(livePos).onChange(async (v) => {
                livePos = v;
                this.updateTierFigure(tier, 'position', v);
                await this.plugin.saveSettings();
                this.plugin.refreshRankView();
                updatePreview();
              })
            );

            // Scale slider
            const scaleRow = figureContent.createDiv({ attr: { style: "margin-bottom: 12px;" } });
            const scaleLabel = scaleRow.createEl("div", { text: `Size: ${Math.round(liveScale * 100)}%`, attr: { style: "font-size: 0.85em; margin-bottom: 4px;" } });
            const scaleSlider = scaleRow.createEl("input", {
              attr: {
                type: "range", min: "0.3", max: "3.0", step: "0.1",
                value: String(liveScale),
                style: "width: 100%; accent-color: var(--interactive-accent);"
              }
            });
            scaleSlider.addEventListener("input", (e) => {
              liveScale = parseFloat(e.target.value);
              scaleLabel.textContent = `Size: ${Math.round(liveScale * 100)}%`;
              updatePreview();
            });
            scaleSlider.addEventListener("change", async (e) => {
              this.updateTierFigure(tier, 'scale', parseFloat(e.target.value));
              await this.plugin.saveSettings();
              this.plugin.refreshRankView();
            });

            // Horizontal offset slider
            const xRow = figureContent.createDiv({ attr: { style: "margin-bottom: 12px;" } });
            const xLabel = xRow.createEl("div", { text: `Horizontal offset: ${liveOffX}px`, attr: { style: "font-size: 0.85em; margin-bottom: 4px;" } });
            const xSlider = xRow.createEl("input", {
              attr: {
                type: "range", min: "-50", max: "100", step: "2",
                value: String(liveOffX),
                style: "width: 100%; accent-color: var(--interactive-accent);"
              }
            });
            xSlider.addEventListener("input", (e) => {
              liveOffX = parseInt(e.target.value);
              xLabel.textContent = `Horizontal offset: ${liveOffX}px`;
              updatePreview();
            });
            xSlider.addEventListener("change", async (e) => {
              this.updateTierFigure(tier, 'offsetX', parseInt(e.target.value));
              await this.plugin.saveSettings();
              this.plugin.refreshRankView();
            });

            // Vertical offset slider
            const yRow = figureContent.createDiv({ attr: { style: "margin-bottom: 12px;" } });
            const yLabel = yRow.createEl("div", { text: `Vertical offset: ${liveOffY}px`, attr: { style: "font-size: 0.85em; margin-bottom: 4px;" } });
            const ySlider = yRow.createEl("input", {
              attr: {
                type: "range", min: "-50", max: "150", step: "2",
                value: String(liveOffY),
                style: "width: 100%; accent-color: var(--interactive-accent);"
              }
            });
            ySlider.addEventListener("input", (e) => {
              liveOffY = parseInt(e.target.value);
              yLabel.textContent = `Vertical offset: ${liveOffY}px`;
              updatePreview();
            });
            ySlider.addEventListener("change", async (e) => {
              this.updateTierFigure(tier, 'offsetY', parseInt(e.target.value));
              await this.plugin.saveSettings();
              this.plugin.refreshRankView();
            });

            // Hide tier title toggle
            new import_obsidian.Setting(figureContent).setName("Hide tier title").addToggle(
              (t) => t.setValue(tierFigure?.hideTierTitle || false).onChange(async (v) => {
                this.updateTierFigure(tier, 'hideTierTitle', v);
                await this.plugin.saveSettings();
                this.plugin.refreshRankView();
              })
            );
          }
      }
    }
  }

  /**
   * Activities & Habits section
   */
  renderActivitiesSection(body) {
    // Default activities toggles
    body.createEl("div", { text: "DEFAULT ACTIVITIES", attr: { style: "font-size: 0.75em; font-weight: 600; letter-spacing: 1.5px; margin-bottom: 8px; color: var(--text-muted);" } });
    getEffectiveActivities(this.plugin.settings).forEach((activity) => {
      const originalName = activity._originalName;
      new import_obsidian.Setting(body).setName(activity.name).setDesc(`${activity.folder} \u2022 ${activity.weeklyTarget}/wk`).addToggle(
        (toggle) => toggle.setValue(
          this.plugin.settings.enabledActivities[originalName] ?? true
        ).onChange(async (value) => {
          const currentlyEnabled = this.plugin.settings.enabledActivities[originalName] ?? true;
          const aboutToDisable = currentlyEnabled && !value;
          if (aboutToDisable) {
            const completions = getCompletionsFromFolder(this.app, activity.folder, activity.field);
            let result;
            if (activity.trackingMode === "weekly" && activity.damagePerWeek) {
              result = calculateWeeklyStreak(completions, activity.damagePerWeek, void 0, this.plugin.settings);
            } else {
              result = calculateLiveStreakWithDecay(completions, activity.damagePerCompletion, void 0, this.plugin.settings);
            }
            const completedCount = completions.filter((c) => c.completed).length;
            this.plugin.settings.activitySnapshots[originalName] = {
              activityId: originalName,
              disabledDate: getEffectiveTodayISO(this.plugin.settings),
              frozenHP: completedCount,
              frozenStreak: result.streak
            };
          }
          if (!aboutToDisable && value) {
            delete this.plugin.settings.activitySnapshots[originalName];
          }
          this.plugin.settings.enabledActivities[originalName] = value;
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

    // Custom habits
    body.createEl("div", { text: "CUSTOM HABITS", attr: { style: "font-size: 0.75em; font-weight: 600; letter-spacing: 1.5px; margin: 16px 0 8px 0; color: var(--text-muted);" } });
    new import_obsidian.Setting(body).setName("Add custom habit").addButton(
      (btn) => btn.setButtonText("+ Add").setCta().onClick(async () => {
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
      const box = body.createDiv({
        attr: { style: "margin-top: 8px; padding: 10px; border-radius: 6px; border: 1px solid var(--background-modifier-border);" }
      });
      new import_obsidian.Setting(box).setName("Enabled").addToggle(
        (t) => t.setValue(habit.enabled).onChange(async (v) => {
          const currentlyEnabled = habit.enabled;
          const aboutToDisable = currentlyEnabled && !v;
          if (aboutToDisable) {
            const completions = getCompletionsFromFolder(this.app, habit.folder, habit.field);
            let result;
            if (habit.trackingMode === "weekly" && habit.damagePerWeek) {
              result = calculateWeeklyStreak(completions, habit.damagePerWeek, void 0, this.plugin.settings);
            } else {
              result = calculateLiveStreakWithDecay(completions, habit.damagePerCompletion, void 0, this.plugin.settings);
            }
            const completedCount = completions.filter((c) => c.completed).length;
            this.plugin.settings.activitySnapshots[habit.id] = {
              activityId: habit.id,
              disabledDate: getEffectiveTodayISO(this.plugin.settings),
              frozenHP: completedCount,
              frozenStreak: result.streak
            };
          }
          if (!aboutToDisable && v) delete this.plugin.settings.activitySnapshots[habit.id];
          habit.enabled = v;
          await this.plugin.saveSettings();
          this.plugin.refreshRankView();
        })
      );
      new import_obsidian.Setting(box).setName("Name").addText((t) => t.setPlaceholder("Habit name").setValue(habit.name).onChange(async (v) => { habit.name = v; await this.plugin.saveSettings(); }));
      new import_obsidian.Setting(box).setName("Folder").setDesc("Folder with YYYY-MM-DD notes").addText((t) => t.setPlaceholder("Personal Life/01 Workout").setValue(habit.folder).onChange(async (v) => { habit.folder = v; await this.plugin.saveSettings(); }));
      new import_obsidian.Setting(box).setName("Property").addText((t) => t.setPlaceholder("Workout").setValue(habit.field).onChange(async (v) => { habit.field = v; await this.plugin.saveSettings(); }));
      new import_obsidian.Setting(box).setName("Damage/completion").addText((t) => t.setValue(String(habit.damagePerCompletion)).onChange(async (v) => { habit.damagePerCompletion = Number(v) || 1; await this.plugin.saveSettings(); this.plugin.refreshRankView(); }));
      new import_obsidian.Setting(box).setName("Weekly target").addText((t) => t.setValue(String(habit.weeklyTarget || 7)).onChange(async (v) => { habit.weeklyTarget = Number(v) || 7; await this.plugin.saveSettings(); this.plugin.refreshRankView(); }));
      new import_obsidian.Setting(box).setName("Tracking mode").addDropdown(
        (d) => d.addOption("daily", "Daily").addOption("weekly", "Weekly").setValue(habit.trackingMode || "daily").onChange(async (v) => { habit.trackingMode = v; await this.plugin.saveSettings(); this.plugin.refreshRankView(); })
      );
      if (habit.trackingMode === "weekly") {
        new import_obsidian.Setting(box).setName("Damage per week").addText((t) => t.setValue(String(habit.damagePerWeek || 7)).onChange(async (v) => { habit.damagePerWeek = Number(v) || 7; await this.plugin.saveSettings(); this.plugin.refreshRankView(); }));
      }
      new import_obsidian.Setting(box).addButton((btn) => btn.setButtonText("Delete").setWarning().onClick(async () => {
        this.plugin.settings.customHabits.splice(index, 1);
        await this.plugin.saveSettings();
        this.display();
        this.plugin.refreshRankView();
      }));
    });

    // Activity editor (collapsible sub-section)
    body.createEl("div", { text: "ACTIVITY EDITOR", attr: { style: "font-size: 0.75em; font-weight: 600; letter-spacing: 1.5px; margin: 16px 0 8px 0; color: var(--text-muted);" } });
    new import_obsidian.Setting(body).setName("Reset all customizations").addButton(
      (btn) => btn.setButtonText("Reset All").setWarning().onClick(async () => {
        this.plugin.settings.activityOverrides = [];
        await this.plugin.saveSettings();
        this.plugin.refreshRankView();
        this.display();
      })
    );
    ACTIVITIES.forEach((activity) => {
      const override = this.plugin.settings.activityOverrides?.find((o) => o.originalName === activity.name);
      const actContainer = body.createDiv({ attr: { style: "margin-top: 8px; border: 1px solid var(--background-modifier-border); border-radius: 6px; overflow: hidden;" } });
      const actHeader = actContainer.createDiv({ attr: { style: "display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--background-secondary); cursor: pointer; min-height: 40px;" } });
      const displayName = override?.name || activity.name;
      actHeader.createEl("span", { text: `${displayName}${override ? " \u270F\uFE0F" : ""}`, attr: { style: "font-weight: 500; font-size: 0.9em;" } });
      const actArrow = actHeader.createEl("span", { text: "\u25B6", attr: { style: "font-size: 9px;" } });
      const actContent = actContainer.createDiv({ attr: { style: "display: none; padding: 8px 12px;" } });
      actHeader.addEventListener("click", () => {
        const isOpen = actContent.style.display !== "none";
        actContent.style.display = isOpen ? "none" : "block";
        actArrow.textContent = isOpen ? "\u25B6" : "\u25BC";
      });
      new import_obsidian.Setting(actContent).setName("Display Name").addText((t) => t.setPlaceholder(activity.name).setValue(override?.name || "").onChange(async (v) => { this.updateActivityOverride(activity.name, "name", v || void 0); await this.plugin.saveSettings(); this.plugin.refreshRankView(); }));
      new import_obsidian.Setting(actContent).setName("Folder Path").addText((t) => t.setPlaceholder(activity.folder).setValue(override?.folder || "").onChange(async (v) => { this.updateActivityOverride(activity.name, "folder", v || void 0); await this.plugin.saveSettings(); this.plugin.refreshRankView(); }));
      new import_obsidian.Setting(actContent).setName("Field Name").addText((t) => t.setPlaceholder(activity.field).setValue(override?.field || "").onChange(async (v) => { this.updateActivityOverride(activity.name, "field", v || void 0); await this.plugin.saveSettings(); this.plugin.refreshRankView(); }));
      new import_obsidian.Setting(actContent).setName("Damage/Completion").addText((t) => t.setPlaceholder(String(activity.damagePerCompletion)).setValue(override?.damagePerCompletion !== void 0 ? String(override.damagePerCompletion) : "").onChange(async (v) => { const num = parseInt(v); this.updateActivityOverride(activity.name, "damagePerCompletion", isNaN(num) ? void 0 : num); await this.plugin.saveSettings(); this.plugin.refreshRankView(); }));
      new import_obsidian.Setting(actContent).setName("Weekly Target").addText((t) => t.setPlaceholder(String(activity.weeklyTarget || 7)).setValue(override?.weeklyTarget !== void 0 ? String(override.weeklyTarget) : "").onChange(async (v) => { const num = parseInt(v); this.updateActivityOverride(activity.name, "weeklyTarget", isNaN(num) ? void 0 : num); const s = this.getWeeklyTargetStats(); const hp = calculateBossHP(s.total, this.plugin.settings.currentTier, this.plugin.settings, s.lowest); this.plugin.settings.bossMaxHP = hp; if (this.plugin.settings.bossCurrentHP > hp) this.plugin.settings.bossCurrentHP = hp; await this.plugin.saveSettings(); this.plugin.refreshRankView(); }));
      new import_obsidian.Setting(actContent).addButton((btn) => btn.setButtonText("Reset").onClick(async () => { this.plugin.settings.activityOverrides = this.plugin.settings.activityOverrides.filter((o) => o.originalName !== activity.name); await this.plugin.saveSettings(); this.plugin.refreshRankView(); this.display(); }));
    });
  }

  /**
   * Boss Progression section
   */
  renderBossProgressionSection(body) {
    const containerEl = body;
    const stats = this.getWeeklyTargetStats();
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
      const tier1HP = stats.lowest * 4;
      const maxTierHP = Math.round(stats.total * this.plugin.settings.autoDynamicHPMaxMultiplier);
      const currentHP = calculateBossHP(stats.total, this.plugin.settings.currentTier, this.plugin.settings, stats.lowest);
      difficultyInfo.createEl("div", {
        text: `AUTO MODE: Current Tier ${this.plugin.settings.currentTier} HP = ${currentHP}`,
        attr: { style: "font-weight: 600; margin-bottom: 4px; color: #967b4d;" }
      });
      difficultyInfo.createEl("div", {
        text: `Tier 1: ${tier1HP} HP (${stats.lowest} lowest \xD7 4 weeks)`,
        attr: { style: "opacity: 0.8; margin-bottom: 2px;" }
      });
      difficultyInfo.createEl("div", {
        text: `Tier ${this.plugin.settings.maxTier}: ${maxTierHP} HP (${stats.total} total \xD7 ${this.plugin.settings.autoDynamicHPMaxMultiplier})`,
        attr: { style: "opacity: 0.7;" }
      });
    } else {
      const currentMultiplier = (this.plugin.settings.bossHPMultiplierMin + (this.plugin.settings.bossHPMultiplierMax - this.plugin.settings.bossHPMultiplierMin) * ((this.plugin.settings.currentTier - 1) / Math.max(1, this.plugin.settings.maxTier - 1))).toFixed(2);
      difficultyInfo.createEl("div", {
        text: `MANUAL MODE: Tier ${this.plugin.settings.currentTier} HP = ${stats.total} \xD7 ${currentMultiplier}`,
        attr: { style: "font-weight: 600; margin-bottom: 4px;" }
      });
      difficultyInfo.createEl("div", {
        text: `Range: Tier 1 (\xD7${this.plugin.settings.bossHPMultiplierMin}) \u2192 Tier ${this.plugin.settings.maxTier} (\xD7${this.plugin.settings.bossHPMultiplierMax})`,
        attr: { style: "opacity: 0.7;" }
      });
    }
    new import_obsidian.Setting(containerEl).setName("Auto-calculate HP (Dynamic Mode)").setDesc("ON: Tier 1 = easiest activity \xD7 4 weeks, Max tier = all activities \xD7 multiplier. OFF: Use manual multipliers.").addToggle(
      (t) => t.setValue(this.plugin.settings.useAutoDynamicHP).onChange(async (v) => {
        this.plugin.settings.useAutoDynamicHP = v;
        const stats2 = this.getWeeklyTargetStats();
        const newMaxHP = calculateBossHP(
          stats2.total,
          this.plugin.settings.currentTier,
          this.plugin.settings,
          stats2.lowest
        );
        this.plugin.settings.bossMaxHP = newMaxHP;
        if (this.plugin.settings.bossCurrentHP > newMaxHP) {
          this.plugin.settings.bossCurrentHP = newMaxHP;
        }
        await this.plugin.saveSettings();
        this.plugin.refreshRankView();
        this.display();
      })
    );
    if (this.plugin.settings.useAutoDynamicHP) {
      new import_obsidian.Setting(containerEl).setName("Max tier multiplier").setDesc(`Max tier HP = total weekly target (${stats.total}) \xD7 this value`).addText(
        (t) => t.setPlaceholder("1.5").setValue(String(this.plugin.settings.autoDynamicHPMaxMultiplier)).onChange(async (v) => {
          const num = parseFloat(v);
          if (!isNaN(num) && num >= 0.5 && num <= 10) {
            this.plugin.settings.autoDynamicHPMaxMultiplier = num;
            const stats2 = this.getWeeklyTargetStats();
            const newMaxHP = calculateBossHP(
              stats2.total,
              this.plugin.settings.currentTier,
              this.plugin.settings,
              stats2.lowest
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
      new import_obsidian.Setting(containerEl).setName("Starting difficulty (Tier 1)").setDesc("HP multiplier at Tier 1. Lower = easier start.").addText(
        (t) => t.setPlaceholder("1.1").setValue(String(this.plugin.settings.bossHPMultiplierMin)).onChange(async (v) => {
          const num = parseFloat(v);
          if (!isNaN(num) && num >= 0.5 && num <= 5) {
            this.plugin.settings.bossHPMultiplierMin = num;
            const stats2 = this.getWeeklyTargetStats();
            const newMaxHP = calculateBossHP(
              stats2.total,
              this.plugin.settings.currentTier,
              this.plugin.settings,
              stats2.lowest
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
      new import_obsidian.Setting(containerEl).setName("End game difficulty (Max Tier)").setDesc("HP multiplier at the highest tier. Higher = harder end game.").addText(
        (t) => t.setPlaceholder("2.4").setValue(String(this.plugin.settings.bossHPMultiplierMax)).onChange(async (v) => {
          const num = parseFloat(v);
          if (!isNaN(num) && num >= 0.5 && num <= 10) {
            this.plugin.settings.bossHPMultiplierMax = num;
            const stats2 = this.getWeeklyTargetStats();
            const newMaxHP = calculateBossHP(
              stats2.total,
              this.plugin.settings.currentTier,
              this.plugin.settings,
              stats2.lowest
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
    new import_obsidian.Setting(containerEl).setName("Maximum tier").setDesc("The highest tier in the progression system (default 13 = 13 bosses)").addText(
      (t) => t.setPlaceholder("13").setValue(String(this.plugin.settings.maxTier)).onChange(async (v) => {
        const num = parseInt(v);
        if (!isNaN(num) && num >= 2 && num <= 100) {
          this.plugin.settings.maxTier = num;
          const stats2 = this.getWeeklyTargetStats();
          const newMaxHP = calculateBossHP(
            stats2.total,
            this.plugin.settings.currentTier,
            this.plugin.settings,
            stats2.lowest
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
    new import_obsidian.Setting(containerEl).setName("Reset difficulty scaling").setDesc("Restore default difficulty settings").addButton(
      (btn) => btn.setButtonText("Reset Defaults").onClick(async () => {
        this.plugin.settings.useAutoDynamicHP = false;
        this.plugin.settings.autoDynamicHPMaxMultiplier = 1.5;
        this.plugin.settings.bossHPMultiplierMin = 1.1;
        this.plugin.settings.bossHPMultiplierMax = 2.4;
        this.plugin.settings.maxTier = 13;
        const stats2 = this.getWeeklyTargetStats();
        const newMaxHP = calculateBossHP(
          stats2.total,
          this.plugin.settings.currentTier,
          this.plugin.settings,
          stats2.lowest
        );
        this.plugin.settings.bossMaxHP = newMaxHP;
        if (this.plugin.settings.bossCurrentHP > newMaxHP) {
          this.plugin.settings.bossCurrentHP = newMaxHP;
        }
        await this.plugin.saveSettings();
        this.plugin.refreshRankView();
        this.display();
        new import_obsidian.Notice("Difficulty scaling reset to defaults");
      })
    );
    new import_obsidian.Setting(containerEl).setName("Reset boss progression").setDesc("\u26A0\uFE0F Resets to Tier 1 and full HP").addButton(
      (btn) => btn.setButtonText("Reset").setWarning().onClick(async () => {
        this.plugin.settings.currentTier = 1;
        const stats2 = this.getWeeklyTargetStats();
        this.plugin.settings.bossMaxHP = calculateBossHP(stats2.total, 1, this.plugin.settings, stats2.lowest);
        this.plugin.settings.bossCurrentHP = this.plugin.settings.bossMaxHP;
        this.plugin.settings.consecutivePerfectWeeks = 0;
        this.plugin.settings.disciplineTokens = 0;
        this.plugin.settings.disciplineCompletionCount = 0;
        this.plugin.settings.inTartarus = false;
        await this.plugin.saveSettings();
        this.plugin.refreshRankView();
        new import_obsidian.Notice("Boss progression reset to Tier 1");
      })
    );
    new import_obsidian.Setting(containerEl).setName("Boss Editor").setDesc("Customize boss names, descriptions, lore, and images").setHeading();
    new import_obsidian.Setting(containerEl).setName("Reset all boss customizations").setDesc("Restore all bosses to their default values").addButton(
      (btn) => btn.setButtonText("Reset All").setWarning().onClick(async () => {
        this.plugin.settings.customBosses = [];
        await this.plugin.saveSettings();
        this.plugin.refreshRankView();
        this.display();
        new import_obsidian.Notice("All boss customizations reset");
      })
    );
    BOSSES.forEach((boss, index) => {
      const bossIndex = index + 1;
      const customOverride = this.plugin.settings.customBosses?.find((c) => c.tier === bossIndex);
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
      const isCustomized = customOverride ? " \u270F\uFE0F" : "";
      header.createEl("span", {
        text: `Tier ${boss.tier}: ${currentName}${isCustomized}`,
        attr: {
          style: "font-weight: 600;"
        }
      });
      const expandIcon = header.createEl("span", {
        text: "\u25BC",
        attr: {
          style: "transition: transform 0.2s;"
        }
      });
      const content = bossContainer.createDiv({
        cls: "track-habit-rank-dev-section-content",
        attr: {
          style: `
            padding: 12px 16px;
            display: none;
          `
        }
      });
      let isExpanded = false;
      header.addEventListener("click", () => {
        isExpanded = !isExpanded;
        content.style.display = isExpanded ? "block" : "none";
        expandIcon.style.transform = isExpanded ? "rotate(180deg)" : "rotate(0deg)";
      });
      new import_obsidian.Setting(content).setName("Boss Name").addText(
        (t) => t.setPlaceholder(boss.name).setValue(customOverride?.name || "").onChange(async (v) => {
          this.updateBossOverride(bossIndex, "name", v || void 0);
          await this.plugin.saveSettings();
          this.plugin.refreshRankView();
        })
      );
      new import_obsidian.Setting(content).setName("Rank Title").addText(
        (t) => t.setPlaceholder(boss.rank).setValue(customOverride?.rank || "").onChange(async (v) => {
          this.updateBossOverride(bossIndex, "rank", v || void 0);
          await this.plugin.saveSettings();
          this.plugin.refreshRankView();
        })
      );
      new import_obsidian.Setting(content).setName("Description").addTextArea(
        (t) => t.setPlaceholder(boss.description).setValue(customOverride?.description || "").onChange(async (v) => {
          this.updateBossOverride(bossIndex, "description", v || void 0);
          await this.plugin.saveSettings();
          this.plugin.refreshRankView();
        })
      );
      new import_obsidian.Setting(content).setName("Lore").addTextArea(
        (t) => t.setPlaceholder(boss.lore).setValue(customOverride?.lore || "").onChange(async (v) => {
          this.updateBossOverride(bossIndex, "lore", v || void 0);
          await this.plugin.saveSettings();
          this.plugin.refreshRankView();
        })
      );
      new import_obsidian.Setting(content).setName("Image URL").setDesc("URL to boss image (external link or vault path)").addText(
        (t) => t.setPlaceholder("https://... or vault/path/to/image.png").setValue(customOverride?.image || "").onChange(async (v) => {
          this.updateBossOverride(bossIndex, "image", v || void 0);
          await this.plugin.saveSettings();
          this.plugin.refreshRankView();
        })
      );
      new import_obsidian.Setting(content).setName("Image at 50% HP").setDesc("Boss image when HP drops below 50% (optional)").addText(
        (t) => t.setPlaceholder("https://... or vault/path/to/image.png").setValue(customOverride?.image50 || "").onChange(async (v) => {
          this.updateBossOverride(bossIndex, "image50", v || void 0);
          await this.plugin.saveSettings();
          this.plugin.refreshRankView();
        })
      );
      new import_obsidian.Setting(content).setName("Image at 20% HP").setDesc("Boss image when HP drops below 20% (optional)").addText(
        (t) => t.setPlaceholder("https://... or vault/path/to/image.png").setValue(customOverride?.image20 || "").onChange(async (v) => {
          this.updateBossOverride(bossIndex, "image20", v || void 0);
          await this.plugin.saveSettings();
          this.plugin.refreshRankView();
        })
      );
      new import_obsidian.Setting(content).addButton(
        (btn) => btn.setButtonText("Reset This Boss").onClick(async () => {
          this.plugin.settings.customBosses = this.plugin.settings.customBosses?.filter(
            (c) => c.tier !== bossIndex
          ) || [];
          await this.plugin.saveSettings();
          this.plugin.refreshRankView();
          this.display();
          new import_obsidian.Notice(`${boss.name} reset to defaults`);
        })
      );
    });
  }

  /**
   * Tartarus & Penance section
   */
  renderTartarusSection(body) {
    const containerEl = body;
    new import_obsidian.Setting(containerEl).setName("Tartarus image").setDesc("Custom image shown when in Tartarus (URL or vault path)").addText(
      (t) => t.setPlaceholder("https://... or vault/path/to/image.png").setValue(this.plugin.settings.tartarusImage || "").onChange(async (v) => {
        this.plugin.settings.tartarusImage = v || null;
        await this.plugin.saveSettings();
        this.plugin.refreshRankView();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Tartarus background image").setDesc("Separate background for Tartarus view (falls back to dashboard background if empty)").addText(
      (t) => t.setPlaceholder("https://... or vault/path/to/image.png").setValue(this.plugin.settings.tartarusBackgroundImage || "").onChange(async (v) => {
        this.plugin.settings.tartarusBackgroundImage = v || null;
        await this.plugin.saveSettings();
        this.plugin.refreshRankView();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Reset all Tartarus tasks").addButton(
      (btn) => btn.setButtonText("Reset All").setWarning().onClick(async () => {
        this.plugin.settings.customTartarusTasks = [];
        await this.plugin.saveSettings();
        this.display();
      })
    );

    const tartarusRanges = [
      { range: "low", label: "Low (Tiers 1-4)", tiers: [1, 4] },
      { range: "mid", label: "Mid (Tiers 5-9)", tiers: [5, 9] },
      { range: "high", label: "High (Tiers 10+)", tiers: [10, 13] }
    ];
    tartarusRanges.forEach(({ range, label }) => {
      const rangeContainer = containerEl.createDiv({ attr: { style: "margin-top: 8px; border: 1px solid var(--background-modifier-border); border-radius: 6px; overflow: hidden;" } });
      const rangeHeader = rangeContainer.createDiv({ attr: { style: "display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--background-secondary); cursor: pointer;" } });
      rangeHeader.createEl("span", { text: label, attr: { style: "font-weight: 500; font-size: 0.9em;" } });
      const rangeArrow = rangeHeader.createEl("span", { text: "\u25B6", attr: { style: "font-size: 9px;" } });
      const content = rangeContainer.createDiv({ attr: { style: "display: none; padding: 8px 12px;" } });
      rangeHeader.addEventListener("click", () => {
        const isOpen = content.style.display !== "none";
        content.style.display = isOpen ? "none" : "block";
        rangeArrow.textContent = isOpen ? "\u25B6" : "\u25BC";
      });

      // Get tasks from the correct format: { tierRange, tasks: [{id, description}] }
      const customEntry = this.plugin.settings.customTartarusTasks?.find(t => t.tierRange === range && t.tasks);
      const tasks = customEntry?.tasks?.length ? customEntry.tasks : (DEFAULT_TARTARUS_TASKS[range] || []);

      tasks.forEach((task, taskIndex) => {
        const row = new import_obsidian.Setting(content).setName(`Task ${taskIndex + 1}`).addText(
          (t) => t.setValue(task.description).onChange(async (v) => {
            this.updateTartarusTask(range, taskIndex, v);
            await this.plugin.saveSettings();
          })
        );
        row.addButton((btn) => btn.setButtonText("Remove").setWarning().onClick(async () => {
          this.removeTartarusTask(range, taskIndex);
          await this.plugin.saveSettings();
          this.display();
        }));
      });
      const btnRow = new import_obsidian.Setting(content);
      btnRow.addButton(
        (btn) => btn.setButtonText("Add Task").onClick(async () => {
          this.addTartarusTask(range);
          await this.plugin.saveSettings();
          this.display();
        })
      );
      btnRow.addButton(
        (btn) => btn.setButtonText("Reset to Defaults").onClick(async () => {
          this.plugin.settings.customTartarusTasks = (this.plugin.settings.customTartarusTasks || []).filter((t) => t.tierRange !== range);
          await this.plugin.saveSettings();
          this.display();
        })
      );
    });
  }

  /**
   * Temple Upkeep section — manage maintenance tasks (bathing, grooming, etc.)
   */
  renderTempleUpkeepSection(body) {
    body.createEl("div", {
      text: "Personal maintenance tasks with recurring intervals. Mark them complete and they'll reset on schedule.",
      attr: { style: "font-size: 0.8em; color: var(--text-muted); margin-bottom: 12px;" }
    });

    const tasks = this.plugin.settings.templeTasks || DEFAULT_SETTINGS.templeTasks;
    const now = new Date(getEffectiveNow(this.plugin.settings));

    tasks.forEach((task, index) => {
      const lastDone = task.lastCompleted ? new Date(task.lastCompleted) : null;
      const daysSince = lastDone ? Math.floor((now.getTime() - lastDone.getTime()) / (24 * 60 * 60 * 1e3)) : null;
      const isOverdue = daysSince !== null && daysSince >= task.intervalDays;
      const isDue = daysSince !== null && daysSince >= task.intervalDays - 1;
      const statusText = lastDone === null ? "Never done" : isOverdue ? `Overdue (${daysSince}d ago)` : `${daysSince}d ago`;

      const taskRow = body.createDiv({
        attr: {
          style: `
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 12px;
            margin-bottom: 6px;
            background: var(--background-secondary);
            border-radius: 6px;
            border-left: 3px solid ${isOverdue ? 'var(--text-error)' : isDue ? 'var(--interactive-accent)' : 'var(--background-modifier-border)'};
          `
        }
      });

      // Emoji
      taskRow.createEl("span", { text: task.emoji || "", attr: { style: "font-size: 18px; width: 24px;" } });

      // Info
      const info = taskRow.createDiv({ attr: { style: "flex: 1;" } });
      info.createEl("div", { text: task.name, attr: { style: "font-weight: 600; font-size: 0.95em;" } });
      info.createEl("div", {
        text: `Every ${task.intervalDays}d \u2022 ${statusText}`,
        attr: { style: `font-size: 0.8em; color: ${isOverdue ? 'var(--text-error)' : 'var(--text-muted)'};` }
      });

      // Complete button
      const completeBtn = taskRow.createEl("button", {
        text: isOverdue || lastDone === null ? "Do" : "Done",
        attr: {
          style: `
            padding: 4px 12px; min-height: 32px; border-radius: 4px; cursor: pointer; border: none; font-size: 0.85em; font-weight: 600;
            ${isOverdue || lastDone === null ? 'background: var(--interactive-accent); color: var(--text-on-accent);' : 'background: var(--background-modifier-border); color: var(--text-muted);'}
          `
        }
      });
      completeBtn.onclick = async () => {
        this.plugin.settings.templeTasks[index].lastCompleted = new Date().toISOString();
        await this.plugin.saveSettings();
        this.display();
        new import_obsidian.Notice(`${task.emoji} ${task.name} completed!`);
      };
    });

    // Customize intervals
    body.createEl("div", { text: "CUSTOMIZE INTERVALS", attr: { style: "font-size: 0.75em; font-weight: 600; letter-spacing: 1.5px; margin: 16px 0 8px 0; color: var(--text-muted);" } });

    tasks.forEach((task, index) => {
      new import_obsidian.Setting(body).setName(`${task.emoji} ${task.name} interval (days)`).addText(
        (t) => {
          t.setPlaceholder(String(task.intervalDays))
            .setValue(String(task.intervalDays))
            .onChange(async (v) => {
              const num = parseInt(v);
              if (!isNaN(num) && num > 0) {
                this.plugin.settings.templeTasks[index].intervalDays = num;
                await this.plugin.saveSettings();
              }
            });
          t.inputEl.style.width = "60px";
          t.inputEl.type = "number";
        }
      );
    });

    // Add custom task
    body.createEl("div", { text: "ADD CUSTOM TASK", attr: { style: "font-size: 0.75em; font-weight: 600; letter-spacing: 1.5px; margin: 16px 0 8px 0; color: var(--text-muted);" } });
    const addRow = body.createDiv({ attr: { style: "display: flex; gap: 8px; align-items: center; margin-bottom: 8px;" } });
    let newName = "";
    let newInterval = 7;
    let newEmoji = "";

    new import_obsidian.Setting(body).setName("Task name").addText(
      (t) => t.setPlaceholder("e.g., Laundry").onChange((v) => { newName = v; })
    );
    new import_obsidian.Setting(body).setName("Interval (days)").addText(
      (t) => {
        t.setPlaceholder("7").onChange((v) => { newInterval = parseInt(v) || 7; });
        t.inputEl.style.width = "60px";
        t.inputEl.type = "number";
      }
    );
    new import_obsidian.Setting(body).setName("Emoji").addText(
      (t) => {
        t.setPlaceholder("").onChange((v) => { newEmoji = v; });
        t.inputEl.style.width = "60px";
      }
    );
    new import_obsidian.Setting(body).addButton(
      (btn) => btn.setButtonText("+ Add Task").setCta().onClick(async () => {
        if (!newName.trim()) {
          new import_obsidian.Notice("Enter a task name");
          return;
        }
        this.plugin.settings.templeTasks.push({
          id: `custom-${Date.now()}`,
          name: newName.trim(),
          lastCompleted: null,
          intervalDays: newInterval,
          emoji: newEmoji || ""
        });
        await this.plugin.saveSettings();
        this.display();
        new import_obsidian.Notice(`Added "${newName.trim()}" to temple upkeep`);
      })
    );
  }

  /**
   * System & Tools section
   */
  renderSystemSection(body) {
    // Pause
    body.createEl("div", { text: "PAUSE SYSTEM", attr: { style: "font-size: 0.75em; font-weight: 600; letter-spacing: 1.5px; margin-bottom: 8px; color: var(--text-muted);" } });
    const pauseBtn = body.createEl("button", {
      text: this.plugin.settings.systemState === "paused" ? "Resume System" : "Pause System",
      attr: {
        style: `
          width: 100%; padding: 12px; min-height: 44px; font-weight: 600; border-radius: 6px; cursor: pointer; border: none; margin-bottom: 8px;
          ${this.plugin.settings.systemState === "paused" ? "background: var(--interactive-accent); color: var(--text-on-accent);" : "background: var(--background-modifier-border); color: var(--text-normal);"}
        `
      }
    });
    pauseBtn.onclick = async () => { await this.plugin.toggleSystemState(); this.display(); };
    if (this.plugin.settings.totalPausedTime > 0 || this.plugin.settings.systemState === "paused") {
      body.createEl("div", {
        text: this.plugin.settings.systemState === "paused" ? `PAUSED \u2014 ${this.plugin.getPauseDurationDisplay()} (Total: ${this.plugin.getTotalPausedDisplay()})` : `Total paused: ${this.plugin.getTotalPausedDisplay()}`,
        attr: { style: "font-size: 0.8em; opacity: 0.7; text-align: center; margin-bottom: 12px;" }
      });
    }

    // Developer Dashboard
    body.createEl("div", { text: "DEVELOPER TOOLS", attr: { style: "font-size: 0.75em; font-weight: 600; letter-spacing: 1.5px; margin: 12px 0 8px 0; color: var(--text-muted);" } });
    const devBtn = body.createEl("button", {
      text: "Open Developer Dashboard",
      attr: { style: "width: 100%; padding: 12px; min-height: 44px; font-weight: 600; border-radius: 6px; cursor: pointer; background: var(--interactive-accent); color: var(--text-on-accent); border: none; margin-bottom: 8px;" }
    });
    devBtn.onclick = () => this.plugin.activateDevDashboard();
    new import_obsidian.Setting(body).setName("Debug logging").addToggle(
      (toggle) => toggle.setValue(true).onChange((enabled) => {
        debugLog.setEnabled(enabled);
        new import_obsidian.Notice(enabled ? "Debug logging enabled" : "Debug logging disabled");
      })
    );
  }
  /**
   * Render the reward pools configuration section — 3 separate pools.
   */
  renderRewardPoolsSection(containerEl) {
    new import_obsidian.Setting(containerEl).setName("Reward Pools").setDesc("Configure separate rewards for activities, streaks, and boss defeats").setHeading();

    const poolTypes = [
      { key: "activityRewardPools", label: "Activity Rewards", icon: "\u{1F3AF}", desc: "Earned from activity milestones" },
      { key: "streakRewardPools", label: "Streak Rewards", icon: "\u{1F525}", desc: "Earned from consecutive weeks" },
      { key: "bossRewardPools", label: "Boss Rewards", icon: "\u2694\uFE0F", desc: "Earned from defeating bosses" }
    ];

    const tierDisplayNames = {
      micro: "Micro (Tiers 1-2)",
      mini: "Mini (Tiers 3-5)",
      standard: "Standard (Tiers 6-8)",
      quality: "Quality (Tiers 9-11)",
      premium: "Premium (Tiers 12-13)"
    };
    const tiers = ["micro", "mini", "standard", "quality", "premium"];

    poolTypes.forEach(({ key, label, icon, desc }) => {
      const poolTypeSection = containerEl.createDiv({
        attr: {
          style: `
            margin-top: 16px;
            border: 1px solid var(--background-modifier-border);
            border-radius: 8px;
            overflow: hidden;
          `
        }
      });
      let poolTypeExpanded = false;
      const poolTypeHeader = poolTypeSection.createDiv({
        attr: {
          style: `
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 16px;
            background: var(--background-secondary);
            cursor: pointer;
            user-select: none;
            min-height: 44px;
          `
        }
      });
      const poolTypeArrow = poolTypeHeader.createEl("span", {
        text: "\u25B6",
        attr: { style: "font-size: 10px; transition: transform 0.2s; width: 12px;" }
      });
      poolTypeHeader.createEl("span", {
        text: `${icon}  ${label}`,
        attr: { style: "font-weight: 600; font-size: 0.95em;" }
      });
      poolTypeHeader.createEl("span", {
        text: desc,
        attr: { style: "font-size: 0.75em; color: var(--text-muted); margin-left: auto;" }
      });
      const poolTypeBody = poolTypeSection.createDiv({
        attr: { style: "display: none; padding: 8px 16px;" }
      });
      poolTypeHeader.addEventListener("click", () => {
        poolTypeExpanded = !poolTypeExpanded;
        poolTypeBody.style.display = poolTypeExpanded ? "block" : "none";
        poolTypeArrow.textContent = poolTypeExpanded ? "\u25BC" : "\u25B6";
      });

      tiers.forEach((tier) => {
        const pools = this.plugin.settings[key] || [];
        const pool = pools.find((p) => p.tier === tier) || { tier, options: [] };
        const poolContainer = poolTypeBody.createDiv({
          attr: {
            style: `
              margin-top: 8px;
              border: 1px solid var(--background-modifier-border);
              border-radius: 6px;
              overflow: hidden;
            `
          }
        });
        let isExpanded = false;
        const header = poolContainer.createDiv({
          attr: {
            style: `
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 10px 14px;
              background: var(--background-primary-alt);
              cursor: pointer;
              user-select: none;
            `
          }
        });
        header.createEl("span", {
          text: `${tierDisplayNames[tier]} (${pool.options.length} rewards)`,
          attr: { style: "font-weight: 500; font-size: 0.9em;" }
        });
        const expandIcon = header.createEl("span", {
          text: "\u25BC",
          attr: { style: "transition: transform 0.2s ease; font-size: 10px;" }
        });
        const content = poolContainer.createDiv({
          attr: { style: "display: none; padding: 12px;" }
        });
        header.addEventListener("click", () => {
          isExpanded = !isExpanded;
          content.style.display = isExpanded ? "block" : "none";
          expandIcon.style.transform = isExpanded ? "rotate(180deg)" : "rotate(0deg)";
        });

        pool.options.forEach((option, optionIndex) => {
          const optionBox = content.createDiv({
            attr: {
              style: `
                margin-bottom: 12px;
                padding: 12px;
                background: var(--background-primary);
                border-radius: 6px;
                border: 1px solid var(--background-modifier-border);
              `
            }
          });

          const previewRow = optionBox.createDiv({
            attr: { style: "display: flex; align-items: center; gap: 12px; margin-bottom: 12px;" }
          });
          const previewCard = previewRow.createDiv({
            attr: {
              style: "width: 50px; height: 56px; background: #1a1410; border: 1px solid #613134; display: flex; align-items: center; justify-content: center;"
            }
          });
          if (option.image) {
            const img = previewCard.createEl("img", {
              attr: { src: option.image, style: "max-width: 36px; max-height: 36px; object-fit: contain;" }
            });
            img.onerror = () => {
              img.remove();
              previewCard.createEl("div", { text: option.emoji || "\u{1F381}", attr: { style: "font-size: 22px;" } });
            };
          } else {
            previewCard.createEl("div", { text: option.emoji || "\u{1F381}", attr: { style: "font-size: 22px;" } });
          }
          previewRow.createEl("div", {
            text: option.description || "[Reward name]",
            attr: { style: "font-size: 12px; color: var(--text-muted);" }
          });

          new import_obsidian.Setting(optionBox).setName(`Reward ${optionIndex + 1} Name`).addText(
            (t) => t.setPlaceholder("Reward description").setValue(option.description).onChange(async (v) => {
              this.updateRewardOption(key, tier, optionIndex, "description", v);
              await this.plugin.saveSettings();
            })
          );
          new import_obsidian.Setting(optionBox).setName("Emoji").addText(
            (t) => t.setPlaceholder("\u{1F381}").setValue(option.emoji || "").onChange(async (v) => {
              this.updateRewardOption(key, tier, optionIndex, "emoji", v);
              await this.plugin.saveSettings();
            })
          );
          new import_obsidian.Setting(optionBox).setName("Image URL").setDesc("Vault path or external URL").addText(
            (t) => t.setPlaceholder("path/to/image.png").setValue(option.image || "").onChange(async (v) => {
              this.updateRewardOption(key, tier, optionIndex, "image", v);
              await this.plugin.saveSettings();
            })
          );
          new import_obsidian.Setting(optionBox).addButton(
            (btn) => btn.setButtonText("Delete Reward").setWarning().onClick(async () => {
              this.removeRewardOption(key, tier, optionIndex);
              await this.plugin.saveSettings();
              this.display();
            })
          );
        });

        if (pool.options.length < 7) {
          new import_obsidian.Setting(content).addButton(
            (btn) => btn.setButtonText("+ Add Reward").setCta().onClick(async () => {
              this.addRewardOption(key, tier);
              await this.plugin.saveSettings();
              this.display();
            })
          );
        }
      });
    });

    new import_obsidian.Setting(containerEl).setName("Reset all reward pools").setDesc("Restore all pools to default placeholders").addButton(
      (btn) => btn.setButtonText("Reset All Pools").setWarning().onClick(async () => {
        this.plugin.settings.activityRewardPools = JSON.parse(JSON.stringify(DEFAULT_SETTINGS.activityRewardPools));
        this.plugin.settings.streakRewardPools = JSON.parse(JSON.stringify(DEFAULT_SETTINGS.streakRewardPools));
        this.plugin.settings.bossRewardPools = JSON.parse(JSON.stringify(DEFAULT_SETTINGS.bossRewardPools));
        await this.plugin.saveSettings();
        this.display();
        new import_obsidian.Notice("All reward pools reset to defaults");
      })
    );
  }
  /**
   * Update a reward option field in a specific pool type.
   */
  updateRewardOption(poolKey, tier, index, field, value) {
    let pools = this.plugin.settings[poolKey];
    if (!pools) {
      pools = [];
      this.plugin.settings[poolKey] = pools;
    }
    let pool = pools.find((p) => p.tier === tier);
    if (!pool) {
      pool = { tier, options: [] };
      pools.push(pool);
    }
    if (pool.options[index]) {
      pool.options[index][field] = value;
    }
  }
  /**
   * Add a new reward option to a specific pool type.
   */
  addRewardOption(poolKey, tier) {
    let pools = this.plugin.settings[poolKey];
    if (!pools) {
      pools = [];
      this.plugin.settings[poolKey] = pools;
    }
    let pool = pools.find((p) => p.tier === tier);
    if (!pool) {
      pool = { tier, options: [] };
      pools.push(pool);
    }
    const prefix = poolKey.replace("RewardPools", "").slice(0, 3);
    const newId = `${prefix}-${tier}-${Date.now()}`;
    pool.options.push({ id: newId, description: "[New reward]", emoji: "\u{1F381}", image: "" });
  }
  /**
   * Remove a reward option from a specific pool type.
   */
  removeRewardOption(poolKey, tier, index) {
    const pools = this.plugin.settings[poolKey];
    if (!pools) return;
    const pool = pools.find((p) => p.tier === tier);
    if (pool && pool.options[index]) {
      pool.options.splice(index, 1);
    }
  }
  calculateWeeklyTarget() {
    const allActivities = [
      ...getEffectiveActivities(this.plugin.settings).filter((a) => this.plugin.settings.enabledActivities[a._originalName] ?? true),
      ...this.plugin.settings.customHabits.filter((h) => h.enabled)
    ];
    return allActivities.reduce((sum, a) => {
      return sum + (a.weeklyTarget || 7);
    }, 0);
  }
  /**
   * Get both total and lowest weekly target for dynamic HP calculation.
   */
  getWeeklyTargetStats() {
    const allActivities = [
      ...getEffectiveActivities(this.plugin.settings).filter((a) => this.plugin.settings.enabledActivities[a._originalName] ?? true),
      ...this.plugin.settings.customHabits.filter((h) => h.enabled)
    ];
    if (allActivities.length === 0) {
      return { total: 7, lowest: 1 };
    }
    const targets = allActivities.map((a) => a.weeklyTarget || 7);
    return {
      total: targets.reduce((sum, t) => sum + t, 0),
      lowest: Math.min(...targets)
    };
  }
  /**
   * Creates a mobile-friendly stat card for the Quick Stats section.
   */
  createStatCard(parent, label, value, color) {
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
  updateBossOverride(bossIndex, field, value) {
    if (!this.plugin.settings.customBosses) {
      this.plugin.settings.customBosses = [];
    }
    let override = this.plugin.settings.customBosses.find((c) => c.tier === bossIndex);
    if (!override) {
      override = { tier: bossIndex };
      this.plugin.settings.customBosses.push(override);
    }
    if (field === "tier") return;
    if (field === "name") override.name = value;
    else if (field === "rank") override.rank = value;
    else if (field === "description") override.description = value;
    else if (field === "lore") override.lore = value;
    else if (field === "image") override.image = value;
    else if (field === "image50") override.image50 = value;
    else if (field === "image20") override.image20 = value;
    const hasCustomizations = override.name || override.rank || override.description || override.lore || override.image || override.image50 || override.image20;
    if (!hasCustomizations) {
      this.plugin.settings.customBosses = this.plugin.settings.customBosses.filter(
        (c) => c.tier !== bossIndex
      );
    }
  }
  /**
   * Updates or creates a tier figure entry.
   * If image is empty and no settings, removes the entry.
   */
  updateTierFigure(tier, field, value) {
    if (!this.plugin.settings.tierFigures) {
      this.plugin.settings.tierFigures = [];
    }
    let figure = this.plugin.settings.tierFigures.find((f) => f.tier === tier);
    if (!figure) {
      figure = { tier, position: 'left', hideTierTitle: false, image: '', scale: 1.0, offsetX: 0, offsetY: 0 };
      this.plugin.settings.tierFigures.push(figure);
    }
    if (field === "tier") return;
    figure[field] = value;

    // Remove entries with no image
    this.plugin.settings.tierFigures = this.plugin.settings.tierFigures.filter(f => f.image);
  }
  /**
   * Helper method to update activity overrides.
   * Creates override if none exists, cleans up if all fields are empty.
   */
  updateActivityOverride(originalName, field, value) {
    if (!this.plugin.settings.activityOverrides) {
      this.plugin.settings.activityOverrides = [];
    }
    let override = this.plugin.settings.activityOverrides.find((o) => o.originalName === originalName);
    if (!override) {
      override = { originalName };
      this.plugin.settings.activityOverrides.push(override);
    }
    if (field === "originalName") return;
    if (field === "name") override.name = value;
    else if (field === "folder") override.folder = value;
    else if (field === "field") override.field = value;
    else if (field === "damagePerCompletion") override.damagePerCompletion = value;
    else if (field === "weeklyTarget") override.weeklyTarget = value;
    else if (field === "trackingMode") override.trackingMode = value;
    else if (field === "damagePerWeek") override.damagePerWeek = value;
    const hasCustomizations = override.name || override.folder || override.field || override.damagePerCompletion !== void 0 || override.weeklyTarget !== void 0 || override.trackingMode || override.damagePerWeek !== void 0;
    if (!hasCustomizations) {
      this.plugin.settings.activityOverrides = this.plugin.settings.activityOverrides.filter(
        (o) => o.originalName !== originalName
      );
    }
  }
  /**
   * Updates a Tartarus task description at a specific index for a tier range.
   * Creates custom entry if none exists.
   */
  updateTartarusTask(tierRange, taskIndex, description) {
    if (!this.plugin.settings.customTartarusTasks) {
      this.plugin.settings.customTartarusTasks = [];
    }
    let customEntry = this.plugin.settings.customTartarusTasks.find((t) => t.tierRange === tierRange);
    if (!customEntry) {
      customEntry = {
        tierRange,
        tasks: DEFAULT_TARTARUS_TASKS[tierRange].map((t) => ({ id: t.id, description: t.description }))
      };
      this.plugin.settings.customTartarusTasks.push(customEntry);
    }
    if (taskIndex < customEntry.tasks.length) {
      customEntry.tasks[taskIndex].description = description;
      customEntry.tasks[taskIndex].id = `custom-${taskIndex}-${Date.now()}`;
    }
  }
  /**
   * Adds a new Tartarus task to a tier range.
   */
  addTartarusTask(tierRange) {
    if (!this.plugin.settings.customTartarusTasks) {
      this.plugin.settings.customTartarusTasks = [];
    }
    let customEntry = this.plugin.settings.customTartarusTasks.find((t) => t.tierRange === tierRange);
    if (!customEntry) {
      customEntry = {
        tierRange,
        tasks: DEFAULT_TARTARUS_TASKS[tierRange].map((t) => ({ id: t.id, description: t.description }))
      };
      this.plugin.settings.customTartarusTasks.push(customEntry);
    }
    customEntry.tasks.push({
      id: `custom-${Date.now()}`,
      description: "New penance task"
    });
  }
  /**
   * Removes a Tartarus task from a tier range.
   */
  removeTartarusTask(tierRange, taskIndex) {
    if (!this.plugin.settings.customTartarusTasks) return;
    let customEntry = this.plugin.settings.customTartarusTasks.find((t) => t.tierRange === tierRange);
    if (!customEntry) {
      customEntry = {
        tierRange,
        tasks: DEFAULT_TARTARUS_TASKS[tierRange].map((t) => ({ id: t.id, description: t.description }))
      };
      this.plugin.settings.customTartarusTasks.push(customEntry);
    }
    if (taskIndex < customEntry.tasks.length) {
      customEntry.tasks.splice(taskIndex, 1);
    }
    if (customEntry.tasks.length === 0) {
      this.plugin.settings.customTartarusTasks = this.plugin.settings.customTartarusTasks.filter(
        (t) => t.tierRange !== tierRange
      );
    }
  }
};
var TrackHabitRankPlugin = class extends import_obsidian.Plugin {
  async onload() {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      await this.loadData()
    );
    await this.migrateSettings();
    this.registerView(
      VIEW_TYPE_RANK,
      (leaf) => new TrackRankView(leaf, this)
    );
    this.registerView(
      VIEW_TYPE_DEV_DASHBOARD,
      (leaf) => new DeveloperDashboardView(leaf, this)
    );
    const refresh = (0, import_obsidian.debounce)(async () => {
      debugLog.log("META", "Metadata cache changed - running checks");
      // Reset start-of-day HP tracking (once per day)
      const effectiveToday = getEffectiveTodayISO(this.settings);
      if (this.settings.lastHPResetDate !== effectiveToday) {
        this.settings.bossStartOfDayHP = this.settings.bossCurrentHP;
        this.settings.lastHPResetDate = effectiveToday;
      }
      await this.processNewCompletions();
      await this.checkBossDefeated();
      await this.checkDeathThreshold();
      await this.checkPerfectWeek();
      await this.checkRewardExpiration();
      await this.saveSettings();
      this.refreshRankView();
    }, 300);
    this.registerEvent(
      this.app.metadataCache.on("changed", refresh)
    );
    this.registerEvent(
      this.app.vault.on("create", async (file) => {
        if (file instanceof import_obsidian.TFile && file.extension === "md") {
          debugLog.log("META", "New file created - waiting for metadata", { path: file.path });
          let attempts = 0;
          const maxAttempts = 20;
          while (attempts < maxAttempts) {
            const cache = this.app.metadataCache.getFileCache(file);
            if (cache?.frontmatter) {
              debugLog.log("META", "Metadata ready for new file", {
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
          debugLog.log("META", "Metadata not available after timeout, running refresh anyway", { path: file.path });
          refresh();
        }
      })
    );
    this.registerEvent(
      this.app.vault.on("rename", (file, oldPath) => {
        if (file instanceof import_obsidian.TFile && file.extension === "md") {
          debugLog.log("META", "File renamed - running refresh", { oldPath, newPath: file.path });
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
          new import_obsidian.Notice("Cannot deal damage while in Tartarus");
          return;
        }
        await this.dealDamage(5);
        new import_obsidian.Notice("\u{1F4A5} 5 damage dealt to boss (manual test)");
      }
    });
    this.addCommand({
      id: "add-discipline-token",
      name: "[DEV] Add discipline token",
      callback: async () => {
        this.settings.disciplineTokens = Math.min(3, this.settings.disciplineTokens + 1);
        await this.saveSettings();
        this.refreshRankView();
        new import_obsidian.Notice(`\u{1F48E} Token added (${this.settings.disciplineTokens}/3)`);
      }
    });
    this.addCommand({
      id: "test-perfect-week",
      name: "[DEV] Toggle perfect week streak",
      callback: async () => {
        this.settings.consecutivePerfectWeeks = (this.settings.consecutivePerfectWeeks + 1) % 6;
        await this.saveSettings();
        this.refreshRankView();
        new import_obsidian.Notice(`Perfect weeks: ${this.settings.consecutivePerfectWeeks}`);
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
    const data = this.settings;
    if (data.rankGraceRR !== void 0) {
      data.rankGraceHP = data.rankGraceRR;
      delete data.rankGraceRR;
    }
    if (data.activitySnapshots) {
      Object.values(data.activitySnapshots).forEach((snap) => {
        if (snap.frozenRR !== void 0 && snap.frozenHP === void 0) {
          snap.frozenHP = snap.frozenRR;
          delete snap.frozenRR;
        }
      });
    }
    if (data.snapshots) {
      data.snapshots.forEach((snap) => {
        if (snap.totalRR !== void 0 && snap.totalHP === void 0) {
          snap.totalHP = snap.totalRR;
          snap.liveHP = snap.liveRR || 0;
          snap.historicalHP = snap.historicalRR || 0;
          delete snap.totalRR;
          delete snap.liveRR;
          delete snap.historicalRR;
        }
      });
    }
    if (!this.settings.bossMaxHP || this.settings.bossMaxHP === 0) {
      const stats = this.getWeeklyTargetStats();
      this.settings.bossMaxHP = calculateBossHP(stats.total, this.settings.currentTier, this.settings, stats.lowest);
      this.settings.bossCurrentHP = this.settings.bossMaxHP;
    }
    if (this.settings.customHabits) {
      this.settings.customHabits.forEach((habit) => {
        if (habit.hpPerDay !== void 0 && habit.damagePerCompletion === void 0) {
          habit.damagePerCompletion = habit.hpPerDay;
          delete habit.hpPerDay;
        }
        if (habit.hpPerWeek !== void 0 && habit.damagePerWeek === void 0) {
          habit.damagePerWeek = habit.hpPerWeek;
          delete habit.hpPerWeek;
        }
        if (habit.penaltyPerDay !== void 0) {
          delete habit.penaltyPerDay;
        }
        if (habit.damagePerCompletion === void 0) {
          habit.damagePerCompletion = 1;
        }
        if (habit.weeklyTarget === void 0) {
          habit.weeklyTarget = 7;
        }
      });
    }
    if (this.settings.activityOverrides) {
      this.settings.activityOverrides.forEach((override) => {
        if (override.hpPerDay !== void 0) {
          override.damagePerCompletion = override.hpPerDay;
          delete override.hpPerDay;
        }
        if (override.hpPerWeek !== void 0) {
          override.damagePerWeek = override.hpPerWeek;
          delete override.hpPerWeek;
        }
        if (override.penaltyPerDay !== void 0) {
          delete override.penaltyPerDay;
        }
      });
    }
    if (data.lastProcessedTotalHP !== void 0) {
      delete data.lastProcessedTotalHP;
    }
    if (!this.settings.lastCompletionCounts || Object.keys(this.settings.lastCompletionCounts).length === 0) {
      this.settings.lastCompletionCounts = {};
      const allActivities = [
        ...getEffectiveActivities(this.settings).filter((a) => this.settings.enabledActivities[a._originalName] ?? true),
        ...this.settings.customHabits.filter((h) => h.enabled)
      ];
      for (const activity of allActivities) {
        const activityKey = "_originalName" in activity ? activity._originalName : "id" in activity ? activity.id : activity.name;
        const completions = getCompletionsFromFolder(this.app, activity.folder, activity.field);
        const count = completions.filter((c) => c.completed).length;
        this.settings.lastCompletionCounts[activityKey] = count;
      }
      debugLog.log("DMG", "Initialized lastCompletionCounts for existing user", {
        counts: this.settings.lastCompletionCounts,
        bossHP: `${this.settings.bossCurrentHP}/${this.settings.bossMaxHP}`
      });
    }
    // Migrate from 2-tier-per-boss system to 1-tier-per-boss
    if (!this.settings._tierSystemMigrated && this.settings.currentTier > 13) {
      // Old system: 26 tiers (2 per boss). New system: 13 tiers (1 per boss).
      this.settings.currentTier = Math.ceil(this.settings.currentTier / 2);
      if (this.settings.maxTier === 14 || this.settings.maxTier === 26) {
        this.settings.maxTier = 13;
      }
      // Clean up removed setting
      delete this.settings.tierAdvancedAt50Percent;
      // Migrate tier figures to new tier numbers
      if (this.settings.tierFigures?.length) {
        const migratedFigures = [];
        this.settings.tierFigures.forEach(f => {
          const newTier = Math.ceil(f.tier / 2);
          if (!migratedFigures.find(m => m.tier === newTier)) {
            migratedFigures.push({ ...f, tier: newTier });
          }
        });
        this.settings.tierFigures = migratedFigures;
      }
      // Migrate custom boss overrides to new tier numbers
      if (this.settings.customBosses?.length) {
        this.settings.customBosses.forEach(c => {
          if (c.tier > 13) c.tier = Math.ceil(c.tier / 2);
          // Migrate ranks array to single rank
          if (c.ranks && !c.rank) {
            c.rank = c.ranks[0];
            delete c.ranks;
          }
        });
      }
      this.settings._tierSystemMigrated = true;
      // Recalculate boss HP for new tier
      const stats = this.getWeeklyTargetStats();
      this.settings.bossMaxHP = calculateBossHP(stats.total, this.settings.currentTier, this.settings, stats.lowest);
      this.settings.bossCurrentHP = this.settings.bossMaxHP;
    }
    // Also handle users who are on tier <= 13 but still have old maxTier
    if (!this.settings._tierSystemMigrated) {
      if (this.settings.maxTier === 14 || this.settings.maxTier === 26) {
        this.settings.maxTier = 13;
      }
      delete this.settings.tierAdvancedAt50Percent;
      // Migrate custom boss rank arrays to single rank
      if (this.settings.customBosses?.length) {
        this.settings.customBosses.forEach(c => {
          if (c.ranks && !c.rank) {
            c.rank = c.ranks[0];
            delete c.ranks;
          }
        });
      }
      this.settings._tierSystemMigrated = true;
    }
    // Migrate old shared rewardPools to 3 separate pools
    if (this.settings.rewardPools && Array.isArray(this.settings.rewardPools) && !this.settings._rewardPoolsMigrated) {
      const oldPools = this.settings.rewardPools;
      const actPools = [];
      const strPools = [];
      const bossPools = [];
      const tiers = ["micro", "mini", "standard", "quality", "premium"];
      tiers.forEach(tier => {
        const oldPool = oldPools.find(p => p.tier === tier);
        if (!oldPool) return;
        const actOpts = [];
        const strOpts = [];
        const bossOpts = [];
        (oldPool.options || []).forEach(opt => {
          const target = opt.type === "streak" ? strOpts : opt.type === "boss" ? bossOpts : actOpts;
          target.push({ id: opt.id, description: opt.description, image: opt.image || "", emoji: opt.emoji || "" });
        });
        if (actOpts.length === 0 && strOpts.length === 0 && bossOpts.length === 0) {
          (oldPool.options || []).forEach(opt => {
            actOpts.push({ id: opt.id, description: opt.description, image: opt.image || "", emoji: opt.emoji || "" });
          });
        }
        actPools.push({ tier, options: actOpts });
        strPools.push({ tier, options: strOpts });
        bossPools.push({ tier, options: bossOpts });
      });
      if (!this.settings.activityRewardPools || this.settings.activityRewardPools.length === 0) {
        this.settings.activityRewardPools = actPools.length > 0 ? actPools : DEFAULT_SETTINGS.activityRewardPools;
      }
      if (!this.settings.streakRewardPools || this.settings.streakRewardPools.length === 0) {
        this.settings.streakRewardPools = strPools.length > 0 ? strPools : DEFAULT_SETTINGS.streakRewardPools;
      }
      if (!this.settings.bossRewardPools || this.settings.bossRewardPools.length === 0) {
        this.settings.bossRewardPools = bossPools.length > 0 ? bossPools : DEFAULT_SETTINGS.bossRewardPools;
      }
      this.settings._rewardPoolsMigrated = true;
      delete this.settings.rewardPools;
      debugLog.log("META", "Migrated shared rewardPools to 3 separate pools");
    }
    // Migrate flat-format customTartarusTasks to grouped format
    if (this.settings.customTartarusTasks?.length > 0 && !this.settings.customTartarusTasks[0]?.tasks) {
      const flatEntries = this.settings.customTartarusTasks;
      const grouped = {};
      flatEntries.forEach(entry => {
        if (!entry.tierRange) return;
        if (!grouped[entry.tierRange]) grouped[entry.tierRange] = [];
        grouped[entry.tierRange].push({
          id: entry.id || `migrated-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          description: entry.description || "Penance task"
        });
      });
      this.settings.customTartarusTasks = Object.entries(grouped).map(([tierRange, tasks]) => ({
        tierRange,
        tasks
      }));
      debugLog.log("META", "Migrated flat customTartarusTasks to grouped format");
    }
    await this.saveSettings();
  }
  calculateWeeklyTarget() {
    const allActivities = [
      ...getEffectiveActivities(this.settings).filter((a) => this.settings.enabledActivities[a._originalName] ?? true),
      ...this.settings.customHabits.filter((h) => h.enabled)
    ];
    return allActivities.reduce((sum, a) => {
      return sum + (a.weeklyTarget || 7);
    }, 0);
  }
  /**
   * Get both total and lowest weekly target for dynamic HP calculation.
   */
  getWeeklyTargetStats() {
    const allActivities = [
      ...getEffectiveActivities(this.settings).filter((a) => this.settings.enabledActivities[a._originalName] ?? true),
      ...this.settings.customHabits.filter((h) => h.enabled)
    ];
    if (allActivities.length === 0) {
      return { total: 7, lowest: 1 };
    }
    const targets = allActivities.map((a) => a.weeklyTarget || 7);
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
  async toggleSystemState() {
    if (this.settings.systemState === "active") {
      this.settings.systemState = "paused";
      this.settings.pauseStartTime = (/* @__PURE__ */ new Date()).toISOString();
      debugLog.log("PAUSE", "System PAUSED", { pauseStartTime: this.settings.pauseStartTime });
      new import_obsidian.Notice("System PAUSED - All time-dependent mechanics frozen");
    } else {
      let pauseDuration = 0;
      if (this.settings.pauseStartTime) {
        const pauseStart = new Date(this.settings.pauseStartTime).getTime();
        pauseDuration = Date.now() - pauseStart;
        this.settings.totalPausedTime += pauseDuration;
      }
      this.settings.systemState = "active";
      this.settings.pauseStartTime = null;
      debugLog.log("PAUSE", "System RESUMED", {
        pauseDuration: Math.round(pauseDuration / 1e3) + "s",
        totalPausedTime: Math.round(this.settings.totalPausedTime / 1e3) + "s"
      });
      new import_obsidian.Notice("System RESUMED - Time-dependent mechanics active");
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
  getPauseDurationDisplay() {
    if (this.settings.systemState !== "paused" || !this.settings.pauseStartTime) {
      return "Not paused";
    }
    const pauseStart = new Date(this.settings.pauseStartTime).getTime();
    const duration = Date.now() - pauseStart;
    const hours = Math.floor(duration / (1e3 * 60 * 60));
    const minutes = Math.floor(duration % (1e3 * 60 * 60) / (1e3 * 60));
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
  getTotalPausedDisplay() {
    let total = this.settings.totalPausedTime;
    if (this.settings.systemState === "paused" && this.settings.pauseStartTime) {
      const pauseStart = new Date(this.settings.pauseStartTime).getTime();
      total += Date.now() - pauseStart;
    }
    const days = Math.floor(total / (1e3 * 60 * 60 * 24));
    const hours = Math.floor(total % (1e3 * 60 * 60 * 24) / (1e3 * 60 * 60));
    const minutes = Math.floor(total % (1e3 * 60 * 60) / (1e3 * 60));
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
    if (this.settings.systemState === "paused") {
      return;
    }
    if (!this.settings.lastCompletionCounts) {
      this.settings.lastCompletionCounts = {};
    }
    const allActivities = [
      ...getEffectiveActivities(this.settings).filter((a) => this.settings.enabledActivities[a._originalName] ?? true),
      ...this.settings.customHabits.filter((h) => h.enabled)
    ];
    let totalNewDamage = 0;
    let totalNewCompletions = 0;
    let totalNewDiscipline = 0;
    for (const activity of allActivities) {
      const activityKey = "_originalName" in activity ? activity._originalName : "id" in activity ? activity.id : activity.name;
      const disciplineKey = `${activityKey}_discipline`;
      const completions = getCompletionsFromFolder(
        this.app,
        activity.folder,
        activity.field
      );
      const currentDisciplineCount = countDisciplineCompletions(
        this.app,
        activity.folder,
        activity.field
      );
      const currentCount = completions.filter((c) => c.completed).length;
      const lastCount = this.settings.lastCompletionCounts[activityKey] || 0;
      const lastDisciplineCount = this.settings.lastCompletionCounts[disciplineKey] || 0;
      const newCompletions = currentCount - lastCount;
      const newDiscipline = Math.max(0, currentDisciplineCount - lastDisciplineCount);
      if (newCompletions > 0) {
        this.settings.lastCompletionCounts[activityKey] = currentCount;
        this.settings.lastCompletionCounts[disciplineKey] = currentDisciplineCount;
        if (newDiscipline > 0) {
          this.settings.disciplineCompletionCount += newDiscipline;
          totalNewDiscipline += newDiscipline;
          while (this.settings.disciplineCompletionCount >= 5 && this.settings.disciplineTokens < 3) {
            this.settings.disciplineCompletionCount -= 5;
            this.settings.disciplineTokens += 1;
            new import_obsidian.Notice("\u{1F396}\uFE0F Earned 1 Discipline Token! (5 discipline completions)");
          }
        }
        if (!this.settings.inTartarus) {
          const regularCompletions = newCompletions - newDiscipline;
          const regularDamage = regularCompletions * activity.damagePerCompletion;
          const disciplineDamage = newDiscipline * activity.damagePerCompletion * 2;
          totalNewDamage += regularDamage + disciplineDamage;
          totalNewCompletions += newCompletions;
        }
      } else if (newCompletions < 0) {
        this.settings.lastCompletionCounts[activityKey] = currentCount;
        this.settings.lastCompletionCounts[disciplineKey] = currentDisciplineCount;
      } else if (currentDisciplineCount !== lastDisciplineCount) {
        this.settings.lastCompletionCounts[disciplineKey] = currentDisciplineCount;
      }
    }
    if (totalNewDamage > 0 && !this.settings.inTartarus) {
      const streakMultiplier = getStreakBonusMultiplier(this.settings.consecutivePerfectWeeks);
      const finalDamage = Math.round(totalNewDamage * streakMultiplier);
      this.settings.bossCurrentHP = Math.max(0, this.settings.bossCurrentHP - finalDamage);
      const bossName = getCustomizedBossForTier(this.settings.currentTier, this.settings)?.name || "Boss";
      let message = `\u{1F4A5} ${finalDamage} damage dealt to ${bossName}! (${totalNewCompletions} completion${totalNewCompletions > 1 ? "s" : ""})`;
      if (totalNewDiscipline > 0) {
        message += ` [discipline 2x]`;
      }
      if (streakMultiplier > 1) {
        const bonusPercent = Math.round((streakMultiplier - 1) * 100);
        message += ` [${this.settings.consecutivePerfectWeeks}wk streak +${bonusPercent}%]`;
      }
      new import_obsidian.Notice(message);
      await this.trackActivityReward(totalNewCompletions);
    }
  }
  async dealDamage(damage) {
    if (this.settings.inTartarus) {
      return;
    }
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
    const maxTier = this.settings.maxTier || 13;
    if (currentHP <= 0 && currentTier < maxTier) {
      const oldTier = this.settings.currentTier;
      this.settings.currentTier = oldTier + 1;
      const stats = this.getWeeklyTargetStats();
      this.settings.bossMaxHP = calculateBossHP(stats.total, this.settings.currentTier, this.settings, stats.lowest);
      this.settings.bossCurrentHP = this.settings.bossMaxHP;
      const newRank = getRankNameForTier(this.settings.currentTier, this.settings);
      const newBoss = getCustomizedBossForTier(this.settings.currentTier, this.settings);
      await this.awardBossReward(oldTier);
      await this.saveSettings();
      new import_obsidian.Notice(`\u{1F389} Boss Defeated! You are now ${newRank}! Face ${newBoss?.name}!`);
    }
  }
  async checkDeathThreshold() {
    if (this.settings.inTartarus) {
      await this.checkHadesWrath();
      debugLog.log("THRESH", "Death threshold check skipped (in Tartarus), checked Hades Wrath instead");
      return;
    }
    const belowThreshold = checkDeathThreshold(this.app, this.settings);
    debugLog.log("THRESH", "Death threshold check", {
      belowThreshold,
      failedDays: this.settings.failedThresholdDays
    });
    if (belowThreshold) {
      this.settings.failedThresholdDays++;
      debugLog.log("THRESH", "Failed day incremented (warning only)", { failedDays: this.settings.failedThresholdDays });
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
      return;
    }
    if (this.settings.systemState === "paused") {
      return;
    }
    const effectiveNow = getEffectiveNow(this.settings);
    const daysInTartarus = this.settings.tartarusStartDate ? Math.floor((effectiveNow.getTime() - new Date(this.settings.tartarusStartDate).getTime()) / (24 * 60 * 60 * 1e3)) : 0;
    const completedCount = this.settings.tartarusPenanceTasks.filter((t) => t.completed).length;
    const requiredTasks = this.settings.currentTier <= 4 ? 3 : this.settings.currentTier <= 9 ? 4 : 5;
    if (daysInTartarus >= 3 && completedCount < requiredTasks) {
      debugLog.log("THRESH", "HADES WRATH TRIGGERED - Tasks doubled!", { daysInTartarus, completedCount, requiredTasks });
      const incompleteTasks = this.settings.tartarusPenanceTasks.filter((t) => !t.completed);
      const duplicateTasks = incompleteTasks.map((t) => ({
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
      new import_obsidian.Notice("\u26A1 HADES WRATH! Your incomplete tasks have been doubled!");
    }
  }
  async checkPerfectWeek() {
    if (this.settings.inTartarus) return;
    const isPerfectWeek = checkPerfectWeek(this.app, this.settings);
    if (isPerfectWeek) {
      this.settings.consecutivePerfectWeeks++;
      debugLog.log("CALC", "Perfect week achieved!", { streak: this.settings.consecutivePerfectWeeks });
      if (this.settings.disciplineTokens < 3) {
        this.settings.disciplineTokens++;
        debugLog.log("DMG", "Discipline token earned", { tokens: this.settings.disciplineTokens });
        new import_obsidian.Notice(`Perfect Week! Discipline token earned (${this.settings.disciplineTokens}/3)`);
      } else {
        new import_obsidian.Notice(`\u{1F525} Perfect Week! Streak: ${this.settings.consecutivePerfectWeeks}`);
      }
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
    leaves.forEach((leaf) => {
      const view = leaf.view;
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
      const newLeaf = workspace.getLeaf("tab");
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
    leaves.forEach((leaf) => {
      const view = leaf.view;
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
  async trackActivityReward(newCompletions) {
    if (!this.settings.pendingRewards) this.settings.pendingRewards = [];
    if (!this.settings.claimedRewards) this.settings.claimedRewards = [];
    if (!this.settings.bankedRewards) this.settings.bankedRewards = [];
    const rewardTier = getRewardTierForPlayerTier(this.settings.currentTier);
    const thresholds = REWARD_THRESHOLDS[rewardTier];
    this.settings.activityRewardCounter += newCompletions;
    while (this.settings.activityRewardCounter >= thresholds.activityInterval) {
      this.settings.activityRewardCounter -= thresholds.activityInterval;
      const pendingReward = this.createPendingReward(rewardTier, "activity");
      this.settings.pendingRewards.push(pendingReward);
      debugLog.log("DMG", "Activity reward earned!", { rewardTier, type: "activity" });
      if (!this._rewardModalOpen) {
        this._rewardModalOpen = true;
        const modal = new RewardSelectionModal(this.app, this, pendingReward, () => {
          this._rewardModalOpen = false;
          this.refreshRankView();
        });
        modal.onClose = () => { this._rewardModalOpen = false; };
        modal.open();
      }
    }
  }
  /**
   * Award a boss reward when a boss is defeated.
   * Always triggers regardless of tier.
   */
  async awardBossReward(defeatedAtTier) {
    if (!this.settings.pendingRewards) this.settings.pendingRewards = [];
    const rewardTier = getRewardTierForPlayerTier(defeatedAtTier);
    const pendingReward = this.createPendingReward(rewardTier, "boss");
    this.settings.pendingRewards.push(pendingReward);
    debugLog.log("DMG", "Boss reward earned!", { rewardTier, type: "boss", defeatedAtTier });
    setTimeout(() => {
      if (!this._rewardModalOpen) {
        this._rewardModalOpen = true;
        const modal = new RewardSelectionModal(this.app, this, pendingReward, () => {
          this._rewardModalOpen = false;
          this.refreshRankView();
        });
        modal.onClose = () => { this._rewardModalOpen = false; };
        modal.open();
      }
    }, 1500);
  }
  /**
   * Track perfect weeks for streak rewards.
   * Awards a reward when the threshold is reached based on current tier.
   */
  async trackStreakReward() {
    if (!this.settings.pendingRewards) this.settings.pendingRewards = [];
    const rewardTier = getRewardTierForPlayerTier(this.settings.currentTier);
    const thresholds = REWARD_THRESHOLDS[rewardTier];
    this.settings.streakRewardCounter++;
    if (this.settings.streakRewardCounter >= thresholds.streakInterval) {
      this.settings.streakRewardCounter = 0;
      const pendingReward = this.createPendingReward(rewardTier, "streak");
      this.settings.pendingRewards.push(pendingReward);
      debugLog.log("DMG", "Streak reward earned!", { rewardTier, type: "streak", weeks: this.settings.consecutivePerfectWeeks });
      if (!this._rewardModalOpen) {
        this._rewardModalOpen = true;
        const modal = new RewardSelectionModal(this.app, this, pendingReward, () => {
          this._rewardModalOpen = false;
          this.refreshRankView();
        });
        modal.onClose = () => { this._rewardModalOpen = false; };
        modal.open();
      }
    }
  }
  /**
   * Create a new pending reward with 7-day expiration.
   */
  createPendingReward(tier, type) {
    const now = /* @__PURE__ */ new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1e3);
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
    const expiredRewards = [];
    const validRewards = [];
    this.settings.pendingRewards.forEach((reward) => {
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
      expiredRewards.forEach((reward) => {
        debugLog.log("DMG", "Reward expired", { rewardTier: reward.rewardTier, type: reward.rewardType });
      });
      if (expiredRewards.length === 1) {
        new import_obsidian.Notice(`A reward has expired unclaimed!`);
      } else {
        new import_obsidian.Notice(`${expiredRewards.length} rewards have expired unclaimed!`);
      }
    }
  }
  /**
   * Get reward progress information for display on dashboard.
   */
  getRewardProgress() {
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
  }
};
