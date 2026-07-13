"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** Línea de progreso del viaje: 1px que se llena de oro. */
export default function ScrollLine() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  return <motion.div className="cine-line" style={{ scaleX }} aria-hidden="true" />;
}
