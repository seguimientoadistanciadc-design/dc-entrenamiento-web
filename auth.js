/* ════════════════════════════════════════════
   DcEntrenamiento — Autenticación de usuario (Fase 1)
   Conecta el frontend con el backend FastAPI:
   registro, login, sesión persistente y peticiones autenticadas.
   Expone window.DCAuth para fases futuras (Mi Consola, compras).
   ════════════════════════════════════════════ */
(function () {
  "use strict";

  // Base de la API. Cambiar aquí (o definir window.DC_CONFIG.apiBase antes de
  // cargar este script) al desplegar el backend en producción.
  var API_BASE =
    (window.DC_CONFIG && window.DC_CONFIG.apiBase) || "http://localhost:8000";

  var TOKEN_KEY = "dc_token";
  var currentUser = null;

  /* ─── Token en localStorage ─── */
  function getToken() { try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; } }
  function setToken(t) { try { localStorage.setItem(TOKEN_KEY, t); } catch (e) {} }
  function clearToken() { try { localStorage.removeItem(TOKEN_KEY); } catch (e) {} }

  /* ─── Llamadas al backend ─── */
  function ApiError(status, message) { this.status = status; this.message = message; }

  // Mensaje legible ante un fallo de red (backend apagado, sin internet, CORS).
  var NETWORK_MSG = "No pudimos conectar con el servidor. Inténtalo de nuevo en unos minutos.";

  async function apiRegister(payload) {
    var res;
    try {
      res = await fetch(API_BASE + "/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (e) { throw new ApiError(0, NETWORK_MSG); }
    var data = await res.json().catch(function () { return {}; });
    if (!res.ok) {
      var msg = res.status === 409
        ? "Ese correo ya está registrado. Inicia sesión."
        : (data.detail || "No se pudo crear la cuenta.");
      throw new ApiError(res.status, typeof msg === "string" ? msg : "No se pudo crear la cuenta.");
    }
    return data;
  }

  async function apiLogin(email, password) {
    var body = new URLSearchParams();
    body.set("username", email);
    body.set("password", password);
    var res;
    try {
      res = await fetch(API_BASE + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
    } catch (e) { throw new ApiError(0, NETWORK_MSG); }
    var data = await res.json().catch(function () { return {}; });
    if (!res.ok) {
      var msg = res.status === 401
        ? "Correo o contraseña incorrectos."
        : (data.detail || "No se pudo iniciar sesión.");
      throw new ApiError(res.status, typeof msg === "string" ? msg : "No se pudo iniciar sesión.");
    }
    setToken(data.access_token);
    return data;
  }

  async function apiMe() {
    var t = getToken();
    if (!t) return null;
    var res;
    try {
      res = await fetch(API_BASE + "/auth/me", { headers: { Authorization: "Bearer " + t } });
    } catch (e) { return null; }
    if (res.status === 401) { clearToken(); return null; }
    if (!res.ok) return null;
    return res.json().catch(function () { return null; });
  }

  // Helper reutilizable para fases futuras: peticiones con el token adjunto.
  function fetchAuthed(path, opts) {
    opts = opts || {};
    var t = getToken();
    var headers = Object.assign({}, opts.headers || {});
    if (t) headers.Authorization = "Bearer " + t;
    return fetch(API_BASE + path, Object.assign({}, opts, { headers: headers }));
  }

  /* ─── Estado de UI del nav ─── */
  function firstName(name) { return (name || "").trim().split(/\s+/)[0] || "Mi Cuenta"; }
  function initial(user) {
    var src = (user.full_name || user.email || "U").trim();
    return src.charAt(0).toUpperCase();
  }
  function setAll(selector, text) {
    document.querySelectorAll(selector).forEach(function (el) { el.textContent = text; });
  }

  function renderAuthState(user) {
    currentUser = user || null;
    var acc = document.getElementById("nav-account");
    if (acc) {
      if (user) {
        acc.classList.add("is-authed");
        setAll("[data-user-name]", firstName(user.full_name));
        setAll("[data-user-email]", user.email);
        setAll("[data-user-initial]", initial(user));
      } else {
        acc.classList.remove("is-authed", "is-open");
      }
    }
    // Notifica a otros módulos (Mi Consola, etc.).
    document.dispatchEvent(new CustomEvent("dc-auth-change", { detail: { user: currentUser } }));
  }

  /* ─── Toast ─── */
  var toastTimer = null;
  function toast(msg) {
    var el = document.getElementById("dc-toast");
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    requestAnimationFrame(function () { el.classList.add("is-visible"); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove("is-visible");
      setTimeout(function () { el.hidden = true; }, 300);
    }, 3200);
  }

  /* ─── Modal ─── */
  var modal, lastFocus;

  function openModal(tab) {
    modal = modal || document.getElementById("auth-modal");
    if (!modal) return;
    lastFocus = document.activeElement;
    switchTab(tab || "login");
    clearErrors();
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("auth-open");
    var input = modal.querySelector('.auth-form:not([hidden]) input');
    if (input) setTimeout(function () { input.focus(); }, 50);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("auth-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function switchTab(tab) {
    if (!modal) modal = document.getElementById("auth-modal");
    if (!modal) return;
    modal.querySelectorAll(".auth-tab").forEach(function (b) {
      var active = b.getAttribute("data-auth-tab") === tab;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-selected", active ? "true" : "false");
    });
    modal.querySelectorAll(".auth-form").forEach(function (f) {
      f.hidden = f.getAttribute("data-auth-panel") !== tab;
    });
    clearErrors();
  }

  function showError(form, msg) {
    var el = form.querySelector("[data-auth-error]");
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
  }
  function clearErrors() {
    document.querySelectorAll("[data-auth-error]").forEach(function (el) {
      el.hidden = true; el.textContent = "";
    });
  }
  function setLoading(form, on) {
    var btn = form.querySelector(".auth-submit");
    if (btn) btn.classList.toggle("is-loading", !!on);
  }

  /* ─── Handlers de formularios ─── */
  async function handleLogin(e) {
    e.preventDefault();
    var form = e.currentTarget;
    clearErrors();
    if (!form.reportValidity()) return;
    var email = form.querySelector('[name="email"]').value.trim();
    var password = form.querySelector('[name="password"]').value;
    setLoading(form, true);
    try {
      await apiLogin(email, password);
      var user = await apiMe();
      renderAuthState(user);
      closeModal();
      form.reset();
      toast("¡Hola de nuevo, " + firstName(user && user.full_name) + "!");
    } catch (err) {
      showError(form, err.message || "No se pudo iniciar sesión.");
    } finally {
      setLoading(form, false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    var form = e.currentTarget;
    clearErrors();
    if (!form.reportValidity()) return;
    var full_name = form.querySelector('[name="full_name"]').value.trim();
    var email = form.querySelector('[name="email"]').value.trim();
    var password = form.querySelector('[name="password"]').value;
    setLoading(form, true);
    try {
      await apiRegister({ full_name: full_name, email: email, password: password });
      // Tras registrar, inicia sesión automáticamente para una experiencia fluida.
      await apiLogin(email, password);
      var user = await apiMe();
      renderAuthState(user);
      closeModal();
      form.reset();
      toast("¡Cuenta creada! Bienvenido, " + firstName(full_name) + ".");
    } catch (err) {
      // Si el correo ya existe, llevamos al usuario a la pestaña de login.
      if (err.status === 409) {
        switchTab("login");
        var loginForm = document.getElementById("login-form");
        showError(loginForm, err.message);
        var le = loginForm.querySelector('[name="email"]');
        if (le) le.value = email;
      } else {
        showError(form, err.message || "No se pudo crear la cuenta.");
      }
    } finally {
      setLoading(form, false);
    }
  }

  function logout() {
    clearToken();
    renderAuthState(null);
    toast("Sesión cerrada.");
  }

  /* ─── Cableado de eventos ─── */
  function wire() {
    modal = document.getElementById("auth-modal");
    var acc = document.getElementById("nav-account");

    // Delegación global para abrir modal / cambiar de pestaña / cerrar / logout.
    document.addEventListener("click", function (e) {
      var openBtn = e.target.closest("[data-auth-open]");
      if (openBtn) { e.preventDefault(); openModal("login"); return; }

      var tabBtn = e.target.closest("[data-auth-tab]");
      if (tabBtn) { e.preventDefault(); switchTab(tabBtn.getAttribute("data-auth-tab")); return; }

      var closeBtn = e.target.closest("[data-auth-close]");
      if (closeBtn) { e.preventDefault(); closeModal(); return; }

      var logoutBtn = e.target.closest("[data-auth-logout]");
      if (logoutBtn) { e.preventDefault(); if (acc) acc.classList.remove("is-open"); logout(); return; }

      // Menú desplegable de cuenta.
      var toggle = e.target.closest("[data-account-toggle]");
      if (toggle && acc) {
        e.preventDefault();
        var open = acc.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        return;
      }

      // "Mi Consola" — abre el panel privado (lo registra main.js).
      var consola = e.target.closest("[data-nav-consola]");
      if (consola) {
        e.preventDefault();
        if (acc) acc.classList.remove("is-open");
        if (window.DCConsola && window.DCConsola.open) {
          window.DCConsola.open();
        } else {
          toast("Tu consola estará disponible en un momento.");
        }
        return;
      }

      // Clic fuera del menú de cuenta lo cierra.
      if (acc && acc.classList.contains("is-open") && !e.target.closest("#nav-account")) {
        acc.classList.remove("is-open");
      }
    });

    // Escape cierra el modal.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal && modal.classList.contains("is-open")) closeModal();
    });

    var loginForm = document.getElementById("login-form");
    var registerForm = document.getElementById("register-form");
    if (loginForm) loginForm.addEventListener("submit", handleLogin);
    if (registerForm) registerForm.addEventListener("submit", handleRegister);
  }

  /* ─── Arranque: restaura sesión si hay token ─── */
  async function boot() {
    wire();
    if (getToken()) {
      var user = await apiMe();
      renderAuthState(user);
    } else {
      renderAuthState(null);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  /* ─── API pública para otras fases ─── */
  window.DCAuth = {
    apiBase: API_BASE,
    getToken: getToken,
    getUser: function () { return currentUser; },
    isAuthenticated: function () { return !!getToken(); },
    fetchAuthed: fetchAuthed,
    openModal: openModal,
    closeModal: closeModal,
    logout: logout,
    toast: toast,
  };
})();
