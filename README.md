# MASMOVIL — Landing page corporativa

Sitio estático de **MASMOVIL, S.A. de C.V.** (RFC MAS191203EY6): telecomunicaciones,
software e infraestructura de pagos SPEI. Pensado como presencia web para el proceso
de integración indirecta a SPEI vía STP.

## Stack

- HTML + CSS + JS puros (sin build, sin dependencias locales)
- GSAP 3 + ScrollTrigger (animaciones de scroll, sección pinned con zoom)
- Lenis (smooth scroll)
- Canvas propio (red de nodos animada de fondo)
- Fuentes: Space Grotesk, Inter, JetBrains Mono (Google Fonts)

## Ver en local

```bash
cd masmovil-web
python3 -m http.server 4173
# abrir http://localhost:4173
```

## Deploy en Vercel

```bash
cd masmovil-web
vercel          # preview
vercel --prod   # producción
```

Al ser un sitio estático no requiere configuración: Vercel lo detecta como
"Other / static" y sirve `index.html` directamente.

## Contenido / datos legales

- Razón social, RFC y domicilio (footer) tomados de la Constancia de Situación Fiscal (SAT, ene 2026).
- Contacto: direccion@masmovil.lat (sin teléfono).
- Formulario "Solicitar una prueba": envía por FormSubmit (`formsubmit.co/ajax/direccion@masmovil.lat`).
  **La primera vez que alguien envíe el formulario, FormSubmit manda un correo de activación a
  direccion@masmovil.lat — hay que darle clic para que empiecen a llegar los envíos.**
  Si el envío falla, hace fallback a `mailto:`.
- Copy de la plataforma de pagos basado en la oferta comercial de NOVACORE.

## Efectos "vivos"

- **"El viaje de una transferencia"** (`#viaje`): descenso scrollytelling tipo iceberg por las
  6 capas del stack (orden → firma → core → cumplimiento → SPEI → liquidada), con cronómetro
  t=0→3.80s, pulso de dinero bajando por el carril, fondo que cambia de color por capa y
  burbujas subiendo. Estallido verde al liquidar.

- El dashboard del pin se **construye pieza por pieza** con el scroll (y se desconstruye al subir).
- El código de la API se **teclea solo** con cursor parpadeante, ligado al scroll.
- **Feed vivo**: cada ~3s entra una transacción nueva al dashboard y el saldo se actualiza
  (solo mientras el dashboard es visible — IntersectionObserver).
- En móvil los callouts se muestran como chips animados bajo el dashboard.

## Accesibilidad / rendimiento

- `prefers-reduced-motion`: desactiva todas las animaciones. **Ojo:** si un teléfono tiene
  "Reducir movimiento" activado (iOS: Ajustes → Accesibilidad → Movimiento), el sitio se
  muestra estático a propósito.
- Si el CDN de GSAP no carga, la página se muestra completa sin animaciones (fallback `html.js-anim`).
- Optimizado para móvil (verificado a 390px, sin overflow horizontal).
