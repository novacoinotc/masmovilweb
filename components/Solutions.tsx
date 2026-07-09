"use client";

import Reveal from "./ui/Reveal";
import TiltCard from "./ui/TiltCard";

const CARDS = [
  {
    num: "01",
    title: "Telecomunicaciones",
    body: "Servicios de telecomunicaciones y telefonía celular: conectividad, enlaces y soluciones de comunicación para empresas, junto con la comercialización de equipos de cómputo, telefonía y accesorios.",
    items: [
      "Conectividad y enlaces empresariales",
      "Telefonía celular y servicios móviles",
      "Equipamiento tecnológico",
    ],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 20h.01M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 14 0M2 9.5a15 15 0 0 1 20 0"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Software y productos digitales",
    body: "Edición y desarrollo de software: plataformas web, APIs y sistemas a la medida, además de creación y difusión de contenido y productos digitales a través de internet.",
    items: [
      "Desarrollo de plataformas y APIs",
      "Sistemas transaccionales a la medida",
      "Productos y contenido digital",
    ],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="m8 9-4 3 4 3m8-6 4 3-4 3M13.5 5l-3 14"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Infraestructura de pagos",
    body: "Core transaccional conectado a la red SPEI: cobros, dispersión, nóminas, conciliación y cumplimiento, operado desde una plataforma web y una API lista para integradores.",
    items: [
      "SPEI IN / OUT en tiempo real",
      "API con firma criptográfica",
      "Cumplimiento PLD/AML integrado",
    ],
    featured: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2v20M17 7H9.5a2.5 2.5 0 0 0 0 5h5a2.5 2.5 0 0 1 0 5H6"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export default function Solutions() {
  return (
    <section className="section" id="soluciones">
      <div className="container">
        <Reveal as="p" className="eyebrow">
          Soluciones
        </Reveal>
        <Reveal as="h2" className="h2">
          Tres líneas de negocio,
          <br />
          <em className="grad">una sola plataforma tecnológica.</em>
        </Reveal>
        <div className="biz-grid">
          {CARDS.map((c, i) => (
            <Reveal key={c.num} delay={i * 0.12}>
              <TiltCard className={c.featured ? "card card-featured" : "card"}>
                <div className="biz-icon">{c.icon}</div>
                <span className="biz-num">{c.num}</span>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
                <ul>
                  {c.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
                {c.featured && <span className="chip">Producto insignia ↓</span>}
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
