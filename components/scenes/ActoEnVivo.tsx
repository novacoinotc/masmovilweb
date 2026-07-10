"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";
import { useTime, type Fila } from "@/lib/time";

/* ── Canvas de ramificación: el riel se vuelve red ── */
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function RamificacionCanvas({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !active) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const isMobile = window.matchMedia("(max-width: 720px)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
    const W = (canvas.width = canvas.offsetWidth * dpr);
    const H = (canvas.height = canvas.offsetHeight * dpr);
    ctx.scale(dpr, dpr);
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    const rnd = mulberry32(84500);
    const N_BRANCH = isMobile ? 40 : 110;
    const N_PULSE = isMobile ? 50 : 220;

    type Branch = { pts: { x: number; y: number }[]; birth: number; len: number };
    const branches: Branch[] = [];
    for (let i = 0; i < N_BRANCH; i++) {
      const pts = [{ x: w / 2 + (rnd() - 0.5) * 40, y: -10 }];
      let x = pts[0].x;
      let y = pts[0].y;
      while (y < h + 20) {
        y += 80 + rnd() * 60;
        x += (rnd() - 0.5) * 2 * Math.tan((30 * Math.PI) / 180) * 90 * (rnd() > 0.5 ? 1 : -1) * rnd();
        x = Math.max(10, Math.min(w - 10, x));
        pts.push({ x, y });
      }
      let len = 0;
      for (let j = 1; j < pts.length; j++) len += Math.hypot(pts[j].x - pts[j - 1].x, pts[j].y - pts[j - 1].y);
      branches.push({ pts, birth: i * 12, len });
    }

    const pulses = Array.from({ length: N_PULSE }, () => ({
      b: Math.floor(rnd() * N_BRANCH),
      dist: rnd(),
      speed: 0.1 + rnd() * 0.25,
    }));

    let raf = 0;
    let t = 0;
    let last = performance.now();
    const pointAt = (br: Branch, f: number) => {
      let target = f * br.len;
      for (let j = 1; j < br.pts.length; j++) {
        const seg = Math.hypot(br.pts[j].x - br.pts[j - 1].x, br.pts[j].y - br.pts[j - 1].y);
        if (target <= seg) {
          const k = target / seg;
          return {
            x: br.pts[j - 1].x + (br.pts[j].x - br.pts[j - 1].x) * k,
            y: br.pts[j - 1].y + (br.pts[j].y - br.pts[j - 1].y) * k,
          };
        }
        target -= seg;
      }
      return br.pts[br.pts.length - 1];
    };

    const step = (now: number) => {
      raf = requestAnimationFrame(step);
      const dt = Math.min(50, now - last);
      last = now;
      if (document.documentElement.dataset.frozen === "true" || document.hidden) return;
      t += dt;
      // persistencia de fósforo
      ctx.fillStyle = "rgba(4, 6, 14, 0.22)";
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(242,240,233,0.08)";
      ctx.lineWidth = 1;
      for (const br of branches) {
        const grow = Math.min(1, Math.max(0, (t - br.birth) / 450));
        if (grow <= 0) continue;
        ctx.beginPath();
        ctx.moveTo(br.pts[0].x, br.pts[0].y);
        let drawn = 0;
        const maxLen = grow * br.len;
        for (let j = 1; j < br.pts.length; j++) {
          const seg = Math.hypot(br.pts[j].x - br.pts[j - 1].x, br.pts[j].y - br.pts[j - 1].y);
          if (drawn + seg > maxLen) {
            const k = (maxLen - drawn) / seg;
            ctx.lineTo(br.pts[j - 1].x + (br.pts[j].x - br.pts[j - 1].x) * k, br.pts[j - 1].y + (br.pts[j].y - br.pts[j - 1].y) * k);
            break;
          }
          ctx.lineTo(br.pts[j].x, br.pts[j].y);
          drawn += seg;
        }
        ctx.stroke();
      }

      for (const p of pulses) {
        p.dist += (p.speed * dt) / 4000;
        if (p.dist > 1) p.dist = 0;
        const br = branches[p.b];
        if ((t - br.birth) / 450 < p.dist) continue;
        const pt = pointAt(br, p.dist);
        ctx.fillStyle = p.speed > 0.25 ? "#6EE7B7" : p.speed > 0.17 ? "#34D399" : "#25B585";
        ctx.fillRect(pt.x - 1, pt.y - 3, 2, 6);
        ctx.fillStyle = "rgba(52,211,153,0.25)";
        ctx.fillRect(pt.x - 1, pt.y - 10, 2, 7);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active, reduce]);

  return <canvas ref={ref} className="ramcanvas" aria-hidden="true" />;
}

/* ── Feed + expediente ── */
const fmtMx = (n: number) => "$" + n.toLocaleString("es-MX", { minimumFractionDigits: 2 });
const hora = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
};

