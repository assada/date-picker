# DateRangePicker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready, animated date range picker React component with a horizontal timeline slider, drag handles, preset buttons, and clickable month labels.

**Architecture:** Self-contained component in `src/components/DateRangePicker/` with CSS Modules and Framer Motion. A demo page in `src/demo/App.tsx` renders the component centered with ISO output. The component exports cleanly from `src/index.ts` for external use.

**Tech Stack:** Vite, React 18, TypeScript, Framer Motion, CSS Modules, date-fns

**Spec:** `docs/superpowers/specs/2026-03-30-date-range-picker-design.md`

---

## File Map

| File | Responsibility |
|------|---------------|
| `src/components/DateRangePicker/types.ts` | All shared interfaces and types |
| `src/components/DateRangePicker/utils.ts` | Date math, pixel ↔ date conversions |
| `src/components/DateRangePicker/DateRangePicker.module.css` | All component styles with CSS custom properties |
| `src/components/DateRangePicker/Handle.tsx` | Single draggable handle with scale animation |
| `src/components/DateRangePicker/DaysTooltip.tsx` | Floating "N Days" label |
| `src/components/DateRangePicker/MonthLabels.tsx` | Clickable month names below track |
| `src/components/DateRangePicker/Header.tsx` | Range label text + optional preset pills |
| `src/components/DateRangePicker/Timeline.tsx` | Track, ticks (SVG), handles, highlight, scroll |
| `src/components/DateRangePicker/DateRangePicker.tsx` | Main orchestrator — state, props, composition |
| `src/components/DateRangePicker/index.ts` | Public re-export |
| `src/index.ts` | Library entry point |
| `src/demo/App.tsx` | Demo page |
| `index.html` | Vite entry HTML |

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`, `src/vite-env.d.ts`

- [ ] **Step 1: Initialize Vite React TypeScript project**

```bash
cd /Users/oleksiiilienko/projects/date-picker
npm create vite@latest . -- --template react-ts
```

If it asks to overwrite, say yes (directory only has docs and video).

- [ ] **Step 2: Install dependencies**

```bash
npm install framer-motion date-fns
```

- [ ] **Step 3: Clean up default Vite files**

Delete these generated files we won't use:
- `src/App.tsx`
- `src/App.css`
- `src/index.css`
- `src/assets/` (entire directory)

- [ ] **Step 4: Create minimal main.tsx**

Replace `src/main.tsx` with:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./demo/App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 5: Create placeholder demo App**

Create `src/demo/App.tsx`:

```tsx
export default function App() {
  return <div>DateRangePicker demo — coming soon</div>;
}
```

- [ ] **Step 6: Verify dev server starts**

```bash
npm run dev
```

Expected: Vite dev server starts, browser shows "DateRangePicker demo — coming soon".

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "scaffold: Vite + React + TypeScript + Framer Motion + date-fns"
```

---

### Task 2: Types & Utility Functions

**Files:**
- Create: `src/components/DateRangePicker/types.ts`
- Create: `src/components/DateRangePicker/utils.ts`

- [ ] **Step 1: Create types.ts**

Create `src/components/DateRangePicker/types.ts`:

```typescript
export interface DateRange {
  start: Date;
  end: Date;
}

export interface DateRangePreset {
  label: string;
  days?: number;
  from?: Date;
  to?: Date;
}

export interface DateRangePickerProps {
  value?: DateRange;
  onChange: (range: DateRange) => void;
  minDate?: Date;
  maxDate?: Date;
  presets?: DateRangePreset[];
  monthsToShow?: number;
  locale?: string;
  className?: string;
  style?: React.CSSProperties;
}
```

- [ ] **Step 2: Create utils.ts**

Create `src/components/DateRangePicker/utils.ts`:

