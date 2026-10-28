"""Publikuje prototyp v5 jako stronę: /en/index.html, /pl/index.html, /media/ i przekierowanie na /.

Uruchom po build_v5.py:  python docs/revamp/src/publish_v5.py
Czyta docs/revamp/v5.html i v5-pl.html, podmienia ścieżki, dokłada metadane SEO ze starej strony.
"""
import pathlib, re, shutil

here = pathlib.Path(__file__).resolve().parent
rev, root = here.parent, here.parents[2]
SITE = "https://piotrjeleniewicz.com/"

# zasoby wspólne dla obu wersji
media = root / "media"
if media.exists():
    shutil.rmtree(media)
shutil.copytree(rev / "v5-assets", media)

# JSON-LD (Person, WebSite, ProfilePage) przeniesione bez zmian ze starej strony
old = (rev / "src" / "seo-jsonld.html").read_text(encoding="utf8")

META = {
    "en": ("Piotr Jeleniewicz | Software development &amp; system integration", "en_US", "pl_PL"),
    "pl": ("Piotr Jeleniewicz | Tworzenie oprogramowania i integracja systemów", "pl_PL", "en_US"),
}


def head(lang, desc):
    title, loc, alt = META[lang]
    url = SITE + lang + "/"
    return f"""<title>{title}</title>
<link rel="canonical" href="{url}">
<link rel="alternate" hreflang="en" href="{SITE}en/">
<link rel="alternate" hreflang="pl" href="{SITE}pl/">
<link rel="alternate" hreflang="x-default" href="{SITE}en/">
<meta name="author" content="Piotr Jeleniewicz">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#020816">
<meta property="og:type" content="profile">
<meta property="og:site_name" content="Piotr Jeleniewicz">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}images/social-preview.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="{loc}">
<meta property="og:locale:alternate" content="{alt}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:image" content="{SITE}images/social-preview.png">
<link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png">
{old}"""


def publish(src, lang, other):
    s = (rev / src).read_text(encoding="utf8")
    desc = re.search(r'<meta name="description" content="([^"]*)">', s).group(1)
    s = re.sub(r"<title>[^<]*</title>", lambda _: head(lang, desc), s, count=1)
    s = s.replace("v5-assets/", "../media/")
    s = s.replace('href="v5-pl.html"', 'href="../pl/"').replace('href="v5.html"', 'href="../en/"')
    # przełącznik notatek projektowych to narzędzie prototypu, nie treść strony
    s = s.replace("</style>", ".notes-toggle { display: none !important; }\n</style>", 1)
    assert "v5-assets" not in s and "v5-pl.html" not in s and "v5.html" not in s, lang
    out = root / lang / "index.html"
    out.parent.mkdir(exist_ok=True)
    out.write_text(s, encoding="utf8")
    print("ok", out.relative_to(root), len(s))


publish("v5.html", "en", "pl")
publish("v5-pl.html", "pl", "en")

# / wybiera język przeglądarki; bez JS prowadzi do wersji angielskiej
(root / "index.html").write_text("""<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Piotr Jeleniewicz</title>
<meta name="description" content="Piotr Jeleniewicz: software development and system integration.">
<link rel="canonical" href="https://piotrjeleniewicz.com/en/">
<link rel="alternate" hreflang="en" href="https://piotrjeleniewicz.com/en/">
<link rel="alternate" hreflang="pl" href="https://piotrjeleniewicz.com/pl/">
<link rel="alternate" hreflang="x-default" href="https://piotrjeleniewicz.com/en/">
<link rel="icon" type="image/png" sizes="48x48" href="/images/favicon-48.png">
<meta http-equiv="refresh" content="1; url=en/">
<style>body { margin: 0; min-height: 100vh; background: #020816; }</style>
<script>location.replace(/^pl\\b/i.test(navigator.language || "") ? "pl/" : "en/");</script>
<body><noscript><a href="en/">English</a> / <a href="pl/">Polski</a></noscript></body>
</html>
""", encoding="utf8")

(root / "sitemap.xml").write_text("""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://piotrjeleniewicz.com/en/</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://piotrjeleniewicz.com/en/" />
    <xhtml:link rel="alternate" hreflang="pl" href="https://piotrjeleniewicz.com/pl/" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://piotrjeleniewicz.com/en/" />
  </url>
  <url>
    <loc>https://piotrjeleniewicz.com/pl/</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://piotrjeleniewicz.com/en/" />
    <xhtml:link rel="alternate" hreflang="pl" href="https://piotrjeleniewicz.com/pl/" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://piotrjeleniewicz.com/en/" />
  </url>
  <url>
    <loc>https://piotrjeleniewicz.com/inventoryGen/</loc>
  </url>
</urlset>
""", encoding="utf8")
print("ok index.html, sitemap.xml")
