"use client";

import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import type { ReactNode, PointerEvent } from "react";

/** Botón magnético: se inclina hacia el cursor y regresa con física de resorte. */
export default function MagneticButton({
  children,
  href,
  className = "btn",
  onClick,
  type,
}: {
  children: ReactNode;
  href?: string;
  className?: string;
  onClick?: () => void;
  type?: "submit" | "button";
}) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 18 });
  const sy = useSpring(y, { stiffness: 260, damping: 18 });

  function onMove(e: PointerEvent<HTMLElement>) {
    if (reduce) return;
    const b = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - b.left - b.width / 2) * 0.24);
    y.set((e.clientY - b.top - b.height / 2) * 0.24);
  }
  function onLeave() {
    x.set(0);
    y.set(0);
  }

  const props = {
    className,
    style: { x: sx, y: sy },
    onPointerMove: onMove,
    onPointerLeave: onLeave,
    whileTap: { scale: 0.96 },
    "data-magnetic": true,
  } as const;

  if (href) {
    return (
      <motion.a href={href} {...props}>
        {children}
      </motion.a>
    );
  }
  return (
    <motion.button type={type ?? "button"} onClick={onClick} {...props}>
      {children}
    </motion.button>
  );
}