```typescript
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  differenceInCalendarDays,
  addDays,
  subMonths,
  addMonths,
  eachMonthOfInterval,
  format,
  isToday,
  isSameDay,
  clamp,
} from "date-fns";

/**
 * Total number of days in the visible timeline range (minDate..maxDate).
 */
export function totalDays(minDate: Date, maxDate: Date): number {
  return differenceInCalendarDays(maxDate, minDate);
}

/**
 * Convert a date to a fraction (0..1) within the timeline.
 */
export function dateToFraction(date: Date, minDate: Date, maxDate: Date): number {
  const total = totalDays(minDate, maxDate);
  if (total === 0) return 0;
  const days = differenceInCalendarDays(date, minDate);
  return Math.max(0, Math.min(1, days / total));
}

/**
 * Convert a fraction (0..1) back to a date, snapped to start-of-day.
 */
export function fractionToDate(fraction: number, minDate: Date, maxDate: Date): Date {
  const total = totalDays(minDate, maxDate);
  const days = Math.round(fraction * total);
  return startOfDay(addDays(minDate, days));
}

/**
 * Clamp a date between min and max.
 */
export function clampDate(date: Date, minDate: Date, maxDate: Date): Date {
  return clamp(date, { start: startOfDay(minDate), end: startOfDay(maxDate) });
}

/**
 * Get all months that fall within the timeline range for labeling.
 */
export function getMonthsInRange(
  minDate: Date,
  maxDate: Date
): { date: Date; label: string; fraction: number }[] {
  const months = eachMonthOfInterval({ start: minDate, end: maxDate });
  return months.map((m) => ({
    date: m,
    label: format(m, "MMMM"),
    fraction: dateToFraction(m, minDate, maxDate),
  }));
}

/**
 * Number of days in the selected range (inclusive).
 */
export function rangeDayCount(start: Date, end: Date): number {
  return differenceInCalendarDays(end, start) + 1;
}

/**
 * Format the range label for the header.
 * If end is today, show "Today" instead of the date.
 */
export function formatRangeLabel(start: Date, end: Date): { startLabel: string; endLabel: string } {
  const startLabel = format(start, "MMMM d");
  const endLabel = isToday(end) ? "Today" : format(end, "MMMM d");
  return { startLabel, endLabel };
}

/**
 * Resolve a preset to a concrete date range.
 */
export function resolvePreset(
  preset: { days?: number; from?: Date; to?: Date },
  maxDate: Date
): { start: Date; end: Date } {
  if (preset.from && preset.to) {
    return { start: startOfDay(preset.from), end: startOfDay(preset.to) };
  }
  if (preset.days) {
    return {
      start: startOfDay(addDays(maxDate, -(preset.days - 1))),
      end: startOfDay(maxDate),
    };
  }
  return { start: startOfDay(maxDate), end: startOfDay(maxDate) };
}

export { startOfMonth, endOfMonth, startOfDay, differenceInCalendarDays, isSameDay, format, isToday, subMonths };
```

- [ ] **Step 3: Commit**

```bash
git add src/components/DateRangePicker/types.ts src/components/DateRangePicker/utils.ts
git commit -m "feat: add DateRangePicker types and date utility functions"
```

---

### Task 3: CSS Module — All Styles

**Files:**
- Create: `src/components/DateRangePicker/DateRangePicker.module.css`

- [ ] **Step 1: Create the CSS module**

Create `src/components/DateRangePicker/DateRangePicker.module.css`:

