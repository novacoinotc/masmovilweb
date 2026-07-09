"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
  useReducedMotion,
} from "framer-motion";
import MagneticButton from "./ui/MagneticButton";
import Counter from "./ui/Counter";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 42 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.95, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  // Parallax 3D con el cursor
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-2.5, 2.5]), { stiffness: 120, damping: 20 });
  const rotateX = useSpring(useTransform(my, [0, 1], [2.5, -2.5]), { stiffness: 120, damping: 20 });
  const tx = useSpring(useTransform(mx, [0, 1], [-14, 14]), { stiffness: 120, damping: 20 });

  // Zoom-out al escrolear
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end 45%"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.93]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <section
      className="hero"
      id="hero"
      ref={ref}
      onPointerMove={(e) => {
        if (reduce) return;
        mx.set(e.clientX / window.innerWidth);
        my.set(e.clientY / window.innerHeight);
      }}
      onPointerLeave={() => {
        mx.set(0.5);
        my.set(0.5);
      }}
    >
      <motion.div
        className="hero-content"
        style={reduce ? undefined : { rotateX, rotateY, x: tx, scale, opacity, y }}
        variants={container}
        initial={reduce ? false : "hidden"}
        animate="visible"
      >
        <motion.div className="hero-badge" variants={item}>
          <span className="pulse-dot" />
          Guadalajara, México &nbsp;·&nbsp; Operando desde 2019
        </motion.div>

        <h1 className="hero-title">
          <motion.span className="line" variants={item}>
            Tecnología que
          </motion.span>
          <motion.span className="line" variants={item}>
            <em className="grad">mueve datos</em>
          </motion.span>
          <motion.span className="line" variants={item}>
            y <em className="grad-money">mueve dinero</em>.
          </motion.span>
        </h1>

        <motion.p className="hero-sub" variants={item}>
          MASMOVIL es una empresa mexicana de telecomunicaciones y software. Diseñamos
          conectividad, plataformas digitales e infraestructura de pagos en tiempo real
          sobre la red <strong>SPEI de Banco de México</strong>.
        </motion.p>

        <motion.div className="hero-ctas" variants={item}>
          <MagneticButton href="#plataforma">
            Conoce la plataforma
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 12h14m0 0-6-6m6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </MagneticButton>
          <MagneticButton href="#contacto" className="btn btn-ghost">
            Hablar con nosotros
          </MagneticButton>
        </motion.div>

        <motion.div className="hero-stats" variants={item}>
          <div className="stat">
            <span className="stat-num">
              <Counter to={2019} />
            </span>
            <span className="stat-label">Año de fundación</span>
          </div>
          <div className="stat">
            <span className="stat-num">
              24/7<small>/365</small>
            </span>
            <span className="stat-label">Operación en tiempo real</span>
          </div>
          <div className="stat">
            <span className="stat-num">
              <Counter to={99} />
              .9%
            </span>
            <span className="stat-label">Disponibilidad de plataforma</span>
          </div>
          <div className="stat">
            <span className="stat-num">&lt; 5s</span>
            <span className="stat-label">Liquidación SPEI</span>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="hero-hint"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        style={reduce ? undefined : { opacity }}
      >
        <span>Desliza para explorar</span>
        <div className="mouse-icon">
          <i />
        </div>
      </motion.div>
    </section>
  );
}
