# Prompt dla następnej sesji: revamp portfolio piotrjeleniewicz.com

Przejmujesz projekt przebudowy mojego portfolio (Piotr Jeleniewicz / Xcape). Poprzednia sesja zrobiła research, 4 wersje prototypu i dużo poprawek, ale efekt jest średni. Twoje zadanie: zrobić z tego naprawdę dobrą stronę, używając WSZYSTKICH dostępnych narzędzi (skille, serwery MCP, programy na moim komputerze). Działaj samodzielnie, podejmuj decyzje, pokazuj mi wizualnie efekty. Nie zasypuj mnie pytaniami.

## Gdzie co jest

- Repo: `Xcape53/portfolio`, gałąź robocza `claude/sleepy-sagan-7236fr` (wszystko z poprzedniej sesji jest tam wypchnięte). `main` publikuje się automatycznie na GitHub Pages, więc NIC nie trafia na `main` bez mojej zgody.
- Najpierw przeczytaj `CLAUDE.md` i `AGENTS.md` w repo. Najważniejsze zasady: przed większą zmianą designu zrób świeży backup (stała zasada), nigdy nie używaj znaków U+2013 i U+2014 (tylko zwykły `-`), komentarze w `js/effects.js` i `js/animacja-banner.js` po polsku, nie commituj folderów `.claude/` ani `.agents/`.
- Prototypy (pojedyncze pliki HTML, obrazy i wideo wklejone jako data URI): `docs/revamp/`
  - `v4.html`: aktualna wersja. Źródła w `docs/revamp/src/v4/` (`sections.html`, `sections.css`, `sections.js`, `mobile.css`). Składa ją `python docs/revamp/src/build_v4.py`: bierze hero z `src/drzewo.tpl.html` (v2) i dokleja sekcje z `src/v4/`.
  - `drzewo.html` (v2), `v3.html`, `odbiornik.html` (v1): odrzucone wersje, tylko do wglądu.
  - `DESIGN.md`: plan i historia decyzji. `proposals/`: dwie propozycje designu z v3. `src/vid/`: prawdziwe nagrania z moich dem (SeeSky mapa nieba i tracking, Turf Matchmaking, Inventory Generator). `src/img/`: zrzuty i postery.
- Research (po polsku): `reports/Revamp portfolio 3D paralaksa wideo.md` + `research_notes/`. Są tam komendy ffmpeg, pipeline GLB (gltf-transform, Meshopt), poprawna konfiguracja Lenis + ScrollTrigger i lista skilli.
- Obecna strona produkcyjna: `index.html`, `pl/index.html` (generowany przez `scripts/generate_pl.py` z `js/i18n.js`), `css/style.css` (+ `scripts/build_css.py`), `js/effects.js`, `js/animacja-banner.js` (dane mojego symbolu: 43 węzły, dwie gałęzie z węzła 0).
- Moje inne repo: profil `Xcape53/Xcape53` (README, kolory i nagłówki), `Xcape53/SeeSky-tracking` (gałąź `gh-pages` to statyczne demo UI), `Xcape53/jobManager` (prywatne). Dane profilu z jobManagera są tylko lokalnie: `C:\Program Files\.NOT_INSTALLED\jobManager\data` (nie kopiuj danych osobowych na stronę bez pytania).

## Kim jestem i jak mam być pokazany

Software development i system integration, z wiedzą elektroniczną w tle. Buduję aplikacje i narzędzia do automatyzacji, które łączą API, dane i usługi AI (Python, JavaScript, REST, Git; też C/C++, Java, Docker, Linux). Myślę strukturalnie: rozkładam problem jak drzewo (kategoria, podkategoria, połączenia), a automatyzacja to ten sposób myślenia w praktyce. Elektronika (LTspice, Micro-Cap, KiCad, EAGLE, Vivado, Basys 3) to dodatek: dzięki niej mogę robić systemy wbudowane, IoT i software gadający ze sprzętem. Ostatni semestr Elektroniki i Telekomunikacji na PG. Szukam płatnego stażu albo pierwszej pracy na część etatu, zdalnie lub hybrydowo w Trójmieście.

## Marka (nie zmieniać)