```css
/* === CSS Custom Properties for theming === */
.root {
  --drp-bg: #ffffff;
  --drp-border-radius: 16px;
  --drp-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  --drp-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --drp-track-bg: #f0f0f0;
  --drp-range-color: rgba(100, 120, 150, 0.13);
  --drp-handle-color: #888;
  --drp-handle-active-color: #555;
  --drp-tick-color: #c8c8c8;
  --drp-tick-active-color: #999;
  --drp-text-primary: #111827;
  --drp-text-secondary: #9ca3af;
  --drp-text-month-active: #111827;
  --drp-preset-active-bg: #ffffff;
  --drp-preset-bg: #f3f4f6;
  --drp-preset-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

  font-family: var(--drp-font-family);
  background: var(--drp-bg);
  border-radius: var(--drp-border-radius);
  box-shadow: var(--drp-shadow);
  padding: 20px 24px 16px;
  user-select: none;
  width: 100%;
  min-width: 500px;
  max-width: 720px;
  box-sizing: border-box;
}

/* === Header === */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.rangeLabel {
  font-size: 15px;
  font-weight: 500;
  color: var(--drp-text-primary);
  white-space: nowrap;
  overflow: hidden;
  position: relative;
  height: 22px;
}

.rangeLabelText {
  display: inline-block;
}

/* === Preset Buttons === */
.presets {
  display: flex;
  gap: 2px;
  background: var(--drp-preset-bg);
  border-radius: 8px;
  padding: 3px;
  position: relative;
}

.presetButton {
  position: relative;
  z-index: 1;
  border: none;
  background: transparent;
  padding: 5px 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--drp-text-secondary);
  cursor: pointer;
  border-radius: 6px;
  transition: color 0.2s;
  font-family: var(--drp-font-family);
  white-space: nowrap;
}

.presetButton:hover {
  color: var(--drp-text-primary);
}

.presetButtonActive {
  color: var(--drp-text-primary);
}

.presetIndicator {
  position: absolute;
  top: 3px;
  bottom: 3px;
  background: var(--drp-preset-active-bg);
  border-radius: 6px;
  box-shadow: var(--drp-preset-shadow);
}

/* === Timeline === */
.timeline {
  position: relative;
  padding: 0 28px;
}

.scrollArrow {
  position: absolute;
  top: 0;
  bottom: 24px;
  width: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--drp-text-secondary);
  font-size: 14px;
  font-weight: 600;
  z-index: 2;
  transition: color 0.2s;
}

.scrollArrow:hover {
  color: var(--drp-text-primary);
}

.scrollArrowLeft {
  left: 0;
}

.scrollArrowRight {
  right: 0;
}

.scrollArrowHidden {
  opacity: 0;
  pointer-events: none;
}

/* === Track === */
.trackContainer {
  overflow: hidden;
  position: relative;
}

.track {
  position: relative;
  height: 32px;
  cursor: crosshair;
}

/* === Day Ticks (SVG) === */
.ticksSvg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* === Range Highlight === */
.rangeHighlight {
  position: absolute;
  top: 2px;
  bottom: 2px;
  background: var(--drp-range-color);
  border-radius: 4px;
  cursor: grab;
}

.rangeHighlight:active {
  cursor: grabbing;
}

/* === Handle === */
.handle {
  position: absolute;
  top: 50%;
  width: 3px;
  height: 20px;
  background: var(--drp-handle-color);
  border-radius: 1.5px;
  transform: translate(-50%, -50%);
  cursor: ew-resize;
  z-index: 3;
  touch-action: none;
}

.handle::before {
  content: "";
  position: absolute;
  top: -8px;
  left: -10px;
  right: -10px;
  bottom: -8px;
}

.handleDragging {
  background: var(--drp-handle-active-color);
}

/* === Days Tooltip === */
.daysTooltip {
  position: absolute;
  top: 4px;
  transform: translateX(-50%);
  background: var(--drp-bg);
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 12px;
  font-weight: 500;
  color: var(--drp-text-primary);
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  z-index: 4;
}

/* === Month Labels === */
.monthLabels {
  display: flex;
  position: relative;
  margin-top: 6px;
  height: 20px;
}

.monthLabel {
  position: absolute;
  font-size: 13px;
  color: var(--drp-text-secondary);
  cursor: pointer;
  transition: color 0.2s;
  transform: translateX(-50%);
  white-space: nowrap;
  font-weight: 400;
}

.monthLabel:hover {
  color: var(--drp-text-primary);
}

.monthLabelActive {
  color: var(--drp-text-month-active);
  font-weight: 700;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/DateRangePicker/DateRangePicker.module.css
git commit -m "style: add DateRangePicker CSS module with custom properties"
```

---

### Task 4: Handle Component

**Files:**
- Create: `src/components/DateRangePicker/Handle.tsx`

- [ ] **Step 1: Create Handle.tsx**

Create `src/components/DateRangePicker/Handle.tsx`:

```tsx
import { motion } from "framer-motion";
import styles from "./DateRangePicker.module.css";

interface HandleProps {
  /** Fraction 0..1 along the track */
  position: number;
  onDrag: (deltaFraction: number) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  trackWidth: number;
  isDragging: boolean;
}

export default function Handle({
  position,
  onDrag,
  onDragStart,
  onDragEnd,
  trackWidth,
  isDragging,
}: HandleProps) {
  const left = position * trackWidth;

  return (
    <motion.div
      className={`${styles.handle} ${isDragging ? styles.handleDragging : ""}`}
      style={{ left }}
      animate={{
        left,
        scaleY: isDragging ? 1.3 : 1,
        scaleX: isDragging ? 1.5 : 1,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 35 }}
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDragStart();
        const startX = e.clientX;
        const startFraction = position;

        const onMove = (moveEvent: PointerEvent) => {
          const dx = moveEvent.clientX - startX;
          const deltaFraction = trackWidth > 0 ? dx / trackWidth : 0;
          onDrag(startFraction + deltaFraction);
        };

        const onUp = () => {
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", onUp);
          onDragEnd();
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
      }}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/DateRangePicker/Handle.tsx
git commit -m "feat: add draggable Handle component with spring animation"
```

