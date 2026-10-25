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
s = s.replace('<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>', '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/d3-celestial@0.7.35/celestial.css">\n<script src="https://cdn.jsdelivr.net/npm/d3@3.5.17/d3.min.js"></script>\n<script src="https://cdn.jsdelivr.net/npm/d3-celestial@0.7.35/lib/d3.geo.projection.min.js"></script>\n<script src="https://cdn.jsdelivr.net/npm/d3-celestial@0.7.35/celestial.min.js"></script>', 1)
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
      "seeskyPoster": img / "seesky-poster.webp", "turfPoster": img / "turf-poster.webp", "invPoster": img / "inv-poster.webp"}
VI = {"seesky": vid / "seesky.webm", "turf": vid / "turf.webm", "inv": vid / "inv.webm", "seeskyTracking": vid / "seesky-tracking.webm", "factory": vid / "factory.webm", "factoryMp4": vid / "factory.mp4"}
IM.update({"factoryPoster": img / "factory-poster.webp", "seesky": img / "seesky-720.webp", "seeskyTrackingPoster": img / "seesky-tracking-poster.webp"})
for k in set(__import__("re").findall(r"%%IMG_([\w-]+)%%", s)):
    if k not in IM and k in RESP_ALL: IM[k] = RESP_ALL[k]
b64 = lambda f: base64.b64encode(f.read_bytes()).decode()
for k, f in IM.items():
    if "%%IMG_" + k + "%%" in s: s = s.replace("%%IMG_" + k + "%%", "data:image/webp;base64," + b64(f))
for k, f in VI.items():
    if "%%VID_" + k + "%%" in s: s = s.replace("%%VID_" + k + "%%", "data:video/" + f.suffix[1:] + ";base64," + b64(f))
# podpisy fabryki: rzut punktów sceny z Blendera (factory.py) na kadr
LBL = {"miner": "15.7%;--ly:22.2%", "smelter": "37.8%;--ly:48.5%", "sell": "69.1%;--ly:27.6%", "lab": "69.7%;--ly:56.4%"}
for k, v in LBL.items(): s = s.replace("%%LBL_" + k + "%%", v)
left = re.findall(r"%%[A-Z]+_\w+%%", s); assert not left, left
assert not any(c in s for c in "–—"), "dash"
(here.parent / "v5.html").write_text(s, encoding="utf8"); print("ok", len(s))
