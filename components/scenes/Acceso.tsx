"use client";

import { useEffect, useState, type FormEvent } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useTime, type Fila } from "@/lib/time";
import SelloNotarial from "../SelloNotarial";
import MagneticButton from "../ui/MagneticButton";

const EMAIL = "direccion@masmovil.lat";

const PROMPTS = [
  ["nombre", "nombre >", "tu nombre completo"],
  ["empresa", "empresa >", "razón social o nombre comercial"],
  ["email", "correo >", "tú@tuempresa.mx"],
  ["caso", "caso de uso >", "ej. dispersión de nómina para 3,000 empleados"],
] as const;

const ERRS: Record<string, string> = {
  nombre: "✗ necesitamos un nombre para dirigirnos a alguien",
  empresa: "✗ indica tu empresa — evaluamos casos reales",
  email: "✗ formato de correo no válido — revisa el @ y el dominio",
  caso: "✗ una línea basta: qué quieres mover y a qué escala",
};

function nuevoFolio() {
  return `MM-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
}

export default function Acceso() {
  const { registrarFilaFeed, onFila } = useTime();
  const reduce = useReducedMotion();
  const [errs, setErrs] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [folio, setFolio] = useState<string | null>(null);
  const [mini, setMini] = useState<Fila[]>([
    { id: 1, hora: "14:32:05", tipo: "SPEI OUT · dispersión", monto: "$48,200.00", estado: "LIQUIDADA" },
    { id: 2, hora: "14:32:04", tipo: "SPEI IN · CLABE •••4821", monto: "$129,000.00", estado: "LIQUIDADA" },
  ]);

  useEffect(() => onFila((f) => setMini((prev) => [f, ...prev].slice(0, 3))), [onFila]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (String(fd.get("_honey") ?? "")) return;
    const val = (k: string) => String(fd.get(k) ?? "").trim();
    const bad: string[] = [];
    if (!val("nombre")) bad.push("nombre");
    if (!val("empresa")) bad.push("empresa");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val("email"))) bad.push("email");
    if (val("caso").length < 12) bad.push("caso");
    setErrs(bad);
    if (bad.length) return;

    setStatus("sending");
    const f = nuevoFolio();
    try {
      const r = await fetch(`https://formsubmit.co/ajax/${EMAIL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          nombre: val("nombre"),
          empresa: val("empresa"),
          email: val("email"),
          caso_de_uso: val("caso"),
          folio: f,
          _subject: `Solicitud de acceso ${f} — masmovil.lat`,
          _template: "table",
        }),
      });
      if (!r.ok) throw new Error(String(r.status));
      await r.json();
      setFolio(f);
      setStatus("ok");
      const d = new Date();
      registrarFilaFeed({
        hora: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`,
        tipo: `SOLICITUD · ${f}`,
        monto: "—",
        estado: "RECIBIDA",
        kind: "sol",
      });
      form.reset();
    } catch {
      setStatus("err");
      const body = `Folio: ${f}\nNombre: ${val("nombre")}\nEmpresa: ${val("empresa")}\nCorreo: ${val("email")}\nCaso de uso: ${val("caso")}`;
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(`Solicitud de acceso ${f}`)}&body=${encodeURIComponent(body)}`;
    }
  }

  return (
    <section className="scene flow" id="acceso">
      <div className="container acceso-grid">
        <div>
          <p className="kicker">ACCESO</p>
          <h2 className="h2">Solicita tu credencial de prueba.</h2>
          <p className="lead" style={{ marginBottom: 26 }}>
            Cuatro datos. Nosotros hacemos el resto: sandbox, documentación y una llamada con
            ingeniería — no con un vendedor.
          </p>
          <div className="term2">
            <div className="term2-top">
              <div className="term2-dots"><i /><i /><i /></div>
              <span>solicitud-de-acceso — masmovil</span>
            </div>
            <form className="pform" onSubmit={onSubmit} noValidate>
              {PROMPTS.map(([name, label, ph]) => (
                <motion.div
                  key={name}
                  className="prompt"
                  animate={errs.includes(name) && !reduce ? { x: [0, -6, 6, -3, 3, 0] } : {}}
                  transition={{ duration: 0.35 }}
                >
                  <label htmlFor={`p-${name}`}>{label}</label>
                  {name === "caso" ? (
                    <textarea id={`p-${name}`} name={name} rows={2} placeholder={ph} />
                  ) : (
                    <input
                      id={`p-${name}`}
                      name={name}
                      type={name === "email" ? "email" : "text"}
                      placeholder={ph}
                      autoComplete={name === "email" ? "email" : name === "nombre" ? "name" : name === "empresa" ? "organization" : "off"}
                    />
                  )}
                  {errs.includes(name) && <span className="perr">{ERRS[name]}</span>}
                </motion.div>
              ))}
              <input type="text" name="_honey" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
                <MagneticButton type="submit" className="btn btn-solid">
                  {status === "sending" ? "registrando solicitud…" : "REGISTRAR >"}
                </MagneticButton>
                <AnimatePresence mode="wait">
                  {status === "ok" && folio && (
                    <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <SelloNotarial text={`SOLICITUD REGISTRADA · FOLIO ${folio}`} active />
                    </motion.div>
                  )}
                  {status === "err" && (
                    <motion.p key="err" className="perr mono" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      ✗ no pudimos registrar — abrimos tu correo como respaldo
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <p className="pstatus" aria-live="polite">
                {status === "ok"
                  ? "Tu folio acaba de entrar al feed. Ya estás en el sistema que viste operar. Respuesta en el siguiente horario hábil."
                  : "Respondemos en horario hábil de Guadalajara. Sin spam. 2FA desde el primer acceso."}
              </p>
            </form>
          </div>
        </div>

        <div>
          <div className="feed-panel" style={{ position: "sticky", top: "calc(var(--nav-h) + 20px)" }}>
            <div className="feed-head">
              <span>TU SOLICITUD ATERRIZA AQUÍ</span>
            </div>
            <AnimatePresence initial={false}>
              {mini.map((r) => (
                <motion.div
                  key={r.id}
                  className={`frow ${r.kind === "sol" ? "sol" : ""}`}
                  layout
                  initial={reduce ? false : { opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 32 }}
                  style={r.kind === "sol" ? { background: "var(--azul-tinte)" } : undefined}
                >
                  <span>{r.hora}</span>
                  <span className="fl">{r.tipo}</span>
                  <span className="fm">{r.monto}</span>
                  <span className="fs">{r.estado}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
