"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Logo from "../ui/Logo";
import MagneticButton from "../ui/MagneticButton";
import TiltCard from "../ui/TiltCard";
import Counter from "../ui/Counter";
import SelloNotarial from "../SelloNotarial";

const spring = { type: "spring" as const, stiffness: 260, damping: 32, mass: 0.9 };
const stag = { visible: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: spring } };

function Rev({ children, className, amount = 0.25 }: { children: React.ReactNode; className?: string; amount?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={stag}
    >
      {children}
    </motion.div>
  );
}

/* ══ NAV ══ */
export function NavCredito() {
  return (
    <header className="nav2">
      <div className="nav2-inner">
        <a href="#inicio" className="logo" aria-label="MASMOVIL inicio">
          <Logo id="lg-nav" />
          <span>MASMOVIL</span>
        </a>
        <nav className="navlinks mono" aria-label="Secciones">
          <a href="#financiamos">Crédito</a>
          <a href="#formacion">Formación</a>
          <a href="#software">Software</a>
          <a href="#telecom">Telecom</a>
        </nav>
        <a href="#solicitud" className="btn btn-sm">
          Solicitar crédito
        </a>
      </div>
    </header>
  );
}

/* ══ HERO ══ */
export function HeroCredito() {
  return (
    <section className="hero2" id="inicio">
      <Rev className="container hero2-grid">
        <div>
          <motion.div className="badge" variants={item}>
            <i />
            GUADALAJARA, MÉXICO · DESDE 2019
          </motion.div>
          <motion.h1 variants={item}>
            Crédito y tecnología para quienes construyen lo digital.
          </motion.h1>
          <motion.p className="hero2-sub" variants={item}>
            MASMOVIL es una empresa de telecomunicaciones y servicios digitales.
            Financiamos el crecimiento de proveedores de telefonía, empresas de
            tecnología y microempresas: equipo, software, asesoría y formación.
          </motion.p>
          <motion.p className="cred mono" variants={item}>
            TELECOMUNICACIONES · LÍNEAS DE CRÉDITO · SERVICIOS DIGITALES
          </motion.p>
          <motion.div className="hero2-ctas" variants={item}>
            <MagneticButton href="#solicitud" className="btn btn-solid btn-lg">
              Solicitar una línea de crédito
            </MagneticButton>
            <MagneticButton href="#financiamos" className="btn btn-lg">
              Ver soluciones
            </MagneticButton>
          </motion.div>
        </div>

        <motion.div variants={item}>
          <TiltCard className="payload">
            <div className="cmt">{"// una línea de crédito activa"}</div>
            {[
              ["Cliente", "Distribuidora de telefonía", false],
              ["Línea autorizada", "$850,000.00 MXN", true],
              ["Destino", "Equipo + punto de venta", false],
              ["Plazo", "18 meses", false],
              ["Estado", "ACTIVA · al corriente", false],
            ].map(([k, v, money]) => (
              <div className="row" key={k as string}>
                <span className="k">{k}</span>
                <span className="v">{"  "}</span>
                <span className={money ? "money" : "v"}>{v}</span>
              </div>
            ))}
          </TiltCard>
        </motion.div>
      </Rev>
    </section>
  );
}

/* ══ QUÉ FINANCIAMOS ══ */
const FINANCIAMOS = [
  { k: "equipo", t: "Hardware y equipo", p: "Computadoras, teléfonos, punto de venta y equipo de red. El fierro que tu negocio necesita para operar y crecer, a plazos.", hi: true },
  { k: "software", t: "Software y licencias", p: "Sistemas, licencias y desarrollo a la medida, financiados con pagos que respiran con tu flujo." },
  { k: "asesoría", t: "Asesorías y consultoría", p: "Implementación, procesos y acompañamiento experto para que la inversión sí se convierta en resultados." },
  { k: "capital", t: "Capital para microempresas", p: "Líneas para inventario y operación de negocios de telefonía y tecnología que van empezando.", hi: true },
] as const;

