import { motion } from "framer-motion";
import styles from "./DateRangePicker.module.css";

interface HandleProps {
  position: number;
  onDrag: (deltaFraction: number) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  trackWidth: number;
  isDragging: boolean;
  animated: boolean;
}

export default function Handle({
  position,
  onDrag,
  onDragStart,
  onDragEnd,
  trackWidth,
  isDragging,
  animated,
}: HandleProps) {
  const left = position * trackWidth;

  return (
    <motion.div
      className={`${styles.handle} ${isDragging ? styles.handleDragging : ""}`}
      animate={{ left }}
      transition={animated
        ? { type: "spring", stiffness: 300, damping: 30 }
        : { type: "tween", duration: 0 }
      }
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDragStart();
        const startX = e.clientX;
        const startFraction = position;

        const onMove = (moveEvent: PointerEvent) => {
          const dx = moveEvent.clientX - startX;
          const deltaFraction = trackWidth > 0 ? dx / trackWidth : 0;
          onDrag(startFraction + deltaFraction);
        };

        const onUp = () => {
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", onUp);
          onDragEnd();
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
      }}
    />
  );
}
