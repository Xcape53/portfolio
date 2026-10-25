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
    };
    rows.forEach((r, k) => r.addEventListener("pointerenter", () => { hoverAct = k; hoverT = T; }));
    setAct(0); watch(layersEl);
    onTick((t) => {
      if (!isOn(layersEl)) return;
      let best = 0, bd = 1e9; const mid = innerHeight * 0.5;
      rows.forEach((r, k) => { const b = r.getBoundingClientRect(), d = Math.abs(b.top + b.height / 2 - mid); if (d < bd) { bd = d; best = k; } });
      setAct(fine && hoverAct >= 0 && t - hoverT < 5 ? hoverAct : best);
      if (!RM && t - slideT > 5.5) {
        slideT = t; const imgs = [...media[act].querySelectorAll("img")]; if (imgs.length < 2) return;
        const k = imgs.findIndex((im) => im.classList.contains("on")); imgs[k].classList.remove("on"); const n = imgs[(k + 1) % imgs.length]; n.classList.add("on"); if (cap) cap.textContent = n.dataset.cap || "";
      }
    });
  }

  // ---------- wspólna scena 3D dla projektu ----------
  function stage3d(el, build) {
    if (!hasGL) { el.classList.add("nogl"); return; }
    const cv = el.querySelector("canvas:not(.chart)");
    const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
    r.setPixelRatio(Math.min(DPR, 1.75)); r.outputEncoding = THREE.sRGBEncoding;
    const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(32, 4 / 3, 0.1, 200);
    const ctx = { scene, cam, r, el, t: 0, dt: 0, p: 0 };
    const upd = build(ctx);
    for (let i = 0; i < 400; i++) { ctx.dt = 1 / 40; ctx.t = i / 40; upd(ctx); }
    let w0 = 0, last = 0;
    const size = () => { const w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); w0 = w; };
    size(); addEventListener("resize", size); watch(el);
    onTick((t) => {
      if (!isOn(el)) { last = t; return; }
      if (cv.clientWidth !== w0) size();
      ctx.dt = Math.min(0.05, t - last); last = t; ctx.t = RM ? 0 : t;
      const rc = el.getBoundingClientRect(); ctx.p = clamp((rc.top + rc.height / 2 - innerHeight / 2) / innerHeight, -1, 1);
      upd(ctx); r.render(scene, cam);
    });
  }
  const lights = (scene, tint) => {
    scene.add(new THREE.HemisphereLight(0xaac4ff, 0x080a12, 0.5));
    const k = new THREE.DirectionalLight(0xffffff, 0.85); k.position.set(-4, 8, 6); scene.add(k);
    const t = new THREE.DirectionalLight(tint, 0.9); t.position.set(6, 2, -5); scene.add(t);
  };

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

  // ===== SeeSky: model radioteleskopu z Blendera (GLB) + mapa nieba jak w demie SeeSky =====
  // Mapa: rzut stereograficzny, zenit w środku, N u góry, E po lewej; RA/Dec J2000 (jak Astropy), Gdańsk 54.35°N.
  const dishEl = document.querySelector('[data-scene="dish"]');
  if (dishEl) {
    const D2R = Math.PI / 180, LAT = 54.35 * D2R;
    const ST = { Dubhe: [11.062, 61.751], Merak: [11.031, 56.382], Phecda: [11.897, 53.695], Megrez: [12.257, 57.033], Alioth: [12.900, 55.960], Mizar: [13.399, 54.925], Alkaid: [13.792, 49.313],
      Caph: [0.153, 59.150], Schedar: [0.675, 56.537], Navi: [0.945, 60.717], Ruchbah: [1.430, 60.235], Segin: [1.907, 63.670],
      Deneb: [20.690, 45.280], Sadr: [20.370, 40.257], Gienah: [20.770, 33.970], Albireo: [19.512, 27.960], Fawaris: [19.750, 45.131],
      Vega: [18.616, 38.784], Sheliak: [18.835, 33.363], Sulafat: [18.982, 32.690], "ζ Lyr": [18.746, 37.605],
      Betelgeuse: [5.919, 7.407], Bellatrix: [5.418, 6.350], Alnitak: [5.679, -1.943], Alnilam: [5.604, -1.202], Mintaka: [5.533, -0.299], Saiph: [5.796, -9.670], Rigel: [5.242, -8.202],
      Capella: [5.278, 45.998], Menkalinan: [5.992, 44.948], Mirfak: [3.405, 49.861], Algol: [3.136, 40.956], Polaris: [2.530, 89.264], Kochab: [14.845, 74.156],
      Arcturus: [14.261, 19.183], Altair: [19.846, 8.868], Aldebaran: [4.599, 16.509], Pollux: [7.755, 28.026], Castor: [7.577, 31.888], Regulus: [10.139, 11.967], Procyon: [7.655, 5.225], Sirius: [6.753, -16.716] };
    const RADIO = { "Cas A": [23.391, 58.815, "supernova remnant"], "Cyg A": [19.991, 40.734, "radio galaxy"], "Tau A": [5.575, 22.014, "Crab Nebula"] };
    const BRIGHT = ["Vega", "Deneb", "Capella", "Arcturus", "Altair", "Polaris", "Dubhe", "Alkaid", "Betelgeuse", "Rigel", "Aldebaran", "Pollux", "Castor", "Procyon", "Sirius", "Regulus", "Mirfak", "Schedar", "Albireo", "Algol"];
    const CON = [["Ursa Major", ["Dubhe", "Merak", "Phecda", "Megrez", "Dubhe"], ["Megrez", "Alioth", "Mizar", "Alkaid"]], ["Cassiopeia", ["Caph", "Schedar", "Navi", "Ruchbah", "Segin"]],
      ["Cygnus", ["Deneb", "Sadr", "Albireo"], ["Gienah", "Sadr", "Fawaris"]], ["Lyra", ["Vega", "ζ Lyr", "Sheliak", "Sulafat", "ζ Lyr"]],
      ["Orion", ["Betelgeuse", "Bellatrix", "Mintaka", "Rigel", "Saiph", "Alnitak", "Betelgeuse"], ["Alnitak", "Alnilam", "Mintaka"]], ["Perseus", ["Algol", "Mirfak"]], ["Auriga", ["Capella", "Menkalinan"]], ["Gemini", ["Castor", "Pollux"]]];
    const TARGETS = ["Cas A", "Vega", "Cyg A", "Capella", "Polaris", "Deneb", "Tau A", "Dubhe", "Arcturus", "Altair"];
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const BG = Array.from({ length: 900 }, () => [rnd() * 24, Math.asin(rnd() * 2 - 1) / D2R, 0.25 + rnd() * 0.75]);
    const altaz = (ra, dec, lst) => {
      const H = lst - ra * 15 * D2R, d = dec * D2R;
      const alt = Math.asin(Math.sin(LAT) * Math.sin(d) + Math.cos(LAT) * Math.cos(d) * Math.cos(H));
      const az = Math.atan2(-Math.sin(H) * Math.cos(d), Math.cos(LAT) * Math.sin(d) - Math.sin(LAT) * Math.cos(d) * Math.cos(H));
      return [alt, az];
    };
    const chart = document.createElement("canvas"); chart.className = "chart"; chart.setAttribute("aria-hidden", "true"); dishEl.insertBefore(chart, dishEl.firstChild);
    const cc = chart.getContext("2d");
    const lblBox = document.createElement("div"); lblBox.className = "sky"; lblBox.setAttribute("aria-hidden", "true"); dishEl.appendChild(lblBox);
    const card = document.createElement("div"); card.className = "sky__card mono"; lblBox.appendChild(card);
    const fmtRA = (h) => { const s = Math.round(h * 3600); return String(Math.floor(s / 3600)).padStart(2, "0") + "h " + String(Math.floor(s / 60) % 60).padStart(2, "0") + "m " + String(s % 60).padStart(2, "0") + "s"; };
    const fmtDec = (d) => { const s = Math.round(Math.abs(d) * 3600); return (d < 0 ? "-" : "+") + String(Math.floor(s / 3600)).padStart(2, "0") + "° " + String(Math.floor(s / 60) % 60).padStart(2, "0") + "′ " + String(s % 60).padStart(2, "0") + "″"; };
    const sky = { cx: 0, cy: 0, R: 1, tx: 0, ty: 0, target: null };
    let ti = 0, tNext = 0, cardKey = "";
    const LST0 = 22 * 15 * D2R;
    const drawChart = (t) => {
      const W = chart.clientWidth, H = chart.clientHeight; fit(chart, W, H);
      cc.setTransform(DPR, 0, 0, DPR, 0, 0); cc.clearRect(0, 0, W, H);
      const narrowC = W < 380, R = narrowC ? H * 0.34 : H * 0.44, cx = narrowC ? W * 0.56 : W * 0.64, cy = narrowC ? H * 0.38 : H * 0.47; sky.cx = cx; sky.cy = cy; sky.R = R;
      const lst = LST0 + t * (2 * Math.PI / 150);   // doba gwiazdowa w 150 s
      const P = (ra, dec) => { const [alt, az] = altaz(ra, dec, lst); if (alt < 0) return null; const r = R * Math.tan((Math.PI / 2 - alt) / 2); return [cx - r * Math.sin(az), cy - r * Math.cos(az), alt, az]; };
      const g = cc.createRadialGradient(cx, cy, R * 0.1, cx, cy, R); g.addColorStop(0, "rgba(16,26,56,.55)"); g.addColorStop(1, "rgba(6,10,24,.35)");
      cc.fillStyle = g; cc.beginPath(); cc.arc(cx, cy, R, 0, 7); cc.fill();
      cc.strokeStyle = "rgba(255,255,255,.14)"; cc.lineWidth = 1; cc.stroke();
      cc.setLineDash([3, 5]); cc.strokeStyle = "rgba(44,127,254,.18)";
      [30, 60].forEach((a) => { cc.beginPath(); cc.arc(cx, cy, R * Math.tan((90 - a) * D2R / 2), 0, 7); cc.stroke(); });
      cc.setLineDash([]);
      cc.font = "500 10px " + getComputedStyle(document.body).getPropertyValue("--f-mono"); cc.fillStyle = "rgba(170,185,215,.6)"; cc.textAlign = "center";
      [["N", 0, -1], ["E", -1, 0], ["S", 0, 1], ["W", 1, 0]].forEach(([s, dx, dy]) => cc.fillText(s, cx + dx * (R + 12), cy + dy * (R + 12) + 4));
      cc.save(); cc.beginPath(); cc.arc(cx, cy, R, 0, 7); cc.clip();
      BG.forEach(([ra, dec, m]) => { const q = P(ra, dec); if (!q) return; cc.fillStyle = "rgba(220,228,245," + (m * 0.7).toFixed(2) + ")"; cc.fillRect(q[0], q[1], m * 1.3, m * 1.3); });
      cc.strokeStyle = "rgba(120,150,220,.32)"; cc.lineWidth = 1;
      cc.font = "500 10.5px " + getComputedStyle(document.body).getPropertyValue("--f-main");
      CON.forEach(([name, ...lines]) => {
        let sx = 0, sy = 0, n = 0;
        lines.forEach((ln) => { cc.beginPath(); let started = false; ln.forEach((s) => { const q = P(ST[s][0], ST[s][1]); if (!q) { started = false; return; } sx += q[0]; sy += q[1]; n++; if (started) cc.lineTo(q[0], q[1]); else { cc.moveTo(q[0], q[1]); started = true; } }); cc.stroke(); });
        if (n) { cc.fillStyle = "rgba(120,140,200,.6)"; cc.fillText(name, sx / n, sy / n + 16); }
      });
      cc.textAlign = "left"; cc.font = "400 10px " + getComputedStyle(document.body).getPropertyValue("--f-main");
      Object.keys(ST).forEach((s) => { const q = P(ST[s][0], ST[s][1]); if (!q) return; const b = BRIGHT.includes(s); cc.fillStyle = "#fff"; cc.beginPath(); cc.arc(q[0], q[1], b ? 2.2 : 1.4, 0, 7); cc.fill(); if (b) { cc.fillStyle = "rgba(200,210,230,.75)"; cc.fillText(s, q[0] + 5, q[1] - 4); } });
      Object.keys(RADIO).forEach((s) => { const q = P(RADIO[s][0], RADIO[s][1]); if (!q) return; cc.strokeStyle = "#ffb347"; cc.lineWidth = 1.4; cc.beginPath(); cc.arc(q[0], q[1], 4, 0, 7); cc.stroke(); cc.fillStyle = "#ffb347"; cc.fillText(s, q[0] + 7, q[1] - 5); });
      // cel: następny z listy, który jest wysoko nad horyzontem
      const posOf = (name) => { const o = RADIO[name] || ST[name]; return P(o[0], o[1]); };
      if (t >= tNext) { for (let k = 1; k <= TARGETS.length; k++) { const q = posOf(TARGETS[(ti + k) % TARGETS.length]); if (q && q[2] > 20 * D2R) { ti = (ti + k) % TARGETS.length; break; } } tNext = t + 7; }
      const name = TARGETS[ti], q = posOf(name);
      if (q) {
        sky.tx = q[0]; sky.ty = q[1]; sky.target = q;
        const pul = 1 + Math.sin(t * 3) * 0.12;
        cc.strokeStyle = "#ff4f8b"; cc.lineWidth = 1.6; cc.beginPath(); cc.arc(q[0], q[1], 11 * pul, 0, 7); cc.stroke();
        [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(([dx, dy]) => { cc.beginPath(); cc.moveTo(q[0] + dx * 15, q[1] + dy * 15); cc.lineTo(q[0] + dx * 21, q[1] + dy * 21); cc.stroke(); });
        const o = RADIO[name] || ST[name], key = name + Math.round(q[2] / D2R * 10) + Math.round(q[3] / D2R * 10);
        if (key !== cardKey) { cardKey = key; const azd = ((q[3] / D2R) + 360) % 360;
          card.innerHTML = "<b>" + name + "</b>" + (RADIO[name] ? " <i>" + RADIO[name][2] + "</i>" : "") + "<br>RA " + fmtRA(o[0]) + "<br>Dec " + fmtDec(o[1]) + "<br>Alt " + (q[2] / D2R).toFixed(1) + "°  Az " + azd.toFixed(1) + "°"; }
      }
      cc.restore();
    };
    stage3d(dishEl, ({ scene, cam, r }) => {
      r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05; r.physicallyCorrectLights = true;
      if (THREE.RoomEnvironment) { const pm = new THREE.PMREMGenerator(r); scene.environment = pm.fromScene(new THREE.RoomEnvironment(), 0.04).texture; }
      scene.add(new THREE.HemisphereLight(0xaac4ff, 0x0a0d18, 0.9));
      const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(-5, 8, 6); scene.add(key);
      const rim = new THREE.DirectionalLight(0xd6336c, 1.6); rim.position.set(6, 3, -6); scene.add(rim);
      let azN = null, elN = null, feed = null;
      new THREE.GLTFLoader().load("%%GLB_dish%%", (g) => { const m = g.scene; scene.add(m); azN = m.getObjectByName("az"); elN = m.getObjectByName("el"); feed = m.getObjectByName("feed_box"); });
      const beamG = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
      const beam = new THREE.Line(beamG, new THREE.LineDashedMaterial({ color: 0xff4f8b, dashSize: 0.3, gapSize: 0.18, transparent: true, opacity: 0.8 })); scene.add(beam);
      const fw = new THREE.Vector3(), pv = new THREE.Vector3(), aim = new THREE.Vector3(), ndc = new THREE.Vector3();
      const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
      return ({ t, dt, p }) => {
        drawChart(t);
        const W = dishEl.clientWidth, narrowS = W < 380, ang = -0.42 + ptr.sx * 0.12 + p * 0.1;
        const cd = narrowS ? 18 : 17, look = narrowS ? new THREE.Vector3(0.6, 5.0, 0) : new THREE.Vector3(5.6, 3.4, 0);
        cam.position.set(Math.sin(ang) * cd, 2.6 - ptr.sy * 0.4, Math.cos(ang) * cd); cam.lookAt(look); cam.updateMatrixWorld();
        if (!azN || !elN || !sky.target) { beam.visible = false; return; }
        // czasza celuje wizualnie w znacznik na mapie: promień z kamery przez znacznik, punkt daleko za anteną
        elN.getWorldPosition(pv);
        ndc.set(sky.tx / W * 2 - 1, -(sky.ty / dishEl.clientHeight) * 2 + 1, 0.5).unproject(cam).sub(cam.position).normalize();
        const far = cam.position.clone().addScaledVector(ndc, cam.position.distanceTo(pv) + 2.5);   // punkt prawie w płaszczyźnie anteny: widać profil czaszy
        aim.copy(far).sub(pv).normalize();
        const azA = Math.atan2(aim.x, aim.z), elA = Math.asin(clamp(aim.y, -1, 1)), k = Math.min(1, dt * 1.8);
        azN.rotation.y += wrap(azA - azN.rotation.y) * k;
        elN.rotation.x = lerp(elN.rotation.x, Math.PI / 2 - Math.max(0.12, elA), k);
        feed.getWorldPosition(fw); beam.visible = true;
        const pos = beamG.attributes.position; pos.setXYZ(0, fw.x, fw.y, fw.z); pos.setXYZ(1, far.x, far.y, far.z); pos.needsUpdate = true; beam.computeLineDistances(); beam.material.dashOffset = -t * 0.8;
      };
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
  const closeLb = () => { lb.classList.remove("on"); const v = lb.querySelector("video"); if (v) v.pause(); };
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeLb(); });

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
