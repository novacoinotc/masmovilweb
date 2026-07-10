"use client";

import { motion, useReducedMotion } from "framer-motion";

const OPS = [
  {
    t: "Fintechs",
    p: "Emite una CLABE por usuario, mueve fondos por API y entrega comprobante de Banxico en cada abono. Tu producto por delante; el riel, resuelto.",
    caps: ["Emisión de CLABEs por API", "SPEI in/out 24/7", "Webhooks por evento"],
    req: "API REST · sandbox en 24h · 2FA obligatorio",
    feed: [["14:31", "SPEI OUT · API", "$4,120.00"], ["14:29", "SPEI IN · CLABE", "$890.00"], ["14:28", "SPEI OUT · API", "$12,300.00"]],
  },
  {
    t: "Empresas con nómina masiva",
    p: "Dispersa la quincena completa en una instrucción, con reintentos controlados y conciliación que se hace sola. El día de pago deja de ser un operativo.",
    caps: ["Dispersión programada", "Comprobante por empleado", "Conciliación automática"],
    req: "carga por archivo o API · calendario · 2FA obligatorio",
    feed: [["14:30", "NÓMINA · lote 58", "$386,200.00"], ["14:15", "DISPERSIÓN · 96", "$412,300.00"], ["14:02", "NÓMINA · retro", "$8,450.00"]],
  },
  {
    t: "Plataformas y marketplaces",
    p: "Opera varias razones sociales, separa fondos por vertical y notifica a cada sistema con webhooks firmados. Libros limpios sin integración duplicada.",
    caps: ["Multi-empresa", "Separación de fondos", "Webhooks firmados"],
    req: "API REST · multi-empresa nativo · 2FA obligatorio",
    feed: [["14:32", "SPEI IN · vertical A", "$23,800.00"], ["14:31", "SPEI OUT · vertical B", "$7,150.00"], ["14:27", "SPEI IN · vertical A", "$54,000.00"]],
  },
];

const spring = { type: "spring" as const, stiffness: 260, damping: 32, mass: 0.9 };

export default function Operadores() {
  const reduce = useReducedMotion();
  return (
    <section className="scene flow" id="operadores">
      <div className="container">
        <p className="kicker">EN VIVO · QUIÉN OPERA AQUÍ</p>
        <h2 className="h2">El mismo riel. Tres formas de usarlo.</h2>
        <p className="lead">
          Las filas que estás viendo pertenecen a operaciones como las tuyas. Encuentra tu caso.
        </p>
        <motion.div
          className="ops"
          initial={reduce ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ visible: { transition: { staggerChildren: 0.09 } } }}
        >
          {OPS.map((o) => (
            <motion.div
              key={o.t}
              className="op-card"
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: spring } }}
            >
              <h3>{o.t}</h3>
              <p>{o.p}</p>
              <div className="op-feed">
                {o.feed.map(([h, t, m]) => (
                  <span key={h + t}>
                    {h} · {t} · <span className="m">{m}</span>
                  </span>
                ))}
              </div>
              <ul style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {o.caps.map((c) => (
                  <li key={c} style={{ fontSize: 13, color: "var(--text-secundario)" }}>
                    ▸ {c}
                  </li>
                ))}
              </ul>
              <p className="req">{o.req}</p>
              <a href="#acceso" className="btn btn-sm op-cta">
                Solicitar acceso
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
