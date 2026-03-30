# DateRangePicker

> Experimental timeline-based date range picker for React. Spring animations, backdrop-blur highlights, per-digit odometer, preset buttons.

**[Live Demo](https://assada.github.io/date-picker/)**

## Install

```bash
# npm
npm install github:assada/date-picker

# bun
bun add github:assada/date-picker
```

## Usage

```tsx
import { DateRangePicker } from 'date-picker'
import type { DateRange } from 'date-picker'

function App() {
  const [range, setRange] = useState<DateRange>({
    start: new Date(2026, 2, 1),
    end: new Date(2026, 2, 31),
  })

  return (
    <DateRangePicker
      value={range}
      onChange={setRange}
      minDate={new Date(2025, 0, 1)}
      presets={[
        { label: "Last 7D", days: 7 },
        { label: "30D", days: 30 },
        { label: "90D", days: 90 },
      ]}
    />
  )
}
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `value` | `DateRange` | Controlled range value |
| `onChange` | `(range: DateRange) => void` | Called when range changes |
| `minDate` | `Date` | Earliest selectable date |
| `maxDate` | `Date` | Latest selectable date (default: today) |
| `presets` | `DateRangePreset[]` | Quick-select preset buttons |
| `className` | `string` | Additional CSS class |
| `style` | `CSSProperties` | Inline styles |

## Presets

Presets with `days` expand symmetrically from the current selection center. Presets with `from`/`to` jump to an absolute range.

```ts
{ label: "This month", from: monthStart, to: monthEnd }  // absolute
{ label: "Last 7D", days: 7 }                             // relative to center
```

## Theming

Override CSS custom properties:

```css
.my-picker {
  --drp-bg: #1a1a2e;
  --drp-range-color: rgba(255, 255, 255, 0.12);
  --drp-handle-color: #e94560;
  --drp-text-primary: #eee;
}
```

## Status

This is an experimental component. API may change.

## License

MIT