export function Financiamos() {
  return (
    <section className="flow" id="financiamos">
      <div className="container">
        <Rev>
          <motion.p className="kicker" variants={item}>LÍNEAS DE CRÉDITO</motion.p>
          <motion.h2 className="h2" variants={item}>
            Financiamos lo que hace crecer
            <br />a un negocio de tecnología.
          </motion.h2>
          <motion.p className="lead" variants={item}>
            Para proveedores de telefonía, empresas de tecnología y microempresas.
            Líneas a la medida de tu operación, con evaluación clara y sin letras chiquitas.
          </motion.p>
        </Rev>
        <Rev className="bento" amount={0.15}>
          {FINANCIAMOS.map((b) => (
            <motion.div key={b.k} className={`bcell ${"hi" in b && b.hi ? "hi" : ""}`} variants={item}>
              <span className="bk mono">{b.k}</span>
              <h3>{b.t}</h3>
              <p>{b.p}</p>
            </motion.div>
          ))}
        </Rev>
      </div>
    </section>
  );
}

/* ══ CÓMO FUNCIONA ══ */
const PASOS = [
  ["01", "Cuéntanos tu proyecto", "Qué necesitas financiar y para qué. Una solicitud sencilla, sin vueltas."],
  ["02", "Evaluamos contigo", "Identidad, historial y capacidad de pago. Te decimos qué sí y qué no, con claridad."],
  ["03", "Activamos tu línea", "El financiamiento se entrega directo a tu proveedor o a tu cuenta, según el destino."],
  ["04", "Pagas identificado", "Cada cliente paga con una referencia única: tu pago se reconoce solo, sin aclaraciones ni llamadas."],
] as const;

export function ComoFunciona() {
  return (
    <section className="flow" id="como">
      <div className="container">
        <Rev>
          <motion.p className="kicker hueso" variants={item}>CÓMO FUNCIONA</motion.p>
          <motion.h2 className="h2" variants={item}>Cuatro pasos. Cero letras chiquitas.</motion.h2>
        </Rev>
        <Rev className="pasos" amount={0.2}>
          {PASOS.map(([n, t, p]) => (
            <motion.div key={n} className="paso" variants={item}>
              <span className="paso-n mono">{n}</span>
              <h3>{t}</h3>
              <p>{p}</p>
            </motion.div>
          ))}
        </Rev>
      </div>
    </section>
  );
}

/* ══ FORMACIÓN ══ */
const CURSOS = [
  ["Cursos empresariales", "Ventas, administración y operación para negocios de tecnología. Directo al grano, con casos reales."],
  ["Guías de marketing digital", "Campañas, redes sociales y marketplaces: guías prácticas para vender en plataformas digitales."],
  ["Acompañamiento", "Aprendizaje aplicado a tu negocio: implementas con guía, no solo con teoría."],
] as const;

export function Formacion() {
  return (
    <section className="flow" id="formacion">
      <div className="container">
        <Rev>
          <motion.p className="kicker" variants={item}>FORMACIÓN EMPRESARIAL</motion.p>
          <motion.h2 className="h2" variants={item}>Aprende a vender en digital.</motion.h2>
          <motion.p className="lead" variants={item}>
            Cursos, guías y aprendizajes para dominar las plataformas de marketing y
            hacer crecer tu negocio en línea.
          </motion.p>
        </Rev>
        <Rev className="ops" amount={0.2}>
          {CURSOS.map(([t, p]) => (
            <motion.div key={t} className="op-card" variants={item}>
              <h3>{t}</h3>
              <p>{p}</p>
            </motion.div>
          ))}
        </Rev>
      </div>
    </section>
  );
}

