"use client";

import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import type { ReactNode, PointerEvent } from "react";

/** Tarjeta con tilt 3D y glow que siguen al cursor. */
export default function TiltCard({
  children,
  className = "card",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [6, -6]), { stiffness: 220, damping: 20 });
  const ry = useSpring(useTransform(px, [0, 1], [-6, 6]), { stiffness: 220, damping: 20 });

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (reduce) return;
    const b = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - b.left) / b.width;
    const ny = (e.clientY - b.top) / b.height;
    px.set(nx);
    py.set(ny);
    e.currentTarget.style.setProperty("--mx", `${nx * 100}%`);
    e.currentTarget.style.setProperty("--my", `${ny * 100}%`);
  }
  function onLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <motion.div
      className={className}
      style={reduce ? undefined : { rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      {children}
    </motion.div>
  );
}
