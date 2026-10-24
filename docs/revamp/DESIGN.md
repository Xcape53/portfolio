# Revamp portfolio: koncept "Drzewo" (v2)

Plan nowej strony piotrjeleniewicz.com. Proces ze skilla `/awwwards` (juliobsz/skills): brief, koncepty, system, test generyczności. Research: `reports/Revamp portfolio 3D paralaksa wideo.md`.

Wizualizacje (klikalne prototypy z notatkami, źródła w `docs/revamp/src/`, składa je `python docs/revamp/src/build.py`):
- **v2 (aktualna): `docs/revamp/drzewo.html`**
- v1 (odrzucona): `docs/revamp/odbiornik.html`. Uwagi do v1: nie ta kolorystyka, zgubione Twoje symbole, za dużo elektroniki i FPGA.

## 0. Brief (z Twoich materiałów)

Źródła: obecna strona i jej historia w git (wcześniejsze bio z października 2026), profil GitHub `Xcape53/Xcape53`, repo `jobManager`, grafiki w `images/set/grafiki/`.

- **Kim jesteś na stronie:** Piotr Jeleniewicz / Xcape. *Software development & system integration* (tak jak w nagłówku na GitHubie). Budujesz aplikacje i narzędzia do automatyzacji, które łączą API, dane i usługi AI.
- **Co Cię wyróżnia:** myślenie strukturalne. Rozkładasz każdy problem jak drzewo: kategoria, podkategoria i połączenia między nimi. Automatyzacja i łączenie narzędzi w systemy to po prostu ten sposób myślenia w praktyce.
- **Elektronika:** tło, nie główna rola. Jesteś programistą z wiedzą elektroniczną, więc systemy wbudowane, IoT i software gadający ze sprzętem to naturalny kierunek rozwoju (SeeSky: montaż i SDR jako następny etap).
- **Cel strony:** płatny staż albo pierwsza praca na część etatu w software development, integracji systemów albo automatyzacji. Zdalnie albo hybrydowo w Trójmieście.
- **Projekty główne:** JobManager (używany codziennie), SeeSky (lead dev), Yapper (używany codziennie). Dalej: LabInc, Turf Matchmaking, Password Manager, Inventory Generator, strona kwiaciarni, BlackBox.
- **Teraz:** praca inżynierska (agenci DQN w Mario i ViZDoom), SimLE/SeeSky, własne narzędzia, korepetycje z matematyki.

## 1. Koncept

```
Idea:        Każdy problem zaczyna się od jednego węzła. Rozkładam go na gałęzie, aż staje się działającym systemem.
Metafora:    Twój symbol: drzewo/graf rosnący z jednego węzła (favicon, animacja D3 na banerze)
Podpis:      symbol jako neonowy model 3D, który rośnie węzeł po węźle, obraca się za kursorem i przy scrollu staje się logo w rogu
Emocja:      ciemny granat, a w nim świecąca, precyzyjna struktura
Czasownik:   rozgałęziać się: elementy wyrastają z rodzica po linii i zatrzaskują się na miejscu
Screenshot:  świecący symbol 3D po lewej, PIOTR JELENIEWICZ po prawej, w rogu ścieżka "xcape / home"
```

Koncept niesie się przez całą stronę:
- **Loader:** symbol rośnie w 2D (43 węzły), potem przechodzi w model 3D.
- **Okruszek w prawym dolnym rogu:** ścieżka w drzewie (`xcape / projects / jobmanager`), czyli prawdziwa informacja, gdzie jesteś.
- **Sekcja "How I think":** drzewo rozkładu JobManagera rysowane scrollem (problem > collect, filter, research, notify > liście).
- **Projekty:** każdy ma swoje moduły pokazane jako połączone węzły (`collect - filter - research - notify`).
- **404:** pojedynczy, osierocony węzeł bez gałęzi i link "back to root".

## 2. System (Twój, nie nowy)

**Kolory** z obecnej strony:

| Rola | Hex | Skąd |
|---|---|---|
| tło | `#020816` | `images/banner_bg.jpg` |
| poświata | `#0a2a78` | lewy górny róg banera |
| primary | `#2c7ffe` | `--colorPrimary` |
| secondary | `#642efd` | `--colorSecondary` |
| panel | `#0e1216` | `--colorDarkAccent` |
| tekst | `#b1b1b1` | `--colorBodyText` |

