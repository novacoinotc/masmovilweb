"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import Reveal from "./ui/Reveal";

const TEXT =
  "Somos una empresa tecnológica tapatía. Nacimos en las telecomunicaciones y evolucionamos hacia la infraestructura financiera: hoy diseñamos, construimos y operamos software transaccional de grado bancario, con la misma obsesión por la disponibilidad que aprendimos operando redes.";

const FACTS = [
  ["Razón social", "MASMOVIL, S.A. de C.V."],
  ["Sede", "Guadalajara, Jalisco, México"],
  ["Inicio de operaciones", "Diciembre 2019"],
  ["Enfoque", "Telecom · Software · Pagos"],
] as const;

function Word({
  word,
  progress,
  range,
}: {
  word: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span style={{ opacity }}>
      {word}{" "}
    </motion.span>
  );
}

export default function Statement() {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.82", "end 0.45"],
  });
  const words = TEXT.split(" ");

  return (
    <section className="section" id="empresa">
      <div className="container">
        <Reveal as="p" className="eyebrow">
          La empresa
        </Reveal>
        <p className="statement-text" ref={ref}>
          {words.map((w, i) => (
            <Word
              key={i}
              word={w}
              progress={scrollYProgress}
              range={[i / words.length, Math.min(1, (i + 1.6) / words.length)]}
            />
          ))}
        </p>
        <div className="statement-facts">
          {FACTS.map(([k, v], i) => (
            <Reveal key={k} className="fact" delay={i * 0.08}>
              <span className="fact-k">{k}</span>
              <span className="fact-v">{v}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
