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
  const maxScroll = 0;
  const minScroll = -(1 - viewSpan);

  const clampScroll = useCallback((s: number) => Math.max(minScroll, Math.min(maxScroll, s)), [minScroll]);

  // Transform fraction to pixel in viewport
  const fracToViewPx = useCallback((frac: number) => {
    const viewFrac = frac - (1 - viewSpan + scrollOffset);
    return (viewFrac / viewSpan) * trackWidth;
  }, [viewSpan, scrollOffset, trackWidth]);

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
    // Scroll to center the clicked month
    const midFrac = (dateToFraction(clampedStart, minDate, maxDate) + dateToFraction(clampedEnd, minDate, maxDate)) / 2;
    const targetScroll = -(1 - viewSpan) + midFrac - viewSpan / 2;
    setScrollOffset(clampScroll(targetScroll));
    onChange({ start: startOfDay(clampedStart), end: startOfDay(clampedEnd) });
  };

  // Generate SVG ticks — all same height
  const tickPaths: string[] = [];
  for (let i = 0; i <= total; i++) {
    const x = (i / total) * 100;
    tickPaths.push(`M${x} 8V24`);
  }

  const rawStartPx = fracToViewPx(startFrac);
  const rawEndPx = fracToViewPx(endFrac);
  const startPx = Math.max(0, rawStartPx);
  const endPx = Math.min(trackWidth, rawEndPx);
  const highlightWidth = Math.max(0, endPx - startPx);
  const clampedCenterPx = (startPx + endPx) / 2;

  return (
    <div className={styles.timeline}>
      <div
        className={`${styles.scrollArrow} ${styles.scrollArrowLeft} ${!canScrollLeft ? styles.scrollArrowHidden : ""}`}
        onClick={() => scrollBy(-viewSpan * 0.5)}
      >
        «
      </div>

      <div className={styles.trackContainer}>
        <div ref={trackRef} className={styles.track}>
          {/* SVG day ticks */}
          <svg
            className={styles.ticksSvg}
            viewBox="0 0 100 32"
            preserveAspectRatio="none"
          >
            <g
              style={{
                transform: `translateX(${(-(1 - viewSpan + scrollOffset) / viewSpan) * 100}%) scaleX(${1 / viewSpan})`,
                transformOrigin: "0 0",
                transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
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

          {/* Range highlight — spring on click, instant on drag */}
          <motion.div
            className={`${styles.rangeHighlight} ${dragging === "range" ? styles.rangeHighlightDragging : ""}`}
            animate={{ left: startPx, width: highlightWidth }}
            transition={dragging
              ? { type: "tween", duration: 0 }
              : { type: "spring", stiffness: 300, damping: 30 }
            }
            onPointerDown={handleRangePointerDown}
          />

          {/* Handles — same logic: spring on click, instant on drag */}
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
            animated={!dragging}
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
            animated={!dragging}
          />

          {/* Days tooltip */}
          <DaysTooltip
            days={days}
            centerPx={clampedCenterPx}
            visible={true}
            rangeWidthPx={highlightWidth}
          />
        </div>
      </div>

      {/* Month labels — outside trackContainer to avoid overflow:hidden clipping */}
      <MonthLabels
        months={months
          .map((m) => ({
            ...m,
            fraction: (m.fraction - (1 - viewSpan + scrollOffset)) / viewSpan,
          }))
          .filter((m) => m.fraction > -0.1 && m.fraction < 1.1)}
        trackWidth={trackWidth}
        selectedRange={range}
        onMonthClick={handleMonthClick}
      />

      <div
        className={`${styles.scrollArrow} ${styles.scrollArrowRight} ${!canScrollRight ? styles.scrollArrowHidden : ""}`}
        onClick={() => scrollBy(viewSpan * 0.5)}
      >
        »
      </div>
    </div>
  );
}