Gradient `#2c7ffe > #642efd` to Twój znak (symbol, neon "Lq", linie animacji D3). Używamy go w symbolu, liniach drzewa, przyciskach i podkreśleniach nawigacji. Kolor projektów zostaje jak teraz: poświata za panelem w kolorze projektu (JobManager zielony, SeeSky malinowy jak jego UI, Yapper niebieski).

**Fonty:** Spline Sans (wszystko), Poppins (wielkie "LET'S TALK" z obrysowanym TALK, wypełnianym na niebiesko), Spline Sans Mono tylko do drobnych odczytów (zegar, ścieżka, timecode wideo).

**Zostaje z obecnej strony:** symbol i jego animacja (teraz w 3D), "Hello, I am", przyciski CV (niebieski) i GitHub/projekty (czarny), poświaty projektów, separator oscyloskopu z szeregiem Fouriera, magnetyczny przycisk EMAIL ME, "Have a project in mind? LET'S TALK", lista "Right now" z ptaszkami, chmurka narzędzi, przełącznik EN/PL.

**Zmienia się:** układ (mniej sekcji, każda inna), ruch (jeden zegar, paralaksa, 3D), wideo zamiast galerii przewijanych kółkiem, elektronika skrócona do jednej sekcji.

## 3. Sekcje

```
/            hero > how I think > projekty (3 główne) > więcej prac > below the API (elektronika) > about > kontakt
/work/<slug> case study: wideo > problem > drzewo modułów > szczegóły > wynik > następny projekt
/pl/...      to samo po polsku
/404         osierocony węzeł
```

1. **Hero:** symbol 3D (rośnie, obraca się za kursorem, przy scrollu odjeżdża do logo), 3 warstwy węzłów w tle z paralaksą, "Hello, I am / PIOTR JELENIEWICZ / Software development & system integration", CTA: Request my CV, My projects.
2. **How I think:** lewa kolumna to tekst o myśleniu strukturalnym, prawa to drzewo JobManagera rysowane scrollem. Na końcu Twój workflow z GitHuba: Requirements > Modules > Implementation > Integration > Validation.
3. **Projekty:** JobManager, SeeSky, Yapper jako naprzemienne wiersze (tekst + wideo), moduły jako węzły, tagi, poświata w kolorze projektu, wideo jedzie wolniej niż tekst.
4. **More of my work:** lista z podglądem przy kursorze (na telefonie miniatury).
5. **Below the API:** oscyloskop (Twój podpis) + "A developer who also knows electronics" + 3 Twoje zdjęcia (symulacja, Basys 3, CNC). Przekaz: embedded, IoT, software gadający ze sprzętem jako kierunek rozwoju.
6. **About:** bio, "Right now" w ciemnym panelu, "How I build with AI" (Claude Code, Codex), po godzinach, narzędzia.
7. **Kontakt:** LET'S TALK, magnetyczny EMAIL ME w gradiencie, mail, stopka.

## 4. Model 3D

Tylko jeden i Twój: **symbol**, generowany w kodzie z tych samych danych co `js/animacja-banner.js` (43 węzły, dwie gałęzie z węzła 0). Bez pliku do pobrania, więc 0 KB modelu. Rury z rdzeniem i addytywną poświatą, kolor po przekątnej od `#2c7ffe` do `#642efd`, delikatna głębokość w osi Z, żeby obrót pokazywał bryłę. W wersji docelowej można dodać prawdziwy bloom (EffectComposer).

Opcjonalnie później: mała, prawdziwa płytka (Basys 3 albo Twoja z KiCada) w sekcji "Below the API". Pipeline: `gltf-transform optimize in.glb out.glb --compress meshopt --texture-compress webp --texture-size 1024`.

## 5. Wideo

Do nagrania przez Ciebie (10-15 s, bez dźwięku, 1280 px, 30 fps):

| Projekt | Co pokazać |
|---|---|
| JobManager | lista ofert z kilku portali > filtr > research Gemini > powiadomienie |
| SeeSky | tracking, katalog, mapa nieba (demo) |
| Yapper | push-to-talk: mówisz, tekst ląduje w edytorze |
| LabInc, Turf, Inventory Generator | krótkie pętle do podglądów w liście |

