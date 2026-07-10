"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import TiltCard from "../ui/TiltCard";
import MagneticButton from "../ui/MagneticButton";

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.09, delayChildren: 0.5 } } };
const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 32, mass: 0.9 } },
};

const PAYLOAD: Array<[string, string, boolean?]> = [
  ["monto", '$84,500.00 MXN', true],
  ["clabe_origen", "6461 8000 1234 5678 90"],
  ["clabe_destino", "0123 4567 8901 2345 67"],
  ["concepto", '"Nómina · 2a quincena"'],
  ["estado", "EN ESPERA · T=00.000"],
];

export default function Hero2() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  // salida acoplada a la cámara: el hero se despide, no se queda
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end 35%"] });
  const exitY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const exitOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const exitBlur = useTransform(scrollYProgress, [0.3, 1], ["blur(0px)", "blur(6px)"]);

  return (
    <section className="hero2" id="hero" ref={ref}>
      <motion.div
        className="container hero2-grid"
        style={reduce ? undefined : { y: exitY, opacity: exitOpacity, filter: exitBlur }}
        variants={container}
        initial={reduce ? false : "hidden"}
        animate="visible"
      >
        <div>
          <motion.div className="badge" variants={item}>
            <i />
            T=00.000 · UNA TRANSFERENCIA REAL, DILATADA
          </motion.div>
          <motion.h1 variants={item}>
            Una transferencia SPEI tarda un segundo.
            <span className="l2">Vamos a estirarlo hasta poder auditarlo.</span>
          </motion.h1>
          <motion.p className="hero2-sub" variants={item}>
            Esta página es una sola operación, dilatada milisegundo a milisegundo: la firma,
            el escrutinio, Banxico, el comprobante. Si resiste esta lupa, resiste la tuya.
          </motion.p>
          <motion.p className="cred mono" variants={item}>
            INFRAESTRUCTURA DE PAGOS SPEI · GUADALAJARA, MX · DESDE 2019
          </motion.p>
          <motion.div className="hero2-ctas" variants={item}>
            <MagneticButton href="#stack" className="btn btn-solid btn-lg">
              Dilatar el segundo ↓
            </MagneticButton>
            <MagneticButton href="#acceso" className="btn btn-lg">
              Solicitar acceso
            </MagneticButton>
          </motion.div>
        </div>

        <motion.div variants={item}>
          <TiltCard className="payload">
            <div className="cmt">{"// la operación protagonista"}</div>
            {PAYLOAD.map(([k, v, money]) => (
              <div className="row" key={k}>
                <span className="k">{k}</span>
                <span className="v">: </span>
                <span className={money ? "money" : "v"}>{v}</span>
              </div>
            ))}
          </TiltCard>
        </motion.div>
      </motion.div>
    </section>
  );
}
