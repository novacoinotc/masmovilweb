"use client";

import Reveal from "./ui/Reveal";
import TiltCard from "./ui/TiltCard";

/* ── Capacidades ── */

const CAPS = [
  ["SPEI IN", "in", "Cobros identificados solos", "CLABEs virtuales ilimitadas por cliente, orden o unidad de negocio. Cada depósito se identifica automáticamente, con notificación inmediata y comprobante CEP de Banxico."],
  ["SPEI OUT", "out", "Dispersión masiva y nóminas", "Cientos de pagos en un solo archivo con validación fila por fila, pausa y reanudación por lote, padrón de empleados y ejecución de nómina completa en un clic."],
  ["Resiliencia", "", "Cero operaciones perdidas", "Los avisos de depósito se persisten de forma durable antes de procesarse: una falla del sistema o del procesador no pierde dinero ni avisos. Reintentos sin duplicados."],
  ["Multi-empresa", "", "N razones sociales, un core", "Multi-tenant real con aislamiento total de datos, usuarios y permisos. Multi-CLABE por empresa y motor de comisiones en cascada para monetizar la operación."],
  ["Conciliación", "", "Cuadre automático diario", "Conciliación contra el procesador con detección de duplicados, faltantes y diferencias. Auditoría interna de saldos recalculada desde el libro mayor."],
  ["Trazabilidad", "", "CEP y clave de rastreo, siempre", "Comprobante oficial de Banxico en cada operación, clave de rastreo exportable, recibos en PDF e historial completo con filtros avanzados."],
] as const;

export function Capabilities() {
  return (
    <section className="section" id="capacidades">
      <div className="container">
        <Reveal as="p" className="eyebrow">
          Capacidades
        </Reveal>
        <Reveal as="h2" className="h2">
          Todo el ciclo del dinero,
          <br />
          <em className="grad-money">de la entrada a la conciliación.</em>
        </Reveal>
        <div className="grid-3">
          {CAPS.map(([tag, kind, title, body], i) => (
            <Reveal key={title} delay={(i % 3) * 0.1}>
              <TiltCard>
                <span className={`cap-tag ${kind}`}>{tag}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Seguridad ── */

const SECS = [
  ["2FA obligatorio", "Sin segundo factor no se opera. Sin excepciones. Biometría WebAuthn (FaceID/huella) para cuentas de alto privilegio.", "M12 3 4.5 6v5c0 4.6 3.2 8.4 7.5 10 4.3-1.6 7.5-5.4 7.5-10V6L12 3Zm-3 9 2 2 4-4"],
  ["Aprobación de dispositivos", "Un equipo nuevo no entra hasta ser aprobado. La aprobación llega en tiempo real, en menos de un segundo.", "M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm5 14.5h.01"],
  ["Kill switch de salidas", "Las transferencias salientes pueden pausarse al instante ante cualquier sospecha; solo se reactivan desde infraestructura controlada.", "M18.4 6.6a9 9 0 1 0 0 12.8M21 5l-9 9"],
  ["Vigilancia con IA 24/7", "Agente de seguridad con inteligencia artificial que evalúa amenazas, califica riesgos y bloquea IPs hostiles en automático.", "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v5l3 3"],
  ["Bitácora de auditoría total", "Cada acción queda registrada con usuario, IP, ubicación y contexto. Trazabilidad completa para reguladores y auditores.", "M4 19V5m0 14h16M8 16v-5m4 5V8m4 8v-3"],
  ["Pentests continuos", "Pruebas de penetración internas y externas recurrentes, con remediación inmediata y monitoreo perimetral permanente.", "m14 7 3 3M5 19l4-1 9.5-9.5a2.1 2.1 0 0 0-3-3L6 15l-1 4Z"],
] as const;

export function Security() {
  return (
    <section className="section security-bg" id="seguridad">
      <div className="container">
        <Reveal as="p" className="eyebrow">
          Seguridad
        </Reveal>
        <Reveal as="h2" className="h2">
          La seguridad no es un módulo.
          <br />
          <em className="grad">Es la arquitectura.</em>
        </Reveal>
        <div className="grid-3">
          {SECS.map(([title, body, path], i) => (
            <Reveal key={title} delay={(i % 3) * 0.1}>
              <TiltCard>
                <div className="sec-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d={path} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3>{title}</h3>
                <p>{body}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Cumplimiento ── */

const COMPS = [
  ["Screening de contrapartes", "Contra listas de sanciones y etiquetas de riesgo, con verificación obligatoria pre-retiro en salidas de alto riesgo."],
  ["Scoring algorítmico", "Calificación de riesgo por transacción y contraparte, con detección automática de estructuración y patrones inusuales."],
  ["Análisis de flujos", "Mapeo del origen y destino del dinero hasta 5 niveles hacia atrás y hacia adelante."],
  ["Reportes asistidos con IA", "Borradores de reportes de operación sospechosa (SAR) generados por IA, y rol de solo-lectura para oficiales de cumplimiento y auditores externos."],
] as const;

export function Compliance() {
  return (
    <section className="section" id="cumplimiento">
      <div className="container comp-grid">
        <div>
          <Reveal as="p" className="eyebrow">
            Cumplimiento
          </Reveal>
          <Reveal as="h2" className="h2">
            Inteligencia PLD/AML
            <br />
            <em className="grad-money">dentro de la plataforma.</em>
          </Reveal>
          <Reveal as="p" className="lead">
            Módulo de análisis de riesgo y cumplimiento normativo integrado: la prevención
            de lavado no es un proceso aparte, es parte del flujo de cada operación.
          </Reveal>
        </div>
        <div>
          {COMPS.map(([title, body], i) => (
            <Reveal key={title} className="comp-item" delay={i * 0.08}>
              <span className="comp-num">0{i + 1}</span>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Para quién ── */

const USES = [
  ["Fintechs y plataformas de pago", "Infraestructura SPEI completa vía API, sin construir un core desde cero."],
  ["Empresas con alta operación", "Dispersión masiva, nóminas y multi-cuenta con control total."],
  ["Marketplaces y e-commerce", "CLABEs virtuales por cliente u orden para identificar cada cobro automáticamente."],
  ["Tesorerías corporativas", "Concentración de fondos, conciliación diaria y visibilidad en tiempo real."],
  ["Grupos empresariales", "Varias razones sociales con aislamiento total y usuarios independientes por compañía."],
  ["Operadores de telecom", "Conectividad, telefonía y equipamiento con un solo proveedor tecnológico."],
] as const;

export function UseCases() {
  return (
    <section className="section" id="casos">
      <div className="container">
        <Reveal as="p" className="eyebrow">
          Para quién
        </Reveal>
        <Reveal as="h2" className="h2">
          Construido para operaciones
          <br />
          <em className="grad">que no pueden detenerse.</em>
        </Reveal>
        <div className="grid-3">
          {USES.map(([title, body], i) => (
            <Reveal key={title} delay={(i % 3) * 0.08}>
              <TiltCard>
                <h3>{title}</h3>
                <p>{body}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