---

### Task 5: DaysTooltip Component

**Files:**
- Create: `src/components/DateRangePicker/DaysTooltip.tsx`

- [ ] **Step 1: Create DaysTooltip.tsx**

Create `src/components/DateRangePicker/DaysTooltip.tsx`:

```tsx
import { AnimatePresence, motion } from "framer-motion";
import styles from "./DateRangePicker.module.css";

interface DaysTooltipProps {
  days: number;
  /** Center position in pixels along the track */
  centerPx: number;
  visible: boolean;
}

export default function DaysTooltip({ days, centerPx, visible }: DaysTooltipProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.daysTooltip}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0, left: centerPx }}
          exit={{ opacity: 0, y: 4 }}
          transition={{
            opacity: { duration: 0.15 },
            left: { type: "spring", stiffness: 300, damping: 30 },
            y: { duration: 0.15 },
          }}
        >
          {days} {days === 1 ? "Day" : "Days"}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/DateRangePicker/DaysTooltip.tsx
git commit -m "feat: add DaysTooltip with fade and spring animation"
```

---

### Task 6: MonthLabels Component

**Files:**
- Create: `src/components/DateRangePicker/MonthLabels.tsx`

- [ ] **Step 1: Create MonthLabels.tsx**

Create `src/components/DateRangePicker/MonthLabels.tsx`:

```tsx
import { startOfMonth, endOfMonth } from "date-fns";
import styles from "./DateRangePicker.module.css";
import type { DateRange } from "./types";

interface MonthInfo {
  date: Date;
  label: string;
  fraction: number;
}

interface MonthLabelsProps {
  months: MonthInfo[];
  trackWidth: number;
  selectedRange: DateRange;
  onMonthClick: (monthStart: Date, monthEnd: Date) => void;
}

export default function MonthLabels({
  months,
  trackWidth,
  selectedRange,
  onMonthClick,
}: MonthLabelsProps) {
  return (
    <div className={styles.monthLabels}>
      {months.map((m) => {
        const mStart = startOfMonth(m.date);
        const mEnd = endOfMonth(m.date);
        const isActive =
          selectedRange.start >= mStart &&
          selectedRange.start <= mEnd &&
          selectedRange.end >= mStart &&
          selectedRange.end <= mEnd;

        return (
          <span
            key={m.label + m.date.getTime()}
            className={`${styles.monthLabel} ${isActive ? styles.monthLabelActive : ""}`}
            style={{ left: m.fraction * trackWidth }}
            onClick={() => onMonthClick(mStart, mEnd)}
          >
            {m.label}
          </span>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/DateRangePicker/MonthLabels.tsx
git commit -m "feat: add MonthLabels with click-to-select-month"
```

---

### Task 7: Header Component (RangeLabel + Presets)

**Files:**
- Create: `src/components/DateRangePicker/Header.tsx`

- [ ] **Step 1: Create Header.tsx**

Create `src/components/DateRangePicker/Header.tsx`:

```tsx
import { AnimatePresence, motion, LayoutGroup } from "framer-motion";
import styles from "./DateRangePicker.module.css";
import { formatRangeLabel } from "./utils";
import type { DateRange, DateRangePreset } from "./types";

interface HeaderProps {
  range: DateRange;
  presets?: DateRangePreset[];
  activePresetIndex: number | null;
  onPresetClick: (index: number) => void;
}

export default function Header({
  range,
  presets,
  activePresetIndex,
  onPresetClick,
}: HeaderProps) {
  const { startLabel, endLabel } = formatRangeLabel(range.start, range.end);
  const labelKey = `${startLabel}-${endLabel}`;

  return (
    <div className={styles.header}>
      <div className={styles.rangeLabel}>
        <AnimatePresence mode="wait">
          <motion.span
            key={labelKey}
            className={styles.rangeLabelText}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {startLabel} – {endLabel}
          </motion.span>
        </AnimatePresence>
      </div>

      {presets && presets.length > 0 && (
        <LayoutGroup>
          <div className={styles.presets}>
            {presets.map((preset, i) => (
              <button
                key={preset.label}
                className={`${styles.presetButton} ${activePresetIndex === i ? styles.presetButtonActive : ""}`}
                onClick={() => onPresetClick(i)}
              >
                {activePresetIndex === i && (
                  <motion.div
                    className={styles.presetIndicator}
                    layoutId="presetIndicator"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    style={{ left: 0, right: 0, top: 0, bottom: 0, position: "absolute" }}
                  />
                )}
                <span style={{ position: "relative", zIndex: 1 }}>{preset.label}</span>
              </button>
            ))}
          </div>
        </LayoutGroup>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/DateRangePicker/Header.tsx
git commit -m "feat: add Header with animated range label and preset pills"
```

