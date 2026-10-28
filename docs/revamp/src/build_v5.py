# Składa prototyp v5: hero z v2 (drzewo.tpl.html) + nowe sekcje z v3/, obrazy i wideo jako data URI.
import base64, pathlib, re
here = pathlib.Path(__file__).resolve().parent
v2 = (here / "drzewo.tpl.html").read_text(encoding="utf8")
part = lambda n: (here / "v5" / n).read_text(encoding="utf8")
def cut(s, a, b):
    i, j = s.index(a), s.index(b)
    return s[:i], s[j:]
# CSS: wyrzuć sekcje v2 (od "jak myślę" do "notatki") i stary blok mobilny
pre, post = cut(v2, "/* ---------- jak myślę", "/* ---------- notatki")
s = pre + part("sections.css") + "\n" + post
pre, post = cut(s, "/* ---------- telefon", "</style>")
s = pre + part("mobile.css") + post
# HTML: sekcje po hero
pre, post = cut(s, "  <!-- JAK MYŚLĘ -->", "</main>")
s = pre + part("sections.html") + post
# JS: wyrzuć wszystko od drzewa myślenia do końca IIFE
pre, post = cut(s, "  // ---------- drzewo myślenia", "})();\n</script>")
s = pre + part("sections.js") + post
# pole węzłów działa na całej stronie
s = s.replace("  onTick((t) => {\n    if (!isOn(stage)) return;\n    const w = field.clientWidth", "  onTick((t) => {\n    const w = field.clientWidth")
s = s.replace("const oy = heroP * h * L.sp,", "const oy = scrollY * L.sp * 0.6,")
s = s.replace(".field { position: fixed !important; inset: 0; width: 100%; height: 100%; z-index: 0;", ".field { position: fixed !important; inset: 0; width: 100%; height: 100%; z-index: -1;")
# telefon: bez tego przeglądarka renderuje 980 px i pomniejsza stronę
s = s.replace('<meta name="claude:viewport-fit-sides" content="cover">', '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<meta name="description" content="Piotr Jeleniewicz: software development and system integration. Automation tools, API integrations and desktop applications.">', 1)
# przewijanie natywne: Lenis zacinał się i blokował kółko myszy (także w v4)
s = s.replace('<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js"></script>\n', "")
s = s.replace("</style>", "@media (prefers-reduced-motion: no-preference) { html { scroll-behavior: smooth; } }\n</style>", 1)
# szablon to fragment bez nagłówka: bez charset przeglądarka psuje polskie znaki
s = '<!doctype html>\n<html lang="en">\n<meta charset="utf-8">\n' + s
# symbol bez kropki w węźle głównym (prośba użytkownika)
s = s.replace("    G.add(rootM, rootH);\n", "")
# hero: symbol z animacji D3 (wzrost złożoności, ucieczka od kursora) rysowany w 3D, bez kropki i bez płaskich końców rur
pre, post = cut(s, "  // ---------- symbol 3D ----------", "  const hero = $(\".hero\"), htext")
s = pre + part("hero.js") + post
# loader: większy canvas, żeby poświata symbolu nie była przycięta
s = s.replace("fit(cv, 160, 160); c.setTransform(DPR * 160 / 800, 0, 0, DPR * 160 / 800, DPR * 80, DPR * 80);", "fit(cv, 240, 240); c.setTransform(DPR * 160 / 800, 0, 0, DPR * 160 / 800, DPR * 120, DPR * 120);")
s = s.replace("c.clearRect(-400, -400, 800, 800);", "c.clearRect(-600, -600, 1200, 1200);")
s = s.replace(".loader canvas { width: 160px; height: 160px; }", ".loader canvas { width: 240px; height: 240px; }")
s = s.replace(".glyph { filter: drop-shadow(0 0 14px rgba(44,127,254,.55)) drop-shadow(0 0 34px rgba(100,46,253,.35)); }", ".glyph { filter: none; }")
s = s.replace("a przy scrollu odjeżdża i staje się logo w lewym górnym rogu.", "a przy scrollu jedzie razem z tekstem i upraszcza się (43, 7, 2 węzły) jak w animacji D3, w zależności od pozycji na ekranie.")
# SeeSky: d3-celestial w tej samej wersji co w projekcie (d3 v3)
# (ładowany leniwie w sections.js, gdy sekcja SeeSky zbliża się do ekranu: blokował start strony na 1,6 s)
s = s.replace('<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n', '', 1)
# hero ma teraz jeden ekran wysokości: postęp przewijania hero był ~0/0, więc tekst znikał po pierwszym ruchu kółka.
# Tekst i symbol po prostu przewijają się razem ze stroną.
old_fade = '    if (!RM) { htext.style.transform = "translate3d(0," + (-heroP * 30) + "vh,0)"; htext.style.opacity = String(1 - clamp(heroP * 1.3 - 0.2, 0, 1)); }'
assert old_fade in s
s = s.replace(old_fade, "")
# hero: pełne zdanie zamiast równoważnika (humanizer)
s = s.replace('I build applications and automation tools that connect APIs, data and AI services. Final semester of Electronics and Telecommunications at Gdańsk University of Technology, so software that talks to hardware is familiar ground.', "I build applications and automation tools that connect APIs, data and AI services. I'm in my final semester of Electronics and Telecommunications at Gdańsk University of Technology, and I've been into automation since primary school.", 1)
# hero bez "Hello, I am": imię samo, wyśrodkowane pionowo
s = s.replace('          <p class="kicker">Hello, I am</p>\n', '', 1)
s = s.replace('.hero__copy { position: absolute; inset: 0; display: grid; align-content: center; justify-items: end; padding-top: 80px;', '.hero__copy { position: absolute; inset: 0; display: grid; align-content: center; justify-items: end; padding-top: 0;', 1)
old_ld = "      fit(cv, 240, 240); c.setTransform(DPR * 160 / 800, 0, 0, DPR * 160 / 800, DPR * 120, DPR * 120);\n      c.clearRect(-600, -600, 1200, 1200); c.lineWidth = 40; c.lineCap = \"round\"; c.lineJoin = \"round\";\n      const g = c.createLinearGradient(-300, -300, 300, 300); g.addColorStop(0, \"#2c7ffe\"); g.addColorStop(1, \"#642efd\"); c.strokeStyle = g;\n      c.shadowColor = \"#2c7ffe\"; c.shadowBlur = 40;\n      for (let k = 0; k < n; k++) { const [a, b] = ORDER[k]; c.beginPath(); c.moveTo(P[a][0], P[a][1]); c.lineTo(P[b][0], P[b][1]); c.stroke(); }"
assert old_ld in s, "loader"
s = s.replace(old_ld, "      if (!cv._fit) { fit(cv, 240, 240); cv._fit = 1; }\n      c.setTransform(DPR * 160 / 800, 0, 0, DPR * 160 / 800, DPR * 120, DPR * 120);\n      c.clearRect(-600, -600, 1200, 1200); c.lineWidth = 40; c.lineCap = \"round\"; c.lineJoin = \"round\";\n      const g = c.createLinearGradient(-300, -300, 300, 300); g.addColorStop(0, \"#2c7ffe\"); g.addColorStop(1, \"#642efd\"); c.strokeStyle = g;\n      c.shadowColor = \"#2c7ffe\"; c.shadowBlur = 40;\n      c.beginPath(); for (let k = 0; k < n; k++) { const [a, b] = ORDER[k]; c.moveTo(P[a][0], P[a][1]); c.lineTo(P[b][0], P[b][1]); } c.stroke();", 1)
# loader rusza dopiero po załadowaniu strony (najpóźniej po 1,5 s): wcześniej dociąganie obrazów i start skryptów zjadało klatki
old_t0 = 'const cv = $("#grow"), c = cv.getContext("2d"), ln = $("#lnodes"), t0 = performance.now(), D = 1400;\n    const f = () => {\n      const p = clamp((performance.now() - t0) / D, 0, 1)'
assert old_t0 in s, "loader t0"
s = s.replace(old_t0, 'const cv = $("#grow"), c = cv.getContext("2d"), ln = $("#lnodes"), tStart = performance.now(), D = 1400;\n    let t0 = 0;\n    const f = () => {\n      if (!t0) { if (document.readyState !== "complete" && performance.now() - tStart < 1500) { requestAnimationFrame(f); return; } t0 = performance.now(); }\n      const p = clamp((performance.now() - t0) / D, 0, 1)', 1)
FONTS = "https://fonts.googleapis.com/css2?family=Poppins:wght@600;800&family=Spline+Sans:wght@300..700&family=Spline+Sans+Mono:wght@400;500&display=swap"
assert '<link rel="stylesheet" href="' + FONTS + '">' in s, "fonts"
s = s.replace('<link rel="stylesheet" href="' + FONTS + '">', '<link rel="preload" as="style" href="' + FONTS + '">\n<link rel="stylesheet" href="' + FONTS + '" media="print" onload="this.media=\'all\'">\n<noscript><link rel="stylesheet" href="' + FONTS + '"></noscript>\n<link rel="icon" type="image/png" sizes="48x48" href="%%IMG_favicon%%">', 1)
# notatki domyślnie wyłączone
s = s.replace('  root.classList.add("notes");\n', "")
s = s.replace('aria-pressed="true">Notatki projektowe: wł.', 'aria-pressed="false">Notatki projektowe: wył.')
s = s.replace(".hero { position: relative; height: 190svh; }", ".hero { position: relative; height: 100svh; min-height: 640px; }")
s = s.replace("const bx = narrow ? 0 : -3.3, by = narrow ? 1.7 : 0;", "const bx = narrow ? 0 : -3.3, by = narrow ? 2.5 : 0;")
s = s.replace("G.scale.setScalar(lerp(narrow ? 0.5 : 0.66, 0.25, e));", "G.scale.setScalar(lerp(narrow ? 0.4 : 0.66, 0.25, e));")
s = s.replace('<a href="#about" class="hide-s">About</a>', '<a href="#about-me" class="hide-s">About</a>')
s = s.replace("<title>Xcape Drzewo</title>", "<title>Xcape Portfolio v5</title>")
resp, img, vid = here.parents[2] / "images" / "responsive", here / "img", here / "vid"
import glob
RESP_ALL = {pathlib.Path(f).stem: pathlib.Path(f) for f in glob.glob(str(here.parents[2] / "images" / "responsive" / "*.webp"))}
IM = {"labinc": resp / "labinc-720.webp", "passmgr": resp / "passmgr-1-720.webp", "inventory": resp / "inventoryGen-720.webp", "axi": resp / "plain_axi4_lite-480.webp",
      "basys": resp / "basys3-fpga-board-480.webp", "cnc": resp / "cnc-eti-logo-480.webp", "jobm": img / "jobm-analysis-1600.webp", "yapper": img / "yapper-720.webp",
      "seeskyPoster": img / "seesky-poster.webp", "turfPoster": img / "turf-poster.webp", "invPoster": img / "inv-poster.webp",
      "florist-480": img / "florist-480.webp", "favicon": here.parents[2] / "images" / "favicon-48.png", "florist-720": img / "florist-720.webp"}
