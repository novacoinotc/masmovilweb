# MASMOVIL — «Anatomía de un segundo»

masmovil.lat · La página entera es UNA transferencia SPEI dilatada en bullet time:
el scroll avanza milisegundos (00.000s → 01.000s), con cronómetro persistente,
scrubber de milisegundos como navegación y un pulso verde (el único verde: dinero)
descendiendo por el riel.

Concepto diseñado por un equipo de 11 agentes (3 directores creativos en competencia,
jurado, arquitecto de información, copywriter, colorimetrista, director de motion,
director de arte, scout de 21st.dev y crítico de cohesión).

## Los cinco actos

1. **T=00.000 · La orden** — hero con el payload protagonista ($84,500.00 · nómina)
2. **El stack** — las tres capas (telecom, software, pagos) antes de soltar el pulso
3. **T=00.045 · La firma** — typewriter del request ligado al scroll + sello HMAC azul
4. **T=00.290 · El escrutinio** — anillos PLD/AML girando + **KILL SWITCH**: mantén presionado y toda la página se congela (cronómetro ámbar, anillos quietos, partículas heladas)
5. **T=00.620 · Banxico** — la frontera institucional + bento de capacidades
6. **T=00.870 · El CEP** — el comprobante se materializa campo a campo, webhook al backend, beat a negro
7. **T=01.000 · En vivo** — el reloj se suelta a tiempo real, el riel se ramifica en canvas, dashboard con feed **auditable** (click → expediente con HMAC, folio CEP y trayectoria)
8. **Acceso** — formulario-terminal: al enviar se estampa un FOLIO que entra al feed en vivo
9. **⏚ Tierra legal** — el riel aterriza en el símbolo de tierra con la placa: razón social, RFC, domicilio

## Stack

Next.js 15 + React 19 + TypeScript + Framer Motion · IBM Plex Sans/Mono (next/font)
Paleta: negro #04060e · hueso #F2F0E9 (verdad) · cyan (sistema) · azul (institución) ·
**verde solo dinero** · ámbar solo pausa. Cero gradientes.

```bash
npm install && npm run dev   # http://localhost:4300
```

Deploy: push a `main` → Vercel (framework en vercel.json).

## Notas

- Formulario → FormSubmit a direccion@masmovil.lat (activar primer correo). Fallback mailto.
- Dashboard y feed son ilustrativos (aria: "feed ilustrativo").
- `prefers-reduced-motion` degrada a estados finales estáticos. Kill switch funciona igual.
