"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";

/**
 * Escena 3D continua (técnica oryzo): el riel del dinero como toma única.
 * Un tubo emisivo desciende en zigzag por el espacio; el pulso (orbe con glow
 * aditivo) viaja por él, y la cámara lo persigue scrubbed por el scroll global.
 * Sin postprocessing: glow por sprites aditivos. Congelable con data-frozen.
 */
export default function Scene3D() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const canvas = ref.current;
    if (!canvas) return;

    const isMobile = window.matchMedia("(max-width: 720px)").matches;
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !isMobile,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x04060e, 0.055);

    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 120);

    // ── El riel: curva descendente en zigzag ──
    const pts: THREE.Vector3[] = [];
    const DEPTH = 90;
    for (let i = 0; i <= 14; i++) {
      const t = i / 14;
      pts.push(
        new THREE.Vector3(
          Math.sin(t * Math.PI * 3.2) * 6 * (0.4 + t * 0.6),
          Math.cos(t * Math.PI * 2.1) * 2.4,
          -t * DEPTH
        )
      );
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 220, 0.035, 6, false),
      new THREE.MeshBasicMaterial({ color: 0x25b585, transparent: true, opacity: 0.5 })
    );
    scene.add(tube);

    // línea guía tenue paralela (profundidad)
    const guide = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(curve.getPoints(200).map((p) => p.clone().setY(p.y - 1.6))),
      new THREE.LineBasicMaterial({ color: 0xf2f0e9, transparent: true, opacity: 0.08 })
    );
    scene.add(guide);

    // ── glow sprite (textura radial generada) ──
    function glowTexture(inner: string, outer: string) {
      const c = document.createElement("canvas");
      c.width = c.height = 128;
      const g = c.getContext("2d")!;
      const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, inner);
      grad.addColorStop(0.35, outer);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(c);
    }

    // ── el pulso: núcleo + halo aditivo ──
    const pulse = new THREE.Group();
    pulse.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 20, 20),
        new THREE.MeshBasicMaterial({ color: 0x6ee7b7 })
      )
    );
    const halo = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture("rgba(110,231,183,0.95)", "rgba(52,211,153,0.35)"),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
      })
    );
    halo.scale.setScalar(2.6);
    pulse.add(halo);
    scene.add(pulse);

    // nodos-terminal en las 5 marcas del segundo
    const nodeTex = glowTexture("rgba(242,240,233,0.9)", "rgba(242,240,233,0.15)");
    [0.14, 0.32, 0.55, 0.74, 0.92].forEach((t) => {
      const s = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: nodeTex,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          transparent: true,
          opacity: 0.7,
        })
      );
      s.position.copy(curve.getPointAt(t));
      s.scale.setScalar(0.8);
      scene.add(s);
    });

    // ── partículas 3D (polvo del espacio) ──
    const N = isMobile ? 250 : 650;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 34;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 2] = -Math.random() * (DEPTH + 20) + 6;
    }
    const dust = new THREE.Points(
      new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(pos, 3)),
      new THREE.PointsMaterial({
        color: 0xf2f0e9,
        size: 0.06,
        transparent: true,
        opacity: 0.35,
        sizeAttenuation: true,
      })
    );
    scene.add(dust);

    // ── loop: cámara persigue al pulso según el scroll ──
    let raf = 0;
    let smooth = 0;
    let tPrev = performance.now();
    const camPos = new THREE.Vector3();
    const look = new THREE.Vector3();

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(50, now - tPrev);
      tPrev = now;
      if (document.hidden) return;
      const frozen = document.documentElement.dataset.frozen === "true";

      const doc = document.documentElement;
      const target = Math.min(1, Math.max(0, window.scrollY / Math.max(1, doc.scrollHeight - window.innerHeight)));
      if (!frozen) smooth += (target - smooth) * Math.min(1, dt * 0.004); // persecución mantecosa

      const tCam = Math.min(0.985, smooth);
      const tPulse = Math.min(0.999, tCam + 0.035);
      curve.getPointAt(tPulse, pulse.position as THREE.Vector3);

      curve.getPointAt(tCam, camPos);
      camPos.y += 0.9;
      camPos.z += 3.2;
      camera.position.lerp(camPos, 0.9);
      curve.getPointAt(Math.min(0.999, tCam + 0.06), look);
      camera.lookAt(look);

      if (!frozen) {
        const beat = 1 + Math.sin(now / 286) * 0.12; // latido 1.8s
        halo.scale.setScalar(2.6 * beat);
        dust.rotation.z += dt * 0.000012;
      }
      (halo.material as THREE.SpriteMaterial).color.setHex(frozen ? 0x25b585 : 0xffffff);
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      tube.geometry.dispose();
      dust.geometry.dispose();
    };
  }, [reduce]);

  if (reduce) return null;
  return <canvas ref={ref} className="scene3d" aria-hidden="true" />;
}
