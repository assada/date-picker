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
