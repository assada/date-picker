import { motion, AnimatePresence } from "framer-motion";
import styles from "./DateRangePicker.module.css";

interface DaysTooltipProps {
  days: number;
  centerPx: number;
  visible: boolean;
  /** Width of the range highlight in px — used to decide if "Days" fits */
  rangeWidthPx: number;
}

function OdometerDigit({ digit }: { digit: string }) {
  return (
    <span style={{ display: "inline-block", position: "relative", overflow: "hidden", height: "1.2em", lineHeight: "1.2em" }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={digit}
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "inline-block" }}
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function DaysTooltip({ days, centerPx, visible, rangeWidthPx }: DaysTooltipProps) {
  const digits = String(days).split("");
  // Show "Days" suffix when the range highlight is wide enough (~80px+)
  const showDays = rangeWidthPx > 80;

  return (
    <motion.div
      className={styles.daysTooltip}
      animate={{
        left: centerPx,
        opacity: visible ? 1 : 0,
      }}
      transition={{
        left: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
    >
      {digits.map((d, i) => (
        <OdometerDigit key={digits.length - i} digit={d} />
      ))}
      <AnimatePresence>
        {showDays && (
          <motion.span
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ display: "inline-block", overflow: "hidden", whiteSpace: "nowrap", marginLeft: 3 }}
          >
            Days
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
