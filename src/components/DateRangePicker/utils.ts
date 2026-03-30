import {
  startOfDay,
  startOfMonth,
  endOfMonth,
  differenceInCalendarDays,
  addDays,
  subMonths,
  eachMonthOfInterval,
  format,
  isToday,
  isSameDay,
  clamp,
} from "date-fns";

export function totalDays(minDate: Date, maxDate: Date): number {
  return differenceInCalendarDays(maxDate, minDate);
}

export function dateToFraction(date: Date, minDate: Date, maxDate: Date): number {
  const total = totalDays(minDate, maxDate);
  if (total === 0) return 0;
  const days = differenceInCalendarDays(date, minDate);
  return Math.max(0, Math.min(1, days / total));
}

export function fractionToDate(fraction: number, minDate: Date, maxDate: Date): Date {
  const total = totalDays(minDate, maxDate);
  const days = Math.round(fraction * total);
  return startOfDay(addDays(minDate, days));
}

export function clampDate(date: Date, minDate: Date, maxDate: Date): Date {
  return clamp(date, { start: startOfDay(minDate), end: startOfDay(maxDate) });
}

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

export function rangeDayCount(start: Date, end: Date): number {
  return differenceInCalendarDays(end, start) + 1;
}

export function formatRangeLabel(start: Date, end: Date): { startLabel: string; endLabel: string } {
  const startLabel = format(start, "MMMM d");
  const endLabel = isToday(end) ? "Today" : format(end, "MMMM d");
  return { startLabel, endLabel };
}

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

/**
 * Subtle tick sound via Web Audio API. Very short, quiet click.
 */
let audioCtx: AudioContext | null = null;
export function playTickSound() {
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = 1800;
    gain.gain.value = 0.03;
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.03);
  } catch {
    // Audio not available — silent fail
  }
}

export { startOfMonth, endOfMonth, startOfDay, differenceInCalendarDays, isSameDay, format, isToday, subMonths };
