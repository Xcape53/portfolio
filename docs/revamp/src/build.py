# Sklada wizualizacje: wstawia zrzuty ekranu jako data URI (artefakt nie moze ladowac plikow z repo).
import base64, pathlib
here = pathlib.Path(__file__).resolve().parent
img = here.parents[2] / "images" / "responsive"
src = {"jobagg": "jobagg-1-720.webp", "labinc": "labinc-720.webp", "passmgr": "passmgr-1-720.webp", "inventory": "inventoryGen-720.webp"}
s = (here / "odbiornik.tpl.html").read_text(encoding="utf8")
for k, f in src.items():
    s = s.replace("%%IMG_" + k + "%%", "data:image/webp;base64," + base64.b64encode((img / f).read_bytes()).decode())
assert "%%IMG_" not in s
(here.parent / "odbiornik.html").write_text(s, encoding="utf8")
print("ok", len(s))
