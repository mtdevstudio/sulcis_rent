/* Runtime della PREVIEW navigabile (vanilla JS). Replica i comportamenti del sito Next:
   preloader, hero a rombi, reveal, assi variabili allo scroll, marquee, territorio orizzontale,
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
    var fs = w * (mobile ? 0.3 : 0.27), ty = h * (mobile ? 0.42 : 0.5) + fs * 0.36, m = w * 0.03, cy = ty - fs * 0.36;
    var cells = [];
    for (var j = 0; j <= rows * 2; j++) {
      var y = (j / 2) * ch, off = j % 2 ? cw / 2 : 0;
      for (var i = 0; i <= cols; i++) { var x = i * cw + off; if (x > w + cw / 2) continue; cells.push({ x: x, y: y, d: Math.hypot(x - w / 2, y - cy) / Math.hypot(w / 2, h / 2) }); }
    }
    var static_ = RM;
    var clip = static_ ? '<rect width="' + w + '" height="' + h + '"/>' : cells.map(function (c) {
      return '<path data-d="' + c.d.toFixed(3) + '" data-cx="' + c.x.toFixed(1) + '" data-cy="' + c.y.toFixed(1) + '" d="M' + c.x + " " + (c.y - r) + "L" + (c.x + r) + " " + c.y + "L" + c.x + " " + (c.y + r) + "L" + (c.x - r) + " " + c.y + 'Z" transform="translate(' + c.x + " " + c.y + ") scale(0) translate(" + -c.x + " " + -c.y + ')"/>';
    }).join("");
    var t = function (fill) { return '<text x="' + m + '" y="' + ty + '" textLength="' + (w - m * 2) + '" lengthAdjust="spacingAndGlyphs" font-size="' + fs + '" class="display" style="font-variation-settings:&quot;wdth&quot; 72, &quot;wght&quot; 900" fill="' + fill + '">SULCIS</text>'; };
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

  /* ---------- assi variabili allo scroll ---------- */
  var ax = { x: 0, vx: 0, speed: 0, pt: 0, lastY: scrollY, run: false, w: 72, g: 850 };
  function axTick() {
    var y = scrollY, raw = Math.abs(y - ax.lastY); ax.lastY = y;
    ax.speed += (raw - ax.speed) * 0.18;
    var target = Math.min(ax.speed / 45, 1);
    ax.vx = (ax.vx + (target - ax.x) * 0.12) * 0.8; ax.vx -= Math.max(0, ax.pt - target) * 0.6; ax.pt = target; ax.x += ax.vx;
    var w = Math.min(125, Math.max(62, 72 + ax.x * 38)), g = Math.min(900, Math.max(450, 850 - ax.x * 380));
    if (Math.abs(w - ax.w) > 0.25 || Math.abs(g - ax.g) > 2) { ax.w = w; ax.g = g; html.style.setProperty("--wdth", w.toFixed(1)); html.style.setProperty("--wght", g.toFixed(0)); }
    if (Math.abs(ax.x) < 0.002 && Math.abs(ax.vx) < 0.002 && ax.speed < 0.05) { ax.run = false; html.style.setProperty("--wdth", "72"); html.style.setProperty("--wght", "850"); return; }
    requestAnimationFrame(axTick);
  }

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

  /* ---------- territorio orizzontale (desktop) ---------- */
  var terr = $("#territorio .relative.mt-16"), track = terr && terr.firstElementChild, horiz = false;
  function setupTerritory() {
    if (!terr || !track) return;
    horiz = W.innerWidth >= 1024 && !RM;
    var arts = $$("article", track);
    if (horiz) {
      track.style.cssText = "position:sticky;top:0;height:100vh;display:flex;flex-direction:row;width:max-content;will-change:transform";
      arts.forEach(function (a) { a.style.width = W.innerWidth >= 1280 ? "78vw" : "88vw"; a.style.minHeight = "0"; a.style.height = "100vh"; var h3 = a.querySelector("h3"); if (h3) h3.style.fontSize = "min(9.6vw,12rem)"; });
      terr.style.height = (track.scrollWidth - W.innerWidth + W.innerHeight) + "px";
    } else { track.style.cssText = ""; terr.style.height = ""; arts.forEach(function (a) { a.style.cssText = ""; var h3 = a.querySelector("h3"); if (h3) h3.style.fontSize = ""; }); }
    renderTerritory();
  }
  function renderTerritory() {
    if (!horiz || terr.offsetParent === null) return;
    var r = terr.getBoundingClientRect(), total = terr.offsetHeight - innerHeight;
    var p = Math.min(1, Math.max(0, -r.top / total));
    track.style.transform = "translate3d(" + (-p * (track.scrollWidth - innerWidth)) + "px,0,0)";
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
    renderHero(); renderTerritory();
    if (!RM && !ax.run) { ax.run = true; requestAnimationFrame(axTick); }
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
  var chips = $$('#flotta [role="group"] button');
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      var label = (c.childNodes[0] && c.childNodes[0].textContent || "").trim();
      chips.forEach(function (o) {
        var on = o === c; o.setAttribute("aria-pressed", on ? "true" : "false");
        ["border-trachite", "bg-trachite", "text-sand"].forEach(function (k) { o.classList.toggle(k, on); });
        ["border-sand-300", "bg-transparent", "text-trachite"].forEach(function (k) { o.classList.toggle(k, !on); });
      });
      $$("#flotta ul > li").forEach(function (li) {
        var cat = li.querySelector("article a span.eyebrow"); var t = cat ? cat.textContent.trim() : "";
        li.style.display = label === "Tutte" || t === label ? "" : "none";
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
    var links = [["#flotta", "Flotta"], ["#territorio", "Territorio"], ["#come-funziona", "Come funziona"], ["#faq", "FAQ"], ["#contatti", "Contatti"]];
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
    var titles = { home: "Sulcis Rent – Noleggio auto a San Giovanni Suergiu", privacy: "Privacy · Sulcis Rent", cookie: "Cookie · Sulcis Rent" };
    var h1 = $('[data-view="' + view + '"] h1');
    doc.title = titles[view] || ((h1 ? (h1.innerText || h1.textContent).replace(/\s+/g, " ").trim() : "Auto") + " · Sulcis Rent");
    setTimeout(function () { setupTerritory(); onScroll(); }, 60);
  }
  addEventListener("hashchange", route);
  addEventListener("resize", function () { buildHero(); setupTerritory(); });
  buildHero(); route(); setupTerritory(); onScroll();
  if (innerWidth < 768) setTimeout(function () { toast("Preview: foto e auto sono segnaposto"); }, 2200);
})();
