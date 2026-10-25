  // ================= v5: sekcje obecnej strony, animacje projektów =================
  const VIDS = { seesky: "%%VID_seesky%%", seeskyTracking: "%%VID_seeskyTracking%%" };
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const ease = (x) => 1 - Math.pow(1 - clamp(x, 0, 1), 3);
  const easeIO = (x) => { x = clamp(x, 0, 1); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  const smooth = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
  onTick(() => { const r = $(".hero").getBoundingClientRect(); field.style.opacity = String(clamp(0.4 + (r.bottom / innerHeight) * 0.6, 0.4, 1)); });

  // ---------- odsłony (IntersectionObserver, bez ukrywania treści bez JS) ----------
  if (!RM) {
    root.classList.add("js-anim");
    const rio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); rio.unobserve(e.target); } }), { rootMargin: "0px 0px -10% 0px" });
    document.querySelectorAll(".reveal").forEach((el) => rio.observe(el));
  } else document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));

  // ---------- paski postępu: wypełnienie i procent odliczają razem, gdy wpis wjedzie na ekran ----------
  document.querySelectorAll(".prog").forEach((pg) => {
    let v = +pg.dataset.v; const pct = pg.querySelector(".prog__pct"), entry = pg.closest(".reveal") || pg;
    // studia: zaliczone semestry + część bieżącego semestru, która już minęła (liczone z dat)
    if (pg.dataset.from) { const a = Date.parse(pg.dataset.from), b = Date.parse(pg.dataset.to), f = clamp((Date.now() - a) / (b - a), 0, 1); v = Math.round((+pg.dataset.done + f) / +pg.dataset.of * 100); }
    let t0 = null;
    const set = (p) => { pg.style.setProperty("--p", p.toFixed(2)); const s = Math.round(p) + "%"; if (pct.textContent !== s) pct.textContent = s; };
    if (RM) { set(v); return; }
    set(0); watch(pg);
    onTick((t) => {
      if (t0 === null) { if (!entry.classList.contains("in") || !isOn(pg)) return; t0 = t + 0.25; }
      const k = clamp((t - t0) / 1.6, 0, 1); set(easeIO(k) * v);
    });
  });

  // ---------- "What I build": okna na pulpicie, fokus przechodzi z okna na okno ----------
  const desk = $("#desk");
  if (desk) {
    const wins = [...desk.querySelectorAll(".win")], ORD = [4, 1, 6, 0, 3, 7, 2, 5];
    let z = 10, oi = 0, focusAt = -9;
    const focus = (i, t) => { wins.forEach((w) => w.classList.toggle("focus", w === wins[i])); wins[i].style.zIndex = String(++z); focusAt = t; };
    wins.forEach((w, i) => (w.style.zIndex = String(i + 1)));
    focus(ORD[0], -9); watch(desk);
    let next = 2.4;
    onTick((t) => {
      if (!isOn(desk)) return;
      if (!RM && t > next) { oi = (oi + 1) % ORD.length; focus(ORD[oi], t); next = t + 2.4; }
      if (RM) return;
      const r = desk.getBoundingClientRect(), c = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      wins.forEach((w) => {
        const d = parseFloat(w.style.getPropertyValue("--d")) || 0.5, f = w.classList.contains("focus") ? 1 + 0.035 * (1 - ease((t - focusAt) / 0.7)) : 1;
        w.style.transform = "translate3d(" + (ptr.sx * d * 10).toFixed(2) + "px," + (c * d * -60).toFixed(2) + "px,0) scale(" + f.toFixed(4) + ")";
      });
    });
  }

  // ---------- od układu do kodu: aktywna warstwa (scroll albo najechanie) ----------
  const layersEl = $(".layers");
  if (layersEl) {
    const rows = [...layersEl.querySelectorAll(".layer")], media = [...layersEl.querySelectorAll(".lm")], cap = $("#lm-cap");
    let act = -1, hoverAct = -1, hoverT = 0, slideT = 0;
    const setAct = (i) => {
      if (i === act) return; act = i;
      rows.forEach((r, k) => r.classList.toggle("on", k === i)); media.forEach((m, k) => m.classList.toggle("on", k === i));
      const on = media[i].querySelector("img.on"); if (cap && on) cap.textContent = on.dataset.cap || "";
      fitLm();
    };
    // ramka przyjmuje proporcje aktualnego zdjęcia (płynna zmiana wysokości), więc nic nie jest kadrowane
    const fitLm = () => { const m = media[act], im = m && m.querySelector("img.on"); if (!im || !im.naturalWidth) return; m.style.height = (m.clientWidth * im.naturalHeight / im.naturalWidth).toFixed(1) + "px"; };
    media.forEach((m) => m.querySelectorAll("img").forEach((im) => im.addEventListener("load", fitLm)));
    addEventListener("resize", fitLm);
    rows.forEach((r, k) => r.addEventListener("pointerenter", () => { hoverAct = k; hoverT = T; }));
    setAct(0); watch(layersEl);
    onTick((t) => {
      if (!isOn(layersEl)) return;
      let best = 0, bd = 1e9; const mid = innerHeight * 0.5;
      rows.forEach((r, k) => { const b = r.getBoundingClientRect(), d = Math.abs(b.top + b.height / 2 - mid); if (d < bd) { bd = d; best = k; } });
      setAct(fine && hoverAct >= 0 && t - hoverT < 5 ? hoverAct : best);
      if (!RM && t - slideT > 5.5) {
        slideT = t; const imgs = [...media[act].querySelectorAll("img")]; if (imgs.length < 2) return;
        const k = imgs.findIndex((im) => im.classList.contains("on")); imgs[k].classList.remove("on"); const n = imgs[(k + 1) % imgs.length]; n.classList.add("on"); if (cap) cap.textContent = n.dataset.cap || ""; fitLm();
      }
    });
  }

  // ===== JobManager: 2D w trzech krokach (zbieranie, research, powiadomienie) =====
  const jm = $("#jm");
  if (jm) {
    const PORTS = ["#ff4f8b", "#2c7ffe", "#ff9f1a", "#5ec8ff", "#23e5db", "#8fb4ff", "#a78bff", "#3ddc84"];
    const PNAME = ["justjoin.it", "pracuj.pl", "rocketjobs", "nofluffjobs", "olx", "linkedin", "indeed", "gowork"];
    const OFF = [
      { t: "Junior Python Developer", m: "B2B, hybrid Gdańsk", p: 1, s: 92, r: "Python, REST / salary above median" },
      { t: "Automation Intern", m: "paid, remote", p: 0, s: 88, r: "Python, APIs / part-time ok" },
      { t: "Integration Engineer, part-time", m: "hybrid Gdynia", p: 3, s: 83, r: "REST, SQL / small team" },
      { t: "Junior Software Engineer", m: "hybrid Gdańsk", p: 5, s: 79, r: "TypeScript, Node / mentoring" },
      { t: "Embedded Software Intern", m: "on site", p: 2, s: 74, r: "C, MCU / no remote" },
      { t: "IT Support with scripting", m: "Gdynia", p: 7, s: 66, r: "PowerShell / mostly support" },
      { t: "QA Automation Trainee", m: "remote", p: 6, s: 61, r: "manual QA mostly" },
      { t: "Backend Developer, Node.js", m: "3+ years", p: 4, s: 48, r: "senior role / skip" },
    ];
    const ARR = [4, 0, 6, 2, 7, 1, 5, 3], AT = ARR.map((_, i) => 0.45 + i * 0.44); // kolejność i czas przylotu
    const arrT = []; ARR.forEach((j, i) => (arrT[j] = AT[i]));
    const L = 13.2, SCAN0 = 4.5, SCAN1 = 6.9, SEND = 8.3, NOTE = 9.3, OUT = 12.5;
    const rowsEl = $("#jm-rows"), cnt = $("#jm-count"), scan = jm.querySelector(".jm__scan"), notif = jm.querySelector(".jm__notif"), bell = jm.querySelector(".bell");
    const steps = [...jm.querySelectorAll(".jm__steps li")], pills = [...jm.querySelectorAll(".jm__src span")];
    const rowEls = OFF.map((o) => {
      const d = document.createElement("div"); d.className = "jm__row"; d.style.setProperty("--c", PORTS[o.p]);
      d.innerHTML = '<div><b></b><small class="mono"></small></div><span class="sc mono">--</span>';
      d.querySelector("b").textContent = o.t; rowsEl.appendChild(d); return d;
    });
    const sent = [0, 1];
    watch(jm);
    const draw = (t) => {
      const R = rowsEl.getBoundingClientRect(), step = R.height * 0.122, rowH = R.height * 0.106;
      let arrived = 0;
      OFF.forEach((o, j) => {
        const el = rowEls[j], a = arrT[j];
        if (t >= a) arrived++;
        // pozycja w liście: ranga przy przylocie + przesunięcia, gdy przylatuje lepsza oferta
        let base = 0; OFF.forEach((q, k) => { if (q.s > o.s && arrT[k] < a) base++; });
        let y = base * step; OFF.forEach((q, k) => { if (q.s > o.s && arrT[k] > a) y += easeIO((t - arrT[k]) / 0.45) * step; });
        sent.forEach((k, i) => { if (k !== j && OFF[k].s > o.s) y -= easeIO((t - SEND - i * 0.35 - 0.55) / 0.5) * step; });   // reszta listy dosuwa się w górę
        let x = 0, sc = 1, op = 1;
        const fk = (t - a) / 0.75;
        if (fk < 1) {
          const pb = pills[o.p].getBoundingClientRect(), px = pb.left - R.left, py = pb.top - R.top + (pb.height - rowH) / 2, e = easeIO(fk);
          x = lerp(px, 0, e); y = lerp(py, y, e) - Math.sin(e * Math.PI) * step * 0.6; sc = lerp(0.62, 1, e); op = fk < 0 ? 0 : Math.min(1, fk * 3);
        }
        // krok 3: dwie najlepsze lecą do powiadomienia
        const si = sent.indexOf(j);
        if (si >= 0) {
          const k = (t - SEND - si * 0.35) / 0.8;
          if (k > 0) { const nb = notif.getBoundingClientRect(), e = easeIO(k); x = lerp(x, nb.left - R.left + nb.width * 0.2, e); y = lerp(y, nb.top - R.top, e); sc = lerp(1, 0.35, e); op = 1 - smooth((k - 0.6) / 0.4); }
        }
        if (t > OUT) op *= 1 - smooth((t - OUT) / 0.5);
        el.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) scale(" + sc.toFixed(3) + ")";
        el.style.opacity = op.toFixed(3);
        // krok 2: skan nadaje ocenę i tagi
        const scanned = t > lerp(SCAN0, SCAN1, (y + rowH / 2) / R.height);
        const meta = scanned ? o.r : PNAME[o.p] + ", " + o.m;
        const sm = el.querySelector("small"); if (sm.textContent !== meta) sm.textContent = meta;
        const sv = el.querySelector(".sc"), sTxt = scanned ? o.s + "%" : "--"; if (sv.textContent !== sTxt) sv.textContent = sTxt;
        el.classList.toggle("hi", scanned && o.s >= 85); el.classList.toggle("lo", scanned && o.s < 65);
      });
      const nNew = t < SEND ? arrived : arrived - sent.filter((j, i) => t > SEND + i * 0.35 + 0.8).length;
      const ct = (t > OUT ? 0 : nNew) + " new"; if (cnt.textContent !== ct) cnt.textContent = ct;
      const sp = (t - SCAN0) / (SCAN1 - SCAN0);
      scan.style.opacity = String(sp > 0 && sp < 1 ? Math.min(1, sp * 6, (1 - sp) * 6) : 0);
      scan.style.transform = "translate3d(0," + (sp * R.height * 1.02).toFixed(1) + "px,0)";
      const nk = (t - NOTE) / 0.5, no = t > OUT ? 1 - smooth((t - OUT) / 0.5) : smooth(nk);
      notif.style.opacity = no.toFixed(3); notif.style.transform = "translate3d(0," + ((1 - ease(nk)) * 18).toFixed(1) + "px,0)";
      const bk = t - NOTE - 0.3; bell.style.transform = bk > 0 && bk < 0.9 ? "rotate(" + (Math.sin(bk * 34) * 16 * (1 - bk / 0.9)).toFixed(1) + "deg)" : "";
      const phase = t < SCAN0 - 0.2 ? 0 : t < SEND - 0.1 ? 1 : 2;
      steps.forEach((s, i) => s.classList.toggle("on", i === phase && t < OUT + 0.3));
    };
    let t0 = null;
    onTick((t) => {
      if (!isOn(jm)) { t0 = null; return; }
      if (RM) { draw(10.6); return; }
      if (t0 === null) t0 = t - 4.2;   // start od wypełnionej listy, nie od pustej
      draw((t - t0) % L);
    });
  }

  // ===== SeeSky: mapa d3-celestial z konfiguracją z projektu + ikona teleskopu z wiązką za kursorem =====
  const skyEl = $("#skymap");
  if (skyEl && window.Celestial) {
    const LAT = 54.35, LON = 18.65, D2R = Math.PI / 180, DATA = "https://ofrohn.github.io/data/";
    let mapW = Math.round(skyEl.clientWidth * 1.15);   // zbliżenie na niebo północne; canvas większy od ramki, krawędzie wygaszone maską
    addEventListener("resize", () => { const w = Math.round(skyEl.clientWidth * 1.15); if (Math.abs(w - mapW) > 4) { mapW = w; Celestial.resize({ width: w }); } });
    Celestial.display({
      width: mapW, projection: "airy", geopos: [LAT, LON], follow: "center", center: [37.9, 86, 0], zoomlevel: 1.55, container: "celestial-map", datapath: DATA, interactive: true, zoomextend: 4, controls: false,
      background: { fill: "#0a0e17", opacity: 0, stroke: "#0a0e17", width: 0 },
      stars: { show: true, limit: 4.6, colors: true, style: { fill: "#ffffff", opacity: 1 }, designation: false, propername: true,
        propernameStyle: { fill: "#8899bb", font: "10px 'Spline Sans', sans-serif", align: "left", baseline: "top" }, propernameLimit: 1.3, size: 6, exponent: -0.28 },
      dsos: { show: false, limit: 4.5, colors: true, style: { fill: "#444444", stroke: "#444444", width: 2, opacity: 1 }, names: false, namesLimit: 3, nameStyle: { fill: "#556677", font: "10px 'Spline Sans', sans-serif" } },
      constellations: { names: true, namesType: "iau", nameStyle: { fill: "#3a4c78", font: "600 10.5px 'Spline Sans', sans-serif", align: "center", baseline: "middle" }, lines: true, lineStyle: { stroke: "#2a3555", width: 1.2, opacity: 0.6 }, bounds: false },
      mw: { show: false, style: { fill: "#0d1525", opacity: 0.15 } },
      lines: { graticule: { show: false, stroke: "#1a2235", width: 0.5, opacity: 0.4, lon: { pos: [] }, lat: { pos: [] } }, equatorial: { show: false, stroke: "#2244aa", width: 0.8, opacity: 0.3 }, ecliptic: { show: false }, galactic: { show: false }, supergalactic: { show: false } },
      horizon: { show: true, stroke: "#b22f57", width: 3, fill: "#000000", opacity: 0.5 },
      planets: { show: false }, daylight: { show: false },
      formFields: { location: false, general: false, stars: false, dsos: false, constellations: false, lines: false, other: false, download: false }
    });
    // d3-celestial nadpisuje style canvasa: wyśrodkuj go ręcznie (większy od ramki, więc wygaszanie działa ze wszystkich stron)
    const centerMap = () => { const cv = $("#celestial-map canvas"); if (cv) Object.assign(cv.style, { position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", margin: "0" }); };
    centerMap(); setTimeout(centerMap, 300); addEventListener("resize", () => setTimeout(centerMap, 100));
    // kółko myszy przewija stronę (zatrzymane przed d3), przeciąganie dalej obraca niebo
    $("#celestial-map").addEventListener("wheel", (e) => e.stopPropagation(), true);
    // gwiazdy do najeżdżania: te same dane co mapa (HIP, jasność, nazwy, gwiazdozbiory)
    let STARS = [];
    Promise.all([fetch(DATA + "stars.6.json").then((r) => r.json()), fetch(DATA + "starnames.json").then((r) => r.json())]).then(([st, nm]) => {
      STARS = st.features.filter((f) => f.properties.mag < 4.6).map((f) => { const n = nm[f.id] || {}; return { id: f.id, lon: f.geometry.coordinates[0], dec: f.geometry.coordinates[1], mag: f.properties.mag, name: n.name || "", desig: n.desig || n.bayer || n.flam || "", con: n.c || "" }; });
    }).catch(() => {});
    const beam = $("#sky-beam"), ring = $("#sky-ring"), dish = $("#sky-dish"), feed = skyEl.querySelector(".skymap__dish .feed"), card = $("#sky-card");
    const fmtRA = (deg) => { const s = Math.round(((deg + 360) % 360) / 15 * 3600); return String(Math.floor(s / 3600) % 24).padStart(2, "0") + "h " + String(Math.floor(s / 60) % 60).padStart(2, "0") + "m " + String(s % 60).padStart(2, "0") + "s"; };
    const fmtDec = (d) => { const s = Math.round(Math.abs(d) * 3600); return (d < 0 ? "-" : "+") + String(Math.floor(s / 3600)).padStart(2, "0") + "° " + String(Math.floor(s / 60) % 60).padStart(2, "0") + "′"; };
    const altaz = (raDeg, dec) => {
      const now = new Date(), jd = now.getTime() / 864e5 + 2440587.5, gmst = (280.46061837 + 360.98564736629 * (jd - 2451545)) % 360;
      const H = (gmst + LON - raDeg) * D2R, d = dec * D2R, la = LAT * D2R;
      const alt = Math.asin(Math.sin(la) * Math.sin(d) + Math.cos(la) * Math.cos(d) * Math.cos(H));
      const az = Math.atan2(-Math.sin(H) * Math.cos(d), Math.cos(la) * Math.sin(d) - Math.sin(la) * Math.cos(d) * Math.cos(H));
      return [alt / D2R, ((az / D2R) + 360) % 360];
    };
    const proj = (s) => { const pr = Celestial.mapProjection; if (!pr) return null; const p = pr([s.lon, s.dec]); const cv = skyEl.querySelector("#celestial-map canvas"); if (!p || !cv) return null; const cr = cv.getBoundingClientRect(), sr = skyEl.getBoundingClientRect(); return [p[0] * cr.width / mapW + cr.left - sr.left, p[1] * cr.height / mapW + cr.top - sr.top]; };
    const st = { mx: null, my: null, star: null, ang: 0.6, tx: 0, ty: 0, auto: 0, autoT: 0 };
    skyEl.addEventListener("pointermove", (e) => { const r = skyEl.getBoundingClientRect(); st.mx = e.clientX - r.left; st.my = e.clientY - r.top; });
    skyEl.addEventListener("pointerleave", () => { st.mx = null; });
    const AUTO = ["Vega", "Deneb", "Capella", "Arcturus", "Polaris", "Altair", "Dubhe", "Aldebaran"];
    watch(skyEl);
    onTick((t) => {
      if (!isOn(skyEl) || !STARS.length) return;
      const W = skyEl.clientWidth, H = skyEl.clientHeight;
      let target = null, star = null;
      if (st.mx !== null) {
        target = [st.mx, st.my]; let bd = 18;
        STARS.forEach((s) => { const p = proj(s); if (!p) return; const d = Math.hypot(p[0] - st.mx, p[1] - st.my); if (d < bd) { bd = d; star = s; target = p; } });
      } else {
        if (t > st.autoT) { st.autoT = t + 6; for (let k = 1; k <= AUTO.length; k++) { const s = STARS.find((q) => q.name === AUTO[(st.auto + k) % AUTO.length]); if (s && altaz(((s.lon + 360) % 360), s.dec)[0] > 15) { st.auto = (st.auto + k) % AUTO.length; break; } } }
        star = STARS.find((q) => q.name === AUTO[st.auto]) || null; if (star) target = proj(star);
      }
      if (!target) return;
      // czasza obraca się w stronę celu (wokół osi w ikonie), wiązka wychodzi z tuby
      const dr = skyEl.querySelector(".skymap__dish").getBoundingClientRect(), sr = skyEl.getBoundingClientRect();
      const pvx = dr.left - sr.left + dr.width * 0.5, pvy = dr.top - sr.top + dr.height * (80 / 120);
      const want = clamp(Math.atan2(target[0] - pvx, pvy - target[1]), -0.3, 1.45);
      st.ang = RM ? want : lerp(st.ang, want, 0.18);
      dish.setAttribute("transform", "rotate(" + (st.ang / D2R).toFixed(2) + " 60 80)");
      const fb = feed.getBoundingClientRect(), fx = fb.left - sr.left + fb.width / 2, fy = fb.top - sr.top + fb.height / 2;
      st.tx = RM ? target[0] : lerp(st.tx || target[0], target[0], 0.3); st.ty = RM ? target[1] : lerp(st.ty || target[1], target[1], 0.3);
      beam.setAttribute("x1", fx.toFixed(1)); beam.setAttribute("y1", fy.toFixed(1)); beam.setAttribute("x2", st.tx.toFixed(1)); beam.setAttribute("y2", st.ty.toFixed(1));
      beam.style.strokeDashoffset = String(-(t * 18) % 11);
      ring.setAttribute("cx", st.tx.toFixed(1)); ring.setAttribute("cy", st.ty.toFixed(1)); ring.style.opacity = star ? "1" : "0";
      if (star !== st.star) {
        st.star = star;
        if (star) { const ra = (star.lon + 360) % 360, [alt, az] = altaz(ra, star.dec);
          card.innerHTML = "<b>" + (star.name || (star.desig ? star.desig + " " + star.con : "HIP " + star.id)) + "</b>" + (star.name && star.desig ? " <i>" + star.desig + " " + star.con + "</i>" : "") + "<br>mag " + star.mag.toFixed(2) + "<br>RA " + fmtRA(ra) + "<br>Dec " + fmtDec(star.dec) + "<br>Alt " + alt.toFixed(1) + "°  Az " + az.toFixed(1) + "°"; }
        card.classList.toggle("on", !!star);
      }
      if (star) {   // karta obok gwiazdy, zawsze w całości wewnątrz ramki
        const cw = card.offsetWidth, ch = card.offsetHeight, left = st.tx + 18 + cw > W - 8;
        const x = clamp(left ? st.tx - 18 - cw : st.tx + 18, 8, W - cw - 8), y = clamp(st.ty - ch / 2, 8, H - ch - 8);
        card.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)";
      }
    });
  }

  // ===== LabInc: pętla z Blendera, gra tylko gdy widać =====
  const fac = $(".factory video");
  if (fac && !RM) {
    fac.preload = "auto";
    new IntersectionObserver(([e]) => { if (e.isIntersecting) fac.play().catch(() => {}); else fac.pause(); }, { threshold: 0.25 }).observe(fac);
  }

  // ---------- miniatury: lightbox ze zdjęciem albo wideo ----------
  const lb = document.createElement("div"); lb.className = "lb"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-label", "Full size view"); document.body.appendChild(lb);
  document.querySelectorAll(".shots button").forEach((b) => b.addEventListener("click", () => {
    lb.innerHTML = b.dataset.video ? '<video muted loop playsinline autoplay controls src="' + VIDS[b.dataset.video] + '"></video>' : '<img alt="" src="' + b.dataset.full + '">';
    const v = lb.querySelector("video"); if (v) v.play().catch(() => {}); lb.classList.add("on");
  }));
  const closeLb = () => { lb.classList.remove("on", "zoomed"); const v = lb.querySelector("video"); if (v) v.pause(); };
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeLb(); });
  // zdjęcia warstw: kliknięcie otwiera pełny rozmiar
  document.querySelectorAll(".lm img, .layer__shot img").forEach((im) => im.addEventListener("click", () => {
    lb.innerHTML = '<img alt="" src="' + im.src + '">'; lb.classList.add("on");
  }));
  // lupa w podglądzie: kliknięcie w zdjęcie przybliża je w miejscu kursora, ruch myszy przesuwa przybliżenie
  lb.addEventListener("click", (e) => { const im = e.target.closest("img"); if (!im) return; im.classList.toggle("zoom"); lb.classList.toggle("zoomed", im.classList.contains("zoom")); });
  lb.addEventListener("pointermove", (e) => { const im = lb.querySelector("img.zoom"); if (!im) return; const r = im.getBoundingClientRect(); im.style.transformOrigin = ((e.clientX - r.left) / r.width * 100).toFixed(1) + "% " + ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%"; });

  // ---------- indeks: podgląd przy kursorze (na dotyku miniatury w wierszach) ----------
  const peek = $("#peek");
  if (peek && fine) {
    const items = [...peek.children], st = { x: 0, y: 0, tx: 0, ty: 0, on: false };
    const show = (k, x, y) => {
      items.forEach((it) => { const on = it.dataset.k === k; it.classList.toggle("on", on); if (it.tagName === "VIDEO") { if (on && !RM) it.play().catch(() => {}); else it.pause(); } });
      if (!st.on) { st.x = x; st.y = y; } st.tx = x; st.ty = y; st.on = true; peek.classList.add("on");
    };
    const hide = () => { st.on = false; peek.classList.remove("on"); items.forEach((it) => it.tagName === "VIDEO" && it.pause()); };
    document.querySelectorAll(".irow").forEach((row) => {
      row.addEventListener("pointerenter", (e) => show(row.dataset.prev, e.clientX, e.clientY));
      row.addEventListener("pointermove", (e) => { st.tx = e.clientX; st.ty = e.clientY; });
      row.addEventListener("pointerleave", hide);
      const a = row.querySelector("a"); if (a) { a.addEventListener("focus", () => { const r = a.getBoundingClientRect(); show(row.dataset.prev, r.right - 340, r.top + r.height / 2); }); a.addEventListener("blur", hide); }
    });
    onTick(() => {
      if (!st.on) return;
      st.x = lerp(st.x, st.tx, RM ? 1 : 0.16); st.y = lerp(st.y, st.ty, RM ? 1 : 0.16);
      const w = peek.offsetWidth, h = peek.offsetHeight, x = clamp(st.x + 28, 8, innerWidth - w - 8), y = clamp(st.y - h / 2, 8, innerHeight - h - 8);
      peek.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) rotate(" + clamp((st.tx - st.x) * 0.04, -4, 4).toFixed(2) + "deg)";
    });
  }

  // ---------- oscyloskopy: sinus płynnie przechodzi w szereg Fouriera ----------
  // amt narasta i zanika w czasie, kolejne harmoniczne (3, 5, 7) dochodzą po kolei, pozycja kursora jest wygładzona
  document.querySelectorAll("[data-osc]").forEach((osc) => {
    const oc = osc.getContext("2d"); watch(osc);
    let mx = null, cx = null, amt = 0, last = 0;
    osc.parentElement.addEventListener("pointermove", (e) => { mx = e.clientX - osc.getBoundingClientRect().left; });
    osc.parentElement.addEventListener("pointerleave", () => { mx = null; });
    onTick((t) => {
      if (!isOn(osc)) { last = t; return; }
      const dt = Math.min(0.05, t - last); last = t;
      const w = osc.clientWidth, h = osc.clientHeight; fit(osc, w, h);
      let goal = mx;
      if (!fine) goal = RM ? null : (Math.sin(t * 0.3) * 0.38 + 0.5) * w;   // na dotyku: powolny przejazd
      if (goal !== null) { cx = cx === null ? goal : lerp(cx, goal, 1 - Math.exp(-dt * 11)); amt = Math.min(1, amt + dt / 0.55); }
      else amt = Math.max(0, amt - dt / 0.8);
      const A = smooth(amt), wh = [0, 1, 2].map((k) => smooth(A * 3.4 - k * 0.8));   // wagi harmonicznych 3, 5, 7
      oc.setTransform(DPR, 0, 0, DPR, 0, 0); oc.clearRect(0, 0, w, h);
      const g = oc.createLinearGradient(0, 0, w, 0); g.addColorStop(0, "#2c7ffe"); g.addColorStop(1, "#642efd");
      oc.strokeStyle = g; oc.lineWidth = 2; oc.shadowColor = "#2c7ffe"; oc.shadowBlur = 10; oc.beginPath();
      const ph = RM ? 0 : t * 1.4, k = Math.PI * 2 / 220, c = cx === null ? -1e4 : cx;
      for (let X = 0; X <= w; X += 2) {
        const a = X * k - ph, near = smooth(1 - Math.abs(X - c) / 300), m = near * A;
        const sq = (4 / Math.PI) * (Math.sin(a) + wh[0] * Math.sin(3 * a) / 3 + wh[1] * Math.sin(5 * a) / 5 + wh[2] * Math.sin(7 * a) / 7) * 0.8;
        const Y = h / 2 - (Math.sin(a) * (1 - m) + sq * m) * h * 0.32;
        X ? oc.lineTo(X, Y) : oc.moveTo(X, Y);
      }
      oc.stroke(); oc.shadowBlur = 0;
    });
  });

  // ---------- EMAIL ME: Twój symbol zamiast kuli ----------
  const msym = $("#mag-sym");
  if (msym) {
    const NS = "http://www.w3.org/2000/svg";
    msym.innerHTML = '<defs><linearGradient id="msg" gradientUnits="userSpaceOnUse" x1="-300" y1="-300" x2="300" y2="300"><stop offset="0" stop-color="#2c7ffe"/><stop offset="1" stop-color="#642efd"/></linearGradient></defs>';
    let dA = "M" + P[0].join(" "); for (let i = 1; i <= 26; i++) dA += " L" + P[i].join(" ");
    let dB = "M" + P[0].join(" "); for (let i = 27; i <= 42; i++) dB += " L" + P[i].join(" ");
    const sparks = [];
    ["base", "lit", "spark"].forEach((cls) => [dA, dB].forEach((d) => {
      const e = document.createElementNS(NS, "path"); e.setAttribute("d", d); e.setAttribute("class", cls); e.setAttribute("pathLength", "1"); msym.appendChild(e);
      if (cls === "spark") sparks.push(e);
    }));
    if (RM) sparks.forEach((s) => (s.style.display = "none"));
    else { watch(msym); onTick((t) => { if (!isOn(msym)) return; const o = 0.06 - ((t * 0.32) % 1.4); sparks.forEach((s) => s.setAttribute("stroke-dashoffset", o.toFixed(4))); }); }
  }

  // ---------- magnetyczny przycisk + kopiowanie ----------
  const mz = $("#magzone"), mag = $("#mag"), lab = mag.querySelector(".mag__lbl");
  if (!RM && fine) {
    const st = { x: 0, y: 0, tx: 0, ty: 0 };
    mz.addEventListener("pointermove", (e) => { const r = mag.getBoundingClientRect(); st.tx = clamp((e.clientX - r.left - r.width / 2) * 0.22, -16, 16); st.ty = clamp((e.clientY - r.top - r.height / 2) * 0.3, -14, 14); });
    mz.addEventListener("pointerleave", () => { st.tx = 0; st.ty = 0; });
    onTick(() => { st.x = lerp(st.x, st.tx, 0.15); st.y = lerp(st.y, st.ty, 0.15); mag.style.transform = "translate3d(" + st.x.toFixed(2) + "px," + st.y.toFixed(2) + "px,0)"; lab.style.transform = "translate3d(" + (st.x * 0.4).toFixed(2) + "px," + (st.y * 0.4).toFixed(2) + "px,0)"; });
  }
  const cp = $("#copy");
  cp.addEventListener("click", () => {
    const done = () => { cp.textContent = "Copied"; setTimeout(() => (cp.textContent = "Copy"), 1600); };
    try { navigator.clipboard.writeText("jeleniewicz@op.pl").then(done, () => getSelection().selectAllChildren($("#mail"))); } catch (e) { getSelection().selectAllChildren($("#mail")); }
  });
