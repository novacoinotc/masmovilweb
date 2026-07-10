"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const GLYPHS = "0123456789ABCDEF·:";

/**
 * Sello notarial: scramble hex → cristalización → estampa.
 * Spring de sello canónico {520, 22} + flash de 80ms. Tres usos en toda la página.
 */
export default function SelloNotarial({
  text,
  active,
  sheen = false,
  className = "",
}: {
  text: string;
  active: boolean;
  sheen?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState("");
  const [stamped, setStamped] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) {
      setDisplay("");
      setStamped(false);
      return;
    }
    if (reduce) {
      setDisplay(text);
      setStamped(true);
      return;
    }
    let frame = 0;
    const total = 13; // ~600ms a 45ms/update
    timer.current = setInterval(() => {
      if (document.documentElement.dataset.frozen === "true") return;
      frame += 1;
      const fixed = Math.floor((frame / total) * text.length);
      setDisplay(
        text
          .split("")
          .map((ch, i) =>
            i < fixed || ch === " " ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          )
          .join("")
      );
      if (frame >= total) {
        if (timer.current) clearInterval(timer.current);
        setDisplay(text);
        setStamped(true);
      }
    }, 45);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [active, text, reduce]);

  if (!active) return null;

  return (
    <motion.span
      className={`sello ${sheen && stamped ? "sheen" : ""} ${className}`}
      initial={reduce ? false : { scale: 1.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 520, damping: 22 }}
    >
      {display || text}
      {stamped && !reduce && (
        <motion.span
          style={{ position: "absolute", inset: 0, background: "rgba(242,240,233,0.9)", borderRadius: 6 }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.08 }}
        />
      )}
    </motion.span>
  );
}
