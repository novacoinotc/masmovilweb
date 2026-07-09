"use client";

import { useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import Logo from "./ui/Logo";

const LINKS = [
  ["#empresa", "Empresa"],
  ["#soluciones", "Soluciones"],
  ["#plataforma", "Plataforma"],
  ["#api", "API"],
  ["#seguridad", "Seguridad"],
  ["#cumplimiento", "Cumplimiento"],
] as const;

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 30);
    setHidden(y > prev && y > 400 && !open);
  });

  return (
    <>
      <motion.header
        className={`nav ${scrolled ? "scrolled" : ""}`}
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
      >
        <div className="nav-inner">
          <a href="#top" className="logo" aria-label="MASMOVIL inicio">
            <Logo id="logo-nav" />
            <span>MASMOVIL</span>
          </a>
          <nav className="nav-links" aria-label="Navegación principal">
            {LINKS.map(([href, label]) => (
              <a key={href} href={href}>
                {label}
              </a>
            ))}
          </nav>
          <a href="#contacto" className="btn btn-sm btn-primary nav-cta">
            Contacto
          </a>
          <button
            className={`menu-toggle ${open ? "open" : ""}`}
            aria-label="Abrir menú"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.nav
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
            >
              {[...LINKS, ["#contacto", "Contacto"] as const].map(([href, label]) => (
                <motion.a
                  key={href}
                  href={href}
                  className={href === "#contacto" ? "mm-cta" : undefined}
                  variants={{
                    hidden: { opacity: 0, y: 18 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  onClick={() => setOpen(false)}
                >
                  {label}
                </motion.a>
              ))}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