```bash
VF="scale='min(1280,iw)':-2,fps=30"
ffmpeg -i rec.mov -vf "$VF" -an -c:v libsvtav1 -preset 6 -crf 35 -g 60 -pix_fmt yuv420p out.av1.webm
ffmpeg -i rec.mov -vf "$VF" -an -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p -g 60 -movflags +faststart out.mp4
ffmpeg -i out.mp4 -frames:v 1 -q:v 2 poster.png
```

`muted playsinline loop preload="none"` + poster, start gdy wjedzie na ekran, pauza poza ekranem, przycisk pauzy (WCAG 2.2.2). Pliki w repo (limit Pages 1 GB, plik max 100 MB, bez Git LFS).

## 6. Scroll, paralaksa, technika

- Lenis na tickerze GSAP: `lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add(t => lenis.raf(t * 1000))`, `gsap.ticker.lagSmoothing(0)`. Usunąć `scroll-behavior: smooth` z `body` (`css/style.css`, linia 28). Obecny `js/main.js` odpala Lenisa na osobnej pętli, co prawdopodobnie psuje reveal-e w `#projects`/`#online`.
- Jeden zegar dla wszystkiego, sticky zamiast pinów, bez scroll-jackingu.
- **Stack:** Astro (statyczny build, deploy dalej na GitHub Pages) + GSAP + Lenis + Three.js. Daje case study per projekt, EN/PL i przejścia między stronami. Alternatywa: czysty HTML + importmap jak teraz.
- **Budżety:** LCP < 2,5 s (element LCP to tekst nazwiska), CLS < 0,05, Three.js dociągany po namalowaniu hero, wideo 1-3 MB na klip.
- **Reduced motion:** bez loadera, Lenisa i animacji 3D; symbol w pełni wyrośnięty i nieruchomy, cała treść widoczna.

## 7. Skille

Mamy: `juliobsz/skills` (`/awwwards`, `/jury`). Do zainstalowania (przeczytać SKILL.md przed instalacją, nie commitować `.claude/` ani `.agents/`):
1. `greensock/gsap-skills`: `npx skills add https://github.com/greensock/gsap-skills`
2. `CloudAI-X/threejs-skills`: `npx skills add cloudai-x/threejs-skills`
3. `heygen-com/hyperframes` (showreel z HTML/GSAP): `npx skills add heygen-com/hyperframes`

## 8. Etapy

1. Backup obecnej wersji (Twoja zasada) i gałąź `revamp`.
2. Twoje odpowiedzi na pytania z sekcji 9 + nagrania wideo.
3. Szkielet: Astro, tokeny z sekcji 2, treść EN/PL w jednym pliku danych, statyczny układ bez ruchu.
4. Ruch: Lenis + ScrollTrigger, ramka, hovery, odsłony.
5. Podpis: loader, symbol 3D, drzewo "How I think".
6. Wideo i case studies.
7. Elektronika, about, kontakt, 404, PL.
8. QA przez `/jury` (desktop, telefon z throttlingiem, reduced motion, klawiatura) do 8+ w każdej kategorii.
9. Deploy po Twoim OK.

## 9. Pytania do Ciebie

1. Na jaką rolę celujesz najbardziej: integracja i automatyzacja, AI/ML (w JobManagerze masz AI/ML jako "primary") czy embedded? To zmienia nagłówek hero.
2. Które 3 projekty mają być główne? Teraz: JobManager, SeeSky, Yapper.
3. Czy pseudonim Xcape ma być widoczny na stronie, czy tylko w adresach?
4. Czy dane z `jobManager/data/user_profile.json` mają coś, czego nie ma na stronie (doświadczenie, certyfikaty, języki)? Ten folder jest tylko na Twoim dysku, więc z chmury go nie widzę.
5. Neon "Lq" (`images/set/grafiki/Comp 10 (2).png`): co to jest i czy ma się pojawić?

## 10. Test generyczności

- Gradient niebiesko-fioletowy to zwykle "AI default", ale tu to Twój znak od początku i jest używany z jednego źródła (symbol), więc zostaje świadomie.
- Trzy karty umiejętności: zastąpione drzewem rozkładu prawdziwego projektu.
- Galerie przewijane kółkiem: zastąpione wideo z pauzą.
- Numeracja 01/02/03 przy projektach: usunięta, bo projekty nie są sekwencją.
