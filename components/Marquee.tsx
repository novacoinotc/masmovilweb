"use client";

import { motion, useReducedMotion } from "framer-motion";

const ITEMS = [
  "SPEI 24/7",
  "CLABEs ilimitadas",
  "Dispersión masiva",
  "API firmada HMAC",
  "Conciliación automática",
  "Telecomunicaciones",
  "Software a la medida",
  "CEP Banxico",
  "PLD / AML",
  "Multi-empresa",
];

export default function Marquee() {
  const reduce = useReducedMotion();
  const row = (key: string) => (
    <div key={key} style={{ display: "flex", alignItems: "center", gap: 34 }}>
      {ITEMS.map((t) => (
        <span key={t} style={{ display: "flex", alignItems: "center", gap: 34 }}>
          <span>{t}</span>
          <i>◆</i>
        </span>
      ))}
    </div>
  );

  return (
    <div className="marquee" aria-hidden="true">
      <motion.div
        className="marquee-track"
        animate={reduce ? undefined : { x: ["0%", "-50%"] }}
        transition={{ duration: 28, ease: "linear", repeat: Infinity }}
      >
        {row("a")}
        {row("b")}
      </motion.div>
    </div>
  );
}
