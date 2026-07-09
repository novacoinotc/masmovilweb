"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import Reveal from "./ui/Reveal";
import TiltCard from "./ui/TiltCard";

type Tok = { t: string; c?: "c" | "k" | "s" | "n" };

const TOKENS: Tok[] = [
  { t: "// Dispersión programática con firma HMAC\n", c: "c" },
  { t: "const", c: "k" }, { t: " res = " }, { t: "await", c: "k" },
  { t: " fetch(" }, { t: '"https://api…/v1/transferencias"', c: "s" }, { t: ", {\n" },
  { t: "  method: " }, { t: '"POST"', c: "s" }, { t: ",\n" },
  { t: "  headers: {\n" },
  { t: '    "X-Api-Key"', c: "s" }, { t: ":        API_KEY,\n" },
  { t: '    "X-Signature"', c: "s" }, { t: ":      firmaHMAC(payload),\n" },
  { t: '    "X-Timestamp"', c: "s" }, { t: ":      ts,            " },
  { t: "// anti-replay\n", c: "c" },
  { t: '    "Idempotency-Key"', c: "s" }, { t: ":  uuid()         " },
  { t: "// sin duplicados\n", c: "c" },
  { t: "  },\n" },
  { t: "  body: JSON.stringify({\n" },
  { t: "    clabe_destino: " }, { t: '"6461801234567890XX"', c: "s" }, { t: ",\n" },
  { t: "    beneficiario:  " }, { t: '"Proveedor SA de CV"', c: "s" }, { t: ",\n" },
  { t: "    monto:         " }, { t: "45000.00", c: "n" }, { t: ",\n" },
  { t: "    concepto:      " }, { t: '"Pago factura F-2201"', c: "s" }, { t: "\n" },
  { t: "  })\n" },
  { t: "});\n\n" },
  { t: "// → 200 OK\n", c: "c" },
  { t: "{ " }, { t: '"estatus"', c: "s" }, { t: ": " }, { t: '"liquidada"', c: "s" },
  { t: ", " }, { t: '"clave_rastreo"', c: "s" }, { t: ": " }, { t: '"MASM94823…"', c: "s" },
  { t: ", " }, { t: '"cep"', c: "s" }, { t: ": " }, { t: '"https://banxico…"', c: "s" }, { t: " }" },
];

const TOTAL = TOKENS.reduce((n, tok) => n + tok.t.length, 0);

const BULLETS = [
  ["Firma HMAC por solicitud", "no basta con robar una llave: cada request va firmado."],
  ["Anti-replay", "una solicitud interceptada no puede reutilizarse."],
  ["Idempotencia", "los reintentos jamás duplican un pago."],
  ["Llaves con alcance limitado", "cada llave solo ve y opera su propia cuenta."],
  ["Límites configurables", "velocidad y montos diarios por llave."],
] as const;

export default function ApiSection() {
  const reduce = useReducedMotion();
  const termRef = useRef<HTMLDivElement>(null);
  const inView = useInView(termRef, { once: true, amount: 0.35 });
  const [count, setCount] = useState(0);
  const done = count >= TOTAL;

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setCount(TOTAL);
      return;
    }
    let raf = 0;
    let last = performance.now();
    const speed = TOTAL / 2400; // chars por ms → ~2.4s
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      setCount((c) => {
        const next = Math.min(TOTAL, c + dt * speed);
        if (next < TOTAL) raf = requestAnimationFrame(tick);
        return next;
      });
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce]);

  // Render por tokens: corta el token en el límite visible
  let acc = 0;
  const visible = Math.floor(count);

  return (
    <section className="section" id="api">
      <div className="container api-grid">
        <div>
          <Reveal as="p" className="eyebrow">
            Para integradores
          </Reveal>
          <Reveal as="h2" className="h2">
            Una API <em className="grad">de verdad.</em>
          </Reveal>
          <Reveal as="p" className="lead">
            Conecta tu sistema, bot o plataforma directamente al core. Dispersión
            programática, consulta de depósitos y estatus en tiempo real, y webhooks con
            reintentos automáticos.
          </Reveal>
          <ul className="api-list">
            {BULLETS.map(([b, rest], i) => (
              <Reveal as="li" key={b} delay={i * 0.07}>
                <strong>{b}</strong> — {rest}
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal>
          <div ref={termRef}>
            <TiltCard className="terminal" >
              <div className="term-top">
                <div className="dash-dots">
                  <i />
                  <i />
                  <i />
                </div>
                <span>POST /v1/transferencias</span>
              </div>
              <div className="term-body">
                {TOKENS.map((tok, i) => {
                  const start = acc;
                  acc += tok.t.length;
                  if (visible <= start) return null;
                  const text = visible >= acc ? tok.t : tok.t.slice(0, visible - start);
                  return (
                    <span key={i} className={tok.c ? `tok-${tok.c}` : undefined}>
                      {text}
                    </span>
                  );
                })}
                {!done && inView && <span className="tcaret" />}
              </div>
            </TiltCard>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
