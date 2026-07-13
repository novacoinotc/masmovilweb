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
  enter = [0, 0.07],
  exit = [0.94, 1],
  enterFrom = 0, // opacidad inicial: >0 = llega visible mientras la escena sube al pin
  exitTo = 0, // opacidad final: >0 = sigue visible al despinnear y sale con el scroll
  drift = 60,
  blur = true,
  style,
}: {
  progress: MotionValue<number>;
  children: ReactNode;
  className?: string;
  enter?: [number, number];
  exit?: [number, number];
  enterFrom?: number;
  exitTo?: number;
  drift?: number;
  blur?: boolean;
  style?: CSSProperties;
}) {
  const reduce = useReducedMotion();
  // móvil: sin blur scrubbed (caro en iOS) y deriva corta
  const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 720px)").matches;
  const d = isMobile ? Math.min(drift, 30) : drift;
  const useBlur = blur && !isMobile;
  const opacity = useTransform(progress, [enter[0], enter[1], exit[0], exit[1]], [enterFrom, 1, 1, exitTo]);
  const y = useTransform(
    progress,
    [enter[0], enter[1], exit[0], exit[1]],
    [d * (1 - enterFrom), 0, 0, -d * 0.8 * (1 - exitTo)]
  );
  const filter = useTransform(
    progress,
    [enter[0], enter[1], exit[0], exit[1]],
    [enterFrom > 0 ? "blur(3px)" : "blur(8px)", "blur(0px)", "blur(0px)", exitTo > 0 ? "blur(2px)" : "blur(6px)"]
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
      style={{ ...style, opacity, y, ...(useBlur ? { filter } : {}), willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}
