# DateRangePicker — Design Spec

## Overview

A production-ready, animated date range picker React component with a horizontal timeline slider interface. Inspired by a video concept featuring smooth drag interactions, preset buttons, and clickable month labels.

The component is designed as a portable, self-contained module that can be integrated into any React project. A demo page showcases the component centered on screen with ISO date output below.

## Tech Stack

- **Vite** — build tool & dev server
- **React + TypeScript** — UI framework
- **Framer Motion** — animations
- **CSS Modules** — isolated styling with CSS custom properties for theming
- **date-fns** — lightweight date math (no moment.js)

## Architecture

### Component Tree

```
DateRangePicker
├── Header
│   ├── RangeLabel          — "March 9 – Today"
│   └── PresetButtons       — optional pill buttons
└── Timeline
    ├── ScrollArrow (left «)
    ├── Track
    │   ├── DayTicks        — vertical marks per day
    │   ├── RangeHighlight  — colored fill between handles
    │   ├── Handle (start)  — draggable
    │   ├── Handle (end)    — draggable
    │   └── DaysTooltip     — "30 Days" floating label
    ├── MonthLabels         — clickable month names
    └── ScrollArrow (right »)
```

### Props API

```typescript
interface DateRangePreset {
  label: string;          // "Last 7D"
  days?: number;          // 7 — calculates from today
  from?: Date;            // or explicit start
  to?: Date;              // or explicit end
}

interface DateRangePickerProps {
  // Core
  value?: { start: Date; end: Date };
  onChange: (range: { start: Date; end: Date }) => void;

  // Constraints
  minDate?: Date;
  maxDate?: Date;         // defaults to today

  // Presets (optional — if not provided, preset bar is hidden)
  presets?: DateRangePreset[];

  // Display
  monthsToShow?: number;  // visible months in viewport, default 4
  locale?: string;        // "en-US", "uk-UA", etc.

  // Style customization
  className?: string;
  style?: React.CSSProperties;
}
```

### Future Extension: Single Date Mode

The architecture is designed so that a future `mode: "single" | "range"` prop can be added. In single mode:
- Only one handle is rendered
- DaysTooltip is hidden
- onChange emits `{ start: Date; end: Date }` where start === end
- Presets would change to single-date presets ("Today", "Yesterday", etc.)

No code for this is implemented now — only the architecture supports it.

## File Structure

```
src/
├── components/
│   └── DateRangePicker/
│       ├── index.ts              — public export
│       ├── DateRangePicker.tsx    — main orchestrator component
│       ├── DateRangePicker.module.css — all component styles
│       ├── Header.tsx            — range label + preset buttons
│       ├── Timeline.tsx          — track container, scroll logic
│       ├── Handle.tsx            — single draggable handle
│       ├── DaysTooltip.tsx       — floating "N Days" label
│       ├── MonthLabels.tsx       — clickable month names below track
│       ├── types.ts              — shared interfaces & types
│       └── utils.ts              — date math, pixel positioning
├── demo/
│   └── App.tsx                   — demo page with ISO output
└── index.ts                      — library entry point
```

## Interactions

### 1. Drag Handles
- Drag start or end handle to adjust range boundaries
- Handle scales up slightly on grab (1.0 → 1.2)
- DaysTooltip appears on drag start, follows range center, hides on drag end
- Range highlight animates width/position with spring physics

### 2. Drag Range Body
- Grab the highlighted area between handles to slide entire range
- Range width stays constant, only position changes
- Cursor changes to `grab` / `grabbing`

### 3. Click Month Label
- Clicking a month name selects that full month (1st to last day)
- Handles snap to month boundaries with spring animation
- Active month label becomes bold

### 4. Click Preset Button
- Clicking a preset animates the range to the preset's dates
- Active preset gets a sliding background indicator (Framer Motion layoutId)
- Manual drag after preset clears the active preset state

### 5. Scroll Timeline
- « / » arrows at edges scroll the visible viewport
- Timeline translates with spring animation
- Arrow direction indicator appears/disappears based on scroll position
- Scrolling reveals additional months

### 6. Auto-Scroll on Drag
- When dragging a handle past the visible edge, timeline auto-scrolls
- Smooth continuous scroll while handle is at edge

## Animations (Framer Motion)

| Element | Trigger | Animation | Config |
|---------|---------|-----------|--------|
| Range Highlight | drag / preset click | spring width + position | `type: "spring", stiffness: 300, damping: 30` |
| Handles | drag / preset click | spring snap + scale on grab | `type: "spring", stiffness: 400, damping: 35` |
| Days Tooltip | drag start / end | fade in/out + follow center | `opacity` with duration 0.15 |
| Preset pill indicator | selection change | layoutId sliding background | shared layout animation |
| Month labels | scroll / range change | opacity + font-weight | `type: "spring", stiffness: 200` |
| Timeline scroll | arrow click / drag edge | spring translateX | `type: "spring", stiffness: 200, damping: 25` |
| Range label text | date change | AnimatePresence crossfade | `mode: "wait"`, duration 0.2 |
| Component mount | first render | fade in + scale 0.98→1.0 | `duration: 0.3, ease: "easeOut"` |

## Styling

### CSS Custom Properties (theming)

```css
--drp-bg: #ffffff;
--drp-border-radius: 16px;
--drp-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
--drp-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--drp-track-bg: #f5f5f5;
--drp-range-color: rgba(59, 130, 246, 0.15);
--drp-handle-color: #3b82f6;
--drp-tick-color: #d1d5db;
--drp-text-primary: #111827;
--drp-text-secondary: #6b7280;
--drp-preset-active-bg: #ffffff;
--drp-preset-bg: #f3f4f6;
```

### Design Details (from video)
- White card with generous padding and subtle shadow
- Light gray background behind the card (demo page)
- Rounded corners (16px)
- Thin day tick marks — subtle, not overwhelming
- Clean sans-serif typography
- Handles: small circular grabbers on the track
- Range highlight: semi-transparent blue/gray fill
- Preset buttons: pill-shaped, active one has white background with subtle shadow

## Demo Page

Single page with:
- Light gray background (#f5f5f5)
- DateRangePicker centered vertically and horizontally
- Below the picker: selected range displayed in ISO 8601 format
  - Format: `2026-03-09T00:00:00.000Z / 2026-03-30T00:00:00.000Z`
  - Updates reactively as range changes
- Default presets: "This month", "Last 7D", "30D", "90D"
- minDate: 6 months ago, maxDate: today

## Constraints & Edge Cases

- **minDate / maxDate**: handles cannot be dragged beyond these boundaries
- **Same-day range**: allowed (start === end, shows "1 Day")
- **Cross-month drag**: handle crossing a month boundary updates month label styling
- **Responsive**: component has a min-width but scales within its container
- **Keyboard**: not in initial scope (future enhancement)
- **Touch**: pointer events for both mouse and touch support
- **Performance**: day ticks are rendered as a single canvas or SVG path, not individual DOM elements
