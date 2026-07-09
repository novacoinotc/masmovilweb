"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Fondo vivo: red de nodos en canvas.
 * - El tono viaja (cian → azul → verde) con la profundidad del scroll.
 * - Estelas de velocidad al escrolear rápido; el campo se desplaza contigo.
 * - El cursor atrae la red; clic/tap dispara chispas.
 */
export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isMobile = window.matchMedia("(max-width: 720px)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const COUNT = isMobile ? 30 : 72;
    const LINK = isMobile ? 100 : 150;
    const HUES = [195, 210, 222, 205, 160];

    let W = 0;
    let H = 0;
    let raf = 0;
    let running = true;
    let lastScroll = 0;
    let scrollVel = 0;

    type P = { x: number; y: number; vx: number; vy: number; r: number; dh: number };
    type S = { x: number; y: number; vx: number; vy: number; life: number; dh: number };
    let particles: P[] = [];
    const sparks: S[] = [];
    const mouse = { x: -9999, y: -9999 };

    function themeHue() {
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, window.scrollY / max));
      const seg = Math.min(HUES.length - 2, Math.floor(p * (HUES.length - 1)));
      const segP = p * (HUES.length - 1) - seg;
      return HUES[seg] + (HUES[seg + 1] - HUES[seg]) * segP;
    }

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      canvas!.style.width = `${W}px`;
      canvas!.style.height = `${H}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function make() {
      particles = Array.from({ length: COUNT }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.6 + 0.6,
        dh: Math.random() * 44,
      }));
    }

    function step() {
      raf = requestAnimationFrame(step);
      if (!running) return;
      const y = window.scrollY;
      scrollVel += (y - lastScroll - scrollVel) * 0.18;
      lastScroll = y;
      const hue = themeHue();
      const streak = Math.min(Math.abs(scrollVel) * 0.35, 18);

      ctx!.clearRect(0, 0, W, H);
      for (let i = 0; i < COUNT; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy - scrollVel * 0.055;

        const dxm = mouse.x - p.x;
        const dym = mouse.y - p.y;
        const dm = Math.hypot(dxm, dym);
        if (dm < 220 && dm > 0.001) {
          p.x += (dxm / dm) * 0.18;
          p.y += (dym / dm) * 0.18;
        }

        if (p.x < -20) p.x = W + 20;
        if (p.x > W + 20) p.x = -20;
        if (p.y < -30) p.y = H + 30;
        if (p.y > H + 30) p.y = -30;

        const h = (hue + p.dh) % 360;
        if (streak > 4) {
          ctx!.beginPath();
          ctx!.moveTo(p.x, p.y);
          ctx!.lineTo(p.x, p.y + (scrollVel > 0 ? streak : -streak));
          ctx!.strokeStyle = `hsla(${h},85%,66%,0.5)`;
          ctx!.lineWidth = p.r;
          ctx!.stroke();
        } else {
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx!.fillStyle = `hsla(${h},85%,66%,0.55)`;
          ctx!.fill();
        }

        for (let j = i + 1; j < COUNT; j++) {
          const q = particles[j];
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < LINK) {
            ctx!.beginPath();
            ctx!.moveTo(p.x, p.y);
            ctx!.lineTo(q.x, q.y);
            ctx!.strokeStyle = `hsla(${hue},60%,72%,${0.1 * (1 - d / LINK)})`;
            ctx!.lineWidth = 1;
            ctx!.stroke();
          }
        }
      }

      for (let s = sparks.length - 1; s >= 0; s--) {
        const sp = sparks[s];
        sp.x += sp.vx;
        sp.y += sp.vy - scrollVel * 0.055;
        sp.vx *= 0.96;
        sp.vy *= 0.96;
        sp.life -= 0.02;
        if (sp.life <= 0) {
          sparks.splice(s, 1);
          continue;
        }
        ctx!.beginPath();
        ctx!.arc(sp.x, sp.y, 2.4 * sp.life + 0.4, 0, Math.PI * 2);
        ctx!.fillStyle = `hsla(${(hue + sp.dh) % 360},90%,70%,${sp.life})`;
        ctx!.fill();
      }
    }

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onDown = (e: PointerEvent) => {
      for (let k = 0; k < 16; k++) {
        const a = (Math.PI * 2 * k) / 16 + Math.random() * 0.5;
        const spd = 1.4 + Math.random() * 3.2;
        sparks.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(a) * spd,
          vy: Math.sin(a) * spd,
          life: 1,
          dh: Math.random() * 44,
        });
      }
      if (sparks.length > 160) sparks.splice(0, sparks.length - 160);
    };
    const onVis = () => {
      running = !document.hidden;
    };
    const onResize = () => {
      resize();
      make();
    };

    resize();
    make();
    step();
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [reduce]);

  return <canvas ref={canvasRef} className="net-canvas" aria-hidden="true" />;
}
