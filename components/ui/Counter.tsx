"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring, useMotionValueEvent } from "framer-motion";

/** Contador animado con física de resorte al entrar en viewport. */
export default function Counter({
  to,
  format = (v: number) => String(Math.round(v)),
}: {
  to: number;
  format?: (v: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 60, damping: 20 });

  useEffect(() => {
    if (inView) mv.set(to);
  }, [inView, to, mv]);

  useMotionValueEvent(spring, "change", (v) => {
    if (ref.current) ref.current.textContent = format(v);
  });

  return <span ref={ref}>{format(0)}</span>;
}
