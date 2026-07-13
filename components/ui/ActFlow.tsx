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
  // móvil: pisos de opacidad más altos, deriva corta y CERO blur —
  // pero el filtro SIEMPRE lo gestiona framer (si se excluye, el blur
  // del HTML del servidor se queda pegado y todo se ve borroso/oscuro)
  const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 720px)").matches;
  const d = isMobile ? Math.min(drift, 24) : drift;
  const ef = isMobile && enterFrom > 0 ? Math.max(enterFrom, 0.6) : enterFrom;
  const xt = isMobile && exitTo > 0 ? Math.max(exitTo, 0.92) : exitTo;
  const opacity = useTransform(progress, [enter[0], enter[1], exit[0], exit[1]], [ef, 1, 1, xt]);
  const y = useTransform(
    progress,
    [enter[0], enter[1], exit[0], exit[1]],
    [d * (1 - ef), 0, 0, -d * 0.8 * (1 - xt)]
  );
  const cero = "blur(0px)";
  const filter = useTransform(
    progress,
    [enter[0], enter[1], exit[0], exit[1]],
    isMobile
      ? [cero, cero, cero, cero]
      : [ef > 0 ? "blur(3px)" : "blur(8px)", cero, cero, xt > 0 ? "blur(2px)" : "blur(6px)"]
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
