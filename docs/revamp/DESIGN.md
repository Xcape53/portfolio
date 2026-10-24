# Revamp portfolio: koncept "Odbiornik 1420"

Plan nowej strony piotrjeleniewicz.com. Proces wzięty ze skilla `/awwwards` (juliobsz/skills): brief, trzy koncepty, system art direction, test generyczności. Research źródłowy: `reports/Revamp portfolio 3D paralaksa wideo.md` oraz `research_notes/Revamp portfolio 3D paralaksa wideo/`.

Wizualizacja (klikalny prototyp z notatkami): `docs/revamp/odbiornik.html`, źródło w `docs/revamp/src/` (`python docs/revamp/src/build.py` składa plik z obrazkami).

## 0. Brief

- **Kto:** Piotr Jeleniewicz, ostatni semestr Elektroniki i Telekomunikacji na PG (Komputerowe Systemy Elektroniczne), lead software developer radioteleskopu SeeSky w kole SimLE, Gdynia.
- **Dla kogo:** rekruterzy i tech leadzi szukający stażysty lub juniora w software / integracji systemów; w drugiej kolejności ludzie od embedded i IoT.
- **Zadanie strony:** w 3 sekundy pokazać "inżynier, który pisze software między sprzętem a danymi", w 30 sekund przekonać projektami, a potem doprowadzić do maila albo prośby o CV.
- **Wymagania od Ciebie:** minimalistycznie, ale z paralaksą, modelami 3D i filmami projektów. Ma być zajebiście.
- **Ograniczenia:** hosting zostaje na GitHub Pages (statyczne pliki), EN + PL, reduced motion i telefon muszą działać.

## 1. Koncepcje (trzy terytoria)

| | A. Odbiornik (materiał zawodu) | B. Datasheet (system formalny) | C. Port Gdynia (miejsce) |
|---|---|---|---|
| Idea | Strona to tor sygnałowy radioteleskopu: scroll prowadzi sygnał od anteny przez elektronikę i FPGA do software'u, szum zamienia się w czysty sygnał | Strona to karta katalogowa układu PJ-2027: pinout, charakterystyki, aplikacja typowa | Sygnały morskie i modernizm Gdyni: flagi sygnałowe, linia horyzontu, światło latarni |
| Kotwica | SeeSky obserwuje linię wodoru 1420.405 MHz; studia z telekomunikacji; hasło "From Circuits to Code" | elektronik czyta datasheety codziennie | mieszka w Gdyni |
| Moment podpisu | Loader przemiata częstotliwość i "łapie" pik wodoru, czasza 3D namierza niebo, potem jedna płytka PCB niesie sygnał przez 4 rozdziały | najechanie na pin pokazuje umiejętność | wiadomość składana z flag |
| O / F / Fe / P | 5 / 5 / 3 / 1 | 4 / 4 / 5 / 3 | 3 / 2 / 3 / 3 |

