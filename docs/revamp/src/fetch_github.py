"""Odświeża src/v5/github.json: publiczne repozytoria Xcape53, data ostatniego pusha i pierwszy akapit README.

Ręcznie wpisane pola (summary_en, summary_pl, now, hide) zostają przy odświeżeniu.
Użycie: python docs/revamp/src/fetch_github.py   (wymaga zalogowanego gh)
"""
import base64, json, pathlib, re, subprocess

USER = "Xcape53"
OUT = pathlib.Path(__file__).parent / "v5" / "github.json"
KEEP = ("summary_en", "summary_pl", "now", "hide")


def gh(*args):
    r = subprocess.run(["gh", *args], capture_output=True, text=True, encoding="utf-8")
    return r.stdout if r.returncode == 0 else None


def first_paragraph(md):
    """Pierwszy akapit prozy z README: bez nagłówków, obrazków, odznak, list i bloków kodu."""
    md = re.sub(r"```[\s\S]*?```", "", md)
    md = re.sub(r"<[^>]+>", "", md)
    for block in re.split(r"\n\s*\n", md):
        b = block.strip()
        if not b or b[0] in "#!|>-*[" or b.startswith(("![", "[![")) or re.match(r"\d+\.", b):
            continue
        b = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", b)
        b = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", b)
        b = re.sub(r"[*_`]", "", " ".join(b.split()))
        if len(b) > 40:
            return b[:400]
    return ""


def main():
    old = {r["name"]: r for r in json.loads(OUT.read_text(encoding="utf-8"))} if OUT.exists() else {}
    repos = json.loads(gh("repo", "list", USER, "--limit", "200", "--visibility", "public", "--source",
                          "--json", "name,description,url,pushedAt,primaryLanguage,isArchived"))
    out = []
    for r in sorted(repos, key=lambda r: r["pushedAt"], reverse=True):
        raw = gh("api", f"repos/{USER}/{r['name']}/readme", "--jq", ".content")
        readme = base64.b64decode(raw).decode("utf-8", "replace") if raw else ""
        row = {"name": r["name"], "url": r["url"], "pushed": r["pushedAt"][:10],
               "language": (r["primaryLanguage"] or {}).get("name", ""), "archived": r["isArchived"],
               "description": r["description"] or "", "readme": first_paragraph(readme)}
        row.update({k: old[r["name"]][k] for k in KEEP if k in old.get(r["name"], {})})
        out.append(row)
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{len(out)} repozytoriów -> {OUT}")


if __name__ == "__main__":
    assert first_paragraph("# T\n\n![b](x)\n\nA tool that does a real thing for real people.\n") == "A tool that does a real thing for real people."
    main()