const SEED_ROWS: Omit<Fila, "id">[] = [
  { hora: "14:32:05", tipo: "SPEI OUT · dispersión", monto: fmtMx(48200), estado: "LIQUIDADA" },
  { hora: "14:32:04", tipo: "SPEI IN · CLABE •••4821", monto: fmtMx(129000), estado: "LIQUIDADA" },
  { hora: "14:32:03", tipo: "SPEI OUT · nómina", monto: fmtMx(386200), estado: "EN PROCESO" },
  { hora: "14:32:01", tipo: "SPEI IN · CLABE •••9106", monto: fmtMx(12750), estado: "RECIBIDA" },
];

const POOL: Array<[string, number, string, "ok" | "rej"]> = [
  ["SPEI IN · CLABE •••2338", 15200, "LIQUIDADA", "ok"],
  ["SPEI OUT · proveedor", 82450, "LIQUIDADA", "ok"],
  ["SPEI IN · CLABE •••7714", 63000, "RECIBIDA", "ok"],
  ["SPEI OUT · dispersión", 412300, "EN PROCESO", "ok"],
  ["SPEI IN · CLABE •••1020", 9800, "LIQUIDADA", "ok"],
  ["SPEI OUT · retiro", 230000, "RECHAZADA", "rej"],
  ["SPEI IN · CLABE •••8155", 47500, "LIQUIDADA", "ok"],
  ["SPEI OUT · nómina", 386200, "LIQUIDADA", "ok"],
];

