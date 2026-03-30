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

  const detectActivePreset = useCallback(() => {
    if (!presets) return;
    for (let i = 0; i < presets.length; i++) {
      const resolved = resolvePreset(presets[i], effectiveMaxDate);
      if (isSameDay(resolved.start, range.start) && isSameDay(resolved.end, range.end)) {
        setActivePresetIndex(i);
        return;
      }
    }
  }, [presets, range, effectiveMaxDate]);

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
