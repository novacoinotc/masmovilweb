"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

/** Cursor custom: punto + anillo con resorte; crece sobre elementos interactivos. */
export default function CustomCursor() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 350, damping: 28 });
  const ry = useSpring(y, { stiffness: 350, damping: 28 });

  useEffect(() => {
    if (reduce) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    document.body.classList.add("custom-cursor");

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as Element | null;
      setHovering(
        !!t?.closest("a, button, input, select, textarea, label, [data-magnetic]")
      );
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      document.body.classList.remove("custom-cursor");
    };
  }, [reduce, x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        className="cursor-dot"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        animate={{ scale: hovering ? 0.5 : 1 }}
      />
      <motion.div
        className="cursor-ring"
        style={{ x: rx, y: ry, translateX: "-50%", translateY: "-50%" }}
        animate={{
          scale: hovering ? 1.7 : 1,
          opacity: hovering ? 0.9 : 0.55,
          borderColor: hovering ? "rgba(52,211,153,0.7)" : "rgba(34,211,238,0.5)",
        }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      />
    </>
  );
}
