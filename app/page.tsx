import SequenceCanvas from "@/components/cine/SequenceCanvas";
import Station from "@/components/cine/Station";
import AccessPanel from "@/components/cine/AccessPanel";
import SmoothScroll from "@/components/SmoothScroll";
import Preloader from "@/components/Preloader";
import CustomCursor from "@/components/CustomCursor";
import ScrollLine from "@/components/cine/ScrollLine";
import Logo from "@/components/ui/Logo";

export default function Page() {
  return (
    <>
      <Preloader />
      <SmoothScroll />
      <SequenceCanvas />
      <div className="cine-tint" aria-hidden="true" />
      <CustomCursor />
      <ScrollLine />

      <header className="cine-nav">
        <a href="#top" className="logo" aria-label="MASMOVIL">
          <Logo id="lg" />
          <span>MASMOVIL</span>
        </a>
        <a href="#acceso" className="cine-cta">
          Solicitar acceso
        </a>
      </header>

      <main id="top">
        {/* 01 · La tesis */}
        <Station height="185vh" className="st-hero">
          <p className="cine-kicker mono">MASMOVIL · INFRAESTRUCTURA DE PAGOS SPEI · MÉXICO</p>
          <h1 className="cine-h1">
            El dinero viaja por
            <br />
            carreteras invisibles.
          </h1>
          <p className="cine-h1b">Nosotros las construimos.</p>
          <p className="cine-hint mono">DESLIZA PARA RECORRERLA ↓</p>
        </Station>

        {/* 02 · La carretera */}
        <Station align="left">
          <p className="cine-kicker mono">LA CARRETERA</p>
          <h2 className="cine-h2">
            Una transferencia recorre firma, escrutinio y Banxico
            <em> en menos de un segundo.</em>
          </h2>
          <div className="cine-datos mono">
            <span>SPEI IN/OUT · 24/7/365</span>
            <span>CLABES ILIMITADAS POR API</span>
            <span>CEP DE BANXICO EN CADA OPERACIÓN</span>
          </div>
        </Station>

        {/* 03 · El ciclo */}
        <Station align="right">
          <p className="cine-kicker mono">EL CICLO COMPLETO</p>
          <h2 className="cine-h2">
            Todo el ciclo del dinero,
            <em> por API.</em>
          </h2>
          <div className="cine-chips">
            {[
              ["Dispersión masiva", "miles de abonos en una instrucción"],
              ["Nóminas", "la quincena sin operativo"],
              ["Conciliación automática", "cero hojas de cálculo"],
              ["Multi-empresa", "N razones sociales · 1 integración"],
              ["Webhooks firmados", "tu backend se entera primero"],
            ].map(([t, d]) => (
              <div className="cine-chip" key={t}>
                <b>{t}</b>
                <span>{d}</span>
              </div>
            ))}
          </div>
        </Station>

        {/* 04 · La confianza */}
        <Station align="left">
          <p className="cine-kicker mono">SIN EXCEPCIONES</p>
          <h2 className="cine-h2">
            Firmado. Escrutado.
            <em> Certificado.</em>
          </h2>
          <div className="cine-trust mono">
            <div>
              <b>FIRMA HMAC</b>
              <span>anti-replay · idempotencia · 2FA obligatorio</span>
            </div>
            <div>
              <b>PLD / AML</b>
              <span>screening y scoring en cada operación, sin muestreo</span>
            </div>
            <div>
              <b>CEP DE BANXICO</b>
              <span>el comprobante oficial, adjunto siempre</span>
            </div>
          </div>
        </Station>

        {/* 05 · La institución */}
        <Station>
          <p className="cine-kicker mono">LA CONEXIÓN</p>
          <h2 className="cine-h2">
            Conectados a Banco de México
            <em> vía STP.</em>
          </h2>
          <div className="cine-stats mono">
            <div>
              <b>2019</b>
              <span>GUADALAJARA, MX</span>
            </div>
            <div>
              <b>99.9%</b>
              <span>DISPONIBILIDAD</span>
            </div>
            <div>
              <b>&lt; 1 s</b>
              <span>LIQUIDACIÓN SPEI</span>
            </div>
          </div>
        </Station>

        {/* 06 · El acceso */}
        <Station height="180vh" className="st-acceso" align="center">
          <div id="acceso" className="cine-access-wrap">
            <p className="cine-kicker mono">ACCESO</p>
            <h2 className="cine-h2">Súbete a la carretera.</h2>
            <AccessPanel />
          </div>
        </Station>
      </main>

      {/* Tierra legal */}
      <footer className="cine-footer">
        <div className="cine-placa mono">
          MASMOVIL, S.A. DE C.V. · RFC MAS191203EY6
          <br />
          Pompeya 2775, Lomas de Guevara, C.P. 44657 · Guadalajara, Jalisco, México · desde 2019
          <br />
          <a href="mailto:direccion@masmovil.lat">direccion@masmovil.lat</a>
        </div>
        <p className="mono">© 2026 MASMOVIL, S.A. de C.V. · Todos los derechos reservados.</p>
      </footer>
    </>
  );
}
