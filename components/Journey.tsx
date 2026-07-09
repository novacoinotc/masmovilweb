"use client";

import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";

const LAYERS = [
  {
    t: 0,
    name: "LA ORDEN",
    title: "El cliente ordena el pago",
    body: "Desde la plataforma web o directo desde tu sistema vía API. Individual, lote masivo o nómina completa.",
    chip: "POST /v1/transferencias",
  },
  {
    t: 0.18,
    name: "LA FIRMA",
    title: "La solicitud se autentica",
    body: "Firma HMAC verificada, protección anti-replay e idempotencia: nada entra al core sin identidad criptográfica.",
    chip: "X-Signature ✓ · X-Timestamp ✓",
  },
  {
    t: 0.42,
    name: "EL CORE",
    title: "El core valida y asienta",
    body: "Saldo, límites y CLABE destino verificados; banco detectado y asiento en el libro mayor de doble entrada.",
    chip: "ledger: débito ⇄ crédito",
  },
  {
    t: 0.85,
    name: "CUMPLIMIENTO",
    title: "Cumplimiento en línea",
    body: "Screening contra listas de sanciones y scoring de riesgo en tiempo real. Lo inusual se detiene aquí, no después.",
    chip: "PLD/AML · score: aprobado",
  },
  {
    t: 2.1,
    name: "RED SPEI",
    title: "Viaja por la red SPEI",
    body: "La orden llega al procesador autorizado y liquida en la infraestructura de Banco de México. 24/7/365.",
    chip: "Banxico · liquidando…",
  },
  {
    t: 3.8,
    name: "LIQUIDADA",
    title: "Liquidada, con comprobante",
    body: "El beneficiario ya tiene el dinero. CEP oficial de Banxico, clave de rastreo y webhook notificando a tu sistema.",
    chip: "estatus: liquidada · CEP ✓",
    final: true,
  },
];

const DEPTHS = ["#071026", "#081228", "#091730", "#071328", "#050e1f", "#03170f"];
const N = LAYERS.length;

const BUBBLES = [
  [6, 14, 11, 0], [14, 8, 15, 3], [24, 18, 13, 6], [33, 6, 17, 1.5],
  [44, 11, 12, 8], [55, 7, 16, 4], [63, 15, 10, 2], [72, 9, 14, 7],
  [80, 12, 12.5, 0.8], [88, 6, 18, 5], [94, 10, 13.5, 9], [50, 5, 19, 11],
];

function Layer({
  i,
  progress,
  layer,
}: {
  i: number;
  progress: MotionValue<number>;
  layer: (typeof LAYERS)[number];
}) {
  const seg = 1 / N;
  const start = i * seg;
  const isLast = i === N - 1;

  const y = useTransform(
    progress,
    i === 0
      ? [0, start + seg * 0.62, start + seg]
      : isLast
        ? [start - seg * 0.38, start + seg * 0.45, 1]
        : [start - seg * 0.38, start + seg * 0.45, start + seg * 0.62, start + seg],
    i === 0
      ? ["0vh", "0vh", "-108vh"]
      : isLast
        ? ["108vh", "0vh", "0vh"]
        : ["108vh", "0vh", "0vh", "-108vh"]
  );
  const numY = useTransform(progress, [start - seg * 0.4, start + seg], ["24%", "-24%"]);

  return (
    <motion.div className={`j-layer ${i % 2 === 0 ? "odd" : "even"}`} style={{ y }}>
      <motion.span className="j-num" style={{ y: numY }}>
        {String(i + 1).padStart(2, "0")}
      </motion.span>
      <div className={`j-card ${layer.final ? "final" : ""}`}>
        <h3>{layer.title}</h3>
        <p>{layer.body}</p>
        <code className={`j-chip ${layer.final ? "ok" : ""}`}>{layer.chip}</code>
      </div>
    </motion.div>
  );
}

export default function Journey() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const [hud, setHud] = useState({ t: "0.00", layer: "CAPA 01 · LA ORDEN" });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const p = v * N;
    const seg = Math.min(N - 1, Math.floor(p));
    const segP = Math.min(1, p - seg);
    const t0 = LAYERS[seg].t;
    const t1 = seg + 1 < N ? LAYERS[seg + 1].t : LAYERS[N - 1].t;
    setHud({
      t: (t0 + (t1 - t0) * segP).toFixed(2),
      layer: `CAPA 0${seg + 1} · ${LAYERS[seg].name}`,
    });
  });

  const bg = useTransform(scrollYProgress, [0, 0.2, 0.4, 0.6, 0.8, 1], DEPTHS);
  const packetTop = useTransform(scrollYProgress, [0, 1], ["14%", "80%"]);
  const fill = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const packetColor = useTransform(scrollYProgress, [0.86, 0.95], ["#22d3ee", "#34d399"]);
  const packetGlow = useTransform(
    scrollYProgress,
    [0.86, 0.95],
    ["0 0 24px 6px rgba(34,211,238,0.55)", "0 0 70px 24px rgba(52,211,153,0.6)"]
  );

  return (
    <section className="journey" id="viaje" ref={ref} aria-label="El viaje de una transferencia SPEI">
      <div className="j-view">
        <motion.div className="j-bg" style={{ backgroundColor: bg }} />
        <div className="j-bubbles" aria-hidden="true">
          {BUBBLES.map(([left, size, dur, delay], i) => (
            <i
              key={i}
              style={{
                left: `${left}%`,
                width: size,
                height: size,
                animationDuration: `${dur}s`,
                animationDelay: `${delay}s`,
              }}
            />
          ))}
        </div>
        <div className="j-line" aria-hidden="true">
          <motion.span className="j-fill" style={{ scaleY: fill }} />
        </div>
        <motion.div
          className="j-packet"
          aria-hidden="true"
          style={{ top: packetTop, backgroundColor: packetColor, boxShadow: packetGlow }}
        />
        <div className="j-hud" aria-hidden="true">
          <span className="j-hud-k">El viaje de una transferencia</span>
          <span className="j-hud-t">t = {hud.t} s</span>
          <span className="j-hud-l">{hud.layer}</span>
        </div>
        {LAYERS.map((l, i) => (
          <Layer key={l.name} i={i} progress={scrollYProgress} layer={l} />
        ))}
      </div>
    </section>
  );
}
