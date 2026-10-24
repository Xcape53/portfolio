"""Generate the crawlable Polish page from index.html and js/i18n.js."""

from __future__ import annotations

import json
import re
from pathlib import Path

from bs4 import BeautifulSoup, Comment, NavigableString


ROOT = Path(__file__).resolve().parents[1]
SOURCE_HTML = ROOT / "index.html"
TRANSLATIONS_JS = ROOT / "js" / "i18n.js"
OUTPUT_HTML = ROOT / "pl" / "index.html"
HTML_DOCUMENT_PARSER = "lxml"


def read_translations() -> dict[str, dict[str, str]]:
    source = TRANSLATIONS_JS.read_text(encoding="utf-8")
    marker = "const translations = "
    start = source.index(marker) + len(marker)
    end = source.index(";\n\n  const isPolishPage", start)
    object_literal = source[start:end]
    object_literal = re.sub(r"(?m)^(\s+)(en|pl):", r'\1"\2":', object_literal)
    return json.loads(object_literal)


def set_meta(soup: BeautifulSoup, attributes: dict[str, str], value: str) -> None:
    element = soup.find("meta", attrs=attributes)
    if element is not None:
        element["content"] = value


def localize_content(soup: BeautifulSoup, dictionary: dict[str, str]) -> None:
    for element in soup.find_all(attrs={"data-i18n": True}):
        key = element.get("data-i18n")
        if key not in dictionary:
            continue
        translated_content = dictionary[key]
        element.clear()
        if "<" not in translated_content and "&" not in translated_content:
            element.append(NavigableString(translated_content))
            continue

        fragment = BeautifulSoup(translated_content, "html.parser")
        for child in list(fragment.contents):
            element.append(child)


def customize_polish_navigation(soup: BeautifulSoup) -> None:
    """Apply navigation differences that are specific to the Polish page."""
    navigation = soup.find("nav")
    if navigation is None:
        return

    cv_link = navigation.find(attrs={"data-i18n": "nav.cv"})
    if cv_link is None:
        return

    navigation_item = cv_link.find_parent("li")
    element_to_remove = navigation_item or cv_link
    previous_sibling = element_to_remove.previous_sibling
    next_sibling = element_to_remove.next_sibling
    element_to_remove.decompose()

    if isinstance(previous_sibling, NavigableString) and isinstance(next_sibling, NavigableString):
        next_sibling.extract()


def prefix_relative_assets(soup: BeautifulSoup) -> None:
    def prefixed(value: str) -> str:
        if not value or value.startswith(("#", "/", "http://", "https://", "mailto:", "tel:", "data:")):
            return value
        return "../" + value.removeprefix("./")

    for attribute in ("href", "src", "data-full-src", "data-view-src"):
        for element in soup.find_all(attrs={attribute: True}):
            value = element.get(attribute, "")
            element[attribute] = prefixed(value)

    for attribute in ("srcset", "data-view-srcset"):
        for element in soup.find_all(attrs={attribute: True}):
            candidates = []
            for candidate in element.get(attribute, "").split(","):
                parts = candidate.strip().split()
                if not parts:
                    continue
                parts[0] = prefixed(parts[0])
                candidates.append(" ".join(parts))
            element[attribute] = ", ".join(candidates)

    for element in soup.find_all(attrs={"style": True}):
        element["style"] = element["style"].replace("url(images/", "url(../images/")


def generate() -> None:
    translations = read_translations()
    soup = BeautifulSoup(SOURCE_HTML.read_text(encoding="utf-8"), HTML_DOCUMENT_PARSER)
    soup.html["lang"] = "pl"
    localize_content(soup, translations["pl"])
    customize_polish_navigation(soup)

    soup.title.string = "Piotr Jeleniewicz | Software and Automation"
    set_meta(
        soup,
        {"name": "description"},
        "Piotr Jeleniewicz - student ostatniego semestru PG. Integracje aplikacji, automatyzacja procesów i projekty tworzone z AI. Gdynia, Trójmiasto.",
    )
    set_meta(soup, {"property": "og:title"}, "Piotr Jeleniewicz | Software and Automation")
    set_meta(
        soup,
        {"property": "og:description"},
        "Piotr Jeleniewicz - student ostatniego semestru PG. Integracje aplikacji, automatyzacja procesów i projekty tworzone z AI. Gdynia, Trójmiasto.",
    )
    set_meta(soup, {"property": "og:url"}, "https://piotrjeleniewicz.com/pl/")
    set_meta(soup, {"property": "og:locale"}, "pl_PL")
    set_meta(soup, {"property": "og:locale:alternate"}, "en_US")
    set_meta(soup, {"property": "og:image:alt"}, "Portfolio Piotra Jeleniewicza - elektronika i oprogramowanie")
    set_meta(soup, {"name": "twitter:title"}, "Piotr Jeleniewicz | Software and Automation")
    set_meta(
        soup,
        {"name": "twitter:description"},
        "Piotr Jeleniewicz - student ostatniego semestru PG. Integracje aplikacji, automatyzacja procesów i projekty tworzone z AI. Gdynia, Trójmiasto.",
    )
    set_meta(soup, {"name": "twitter:image:alt"}, "Portfolio Piotra Jeleniewicza - elektronika i oprogramowanie")

    canonical = soup.find("link", rel="canonical")
    if canonical is not None:
        canonical["href"] = "https://piotrjeleniewicz.com/pl/"

    language_toggle = soup.find(id="lang-toggle")
    language_options = [] if language_toggle is None else language_toggle.find_all(attrs={"data-lang-option": True})
    for option in language_options:
        is_active = option.get("data-lang-option") == "pl"
        classes = [name for name in option.get("class", []) if name != "is-active"]
        if is_active:
            classes.append("is-active")
            option["aria-current"] = "page"
        else:
            option.attrs.pop("aria-current", None)
        if classes:
            option["class"] = classes
        else:
            option.attrs.pop("class", None)

    structured_data = soup.find("script", attrs={"type": "application/ld+json"})
    if structured_data is not None and structured_data.string:
        data = json.loads(structured_data.string)
        for entity in data.get("@graph", []):
            if entity.get("@type") == "ProfilePage":
                entity["@id"] = "https://piotrjeleniewicz.com/pl/#profile"
                entity["url"] = "https://piotrjeleniewicz.com/pl/"
                entity["name"] = "Piotr Jeleniewicz - Software and Automation Portfolio"
                entity["description"] = "Piotr Jeleniewicz - student ostatniego semestru PG. Integracje aplikacji, automatyzacja procesów i projekty tworzone z AI. Gdynia, Trójmiasto."
                entity["inLanguage"] = "pl"
            elif entity.get("@type") == "Person":
                entity["jobTitle"] = "Student Elektroniki i Telekomunikacji"
                entity["description"] = "Student ostatniego semestru Elektroniki i Telekomunikacji na PG, zainteresowany integracją systemów, automatyzacją procesów i tworzeniem aplikacji z AI."
                entity["homeLocation"]["name"] = "Gdynia, Polska"
                entity["affiliation"]["name"] = "Politechnika Gdańska"
        structured_data.string = "\n" + json.dumps(data, ensure_ascii=False, indent=2) + "\n"

    prefix_relative_assets(soup)
    soup.insert(1, Comment(" Generated by scripts/generate_pl.py. Do not edit this file by hand. "))
    soup.insert(2, "\n")
    OUTPUT_HTML.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_HTML.write_text(str(soup), encoding="utf-8", newline="\n")


if __name__ == "__main__":
    generate()
