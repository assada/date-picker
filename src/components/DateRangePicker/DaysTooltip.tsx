import { motion, AnimatePresence } from "framer-motion";
import styles from "./DateRangePicker.module.css";

interface DaysTooltipProps {
  days: number;
  centerPx: number;
  visible: boolean;
}

export default function DaysTooltip({ days, centerPx, visible }: DaysTooltipProps) {
  const label = days === 1 ? "1" : days < 10 ? String(days) : `${days} Days`;

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
      <AnimatePresence mode="popLayout">
        <motion.span
          key={days}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -12, opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{ display: "inline-block" }}
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  );
}
