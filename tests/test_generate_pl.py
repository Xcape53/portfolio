"""Regression tests for the generated Polish portfolio page."""

from __future__ import annotations

import sys
import unittest
from pathlib import Path

from bs4 import BeautifulSoup


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from scripts import generate_pl  # noqa: E402


class PolishPageGenerationTests(unittest.TestCase):
    def test_cv_is_removed_only_from_polish_navigation(self) -> None:
        soup = BeautifulSoup(
            generate_pl.SOURCE_HTML.read_text(encoding="utf-8"),
            generate_pl.HTML_DOCUMENT_PARSER,
        )
        translations = generate_pl.read_translations()
        source_navigation = soup.find("nav")
        self.assertIsNotNone(source_navigation)
        self.assertIsNotNone(source_navigation.find(attrs={"data-i18n": "nav.cv"}))

        generate_pl.localize_content(soup, translations["pl"])
        generate_pl.customize_polish_navigation(soup)

        navigation = soup.find("nav")
        self.assertIsNotNone(navigation)
        self.assertIsNone(navigation.find(attrs={"data-i18n": "nav.cv"}))
        banner_cv = soup.find(attrs={"data-i18n": "banner.download"})
        footer_cv = soup.find(attrs={"data-i18n": "contact.cv"})
        self.assertIsNotNone(banner_cv)
        self.assertIsNotNone(footer_cv)
        self.assertIn("Poproś o CV", banner_cv.get_text(" ", strip=True))
        self.assertEqual("Poproś o CV", footer_cv.get_text(" ", strip=True))


if __name__ == "__main__":
    unittest.main()
