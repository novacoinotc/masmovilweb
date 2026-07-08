/* ═══════════════════════════════════════════
   MASMOVIL — Animaciones e interacción
   GSAP + ScrollTrigger + Lenis
   ═══════════════════════════════════════════ */

(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = window.matchMedia("(max-width: 720px)").matches;
  var hasGsap = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";

  if (prefersReduced || !hasGsap) {
    document.documentElement.classList.add("reduced");
  } else {
    // Activa el estado inicial oculto de .reveal solo si vamos a animar
    document.documentElement.classList.add("js-anim");
  }

  /* ── Smooth scroll (Lenis) ─────────────── */
  var lenis = null;
  if (!prefersReduced && typeof Lenis !== "undefined") {
    lenis = new Lenis({
      duration: 1.15,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    if (hasGsap) {
      lenis.on("scroll", ScrollTrigger.update);
    }
  }

  // Anclas internas con Lenis
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      if (lenis) {
        lenis.scrollTo(target, { offset: -60 });
      } else {
        target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
      }
    });
  });

  /* ── Nav: fondo + ocultar al bajar ─────── */
  var nav = document.getElementById("nav");
  var lastY = 0;
  function onScrollNav() {
    var y = window.scrollY || document.documentElement.scrollTop;
    nav.classList.toggle("scrolled", y > 30);
    if (y > lastY && y > 400) nav.classList.add("hidden");
    else nav.classList.remove("hidden");
    lastY = y;
  }
  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  /* ── Menú móvil ─────────────────────────── */
  var toggle = document.getElementById("menu-toggle");
  var mobileMenu = document.getElementById("mobile-menu");
  function closeMenu() {
    toggle.classList.remove("open");
    mobileMenu.classList.remove("open");
    mobileMenu.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
    if (lenis) lenis.start();
  }
  toggle.addEventListener("click", function () {
    var open = mobileMenu.classList.toggle("open");
    toggle.classList.toggle("open", open);
    mobileMenu.setAttribute("aria-hidden", String(!open));
    toggle.setAttribute("aria-expanded", String(open));
    if (lenis) { open ? lenis.stop() : lenis.start(); }
  });

  /* ── Formulario: solicitar una prueba ───── */
  (function demoForm() {
    var form = document.getElementById("demo-form");
    if (!form) return;
    var btn = document.getElementById("form-btn");
    var status = document.getElementById("form-status");
    var EMAIL = "direccion@masmovil.lat";

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // validación simple
      var invalid = false;
      form.querySelectorAll("[required]").forEach(function (field) {
        var bad = !field.value.trim() ||
          (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value));
        field.classList.toggle("invalid", bad);
        if (bad) invalid = true;
      });
      if (invalid) {
        status.textContent = "Revisa los campos marcados.";
        status.className = "form-status err";
        return;
      }
      if (form.querySelector('[name="_honey"]').value) return; // bot

      var data = {
        nombre: form.nombre.value.trim(),
        empresa: form.empresa.value.trim(),
        email: form.email.value.trim(),
        interes: form.interes.value,
        mensaje: form.mensaje.value.trim() || "—",
        _subject: "Solicitud de prueba — masmovil.lat",
        _template: "table"
      };

      btn.disabled = true;
      btn.style.opacity = "0.6";
      status.textContent = "Enviando…";
      status.className = "form-status";

      fetch("https://formsubmit.co/ajax/" + EMAIL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
      })
        .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
        .then(function () {
          status.textContent = "¡Listo! Recibimos tu solicitud, te contactamos muy pronto.";
          status.className = "form-status ok";
          form.reset();
        })
        .catch(function () {
          // Fallback: abrir el cliente de correo con los datos precargados
          var body = "Nombre: " + data.nombre + "\nEmpresa: " + data.empresa +
            "\nCorreo: " + data.email + "\nMe interesa: " + data.interes +
            "\n\n" + data.mensaje;
          window.location.href = "mailto:" + EMAIL +
            "?subject=" + encodeURIComponent("Solicitud de prueba — MASMOVIL") +
            "&body=" + encodeURIComponent(body);
          status.textContent = "Abrimos tu correo para completar el envío.";
          status.className = "form-status";
        })
        .finally(function () {
          btn.disabled = false;
          btn.style.opacity = "";
        });
    });
  })();

  /* ── Canvas: red de nodos viva ─────────── */
  (function initCanvas() {
    if (prefersReduced) return;
    var canvas = document.getElementById("net-canvas");
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W, H, particles;
    var COUNT = isMobile ? 34 : 78;
    var LINK = isMobile ? 110 : 150;
    var mouse = { x: -9999, y: -9999 };
    var running = true;

    function resize() {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function make() {
      particles = [];
      for (var i = 0; i < COUNT; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          r: Math.random() * 1.6 + 0.6,
          hue: Math.random() > 0.5 ? "34,211,238" : "139,92,246"
        });
      }
    }

    function step() {
      if (!running) { requestAnimationFrame(step); return; }
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < COUNT; i++) {
        var p = particles[i];
        p.x += p.vx; p.y += p.vy;

        // atracción sutil al cursor
        var dxm = mouse.x - p.x, dym = mouse.y - p.y;
        var dm = Math.sqrt(dxm * dxm + dym * dym);
        if (dm < 220 && dm > 0.001) {
          p.x += (dxm / dm) * 0.18;
          p.y += (dym / dm) * 0.18;
        }

        if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20; if (p.y > H + 20) p.y = -20;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + p.hue + ",0.55)";
        ctx.fill();

        for (var j = i + 1; j < COUNT; j++) {
          var q = particles[j];
          var dx = p.x - q.x, dy = p.y - q.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = "rgba(120,150,220," + (0.09 * (1 - d / LINK)) + ")";
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(step);
    }

    window.addEventListener("resize", function () { resize(); make(); });
    window.addEventListener("pointermove", function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    document.addEventListener("visibilitychange", function () { running = !document.hidden; });

    resize(); make(); step();
  })();

  if (!hasGsap) return; // sin GSAP: la página queda estática pero legible

  gsap.registerPlugin(ScrollTrigger);
  if (prefersReduced) return;

  /* ── Barra de progreso ─────────────────── */
  gsap.to("#scroll-bar", {
    scaleX: 1,
    ease: "none",
    scrollTrigger: { start: 0, end: "max", scrub: 0.3 }
  });

  /* ── Intro del hero ─────────────────────── */
  gsap.set("[data-hero]", { opacity: 0, y: 46 });
  gsap.to("[data-hero]", {
    opacity: 1, y: 0,
    duration: 1.1,
    stagger: 0.11,
    ease: "power3.out",
    delay: 0.15
  });

  // Zoom-out del hero al scrollear (efecto "vivo")
  gsap.to(".hero-content", {
    scale: 0.92,
    opacity: 0,
    y: -70,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom 40%",
      scrub: 0.6
    }
  });
  gsap.to(".hero-scroll-hint", {
    opacity: 0,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "20% top", scrub: true }
  });

  /* ── Contadores ─────────────────────────── */
  document.querySelectorAll("[data-count]").forEach(function (el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var obj = { v: 0 };
    gsap.to(obj, {
      v: target,
      duration: 1.8,
      ease: "power2.out",
      delay: 0.5,
      onUpdate: function () { el.textContent = Math.round(obj.v); },
      scrollTrigger: { trigger: el, start: "top bottom" }
    });
  });

  /* ── Marquee infinito ───────────────────── */
  (function marquee() {
    var track = document.getElementById("marquee-track");
    track.innerHTML += track.innerHTML; // duplicar para loop
    gsap.to(track, {
      xPercent: -50,
      duration: 26,
      ease: "none",
      repeat: -1
    });
  })();

  /* ── Reveals: planos y de profundidad 3D ──
     Los bloques grandes (títulos, tarjetas, terminal) llegan
     "desde lejos": escala reducida + blur + rotación en X,
     como si avanzaran desde el fondo hacia el frente. */
  var DEPTH_SELECTOR = ".h2, .cta-title, .biz-card, .cap-card, .sec-card, .use-card, .terminal, .comp-item, .demo-form";
  document.querySelectorAll(".reveal").forEach(function (el) {
    if (el.matches(DEPTH_SELECTOR)) {
      gsap.fromTo(el,
        { opacity: 0, scale: 0.7, y: 120, rotateX: 16, transformPerspective: 1100, filter: "blur(12px)" },
        {
          opacity: 1, scale: 1, y: 0, rotateX: 0, filter: "blur(0px)",
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 92%",
            toggleActions: "play none none reverse"
          },
          onComplete: function () { el.style.filter = ""; }
        });
    } else {
      gsap.to(el, {
        opacity: 1, y: 0,
        duration: 0.95,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none reverse"
        }
      });
    }
  });

  /* ── Statement: palabras que se encienden ── */
  (function statement() {
    var el = document.getElementById("statement");
    if (!el) return;
    var words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(function (w) { return '<span class="w">' + w + "</span>"; }).join(" ");
    gsap.to(el.querySelectorAll(".w"), {
      opacity: 1,
      stagger: 0.06,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top 78%",
        end: "bottom 45%",
        scrub: 0.4
      }
    });
    gsap.set(el.querySelectorAll(".w"), { opacity: 0.14 });
  })();

  /* ── Plataforma: secuencia pinned con zoom ─ */
  (function platformPin() {
    var stage = document.querySelector(".pin-stage");
    if (!stage) return;

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6
      }
    });

    // 1) Encabezado entra
    tl.fromTo(".pin-head",
      { opacity: 0, y: 60 },
      { opacity: 1, y: 0, duration: 0.5 }, 0);

    // 2) Dashboard llega desde muy lejos (zoom 3D profundo)
    tl.fromTo("#dash-wrap",
      { opacity: 0, scale: 0.4, y: 260, rotateX: 24, transformPerspective: 1200, filter: "blur(14px)" },
      { opacity: 1, scale: 1, y: 0, rotateX: 0, filter: "blur(0px)", duration: 1.5, ease: "power2.out" }, 0.15);

    // 3) La gráfica se dibuja
    tl.to(".chart-line", { strokeDashoffset: 0, duration: 1.1, ease: "power1.inOut" }, 1.0);

    // 4) Callouts aparecen alrededor
    tl.fromTo(".co-1", { opacity: 0, x: -34, scale: 0.85 }, { opacity: 1, x: 0, scale: 1, duration: 0.45 }, 1.5);
    tl.fromTo(".co-2", { opacity: 0, x: 34, scale: 0.85 }, { opacity: 1, x: 0, scale: 1, duration: 0.45 }, 1.7);
    tl.fromTo(".co-3", { opacity: 0, x: -34, scale: 0.85 }, { opacity: 1, x: 0, scale: 1, duration: 0.45 }, 1.9);
    tl.fromTo(".co-4", { opacity: 0, y: 30, scale: 0.85 }, { opacity: 1, y: 0, scale: 1, duration: 0.45 }, 2.1);

    // 5) Zoom-through de salida: crece hacia la cámara pero queda
    //    parcialmente visible al despinnear — así el scroll nunca
    //    pasa por una pantalla vacía; el dashboard sale de cuadro
    //    de forma natural junto con la siguiente sección.
    tl.to("#dash-wrap", { scale: 1.14, opacity: 0.45, y: -70, duration: 0.9, ease: "power2.in" }, 3.0);
    tl.to(".pin-head", { opacity: 0, y: -60, duration: 0.7 }, 3.0);
    tl.to("[data-co]", { opacity: 0, scale: 1.12, duration: 0.45 }, 3.0);
  })();

  /* ── Parallax de orbes ──────────────────── */
  gsap.to(".orb-a", { yPercent: 34, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 1.2 } });
  gsap.to(".orb-b", { yPercent: -28, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 1.2 } });
  gsap.to(".orb-c", { yPercent: -42, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 1.2 } });

  /* ── Tilt 3D en tarjetas destacadas ─────── */
  if (!isMobile) {
    document.querySelectorAll("[data-tilt]").forEach(function (card) {
      var bounds;
      card.addEventListener("pointerenter", function () { bounds = card.getBoundingClientRect(); });
      card.addEventListener("pointermove", function (e) {
        if (!bounds) bounds = card.getBoundingClientRect();
        var px = (e.clientX - bounds.left) / bounds.width;
        var py = (e.clientY - bounds.top) / bounds.height;
        card.style.setProperty("--mx", (px * 100) + "%");
        card.style.setProperty("--my", (py * 100) + "%");
        gsap.to(card, {
          rotateY: (px - 0.5) * 6,
          rotateX: (0.5 - py) * 6,
          transformPerspective: 800,
          duration: 0.4,
          ease: "power2.out"
        });
      });
      card.addEventListener("pointerleave", function () {
        gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "power3.out" });
      });
    });

    /* ── Botones magnéticos ───────────────── */
    document.querySelectorAll(".btn-magnetic").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var b = btn.getBoundingClientRect();
        var x = e.clientX - b.left - b.width / 2;
        var y = e.clientY - b.top - b.height / 2;
        gsap.to(btn, { x: x * 0.22, y: y * 0.22, duration: 0.35, ease: "power2.out" });
      });
      btn.addEventListener("pointerleave", function () {
        gsap.to(btn, { x: 0, y: 0, duration: 0.55, ease: "elastic.out(1, 0.45)" });
      });
    });
  }

  /* ── Refresh tras cargar fuentes ────────── */
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
