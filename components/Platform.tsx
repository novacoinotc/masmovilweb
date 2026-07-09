"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";
import Reveal from "./ui/Reveal";

type Tx = { id: number; dep: boolean; label: string; amt: number };

const SEQ: Omit<Tx, "id">[] = [
  { dep: true, label: "Depósito SPEI · CLABE •••2338", amt: 15200 },
  { dep: false, label: "Transferencia · Proveedor SA de CV", amt: 82450 },
  { dep: true, label: "Depósito SPEI · CLABE •••7714", amt: 63000 },
  { dep: true, label: "Depósito SPEI · CLABE •••1020", amt: 9800 },
  { dep: false, label: "Dispersión lote #3492 · 96 pagos", amt: 412300 },
  { dep: true, label: "Depósito SPEI · CLABE •••4402", amt: 230000 },
  { dep: true, label: "Depósito SPEI · CLABE •••8155", amt: 47500 },
  { dep: false, label: "Nómina quincenal · 58 empleados", amt: 386200 },
];

const fmt = (n: number) =>
  n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const SIDE = ["Dashboard", "Transferir", "Dispersión", "Nómina", "Cuentas CLABE", "Conciliación", "Seguridad"];

const buildUp = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};
const piece = {
  hidden: { opacity: 0, y: 22, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Platform() {
  const reduce = useReducedMotion();
  const rowsRef = useRef<HTMLDivElement>(null);
  const feedActive = useInView(rowsRef, { amount: 0.4 });

  const [saldo, setSaldo] = useState(4382150);
  const [flash, setFlash] = useState<"in" | "out" | null>(null);
  const [rows, setRows] = useState<Tx[]>([
    { id: 1, dep: true, label: "Depósito SPEI · CLABE •••4821", amt: 45000 },
    { id: 2, dep: false, label: "Dispersión lote #3491 · 218 pagos", amt: 982340 },
    { id: 3, dep: true, label: "Depósito SPEI · CLABE •••9106", amt: 128500 },
  ]);

  useEffect(() => {
    if (!feedActive) return;
    let idx = 0;
    let nextId = 100;
    const t = setInterval(() => {
      const s = SEQ[idx % SEQ.length];
      idx += 1;
      nextId += 1;
      const id = nextId;
      setRows((prev) => [{ id, ...s }, ...prev].slice(0, 3));
      setSaldo((prev) => prev + (s.dep ? s.amt : -s.amt));
      setFlash(s.dep ? "in" : "out");
      setTimeout(() => setFlash(null), 900);
    }, 2900);
    return () => clearInterval(t);
  }, [feedActive]);

  return (
    <section className="section" id="plataforma">
      <div className="container platform-wrap">
        <Reveal as="p" className="eyebrow centered">
          Plataforma de pagos
        </Reveal>
        <Reveal as="h2" className="h2">
          Un core transaccional <em className="grad">vivo, en producción.</em>
        </Reveal>

        <motion.div
          className="dash-wrap"
          initial={reduce ? false : { opacity: 0, y: 90, rotateX: 14, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="dash" role="img" aria-label="Vista ilustrativa de la plataforma de pagos MASMOVIL">
            <div className="dash-top">
              <div className="dash-dots">
                <i />
                <i />
                <i />
              </div>
              <span className="dash-url">app.masmovil · plataforma de pagos</span>
              <span className="dash-live">
                <span className="pulse-dot" /> SPEI en línea
              </span>
            </div>
            <motion.div
              className="dash-body"
              variants={buildUp}
              initial={reduce ? false : "hidden"}
              whileInView="visible"
              viewport={{ once: true, amount: 0.35 }}
            >
              <div className="dash-side">
                {SIDE.map((s, i) => (
                  <motion.div key={s} className={`ds-item ${i === 0 ? "active" : ""}`} variants={piece}>
                    {s}
                  </motion.div>
                ))}
              </div>
              <div className="dash-main">
                <div className="dash-cards">
                  <motion.div className="dc" variants={piece}>
                    <span className="dc-label">Saldo disponible</span>
                    <motion.span
                      className="dc-value"
                      animate={{
                        color: flash === "in" ? "#34d399" : flash === "out" ? "#f87171" : "#eef2ff",
                      }}
                      transition={{ duration: 0.6 }}
                    >
                      ${Math.floor(saldo).toLocaleString("es-MX")}.<small>00</small>
                    </motion.span>
                    <span className="dc-trend up">▲ Entradas hoy $612,400</span>
                  </motion.div>
                  <motion.div className="dc" variants={piece}>
                    <span className="dc-label">En tránsito</span>
                    <span className="dc-value">
                      $118,900.<small>00</small>
                    </span>
                    <span className="dc-trend">3 operaciones liquidando</span>
                  </motion.div>
                  <motion.div className="dc" variants={piece}>
                    <span className="dc-label">Operaciones 24h</span>
                    <span className="dc-value">1,284</span>
                    <span className="dc-trend up">100% conciliadas</span>
                  </motion.div>
                </div>

                <motion.div className="dash-chart" variants={piece} aria-hidden="true">
                  <svg viewBox="0 0 520 120" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#22d3ee" stopOpacity=".35" />
                        <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <motion.path
                      d="M0,95 C40,88 60,60 95,64 C130,68 150,40 190,45 C230,50 250,78 290,70 C330,62 350,30 395,34 C440,38 470,18 520,22"
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth="2.5"
                      initial={reduce ? false : { pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.6, ease: "easeInOut", delay: 0.5 }}
                    />
                    <path
                      d="M0,95 C40,88 60,60 95,64 C130,68 150,40 190,45 C230,50 250,78 290,70 C330,62 350,30 395,34 C440,38 470,18 520,22 L520,120 L0,120 Z"
                      fill="url(#chart-fill)"
                    />
                  </svg>
                </motion.div>

                <motion.div className="dash-rows" ref={rowsRef} variants={piece}>
                  <AnimatePresence initial={false} mode="popLayout">
                    {rows.map((r) => (
                      <motion.div
                        key={r.id}
                        className="dr"
                        layout
                        initial={{ opacity: 0, y: -18 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 12 }}
                        transition={{ type: "spring", stiffness: 300, damping: 28 }}
                      >
                        <span className={`dr-dot ${r.dep ? "in" : "out"}`} />
                        <span className="dr-label">{r.label}</span>
                        <span className={`dr-amt ${r.dep ? "in" : ""}`}>
                          {r.dep ? "+" : "−"} ${fmt(r.amt)}
                        </span>
                        <span className="dr-tag">{r.dep ? "CEP ✓" : "Liquidado"}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
