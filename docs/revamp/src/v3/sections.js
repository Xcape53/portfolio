  // ================= v3: wszystko pod hero =================
  const MEDIA = { turf: { v: "%%VID_turf%%", p: "%%IMG_turfPoster%%" }, inv: { v: "%%VID_inv%%", p: "%%IMG_invPoster%%" }, labinc: { i: "%%IMG_labinc%%" }, passmgr: { i: "%%IMG_passmgr%%" },
    basys: { i: "%%IMG_basys%%" }, axi: { i: "%%IMG_axi%%" }, cnc: { i: "%%IMG_cnc%%" } };
  const ST = hasGsap && window.ScrollTrigger;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  // fala prostokątna z 4 harmonicznych, ta sama co w separatorze oscyloskopu
  const sq = (a) => (4 / Math.PI) * (Math.sin(a) + Math.sin(3 * a) / 3 + Math.sin(5 * a) / 5 + Math.sin(7 * a) / 7);

  // pole węzłów za całą stroną: po hero przygasa
  onTick(() => { const r = $(".hero").getBoundingClientRect(); field.style.opacity = String(clamp(0.45 + (r.bottom / innerHeight) * 0.55, 0.45, 1)); });

  // ---------- zdanie-konspekt: linie wysuwają się na swoje wcięcie, słowa nabierają koloru ----------
  const outline = $(".outline"), lines = [...outline.querySelectorAll(".ln")];
  const words = [];
  lines.forEach((ln) => {
    const tgt = ln.querySelector(".g") || ln;
    tgt.innerHTML = tgt.textContent.split(" ").map((w) => '<span class="w">' + w + "</span>").join(" ");
    words.push(...tgt.querySelectorAll(".w"));
  });
  if (ST && !RM) {
    lines.forEach((ln) => { const d = +ln.dataset.d; if (d) gsap.set(ln, { x: () => -(innerWidth <= 900 ? 16 : outline.clientWidth / 12) * d }); });
    gsap.set(words, { opacity: 0.32 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: outline, start: "top 82%", end: "bottom 45%", scrub: 0.6, invalidateOnRefresh: true } });
    lines.forEach((ln, i) => { if (+ln.dataset.d) tl.to(ln, { x: 0, ease: "power2.out", duration: 1 }, i * 0.35); });
    tl.to(words, { opacity: 1, stagger: 0.08, ease: "none", duration: 0.4 }, 0);
  }

  // ---------- sygnatura: ekran włącza się z węzła ----------
  const switches = [...document.querySelectorAll(".switch")];
  function edgePoly(open, phase) {
    // górna i dolna krawędź jako gasnąca fala prostokątna; open 0..1
    const pts = [], N = 48, amp = (1 - open) * 7 + 0.0001, half = open * 50;
    for (let i = 0; i <= N; i++) { const x = i / N * 100, y = 50 - half - amp * sq(i / N * Math.PI * 8 + phase) * 0.5; pts.push(x.toFixed(2) + "% " + clamp(y, -2, 50).toFixed(2) + "%"); }
    for (let i = N; i >= 0; i--) { const x = i / N * 100, y = 50 + half + amp * sq(i / N * Math.PI * 8 + phase) * 0.5; pts.push(x.toFixed(2) + "% " + clamp(y, 50, 102).toFixed(2) + "%"); }
    return "polygon(" + pts.join(",") + ")";
  }
  switches.forEach((sw) => {
    const screen = sw.querySelector(".screen"), n0 = sw.querySelector(".node-0"), ta = sw.querySelector(".trace.a"), tb = sw.querySelector(".trace.b"), vid = sw.querySelector("video");
    const state = { p: 0, done: false };
    const apply = (p) => {
      const nodeIn = clamp(p / 0.12, 0, 1), line = clamp((p - 0.12) / 0.28, 0, 1), open = clamp((p - 0.4) / 0.42, 0, 1), settle = clamp((p - 0.3) / 0.7, 0, 1), e = 1 - Math.pow(1 - settle, 3);
      n0.style.scale = String(nodeIn * (1 - clamp((open - 0.2) / 0.3, 0, 1)));
      ta.style.transform = "scaleX(" + line + ")"; tb.style.transform = "scaleX(" + line + ")";
      const h = screen.offsetHeight, off = open * h / 2;
      ta.style.top = (h / 2 - off) + "px"; tb.style.top = (h / 2 + off) + "px";
      const fade = String(1 - clamp((open - 0.75) / 0.25, 0, 1)); ta.style.opacity = fade; tb.style.opacity = fade;
      screen.style.clipPath = open >= 1 ? "none" : (open <= 0 ? "inset(50% 0 50% 0)" : edgePoly(open, p * 20));
      screen.style.transform = "translateY(" + (48 * (1 - e)) + "px) rotateX(" + (14 * (1 - e)) + "deg) scale(" + (0.94 + 0.06 * e) + ")";
      sw.style.setProperty("--glow", String(0.55 * clamp((open - 0.3) / 0.7, 0, 1)));
      if (vid && open > 0.5 && !vid._userPaused && vid.paused) vid.play().catch(() => {});
    };
    if (!ST || RM) { state.done = true; apply(1); return; }
    apply(0);
    if (fine) {
      ScrollTrigger.create({ trigger: sw, start: "top 88%", end: "top 30%", scrub: 0.6,
        onUpdate: (self) => { if (state.done) return; state.p = Math.max(state.p, self.progress); apply(state.p); if (state.p >= 0.999) { state.done = true; apply(1); } } });
    } else {
      ScrollTrigger.create({ trigger: sw, start: "top 65%", once: true, onEnter: () => { const o = { p: 0 }; gsap.to(o, { p: 1, duration: 1.1, ease: "expo.inOut", onUpdate: () => apply(o.p), onComplete: () => { state.done = true; apply(1); } }); } });
    }
    // po otwarciu: delikatny przechył do kursora
    if (fine) {
      const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
      sw.addEventListener("pointermove", (ev) => { if (!state.done) return; const r = sw.getBoundingClientRect(); tilt.tx = ((ev.clientX - r.left) / r.width - 0.5) * 2; tilt.ty = ((ev.clientY - r.top) / r.height - 0.5) * 2; sw.style.setProperty("--glow", "0.7"); });
      sw.addEventListener("pointerleave", () => { tilt.tx = 0; tilt.ty = 0; if (state.done) sw.style.setProperty("--glow", "0.55"); });
      onTick(() => { if (!state.done) return; tilt.x = lerp(tilt.x, tilt.tx, 0.08); tilt.y = lerp(tilt.y, tilt.ty, 0.08); if (Math.abs(tilt.x) + Math.abs(tilt.y) > 0.001) screen.style.transform = "rotateY(" + (tilt.x * 2) + "deg) rotateX(" + (-tilt.y * 2) + "deg)"; });
    }
    // zrzuty: obraz przesuwa się w kadrze
    const img = screen.querySelector("img");
    if (img && !RM) onTick(() => { const r = sw.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return; const c = clamp(1 - (r.top + r.height) / (innerHeight + r.height), 0, 1); screen.style.setProperty("--pan", (c * 100).toFixed(1) + "%"); });
    // wideo: pauza poza ekranem, przycisk pauzy
    if (vid) {
      const ctl = sw.parentElement.querySelector("[data-video-ctl]");
      new IntersectionObserver(([en]) => { if (!en.isIntersecting) vid.pause(); else if (state.done && !vid._userPaused) vid.play().catch(() => {}); }, { threshold: 0.3 }).observe(sw);
      ctl.addEventListener("click", () => { if (vid.paused) { vid._userPaused = false; vid.play().catch(() => {}); ctl.textContent = "Pause"; } else { vid._userPaused = true; vid.pause(); ctl.textContent = "Play"; } });
      if (RM) { vid.removeAttribute("autoplay"); ctl.textContent = "Play"; vid._userPaused = true; }
    }
    screen.addEventListener("click", () => openLb(screen));
    const op = sw.parentElement.querySelector("[data-open]"); if (op) op.addEventListener("click", () => openLb(screen));
  });

  // lightbox
  const lb = document.createElement("div"); lb.className = "lb"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-label", "Full size view"); document.body.appendChild(lb);
  function openLb(screen) { const m = screen.querySelector("img, video"); lb.innerHTML = ""; const c = m.cloneNode(); if (c.tagName === "VIDEO") { c.muted = true; c.loop = true; c.autoplay = true; c.playsInline = true; } lb.appendChild(c); lb.classList.add("on"); }
  lb.addEventListener("click", () => lb.classList.remove("on"));
  addEventListener("keydown", (e) => { if (e.key === "Escape") lb.classList.remove("on"); });

  // ---------- więcej prac: podgląd z prawdziwym wideo ----------
  const peek = document.createElement("div"); peek.className = "peek"; peek.setAttribute("aria-hidden", "true"); document.body.appendChild(peek);
  let pk = { x: 0, y: 0 }, peekOn = false;
  document.querySelectorAll("[data-peek]").forEach((a) => {
    const show = () => {
      const m = MEDIA[a.dataset.peek]; if (!m || !fine) return;
      peek.innerHTML = m.v ? '<video muted loop playsinline autoplay poster="' + m.p + '" src="' + m.v + '"></video>' : '<img alt="" src="' + m.i + '">';
      const v = peek.querySelector("video"); if (v) v.play().catch(() => {});
      peekOn = true; requestAnimationFrame(() => peek.classList.add("on"));
    };
    const hide = () => { peekOn = false; peek.classList.remove("on"); const v = peek.querySelector("video"); if (v) v.pause(); };
    a.addEventListener("pointerenter", show); a.addEventListener("pointerleave", hide);
    a.addEventListener("focus", () => { const r = a.getBoundingClientRect(); ptr.px = r.left + r.width * 0.55; ptr.py = r.top; show(); }); a.addEventListener("blur", hide);
  });
  onTick(() => {
    if (!peekOn) return;
    pk.x = lerp(pk.x, Math.max(ptr.px + 60, innerWidth * 0.6), 0.16); pk.y = lerp(pk.y, ptr.py - peek.offsetHeight / 2, 0.16);
    peek.style.transform = "translate3d(" + clamp(pk.x, 8, innerWidth - peek.offsetWidth - 8) + "px," + clamp(pk.y, 8, innerHeight - peek.offsetHeight - 8) + "px,0)";
  });

  // ---------- o mnie: zdjęcia elektroniki po najechaniu na słowa ----------
  const hp = document.createElement("div"); hp.className = "hoverpic"; hp.setAttribute("aria-hidden", "true"); document.body.appendChild(hp);
  document.querySelectorAll("[data-pic]").forEach((a) => {
    a.addEventListener("click", (e) => e.preventDefault());
    const show = () => { const r = a.getBoundingClientRect(); hp.innerHTML = '<img alt="" src="' + MEDIA[a.dataset.pic].i + '">'; hp.style.transform = "translate3d(" + clamp(r.left, 8, innerWidth - 268) + "px," + clamp(r.top - 190, 8, innerHeight - 190) + "px,0)"; hp.classList.add("on"); };
    a.addEventListener("pointerenter", show); a.addEventListener("focus", show);
    a.addEventListener("pointerleave", () => hp.classList.remove("on")); a.addEventListener("blur", () => hp.classList.remove("on"));
  });

  // ---------- oscyloskopy ----------
  document.querySelectorAll("[data-osc]").forEach((osc) => {
    const oc = osc.getContext("2d"); watch(osc); let mx = -1e4, auto = !fine;
    osc.parentElement.addEventListener("pointermove", (e) => { mx = e.clientX - osc.getBoundingClientRect().left; });
    osc.parentElement.addEventListener("pointerleave", () => { mx = -1e4; });
    onTick((t) => {
      if (!isOn(osc)) return;
      const w = osc.clientWidth, h = osc.clientHeight; fit(osc, w, h);
      oc.setTransform(DPR, 0, 0, DPR, 0, 0); oc.clearRect(0, 0, w, h);
      const g = oc.createLinearGradient(0, 0, w, 0); g.addColorStop(0, "#2c7ffe"); g.addColorStop(1, "#642efd");
      oc.strokeStyle = g; oc.lineWidth = 2; oc.shadowColor = "#2c7ffe"; oc.shadowBlur = 10; oc.beginPath();
      const ph = RM ? 0 : t * 1.4, k = Math.PI * 2 / 220, cx = auto ? (RM ? -1e4 : (Math.sin(t * 0.35) * 0.4 + 0.5) * w) : mx;
      for (let X = 0; X <= w; X += 2) {
        const a = X * k - ph, m = clamp(1 - Math.abs(X - cx) / 260, 0, 1), Y = h / 2 - (Math.sin(a) * (1 - m) + sq(a) * m * 0.8) * h * 0.32;
        X ? oc.lineTo(X, Y) : oc.moveTo(X, Y);
      }
      oc.stroke(); oc.shadowBlur = 0;
    });
  });

  // ---------- reveal nagłówków (maska) ----------
  if (ST && !RM) {
    gsap.utils.toArray(".sec-top h2, .case h3, .more__top h2, .about h2, .case__lead").forEach((el) => gsap.from(el, { yPercent: 30, opacity: 0, duration: 1.15, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } }));
    gsap.utils.toArray(".parts li, .it").forEach((el) => gsap.from(el, { x: -18, opacity: 0, duration: 0.8, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 92%", once: true } }));
    ScrollTrigger.create({ trigger: ".talk", start: "top 60%", once: true, onEnter: () => { if (!fine) $(".talk").classList.add("fill"); } });
  }

  // ---------- kontakt: symbol odrasta wokół EMAIL ME ----------
  (function bookend() {
    const NS = "http://www.w3.org/2000/svg", mz = $("#magzone");
    const s = document.createElementNS(NS, "svg"); s.setAttribute("viewBox", "-420 -420 840 840"); s.setAttribute("aria-hidden", "true");
    s.style.cssText = "position:absolute;left:50%;top:50%;width:420px;height:420px;translate:-50% -50%;z-index:-1;pointer-events:none;overflow:visible;filter:drop-shadow(0 0 10px rgba(44,127,254,.6)) drop-shadow(0 0 26px rgba(100,46,253,.4));opacity:.55";
    s.innerHTML = '<defs><linearGradient id="bg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2c7ffe"/><stop offset="1" stop-color="#642efd"/></linearGradient></defs>';
    const g = document.createElementNS(NS, "g"); s.appendChild(g);
    const mkp = (from, to) => { let d = "M" + P[0].join(" "); for (let i = from; i <= to; i++) d += " L" + P[i].join(" "); const e = document.createElementNS(NS, "path"); e.setAttribute("d", d); e.setAttribute("fill", "none"); e.setAttribute("stroke", "url(#bg2)"); e.setAttribute("stroke-width", "22"); e.setAttribute("stroke-linecap", "round"); e.setAttribute("stroke-linejoin", "round"); e.setAttribute("pathLength", "1"); e.setAttribute("stroke-dasharray", "1"); e.setAttribute("stroke-dashoffset", RM ? "0" : "1"); g.appendChild(e); return e; };
    const pa = mkp(1, 26), pb = mkp(27, 42);
    mz.style.isolation = "isolate"; mz.prepend(s);
    if (ST && !RM) gsap.to([pa, pb], { attr: { "stroke-dashoffset": 0 }, ease: "none", scrollTrigger: { trigger: "#contact", start: "top 75%", end: "center center", scrub: 0.8 } });
    onTick((t) => { if (!RM) g.setAttribute("transform", "rotate(" + (t * 4 % 360).toFixed(2) + ")"); });
  })();

  // ---------- magnetyczny przycisk ----------
  const mz = $("#magzone"), mag = $("#mag"), lab = mag.querySelector("span");
  if (!RM && fine) {
    const st = { x: 0, y: 0, tx: 0, ty: 0 };
    mz.addEventListener("pointermove", (e) => { const r = mag.getBoundingClientRect(); st.tx = clamp((e.clientX - r.left - r.width / 2) * 0.3, -18, 18); st.ty = clamp((e.clientY - r.top - r.height / 2) * 0.3, -18, 18); });
    mz.addEventListener("pointerleave", () => { st.tx = 0; st.ty = 0; });
    onTick(() => { st.x = lerp(st.x, st.tx, 0.15); st.y = lerp(st.y, st.ty, 0.15); mag.style.transform = "translate3d(" + st.x + "px," + st.y + "px,0)"; lab.style.transform = "translate3d(" + st.x * 0.5 + "px," + st.y * 0.5 + "px,0)"; });
  }
  const cp = $("#copy");
  cp.addEventListener("click", () => {
    const done = () => { cp.textContent = "Copied"; setTimeout(() => (cp.textContent = "Copy"), 1600); };
    try { navigator.clipboard.writeText("jeleniewicz@op.pl").then(done, () => getSelection().selectAllChildren($("#mail"))); } catch (e) { getSelection().selectAllChildren($("#mail")); }
  });
  if (ST) { addEventListener("load", () => ScrollTrigger.refresh()); if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh()); }
