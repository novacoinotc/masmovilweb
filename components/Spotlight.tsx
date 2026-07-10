"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate, useReducedMotion } from "framer-motion";

/** Halo de luz global que sigue al cursor por toda la página. */
export default function Spotlight() {
  const reduce = useReducedMotion();
  const x = useMotionValue(-600);
  const y = useMotionValue(-600);
  const sx = useSpring(x, { stiffness: 120, damping: 24 });
  const sy = useSpring(y, { stiffness: 120, damping: 24 });
  const bg = useMotionTemplate`radial-gradient(480px circle at ${sx}px ${sy}px, rgba(34, 211, 238, 0.04), transparent 70%)`;

  useEffect(() => {
    if (reduce) return;
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [reduce, x, y]);

  if (reduce) return null;
  return <motion.div className="spotlight" style={{ background: bg }} aria-hidden="true" />;
}
