# MASMOVIL — Landing corporativa (Next.js + React)

Sitio de **MASMOVIL, S.A. de C.V.** (RFC MAS191203EY6): telecomunicaciones, software
e infraestructura de pagos SPEI. Presencia web para la integración indirecta a SPEI vía STP.

## Stack

- **Next.js 15** (App Router, prerender estático) + **React 19** + TypeScript
- **Framer Motion** — todas las animaciones: springs, variants, gestos, scroll scrub
- **next/font** — IBM Plex Sans + IBM Plex Mono (autohospedadas)
- CSS propio (sistema de diseño generado con la skill UI/UX Pro Max: Minimalismo/Swiss, azul financiero, verde = dinero)

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:4300
npm run build    # build de producción
```

## Deploy

Push a `main` → Vercel detecta Next.js (framework fijado en `vercel.json`) y despliega.

## Interactividad

- Cursor custom (punto + anillo con resorte) y **spotlight global** que sigue al mouse
- Fondo de partículas: color que viaja con el scroll, estelas de velocidad, chispas al clic/tap, atracción al cursor
- Hero con parallax 3D al cursor; botones magnéticos; tarjetas con tilt 3D + glow
- Dashboard que se construye al entrar en viewport, con **feed vivo de transacciones** (AnimatePresence) y saldo animado
- **"El viaje de una transferencia"**: scrollytelling con cronómetro t=0→3.80s, pulso descendente y fondo por profundidad
- Código de la API que se **teclea solo** con cursor parpadeante
- Formulario "Solicitar una prueba" → FormSubmit a direccion@masmovil.lat (activar el primer correo) con shake de validación y fallback mailto

## Accesibilidad

`useReducedMotion` en todos los efectos, `:focus-visible`, contraste AA+, sin emojis como íconos.

## Datos legales

Constancia de Situación Fiscal (SAT): razón social, RFC y domicilio en el footer.
Contacto: direccion@masmovil.lat (sin teléfono).
