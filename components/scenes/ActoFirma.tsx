"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useTransform, useReducedMotion } from "framer-motion";
import { useSceneMs } from "@/lib/time";
import SelloNotarial from "../SelloNotarial";
import ActFlow from "../ui/ActFlow";

type Tok = { t: string; c?: "c" | "k" | "s" | "n" };
const TOKENS: Tok[] = [
  { t: "ORDEN DE PAGO · SPEI\n", c: "k" },
  { t: "// preparando la operación…\n\n", c: "c" },
  { t: "  Monto      " }, { t: "$84,500.00 MXN\n", c: "n" },
  { t: "  Desde      " }, { t: "CLABE ···· 5678 90\n", c: "s" },
  { t: "  Para       " }, { t: "CLABE ···· 2345 67\n", c: "s" },
  { t: "  Concepto   " }, { t: "Nómina · 2a quincena\n", c: "s" },
  { t: "\n// verificando antes de mover un peso…\n\n", c: "c" },
  { t: "  Identidad del emisor", c: "k" }, { t: "     ✓ confirmada\n" },
  { t: "  Firma digital", c: "k" }, { t: "            ✓ auténtica\n" },
  { t: "  Pago único, sin copias", c: "k" }, { t: "   ✓ garantizado\n" },
];
const TOTAL = TOKENS.reduce((n, t) => n + t.t.length, 0);

const TAGS = ["Firma digital ✓", "Imposible de duplicar ✓", "Imposible de repetir ✓", "Doble verificación ✓"];

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
    <section className="scene trk-firma" id="firma" ref={ref}>
      <div className="stick">
        <div className="acto">
          <ActFlow progress={progress} className="narr" enter={[0, 0.06]} enterFrom={0.4} exit={[0.9, 1]} exitTo={0.85}>
            <p className="kicker">ACTO I · T=00.045</p>
            <h2 className="h2">Cada operación entra firmada. O no entra.</h2>
            <p className="lead">
              Cada orden de pago llega con una firma digital imposible de falsificar.
              Si alguien intenta copiarla, repetirla o alterarla, el sistema la rechaza
              antes de tocar un peso.
            </p>
            <p className="lead" style={{ marginTop: 14, fontSize: 15 }}>
              Nada entra dos veces, nada entra sin identidad: cada pago es único e
              irrepetible, aunque el internet falle o alguien reintente. Es el mismo
              estándar de seguridad que exige un banco.
            </p>
            <p className="ts mono">firmada · T=00.045.310</p>
          </ActFlow>

          <ActFlow progress={progress} enter={[0, 0.08]} enterFrom={0.35} exit={[0.9, 1]} exitTo={0.85} drift={70}>
          <motion.div style={reduce ? undefined : { scale: zoom }}>
            <div className="term2">
              <div className="term2-top">
                <div className="term2-dots"><i /><i /><i /></div>
                <span>orden-de-pago — masmovil</span>
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
                    <SelloNotarial text="FIRMA DIGITAL · VERIFICADA" active sheen />
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
