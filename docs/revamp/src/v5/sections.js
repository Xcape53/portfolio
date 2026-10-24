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
      if (!RM && t - slideT > 2.8) {
        slideT = t; const imgs = [...media[act].querySelectorAll("img")]; if (imgs.length < 2) return;
        const k = imgs.findIndex((im) => im.classList.contains("on")); imgs[k].classList.remove("on"); const n = imgs[(k + 1) % imgs.length]; n.classList.add("on"); if (cap) cap.textContent = n.dataset.cap || "";
      }
    });
  }

  // ---------- wspólna scena 3D dla projektu ----------
  function stage3d(el, build) {
    if (!hasGL) { el.classList.add("nogl"); return; }
    const cv = el.querySelector("canvas");
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
    const PORTS = ["#ff4f8b", "#2c7ffe", "#ff9f1a", "#23e5db"], PNAME = ["justjoin.it", "pracuj.pl", "rocketjobs", "olx"];
    const OFF = [
      { t: "Junior Python Developer", m: "B2B, hybrid Gdańsk", p: 1, s: 92, r: "Python, REST / salary above median" },
      { t: "Automation Intern", m: "paid, remote", p: 0, s: 88, r: "Python, APIs / part-time ok" },
      { t: "Integration Engineer, part-time", m: "hybrid Gdynia", p: 2, s: 81, r: "REST, SQL / small team" },
      { t: "Embedded Software Intern", m: "on site", p: 1, s: 74, r: "C, MCU / no remote" },
      { t: "QA Automation Trainee", m: "remote", p: 3, s: 61, r: "manual QA mostly" },
      { t: "Backend Developer, Node.js", m: "3+ years", p: 0, s: 48, r: "senior role / skip" },
    ];
    const ARR = [3, 0, 4, 1, 5, 2], AT = ARR.map((_, i) => 0.5 + i * 0.6); // kolejność i czas przylotu
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
      const R = rowsEl.getBoundingClientRect(), step = R.height * 0.158, rowH = R.height * 0.136;
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
      if (t0 === null) t0 = t - 0.0;
      draw((t - t0) % L);
    });
  }

  // ===== SeeSky: czasza śledzi gwiazdę =====
  const dishEl = document.querySelector('[data-scene="dish"]');
  if (dishEl) stage3d(dishEl, ({ scene, cam }) => {
    lights(scene, 0xd6336c);
    const cyl = (a, b, rad, mat) => { const d = new THREE.Vector3().subVectors(b, a), len = d.length(); const m = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, len, 8), mat); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m; };
    const metal = new THREE.MeshStandardMaterial({ color: 0xb8c2d0, metalness: 0.55, roughness: 0.42, side: THREE.DoubleSide });
    const dark = new THREE.MeshStandardMaterial({ color: 0x3a4250, metalness: 0.6, roughness: 0.5 });
    const R = 2.0, F = 1.25, prof = []; for (let i = 0; i <= 28; i++) { const x = R * i / 28; prof.push(new THREE.Vector2(x, x * x / (4 * F))); }
    const refl = new THREE.Group();
    refl.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 72), metal));
    const seams = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.LatheGeometry(prof.filter((_, i) => i % 4 === 0), 24), 1), new THREE.LineBasicMaterial({ color: 0x5c6c84, transparent: true, opacity: 0.5 })); seams.scale.setScalar(1.004); refl.add(seams);
    const rimY = R * R / (4 * F);
    const horn = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.15, 0.3, 16), dark); horn.position.y = F; refl.add(horn);
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; refl.add(cyl(new THREE.Vector3(Math.cos(a) * R * 0.92, rimY * 0.85, Math.sin(a) * R * 0.92), new THREE.Vector3(0, F + 0.1, 0), 0.017, dark)); }
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 0.36, 20), dark); hub.position.y = -0.16; refl.add(hub);
    for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; refl.add(cyl(new THREE.Vector3(0, -0.28, 0), new THREE.Vector3(Math.cos(a) * R * 0.75, (R * 0.75) ** 2 / (4 * F) - 0.04, Math.sin(a) * R * 0.75), 0.012, dark)); }
    const elev = new THREE.Group(); elev.add(refl); elev.position.y = 0.15;
    const az = new THREE.Group(); az.add(elev);
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.32, 2.2, 20), dark); ped.position.y = -1.0; az.add(ped);
    const yoke = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.2, 0.46), dark); az.add(yoke);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.0, 0.16, 32), dark); base.position.y = -2.1; az.add(base);
    const ant = new THREE.Group(); ant.add(az); ant.position.set(0, -0.2, 0); scene.add(ant);
    for (let i = 1; i <= 3; i++) { const g = new THREE.Mesh(new THREE.RingGeometry(i * 1.3, i * 1.3 + 0.01, 96), new THREE.MeshBasicMaterial({ color: 0x2c7ffe, transparent: true, opacity: 0.25 / i, side: THREE.DoubleSide })); g.rotation.x = -Math.PI / 2; g.position.y = -2.28; scene.add(g); }
    const sky = new THREE.Group(); scene.add(sky);
    const sp = [], sc = []; for (let i = 0; i < 1400; i++) { const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, rr2 = 40, s = Math.sqrt(1 - u * u); sp.push(Math.cos(th) * s * rr2, u * rr2, Math.sin(th) * s * rr2); const b = 0.5 + Math.random() * 0.5; sc.push(b * 0.85, b * 0.9, b); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3)); sg.setAttribute("color", new THREE.Float32BufferAttribute(sc, 3));
    sky.add(new THREE.Points(sg, new THREE.PointsMaterial({ size: 0.12, vertexColors: true, transparent: true, opacity: 0.9, sizeAttenuation: true })));
    sky.rotation.z = 0.35;
    const target = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    const tRing = new THREE.Mesh(new THREE.RingGeometry(0.7, 0.78, 48), new THREE.MeshBasicMaterial({ color: 0xd6336c, transparent: true, opacity: 0.9, side: THREE.DoubleSide }));
    const tHalo = new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 12), new THREE.MeshBasicMaterial({ color: 0xd6336c, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false }));
    target.position.set(9, 10, -24); tRing.position.copy(target.position); tHalo.position.copy(target.position); sky.add(target, tRing, tHalo);
    const beamG = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const beam = new THREE.Line(beamG, new THREE.LineDashedMaterial({ color: 0xd6336c, dashSize: 0.35, gapSize: 0.2, transparent: true, opacity: 0.85 })); scene.add(beam);
    const focusW = new THREE.Vector3(), tw = new THREE.Vector3(), loc = new THREE.Vector3();
    return ({ t, dt, p }) => {
      sky.rotation.y = t * 0.035;
      target.getWorldPosition(tw); tRing.lookAt(cam.position);
      loc.copy(tw).sub(ant.position).normalize();
      const azA = Math.atan2(loc.x, loc.z), elA = Math.asin(clamp(loc.y, -1, 1));
      az.rotation.y = lerp(az.rotation.y, azA, Math.min(1, dt * 2.2));
      elev.rotation.x = lerp(elev.rotation.x, Math.PI / 2 - Math.max(0.15, elA), Math.min(1, dt * 2.2));
      horn.getWorldPosition(focusW);
      const pos = beamG.attributes.position; pos.setXYZ(0, focusW.x, focusW.y, focusW.z); const end = focusW.clone().lerp(tw, 0.35); pos.setXYZ(1, end.x, end.y, end.z); pos.needsUpdate = true; beam.computeLineDistances(); beam.material.dashOffset = -t * 0.6;
      tHalo.scale.setScalar(1 + Math.sin(t * 2.4) * 0.15);
      const ang = -0.5 + ptr.sx * 0.35 + p * 0.5;
      cam.position.set(Math.sin(ang) * 12, 0.9 - ptr.sy * 0.6 - p * 0.6, Math.cos(ang) * 12); cam.lookAt(0.8, 0.9, -1.2);
    };
  });

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
      if (goal !== null) { cx = cx === null ? goal : lerp(cx, goal, 1 - Math.exp(-dt * 7)); amt = Math.min(1, amt + dt / 1.5); }
      else amt = Math.max(0, amt - dt / 1.8);
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
    const rc = document.createElementNS(NS, "circle"); rc.setAttribute("r", "34"); rc.setAttribute("class", "root"); msym.appendChild(rc);
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
