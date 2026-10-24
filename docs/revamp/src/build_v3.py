# Składa prototyp v3: hero z v2 (drzewo.tpl.html) + nowe sekcje z v3/, obrazy i wideo jako data URI.
import base64, pathlib, re
here = pathlib.Path(__file__).resolve().parent
v2 = (here / "drzewo.tpl.html").read_text(encoding="utf8")
part = lambda n: (here / "v3" / n).read_text(encoding="utf8")
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
# notatki domyślnie wyłączone
s = s.replace('  root.classList.add("notes");\n', "")
s = s.replace('aria-pressed="true">Notatki projektowe: wł.', 'aria-pressed="false">Notatki projektowe: wył.')
s = s.replace(".hero { position: relative; height: 190svh; }", ".hero { position: relative; height: 150svh; }")
s = s.replace("const bx = narrow ? 0 : -3.3, by = narrow ? 1.7 : 0;", "const bx = narrow ? 0 : -3.3, by = narrow ? 2.5 : 0;")
s = s.replace("G.scale.setScalar(lerp(narrow ? 0.5 : 0.66, 0.25, e));", "G.scale.setScalar(lerp(narrow ? 0.4 : 0.66, 0.25, e));")
s = s.replace("<title>Xcape Drzewo</title>", "<title>Xcape Portfolio v3</title>")
resp, img, vid = here.parents[2] / "images" / "responsive", here / "img", here / "vid"
IM = {"labinc": resp / "labinc-720.webp", "passmgr": resp / "passmgr-1-720.webp", "inventory": resp / "inventoryGen-720.webp", "axi": resp / "plain_axi4_lite-480.webp",
      "basys": resp / "basys3-fpga-board-480.webp", "cnc": resp / "cnc-eti-logo-480.webp", "jobm": img / "jobm-analysis-1600.webp", "yapper": img / "yapper-720.webp",
      "seeskyPoster": img / "seesky-poster.webp", "turfPoster": img / "turf-poster.webp", "invPoster": img / "inv-poster.webp"}
VI = {"seesky": vid / "seesky.webm", "turf": vid / "turf.webm", "inv": vid / "inv.webm"}
b64 = lambda f: base64.b64encode(f.read_bytes()).decode()
for k, f in IM.items(): s = s.replace("%%IMG_" + k + "%%", "data:image/webp;base64," + b64(f))
for k, f in VI.items(): s = s.replace("%%VID_" + k + "%%", "data:video/webm;base64," + b64(f))
left = re.findall(r"%%[A-Z]+_\w+%%", s); assert not left, left
assert not any(c in s for c in "–—"), "dash"
(here.parent / "v3.html").write_text(s, encoding="utf8"); print("ok", len(s))
