  // ================= v4: sekcje obecnej strony + sceny 3D projektów =================
  const VIDS = { seesky: "%%VID_seesky%%", seeskyTracking: "%%VID_seeskyTracking%%" };
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const sq = (a) => (4 / Math.PI) * (Math.sin(a) + Math.sin(3 * a) / 3 + Math.sin(5 * a) / 5 + Math.sin(7 * a) / 7);
  onTick(() => { const r = $(".hero").getBoundingClientRect(); field.style.opacity = String(clamp(0.4 + (r.bottom / innerHeight) * 0.6, 0.4, 1)); });

  // ---------- odsłony (IntersectionObserver, bez ukrywania treści bez JS) ----------
  if (!RM) {
    root.classList.add("js-anim");
    const rio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); rio.unobserve(e.target); } }), { rootMargin: "0px 0px -10% 0px" });
    document.querySelectorAll(".reveal").forEach((el) => rio.observe(el));
  } else document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));

  // ---------- "What I build": warstwy z paralaksą, co kilka sekund inna na wierzchu ----------
  const stackEl = $("#stack"), figs = [...stackEl.querySelectorAll("figure")]; let topIdx = 2;
  const restack = () => figs.forEach((f, i) => { f.style.zIndex = i === topIdx ? 3 : (i === (topIdx + 2) % 3 ? 2 : 1); f.style.opacity = i === topIdx ? 1 : 0.55; });
  restack(); if (!RM) setInterval(() => { if (isOn(stackEl)) { topIdx = (topIdx + 1) % 3; restack(); } }, 3200);
  watch(stackEl);
  onTick(() => { if (RM || !isOn(stackEl)) return; const r = stackEl.getBoundingClientRect(), c = (r.top + r.height / 2 - innerHeight / 2) / innerHeight; figs.forEach((f, i) => { f.style.transform = "translate3d(" + (ptr.sx * (i + 1) * 4) + "px," + (c * [-40, 30, -15][i]) + "px,0)"; }); });

  // ---------- karty mocnych stron: zdjęcia zmieniają się po kolei ----------
  document.querySelectorAll("[data-cycle]").forEach((card, ci) => {
    const imgs = [...card.querySelectorAll(".media img")]; if (imgs.length < 2 || RM) return; let k = 0;
    setTimeout(() => setInterval(() => { if (!isOn(card)) return; imgs[k].classList.remove("on"); k = (k + 1) % imgs.length; imgs[k].classList.add("on"); }, 3600), ci * 900);
    watch(card);
  });

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
  const tex = (w, h, draw) => { const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t; };
  const rr = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  const lights = (scene, tint) => {
    scene.add(new THREE.HemisphereLight(0xaac4ff, 0x080a12, 0.5));
    const k = new THREE.DirectionalLight(0xffffff, 0.85); k.position.set(-4, 8, 6); scene.add(k);
    const t = new THREE.DirectionalLight(tint, 0.9); t.position.set(6, 2, -5); scene.add(t);
  };
  const bez = (a, b, c, t) => new THREE.Vector3().copy(a).multiplyScalar((1 - t) * (1 - t)).addScaledVector(b, 2 * (1 - t) * t).addScaledVector(c, t * t);

  // ===== JobManager: oferty z 4 portali -> filtr -> jedna lista -> research -> powiadomienie =====
  const jobsEl = document.querySelector('[data-scene="jobs"]');
  if (jobsEl) stage3d(jobsEl, ({ scene, cam }) => {
    lights(scene, 0x29ed81);
    const PORT = [["justjoin.it", "#ff4f8b"], ["pracuj.pl", "#2c7ffe"], ["rocketjobs", "#ff9f1a"], ["olx", "#23e5db"]];
    const srcY = [1.65, 0.55, -0.55, -1.65];
    PORT.forEach(([name, col], i) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.5, 0.08), [0, 0, 0, 0, 0, 0].map((_, f) => f === 4 ? new THREE.MeshStandardMaterial({ map: tex(350, 100, (g, w, h) => { g.fillStyle = "#0f1626"; rr(g, 0, 0, w, h, 16); g.fill(); g.fillStyle = col; g.beginPath(); g.arc(34, 50, 11, 0, 7); g.fill(); g.fillStyle = "#e9eefb"; g.font = "600 34px Spline Sans, sans-serif"; g.fillText(name, 60, 62); }), roughness: 0.6 }) : new THREE.MeshStandardMaterial({ color: 0x0f1626 })));
      m.position.set(-3.9, srcY[i], 0); scene.add(m);
    });
    // rama listy
    const frame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.7, 4.3, 0.05)), new THREE.LineBasicMaterial({ color: 0x2c7ffe, transparent: true, opacity: 0.45 }));
    frame.position.set(2.6, 0, -0.05); scene.add(frame);
    const lbl = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 0.34), new THREE.MeshBasicMaterial({ map: tex(540, 68, (g, w, h) => { g.fillStyle = "#c9d6f5"; g.font = "600 30px Spline Sans, sans-serif"; g.fillText("One list", 6, 46); g.fillStyle = "#29ed81"; g.font = "500 24px monospace"; g.fillText("sorted by match", 200, 46); }), transparent: true }));
    lbl.position.set(2.6, 2.42, 0); scene.add(lbl);
    // filtr: lejek z dwóch linii
    const fm = new THREE.LineBasicMaterial({ color: 0x642efd, transparent: true, opacity: 0.7 });
    const funnel = new THREE.Group(); [[1, 1.6], [-1, -1.6]].forEach(([a, b]) => { funnel.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.6, b, 0), new THREE.Vector3(0.25, a * 0.32, 0), new THREE.Vector3(0.9, a * 0.32, 0)]), fm)); });
    funnel.position.set(-1.0, 0, 0); scene.add(funnel);
    // karty
    const cardTex = (col, lines) => tex(480, 72, (g, w, h) => { g.fillStyle = "#111a2c"; rr(g, 0, 0, w, h, 10); g.fill(); g.fillStyle = col; g.fillRect(0, 0, 8, h); g.fillStyle = "#dfe7f7"; g.fillRect(24, 18, lines[0], 12); g.fillStyle = "#7f8aa3"; g.fillRect(24, 42, lines[1], 9); g.fillStyle = "rgba(41,237,129,.85)"; rr(g, w - 92, 22, 70, 28, 14); g.fill(); });
    const pool = []; for (let i = 0; i < 26; i++) {
      const pi = i % 4, mat = new THREE.MeshStandardMaterial({ map: cardTex(PORT[pi][1], [170 + (i * 37) % 160, 120 + (i * 53) % 140]), roughness: 0.55, transparent: true });
      const m = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.36, 0.04), [0, 1, 2, 3].map(() => new THREE.MeshStandardMaterial({ color: 0x111a2c })).concat([mat, new THREE.MeshStandardMaterial({ color: 0x111a2c })]));
      m.visible = false; scene.add(m); pool.push({ m, mat, state: "idle", port: pi });
    }
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(2.62, 0.56), new THREE.MeshBasicMaterial({ color: 0x29ed81, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    scene.add(glow);
    const scan = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.5), new THREE.MeshBasicMaterial({ color: 0xb6ffd5, transparent: true, opacity: 0, blending: THREE.AdditiveBlending }));
    scene.add(scan);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.2, 40), new THREE.MeshBasicMaterial({ color: 0x29ed81, transparent: true, opacity: 0, side: THREE.DoubleSide }));
    scene.add(ring);
    const bell = new THREE.Mesh(new THREE.CircleGeometry(0.13, 28), new THREE.MeshBasicMaterial({ color: 0x29ed81, transparent: true, opacity: 0 }));
    scene.add(bell);
    const list = []; let spawnT = 0, nCard = 0, research = null;
    const MERGE = new THREE.Vector3(-0.15, 0, 0.1), slotY = (k) => 1.95 - k * 0.47;
    function spawn() {
      const c = pool.find((q) => q.state === "idle"); if (!c) return;
      c.state = "fly"; c.k = 0; c.m.visible = true; c.mat.opacity = 1; c.m.rotation.set(0, 0, 0);
      c.from = new THREE.Vector3(-3.9, srcY[c.port], 0.15); c.reject = (nCard++ % 3) === 1;
      c.m.scale.setScalar(0.62);
    }
    return ({ t, dt, p }) => {
      cam.position.set(-0.5 + ptr.sx * 1.2 + p * 0.8, 1.0 - ptr.sy * 0.7, 13.6); cam.lookAt(-0.55, 0, 0);
      spawnT += dt; if (spawnT > 0.62) { spawnT = 0; spawn(); }
      for (const c of pool) {
        if (c.state === "fly") {
          c.k += dt / 1.0; const e = Math.min(1, c.k);
          c.m.position.copy(bez(c.from, new THREE.Vector3(-1.9, srcY[c.port] * 0.4, 0.4), MERGE, e)); c.m.scale.setScalar(lerp(0.62, 0.8, e));
          if (e >= 1) { if (c.reject) { c.state = "fall"; c.k = 0; c.vy = 0; } else { c.state = "join"; c.k = 0; c.start = c.m.position.clone(); list.unshift(c); } }
        } else if (c.state === "fall") {
          c.k += dt; c.vy -= dt * 7; c.m.position.y += c.vy * dt; c.m.position.x += dt * 0.4; c.m.rotation.z -= dt * 1.2; c.mat.opacity = Math.max(0, 1 - c.k * 1.1);
          c.mat.color.setRGB(0.45, 0.45, 0.5);
          if (c.k > 1) { c.state = "idle"; c.m.visible = false; c.mat.color.setRGB(1, 1, 1); }
        } else if (c.state === "list" || c.state === "join") {
          const k = list.indexOf(c);
          if (k > 7) { c.state = "out"; c.k = 0; list.splice(k, 1); continue; }
          const target = new THREE.Vector3(2.6, slotY(k), 0);
          if (c.state === "join") { c.k += dt / 0.7; const e = 1 - Math.pow(1 - Math.min(1, c.k), 3); c.m.position.lerpVectors(c.start, target, e); c.m.scale.setScalar(lerp(0.8, 1, e)); if (c.k >= 1) c.state = "list"; }
          else c.m.position.lerp(target, Math.min(1, dt * 8));
        } else if (c.state === "out") {
          c.k += dt; c.mat.opacity = Math.max(0, 1 - c.k * 2); c.m.position.y -= dt * 0.6; if (c.k > 0.5) { c.state = "idle"; c.m.visible = false; }
        }
      }
      // research + powiadomienie na co 3. ofercie w liście
      if (!research && list.length > 2 && list[1].state === "list") research = { c: list[1], k: 0 };
      if (research) {
        research.k += dt; const c = research.c, k = research.k, pos = c.m.position;
        glow.position.set(pos.x, pos.y, pos.z - 0.03); glow.material.opacity = 0.35 * Math.min(1, k * 3) * (k < 2.2 ? 1 : Math.max(0, 1 - (k - 2.2) * 2));
        scan.position.set(pos.x - 1.15 + ((k * 1.4) % 1) * 2.3, pos.y, pos.z + 0.04); scan.material.opacity = k < 1.6 ? 0.9 : 0;
        const rk = clamp(k - 1.6, 0, 1); bell.position.set(pos.x + 1.42, pos.y, pos.z + 0.05); bell.material.opacity = k > 1.6 && k < 2.6 ? 1 : 0;
        ring.position.copy(bell.position); ring.scale.setScalar(1 + rk * 3); ring.material.opacity = (k > 1.6 && k < 2.6) ? (1 - rk) : 0;
        if (k > 2.8 || list.indexOf(c) < 0) { research = null; glow.material.opacity = 0; scan.material.opacity = 0; bell.material.opacity = 0; ring.material.opacity = 0; }
      }
    };
  });

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
    // pierścienie siatki na ziemi
    for (let i = 1; i <= 3; i++) { const g = new THREE.Mesh(new THREE.RingGeometry(i * 1.3, i * 1.3 + 0.01, 96), new THREE.MeshBasicMaterial({ color: 0x2c7ffe, transparent: true, opacity: 0.25 / i, side: THREE.DoubleSide })); g.rotation.x = -Math.PI / 2; g.position.y = -2.28; scene.add(g); }
    // niebo
    const sky = new THREE.Group(); scene.add(sky);
    const sp = [], sc = []; for (let i = 0; i < 1400; i++) { const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, rr2 = 40, s = Math.sqrt(1 - u * u); sp.push(Math.cos(th) * s * rr2, u * rr2, Math.sin(th) * s * rr2); const b = 0.5 + Math.random() * 0.5; sc.push(b * 0.85, b * 0.9, b); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3)); sg.setAttribute("color", new THREE.Float32BufferAttribute(sc, 3));
    sky.add(new THREE.Points(sg, new THREE.PointsMaterial({ size: 0.12, vertexColors: true, transparent: true, opacity: 0.9, sizeAttenuation: true })));
    sky.rotation.z = 0.35;
    const target = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    const tRing = new THREE.Mesh(new THREE.RingGeometry(0.7, 0.78, 48), new THREE.MeshBasicMaterial({ color: 0xd6336c, transparent: true, opacity: 0.9, side: THREE.DoubleSide }));
    const tHalo = new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 12), new THREE.MeshBasicMaterial({ color: 0xd6336c, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false }));
    target.position.set(9, 10, -24); tRing.position.copy(target.position); tHalo.position.copy(target.position); sky.add(target, tRing, tHalo);
    // wiązka od ogniska do celu
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

  // ===== LabInc: taśmociąg pierwiastków do fabryki =====
  const facEl = document.querySelector('[data-scene="factory"]');
  if (facEl) stage3d(facEl, ({ scene, cam }) => {
    lights(scene, 0x007acc);
    const ground = new THREE.Mesh(new THREE.BoxGeometry(9, 0.2, 5.4), new THREE.MeshStandardMaterial({ color: 0x0a101c, roughness: 0.95 })); ground.position.y = -0.1; scene.add(ground);
    const grid = new THREE.GridHelper(9, 18, 0x23356a, 0x152040); grid.position.y = 0.002; grid.scale.z = 0.6; scene.add(grid);
    const beltTex = tex(512, 64, (g, w, h) => { g.fillStyle = "#1a2232"; g.fillRect(0, 0, w, h); g.fillStyle = "#2a3550"; for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 14, h); });
    beltTex.wrapS = THREE.RepeatWrapping; beltTex.repeat.set(6, 1);
    const belt = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.14, 0.95), [0, 0, 1, 0, 0, 0].map((f) => f ? new THREE.MeshStandardMaterial({ map: beltTex, roughness: 0.7 }) : new THREE.MeshStandardMaterial({ color: 0x2b3446, metalness: 0.4, roughness: 0.5 })));
    belt.position.set(-0.6, 0.32, 0.4); scene.add(belt);
    for (let i = 0; i < 6; i++) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.26, 0.9), new THREE.MeshStandardMaterial({ color: 0x3a4458 })); leg.position.set(-3.6 + i * 1.2, 0.13, 0.4); scene.add(leg); }
    // kopalnia (wieża) po lewej
    const dm = new THREE.MeshStandardMaterial({ color: 0xc9853a, metalness: 0.3, roughness: 0.6 });
    const tower = new THREE.Group(); [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([a, b]) => { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.2, 6), dm); leg.position.set(a * 0.42, 1.05, b * 0.42); leg.rotation.z = a * 0.15; leg.rotation.x = -b * 0.15; tower.add(leg); });
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.04, 8, 24), dm); wheel.position.set(0, 2.15, 0); tower.add(wheel);
    tower.position.set(-4.0, 0, -0.9); scene.add(tower);
    // fabryka po prawej
    const fac = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.3, 1.7), new THREE.MeshStandardMaterial({ color: 0x141c2e, roughness: 0.7 })); body.position.y = 0.65; fac.add(body);
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 1.3, 0.55, 4), new THREE.MeshStandardMaterial({ color: 0x2c7ffe, roughness: 0.5 })); roof.rotation.y = Math.PI / 4; roof.position.y = 1.58; roof.scale.set(1.03, 1, 0.92); fac.add(roof);
    for (let i = 0; i < 3; i++) { const win = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.26), new THREE.MeshBasicMaterial({ color: 0x8fd0ff })); win.position.set(-0.55 + i * 0.55, 0.85, 0.851); fac.add(win); }
    const door = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.5), new THREE.MeshBasicMaterial({ color: 0x050a17 })); door.rotation.y = -Math.PI / 2; door.position.set(-0.951, 0.55, 0.4); fac.add(door);
    const chim = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 1.3, 14), new THREE.MeshStandardMaterial({ color: 0x3b465c })); chim.position.set(0.5, 1.9, -0.45); fac.add(chim);
    fac.position.set(3.4, 0, 0); scene.add(fac);
    // dym
    const smoke = []; for (let i = 0; i < 14; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), new THREE.MeshBasicMaterial({ color: 0xa9b8d6, transparent: true, opacity: 0, depthWrite: false })); scene.add(s); smoke.push({ s, k: i / 14 }); }
    // pierwiastki
    const EL = [["H", 1, "#5ec8ff"], ["He", 2, "#c58bff"], ["C", 6, "#9aa5b8"], ["N", 7, "#5ec8ff"], ["O", 8, "#5ec8ff"], ["Fe", 26, "#ff9f5a"], ["Cu", 29, "#ff9f5a"], ["Ag", 47, "#d9e2f2"], ["Au", 79, "#ffd23f"], ["U", 92, "#7dff9e"], ["Pu", 94, "#7dff9e"], ["Og", 118, "#ff6b9a"]];
    const elMat = EL.map(([s, n, c]) => new THREE.MeshStandardMaterial({ roughness: 0.45, map: tex(128, 128, (g, w, h) => { g.fillStyle = c; g.fillRect(0, 0, w, h); g.fillStyle = "rgba(0,0,0,.18)"; g.fillRect(0, 0, w, 6); g.fillStyle = "#0a0f1c"; g.font = "700 58px Spline Sans, sans-serif"; g.textAlign = "center"; g.fillText(s, 64, 84); g.font = "500 20px monospace"; g.textAlign = "left"; g.fillText(String(n), 10, 26); }) }));
    const cubes = []; for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.46, 0.46), elMat[0]); m.visible = false; scene.add(m); cubes.push({ m, k: -1 }); }
    const coins = []; for (let i = 0; i < 5; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.04, 24), new THREE.MeshStandardMaterial({ color: 0xffd23f, metalness: 0.8, roughness: 0.3, transparent: true, opacity: 0 })); c.rotation.x = Math.PI / 2; scene.add(c); coins.push({ c, k: 1 }); }
    let spawnT = 0, ei = 0;
    return ({ t, dt, p }) => {
      beltTex.offset.x -= dt * 0.55;
      wheel.rotation.z = t * 2;
      spawnT += dt; if (spawnT > 0.95) { spawnT = 0; const c = cubes.find((q) => q.k < 0); if (c) { c.k = 0; c.m.material = elMat[ei++ % EL.length]; c.m.visible = true; c.m.scale.setScalar(1); } }
      for (const c of cubes) {
        if (c.k < 0) continue; c.k += dt / 6.2;
        const x = lerp(-3.6, 2.5, c.k); c.m.position.set(x, 0.62 + Math.max(0, 0.4 - c.k * 4) * 0, 0.4); c.m.rotation.y = Math.sin(t + c.k * 5) * 0.08;
        if (c.k < 0.06) c.m.position.y = 0.62 + (0.06 - c.k) * 18;
        if (c.k > 0.93) c.m.scale.setScalar(Math.max(0.01, (1 - c.k) / 0.07));
        if (c.k >= 1) { c.k = -1; c.m.visible = false; const coin = coins.find((q) => q.k >= 1); if (coin) coin.k = 0; }
      }
      for (const q of coins) { if (q.k >= 1) { q.c.material.opacity = 0; continue; } q.k += dt / 1.3; q.c.position.set(3.0, 1.9 + q.k * 1.4, 0.6); q.c.rotation.z = q.k * 9; q.c.material.opacity = 1 - q.k; }
      for (const s of smoke) { s.k = (s.k + dt * 0.22) % 1; s.s.position.set(3.9 + s.k * 0.9 + Math.sin(s.k * 9 + t) * 0.1, 2.6 + s.k * 2.2, -0.45 - s.k * 0.3); s.s.scale.setScalar(0.6 + s.k * 2.2); s.s.material.opacity = (RM ? 0.15 : 0.32) * (1 - s.k); }
      const ang = 0.62 + ptr.sx * 0.3 + p * 0.35;
      cam.position.set(Math.sin(ang) * 13.2, 6.6 - ptr.sy * 0.8, Math.cos(ang) * 13.2); cam.lookAt(0.1, 0.9, 0);
    };
  });

  // ---------- miniatury: lightbox ze zdjęciem albo wideo ----------
  const lb = document.createElement("div"); lb.className = "lb"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-label", "Full size view"); document.body.appendChild(lb);
  document.querySelectorAll(".shots button").forEach((b) => b.addEventListener("click", () => {
    lb.innerHTML = b.dataset.video ? '<video muted loop playsinline autoplay controls src="' + VIDS[b.dataset.video] + '"></video>' : '<img alt="" src="' + b.dataset.full + '">';
    const v = lb.querySelector("video"); if (v) v.play().catch(() => {}); lb.classList.add("on");
  }));
  const closeLb = () => { lb.classList.remove("on"); const v = lb.querySelector("video"); if (v) v.pause(); };
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeLb(); });

  // ---------- karty z wideo: odtwarzanie po najechaniu albo gdy widać (dotyk) ----------
  document.querySelectorAll("[data-hoverplay]").forEach((card) => {
    const v = card.querySelector("video"); if (!v || RM) return;
    if (fine) { card.addEventListener("pointerenter", () => v.play().catch(() => {})); card.addEventListener("pointerleave", () => v.pause()); }
    else new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); }, { threshold: 0.6 }).observe(card);
  });

  // ---------- oscyloskopy ----------
  document.querySelectorAll("[data-osc]").forEach((osc) => {
    const oc = osc.getContext("2d"); watch(osc); let mx = -1e4;
    osc.parentElement.addEventListener("pointermove", (e) => { mx = e.clientX - osc.getBoundingClientRect().left; });
    osc.parentElement.addEventListener("pointerleave", () => { mx = -1e4; });
    onTick((t) => {
      if (!isOn(osc)) return;
      const w = osc.clientWidth, h = osc.clientHeight; fit(osc, w, h);
      oc.setTransform(DPR, 0, 0, DPR, 0, 0); oc.clearRect(0, 0, w, h);
      const g = oc.createLinearGradient(0, 0, w, 0); g.addColorStop(0, "#2c7ffe"); g.addColorStop(1, "#642efd");
      oc.strokeStyle = g; oc.lineWidth = 2; oc.shadowColor = "#2c7ffe"; oc.shadowBlur = 10; oc.beginPath();
      const ph = RM ? 0 : t * 1.4, k = Math.PI * 2 / 220, cx = fine ? mx : (RM ? -1e4 : (Math.sin(t * 0.35) * 0.4 + 0.5) * w);
      for (let X = 0; X <= w; X += 2) { const a = X * k - ph, m = clamp(1 - Math.abs(X - cx) / 260, 0, 1), Y = h / 2 - (Math.sin(a) * (1 - m) + sq(a) * m * 0.8) * h * 0.32; X ? oc.lineTo(X, Y) : oc.moveTo(X, Y); }
      oc.stroke(); oc.shadowBlur = 0;
    });
  });

  // ---------- magnetyczny przycisk + kopiowanie ----------
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
