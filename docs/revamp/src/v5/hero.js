  // ---------- symbol: Twoja animacja D3 (wzrost złożoności + ucieczka od kursora) w 3D ----------
  // Węzły to sprężyny: nowy węzeł wyrasta z rodzica, usunięty chowa się z powrotem do rodzica.
  // Złożoność rośnie płynnie: wzrost po załadowaniu, potem zależnie od pozycji na ekranie (43 -> 7 -> 2 węzły, jak w oryginale).
  // Rysowane jako ciągłe ścieżki z okrągłymi końcami: neon bez płaskich końcówek i bez jasnych plam na złączach.
  let grow = RM ? 1 : 0;   // 0..1 postęp wzrostu po loaderze
  {
    const cv = $("#glyph"), g2 = cv.getContext("2d");
    const S = 1 / 100, N = P.length;                       // P[0] to korzeń, gałęzie: 0-1..26 oraz 0-27..42
    const PAR = P.map((_, i) => (i === 0 ? -1 : i === 27 ? 0 : i - 1));
    const SEQ = [0]; for (let i = 0; i < 26; i++) { SEQ.push(i + 1); if (i + 27 <= 42) SEQ.push(i + 27); }   // kolejność wzrostu: gałęzie na zmianę
    const rank = []; SEQ.forEach((n, k) => (rank[n] = k));
    const tgt = P.map((p, i) => [p[0] * S, -p[1] * S, Math.sin(i * 0.55) * 0.12]);
    const ST1 = [[-0.75, 0, 0], [0.75, 0, 0]];             // stan 1 z oryginału: dwa węzły w poziomie
    const pos = tgt.map(() => [0, 0, 0]), vel = tgt.map(() => [0, 0, 0]), life = tgt.map(() => 0);
    if (RM) tgt.forEach((t, i) => { pos[i] = t.slice(); life[i] = 1; });
    let cx = RM ? N : 1, W = 0, H = 0, narrow = false, last = 0;
    const size = () => { W = cv.clientWidth; H = cv.clientHeight; fit(cv, W, H); narrow = W < 900; };
    addEventListener("resize", size); size();
    const rot = (p, rx, ry, rz) => {
      let [x, y, z] = p, c = Math.cos(rz), s = Math.sin(rz); [x, y] = [x * c - y * s, x * s + y * c];
      c = Math.cos(rx); s = Math.sin(rx); [y, z] = [y * c - z * s, y * s + z * c];
      c = Math.cos(ry); s = Math.sin(ry); [x, z] = [x * c + z * s, -x * s + z * c]; return [x, y, z];
    };
    const CAMZ = 11.5, FOVH = 2 * CAMZ * Math.tan(17 * Math.PI / 180);
    onTick((t) => {
      if (!isOn(stage)) { last = t; return; }
      if (cv.clientWidth !== W || cv.clientHeight !== H) size();
      const dt = Math.min(0.05, t - last || 0.016); last = t;
      const idle = RM ? 0 : t, bx = narrow ? 0 : -3.0, by = narrow ? 1.95 : 0, gs = narrow ? 0.31 : 0.62, ppu = H / FOVH;
      // jak w oryginale: złożoność zależy od tego, gdzie symbol jest na ekranie (środek: 43 węzły, dalej 7, przy krawędzi 2)
      const rc0 = cv.getBoundingClientRect(), u = (rc0.top + H / 2 - by * ppu) / innerHeight, u0 = u + scrollY / innerHeight, dz = Math.abs(u - Math.min(0.5, u0));   // względem pozycji startowej (na telefonie symbol stoi wyżej)
      const cZone = dz < 0.17 ? N : dz < 0.3 ? lerp(N, 7, (dz - 0.17) / 0.13) : dz < 0.42 ? lerp(7, 2, (dz - 0.3) / 0.12) : 2;
      const goal = RM ? N : Math.min(Math.max(2, grow * N), cZone);
      cx = lerp(cx, goal, 1 - Math.exp(-dt * 6));
      const shown = Math.max(2, Math.round(cx)), simple = shown <= 2;
      // obrót: powoli w spoczynku, za kursorem i przy scrollu (pochyla się, gdy wyjeżdża z ekranu)
      // większość czasu frontem, jak na zdjęciach: małe kołysanie, umiarkowana reakcja na kursor i scroll, bez ciągłego obrotu
      const du = u - Math.min(0.5, u0), ry = Math.sin(idle * 0.22) * 0.1 + ptr.sx * 0.22 + du * 0.9, rx = Math.sin(idle * 0.17) * 0.05 - ptr.sy * 0.14 + du * 0.5, rz = Math.sin(idle * 0.11) * 0.025;
      const T = [bx, by, 0];
      const proj = (q) => { const r3 = rot(q, rx, ry, rz), z = T[2] + r3[2] * gs, k = CAMZ / (CAMZ - z); return [W / 2 + (T[0] + r3[0] * gs) * k * ppu, H / 2 - (T[1] + r3[1] * gs) * k * ppu, k]; };
      // fizyka węzłów: sprężyna do celu albo do rodzica, drżenie, ucieczka od kursora
      const r = cv.getBoundingClientRect(), mx = ptr.px - r.left, my = ptr.py - r.top, mOn = fine && ptr.px >= 0 && mx > -50 && mx < W + 50 && my > -50 && my < H + 50;
      const kSp = 38, damp = Math.exp(-dt * 9);
      for (let i = 0; i < N; i++) {
        const on = rank[i] < shown, par = PAR[i];
        let goalP = on ? (simple && i <= 1 ? ST1[i] : tgt[i]) : (par >= 0 ? pos[par] : tgt[0]);
        if (i === 0 && simple) goalP = ST1[0];
        life[i] = clamp(life[i] + (on ? dt * 3 : -dt * 2.4), 0, 1);
        if (life[i] === 0 && !on) { if (par >= 0) { pos[i] = pos[par].slice(); vel[i] = [0, 0, 0]; } continue; }
        for (let a = 0; a < 3; a++) vel[i][a] = vel[i][a] * damp + (goalP[a] - pos[i][a]) * kSp * dt;
        if (!RM) { vel[i][0] += (Math.random() - 0.5) * 0.06; vel[i][1] += (Math.random() - 0.5) * 0.06; }
        if (mOn && !RM) {
          const sp = proj(pos[i]), dx = sp[0] - mx, dy = sp[1] - my, d = Math.hypot(dx, dy) || 1, R = Math.min(W, H) * 0.34;
          if (d < R) { const f = (1 - d / R) * 24 * dt * 60 / ppu / gs; vel[i][0] += (dx / d) * f; vel[i][1] -= (dy / d) * f; }
        }
        for (let a = 0; a < 3; a++) pos[i][a] += vel[i][a] * dt;
      }
      // rysowanie: dwie gałęzie jako ciągłe ścieżki
      g2.setTransform(DPR, 0, 0, DPR, 0, 0); g2.clearRect(0, 0, W, H);
      const branches = [[0], [0]];
      for (let i = 1; i <= 26; i++) if (life[i] > 0) branches[0].push(i); else break;
      for (let i = 27; i <= 42; i++) if (life[i] > 0) branches[1].push(i); else break;
      const sp = pos.map((q) => proj(q));
      const ga = proj([-3, 3, 0]), gb = proj([3, -3, 0]), grad = g2.createLinearGradient(ga[0], ga[1], gb[0], gb[1]);
      grad.addColorStop(0, "#2c7ffe"); grad.addColorStop(1, "#642efd");
      const core = 0.19 * gs * ppu, kk = sp[0][2];
      g2.lineCap = "round"; g2.lineJoin = "round"; g2.strokeStyle = grad;
      // obie gałęzie jako jedna ścieżka przez korzeń: bez podwójnej poświaty na środkowym węźle
      const one = branches[1].slice().reverse().concat(branches[0].slice(1));
      const path = () => { g2.beginPath(); one.forEach((n, k) => (k ? g2.lineTo(sp[n][0], sp[n][1]) : g2.moveTo(sp[n][0], sp[n][1]))); };
      const draw = one.length > 1;
      [[6, 0.05], [4.2, 0.07], [2.9, 0.11], [1.9, 0.22]].forEach(([w, a]) => { g2.globalAlpha = a; g2.lineWidth = core * w * kk; if (draw) { path(); g2.stroke(); } });
      g2.globalAlpha = 1; g2.lineWidth = core * kk; if (draw) { path(); g2.stroke(); }
      g2.globalAlpha = 0.55; g2.strokeStyle = "#e6eeff"; g2.lineWidth = core * 0.38 * kk; if (draw) { path(); g2.stroke(); }
      g2.globalAlpha = 1;
    });
  }
