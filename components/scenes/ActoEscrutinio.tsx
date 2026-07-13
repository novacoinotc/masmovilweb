"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValueEvent } from "framer-motion";
import { useSceneMs, useTime } from "@/lib/time";
import ActFlow from "../ui/ActFlow";

const CHECKS = [
  ["revisión en listas negras", "sin coincidencias", "00.291.220", 0.18],
  ["nivel de riesgo", "bajo", "00.293.480", 0.28],
  ["comportamiento habitual", "normal", "00.296.011", 0.38],
  ["límites que marca la ley", "en regla", "00.298.735", 0.48],
] as const;

export default function ActoEscrutinio() {
  const ref = useRef<HTMLElement>(null);
  const progress = useSceneMs(ref, 290, 620);
  const { frozen, setFrozen } = useTime();
  const [done, setDone] = useState(0);

  useMotionValueEvent(progress, "change", (p) => {
    setDone(CHECKS.filter(([, , , th]) => p >= th).length);
  });

  return (
    <section className="scene trk-escrutinio" id="escrutinio" ref={ref}>
      <div className="stick">
        <div className="theatre">
          <ActFlow progress={progress} className="rings-wrap" enter={[0, 0.05]} enterFrom={0.4} exit={[0.92, 1]} exitTo={0.85} drift={30} blur={false}>
            <svg className="rings" viewBox="0 0 400 400" aria-hidden="true">
              {/* retícula polar estática: la regla de medición */}
              {Array.from({ length: 12 }, (_, i) => {
                const a = (i * 30 * Math.PI) / 180;
                return (
                  <line
                    key={i}
                    x1={200 + Math.cos(a) * 60}
                    y1={200 + Math.sin(a) * 60}
                    x2={200 + Math.cos(a) * 190}
                    y2={200 + Math.sin(a) * 190}
                    stroke="rgba(242,240,233,0.05)"
                    strokeWidth="1"
                  />
                );
              })}
              <g className={`ring ring-a ${done >= 2 ? "" : ""}`} style={{ opacity: done >= 4 ? 0.25 : 1, transition: "opacity 0.6s" }}>
                <circle cx="200" cy="200" r="90" fill="none" stroke="rgba(242,240,233,0.18)" strokeWidth="1.5" strokeDasharray="14 6 3 9 22 5 8 12" />
              </g>
              <g className="ring ring-b" style={{ opacity: done >= 4 ? 0.25 : 1, transition: "opacity 0.6s" }}>
                <circle cx="200" cy="200" r="130" fill="none" stroke="rgba(242,240,233,0.14)" strokeWidth="1.5" strokeDasharray="26 8 5 14 9 18 4 10" />
              </g>
              <g className="ring ring-c" style={{ opacity: done >= 4 ? 0.25 : 1, transition: "opacity 0.6s" }}>
                <circle cx="200" cy="200" r="170" fill="none" stroke="rgba(242,240,233,0.1)" strokeWidth="1.5" strokeDasharray="40 10 8 22 14 30 6 16" />
              </g>
              {/* el pulso atrapado: único verde de la escena */}
              <circle cx="200" cy="200" r="6" fill="var(--verde-nucleo)" className="pulso-svg" />
              <circle cx="200" cy="200" r="14" fill="none" stroke="var(--verde)" strokeWidth="2" opacity="0.35" />
              {/* etiquetas */}
              <text x="200" y="102" textAnchor="middle" fill="var(--text-muted)" fontSize="9" letterSpacing="3" fontFamily="var(--font-mono)">PREVENCIÓN DE LAVADO</text>
              <text x="200" y="62" textAnchor="middle" fill="var(--text-muted)" fontSize="9" letterSpacing="3" fontFamily="var(--font-mono)">LISTAS NEGRAS</text>
              <text x="200" y="22" textAnchor="middle" fill="var(--text-muted)" fontSize="9" letterSpacing="3" fontFamily="var(--font-mono)">VIGILANCIA IA</text>
            </svg>
          </ActFlow>

          <ActFlow progress={progress} enter={[0, 0.07]} enterFrom={0.4} exit={[0.92, 1]} exitTo={0.85}>
            <p className="kicker hueso">ACTO II · T=00.290</p>
            <h2 className="h2" style={{ fontSize: "clamp(24px, 3vw, 34px)" }}>
              245 milisegundos de escrutinio. Cero excepciones.
            </h2>
            <p className="lead" style={{ fontSize: 14.5, marginBottom: 18 }}>
              Tu dinero no avanza por confianza: avanza porque tres filtros independientes
              lo dejaron pasar — prevención de lavado de dinero, revisión contra listas
              negras y vigilancia con inteligencia artificial. En cada operación, sin
              excepciones.
            </p>
            <div className="checklist">
              {CHECKS.map(([name, res, ts], i) => (
                <motion.div
                  key={name}
                  className="chk"
                  animate={{ opacity: done > i ? 1 : 0.35, y: done > i ? 0 : 4 }}
                  transition={{ type: "spring", stiffness: 260, damping: 32 }}
                >
                  <span>
                    {done > i ? "✓" : "…"} {name}
                  </span>
                  <span className="res">{done > i ? res : ""}</span>
                  <span className="ts">{done > i ? ts : ""}</span>
                </motion.div>
              ))}
              <p className="chk-note">Cada verificación deja timestamp. Cada timestamp es auditable.</p>
            </div>

            <div className="kswitch">
              <p className="kk">T=00.400 · CONTROL OPERATIVO</p>
              <h3>Tú tienes la última palabra.</h3>
              <p>
                Un botón de emergencia real: pausa toda tu operación al instante, por
                cuenta o completa. Pruébalo — mantén presionado y detén esta página
                entera, igual que detendrías tus pagos.
              </p>
              <button
                className="kbtn"
                onPointerDown={() => setFrozen(true)}
                onPointerUp={() => setFrozen(false)}
                onPointerLeave={() => frozen && setFrozen(false)}
                onPointerCancel={() => setFrozen(false)}
                aria-pressed={frozen}
              >
                <i />
                MANTÉN PRESIONADO PARA SUSPENDER
              </button>
            </div>
          </ActFlow>
        </div>
      </div>

      <AnimatePresence>
        {frozen && (
          <>
            <motion.div
              className="banner-susp"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 260, damping: 32 }}
            >
              ⏸ OPERACIONES SUSPENDIDAS — 00.401s · REANUDA AL SOLTAR
            </motion.div>
            <motion.div
              className="freeze-frame"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            />
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
