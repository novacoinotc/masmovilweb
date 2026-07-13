"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useSceneMs } from "@/lib/time";
import Counter from "../ui/Counter";

const BENTO = [
  { k: "∞", t: "CLABEs ilimitadas", p: "Crea cuentas CLABE al instante: una por cliente, por proyecto o por empleado. Sabrás exactamente quién te pagó, sin preguntar.", hi: true },
  { k: "24/7/365", t: "SPEI in/out", p: "Entrada y salida sin horario bancario. La madrugada del 25 de diciembre opera igual que un martes." },
  { k: "1 → N", t: "Dispersión masiva", p: "Paga a miles de personas en una sola instrucción, con revisión previa y comprobante de cada pago." },
  { k: "quincena sin filas", t: "Nóminas", p: "Dispersión programada con calendario, reintentos controlados y comprobante por empleado." },
  { k: "0 hojas de cálculo", t: "Conciliación automática", p: "Cada movimiento se casa solo contra su orden, su CEP y su webhook. Las diferencias se señalan, no se buscan.", hi: true },
  { k: "N razones · 1 panel", t: "Multi-empresa", p: "Maneja varias empresas desde un solo lugar, cada una con sus cuentas y permisos separados." },
  { k: "evento → tu sistema", t: "Webhooks", p: "Tu sistema recibe aviso automático de cada movimiento, al instante. Nadie tiene que estar revisando." },
  { k: "1 acción · pausa", t: "Botón de emergencia", p: "Pausa tus pagos al instante y reactívalos cuando decidas. Ya lo probaste hace 200 milisegundos." },
];

const spring = { type: "spring" as const, stiffness: 260, damping: 32, mass: 0.9 };

export default function ActoFrontera() {
  const umbralRef = useRef<HTMLDivElement>(null);
  useSceneMs(umbralRef as React.RefObject<HTMLElement>, 620, 870, ["start 0.8", "end 0.2"]);
  const reduce = useReducedMotion();

  return (
    <section className="scene" id="frontera">
      <div className="umbral" ref={umbralRef}>
        <div className="puerta" aria-hidden="true" />
        <motion.div
          className="umbral-in"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={spring}
        >
          <p className="kicker azul" style={{ justifyContent: "center" }}>ACTO III · T=00.620</p>
          <span className="rotulo">SPEI · BANCO DE MÉXICO · VÍA PARTICIPANTES AUTORIZADOS</span>
          <h2 className="h2">
            Del lado de acá, nuestra plataforma.
            <br />
            Del lado de allá, Banxico.
          </h2>
          <p className="lead" style={{ margin: "0 auto" }}>
            En medio, 330 milisegundos. Esto es lo que tiene que existir para cruzarlos todos
            los días, a cualquier hora, sin ventanas de mantenimiento.
          </p>
        </motion.div>
      </div>

      <div className="flow">
        <div className="container">
          <motion.div
            className="bento"
            initial={reduce ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
          >
            {BENTO.map((b) => (
              <motion.div
                key={b.t}
                className={`bcell ${b.hi ? "hi" : ""}`}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: spring } }}
              >
                <span className="bk mono">{b.k}</span>
                <h3>{b.t}</h3>
                <p>{b.p}</p>
              </motion.div>
            ))}
          </motion.div>
          <div className="counters3">
            <div className="cnt">
              <div className="cv">ilimitadas</div>
              <div className="cl">CLABES EMITIBLES</div>
            </div>
            <div className="cnt">
              <div className="cv">
                <Counter to={99} format={(v) => `${Math.round(v)}.9%`} />
              </div>
              <div className="cl">DISPONIBILIDAD OBJETIVO</div>
            </div>
            <div className="cnt">
              <div className="cv">24/7/365</div>
              <div className="cl">OPERACIÓN</div>
            </div>
          </div>
          <p className="transito">liquidada en destino · generando comprobante · 00.620 → 00.870</p>
        </div>
      </div>
    </section>
  );
}
