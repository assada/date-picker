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
