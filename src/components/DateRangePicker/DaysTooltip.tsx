import { AnimatePresence, motion } from "framer-motion";
import styles from "./DateRangePicker.module.css";

interface DaysTooltipProps {
  days: number;
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