/* ══ SOFTWARE PARA FINTECH ══ */
export function SoftwareFintech() {
  return (
    <section className="flow" id="software">
      <div className="container comp-grid">
        <Rev>
          <motion.p className="kicker azul" variants={item}>DESARROLLO DE SOFTWARE</motion.p>
          <motion.h2 className="h2" variants={item}>
            Software financiero
            <br />
            <em style={{ fontStyle: "normal", color: "var(--verde)" }}>a la medida.</em>
          </motion.h2>
          <motion.p className="lead" variants={item}>
            Construimos plataformas para empresas financieras y fintech: sistemas de
            crédito, cobranza, conciliación de pagos y paneles de operación. Ingeniería
            propia, en México.
          </motion.p>
        </Rev>
        <Rev amount={0.2}>
          {[
            ["Originación de crédito", "Solicitudes, evaluación y expedientes digitales de punta a punta."],
            ["Cobranza y pagos identificados", "Cada pago se reconoce solo: referencias únicas por cliente y conciliación automática."],
            ["Paneles de operación", "El estado de toda tu cartera en tiempo real, sin hojas de cálculo."],
            ["Integraciones", "Conectamos tu sistema con bancos, contabilidad y tus plataformas actuales."],
          ].map(([t, p], i) => (
            <motion.div key={t} className="comp-item" variants={item}>
              <span className="comp-num mono">0{i + 1}</span>
              <div>
                <h3>{t}</h3>
                <p>{p}</p>
              </div>
            </motion.div>
          ))}
        </Rev>
      </div>
    </section>
  );
}

/* ══ TELECOM ══ */
export function Telecom() {
  return (
    <section className="flow" id="telecom">
      <div className="container">
        <Rev>
          <motion.p className="kicker hueso" variants={item}>TELECOMUNICACIONES</motion.p>
          <motion.h2 className="h2" variants={item}>Donde empezamos. Donde seguimos.</motion.h2>
        </Rev>
        <Rev className="counters3" amount={0.2}>
          {[
            ["Conectividad", "Enlaces y servicios de telecomunicaciones para empresas."],
            ["Telefonía", "Servicios de telefonía celular y soluciones móviles."],
            ["Equipamiento", "Comercialización de equipos de cómputo, telefonía y accesorios."],
          ].map(([t, p]) => (
            <motion.div key={t} className="cnt" style={{ fontFamily: "var(--font-sans)" }} variants={item}>
              <div className="cv" style={{ fontFamily: "var(--font-sans)", fontSize: 19 }}>{t}</div>
              <div style={{ fontSize: 13.5, color: "var(--text-secundario)", marginTop: 6, letterSpacing: 0 }}>{p}</div>
            </motion.div>
          ))}
        </Rev>
        <Rev className="counters3" amount={0.3}>
          <motion.div className="cnt" variants={item}>
            <div className="cv"><Counter to={2019} format={(v) => String(Math.round(v))} /></div>
            <div className="cl">OPERANDO DESDE</div>
          </motion.div>
          <motion.div className="cnt" variants={item}>
            <div className="cv">3</div>
            <div className="cl">LÍNEAS DE NEGOCIO</div>
          </motion.div>
          <motion.div className="cnt" variants={item}>
            <div className="cv">100%</div>
            <div className="cl">MEXICANA · GUADALAJARA</div>
          </motion.div>
        </Rev>
      </div>
    </section>
  );
}

/* ══ SOLICITUD ══ */
const EMAIL = "direccion@masmovil.lat";

