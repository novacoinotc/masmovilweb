"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EMAIL = "direccion@masmovil.lat";

/** Solicitud de acceso — panel compacto de la última estación. */
export default function AccessPanel() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [bad, setBad] = useState<string[]>([]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (String(fd.get("_honey") ?? "")) return;
    const v = (k: string) => String(fd.get(k) ?? "").trim();
    const errs: string[] = [];
    if (!v("nombre")) errs.push("nombre");
    if (!v("empresa")) errs.push("empresa");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email"))) errs.push("email");
    setBad(errs);
    if (errs.length) return;
    setStatus("sending");
    try {
      const r = await fetch(`https://formsubmit.co/ajax/${EMAIL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          nombre: v("nombre"),
          empresa: v("empresa"),
          email: v("email"),
          caso_de_uso: v("caso") || "—",
          _subject: "Solicitud de acceso — masmovil.lat",
          _template: "table",
        }),
      });
      if (!r.ok) throw new Error(String(r.status));
      await r.json();
      setStatus("ok");
      form.reset();
    } catch {
      setStatus("err");
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent("Solicitud de acceso — MASMOVIL")}`;
    }
  }

  return (
    <form className="access" onSubmit={onSubmit} noValidate>
      <div className="access-row">
        <motion.input
          name="nombre"
          placeholder="Nombre"
          autoComplete="name"
          className={bad.includes("nombre") ? "bad" : ""}
          animate={bad.includes("nombre") ? { x: [0, -6, 6, -3, 0] } : {}}
        />
        <motion.input
          name="empresa"
          placeholder="Empresa"
          autoComplete="organization"
          className={bad.includes("empresa") ? "bad" : ""}
          animate={bad.includes("empresa") ? { x: [0, -6, 6, -3, 0] } : {}}
        />
      </div>
      <motion.input
        name="email"
        type="email"
        placeholder="Correo corporativo"
        autoComplete="email"
        className={bad.includes("email") ? "bad" : ""}
        animate={bad.includes("email") ? { x: [0, -6, 6, -3, 0] } : {}}
      />
      <textarea name="caso" rows={2} placeholder="Tu caso de uso (opcional): qué mueves y a qué escala" />
      <input type="text" name="_honey" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button type="submit" className="access-btn">
        {status === "sending" ? "Enviando…" : "Solicitar acceso"}
      </button>
      <AnimatePresence mode="wait">
        <motion.p
          key={status}
          className="access-status mono"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          aria-live="polite"
        >
          {status === "ok"
            ? "✓ Recibido. Respuesta de ingeniería en el siguiente horario hábil."
            : status === "err"
              ? "✗ Falló el envío — abrimos tu correo como respaldo."
              : "Sandbox, documentación y una llamada con ingeniería. Sin spam."}
        </motion.p>
      </AnimatePresence>
    </form>
  );
}
