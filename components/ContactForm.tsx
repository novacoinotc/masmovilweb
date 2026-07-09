"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Reveal from "./ui/Reveal";
import MagneticButton from "./ui/MagneticButton";

const EMAIL = "direccion@masmovil.lat";

type Status = { kind: "idle" | "sending" | "ok" | "err"; msg: string };

export default function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle", msg: "" });
  const [invalid, setInvalid] = useState<string[]>([]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const nombre = String(fd.get("nombre") ?? "").trim();
    const empresa = String(fd.get("empresa") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const interes = String(fd.get("interes") ?? "");
    const mensaje = String(fd.get("mensaje") ?? "").trim();
    if (String(fd.get("_honey") ?? "")) return; // bot

    const bad: string[] = [];
    if (!nombre) bad.push("nombre");
    if (!empresa) bad.push("empresa");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) bad.push("email");
    setInvalid(bad);
    if (bad.length) {
      setStatus({ kind: "err", msg: "Revisa los campos marcados." });
      return;
    }

    setStatus({ kind: "sending", msg: "Enviando…" });
    try {
      const r = await fetch(`https://formsubmit.co/ajax/${EMAIL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          nombre,
          empresa,
          email,
          interes,
          mensaje: mensaje || "—",
          _subject: "Solicitud de prueba — masmovil.lat",
          _template: "table",
        }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      await r.json();
      setStatus({ kind: "ok", msg: "¡Listo! Recibimos tu solicitud, te contactamos muy pronto." });
      form.reset();
    } catch {
      const body = `Nombre: ${nombre}\nEmpresa: ${empresa}\nCorreo: ${email}\nMe interesa: ${interes}\n\n${mensaje}`;
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(
        "Solicitud de prueba — MASMOVIL"
      )}&body=${encodeURIComponent(body)}`;
      setStatus({ kind: "idle", msg: "Abrimos tu correo para completar el envío." });
    }
  }

  const shake = (name: string) =>
    invalid.includes(name) ? { x: [0, -8, 8, -6, 6, 0] } : {};

  return (
    <section className="section cta-final" id="contacto">
      <div className="container">
        <div className="cta-inner">
          <Reveal as="p" className="eyebrow centered">
            Solicita una prueba
          </Reveal>
          <Reveal as="h2" className="cta-title">
            ¿Listo para operar con
            <br />
            <em className="grad">infraestructura de grado bancario?</em>
          </Reveal>
          <Reveal as="p" className="lead">
            Cuéntanos de tu operación y te damos acceso a una demo en vivo de la
            plataforma, junto con la documentación de integración para tu equipo técnico.
          </Reveal>

          <Reveal>
            <form className="demo-form" onSubmit={onSubmit} noValidate>
              <div className="ff">
                <label htmlFor="f-nombre">Nombre</label>
                <motion.input
                  id="f-nombre"
                  name="nombre"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Tu nombre"
                  className={invalid.includes("nombre") ? "invalid" : ""}
                  animate={shake("nombre")}
                  transition={{ duration: 0.4 }}
                />
              </div>
              <div className="ff">
                <label htmlFor="f-empresa">Empresa</label>
                <motion.input
                  id="f-empresa"
                  name="empresa"
                  type="text"
                  required
                  autoComplete="organization"
                  placeholder="Nombre de tu empresa"
                  className={invalid.includes("empresa") ? "invalid" : ""}
                  animate={shake("empresa")}
                  transition={{ duration: 0.4 }}
                />
              </div>
              <div className="ff">
                <label htmlFor="f-email">Correo</label>
                <motion.input
                  id="f-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="tucorreo@empresa.com"
                  className={invalid.includes("email") ? "invalid" : ""}
                  animate={shake("email")}
                  transition={{ duration: 0.4 }}
                />
              </div>
              <div className="ff">
                <label htmlFor="f-interes">Me interesa</label>
                <select id="f-interes" name="interes" defaultValue="Plataforma de pagos SPEI">
                  <option>Plataforma de pagos SPEI</option>
                  <option>Integración vía API</option>
                  <option>Telecomunicaciones</option>
                  <option>Desarrollo de software</option>
                </select>
              </div>
              <div className="ff ff-full">
                <label htmlFor="f-msg">
                  Cuéntanos de tu operación <span className="opt">(opcional)</span>
                </label>
                <textarea
                  id="f-msg"
                  name="mensaje"
                  rows={4}
                  placeholder="Caso de uso, volumen aproximado, tiempos…"
                />
              </div>
              <input type="text" name="_honey" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              <div className="ff-full form-foot">
                <MagneticButton type="submit" className="btn btn-primary btn-lg">
                  {status.kind === "sending" ? "Enviando…" : "Solicitar una prueba"}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </MagneticButton>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={status.msg}
                    className={`form-status ${status.kind === "ok" ? "ok" : status.kind === "err" ? "err" : ""}`}
                    role="status"
                    aria-live="polite"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {status.msg}
                  </motion.p>
                </AnimatePresence>
              </div>
            </form>
          </Reveal>

          <Reveal as="p" className="cta-alt">
            O escríbenos directo a <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