export function Solicitud() {
  const reduce = useReducedMotion();
  const [errs, setErrs] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [folio, setFolio] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (String(fd.get("_honey") ?? "")) return;
    const v = (k: string) => String(fd.get(k) ?? "").trim();
    const bad: string[] = [];
    if (!v("nombre")) bad.push("nombre");
    if (!v("empresa")) bad.push("empresa");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email"))) bad.push("email");
    setErrs(bad);
    if (bad.length) return;
    setStatus("sending");
    const f = `MM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      const r = await fetch(`https://formsubmit.co/ajax/${EMAIL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          nombre: v("nombre"),
          empresa: v("empresa"),
          email: v("email"),
          interes: v("interes"),
          mensaje: v("mensaje") || "—",
          folio: f,
          _subject: `Solicitud ${f} — masmovil.lat`,
          _template: "table",
        }),
      });
      if (!r.ok) throw new Error(String(r.status));
      await r.json();
      setFolio(f);
      setStatus("ok");
      form.reset();
    } catch {
      setStatus("err");
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(`Solicitud ${f} — MASMOVIL`)}`;
    }
  }

  return (
    <section className="flow" id="solicitud">
      <div className="container acceso-grid" style={{ gridTemplateColumns: "1fr", maxWidth: 760 }}>
        <div>
          <Rev>
            <motion.p className="kicker" variants={item}>SOLICITUD</motion.p>
            <motion.h2 className="h2" variants={item}>Empecemos por tu proyecto.</motion.h2>
            <motion.p className="lead" variants={item} style={{ marginBottom: 26 }}>
              Cuéntanos qué necesitas — una línea de crédito, formación o software — y te
              respondemos con claridad en el siguiente horario hábil.
            </motion.p>
          </Rev>
          <div className="term2">
            <div className="term2-top">
              <div className="term2-dots"><i /><i /><i /></div>
              <span>solicitud — masmovil</span>
            </div>
            <form className="pform" onSubmit={onSubmit} noValidate>
              <div className="access-row">
                <div className="prompt">
                  <label htmlFor="s-nombre">nombre &gt;</label>
                  <motion.input
                    id="s-nombre" name="nombre" type="text" placeholder="tu nombre completo" autoComplete="name"
                    animate={errs.includes("nombre") && !reduce ? { x: [0, -6, 6, -3, 0] } : {}}
                  />
                </div>
                <div className="prompt">
                  <label htmlFor="s-empresa">empresa &gt;</label>
                  <motion.input
                    id="s-empresa" name="empresa" type="text" placeholder="razón social o nombre comercial" autoComplete="organization"
                    animate={errs.includes("empresa") && !reduce ? { x: [0, -6, 6, -3, 0] } : {}}
                  />
                </div>
              </div>
              <div className="prompt">
                <label htmlFor="s-email">correo &gt;</label>
                <motion.input
                  id="s-email" name="email" type="email" placeholder="tú@tuempresa.mx" autoComplete="email"
                  animate={errs.includes("email") && !reduce ? { x: [0, -6, 6, -3, 0] } : {}}
                />
              </div>
              <div className="prompt">
                <label htmlFor="s-interes">me interesa &gt;</label>
                <select id="s-interes" name="interes" defaultValue="Línea de crédito" className="sel-credito">
                  <option>Línea de crédito</option>
                  <option>Cursos y formación</option>
                  <option>Software a la medida</option>
                  <option>Telecomunicaciones</option>
                </select>
              </div>
              <div className="prompt">
                <label htmlFor="s-msg">tu proyecto &gt;</label>
                <textarea id="s-msg" name="mensaje" rows={2} placeholder="ej. financiar 40 equipos de punto de venta para mi red de distribuidores" />
              </div>
              <input type="text" name="_honey" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
                <MagneticButton type="submit" className="btn btn-solid">
                  {status === "sending" ? "enviando…" : "ENVIAR SOLICITUD"}
                </MagneticButton>
                <AnimatePresence mode="wait">
                  {status === "ok" && folio && (
                    <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <SelloNotarial text={`RECIBIDA · FOLIO ${folio}`} active />
                    </motion.div>
                  )}
                  {status === "err" && (
                    <motion.p key="err" className="perr mono" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      ✗ no se pudo enviar — abrimos tu correo como respaldo
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <p className="pstatus" aria-live="polite">
                {status === "ok"
                  ? "Listo. Te contactamos en el siguiente horario hábil."
                  : "Sin spam y sin compromiso. Respondemos en horario hábil de Guadalajara."}
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══ FOOTER LEGAL ══ */
export function FooterCredito() {
  return (
    <footer className="tierra" id="legal" style={{ paddingTop: 60 }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
        <span className="logo" style={{ opacity: 0.8 }}>
          <Logo id="lg-footer" />
          <span>MASMOVIL</span>
        </span>
      </div>
      <p className="frase">Telecomunicaciones, crédito y servicios digitales. Hecho en Guadalajara.</p>
      <div className="placa mono">
        MASMOVIL, S.A. DE C.V.
        <br />
        RFC MAS191203EY6
        <br />
        Pompeya 2775, Lomas de Guevara, C.P. 44657
        <br />
        Guadalajara, Jalisco, México · desde 2019
      </div>
      <div className="tierra-links">
        <a href="mailto:direccion@masmovil.lat">direccion@masmovil.lat</a>
        <a href="#solicitud">Solicitar crédito</a>
      </div>
      <p className="fin mono">© 2026 MASMOVIL, S.A. de C.V. · Todos los derechos reservados.</p>
    </footer>
  );
}
