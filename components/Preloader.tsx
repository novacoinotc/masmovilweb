"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const LINES = [
  "verificando canal STP",
  "cargando módulos CLABE · SPEI-IN · SPEI-OUT · CEP",
  "sincronizando reloj del servidor",
];

/** Preloader: el sistema arranca antes de dilatar el segundo. */
export default function Preloader() {
  const reduce = useReducedMotion();
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (reduce) {
      setDone(true);
      return;
    }
    let v = 0;
    const t = setInterval(() => {
      v = Math.min(100, v + 6 + Math.random() * 14);
      setPct(Math.floor(v));
      if (v >= 100) {
        clearInterval(t);
        setTimeout(() => setDone(true), 260);
      }
    }, 90);
    return () => clearInterval(t);
  }, [reduce]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="preloader"
          exit={{ opacity: 0, transition: { duration: 0.5, ease: [0.65, 0, 0.35, 1] } }}
          aria-hidden="true"
        >
          <div className="pre-in mono">
            <span className="pre-pct">{String(pct).padStart(3, "0")}</span>
            <div className="pre-lines">
              {LINES.map((l, i) => (
                <span key={l} style={{ opacity: pct > (i + 1) * 25 ? 1 : 0.25 }}>
                  {pct > (i + 1) * 25 ? "✓" : ">"} {l}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