VI = {"seesky": vid / "seesky.webm", "turf": vid / "turf.webm", "inv": vid / "inv.webm", "seeskyTracking": vid / "seesky-tracking.webm", "factory": vid / "factory.webm", "factoryMp4": vid / "factory.mp4"}
IM.update({"factoryPoster": img / "factory-poster.webp", "seesky": img / "seesky-720.webp", "seeskyTrackingPoster": img / "seesky-tracking-poster.webp"})
for k in set(__import__("re").findall(r"%%IMG_([\w-]+)%%", s)):
    if k not in IM and k in RESP_ALL: IM[k] = RESP_ALL[k]
# obrazy i wideo jako osobne pliki obok strony (wcześniej data URI: 4,4 MB HTML i 2,5 s bez klatki przy ładowaniu)
import shutil
AS = here.parent / "v5-assets"; AS.mkdir(exist_ok=True)
def asset(f):
    shutil.copyfile(f, AS / f.name); return "v5-assets/" + f.name
for k, f in IM.items():
    if "%%IMG_" + k + "%%" in s: s = s.replace("%%IMG_" + k + "%%", asset(f))
for k, f in VI.items():
    if "%%VID_" + k + "%%" in s: s = s.replace("%%VID_" + k + "%%", asset(f))
# obrazki poza pierwszym ekranem: leniwie i bez blokowania dekodowania
s = __import__("re").sub(r'<img (?![^>]*loading=)', '<img loading="lazy" decoding="async" ', s)
# podpisy fabryki: rzut punktów sceny z Blendera (factory.py) na kadr
LBL = {"miner": "15.7%;--ly:22.2%", "smelter": "37.8%;--ly:48.5%", "sell": "69.1%;--ly:27.6%", "lab": "69.7%;--ly:56.4%"}
for k, v in LBL.items(): s = s.replace("%%LBL_" + k + "%%", v)
left = re.findall(r"%%[A-Z]+_\w+%%", s); assert not left, left
assert not any(c in s for c in "–—"), "dash"
# "Czym się teraz zajmuję": ostatnio pushowane repozytoria z v5/github.json (fetch_github.py)
import json
def now_list(lang, n=2):
    rows = [r for r in json.loads(part("github.json")) if not r.get("hide")][:n]
    li = []
    for r in rows:
        y, m, d = r["pushed"].split("-")
        when = f"{d}.{m}.{y}" if lang == "pl" else r["pushed"]
        txt = r.get("summary_" + lang) or r["description"]
        li.append(f'<li><a href="{r["url"]}"><b>{r["name"]}.</b></a> {txt} <span class="now__when mono">{when}</span></li>')
    return '<!--now--><ul class="lines">' + "".join(li) + "</ul><!--/now-->"
s = s.replace("%%NOW%%", now_list("en"))
# przełącznik EN / PL między plikami
s = s.replace('<a href="#pl" class="lang"><b>EN</b> / PL</a>', '<a href="v5-pl.html" class="lang" lang="pl"><b>EN</b> / PL</a>', 1)
(here.parent / "v5.html").write_text(s, encoding="utf8"); print("ok", len(s))
# wersja polska: słownik z v5/pl.py; każdy angielski tekst musi się znaleźć
import importlib.util
spec = importlib.util.spec_from_file_location("pl", here / "v5" / "pl.py"); pl = importlib.util.module_from_spec(spec); spec.loader.exec_module(pl)
spl, missing = s, []
for en, tr in pl.PL:
    if en not in spl: missing.append(en[:70]); continue
    spl = spl.replace(en, tr)
assert not missing, missing
spl = re.sub(r"<!--now-->.*?<!--/now-->", lambda _: now_list("pl"), spl, flags=re.S)
assert not any(c in spl for c in "\u2013\u2014"), "dash"
(here.parent / "v5-pl.html").write_text(spl, encoding="utf8"); print("ok pl", len(spl))
