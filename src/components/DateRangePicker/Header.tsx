import { motion, LayoutGroup } from "framer-motion";
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

  return (
    <div className={styles.header}>
      <span className={styles.rangeLabel}>
        {startLabel} – {endLabel}
      </span>

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
