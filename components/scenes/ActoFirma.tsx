"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useTransform, useReducedMotion } from "framer-motion";
import { useSceneMs } from "@/lib/time";
import SelloNotarial from "../SelloNotarial";
import ActFlow from "../ui/ActFlow";

type Tok = { t: string; c?: "c" | "k" | "s" | "n" };
const TOKENS: Tok[] = [
  { t: "POST /v1/transfers\n", c: "k" },
  { t: "// firmando request…\n\n", c: "c" },
  { t: "{\n  " },
  { t: '"monto"', c: "k" }, { t: ": " }, { t: '"84500.00"', c: "n" }, { t: ",\n  " },
  { t: '"clabe_destino"', c: "k" }, { t: ": " }, { t: '"012345678901234567"', c: "s" }, { t: ",\n  " },
  { t: '"concepto"', c: "k" }, { t: ": " }, { t: '"Nómina · 2a quincena"', c: "s" }, { t: ",\n  " },
  { t: '"idempotency_key"', c: "k" }, { t: ": " }, { t: '"8f3a-…-91d2"', c: "s" }, { t: "\n}\n\n" },
  { t: "headers:\n", c: "c" },
  { t: "  X-Api-Key", c: "k" }, { t: ":     mm_live_…\n" },
  { t: "  X-Timestamp", c: "k" }, { t: ":   1767912045 " }, { t: "// anti-replay\n", c: "c" },
  { t: "  X-Signature", c: "k" }, { t: ":   hmac-sha256(payload)\n" },
];
const TOTAL = TOKENS.reduce((n, t) => n + t.t.length, 0);

const TAGS = ["firma HMAC ✓", "anti-replay ✓", "idempotency-key ✓", "2FA obligatorio ✓"];

export default function ActoFirma() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const progress = useSceneMs(ref, 45, 290);
  const [chars, setChars] = useState(0);
  const [fase, setFase] = useState(0); // 0 escribiendo · 1 sellado

  useMotionValueEvent(progress, "change", (p) => {
    const visible = Math.round(Math.min(1, Math.max(0, (p - 0.02) / 0.5)) * TOTAL);
    setChars(reduce ? TOTAL : visible);
    setFase(p >= 0.62 ? 1 : 0);
  });

  const zoom = useTransform(progress, [0.5, 0.66], [1, 1.05]);

  let acc = 0;
  return (
    <section className="scene" id="firma" ref={ref} style={{ height: "300vh" }}>
      <div className="stick">
        <div className="acto">
          <ActFlow progress={progress} className="narr" enter={[0.02, 0.11]} exit={[0.86, 0.96]}>
            <p className="kicker">ACTO I · T=00.045</p>
            <h2 className="h2">Cada operación entra firmada. O no entra.</h2>
            <p className="lead">
              Antes de mover un peso, el request se firma con HMAC, se sella contra
              repetición y se ancla a una llave de idempotencia. La API rechaza todo lo demás.
            </p>
            <p className="lead" style={{ marginTop: 14, fontSize: 15 }}>
              No hay endpoint abierto, no hay retry ambiguo, no hay operación duplicada. La
              firma es criptográfica, el reloj es del servidor y la llave es de un solo uso.
              Así se ve una API cuando el que la audita es un banco.
            </p>
            <p className="ts mono">firmada · T=00.045.310</p>
          </ActFlow>

          <ActFlow progress={progress} enter={[0.05, 0.15]} exit={[0.83, 0.94]} drift={80}>
          <motion.div style={reduce ? undefined : { scale: zoom }}>
            <div className="term2">
              <div className="term2-top">
                <div className="term2-dots"><i /><i /><i /></div>
                <span>POST /v1/transfers</span>
              </div>
              <div className="term2-body">
                {TOKENS.map((tok, i) => {
                  const start = acc;
                  acc += tok.t.length;
                  if (chars <= start) return null;
                  const text = chars >= acc ? tok.t : tok.t.slice(0, chars - start);
                  return (
                    <span key={i} className={tok.c ? `tok-${tok.c}` : undefined}>
                      {text}
                    </span>
                  );
                })}
                {chars < TOTAL && <span className="tcaret" />}
                {fase === 1 && (
                  <div style={{ marginTop: 14 }}>
                    <SelloNotarial text="HMAC-SHA256 · VERIFICADA" active sheen />
                  </div>
                )}
              </div>
            </div>
            {fase === 1 && (
              <motion.div
                className="tags"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.09 } } }}
              >
                {TAGS.map((t) => (
                  <motion.span
                    key={t}
                    className="tag"
                    variants={{
                      hidden: { opacity: 0, y: 8 },
                      visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 32 } },
                    }}
                  >
                    {t}
                  </motion.span>
                ))}
              </motion.div>
            )}
          </motion.div>
          </ActFlow>
        </div>
      </div>
    </section>
  );
}
