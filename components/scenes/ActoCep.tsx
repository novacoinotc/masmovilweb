"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValueEvent, useTransform, useReducedMotion } from "framer-motion";
import { useSceneMs, useTime } from "@/lib/time";
import TiltCard from "../ui/TiltCard";
import SelloNotarial from "../SelloNotarial";
import ActFlow from "../ui/ActFlow";

const CAMPOS = [
  ["EMISOR", "MASMOVIL, S.A. DE C.V. (vía participante autorizado)", 0.16],
  ["RECEPTOR", "BANCO DESTINO, S.A.", 0.24],
  ["CLAVE DE RASTREO", "MM8459201HJK220716", 0.32],
  ["FOLIO", "0074512", 0.4],
  ["SELLO DIGITAL", "3044…9f2e", 0.48],
] as const;

export default function ActoCep() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const progress = useSceneMs(ref, 870, 1000);
  const { setLive } = useTime();
  const [done, setDone] = useState(0);
  const [montoOn, setMontoOn] = useState(false);
  const [webhookOn, setWebhookOn] = useState(false);

  useMotionValueEvent(progress, "change", (p) => {
    setDone(CAMPOS.filter(([, , th]) => p >= th).length);
    setMontoOn(p >= 0.56);
    setWebhookOn(p >= 0.64);
    if (p >= 0.93) setLive(true);
    else if (p < 0.85) setLive(false);
  });

  // Beat a negro: entra y sale dentro de la escena (nunca queda pegado)
  const beat = useTransform(progress, [0.85, 0.92, 0.99], [0, 1, 0]);

  return (
    <section className="scene trk-cep" id="cep" ref={ref}>
      <div className="stick">
        <div className="acto">
          <ActFlow progress={progress} enter={[0, 0.08]} enterFrom={0.4} exit={[0.78, 0.85]} drift={60}>
            <TiltCard className="cep-card">
              <div className="cep-head">COMPROBANTE ELECTRÓNICO DE PAGO · BANCO DE MÉXICO</div>
              {CAMPOS.map(([k, v], i) => (
                <motion.div
                  key={k}
                  className="cep-row"
                  animate={{ opacity: done > i ? 1 : 0.15, y: done > i ? 0 : 4 }}
                  transition={{ type: "spring", stiffness: 260, damping: 32 }}
                >
                  <span className="ck">{k}</span>
                  <span className={`cvv ${k === "SELLO DIGITAL" ? "sello-dig" : ""}`}>
                    {done > i ? v : "·····"}
                  </span>
                </motion.div>
              ))}
              <div className="cep-row monto">
                <span className="ck">MONTO</span>
                <motion.span
                  className="cvv"
                  initial={false}
                  animate={montoOn ? { opacity: 1, scale: 1 } : { opacity: 0.15, scale: 1 }}
                  transition={{ type: "spring", stiffness: 520, damping: 22 }}
                >
                  {montoOn ? "$84,500.00 MXN" : "·····"}
                </motion.span>
              </div>
            </TiltCard>
          </ActFlow>

          <ActFlow progress={progress} className="narr" enter={[0, 0.09]} enterFrom={0.4} exit={[0.8, 0.86]}>
            <p className="kicker azul">ACTO IV · T=00.870</p>
            <h2 className="h2">La prueba no se solicita. Se genera sola.</h2>
            <p className="lead" style={{ marginBottom: 6 }}>
              <strong style={{ color: "var(--text-primario)" }}>CEP de Banxico en cada operación. Sin excepciones.</strong>
            </p>
            <p className="lead" style={{ fontSize: 15 }}>
              El Comprobante Electrónico de Pago es el documento con el que Banxico certifica
              que el dinero se movió. Nosotros lo adjuntamos a cada operación, no cuando
              alguien lo pide.
            </p>
            <AnimatePresence>
              {webhookOn && (
                <motion.div
                  className="webhook-log"
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 32 }}
                >
                  <span className="tok-c">{"// mientras tanto, en tu sistema"}</span>
                  {"\n"}aviso automático: <span className="ok">pago liquidado ✓</span> · 00.874.502
                  {"\n"}
                  <span className="tok-c">Tu plataforma ya lo sabe. Antes de que terminaras de leer este párrafo.</span>
                </motion.div>
              )}
            </AnimatePresence>
            <p className="ts mono">Trazabilidad: un documento de Banxico, por operación, disponible por API.</p>
            <p className="transito" style={{ textAlign: "left" }}>T=01.000 · soltando el tiempo</p>
          </ActFlow>
        </div>
      </div>
      {/* EL BEAT: la única interrupción del chrome */}
      <motion.div className="beat" style={{ opacity: reduce ? 0 : beat }} />
    </section>
  );
}
