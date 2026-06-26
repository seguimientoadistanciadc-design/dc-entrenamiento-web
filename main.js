(function () {
  "use strict";

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }

  /* ─── NAV ─── */
  function initNav() {
    const nav = document.getElementById("nav");
    if (!nav) return;
    const burger = nav.querySelector(".nav-burger");
    const mobileMenu = document.getElementById("nav-mobile");
    const overlay = document.querySelector(".nav-overlay");
    const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll(".nav-mobile-link") : [];
    const closeBtn = mobileMenu ? mobileMenu.querySelector(".nav-mobile-close") : null;

    // Solidify nav on scroll
    const sentinel = document.createElement("div");
    sentinel.style.cssText = "position:absolute;top:80px;left:0;width:1px;height:1px;pointer-events:none;";
    document.body.prepend(sentinel);
    const io = new IntersectionObserver(([e]) => nav.classList.toggle("is-scrolled", !e.isIntersecting), { threshold: 0 });
    io.observe(sentinel);

    function openMenu() {
      if (!mobileMenu) return;
      burger.classList.add("is-open");
      burger.setAttribute("aria-expanded", "true");
      mobileMenu.classList.add("is-open");
      mobileMenu.setAttribute("aria-hidden", "false");
      if (overlay) overlay.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }
    function closeMenu() {
      if (!mobileMenu) return;
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      mobileMenu.classList.remove("is-open");
      mobileMenu.setAttribute("aria-hidden", "true");
      if (overlay) overlay.classList.remove("is-open");
      document.body.style.overflow = "";
    }
    if (burger) burger.addEventListener("click", () => mobileMenu.classList.contains("is-open") ? closeMenu() : openMenu());
    if (closeBtn) closeBtn.addEventListener("click", closeMenu);
    if (overlay) overlay.addEventListener("click", closeMenu);
    mobileLinks.forEach(l => l.addEventListener("click", closeMenu));
  }

  /* ─── SMOOTH SCROLL ─── */
  function initSmoothScroll() {
    document.addEventListener("click", e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 80, behavior: reduced ? "auto" : "smooth" });
    });
  }

  /* ─── HERO ENTRANCE ─── */
  function initHeroEntrance() {
    const lines = document.querySelectorAll(".hero-title-line");
    const sub = document.querySelector(".hero-sub");
    const actions = document.querySelector(".hero-actions");
    if (!lines.length) return;

    if (window.gsap) {
      gsap.to(lines, { opacity: 1, y: 0, duration: 1.1, stagger: 0.18, ease: "expo.out", delay: 0.25 });
      gsap.to(sub, { opacity: 1, y: 0, duration: 1, ease: "expo.out", delay: 0.75 });
      gsap.to(actions, { opacity: 1, y: 0, duration: 1, ease: "expo.out", delay: 0.92 });
    } else {
      lines.forEach(l => { l.style.opacity = 1; l.style.transform = "none"; });
      if (sub) { sub.style.opacity = 1; sub.style.transform = "none"; }
      if (actions) { actions.style.opacity = 1; actions.style.transform = "none"; }
    }
  }

  /* ─── MOUSE-REACTIVE GRADIENT ─── */
  function initMouseGradient() {
    const grad = document.querySelector("[data-mouse-gradient]");
    if (!grad) return;
    let tx = 15, ty = 65, cx = 15, cy = 65;

    function lerp(a, b, t) { return a + (b - a) * t; }
    function tick() {
      cx = lerp(cx, tx, 0.055);
      cy = lerp(cy, ty, 0.055);
      document.documentElement.style.setProperty("--mx", cx + "%");
      document.documentElement.style.setProperty("--my", cy + "%");
      requestAnimationFrame(tick);
    }
    window.addEventListener("mousemove", e => {
      tx = (e.clientX / window.innerWidth) * 100;
      ty = (e.clientY / window.innerHeight) * 100;
    });
    requestAnimationFrame(tick);
  }

  /* ─── SCROLL REVEALS ─── */
  function initReveals() {
    const items = document.querySelectorAll(".reveal[data-reveal]");
    if (!items.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.04, rootMargin: "0px 0px -3% 0px" });

    items.forEach((el, i) => {
      el.style.transitionDelay = (i % 4) * 0.08 + "s";
      io.observe(el);
    });
    // Safety net
    setTimeout(() => {
      document.querySelectorAll(".reveal[data-reveal]:not(.is-visible)").forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-visible");
      });
    }, 6000);
  }

  /* ─── COUNT-UP ─── */
  function initCountUp() {
    const items = document.querySelectorAll("[data-count-to]");
    if (!items.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        const el = e.target;
        const target = parseInt(el.dataset.countTo, 10);
        const suffix = el.dataset.suffix || "";
        const duration = 1800;
        const start = performance.now();
        function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
        function update(now) {
          const p = Math.min((now - start) / duration, 1);
          el.textContent = Math.round(easeOut(p) * target).toLocaleString("es-MX") + suffix;
          if (p < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
      });
    }, { threshold: 0.5 });
    items.forEach(el => io.observe(el));
  }

  /* ─── INSTAGRAM FOLLOWERS (display static) ─── */
  function initInstagramStat() {
    const el = document.querySelector(".instagram-followers");
    if (!el) return;
    // Número real de seguidores en Instagram.
    el.textContent = "7,500";
    el.dataset.countTo = "7500";
    el.dataset.suffix = "";
  }

  /* ─── GSAP SCROLL ANIMATIONS ─── */
  function initScrollAnimations() {
    // Nota: estas tarjetas (.service-card, .blog-card) YA aparecen con el sistema
    // `.reveal` (IntersectionObserver en initReveals), que funciona con cualquier
    // tipo de scroll. Antes había aquí animaciones GSAP con ScrollTrigger que, al
    // no estar integradas con el scroll suave (Lenis), NO se disparaban al hacer
    // scroll y dejaban las tarjetas en opacity:0 en línea (invisibles, con hueco).
    // Se eliminaron para evitar ese conflicto. (`.resource-card`/`.resources-grid`
    // ya no existen en el HTML.)
    return;
  }

  /* ─── CARD TILT ─── */
  function initCardTilt() {
    if (matchMedia("(hover: none)").matches) return;
    const cards = document.querySelectorAll(".service-card, .resource-card, .blog-card");
    cards.forEach(card => {
      card.addEventListener("mousemove", e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `translateY(-5px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
        card.style.transition = "transform 0.1s";
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
        card.style.transition = "transform 0.45s cubic-bezier(0.16,1,0.3,1)";
      });
    });
  }

  /* ─── CONTACT FORM ─── */
  function initContactForm() {
    const form = document.getElementById("contact-form");
    const btn = document.getElementById("form-submit");
    if (!form || !btn) return;

    form.addEventListener("submit", async e => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      btn.classList.add("is-loading");
      btn.disabled = true;
      await new Promise(r => setTimeout(r, 1600));
      btn.classList.remove("is-loading");
      btn.classList.add("is-success");
      setTimeout(() => {
        btn.classList.remove("is-success");
        btn.disabled = false;
        form.reset();
      }, 4000);
    });
  }

  /* ─── CREDITS ─── */
  function initCredits() {
    const el = document.getElementById("photo-credits");
    if (!el) return;
    fetch("assets/credits.json")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data || !Array.isArray(data) || !data.length) return;
        const items = data.filter(c => c && c.creator);
        if (!items.length) return;
        el.innerHTML = "<small>Imágenes de stock: " +
          items.slice(0, 3).map(c =>
            `<a href="${c.foreign_landing_url || '#'}" target="_blank" rel="noopener">${c.title || 'Foto'} (${c.creator})</a>`
          ).join(", ") + " vía Openverse (CC)</small>";
      })
      .catch(() => {});
  }

  /* ─── COVERFLOW 3D (Volumen 1) ─── */
  function initCoverflow() {
    const cf = document.getElementById("coverflow");
    if (!cf) return;
    const stage = cf.querySelector("[data-coverflow-stage]");
    const items = Array.prototype.slice.call(cf.querySelectorAll(".cf-item"));
    const dotsWrap = cf.querySelector("[data-coverflow-dots]");
    const captionEl = cf.querySelector("[data-coverflow-caption]");
    const prev = cf.querySelector(".coverflow-prev");
    const next = cf.querySelector(".coverflow-next");
    if (!items.length) return;
    const n = items.length;
    let active = 0;
    let timer = null;

    const dots = items.map((_, i) => {
      const d = document.createElement("button");
      d.className = "cf-dot";
      d.type = "button";
      d.setAttribute("aria-label", "Ir a la portada " + (i + 1));
      d.addEventListener("click", () => { go(i); restartAuto(); });
      dotsWrap.appendChild(d);
      return d;
    });

    function render() {
      items.forEach((item, i) => {
        const offset = i - active;
        const abs = Math.abs(offset);
        const sign = offset < 0 ? -1 : 1;
        const x = offset * 165;
        const rotate = offset === 0 ? 0 : -sign * 38;
        const scale = offset === 0 ? 1 : Math.max(0.72, 0.82 - (abs - 1) * 0.08);
        const z = offset === 0 ? 0 : -120 - (abs - 1) * 60;
        const opacity = abs > 2 ? 0 : (offset === 0 ? 1 : 0.55 - (abs - 1) * 0.18);
        item.style.transform = `translateX(${x}px) translateZ(${z}px) rotateY(${rotate}deg) scale(${scale})`;
        item.style.opacity = opacity;
        item.style.zIndex = String(100 - abs);
        item.style.pointerEvents = abs > 2 ? "none" : "auto";
        item.classList.toggle("is-active", offset === 0);
      });
      dots.forEach((d, i) => d.classList.toggle("is-active", i === active));
      // Caption externo (fuera del área recortada) con la portada activa.
      if (captionEl) {
        const fig = items[active].querySelector("figcaption");
        const num = fig ? fig.querySelector(".cf-num") : null;
        const name = fig ? fig.querySelector(".cf-name") : null;
        captionEl.innerHTML =
          '<span class="cf-num">' + (num ? num.textContent : "") + "</span>" +
          '<span class="cf-name">' + (name ? name.textContent : "") + "</span>";
      }
    }

    function go(i) { active = (i + n) % n; render(); }
    const nextFn = () => go(active + 1);
    const prevFn = () => go(active - 1);

    if (next) next.addEventListener("click", () => { nextFn(); restartAuto(); });
    if (prev) prev.addEventListener("click", () => { prevFn(); restartAuto(); });
    items.forEach((item, i) => item.addEventListener("click", () => { if (i !== active) { go(i); restartAuto(); } }));

    cf.setAttribute("tabindex", "0");
    cf.addEventListener("keydown", e => {
      if (e.key === "ArrowLeft") { prevFn(); restartAuto(); }
      else if (e.key === "ArrowRight") { nextFn(); restartAuto(); }
    });

    // Swipe táctil
    let startX = null;
    stage.addEventListener("touchstart", e => { startX = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener("touchend", e => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) { dx < 0 ? nextFn() : prevFn(); restartAuto(); }
      startX = null;
    });

    // Autoplay con pausa al pasar el cursor
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    function startAuto() { if (!reduced) { stopAuto(); timer = setInterval(nextFn, 4500); } }
    function stopAuto() { if (timer) { clearInterval(timer); timer = null; } }
    function restartAuto() { stopAuto(); startAuto(); }
    cf.addEventListener("mouseenter", stopAuto);
    cf.addEventListener("mouseleave", startAuto);

    render();
    startAuto();
  }

  /* ─── PRESENTACIÓN GRATIS — captura de correo ─── */
  function initLeadForm() {
    const form = document.getElementById("lead-form");
    if (!form) return;
    const msg = form.parentElement.querySelector("[data-lead-msg]");
    const btn = form.querySelector(".vol-lead-submit");
    const file = form.getAttribute("data-lead-file") || "presentacion-volumen-1.pdf";

    function showMsg(text, ok) {
      if (!msg) return;
      msg.textContent = text;
      msg.hidden = false;
      msg.classList.toggle("is-ok", !!ok);
      msg.classList.toggle("is-err", !ok);
    }
    function downloadFile() {
      const a = document.createElement("a");
      a.href = encodeURI(file);
      a.setAttribute("download", file);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    form.addEventListener("submit", async e => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const email = form.querySelector('[name="email"]').value.trim();
      btn.classList.add("is-loading");
      try {
        // Intenta guardar el correo en el backend (no bloquea la descarga si falla).
        const base = (window.DCAuth && window.DCAuth.apiBase) || "";
        if (base) {
          try {
            await fetch(base + "/leads", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: email, source: "presentacion-volumen-1" })
            });
          } catch (err) { /* sin conexión con el backend: continúa */ }
        }
        showMsg("¡Listo! Tu descarga comienza ahora. ¡Gracias por tu interés!", true);
        downloadFile();
        form.reset();
      } finally {
        btn.classList.remove("is-loading");
      }
    });
  }

  /* ─── BOTÓN COMPRAR VOLUMEN 1 → Mercado Pago ─── */
  function initVolBuy() {
    const btn = document.querySelector("[data-vol-buy]");
    if (!btn || !window.DCAuth) return;
    const slug = btn.getAttribute("data-vol-buy") || "volumen-1";

    btn.addEventListener("click", async () => {
      // Requiere sesión: si no hay, abrir registro.
      if (!window.DCAuth.isAuthenticated()) {
        window.DCAuth.toast && window.DCAuth.toast("Crea tu cuenta para continuar con la compra.");
        window.DCAuth.openModal("register");
        return;
      }

      const original = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Redirigiendo a Mercado Pago…";
      try {
        const res = await window.DCAuth.fetchAuthed("/checkout/" + slug, { method: "POST" });
        if (res.status === 401) {
          window.DCAuth.toast && window.DCAuth.toast("Tu sesión expiró. Inicia sesión de nuevo.");
          window.DCAuth.openModal("login");
          return;
        }
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.init_point) {
          window.DCAuth.toast && window.DCAuth.toast("No se pudo iniciar el pago. Inténtalo más tarde.");
          return;
        }
        // Redirige a la pasarela de Mercado Pago.
        window.location.href = data.init_point;
      } catch (err) {
        window.DCAuth.toast && window.DCAuth.toast("No se pudo conectar con el servidor.");
      } finally {
        btn.disabled = false;
        btn.textContent = original;
      }
    });
  }

  /* ─── REGRESO DEL PAGO (?pago=exito|pendiente|error) ─── */
  function initPagoReturn() {
    const params = new URLSearchParams(window.location.search);
    const pago = params.get("pago");
    if (!pago) return;
    const messages = {
      exito: "¡Pago aprobado! Gracias por tu compra. En breve tendrás acceso a tu Volumen 1.",
      pendiente: "Tu pago quedó pendiente de confirmación. Te avisaremos cuando se acredite.",
      error: "El pago no se completó. Puedes intentarlo de nuevo cuando quieras."
    };
    const msg = messages[pago];
    if (msg && window.DCAuth && window.DCAuth.toast) window.DCAuth.toast(msg);
    // Limpia el parámetro de la URL sin recargar.
    params.delete("pago");
    const qs = params.toString();
    const clean = window.location.pathname + (qs ? "?" + qs : "") + window.location.hash;
    window.history.replaceState({}, "", clean);
  }

  /* ─── MI CONSOLA (panel privado) ─── */
  function initConsola() {
    const consola = document.getElementById("consola");
    if (!consola || !window.DCAuth) return;
    const body = consola.querySelector("[data-consola-body]");

    function close() {
      consola.classList.remove("is-open");
      consola.setAttribute("aria-hidden", "true");
      document.body.classList.remove("consola-open");
    }

    async function open() {
      if (!window.DCAuth.isAuthenticated()) { window.DCAuth.openModal("login"); return; }
      const user = window.DCAuth.getUser();
      const nameEl = consola.querySelector("[data-consola-name]");
      if (nameEl && user) nameEl.textContent = (user.full_name || "atleta").trim().split(/\s+/)[0];
      consola.classList.add("is-open");
      consola.setAttribute("aria-hidden", "false");
      document.body.classList.add("consola-open");
      await load();
    }

    async function load() {
      body.innerHTML = '<p class="consola-state">Cargando tus compras…</p>';
      try {
        const res = await window.DCAuth.fetchAuthed("/me/purchases");
        if (res.status === 401) { close(); window.DCAuth.openModal("login"); return; }
        if (!res.ok) { body.innerHTML = '<p class="consola-state">No se pudieron cargar tus compras. Intenta más tarde.</p>'; return; }
        render(await res.json());
      } catch (e) {
        body.innerHTML = '<p class="consola-state">No se pudo conectar con el servidor.</p>';
      }
    }

    function render(items) {
      if (!Array.isArray(items) || !items.length) {
        body.innerHTML = '<div class="consola-state"><p class="consola-empty-title">Aún no tienes compras</p><p>Cuando adquieras el Volumen 1 aparecerá aquí para descargar.</p></div>';
        return;
      }
      const cards = items.map(p => {
        const cover = (p.product && p.product.cover_image_url) || "assets/img/covers/vol1-presentacion.jpg";
        const title = (p.product && p.product.title) || "Producto";
        const fecha = p.purchased_at ? new Date(p.purchased_at).toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "numeric" }) : "";
        const action = p.can_download
          ? `<button class="consola-dl" data-dl="${p.id}" data-slug="${p.product ? p.product.slug : "descarga"}">↓ Descargar</button>`
          : '<span class="consola-card-meta">Procesando…</span>';
        return `<article class="consola-card">
            <img class="consola-card-cover" src="${cover}" alt="" loading="lazy" />
            <div>
              <h3 class="consola-card-title">${title}</h3>
              <p class="consola-card-meta"><span class="ok">● Compra aprobada</span>${fecha ? " · " + fecha : ""}</p>
              ${action}
            </div>
          </article>`;
      }).join("");
      body.innerHTML = `<div class="consola-grid">${cards}</div>`;
    }

    async function downloadItem(id, slug, btn) {
      const orig = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Descargando…";
      try {
        const res = await window.DCAuth.fetchAuthed("/downloads/" + id);
        if (!res.ok) { window.DCAuth.toast && window.DCAuth.toast("No se pudo descargar. Intenta de nuevo."); return; }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = (slug || "descarga") + ".zip";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } catch (e) {
        window.DCAuth.toast && window.DCAuth.toast("Error de conexión.");
      } finally {
        btn.disabled = false;
        btn.textContent = orig;
      }
    }

    consola.addEventListener("click", e => {
      if (e.target.closest("[data-consola-close]")) { close(); return; }
      const dl = e.target.closest("[data-dl]");
      if (dl) downloadItem(dl.getAttribute("data-dl"), dl.getAttribute("data-slug"), dl);
    });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && consola.classList.contains("is-open")) close();
    });

    // Expuesto para que el menú "Mi Consola" (auth.js) lo abra.
    window.DCConsola = { open: open, close: close };
  }

  /* ─── Catálogo dinámico (Fase 2) ───
     Trae los productos del backend y rellena los precios visibles a partir del
     `slug`, de modo que la base de datos sea la única fuente de verdad. Si el
     backend no responde, se conservan los valores escritos en el HTML. */
  function formatMoney(value) {
    var n = parseFloat(value);
    if (isNaN(n)) return null;
    var hasCents = Math.round(n * 100) % 100 !== 0;
    return "$" + n.toLocaleString("en-US", {
      minimumFractionDigits: hasCents ? 2 : 0,
      maximumFractionDigits: 2,
    });
  }

  function applyProduct(el, product) {
    var amount = el.querySelector("[data-price-amount]");
    if (amount) {
      var f = formatMoney(product.price);
      if (f) amount.textContent = f;
    }
    var old = el.querySelector("[data-price-old]");
    if (old) {
      var fo = product.compare_at_price ? formatMoney(product.compare_at_price) : null;
      if (fo) { old.textContent = fo; old.hidden = false; }
      else { old.hidden = true; }
    }
    var cur = el.querySelector("[data-price-cur]");
    if (cur && product.currency) cur.textContent = product.currency;
  }

  function initCatalog() {
    var slots = document.querySelectorAll("[data-product]");
    if (!slots.length) return;
    var apiBase = (window.DCAuth && window.DCAuth.apiBase) || "http://localhost:8000";
    fetch(apiBase + "/products")
      .then(function (res) { return res.ok ? res.json() : Promise.reject(res.status); })
      .then(function (products) {
        var bySlug = {};
        products.forEach(function (p) { bySlug[p.slug] = p; });
        slots.forEach(function (el) {
          var p = bySlug[el.getAttribute("data-product")];
          if (p) applyProduct(el, p);
        });
      })
      .catch(function () {
        // Backend caído: se mantienen los precios del HTML como respaldo.
      });
  }

  /* ─── BOOT ─── */
  function boot() {
    safe(initNav, "initNav");
    safe(initSmoothScroll, "initSmoothScroll");
    safe(initHeroEntrance, "initHeroEntrance");
    safe(initMouseGradient, "initMouseGradient");
    safe(initInstagramStat, "initInstagramStat");
    safe(initReveals, "initReveals");
    safe(initCountUp, "initCountUp");
    safe(initScrollAnimations, "initScrollAnimations");
    safe(initCardTilt, "initCardTilt");
    safe(initContactForm, "initContactForm");
    safe(initCredits, "initCredits");
    safe(initCoverflow, "initCoverflow");
    safe(initLeadForm, "initLeadForm");
    safe(initCatalog, "initCatalog");
    safe(initVolBuy, "initVolBuy");
    safe(initPagoReturn, "initPagoReturn");
    safe(initConsola, "initConsola");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
