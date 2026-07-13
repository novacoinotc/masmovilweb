"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

const FRAMES = 140;
const src = (i: number) => `/seq/f_${String(i).padStart(4, "0")}.jpg`;

/**
 * La película de fondo: 140 renders fotorrealistas (Blender Cycles)
 * scrubbed por el scroll global. Técnica de secuencia pre-calculada:
 * carga progresiva, dibuja el frame más cercano disponible, cover-fit.
 */
export default function SequenceCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imgs: (HTMLImageElement | null)[] = Array(FRAMES + 1).fill(null);
    const ready: boolean[] = Array(FRAMES + 1).fill(false);
    let raf = 0;
    let smooth = 0;
    let lastDrawn = -1;
    let killed = false;

    function load(i: number, cb?: () => void) {
      if (i < 1 || i > FRAMES || imgs[i]) return;
      const im = new Image();
      im.decoding = "async";
      im.src = src(i);
      im.onload = () => {
        ready[i] = true;
        cb?.();
      };
      imgs[i] = im;
    }

    // orden de carga: primero anclas (cada 10), luego relleno secuencial
    load(1, () => {
      lastDrawn = -1; // fuerza redibujo
    });
    for (let i = 10; i <= FRAMES; i += 10) load(i);
    let fill = 2;
    const fillNext = () => {
      if (killed) return;
      let n = 0;
      while (fill <= FRAMES && n < 6) {
        if (!imgs[fill]) {
          load(fill);
          n++;
        }
        fill++;
      }
      if (fill <= FRAMES) setTimeout(fillNext, 120);
    };
    setTimeout(fillNext, 200);

    function nearest(i: number) {
      if (ready[i]) return i;
      for (let d = 1; d < FRAMES; d++) {
        if (i - d >= 1 && ready[i - d]) return i - d;
        if (i + d <= FRAMES && ready[i + d]) return i + d;
      }
      return -1;
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      lastDrawn = -1;
    }
    resize();
    window.addEventListener("resize", resize);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (document.hidden) return;
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      const target = Math.min(1, Math.max(0, window.scrollY / max));
      smooth += (target - smooth) * (reduce ? 1 : 0.09);
      const want = 1 + Math.round(smooth * (FRAMES - 1));
      const use = nearest(want);
      if (use === -1 || use === lastDrawn) return;
      const im = imgs[use]!;
      const cw = canvas!.width;
      const ch = canvas!.height;
      const s = Math.max(cw / im.naturalWidth, ch / im.naturalHeight);
      const w = im.naturalWidth * s;
      const h = im.naturalHeight * s;
      ctx!.drawImage(im, (cw - w) / 2, (ch - h) / 2, w, h);
      lastDrawn = use;
    };
    raf = requestAnimationFrame(tick);

    return () => {
      killed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [reduce]);

  return <canvas ref={ref} className="cine-canvas" aria-hidden="true" />;
}
