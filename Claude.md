---

```markdown
# Plugin Mobile Optimization & Developer Control Center Implementation

## Overview
Enhance the TrackHabitRankPlugin (mythological boss battle habit tracker) with three major features:
1. **Full mobile compatibility** (touch-friendly, responsive layouts)
2. **Global pause/start system** that halts all time-dependent mechanics
3. **Comprehensive developer control center** exposing 100% of internal state, calculations, and tracking logic

The plugin uses a boss battle system where users deal "damage" to mythological bosses by completing habits. Time-based decay, death thresholds (Tartarus), and streak calculations must be pausable.

---

## 1. Mobile Optimization Requirements

### UI/UX Standards
- **Touch targets**: Minimum 44×44px for all interactive elements (buttons, toggles, list items)
- **Responsive layouts**: Use flexbox/grid with relative units; ensure dashboard scales down to 320px width
- **Gestures**: Support pull-to-refresh on dashboard views (reload calculations)
- **Safe areas**: Respect mobile safe-area-insets for notched devices
- **Input handling**: Replace hover-dependent tooltips with tap-to-reveal pattern

### Performance (Plugin Scope Only)
- Debounce heavy calculations appropriately (maintain existing 300ms or optimize further)
- Lazy-load developer panel components (don't render if never opened)
- Optimize `getCompletionsFromFolder` to avoid full vault scans on every keystroke

---

## 2. Start/Pause System Architecture

### Core Behavior
When **PAUSED**, the system MUST freeze:
- Death threshold countdown timer (failedThresholdDays accumulation)
- Boss HP decay/regeneration (if any passive mechanics exist)
- Time-based streak calculations ("days since last completion" counters)
- Tartarus timer (days spent in penance)
- Perfect week validation (week boundaries freeze)
- Historical date comparisons (today vs last completion dates)

When **RESUMED**:
- Calculate delta time since pause
- Adjust all time-sensitive comparisons by the pause duration offset
- **Critical**: Do NOT retroactively apply penalties for the paused period
- Update "last checked" timestamps to resume time (now - pauseDuration)

### State Management
- Add `systemState: 'active' | 'paused'` to settings
- Add `pauseStartTime: string | null` (ISO timestamp when paused)
- Add `totalPausedTime: number` (accumulated milliseconds paused, resets weekly or persist?)
- Visual indicator: Persistent banner in all views when paused (red "System Paused" bar)

### UI Implementation
- **Primary toggle**: Large button in main dashboard (TrackRankView)
- **Quick toggle**: Command palette entry ("Toggle System Pause")
- **Developer panel**: Detailed pause state with time counters

---

## 3. Developer Control Center (100% Transparency)

Create a new view `DeveloperDashboardView` (or modal) accessible via:
- Settings tab button
- Command palette ("Open Developer Control Center")
- Hidden gesture (triple-tap on boss HP bar? optional)

### Section A: Live State Inspector (Visual Tree)
Display real-time reactive state:

**Boss System**
```

Current Tier: {tier} ({bossName})
HP State: {currentHP}/{maxHP} ({percent}%)
Pause Offset: {totalPausedTime}ms
Status: {inTartarus ? 'TARTARUS' : 'Active'}

```

**Time Tracking**
```

Last Calculation: {timestamp}
System State: {active/paused}
If Paused: {duration} ago, accumulated pause: {ms}
Current "Today": {effectiveDate} (accounting for pause offsets)

```

**Death Threshold Monitor**
```

Weekly Target: {total}
Required 3-day Damage: {required}
Current 3-day Window: {startDate} → {endDate}
Actual Damage: {calculated}
Status: {safe/warning/death imminent}
Failed Days Counter: {failedThresholdDays}/3

```

**Streak Engine (Per Activity)**
For each enabled activity:
```

Activity: {name}
Raw Completions: {count} files
Sorted Dates: [array]
Current Streak Logic:
- Check Date: {date}
- Matches: {boolean}
Calculated Streak: {n}
Discipline Wins: {count} (type=='discipline')
Effective HP: {value}

```

**Tartarus State** (if applicable)
```

Days in Tartarus: {n}
Penance Tasks: [array with completion status]
Token Balance: {n}/3
Escape Requirements: {completed}/{required}

```

**Metadata Cache Monitor**
```

Last 10 File Events: [list]
Active File Watchers: {count}
Vault File Count: {total}
Folder Scanned: {path}
Query Performance: {ms} last calc