**Wybór: A.** Najmocniej przypięty do Ciebie (nikt inny nie prowadzi software'u radioteleskopu), daje naturalne miejsce na modele 3D, paralaksę i wideo, a research nie znalazł żadnego nagradzanego portfolio inżyniera elektroniki z takim motywem. **Z B kradniemy sekcję O mnie** (karta katalogowa), **z A robimy 404**: "NO SIGNAL", sam szum na spektrogramie i przycisk "Retune" do strony głównej.

## 2. Concept Card

```
Idea:        Strona to odbiornik: scroll prowadzi sygnał od anteny do wyjścia, a szum zamienia się w moją pracę.
Metafora:    tor sygnałowy radioteleskopu (antena, front end, FPGA, software, wyjście)
Podpis:      czasza 3D namierzająca niebo + jedna płytka PCB, po której sygnał płynie ze scrollem
Emocja:      cisza nocnego nieba, potem precyzyjne "zatrzaśnięcie" na sygnale
Czasownik:   dostroić się / zatrzasnąć (lock on): rzeczy wchodzą z szumu i ostro się ustawiają
Screenshot:  ciemne niebo, czasza 3D, ogromne PIOTR JELENIEWICZ i w rogu odczyt 1420.405 MHz
```

Odczyt w prawym dolnym rogu to jedna zmienna sterująca (driver): postęp strony daje SNR i nazwę etapu (antenna, front end, FPGA, software). W spoczynku czasza dalej powoli śledzi niebo, gwiazdy migoczą, spektrogram płynie, więc strona żyje także bez scrolla.

## 3. System art direction

**Paleta** (jeden ciemny świat, jedna motywowana zmiana tła w datasheecie):

| Rola | Hex | Skąd |
|---|---|---|
| ground | `#06080b` | nocne niebo |
| ink | `#e8ebee` | tekst |
| muted | `#8d96a3` | tekst drugorzędny (AA na ground) |
| line | `rgba(232,235,238,.13)` | linie siatki |
| trace | `#5aa9ff` | ślad oscyloskopu, jedyny "kolor danych" |
| lock | `#ffd25e` | szczyt widma: lock, focus, zaznaczenie. Używany rzadko |
| paper / paper-ink | `#f2f3f1` / `#0b0d10` | karta katalogowa |

Kolory fałszywego koloru (ciemny granat, niebieski, cyjan, żółty, biel) pojawiają się tylko w spektrogramie i w odsłonie podglądów, bo tak wygląda prawdziwy wodospad widma z radioteleskopu.

Odrzucamy obecny fioletowo-niebieski gradient banera (to jeden z "AI defaults").

**Typografia:**
- Display: **Archivo** (zmienna oś szerokości 62-125). Szerokość jest częścią konceptu: w intro nazwisko rozszerza się z 62 do 100, jak sygnał łapiący pasmo. Hover w indeksie projektów też rozszerza tytuł.
- Tekst i UI: **Host Grotesk**.
- Odczyty (częstotliwość, SNR, współrzędne, timecode wideo): **Martian Mono**. Tylko tam, gdzie mono niesie realne dane, nie na każdej etykiecie.

**Siatka:** 12 kolumn, margines = gutter, dwie mocne linie: kolumna 1 i 6 (start tekstu sekcji). Rytm sekcji zmienny: hero pełny ekran, tor sygnałowy 4 x ekran, indeks gęsty, case SeeSky oddychający, datasheet zwarty, kontakt plakatowy.

**Kształt:** promień 2 px na przyciskach, 0 wszędzie indziej. Żadnych kart z cieniem.

**Ruch:** jeden ease `expo.out` (`cubic-bezier(.16,1,.3,1)`), hover 0,25-0,5 s, odsłony 1,1 s. Zabiegi wg roli:
- nawigacja: przewinięcie etykiety (letter roll) w kolor lock,
- przyciski: wypełnienie od dołu,
- projekty: tytuł się rozszerza (oś wdth) + podgląd odsłaniany "wodospadem",
- kursor natywny zostaje zawsze.

**Ramka:** cztery rogi. TL imię, TR nawigacja (Work, Datasheet, CV, Contact, PL), BL współrzędne Gdyni + lokalny czas, BR odczyt odbiornika. Górne rogi chowają się przy scrollu w dół, dolne są w `mix-blend-mode: difference`, żeby były czytelne na papierze i na wideo.

## 4. Mapa strony i układ sekcji

```
/                 hero (antena) > tor sygnałowy (4 rozdziały) > indeks prac > case SeeSky > datasheet > kontakt
/work/<projekt>   case study: tytuł + meta > wideo hero > problem > jak działa > szczegóły (wideo + zrzuty z podpisami) > wynik > następny projekt
/pl/...           to samo po polsku
/404              NO SIGNAL
```

Każda sekcja ma inną rodzinę układu (zasada skilla):

```
HERO (scena 3D, sticky 200svh)          TOR SYGNAŁOWY (sticky narrative)
+--------------------------------+      +-------------+------------------+
| teza (3 linie)        [czasza] |      | 01 Antenna  |   [PCB 3D]       |
| [See the work] [CV]     3D     |      | tytuł       |   sygnał płynie  |
|                                |      | tekst       |------------------|
| PIOTR                          |      | narzędzia   | [oscyloskop]     |
| JELENIEWICZ          1420.405  |      +-------------+------------------+
+--------------------------------+      (lewa kolumna scrolluje, prawa stoi)

INDEKS PRAC (index list + podgląd)      CASE SEESKY (asymetryczna para)
+--------------------------------+      +----------------------+---------+
| Selected work     | opis        |      |                      | kicker  |
|--------------------------------|      |   WIDEO 16:9         | tytuł   |
| JobManager   opis      In use  |  [p] |   (wolniej, parallax)| tekst   |
| SeeSky       opis      Lead    |  [o] |                      | [case]  |
| LabInc       opis      Shipped |  [d] +----------------------+---------+
+--------------------------------+

DATASHEET (papier)                      KONTAKT (plakat / finał)
+---------------+----------------+      ~~~~~~ oscyloskop (Fourier) ~~~~~~
| pinout chipu  | charakterystyki|      LET'S TALK (outline, wypełnia się)
| (piny=skille) | historia rewizji|     jeleniewicz@op.pl  [Copy]   tekst
| opis pinu     | aplikacja typowa|     stopka: © / GitHub, LinkedIn / no trackers
+---------------+----------------+
```

Na telefonie (390 px): ramka zwija się do imienia i 3 linków, tor sygnałowy ma scenę 3D przyklejoną u góry (52svh) a tekst przewija się pod nią, indeks pokazuje miniatury w wierszach i odpala wideo, gdy wiersz jest na ekranie (nic nie zależy od hovera).

## 5. Modele 3D

| Model | Gdzie | Źródło | Waga |
|---|---|---|---|
| Czasza radioteleskopu | hero | generowana w kodzie (`LatheGeometry` z paraboli + trójnóg feedu + kratownica), tak jak w prototypie | 0 KB pliku |
| Płytka z torem sygnałowym | tor sygnałowy | wariant 1: oficjalny STEP Basys 3 od Digilent (sprawdzić licencję) > Blender > GLB. Wariant 2: Twoja płytka z KiCada: `kicad-cli pcb export glb` albo pcb2blender dla ładnych materiałów | cel 0,5-1,5 MB |
| (opcja) chip PJ-2027 | datasheet / 404 | low-poly w kodzie | 0 KB |

Pipeline GLB:

```bash
npm i -g @gltf-transform/cli
gltf-transform inspect board.glb
gltf-transform optimize board.glb board.opt.glb --compress meshopt --texture-compress webp --texture-size 1024
```

Zasady: Three.js ładowany dopiero po namalowaniu hero (`import()` / importmap), osobny canvas renderuje tylko gdy widoczny, DPR max 2, LCP to tekst nazwiska, nigdy canvas. Bez WebGL albo z reduced motion: statyczne kadry (render PNG czaszy i płytki).

## 6. Wideo projektów

**Do nagrania przez Ciebie** (8-12 s, bez dźwięku, 1280 px, 30 fps; nagrania ekranu skryptem Playwright `recordVideo` albo OBS):

| Projekt | Co pokazać |
|---|---|
| JobManager | lista ofert z kilku portali > filtr > panel Gemini research > powiadomienie |
| SeeSky Control Panel | mapa nieba d3-celestial, przesuwanie celu, panel sterowania (demo) |
| LabInc | 10 s gry: produkcja, rynek, ulepszenie |
| Yapper | push-to-talk: mówisz, tekst ląduje w schowku i w edytorze |
| Turf Matchmaking | filtry lobby i wynik wyszukiwania |
| Password Manager | dodanie wpisu, dashboard bezpieczeństwa |
| Inventory Generator | wyszukanie itemu i złożenie ekwipunku |
| (opcja) showreel 30 s | złożony w HyperFrames albo Remotion z powyższych klipów |

Kodowanie (AV1 najpierw, H.264 jako fallback dla starszych iPhone'ów i Maków M1/M2):

```bash
VF="scale='min(1280,iw)':-2,fps=30"
ffmpeg -i rec.mov -vf "$VF" -an -c:v libsvtav1 -preset 6 -crf 35 -g 60 -pix_fmt yuv420p out.av1.webm
ffmpeg -i rec.mov -vf "$VF" -an -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p -g 60 -movflags +faststart out.mp4
ffmpeg -i out.mp4 -frames:v 1 -q:v 2 poster.png
```

Odtwarzanie: `muted playsinline loop preload="none"` + poster, start przez IntersectionObserver albo hover, pauza poza ekranem. Każde wideo dłuższe niż 5 s dostaje przycisk pauzy (WCAG 2.2.2), a w case study podpis tekstowy co widać. Hosting: pliki w repo (limit Pages 1 GB, plik max 100 MB, bez Git LFS). Gdyby wideo urosło: Cloudflare R2 albo Bunny Stream.

Wideo przewijane scrollem (opcja dla case SeeSky): sekwencja klatek WebP na canvasie, nie `currentTime`, bo seek jest asynchroniczny i szarpie.

## 7. Paralaksa i scroll

- Warstwy: gwiazdy (3 głębokości) < czasza < teza < nazwisko w hero; wideo SeeSky jedzie wolniej niż tekst obok; w torze sygnałowym scena stoi, tekst płynie.
- Bez scroll-jackingu: nic nie zatrzymuje kółka, sticky zamiast pinów tam, gdzie się da.
- **Naprawa hydrauliki (warto zrobić nawet na obecnej stronie):** Lenis musi chodzić na tickerze GSAP z `lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add(t => lenis.raf(t * 1000))`, `gsap.ticker.lagSmoothing(0)`, a `scroll-behavior: smooth` z `body` (`css/style.css`, linia 28) trzeba usunąć. Obecny `js/main.js` odpala Lenisa na własnej pętli rAF bez `ScrollTrigger.update`, co prawdopodobnie tłumaczy, czemu reveal-e `data-animation` nigdy nie odpalały w `#projects`/`#online` (niezweryfikowane testem).
- Jeden zegar dla wszystkiego (gsap.ticker): Three.js, canvasy, oscyloskop, Lenis.

## 8. Stack

**Rekomendacja: Astro (statyczny build) + GSAP + Lenis + Three.js**, deploy dalej na GitHub Pages przez Actions (workflow dostaje krok `npm run build` i publikuje `dist/`).

Powód w jednej linii: case study per projekt, EN/PL i przejścia między stronami (cross-document View Transitions: Chrome 126+, Safari 18.2+, Firefox po prostu przeładowuje stronę) dostajemy z routera Astro, a na wyjściu i tak są czyste statyczne pliki.

Alternatywa bez buildu: zostajemy przy czystym HTML + importmap dla Three.js, generator PL w Pythonie zostaje. Taniej w migracji, ale case studies trzeba kopiować ręcznie.

## 9. Budżety i dostępność

| Rzecz | Cel |
|---|---|
| LCP (telefon, throttling) | < 2,5 s, element LCP = tekst nazwiska |
| CLS | < 0,05 |
| INP | < 200 ms |
| JS na start | ~150 KB gz bez Three.js; Three.js dociągany po hero |
| GLB | 0,5-1,5 MB, ładowany gdy sekcja się zbliża |
| Wideo | 1-3 MB na klip, `preload="none"` |
| FPS | 55+ na desktopie, płynny scroll na średnim telefonie |

Reduced motion: bez loadera, bez Lenisa, bez GL, statyczne kadry, cała treść widoczna. Skip link, widoczny focus (kolor lock), nagłówki w kolejności, jeden h1, alt teksty, kontrast AA.

## 10. Skille

Już mamy pod ręką: `juliobsz/skills` (`/awwwards` do budowy, `/jury` do oceny po każdej iteracji).

Do zainstalowania, w tej kolejności (każdy SKILL.md przeczytać przed instalacją, tylko od oryginalnych właścicieli, `.claude/` i `.agents/` nie commitować, bo repo publikuje wszystko na Pages):

1. **`greensock/gsap-skills`** (oficjalny GSAP, ScrollTrigger, vanilla JS): `npx skills add https://github.com/greensock/gsap-skills` albo `/plugin marketplace add greensock/gsap-skills`. Uwaga: nie zna Lenisa, trzeba mu powiedzieć, że smooth scroll robi Lenis.
2. **`CloudAI-X/threejs-skills`** (loadery glTF, Meshopt, shadery, wydajność): `npx skills add cloudai-x/threejs-skills`.
3. **`heygen-com/hyperframes`** (HTML/GSAP renderowane do MP4, do showreela w stylu strony): `npx skills add heygen-com/hyperframes`.
4. Opcjonalnie: `remotion-dev/skills` (rolki w React), `wheresryan22/anatomy` (izometryczna ilustracja "jak działa" dla FPGA): `npx skills add wheresryan22/anatomy -g`.

## 11. Etapy

1. **Backup** obecnej wersji (Twoja zasada z CLAUDE.md) i gałąź `revamp`.
2. **Decyzje** (sekcja 12) + materiały: nagrania wideo, ewentualnie plik płytki.
3. **Szkielet**: Astro, tokeny, fonty, treść w jednym pliku danych (EN/PL), statyczny układ wszystkich sekcji bez ruchu. Ma wyglądać skończenie z wyłączonymi animacjami.
4. **Silnik ruchu**: Lenis + ScrollTrigger na jednym tickerze, odsłony, ramka, hovery.
5. **Podpis**: loader-przemiatanie, czasza 3D, płytka z torem sygnałowym, oscyloskop.
6. **Wideo**: kodowanie, indeks z podglądami, case studies z odtwarzaczem i pauzą.
7. **Datasheet, kontakt, 404**, wersja PL.
8. **QA**: `/jury` na buildzie produkcyjnym (desktop, telefon z throttlingiem, reduced motion, klawiatura), poprawki aż każda kategoria ma 8+.
9. **Deploy** na Pages po Twoim OK.

## 12. Decyzje do podjęcia

- Stack: Astro (rekomendacja) czy zostajemy przy czystym HTML?
- Płytka 3D: Basys 3 (STEP od Digilent) czy Twoja własna płytka z KiCada, jeśli masz projekt?
- Showreel 30 s na górze strony: tak czy tylko klipy per projekt?
- Copy: hero po angielsku jak teraz, PL jako druga wersja (zostaje tak?).

## 13. Test generyczności

- Gradient fiolet-niebieski z obecnego banera: wylatuje, zostaje noc + jeden ślad oscyloskopu.
- "Hello, I am" + wielki nagłówek obok grafiki: zastąpione nazwiskiem jako obrazem i odczytem odbiornika.
- Trzy równe karty umiejętności ("Core Strengths"): zastąpione torem sygnałowym, gdzie umiejętności są etapami jednej drogi sygnału.
- Lista "About me" z ptaszkami: zastąpiona kartą katalogową z pinoutem.
- Mono na każdej etykiecie: mono tylko w odczytach z prawdziwymi danymi.
- Numeracja 01/02/03: tylko w torze sygnałowym, bo to prawdziwa kolejność etapów.