---

### Task 8: Timeline Component (Track, Ticks, Scroll, Range Drag)

**Files:**
- Create: `src/components/DateRangePicker/Timeline.tsx`

- [ ] **Step 1: Create Timeline.tsx**

Create `src/components/DateRangePicker/Timeline.tsx`:

```tsx
import { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "./DateRangePicker.module.css";
import Handle from "./Handle";
import DaysTooltip from "./DaysTooltip";
import MonthLabels from "./MonthLabels";
import {
  dateToFraction,
  fractionToDate,
  clampDate,
  getMonthsInRange,
  rangeDayCount,
  totalDays,
  startOfDay,
} from "./utils";
import type { DateRange } from "./types";

interface TimelineProps {
  range: DateRange;
  minDate: Date;
  maxDate: Date;
  onChange: (range: DateRange) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export default function Timeline({
  range,
  minDate,
  maxDate,
  onChange,
  onDragStart,
  onDragEnd,
}: TimelineProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const [dragging, setDragging] = useState<"start" | "end" | "range" | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);

  // Measure track width
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      setTrackWidth(entries[0].contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const total = totalDays(minDate, maxDate);
  const startFrac = dateToFraction(range.start, minDate, maxDate);
  const endFrac = dateToFraction(range.end, minDate, maxDate);
  const days = rangeDayCount(range.start, range.end);
  const months = getMonthsInRange(minDate, maxDate);

  // Visible window as fractions
  const visibleMonths = 4;
  const viewSpan = Math.min(1, visibleMonths * 30 / total);
  // scrollOffset: 0 means right-aligned (maxDate visible), negative scrolls left
  const maxScroll = 0;
  const minScroll = -(1 - viewSpan);

  const clampScroll = (s: number) => Math.max(minScroll, Math.min(maxScroll, s));

  // Transform fraction to pixel in viewport
  const fracToViewPx = (frac: number) => {
    const viewFrac = frac - (1 - viewSpan + scrollOffset);
    return (viewFrac / viewSpan) * trackWidth;
  };

  // Total track inner width (all days mapped)
  const innerWidth = trackWidth / viewSpan;

  // Translate X for the inner track
  const translateX = (1 - viewSpan + scrollOffset) * -innerWidth + (innerWidth - trackWidth);
  // Simplified: position so that the viewport window maps correctly
  const innerTranslateX = -fracToViewPx(0);

  const canScrollLeft = scrollOffset > minScroll + 0.001;
  const canScrollRight = scrollOffset < maxScroll - 0.001;

  const scrollBy = (delta: number) => {
    setScrollOffset((prev) => clampScroll(prev + delta));
  };

  const handleStartDrag = useCallback(
    (newFrac: number) => {
      const clamped = Math.max(0, Math.min(newFrac, endFrac));
      const newDate = clampDate(fractionToDate(clamped, minDate, maxDate), minDate, range.end);
      onChange({ start: newDate, end: range.end });
    },
    [endFrac, minDate, maxDate, range.end, onChange]
  );

  const handleEndDrag = useCallback(
    (newFrac: number) => {
      const clamped = Math.max(startFrac, Math.min(newFrac, 1));
      const newDate = clampDate(fractionToDate(clamped, minDate, maxDate), range.start, maxDate);
      onChange({ start: range.start, end: newDate });
    },
    [startFrac, minDate, maxDate, range.start, onChange]
  );

  // Range body drag
  const handleRangePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging("range");
    onDragStart();
    const startX = e.clientX;
    const origStartFrac = startFrac;
    const origEndFrac = endFrac;
    const span = origEndFrac - origStartFrac;

    const onMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const deltaFrac = trackWidth > 0 ? (dx / trackWidth) * viewSpan : 0;
      let newStart = origStartFrac + deltaFrac;
      let newEnd = origEndFrac + deltaFrac;

      // Clamp
      if (newStart < 0) {
        newStart = 0;
        newEnd = span;
      }
      if (newEnd > 1) {
        newEnd = 1;
        newStart = 1 - span;
      }

      onChange({
        start: fractionToDate(newStart, minDate, maxDate),
        end: fractionToDate(newEnd, minDate, maxDate),
      });
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setDragging(null);
      onDragEnd();
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const handleMonthClick = (monthStart: Date, monthEnd: Date) => {
    const clampedStart = clampDate(monthStart, minDate, maxDate);
    const clampedEnd = clampDate(monthEnd, minDate, maxDate);
    onChange({ start: startOfDay(clampedStart), end: startOfDay(clampedEnd) });
  };

  // Generate SVG ticks
  const tickCount = total;
  const tickPaths: string[] = [];
  for (let i = 0; i <= tickCount; i++) {
    const x = (i / tickCount) * 100;
    // Taller tick on 1st of month
    const frac = i / tickCount;
    const date = fractionToDate(frac, minDate, maxDate);
    const isMonthStart = date.getDate() === 1;
    const y1 = isMonthStart ? 4 : 10;
    const y2 = isMonthStart ? 28 : 22;
    tickPaths.push(`M${x} ${y1}V${y2}`);
  }

  const startPx = fracToViewPx(startFrac);
  const endPx = fracToViewPx(endFrac);
  const centerPx = (startPx + endPx) / 2;

  // Auto-scroll: ensure selected range is at least partially visible
  useEffect(() => {
    const viewLeft = 1 - viewSpan + scrollOffset;
    const viewRight = viewLeft + viewSpan;
    // If range is entirely outside view, scroll to show it
    if (endFrac < viewLeft || startFrac > viewRight) {
      const targetScroll = -(1 - viewSpan) + (startFrac);
      setScrollOffset(clampScroll(targetScroll));
    }
  }, [startFrac, endFrac]);

  return (
    <div className={styles.timeline}>
      <div
        className={`${styles.scrollArrow} ${styles.scrollArrowLeft} ${!canScrollLeft ? styles.scrollArrowHidden : ""}`}
        onClick={() => scrollBy(-viewSpan * 0.5)}
      >
        «
      </div>

      <div className={styles.trackContainer}>
        <motion.div
          ref={trackRef}
          className={styles.track}
          animate={{ x: 0 }}
        >
          {/* SVG day ticks */}
          <svg
            className={styles.ticksSvg}
            viewBox={`0 0 100 32`}
            preserveAspectRatio="none"
          >
            <g
              style={{
                transform: `translateX(${(-(1 - viewSpan + scrollOffset) / viewSpan) * 100}%)`,
                transformOrigin: "0 0",
              }}
              transform={`scale(${1 / viewSpan}, 1)`}
            >
              {tickPaths.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  stroke="var(--drp-tick-color)"
                  strokeWidth={0.15}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </g>
          </svg>

          {/* Range highlight */}
          <motion.div
            className={styles.rangeHighlight}
            animate={{
              left: Math.max(0, startPx),
              width: Math.max(0, endPx - startPx),
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onPointerDown={handleRangePointerDown}
          />

          {/* Handles */}
          <Handle
            position={startPx / (trackWidth || 1)}
            onDrag={(frac) => {
              const viewFrac = frac * viewSpan + (1 - viewSpan + scrollOffset);
              handleStartDrag(viewFrac);
            }}
            onDragStart={() => { setDragging("start"); onDragStart(); }}
            onDragEnd={() => { setDragging(null); onDragEnd(); }}
            trackWidth={trackWidth}
            isDragging={dragging === "start"}
          />
          <Handle
            position={endPx / (trackWidth || 1)}
            onDrag={(frac) => {
              const viewFrac = frac * viewSpan + (1 - viewSpan + scrollOffset);
              handleEndDrag(viewFrac);
            }}
            onDragStart={() => { setDragging("end"); onDragStart(); }}
            onDragEnd={() => { setDragging(null); onDragEnd(); }}
            trackWidth={trackWidth}
            isDragging={dragging === "end"}
          />

          {/* Days tooltip */}
          <DaysTooltip
            days={days}
            centerPx={centerPx}
            visible={dragging !== null}
          />
        </motion.div>

        {/* Month labels */}
        <MonthLabels
          months={months.map((m) => ({
            ...m,
            fraction: (m.fraction - (1 - viewSpan + scrollOffset)) / viewSpan,
          }))}
          trackWidth={trackWidth}
          selectedRange={range}
          onMonthClick={handleMonthClick}
        />
      </div>

      <div
        className={`${styles.scrollArrow} ${styles.scrollArrowRight} ${!canScrollRight ? styles.scrollArrowHidden : ""}`}
        onClick={() => scrollBy(viewSpan * 0.5)}
      >
        »
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/DateRangePicker/Timeline.tsx
git commit -m "feat: add Timeline with track, SVG ticks, scroll, range drag"
```