```

### Section B: Raw Debug Console
Implement an in-plugin log stream:

**Log Categories** (toggle filters):
- `CALC`: Streak/recalculation events
- `META`: File system/metadata cache events  
- `TIME`: Pause/resume/time jump events
- `DMG`: Damage dealt to boss
- `THRESH`: Death threshold checks
- `SAVE`: Settings persistence

**Buffer**: Keep last 1000 log entries in memory
**Export**: Button to dump log to markdown file in vault (`Developer Logs/YYYY-MM-DD.md`)

**Auto-debug Mode**: Option to write all logs to console.log simultaneously for desktop devtools debugging

### Section C: Manual Overrides (Developer Tools)
- **Simulate Date**: Override `new Date()` return value for testing time-based mechanics (with big red warning)
- **Fast-Forward**: Advance time by X days (recalculate what would happen)
- **Force Tartarus**: Manually trigger death state
- **Reset Boss**: Restore current tier HP to max
- **Add Tokens**: Manual discipline token adjustment
- **Pause Override**: Force pause state regardless of UI

### Section D: Data Integrity Audit
Button to run diagnostic checks:
- Find orphaned completion files (dates in future, malformed frontmatter)
- Check for streak calculation edge cases (duplicate dates, gaps)
- Validate settings schema (detect old RR fields vs new HP fields)
- Report drift: Compare "stored historical HP" vs "recalculated from scratch"

---

## 4. Technical Implementation Notes

### Pause System Algorithm
When system is paused:
1. Record `pauseStartTime = now()`
2. All calculations use `getEffectiveNow()` instead of `new Date()`:
   ```typescript
   function getEffectiveNow(): Date {
     if (settings.systemState === 'paused') {
       return new Date(settings.pauseStartTime);
     }
     return new Date(Date.now() - settings.totalPausedTime);
   }
   ```

When resumed:
1. Calculate `delta = now() - pauseStartTime`
2. Add delta to `totalPausedTime`
3. Clear `pauseStartTime`
4. Recalculate all dependent states using new offset

Mobile-Specific Code
- Use Obsidian's `Platform.isMobile` checks where necessary
- Handle touch events alongside click events for compatibility
- Ensure modals are scrollable (max-height with overflow-y: auto)
- Test keyboard avoidance (input fields shouldn't be hidden by mobile keyboard)

Developer Panel Architecture
- Create `DeveloperDashboardView extends ItemView`
- Use the existing notification system or create a custom log buffer
- Consider performance: Only update the "Live State" section when visible (check `leaf.view.isVisible()` or similar)
- For the raw console, implement a ring buffer (circular array) to prevent memory leaks

---

5. To-Do List for Claude Code

Please implement in this order:

Phase 1: Foundation & Pause System
- Add `systemState`, `pauseStartTime`, `totalPausedTime` to `TrackRankSettings` interface
- Create `getEffectiveNow()` utility function and replace all `new Date()` calls in calculation engine
- Implement pause/resume logic with time offset calculations
- Add `toggleSystemState()` method to plugin class
- Create pause indicator banner component (visual only)
- Test pause: Verify streaks don't decay, thresholds don't accumulate, Tartarus timer freezes

Phase 2: Mobile UI Pass
- Audit all CSS/inline styles: Replace fixed px units with responsive alternatives where appropriate for mobile
- Ensure all buttons are min 44px touch targets (Morpheus modal, Penance modal, main dashboard)
- Add touch event handlers for critical interactions (boss HP bar tap, modal triggers)
- Implement scrollable containers for activity lists in settings (prevent overflow on small screens)
- Test TrackRankView layout on 375px width (iPhone SE size)

Phase 3: Developer Control Center Core
- Create `DeveloperDashboardView` class with view type registration
- Implement "System Status" section showing pause state, effective date, tier info
- Implement "Activity Inspector" showing per-activity calculation breakdowns
- Implement "Threshold Monitor" with real-time death threshold calculations
- Add command palette entry and settings tab button to open developer view

Phase 4: Debug Logging System
- Create `DebugLogger` class with ring buffer (1000 entries)
- Add log methods: `logCalc()`, `logMeta()`, `logTime()`, `logDmg()`, etc.
- Instrument existing code: Add logging calls to `calculateLiveStreakWithDecay`, `checkDeathThreshold`, `dealDamage`, file watchers
- Create log viewer UI in developer panel with category filters
- Add "Export to File" functionality for logs

Phase 5: Advanced Developer Tools
- Implement "Simulate Date" override functionality (with safety warnings)
- Add manual override buttons (force Tartarus, reset boss, adjust tokens)
- Create "Data Integrity Audit" diagnostic function
- Add performance timing displays (calculation durations)

Phase 6: Integration & Polish
- Connect pause button to main TrackRankView UI (prominent toggle)
- Ensure developer panel updates reactively (subscribe to settings changes)
- Add mobile-optimized layout for developer panel (collapsible sections)
- Review: Ensure no `console.log` left in code (all use debug logger)
- Final test: Pause system integrity (1. pause 2. wait 3 days 3. resume 4. verify no penalties applied retroactively)

---

Constraints & Guidelines

1. Leave Space for Decisions: For implementation details not explicitly specified (e.g., exact color of pause banner, specific log message formatting), make reasonable defaults but leave TODO comments marking them as "configurable by user preference"

2. No Breaking Changes: Maintain backward compatibility with existing `main.ts` data models. New fields should have defaults in `DEFAULT_SETTINGS`

3. Performance: The developer panel must not slow down normal usage. If calculations for the panel are heavy, make them manual ("Refresh" button) rather than automatic

4. Mobile First: Test touch interactions thoroughly. Hover states should have tap equivalents

5. Documentation: Add JSDoc comments to new public methods explaining pause behavior and developer tool risks (manual overrides)

6. No External Dependencies: Continue using only Obsidian API and standard browser APIs (no charting libraries for developer graphs, etc.)

Ask for clarification if the pause system behavior for "weekly perfect week streaks" or "Tartarus penance timers" needs adjustment based on your specific game design intent.

```

---

**Copy the markdown block above into Claude Code.** It provides comprehensive specification while leaving implementation flexibility for styling decisions, exact log formatting, and specific UI layouts.

The to-do list is sequenced to build the pause system first (foundational), then mobile UI, then the developer tooling. Each phase is independently testable.
