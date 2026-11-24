/* Runtime della PREVIEW navigabile (vanilla JS). Replica i comportamenti del sito Next:
   preloader, hero a rombi, reveal, marquee, tabellone Sardegna,
   header, contatti fissi, filtri flotta, modale «Prenota con noi», schede auto via #hash. */
(function () {
  "use strict";
  var doc = document, html = doc.documentElement, W = window;
  var RM = W.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FINE = W.matchMedia("(pointer: fine)").matches;
  var PHONE = "331 390 6076", TEL = "tel:+393313906076", WA = "393313906076";
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };

  function toast(msg) {
    var t = doc.createElement("div"); t.className = "pv-toast"; t.setAttribute("role", "status"); t.textContent = msg;
    doc.body.appendChild(t); setTimeout(function () { t.remove(); }, 2600);
  }

  /* ---------- preloader ---------- */
  var pl = $(".preloader");
  if (pl) {
    var done = function () {
      html.removeAttribute("data-pl");
      try { sessionStorage.setItem("sr_pl", "1"); } catch (e) {}
      pl.remove();
    };
    if (html.getAttribute("data-pl") === "on") {
      var t1 = setTimeout(function () {
        pl.style.transition = "clip-path .5s cubic-bezier(.77,0,.18,1) .2s";
        pl.style.clipPath = "inset(0 0 100% 0)";
        var p = pl.querySelector("p.display"); if (p) { p.style.transition = "transform .5s, opacity .5s, letter-spacing .5s"; p.style.transform = "scale(2.4)"; p.style.opacity = "0"; p.style.letterSpacing = ".2em"; }
      }, 1050);
      var t2 = setTimeout(done, 1750);
      pl.addEventListener("click", function () { clearTimeout(t1); clearTimeout(t2); done(); });
    } else done();
  }

  /* ---------- hero a rombi ---------- */
  var hero = $("section#top"), heroSvg = hero && hero.querySelector("svg");
  var diamonds = [];
  function buildHero() {
    if (!heroSvg) return;
    var r0 = heroSvg.getBoundingClientRect(); var w = Math.round(r0.width), h = Math.round(r0.height);
    var mobile = w < 700, cols = mobile ? 4 : 6, cw = w / cols, rows = Math.max(3, Math.round(h / cw)), ch = h / rows, r = Math.max(cw, ch) * 0.75;
    var fs = w * (mobile ? 0.2 : 0.19), ty = h * (mobile ? 0.42 : 0.5) + fs * 0.36, m = w * 0.03, cy = ty - fs * 0.36;
    var cells = [];
    for (var j = 0; j <= rows * 2; j++) {
      var y = (j / 2) * ch, off = j % 2 ? cw / 2 : 0;
      for (var i = 0; i <= cols; i++) { var x = i * cw + off; if (x > w + cw / 2) continue; cells.push({ x: x, y: y, d: Math.hypot(x - w / 2, y - cy) / Math.hypot(w / 2, h / 2) }); }
    }
    var static_ = RM;
    var clip = static_ ? '<rect width="' + w + '" height="' + h + '"/>' : cells.map(function (c) {
      return '<path data-d="' + c.d.toFixed(3) + '" data-cx="' + c.x.toFixed(1) + '" data-cy="' + c.y.toFixed(1) + '" d="M' + c.x + " " + (c.y - r) + "L" + (c.x + r) + " " + c.y + "L" + c.x + " " + (c.y + r) + "L" + (c.x - r) + " " + c.y + 'Z" transform="translate(' + c.x + " " + c.y + ") scale(0) translate(" + -c.x + " " + -c.y + ')"/>';
    }).join("");
    var t = function (fill) { return '<text x="' + m + '" y="' + ty + '" textLength="' + (w - m * 2) + '" lengthAdjust="spacingAndGlyphs" font-size="' + fs + '" class="display" style="font-variation-settings:&quot;wdth&quot; 72, &quot;wght&quot; 900" fill="' + fill + '">SARDEGNA</text>'; };
    heroSvg.setAttribute("viewBox", "0 0 " + w + " " + h);
    heroSvg.innerHTML = '<defs><clipPath id="hero-rombi">' + clip + "</clipPath></defs>" + t("rgb(var(--trachite))") +
      '<g clip-path="url(#hero-rombi)"><image href="__HERO_IMG__" width="' + w + '" height="' + h + '" preserveAspectRatio="xMidYMid slice"/><rect width="' + w + '" height="' + h + '" fill="rgb(var(--trachite))" opacity=".18"/>' + t("rgb(var(--sand))") + "</g>";
    diamonds = $$("[data-d]", heroSvg).map(function (el) { return { el: el, d: +el.dataset.d, cx: +el.dataset.cx, cy: +el.dataset.cy, last: -1 }; });
    if (static_) hero.style.height = "100svh";
    renderHero();
  }
  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function renderHero() {
    if (!hero || !diamonds.length || hero.offsetParent === null) return;
    var r = hero.getBoundingClientRect(); var total = hero.offsetHeight - innerHeight;
    var p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1;
    diamonds.forEach(function (g) {
      var s = Math.round(ease(Math.min(1, Math.max(0, (p * 1.05 - g.d * 0.5) / 0.5))) * 1000) / 1000;
      if (s === g.last) return; g.last = s;
      g.el.setAttribute("transform", "translate(" + g.cx + " " + g.cy + ") scale(" + s + ") translate(" + -g.cx + " " + -g.cy + ")");
    });
  }

  /* ---------- reveal e fade ---------- */
  var io = "IntersectionObserver" in W ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add(e.target.classList.contains("rv") ? "rv-done" : "fx-done"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -10% 0px" }) : null;
  $$(".rv").forEach(function (el) { $$(".rv-w>span", el).forEach(function (s, i) { s.style.transitionDelay = i * 45 + "ms"; }); io ? io.observe(el) : el.classList.add("rv-done"); });
  $$(".fx-fade").forEach(function (el) { io ? io.observe(el) : el.classList.add("fx-done"); });

  /* ---------- marquee ---------- */
  var mq = $(".marquee-track"), mqX = 0, mqDir = 1, mqBoost = 0, lastSY = scrollY;
  function mqTick() {
    if (mq) {
      var half = mq.scrollWidth / 2; mqBoost *= 0.94;
      mqX -= (0.6 + mqBoost) * mqDir; if (mqX <= -half) mqX += half; if (mqX > 0) mqX -= half;
      mq.style.transform = "translate3d(" + mqX + "px,0,0)";
    }
    requestAnimationFrame(mqTick);
  }
  if (!RM && mq) requestAnimationFrame(mqTick);


  /* ---------- sezione «Sardegna»: tabellone delle mete ---------- */
  var SARD = __SARD_DATA__;
  function setupSardinia() {
    var sec = $("#sardegna"); if (!sec) return;
    var list = sec.querySelector("ol"), count = sec.querySelector("p.mb-3 span:last-child");
    var mapSvg = sec.querySelector('svg[role="img"]'), fig = sec.querySelector("figure");
    var tabs = $$('[role="group"] button', sec);
    var zone = "tutte", active = null;
    var base = SARD.points["san-giovanni-suergiu"];
    var ENT = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
    var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return ENT[c]; }); };
    var HL = ["sant-antioco", "carloforte", "porto-pino", "masua"];
    function items() { return SARD.dests.filter(function (d) { return zone === "tutte" ? (d.zone !== "sudovest" || HL.indexOf(d.slug) >= 0) : d.zone === zone; }); }
    function renderMap(its) {
      if (!mapSvg) return;
      var pins = its.map(function (d) {
        var p = SARD.points[d.slug]; if (!p) return "";
        var on = active && d.slug === active.slug, r = on ? 9 : 5;
        return "<g>" + (on ? '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="18" fill="none" stroke="rgb(var(--rent-magenta))" stroke-width="1.5"/>' : "") +
          '<rect x="' + (p[0] - r) + '" y="' + (p[1] - r) + '" width="' + r * 2 + '" height="' + r * 2 + '" transform="rotate(45 ' + p[0] + " " + p[1] + ')" fill="' + (on ? "rgb(var(--rent-magenta))" : "rgb(var(--sand))") + '"/></g>';
      }).join("");
      mapSvg.innerHTML = '<use href="#sr-sard-outline" fill="none" stroke="rgb(var(--sand))" stroke-width="2.2" stroke-linejoin="round"/>' + pins;
      var lbl = sec.querySelector('svg[role="img"] + p'); if (lbl && active) lbl.lastChild.textContent = active.name;
    }
    function renderFig() {
      if (!fig || !active) return;
      var im = fig.querySelector("img"), tag = fig.querySelector("span.eyebrow"), cap = fig.querySelectorAll("figcaption span");
      if (im) { im.removeAttribute("srcset"); im.src = active.img; im.alt = active.name + " – foto segnaposto"; }
      if (tag) { tag.textContent = active.area; tag.className = "eyebrow absolute left-2 top-2 px-2 py-1 " + (active.night ? "bg-ochre text-trachite" : "bg-sand text-trachite"); }
      if (cap[0]) { cap[0].textContent = active.name; cap[0].className = "display block text-d-s" + (active.night ? " text-ochre" : ""); }
      if (cap[1]) cap[1].textContent = active.line;
    }
    function renderList() {
      var its = items(); if (!active || its.indexOf(active) < 0) active = its[0];
      list.innerHTML = its.map(function (d, i) {
        var on = d === active, acc = d.night ? "text-ochre" : "text-magenta-light";
        return '<li><button type="button" data-slug="' + d.slug + '" aria-pressed="' + on + '" class="group grid w-full grid-cols-[2.5rem_1fr_auto] items-baseline gap-3 py-4 text-left md:grid-cols-[3.5rem_1fr_auto] md:py-5">' +
          '<span class="eyebrow ' + (on ? acc : "text-sand/50") + '">' + ("0" + (i + 1)).slice(-2) + "</span>" +
          '<span class="display text-[clamp(2rem,5.4vw,4.75rem)] leading-[0.88] transition-colors ' + (on ? (d.night ? "text-ochre" : "text-sand") : "text-sand/45 group-hover:text-sand/80") + '">' + esc(d.name) + "</span>" +
          '<span class="eyebrow hidden text-right sm:block ' + (on ? "text-sand" : "text-sand/50") + '">' + esc(d.area) + "</span></button>" +
          '<p class="pb-4 pl-[2.5rem] pr-2 text-sand/80 lg:hidden' + (on ? "" : " hidden") + '">' + esc(d.line) + "</p></li>";
      }).join("");
      if (count) count.textContent = its.length + " mete";
      renderMap(its); renderFig();
    }
    function pick(slug) {
      var d = SARD.dests.filter(function (x) { return x.slug === slug; })[0];
      if (!d || d === active) return;
      var hadFocus = doc.activeElement && doc.activeElement.closest && doc.activeElement.closest("#sardegna ol");
      active = d; renderList();
      if (hadFocus) { var b = list.querySelector('[data-slug="' + slug + '"]'); if (b) b.focus(); }
    }
    list.addEventListener("click", function (e) { var b = e.target.closest("button[data-slug]"); if (b) pick(b.dataset.slug); });
    if (FINE) list.addEventListener("mouseover", function (e) { var b = e.target.closest("button[data-slug]"); if (b) pick(b.dataset.slug); });
    var zones = ["tutte", "sud", "sudovest", "ovest", "nord", "est"];
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () {
        zone = zones[i]; active = null;
        tabs.forEach(function (o, j) {
          var on = j === i; o.setAttribute("aria-pressed", on);
          ["border-magenta", "bg-magenta", "text-white"].forEach(function (k) { o.classList.toggle(k, on); });
          ["border-sand/30", "text-sand", "hover:border-sand"].forEach(function (k) { o.classList.toggle(k, !on); });
        });
        renderList();
      });
    });
    renderList();
  }

  /* ---------- header + contatti fissi ---------- */
  var header = $("header.fixed"), lastY = scrollY, hidden = false, scrolled = false;
  var dockBar = $$("div.fixed.inset-x-0.bottom-0")[0], dockFab = $$("a.fixed.bottom-6.right-6")[0];
  function onScroll() {
    var y = scrollY;
    if (header) {
      var s = y > 40; if (s !== scrolled) { scrolled = s; header.classList.toggle("border-transparent", !s); header.classList.toggle("bg-sand/80", !s); header.classList.toggle("border-trachite", s); header.classList.toggle("bg-sand", s); }
      var hd = y > 400 && y > lastY + 4 ? true : (y < lastY - 4 || y < 400 ? false : hidden);
      if (hd !== hidden) { hidden = hd; header.classList.toggle("-translate-y-full", hd); }
    }
    var end = $("[data-view]:not([hidden]) [data-hero-end]");
    var vis = end ? end.getBoundingClientRect().top < 0 : true;
    if (dockBar) { dockBar.classList.toggle("translate-y-full", !vis); dockBar.classList.toggle("translate-y-0", vis); }
    if (dockFab) { ["pointer-events-none", "translate-y-4", "opacity-0"].forEach(function (c) { dockFab.classList.toggle(c, !vis); }); dockFab.classList.toggle("opacity-100", vis); }
    if (Math.abs(y - lastSY) > 0) { mqDir = y > lastSY ? 1 : -1; mqBoost = Math.min(6, mqBoost + Math.abs(y - lastSY) / 40); lastSY = y; }
    lastY = y;
    renderHero();
  }
  addEventListener("scroll", onScroll, { passive: true });

  /* ---------- modale «Prenota con noi» ---------- */
  var lastFocus = null;
  function waLink(msg) { return "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg); }
  function openModal(car) {
    lastFocus = doc.activeElement;
    var msg = car ? "Ciao Sulcis Rent! Vorrei informazioni per noleggiare la " + car + ". Mi dite disponibilità e prezzo?" : "Ciao Sulcis Rent! Vorrei informazioni per noleggiare un'auto. Mi dite disponibilità e prezzo?";
    var wrap = doc.createElement("div");
    wrap.className = "fixed inset-0 z-modal flex items-end justify-center sm:items-center";
    wrap.innerHTML =
      '<div data-close class="absolute inset-0 bg-trachite/75"></div>' +
      '<div role="dialog" aria-modal="true" aria-labelledby="pv-mt" class="relative w-full max-w-xl bg-sand sm:mx-4" style="animation:sheetIn .45s cubic-bezier(.16,1,.3,1)">' +
      '<svg class="block h-3 w-full" aria-hidden="true"><defs><pattern id="pvsc" width="24" height="12" patternUnits="userSpaceOnUse"><rect width="24" height="12" fill="rgb(var(--rent-magenta))"/><rect x="0" y="0" width="9" height="12" fill="rgb(var(--sand))"/></pattern></defs><rect width="100%" height="100%" fill="url(#pvsc)"/></svg>' +
      '<div class="p-6 pb-8 sm:p-8"><div class="flex items-start justify-between gap-4"><div>' +
      (car ? '<p class="eyebrow text-magenta-deep">' + car.replace(/</g, "") + "</p>" : "") +
      '<h2 id="pv-mt" class="display mt-2 text-d-m">Prenota con noi</h2></div>' +
      '<button type="button" data-close aria-label="Chiudi" class="grid h-12 w-12 shrink-0 place-items-center border-filo border-trachite text-2xl leading-none hover:bg-trachite hover:text-sand">×</button></div>' +
      '<p class="mt-3 text-stone">Disponibilità e preventivo in pochi minuti. Siamo aperti h24.</p>' +
      '<div class="mt-6 grid gap-3 sm:grid-cols-2">' +
      '<a href="' + waLink(msg) + '" target="_blank" rel="noopener noreferrer" class="flex h-16 items-center justify-center gap-3 bg-magenta px-6 font-bold uppercase tracking-[0.08em] text-white hover:bg-magenta-deep">WhatsApp</a>' +
      '<a href="' + TEL + '" class="flex h-16 items-center justify-center gap-3 bg-trachite px-6 font-bold uppercase tracking-[0.08em] text-sand hover:bg-blue">Chiamaci</a></div>' +
      '<div class="mt-6 flex items-center justify-between gap-3 border-t-filo border-trachite pt-4">' +
      '<span class="display text-[clamp(1.9rem,7vw,2.6rem)] leading-none" style="font-variation-settings:&quot;wdth&quot; 75, &quot;wght&quot; 800">' + PHONE + "</span>" +
      '<button type="button" data-copy class="eyebrow h-11 border-filo border-trachite px-4 hover:bg-trachite hover:text-sand">Copia</button></div></div></div>';
    doc.body.appendChild(wrap);
    html.style.overflow = "hidden";
    var dlg = wrap.querySelector('[role="dialog"]'), focusables = function () { return $$("a[href],button", dlg); };
    focusables()[0].focus();
    function close() { wrap.remove(); html.style.overflow = ""; doc.removeEventListener("keydown", key); if (lastFocus) lastFocus.focus(); }
    function key(e) {
      if (e.key === "Escape") close();
      if (e.key === "Tab") { var f = focusables(), a = f[0], z = f[f.length - 1]; if (e.shiftKey && doc.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && doc.activeElement === z) { e.preventDefault(); a.focus(); } }
    }
    doc.addEventListener("keydown", key);
    $$("[data-close]", wrap).forEach(function (b) { b.addEventListener("click", close); });
    wrap.querySelector("[data-copy]").addEventListener("click", function (e) {
      var b = e.currentTarget;
      try { navigator.clipboard.writeText("3313906076").then(function () { b.textContent = "Copiato"; }, function () { b.textContent = "Copia a mano"; }); } catch (x) { b.textContent = "Copia a mano"; }
    });
  }
  doc.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("button, a");
    if (!el) return;
    var txt = (el.textContent || "").trim();
    if (el.tagName === "A" && el.hasAttribute("data-en")) { e.preventDefault(); toast("La versione inglese è nel sito reale (/en/): qui la preview è in italiano."); return; }
    if (el.tagName === "BUTTON" && /Prenota|Ajò|Voglio questa auto/i.test(txt) && !el.closest('[role="dialog"]')) {
      e.preventDefault();
      var art = el.closest("article"), car = null;
      if (art) { var h = art.querySelector("h3, h1"); if (h) car = h.textContent.replace(/\s+/g, " ").trim(); }
      openModal(car);
      return;
    }
    if (el.tagName === "BUTTON" && /Carica la mappa/i.test(txt)) { e.preventDefault(); W.open("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Sulcis Rent Autonoleggio, Località Santa Lucia, 09010 San Giovanni Suergiu"), "_blank"); toast("La mappa si apre su Google Maps (nel sito vero si carica qui al click)."); }
  });

  /* ---------- filtri flotta ---------- */
  $$('[data-view] [role="group"][aria-label="Filtra per categoria"]').forEach(function (group) {
  var scope = group.closest("section") || group.parentElement;
  var chips = $$("button", group);
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      var label = (c.childNodes[0] && c.childNodes[0].textContent || "").trim();
      chips.forEach(function (o) {
        var on = o === c; o.setAttribute("aria-pressed", on ? "true" : "false");
        ["border-trachite", "bg-trachite", "text-sand"].forEach(function (k) { o.classList.toggle(k, on); });
        ["border-sand-300", "bg-transparent", "text-trachite"].forEach(function (k) { o.classList.toggle(k, !on); });
      });
      $$("ul > li", scope).forEach(function (li) {
        var cat = li.querySelector("article a span.eyebrow"); if (!cat) return; var t = cat.textContent.trim();
        li.style.display = label === "Tutte" || t === label ? "" : "none";
      });
    });
  });
  });

  /* ---------- galleria scheda auto ---------- */
  doc.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest('ul[aria-label="Galleria"] button'); if (!b) return;
    var view = b.closest("[data-view]"), main = view && view.querySelector('[style*="car-hero"] img'); var im = b.querySelector("img");
    if (main && im) { main.src = im.src; main.alt = im.alt; }
    $$('ul[aria-label="Galleria"] button', view).forEach(function (o) { o.classList.toggle("border-magenta", o === b); o.classList.toggle("border-transparent", o !== b); });
  });

  /* ---------- menu mobile ---------- */
  var burger = $('[aria-controls="menu-mobile"]');
  if (burger) burger.addEventListener("click", function () {
    var m = $("#menu-mobile");
    if (m) { m.remove(); burger.setAttribute("aria-expanded", "false"); html.style.overflow = ""; return; }
    m = doc.createElement("div"); m.id = "menu-mobile"; m.className = "fixed inset-0 z-[49] flex flex-col bg-sand pt-20";
    var links = [["#flotta-completa", "Flotta"], ["#sardegna", "Sardegna"], ["#come-funziona", "Come funziona"], ["#faq", "FAQ"], ["#contatti", "Contatti"]];
    m.innerHTML = '<nav aria-label="Menu mobile" class="wrap flex-1 overflow-auto"><ul class="divide-y divide-sand-300 border-y border-sand-300">' + links.map(function (l, i) {
      return '<li><a href="' + l[0] + '" class="flex items-baseline justify-between py-4"><span class="display text-[clamp(2.5rem,12vw,4rem)] leading-none">' + l[1] + '</span><span class="eyebrow text-magenta-deep">0' + (i + 1) + "</span></a></li>";
    }).join("") + '</ul></nav><div class="wrap pb-8 pt-6"><button type="button" class="eyebrow flex h-16 w-full items-center justify-center gap-3 bg-magenta text-white">Ajò, si parte</button></div>';
    doc.body.appendChild(m); burger.setAttribute("aria-expanded", "true"); html.style.overflow = "hidden";
    m.addEventListener("click", function (e) { if (e.target.closest("a, button")) { m.remove(); burger.setAttribute("aria-expanded", "false"); html.style.overflow = ""; } });
  });

  /* ---------- cursore ---------- */
  if (FINE && !RM) {
    var dot = doc.createElement("div"); dot.className = "pointer-events-none fixed left-0 top-0 z-cursor"; dot.setAttribute("aria-hidden", "true");
    dot.innerHTML = '<div class="grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-magenta" style="width:12px;height:12px;transition:width .4s cubic-bezier(.77,0,.18,1),height .4s cubic-bezier(.77,0,.18,1),background-color .3s"><span class="eyebrow text-white" style="display:none"></span></div>';
    doc.body.appendChild(dot);
    var inner = dot.firstChild, lab = inner.firstChild, mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    addEventListener("pointermove", function (e) {
      mx = e.clientX; my = e.clientY;
      var t = e.target.closest && e.target.closest("[data-cursor]"); var l = t ? t.getAttribute("data-cursor") : null;
      inner.style.width = inner.style.height = l ? "96px" : "12px"; inner.style.backgroundColor = l === "Prenota" ? "rgb(var(--trachite))" : "rgb(var(--rent-magenta))";
      lab.style.display = l ? "" : "none"; lab.textContent = l || "";
    }, { passive: true });
    (function loop() { cx += (mx - cx) * 0.2; cy += (my - cy) * 0.2; dot.style.transform = "translate3d(" + cx + "px," + cy + "px,0)"; requestAnimationFrame(loop); })();
  }

  /* ---------- router a #hash: home, schede auto, pagine legali ---------- */
  function route() {
    var h = (location.hash || "#home").slice(1);
    var view = $('[data-view="' + h + '"]') ? h : "home";
    $$("[data-view]").forEach(function (v) { v.hidden = v.getAttribute("data-view") !== view; });
    if (view !== "home") { scrollTo(0, 0); }
    else if (h !== "home") { var el = doc.getElementById(h); if (el) setTimeout(function () { el.scrollIntoView({ behavior: RM ? "auto" : "smooth" }); }, 30); }
    else if (route.started) scrollTo(0, 0);
    route.started = true;
    var titles = { home: "Sulcis Rent – Noleggio auto in Sardegna", "flotta-completa": "La flotta · Sulcis Rent", privacy: "Privacy · Sulcis Rent", cookie: "Cookie · Sulcis Rent", "crediti-foto": "Crediti foto · Sulcis Rent" };
    var h1 = $('[data-view="' + view + '"] h1');
    doc.title = titles[view] || ((h1 ? (h1.innerText || h1.textContent).replace(/\s+/g, " ").trim() : "Auto") + " · Sulcis Rent");
    setTimeout(onScroll, 60);
  }
  addEventListener("hashchange", route);
  addEventListener("resize", buildHero);
  buildHero(); setupSardinia(); route(); onScroll();
  if (innerWidth < 768) setTimeout(function () { toast("Preview: le foto sono di esempio"); }, 2200);
})();
