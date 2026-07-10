"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring, animate } from "framer-motion";
import { useTime } from "@/lib/time";
import Logo from "./ui/Logo";

const MARKS = [
  ["hero", "00.000", "ORIGEN"],
  ["firma", "00.045", "FIRMA"],
  ["escrutinio", "00.290", "ESCRUTINIO"],
  ["frontera", "00.620", "BANXICO"],
  ["cep", "00.870", "CEP"],
  ["envivo", "01.000", "EN VIVO"],
  ["acceso", "—", "ACCESO"],
] as const;

/** Cronómetro: obedece al scroll (T+00.XXXs); tras el beat, reloj real. */
export function Cronometro() {
  const { ms, live, frozen } = useTime();
  const ref = useRef<HTMLSpanElement>(null);

  useMotionValueEvent(ms, "change", (v) => {
    if (live || frozen) return;
    if (ref.current) {
      ref.current.textContent = `00.${String(Math.min(999, Math.max(0, Math.round(v)))).padStart(3, "0")}s`;
    }
  });

  useEffect(() => {
    if (!live) return;
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (document.documentElement.dataset.frozen === "true") return;
      const d = new Date();
      if (ref.current) {
        ref.current.textContent = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}.${String(d.getMilliseconds()).padStart(3, "0")}`;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [live]);

  return (
    <span className="crono" title="Tiempo de la operación. Avanza con tu scroll.">
      <span className="lbl">T+</span>
      <span ref={ref} aria-live="off">
        00.000s
      </span>
    </span>
  );
}

export function Nav2() {
  return (
    <header className="nav2">
      <div className="nav2-inner">
        <a href="#hero" className="logo" aria-label="MASMOVIL inicio">
          <Logo id="lg-nav" />
          <span>MASMOVIL</span>
        </a>
        <Cronometro />
        <a href="#acceso" className="btn btn-sm">
          Solicitar acceso
        </a>
      </div>
    </header>
  );
}

/** Scrubber de milisegundos: navegación = demo del sistema. */
export function MillisecondScrubber() {
  const { ms } = useTime();
  const { scrollY } = useScroll();
  const [active, setActive] = useState(0);
  const x = useSpring(0, { stiffness: 120, damping: 30, restDelta: 0.001 });

  useMotionValueEvent(ms, "change", (v) => {
    x.set(Math.min(1, Math.max(0, v / 1000)));
    const idx = v >= 1000 ? 5 : v >= 870 ? 4 : v >= 620 ? 3 : v >= 290 ? 2 : v >= 45 ? 1 : 0;
    setActive(idx);
  });

  function goTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const target = el.offsetTop;
    const dist = Math.abs(target - window.scrollY);
    animate(window.scrollY, target, {
      duration: Math.min(1.4, 0.8 + dist / 8000),
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => window.scrollTo(0, v),
    });
  }

  return (
    <div className="scrubber" role="navigation" aria-label="Línea de tiempo de la transferencia. Navega por milisegundo.">
      <div className="scrub-track">
        <motion.span className="scrub-fill" style={{ scaleX: x }} />
        <PlayheadPos x={x} />
        <div className="scrub-marks">
          {MARKS.map(([id, t, name], i) => (
            <button
              key={id}
              className={`scrub-mark ${active === i ? "active" : ""}`}
              style={{ left: `${(i / (MARKS.length - 1)) * 96 + 2}%` }}
              onClick={() => goTo(id)}
            >
              {t} <span>{name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlayheadPos({ x }: { x: ReturnType<typeof useSpring> }) {
  const ref = useRef<HTMLSpanElement>(null);
  useMotionValueEvent(x, "change", (v) => {
    if (ref.current) ref.current.style.left = `${v * 100}%`;
  });
  return <span ref={ref} className="playhead" />;
}
