"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

/**
 * Estación de la toma única: el contenido entra desde abajo con blur
 * mientras la cámara llega, sostiene, y sale hacia arriba al partir.
 * Todo scrubbed contra el paso de la propia estación por el viewport.
 */
export default function Station({
  children,
  height = "160vh",
  align = "center",
  className = "",
  style,
}: {
  children: ReactNode;
  height?: string;
  align?: "center" | "left" | "right";
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const opacity = useTransform(scrollYProgress, [0.16, 0.36, 0.64, 0.84], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0.16, 0.36, 0.64, 0.84], [90, 0, 0, -90]);
  const filter = useTransform(
    scrollYProgress,
    [0.16, 0.36, 0.64, 0.84],
    ["blur(10px)", "blur(0px)", "blur(0px)", "blur(8px)"]
  );

  return (
    <section ref={ref} className={`station st-${align} ${className}`} style={{ minHeight: height, ...style }}>
      {reduce ? (
        <div className="station-in">{children}</div>
      ) : (
        <motion.div className="station-in" style={{ opacity, y, filter, willChange: "transform, opacity" }}>
          {children}
        </motion.div>
      )}
    </section>
  );
}