---

### Task 9: Main DateRangePicker Component

**Files:**
- Create: `src/components/DateRangePicker/DateRangePicker.tsx`
- Create: `src/components/DateRangePicker/index.ts`
- Create: `src/index.ts`

- [ ] **Step 1: Create DateRangePicker.tsx**

Create `src/components/DateRangePicker/DateRangePicker.tsx`:

```tsx
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import styles from "./DateRangePicker.module.css";
import Header from "./Header";
import Timeline from "./Timeline";
import {
  resolvePreset,
  startOfDay,
  subMonths,
  isSameDay,
} from "./utils";
import type { DateRangePickerProps, DateRange } from "./types";

export default function DateRangePicker({
  value,
  onChange,
  minDate,
  maxDate,
  presets,
  className,
  style,
}: DateRangePickerProps) {
  const today = startOfDay(new Date());
  const effectiveMaxDate = maxDate ? startOfDay(maxDate) : today;
  const effectiveMinDate = minDate ? startOfDay(minDate) : startOfDay(subMonths(effectiveMaxDate, 6));

  const [internalRange, setInternalRange] = useState<DateRange>(() => {
    if (value) return { start: startOfDay(value.start), end: startOfDay(value.end) };
    // Default: last 30 days
    const end = effectiveMaxDate;
    const start = startOfDay(new Date(end));
    start.setDate(start.getDate() - 29);
    return { start: start < effectiveMinDate ? effectiveMinDate : start, end };
  });

  const range = value ? { start: startOfDay(value.start), end: startOfDay(value.end) } : internalRange;

  const [activePresetIndex, setActivePresetIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = useCallback(
    (newRange: DateRange) => {
      const clamped = {
        start: newRange.start < effectiveMinDate ? effectiveMinDate : newRange.start,
        end: newRange.end > effectiveMaxDate ? effectiveMaxDate : newRange.end,
      };
      if (!value) setInternalRange(clamped);
      onChange(clamped);
    },
    [onChange, value, effectiveMinDate, effectiveMaxDate]
  );

  const handlePresetClick = useCallback(
    (index: number) => {
      if (!presets) return;
      const preset = presets[index];
      const resolved = resolvePreset(preset, effectiveMaxDate);
      setActivePresetIndex(index);
      handleChange(resolved);
    },
    [presets, effectiveMaxDate, handleChange]
  );

  const handleDragChange = useCallback(
    (newRange: DateRange) => {
      setActivePresetIndex(null);
      handleChange(newRange);
    },
    [handleChange]
  );

  // Check if current range matches any preset
  const detectActivePreset = useCallback(() => {
    if (!presets || isDragging) return;
    for (let i = 0; i < presets.length; i++) {
      const resolved = resolvePreset(presets[i], effectiveMaxDate);
      if (isSameDay(resolved.start, range.start) && isSameDay(resolved.end, range.end)) {
        setActivePresetIndex(i);
        return;
      }
    }
  }, [presets, range, effectiveMaxDate, isDragging]);

  return (
    <motion.div
      className={`${styles.root} ${className || ""}`}
      style={style}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Header
        range={range}
        presets={presets}
        activePresetIndex={activePresetIndex}
        onPresetClick={handlePresetClick}
      />
      <Timeline
        range={range}
        minDate={effectiveMinDate}
        maxDate={effectiveMaxDate}
        onChange={handleDragChange}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => {
          setIsDragging(false);
          detectActivePreset();
        }}
      />
    </motion.div>
  );
}
```

