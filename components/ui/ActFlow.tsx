"use client";

import { motion, useTransform, useReducedMotion, type MotionValue } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

/**
 * Acopla un bloque DOM al timeline de su acto (estilo toma-única):
 * entra desde abajo con blur, sostiene mientras la cámara está en la
 * región, y SALE hacia arriba antes de despinnear. Todo scrubbed.
 */
export default function ActFlow({
  progress,
  children,
  className,
  enter = [0.02, 0.12],
  exit = [0.86, 0.97],
  drift = 60,
  blur = true,
  style,
}: {
  progress: MotionValue<number>;
  children: ReactNode;
  className?: string;
  enter?: [number, number];
  exit?: [number, number];
  drift?: number;
  blur?: boolean;
  style?: CSSProperties;
}) {
  const reduce = useReducedMotion();
  const opacity = useTransform(progress, [enter[0], enter[1], exit[0], exit[1]], [0, 1, 1, 0]);
  const y = useTransform(progress, [enter[0], enter[1], exit[0], exit[1]], [drift, 0, 0, -drift * 0.8]);
  const filter = useTransform(
    progress,
    [enter[0], enter[1], exit[0], exit[1]],
    ["blur(8px)", "blur(0px)", "blur(0px)", "blur(6px)"]
  );

  if (reduce) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }
  return (
    <motion.div
      className={className}
      style={{ ...style, opacity, y, ...(blur ? { filter } : {}), willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}
