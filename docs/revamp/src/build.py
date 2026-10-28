# Składa wizualizacje: wstawia obrazki jako data URI (artefakt nie może ładować plików z repo).
import base64, pathlib
here = pathlib.Path(__file__).resolve().parent
resp = here.parents[2] / "images" / "responsive"
loc = here / "img"
SRC = {
    "jobagg": resp / "jobagg-1-720.webp", "labinc": resp / "labinc-720.webp", "passmgr": resp / "passmgr-1-720.webp",
    "inventory": resp / "inventoryGen-720.webp", "axi": resp / "plain_axi4_lite-480.webp", "basys": resp / "basys3-fpga-board-480.webp",
    "cnc": resp / "cnc-eti-logo-480.webp", "jobm": loc / "jobm-analysis-720.webp", "seesky": loc / "seesky-720.webp", "yapper": loc / "yapper-720.webp",
}
for name in ["odbiornik", "drzewo"]:
    s = (here / (name + ".tpl.html")).read_text(encoding="utf8")
    for k, f in SRC.items():
        s = s.replace("%%IMG_" + k + "%%", "data:image/webp;base64," + base64.b64encode(f.read_bytes()).decode())
    assert "%%IMG_" not in s, name
    (here.parent / (name + ".html")).write_text(s, encoding="utf8")
    print("ok", name, len(s))
