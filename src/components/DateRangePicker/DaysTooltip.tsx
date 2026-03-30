import { motion, AnimatePresence } from "framer-motion";
import styles from "./DateRangePicker.module.css";

interface DaysTooltipProps {
  days: number;
  centerPx: number;
  visible: boolean;
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

export default function DaysTooltip({ days, centerPx, visible }: DaysTooltipProps) {
  const digits = String(days).split("");

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
    </motion.div>
  );
}