export default function ActoEnVivo() {
  const { onFila, live } = useTime();
  const reduce = useReducedMotion();
  const secRef = useRef<HTMLElement>(null);
  const inView = useInView(secRef, { amount: 0.2 });
  const [rows, setRows] = useState<Fila[]>(SEED_ROWS.map((r, i) => ({ id: i, ...r })));
  const [sel, setSel] = useState<Fila | null>(null);
  const [opsCount, setOpsCount] = useState(1380);
  const nextId = useRef(100);

  // filas nuevas cada 2.2–4s mientras la escena está a la vista
  useEffect(() => {
    if (!inView) return;
    let alive = true;
    let idx = 0;
    const tick = () => {
      if (!alive) return;
      if (document.documentElement.dataset.frozen !== "true") {
        const [tipo, monto, estado, kind] = POOL[idx % POOL.length];
        idx += 1;
        nextId.current += 1;
        setRows((prev) => [{ id: nextId.current, hora: hora(), tipo, monto: fmtMx(monto), estado, kind }, ...prev].slice(0, 7));
        setOpsCount((c) => c + 1 + Math.floor(Math.random() * 2));
      }
      setTimeout(tick, 2200 + Math.random() * 1800);
    };
    const t = setTimeout(tick, 1200);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [inView]);

  // el folio de la solicitud entra a ESTE feed
  useEffect(
    () =>
      onFila((f) => {
        setRows((prev) => [f, ...prev].slice(0, 7));
      }),
    [onFila]
  );

  return (
    <section className="scene envivo" id="envivo" ref={secRef}>
      <RamificacionCanvas active={inView && live} />
      <div className="flow envivo-in">
        <div className="container">
          <p className="kicker">ACTO V · T=01.000 · TIEMPO REAL</p>
          <h2 className="h2">
            Esto acaba de pasar{" "}
            <span className="mono" style={{ color: "var(--verde)" }}>
              {opsCount.toLocaleString("es-MX")}
            </span>{" "}
            veces mientras leías esta página.
          </h2>
          <p className="lead">
            El segundo que auditaste no era una demo: era el procedimiento estándar. Así se ve
            cuando corre a escala, sin dilatar.
          </p>

          <div className="counters4">
            {[
              [opsCount.toLocaleString("es-MX"), "OPERACIONES HOY", false],
              [fmtMx(48731500), "MONTO DISPERSADO HOY", true],
              ["99.9%", "UPTIME 90 DÍAS — medido", false],
              ["< 5 s", "ORDEN → LIQUIDACIÓN", false],
            ].map(([v, l, money]) => (
              <div className="cnt" key={l as string}>
                <div className="cv" style={money ? { color: "var(--verde)" } : undefined}>{v as string}</div>
                <div className="cl">{l as string}</div>
              </div>
            ))}
          </div>

          <div className="feed-panel" role="img" aria-label="Feed ilustrativo de operaciones en vivo">
            <div className="feed-head">
              <span>OPERACIONES EN VIVO</span>
              <span className="hint">Cada fila es auditable. Haz click en cualquiera.</span>
            </div>
            <AnimatePresence initial={false} mode="popLayout">
              {rows.map((r) => (
                <motion.button
                  key={r.id}
                  className={`frow ${r.kind === "rej" ? "rej" : ""} ${r.kind === "sol" ? "sol" : ""}`}
                  style={{ width: "100%", textAlign: "left" }}
                  layout
                  initial={reduce ? false : { opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 32 }}
                  onClick={() => setSel(r)}
                >
                  <span>{r.hora}</span>
                  <span className="fl">{r.tipo}</span>
                  <span className="fm">{r.monto}</span>
                  <span className="fs">{r.estado}</span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* EXPEDIENTE DE OPERACIÓN */}
      <AnimatePresence>
        {sel && (
          <>
            <motion.div
              className="drawer-back"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setSel(null)}
            />
            <motion.aside
              className="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 34 }}
              role="dialog"
              aria-label="Expediente de operación"
            >
              <button className="drawer-x" onClick={() => setSel(null)}>
                Cerrar expediente ✕
              </button>
              <h4>EXPEDIENTE DE OPERACIÓN</h4>
              <div className="dfield">
                <div className="dk">OPERACIÓN</div>
                <div className="dv">{sel.tipo} · {sel.hora}</div>
              </div>
              <div className="dfield">
                <div className="dk">MONTO</div>
                <div className="dv money">{sel.monto}</div>
              </div>
              <div className="dfield">
                <div className="dk">FIRMA HMAC</div>
                <div className="dv">hmac-sha256 · a3f8…c91d ✓</div>
              </div>
              <div className="dfield">
                <div className="dk">FOLIO CEP</div>
                <div className="dv azul">0074512 · BANXICO</div>
              </div>
              <div className="dfield">
                <div className="dk">CLAVE DE RASTREO</div>
                <div className="dv">MM8459201HJK220716</div>
              </div>
              <div className="dfield">
                <div className="dk">TRAYECTORIA</div>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } } }}
                >
                  {[
                    ["recibida", "request firmado y aceptado"],
                    ["validada PLD", "umbrales y perfil en norma"],
                    ["screening", "listas negras sin coincidencias"],
                    ["liquidada", "abonada en destino · CEP emitido"],
                  ].map(([tn, td]) => (
                    <motion.div
                      key={tn}
                      className="tl-node"
                      variants={{
                        hidden: { opacity: 0, scale: 0.6 },
                        visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 24 } },
                      }}
                    >
                      <span className="tl-dot" />
                      <div>
                        <div className="tn">{tn}</div>
                        <div className="td">{td}</div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
              <p className="dfoot">
                Este es el mismo expediente que entregamos en una auditoría. Sin versión
                maquillada.
              </p>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
