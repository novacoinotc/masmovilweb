"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Logo from "../ui/Logo";

const INDICE = [
  ["#hero", "00.000 Origen — la orden y el stack"],
  ["#firma", "00.045 Firma — API y HMAC"],
  ["#escrutinio", "00.290 Escrutinio — seguridad y cumplimiento"],
  ["#frontera", "00.620 Banxico — plataforma SPEI"],
  ["#cep", "00.870 CEP — la prueba y los webhooks"],
  ["#envivo", "01.000 En vivo — dashboard y operadores"],
  ["#acceso", "Acceso — solicitar prueba"],
] as const;

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: { delay: 0.4 + i * 0.22, duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export default function TierraLegal() {
  const reduce = useReducedMotion();
  const visitRef = useRef<HTMLSpanElement>(null);
  const start = useRef(0);

  useEffect(() => {
    start.current = performance.now();
    const t = setInterval(() => {
      if (!visitRef.current) return;
      const s = (performance.now() - start.current) / 1000;
      const m = Math.floor(s / 60);
      visitRef.current.textContent = `${String(m).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <footer className="tierra" id="tierra">
      <motion.div
        initial={reduce ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
      >
        {/* tramo final del riel + símbolo de tierra ⏚ */}
        <motion.svg width="120" height="120" viewBox="0 0 120 120" style={{ margin: "0 auto" }} aria-hidden="true">
          <motion.line x1="60" y1="0" x2="60" y2="52" stroke="var(--border-activo)" strokeWidth="2" variants={draw} custom={0} />
          <motion.line x1="28" y1="60" x2="92" y2="60" stroke="var(--text-primario)" strokeWidth="2.5" variants={draw} custom={1} />
          <motion.line x1="40" y1="74" x2="80" y2="74" stroke="var(--text-primario)" strokeWidth="2.5" variants={draw} custom={2} />
          <motion.line x1="51" y1="88" x2="69" y2="88" stroke="var(--text-primario)" strokeWidth="2.5" variants={draw} custom={3} />
          <motion.circle
            cx="60" cy="56" r="3" fill="var(--text-primario)"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 1.3 } } }}
            className="pulso-tierra"
          />
        </motion.svg>

        <p className="kicker hueso" style={{ justifyContent: "center", marginTop: 8 }}>⏚ · TIERRA</p>
        <p className="frase">Toda red seria está aterrizada. Esta también — legalmente.</p>

        <motion.div
          className="placa"
          variants={{
            hidden: { opacity: 0, y: 16 },
            visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 32, delay: 1.1 } },
          }}
          title="Verificable ante el SAT"
        >
          MASMOVIL, S.A. DE C.V.
          <br />
          RFC MAS191203EY6
          <br />
          Pompeya 2775, Lomas de Guevara, C.P. 44657
          <br />
          Guadalajara, Jalisco, México · desde 2019
        </motion.div>

        <div className="tierra-links">
          <a href="mailto:direccion@masmovil.lat">direccion@masmovil.lat</a>
          <a href="#acceso">Solicitar acceso</a>
        </div>

        <nav className="indice" aria-label="Índice de la operación">
          <span style={{ letterSpacing: "0.2em", marginBottom: 6 }}>ÍNDICE DE LA OPERACIÓN</span>
          {INDICE.map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
          <span className="logo" style={{ opacity: 0.7 }}>
            <Logo id="lg-footer" />
            <span>MASMOVIL</span>
          </span>
        </div>
        <p className="fin">
          Infraestructura de pagos para México. · TU VISITA DURÓ <span ref={visitRef} className="mono">00:00</span> · EOF
          <br />© 2026 MASMOVIL, S.A. de C.V. Todos los derechos reservados.
        </p>
      </motion.div>
    </footer>
  );
}
