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

## Accesibilidad / rendimiento

- `prefers-reduced-motion`: desactiva todas las animaciones.
- Si el CDN de GSAP no carga, la página se muestra completa sin animaciones (fallback `html.js-anim`).
- Optimizado para móvil (verificado a 390px, sin overflow horizontal).