- [ ] **Step 2: Create index.ts (component export)**

Create `src/components/DateRangePicker/index.ts`:

```typescript
export { default as DateRangePicker } from "./DateRangePicker";
export type { DateRangePickerProps, DateRange, DateRangePreset } from "./types";
```

- [ ] **Step 3: Create src/index.ts (library entry point)**

Create `src/index.ts`:

```typescript
export { DateRangePicker } from "./components/DateRangePicker";
export type { DateRangePickerProps, DateRange, DateRangePreset } from "./components/DateRangePicker";
```

- [ ] **Step 4: Commit**

```bash
git add src/components/DateRangePicker/DateRangePicker.tsx src/components/DateRangePicker/index.ts src/index.ts
git commit -m "feat: add main DateRangePicker orchestrator with controlled/uncontrolled support"
```

---

### Task 10: Demo Page

**Files:**
- Modify: `src/demo/App.tsx`

- [ ] **Step 1: Update demo App.tsx**

Replace `src/demo/App.tsx` with:

```tsx
import { useState } from "react";
import { DateRangePicker } from "../components/DateRangePicker";
import type { DateRange } from "../components/DateRangePicker";

const presets = [
  { label: "This month", days: new Date().getDate() },
  { label: "Last 7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
];

const sixMonthsAgo = new Date();
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
sixMonthsAgo.setDate(1);

export default function App() {
  const [range, setRange] = useState<DateRange>({
    start: (() => {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      return d;
    })(),
    end: new Date(),
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: 32,
        boxSizing: "border-box",
        margin: 0,
      }}
    >
      <DateRangePicker
        value={range}
        onChange={setRange}
        minDate={sixMonthsAgo}
        presets={presets}
      />

      <div
        style={{
          marginTop: 24,
          padding: "12px 20px",
          background: "#fff",
          borderRadius: 10,
          fontFamily: "monospace",
          fontSize: 14,
          color: "#374151",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          textAlign: "center",
          lineHeight: 1.6,
        }}
      >
        <div style={{ color: "#9ca3af", fontSize: 11, marginBottom: 4, fontFamily: "sans-serif" }}>
          Selected Range (ISO 8601)
        </div>
        <div>
          {range.start.toISOString()}
        </div>
        <div style={{ color: "#9ca3af" }}>/</div>
        <div>
          {range.end.toISOString()}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update index.html**

Ensure `index.html` has no default margin/padding. Replace body content section if needed — the Vite template should already have `<div id="root"></div>`. Add a style reset:

```html
<!-- Inside <head>, add: -->
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
</style>
```

- [ ] **Step 3: Verify in browser**

```bash
npm run dev
```

Expected: The date range picker appears centered on a light gray background. Below it, the ISO dates update as you interact. Presets work, handles drag, months are clickable, scroll arrows navigate.

- [ ] **Step 4: Commit**

```bash
git add src/demo/App.tsx index.html
git commit -m "feat: add demo page with centered picker and ISO output"
```

---

### Task 11: Polish & Integration Testing

- [ ] **Step 1: Manual interaction test**

Open the dev server and test every interaction:
1. Drag start handle left — range expands, tooltip shows days
2. Drag end handle right — range expands
3. Drag range body — slides without changing width
4. Click "Last 7D" preset — range snaps, pill indicator slides
5. Click "30D" — range expands with animation
6. Click month label (e.g., "February") — selects full month
7. Click « to scroll left — new months appear
8. Click » to scroll right
9. Verify ISO dates below update correctly

- [ ] **Step 2: Fix any visual/interaction issues found**

Address issues from manual testing. Common things to tune:
- Handle hit area (should be generous — the `::before` pseudo-element in CSS)
- Spring stiffness/damping for different interaction types
- Tooltip positioning edge cases (near track edges)
- Month label alignment
- Scroll arrow visibility thresholds

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "polish: tune animations, fix interaction edge cases"
```

---

## Self-Review Checklist

- [x] **Spec coverage**: All 6 interactions covered (drag handles, drag range, click month, presets, scroll, auto-scroll). All 8 animations specified. Props API matches spec. CSS custom properties for theming. Demo page with ISO output.
- [x] **Placeholder scan**: All code blocks contain complete implementations. No TBD/TODO.
- [x] **Type consistency**: `DateRange`, `DateRangePreset`, `DateRangePickerProps` used consistently across all files. `dateToFraction`/`fractionToDate`/`clampDate` naming is consistent.
