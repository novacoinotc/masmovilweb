"use client";

import { useRef, useState } from "react";
import { useMotionValueEvent } from "framer-motion";
import { useSceneMs } from "@/lib/time";
import ActFlow from "../ui/ActFlow";

const CAPAS = [
  {
    num: "CAPA 01 · FÍSICA",
    title: "Telecomunicaciones",
    body: "La red que transporta. Conectividad y enlaces operados por nosotros, no rentados a ciegas.",
    caps: ["Enlaces dedicados", "Redundancia de red", "Operación propia"],
  },
  {
    num: "CAPA 02 · LÓGICA",
    title: "Software a la medida",
    body: "Los sistemas que orquestan. Ingeniería propia para casos que el software de catálogo no cubre.",
    caps: ["Desarrollo a la medida", "Integraciones core", "Equipo en México"],
  },
  {
    num: "CAPA 03 · VALOR — PRODUCTO ESTRELLA",
    title: "Infraestructura de pagos SPEI",
    body: "El riel del dinero. Emisión de CLABEs, dispersión, conciliación y trazabilidad de nivel bancario, conectados a Banxico vía STP.",
    caps: ["CLABEs ilimitadas", "SPEI in/out 24/7/365", "Multi-empresa", "CEP en cada operación"],
    estrella: true,
  },
];

export default function Stack() {
  const ref = useRef<HTMLElement>(null);
  const progress = useSceneMs(ref, 0, 45);
  const [active, setActive] = useState(-1);

  useMotionValueEvent(progress, "change", (p) => {
    setActive(p >= 0.56 ? 2 : p >= 0.28 ? 1 : p > 0.02 ? 0 : -1);
  });

  return (
    <section className="scene" id="stack" ref={ref} style={{ height: "230vh" }}>
      <div className="stick" style={{ display: "flex", alignItems: "center" }}>
        <ActFlow progress={progress} className="container" enter={[0.01, 0.09]} exit={[0.9, 0.99]}>
          <p className="kicker">ANTES DE SOLTAR EL PULSO</p>
          <h2 className="h2">Tres capas sostienen este segundo.</h2>
          <p className="lead">
            MASMOVIL no es solo una API. Es la empresa tecnológica que construyó la red, los
            sistemas y el riel por el que este dinero está a punto de viajar.
          </p>
          <div className="strata">
            {CAPAS.map((c, i) => (
              <div
                key={c.title}
                className={`stratum ${i === active || active > i ? "active" : ""} ${c.estrella ? "estrella" : ""}`}
                style={{ opacity: active >= i ? 1 : 0.35, transition: "opacity 0.4s ease" }}
              >
                <span className="num">{c.num}</span>
                <div>
                  <h3>{c.title}</h3>
                  <p>{c.body}</p>
                </div>
                <div className="caps">
                  {c.caps.map((x) => (
                    <b key={x}>▸ {x}</b>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="transito">acelerando · 00.000 → 00.045</p>
        </ActFlow>
      </div>
    </section>
  );
}