Granat `#020816` z poświatą w lewym górnym rogu (`#0a2a78`, jak `images/banner_bg.jpg`), panel `#0e1216`, tekst `#b1b1b1`, primary `#2c7ffe`, secondary `#642efd`, gradient `#2c7ffe` do `#642efd`. Fonty: Spline Sans, Poppins (wielkie LET'S TALK), Spline Sans Mono do drobnych odczytów. Mój symbol: drzewo/graf rosnący z jednego węzła (favicon, animacja D3 na banerze), neonowa poświata.

## Historia feedbacku (żeby nie powtarzać błędów)

- v1: koncept "odbiornik radioteleskopu", nowa paleta, dużo elektroniki i FPGA. Odrzucona: nie moje kolory i symbole, za dużo elektroniki.
- v2: hero z moim symbolem w 3D. **Hero mi się podoba i zostaje.** Reszta odrzucona: brzydkie drzewo SVG, tekst niewidoczny za przyklejoną (sticky) sceną, słabe "wideo" (zrzuty z udawanym paskiem postępu).
- v3: koncept z kropkami/węzłami, wielkie fonty. Odrzucona: bałagan, za dużo kropek (lista ma być listą, BEZ kropek i znaczników), czcionki "wielkości Jupitera", grafiki rozciągnięte i rozmyte.
- v4: układ obecnej strony, dopracowany, z animacjami 3D projektów. Średnio. Uwagi niżej.
- Ogólnie: miałeś bazować na mojej obecnej stronie i zrobić ją ładniejszą, a nie wymyślać koncept od zera. Unikaj wyglądu "AI slop" (gradientowe pionowe linie ze świecącymi kropkami, paski postępu, generyczne kafelki, zabawki 3D z prostych brył).

## Co ma zostać (podoba mi się)

- Hero z v2/v4 (symbol 3D, paralaksa węzłów, "Hello, I am", przyciski).
- Sekcja "What I build" ze zdjęciami nakładającymi się na siebie i zmieniającymi kolejność, jak symulacja nakładających się zakładek/okien. **Chcę więcej zdjęć niż 3** (np. 6-8 moich zrzutów z `images/responsive/` i `images/set/`), żeby efekt był pełniejszy.
- Animacja radioteleskopu przy SeeSky.
- Układ stopki/kontaktu (LET'S TALK + dane kontaktowe po prawej).
- About me i tekst "How I build with AI" są lepsze niż wcześniej, ale do dopracowania.

## Co zmienić

1. **Oscyloskop (separator z sinusem):** przejście w szereg Fouriera fali prostokątnej ma być **stopniowe**, a nie skokowe. Teraz po najechaniu kursorem kształt wskakuje od razu. Ma płynnie narastać i zanikać w czasie (wygładzony współczynnik mieszania, kolejne harmoniczne dochodzą po kolei, wygładzona pozycja kursora).
2. **From circuits to code:** przemyśl od nowa.
3. **From theory to practice (edukacja):** przerób. Teraz z moją kolorystyką wygląda jak AI slop.
4. **Things I have built, czyli główna uwaga: animacje projektów.**
   - SeeSky: teleskop zostaje (można dopracować).
   - JobManager: nie musi być 3D, ma być ładna animacja w **trzech krokach**: (1) oferty z różnych portali wpadają do jednej listy, każda na swoje miejsce; (2) efekt skanowania (research); (3) wybrane oferty są wysyłane dalej i pojawia się ikona powiadomienia.
   - LabInc: Chemical Tycoon: **izometryczna fabryka w stylu Satisfactory**, która pracuje i wypluwa pierwiastki. Pierwiastki idą taśmami w **dwie odnogi: do sprzedaży i do researchu**.
   - Przemyśl całą scenerię tych animacji: poprzednia wersja dała wszystkim ten sam generyczny widok 3D, a modele wyglądały jak "model 3D od Gemini z 2024" (np. żółta wieża w LabInc). Poziom jakości ma być wysoki: porządne modele, materiały, światło, kompozycja, płynny ruch.
5. **More of my work:** teraz to generyczne kafelki. Zrób to ciekawiej, ale czytelnie.
6. **About me + tekst o AI:** dopracuj treść i układ.
7. **EMAIL ME:** nie kula. Inny kształt: może mój symbol, może inna forma albo animacja.

## Narzędzia: używaj wszystkiego

- Skille (zainstaluj, jeśli ich nie ma; przed instalacją przeczytaj SKILL.md, instaluj tylko od oryginalnych właścicieli): `greensock/gsap-skills`, `CloudAI-X/threejs-skills`, `juliobsz/skills` (`/awwwards` do procesu i `/jury` do ślepej oceny), opcjonalnie `heygen-com/hyperframes` lub `remotion-dev/skills` do rolek wideo, `wheresryan22/anatomy` do izometrycznych ilustracji.
- Serwery MCP: mam programy na komputerze, więc możesz podłączyć np. Blender MCP (`ahujasid/blender-mcp`) i zrobić porządne modele (fabryka Satisfactory, teleskop), wyrenderować je albo wyeksportować do GLB (potem `gltf-transform optimize --compress meshopt`). Sprawdź też dostępne MCP (Figma, Canva, Playwright) i użyj tego, co pomaga. Do 2D animacji rozważ SVG + GSAP, Rive albo Lottie zamiast Three.js tam, gdzie wyjdzie ładniej.
- Weryfikacja: oglądaj każdą zmianę na screenshotach (desktop 1440, telefon 390, reduced motion). Playwright mam w `C:\Users\user1\Documents\ROBOTA\node_modules`. Po każdej większej iteracji odpal świeżego, ślepego krytyka (`/jury` albo rubryka z `quality-bar.md`) i popraw to, co wskaże.
- Technika: jeden zegar animacji (gsap.ticker), Lenis spięty z ScrollTriggerem według przepisu z raportu, render tylko widocznych scen, LCP z tekstu, pełna wersja bez ruchu dla reduced motion.

## Jak pracować

1. Przeczytaj `DESIGN.md`, otwórz `docs/revamp/v4.html` i obejrzyj go na screenshotach, żeby zobaczyć stan wyjściowy.
2. Iteruj na prototypie (`docs/revamp/src/v4/` albo nowy `v5/`) i pokazuj mi wyniki. Komentarze i commity na gałęzi roboczej.
3. Gdy zaakceptuję wygląd, przenieś to na prawdziwą stronę (`index.html`, `pl/`, `css/`, `js/`) na osobnej gałęzi, po zrobieniu backupu. Na `main` dopiero po mojej zgodzie.
