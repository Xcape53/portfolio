# Below the hero, v3: creative direction spec

Scope: everything after the hero. The hero (3D neon symbol, parallax node layers, "Hello, I am", name, lead, Request my CV + My projects, corner frame, symbol flying to the top-left logo on scroll) is untouched.

Sources read: brief-v3.md, v2-hero.png, z-d.png, z-d2.png, z-d3.png, z-m.png, p-d-3.png, p-d-6.png, cur-3.png; awwwards SKILL.md, references/layout.md, art-direction.md, motion.md, patterns.md, quality-bar.md.

---

## 0. The idea in one line

**Everything starts as one node.** The hero shows the symbol growing node by node. Below the hero, that same node is the only graphic device: it starts every sentence of the thinking section, it heads every project, and it is the point from which every project video switches on. No diagrams, no connector lines, no sticky stage. Structure is shown by typography (depth = indentation, importance = size), exactly the way Piotr says he thinks: category, subcategory, connections.

**Signature moment (one, below the hero): "Switch on."** Each flagship project screen is born from a single glowing node: the node draws a horizontal trace (an oscilloscope line in the brand gradient), the trace opens vertically into the screen like a scope or CRT powering up, the frame settles from a 3D tilt to flat, the project's own colour blooms underneath, and the real recording starts. Node (0D) to trace (1D) to screen (2D). It ties together the tree symbol, the oscilloscope signature he likes, the per-project glow he likes, and the videos he asked for, in one gesture. Everything else on the page is quiet.

Motion verb: **grow from a node, step in one level.** Reveals grow out of a point; hovers move content one indentation step deeper (as if opening a branch).

---

## 1. Section list (5 sections after the hero, contact included)

| # | Section | Layout family | Height (desktop) | Job |
|---|---|---|---|---|
| 1 | How I work | Statement (outline sentence) | about 95svh | Say "structural thinking" in one readable sentence |
| 2 | Selected work | Stacked full-width cases | 3 x about 1.5 viewports | JobManager, SeeSky, Yapper, with the signature |
| 3 | More work | Grouped index list + cursor preview | about 1 viewport | 7 smaller projects, videos as previews |
| (osc) | Oscilloscope separator | | 140 px | His signature, the bridge into hardware |
| 4 | About and right now | Asymmetric pair | about 1.2 viewports | Software first, electronics underneath, current work |
| (osc) | Oscilloscope separator | | 140 px | Second and last use |
| 5 | Contact + footer | Footer as finale | about 1 viewport | LET'S TALK, magnetic EMAIL ME, real links |

v2 had 9 blocks after the hero (How I think, Split into modules, Interfaces first, Things I use every day, 3 alternating cases, More of my work, Below the API, contact). v3 has 5.

---

## 2. Global system (only what changes below the hero)

### Brand, unchanged
- Ground #020816, cobalt glow top-left #0a2a78 (stays fixed behind the whole page, like his banner_bg), panel #0e1216, black #09080c, body text #b1b1b1, ink #ffffff.
- Primary #2c7ffe, secondary #642efd, signature gradient #2c7ffe to #642efd (135deg).
- Muted (secondary labels, electronics chips): #7d8590 (about 5.3:1 on #020816, passes AA).
- Hairline: rgba(255,255,255,.08), used only between index groups and above the footer.
- Project tints (glow only, never text): JobManager green gradient rgb(58,245,85) to rgb(41,237,129) (his current site value); SeeSky its own raspberry UI colour, about rgb(214,51,108); Yapper violet #642efd; LabInc blue rgb(0,122,204); Password Manager near-black rgb(8,8,10); rows without a known colour use the signature gradient.

### Type, unchanged families
- Spline Sans for everything. Poppins 800 only for LET'S TALK. Spline Sans Mono only for tiny readouts (corner clock, breadcrumb, video timer, pause control). No tracked uppercase eyebrows above headings; one plain 14 px label per section at most.
- Scale (desktop / 390 px):
  - Section display (Selected work, More work): clamp(44px, 5.6vw, 88px), weight 700, tracking -0.035em, leading 0.95.
  - Case title (JobManager): clamp(52px, 7.5vw, 120px), weight 700, tracking -0.04em, leading 0.9. Same voice as the hero name, one size down.
  - Outline sentence: clamp(32px, 4.4vw, 68px), weight 600, tracking -0.025em, leading 1.08.
  - Lead: clamp(20px, 1.7vw, 26px), weight 400, white at 92%.
  - Body: 18 px / 1.55 desktop, 17 px / 1.55 phone, #b1b1b1.
  - Labels: 14 px weight 500, #7d8590. Mono readouts: 12 to 13 px.

### Grid
- Desktop: 12 columns, 32 px outer margin, 24 px gutter, max width 1376 px. Indent step = 1 column (about 117 px at 1440).
- Three hang lines used by every section: **col 1** (depth 0: titles, the node), **col 4** (depth 1: parts, index titles, body), **col 9** (meta: status, stack, right panels).
- Phone 390: 4 columns, 16 px margin, 12 px gutter. Indent step = 16 px.
- Vertical rhythm moods: tight 64 px, normal 128 px, airy 224 px, full viewport. Assigned per section below.

### The node (the one graphic device)
- A 12 px circle: white core 4 px, filled with the signature gradient, glow `0 0 12px #2c7ffe, 0 0 28px rgba(100,46,253,.55)`. It is the same node as the bright centre node of the hero symbol.
- Depth-1 nodes are 8 px rings (1.5 px gradient stroke, no fill), like the hollow nodes of his D3 symbol.
- Idle: depth-0 nodes breathe (scale 1 to 1.08, glow .8 to 1, 3.2 s, sine), only while on screen, off under reduced motion.
- Never connected by lines. Hierarchy is carried by position.

### Background and parallax
- After the hero leaves the viewport, the hero WebGL stops rendering. The faint node field continues as three lightweight SVG layers (the same dot-and-line look as the hero layers) fixed behind content at 30% opacity, moving at 0.08 / 0.16 / 0.3 of scroll speed. That is the page-wide parallax and depth. Phone: one layer at 0.12. Reduced motion: one static layer.
- Parallax is applied to the background layers and to media inside frames (image translateY plus or minus 4%), never to text.

### Corner frame (from the hero, kept)
- Bottom-left: `Gdynia, PL  00:11` (live local time).
- Bottom-right breadcrumb grows with depth as you scroll, the quietest form of the tree: `xcape / home`, `xcape / how-i-work`, `xcape / work / jobmanager`, `xcape / work / seesky`, `xcape / work / yapper`, `xcape / more`, `xcape / about`, `xcape / contact`. Changing segments roll up (letter roll, 0.45 s). The frame steps aside on scroll down and returns on scroll up so it never sits on content (fixes v2, where the corner text overlapped "Split it into modules" body copy).
- The prototype "Notatki projektowe" notes pill and boxes must sit in the right margin or be collapsed by default; in v2 they covered titles ("More of my w...", SeeSky video).

### Motion language
- One ease family: expo.out for reveals (1.0 to 1.3 s), power3.out for hovers (0.3 to 0.45 s), expo.inOut for the signature open.
- Lenis smooth scroll (1.1.13), all scroll work through GSAP ScrollTrigger on the GSAP ticker. Nothing pinned anywhere below the hero.
- Text reveals: SplitText lines slide up inside a mask, stagger 70 ms, once. Text is never below 30% opacity at any scroll position and is at 100% by the time its top reaches 75% of the viewport.
- Reduced motion: no Lenis, no scrub, no ignition, no tilt, no parallax; all content at final state; videos show a poster and a Play button.

---

## 3. Sections

### Section 1: How I work (statement, outline sentence)

**Purpose.** Say the trait in one sentence a recruiter reads in 5 seconds, and show it in the form of the text itself: the sentence is indented like an outline, each line one level deeper. That is the tree, made of words.

**Copy (exact).**
- Label (col 1, 14 px): `How I work`
- Outline sentence, one `<h2>` split into four lines, each line at its own depth:
  - depth 0: `Every problem starts as one node.`
  - depth 1: `I split it into parts,`
  - depth 2: `give each part one job,`
  - depth 3: `and wire the parts into a tool.`
- Body (cols 9 to 12, aligned to the baseline of the depth 3 line, 18 px):
  `I learn the same way: category, subcategory, then the connections between them. Automation is not a separate skill on my list. It is this habit applied to the tools I use every day, and the projects below are where it shows.`

**Desktop wireframe (1440).**
```
 col1      col2      col3      col4      col5 ...                      col9 ... col12
+------------------------------------------------------------------------------------+
|                                                                                    |
| How I work                                                                         |
|                                                                                    |
| (o) Every problem starts as one node.                                              |
|           I split it into parts,                                                   |
|                     give each part one job,                                        |
|                               and wire the parts into a tool.                      |
|                                                                                    |
|                                                         I learn the same way:      |
|                                                         category, subcategory,     |
|                                                         then the connections ...   |
|                                                                                    |
+------------------------------------------------------------------------------------+
  padding: airy (224 px) top, normal (128 px) bottom. (o) = root node, hanging in the
  margin left of col 1 so the text edge stays on the grid line.
```

**Phone wireframe (390).**
```
+----------------------------------+
| How I work                       |
|                                  |
|(o) Every problem                 |
|    starts as one                 |
|    node.                         |
|      I split it into             |
|      parts,                      |
|        give each part            |
|        one job,                  |
|          and wire the            |
|          parts into a tool.      |
|                                  |
| I learn the same way:            |
| category, subcategory, then      |
| the connections between them...  |
+----------------------------------+
  32 px, leading 1.08, hanging indent 16 px per depth (wrapped lines keep their depth).
  Body full width under the sentence. Padding 96 / 72 px.
```

**Scroll behaviour.** As the section enters (top 85% to top 35%, scrubbed 0.5), each line slides from the root column out to its own indent (translateX from 0 to its depth, depth 1 first, then 2, then 3, 80 ms apart in scroll terms) and goes from 30% to 100% opacity. The sentence literally branches out while you read it, then stays put. Text is always legible and nothing ever sits on top of it. The root node fades in as the hero symbol finishes landing in the top-left logo (same scroll position), so it reads as the node that came out of the symbol; this needs no change to the hero code.

**Hover.** None needed (no targets). Idle: only the root node breathes.

**Why better than v2.** v2 spent four sections (How I think, Split it into modules, Interfaces first, Below the API) on abstract talk around a thin SVG tree with 12 px labels in a sticky stage. Here the same idea takes one sentence at 68 px that you cannot miss and cannot fail to read, and the structure is visible in the typography, not in a diagram.

---

### Section 2: Selected work (stacked cases, the signature)

**Purpose.** Show three real projects big, with real media, each as a small problem tree: one need (depth 0), the parts that solve it (depth 1), the stack. This is where "structural thinking" becomes proof.

**Section header copy.**
- Display `<h2>` (col 1): `Selected work`
- Meta (cols 9 to 12, 16 px, muted): `Two tools I use every day, one built for a 3 m radio telescope. Seven more further down.`

**Case structure (identical for all three, never alternating sides).**
1. Title row: node + title (depth 0, col 1 to 8); status and stack on col 9 to 12.
2. Lead sentence (cols 1 to 7).
3. Media frame across all 12 columns, at the asset's own aspect ratio, max height 76svh, centred. No fake browser chrome, no rounded "player", no progress bar. Radius 6 px (one radius rule for all media). The project tint glow sits behind it.
4. Caption row under the frame: what you are looking at (left, 14 px), real control on the right (`Pause` / `Play` for videos, `Open full size` for stills; opens his existing lightbox).
5. Breakdown: label column (col 1 to 3) + content (col 4 to 9) + links (col 10 to 12):
   - `Need` (depth 0, 24 px white): one sentence.
   - `Parts` (depth 1, ring node + bold part name + one line each, 18 px).
   - Links as his blue square button style.

**Case copy (exact).**

**JobManager**
- Status (col 9): `In use daily` / `Private repository`
- Stack (col 9): `Node.js, scraping, Gemini API`
- Lead: `One list of job offers from justjoin.it, pracuj.pl, rocketjobs and olx, researched before I open a single listing.`
- Media: the research view screenshot (still).
- Caption: `The research view: company, salary against the market, the real stack and red flags.`  Control: `Open full size`
- Need: `Checking several job portals by hand every day, with the same filters each time.`
- Parts:
  - `Collect` `New listings from every portal land in one list.`
  - `Filter` `One set of shared rules works across all of them.`
  - `Research` `The Gemini API checks the company, salary against the market, the real stack and red flags.`
  - `Notify` `I hear about the matches, not the noise.`
- Link: `Ask me for a walkthrough` (mailto, because the repo is private).

**SeeSky**
- Status: `Lead software developer` / `SimLE student research club`
- Stack: `Python, Flask, Astropy, JavaScript`
- Lead: `Software for the club's 3 m radio telescope: a backend, a tracking web interface and an interactive sky map.`
- Media: tracking UI recording (video, about 10 s, loop).
- Caption: `Tracking interface, recorded from the public demo.`  Control: `Pause`
- Need: `Point a 3 m dish at objects that keep moving across the sky, and let people see and control where it points.`
- Parts:
  - `Backend` `Python and Flask, with Astropy for the sky positions.`
  - `Tracking` `A web interface to pick a target and follow it.`
  - `Sky map` `Interactive, in the browser.`
  - `Next` `Hardware and an SDR receiver.`
- Link: `Open the demo` (URL to confirm, placeholder).

**Yapper**
- Status: `In use daily` / `Windows`
- Stack: `Python, PyQt6, Groq, Vosk`
- Lead: `Dictation for Windows. Hold a key, speak, and the text is in your clipboard.`
- Media: Yapper promo card (still).
- Caption: `Two push to talk channels, one online and one offline.`  Control: `Open full size`
- Need: `Typing long messages and prompts is slower than saying them.`
- Parts:
  - `Push to talk` `Two channels on two hotkeys.`
  - `Online` `Fast transcription through Groq.`
  - `Offline` `Vosk runs locally when there is no connection.`
  - `Output` `Straight to the clipboard, ready to paste.`
- Link: `Source on GitHub` (URL to confirm, placeholder).

No sentence repeats one from another section. No "Case study" links that lead nowhere (v2 had them).

**Desktop wireframe (one case, 1440).**
```
+------------------------------------------------------------------------------------+
| (o) JobManager                                         In use daily                |
|     [120 px, cols 1-8]                                 Private repository          |
|                                                        Node.js, scraping,          |
| One list of job offers from justjoin.it, pracuj.pl,    Gemini API                  |
| rocketjobs and olx, researched before I open ...                                   |
|                                                                                    |
|   ::::::::::::::::::: tint glow (blurred block, behind) :::::::::::::::::::::::    |
| +--------------------------------------------------------------------------------+ |
| |                                                                                | |
| |                     MEDIA, 12 cols, asset ratio, max 76svh                     | |
| |          (video or still; still pans 4% with scroll inside the frame)          | |
| |                                                                                | |
| +--------------------------------------------------------------------------------+ |
| The research view: company, salary against ...                 Open full size  [] |
|                                                                                    |
| Need          (o) Checking several job portals by hand every                       |
|                   day, with the same filters each time.                            |
| Parts             o Collect   New listings from every portal ...    [Ask me for a  |
|                   o Filter    One set of shared rules ...             walkthrough] |
|                   o Research  The Gemini API checks ...                            |
|                   o Notify    I hear about the matches ...                         |
+------------------------------------------------------------------------------------+
  Between cases: airy (224 px). Section header gets normal (128 px) above.
```

**Phone wireframe (one case, 390).**
```
+----------------------------------+
|(o) JobManager                    |
|    [52 px]                       |
| In use daily  Private repository |
|                                  |
| One list of job offers from      |
| justjoin.it, pracuj.pl, ...      |
|                                  |
|+--------------------------------+|
||  MEDIA, full width (358 px),   ||
||  asset ratio, max 70svh        ||
|+--------------------------------+|
| The research view: ...   [Open]  |  44 px tap target
|                                  |
| Need                             |
| Checking several job portals ... |
|                                  |
| Parts                            |
|  o Collect                       |
|    New listings from every ...   |
|  o Filter                        |
|    One set of shared rules ...   |
|  ...                             |
| Node.js  scraping  Gemini API    |  chips
| [ Ask me for a walkthrough ]     |  full-width blue square button
+----------------------------------+
  Between cases: 120 px.
```

**The signature, "Switch on" (exact choreography, desktop).**
ScrollTrigger on each media frame, start `top 88%`, end `top 30%`, scrub 0.6. Progress p:
- p 0.00 to 0.12: a depth-0 node appears at the frame's left edge, vertically centred, directly under the title's node (same column), scale 0 to 1.
- p 0.12 to 0.40: a 2 px trace in the signature gradient (the case's tint at the far end) draws from the node to the right edge (scaleX 0 to 1, transform-origin left), with a soft glow. It is visibly the same line as his oscilloscope separator.
- p 0.40 to 0.80: the trace splits into two lines that travel to the top and bottom edges while the frame opens between them: `clip-path: inset(50% 0 50% 0)` to `inset(0)`. The two lines fade out by p 0.85.
- p 0.30 to 1.00: 3D settle. Wrapper `perspective: 1400px`; frame from `rotateX(14deg) translateY(48px) scale(.94)` (transform-origin 50% 100%) to flat. The tint glow (blurred block behind, `filter: blur(42px)`, his current panel-glow technique) goes from 0 to .55 opacity.
- p 0.60: video `play()` if at least half the frame is visible (IntersectionObserver), muted, loop, playsinline.
- p 1.00: the trigger is killed and the frame stays open. Scrolling back up never closes a screen someone is watching.
- After open, fine pointer only: frame tilts up to 2 deg toward the cursor (lerped on the GSAP ticker), glow rises to .7 on hover. Click opens the lightbox (his current behaviour).
- Off screen: video pauses; it resumes when back in view unless the visitor pressed Pause.

**Phone version of the signature.** Time-based, once, when the frame is 35% visible: node 0.15 s, trace 0.3 s, open 0.5 s (expo.inOut), no 3D tilt, glow radius 24 px. Video autoplays muted only while in view.

**Reduced motion.** Frame visible and flat from the start, glow static at .45, videos show their first frame as a poster with a `Play` button. No trace, no node animation.

**Stills.** JobManager and Yapper are screenshots and are presented honestly as stills: no fake player, no timer. Inside the frame the image is 108% tall and pans 4% with scroll, so the screen does not feel dead next to the SeeSky video.

**Hover on the case title and links.** Title is a link only when a real destination exists. Hover: the title steps in one indent level (translateX 24 px, 0.4 s power3.out) and its node brightens. Buttons: his blue square button; the gradient fill floods from the pointer's entry side, arrow icon nudges 4 px. Focus-visible gets the same states. Touch: `:active` press scale .97.

**Why better than v2.** v2 put each project in a small rounded frame with a fake progress bar and timecode, alternated left and right with text beside it, and the text and media competed at the same size. v3 gives each project the full grid width, a real recording or an honest still, one consistent reading order (title, lead, screen, need, parts), and one memorable gesture that turns his oscilloscope line into the screen. The breakdown under each screen is the structural thinking, shown with his real project, at a readable size.

---

### Section 3: More work (grouped index with cursor preview)

**Purpose.** Show range quickly without seven more case blocks. Grouping by category is the tree in its quietest form (category, then items) and gives the two extra videos a place.

**Copy (exact).**
- Display `<h2>` (col 1): `More work`  Meta (col 12, right): `7 projects`
- Group `Used by other people`
  - `Turf Matchmaking` `Krunker lobby finder with filters. Other players use it.` tag `JavaScript`
  - `Inventory Generator` `Minecraft style inventory builder with item search.` tag `Live demo`
  - `Florist website` `A site for a real client, built with a small team.` tag `Client`
- Group `Games`
  - `LabInc: Chemical Tycoon` `Java Swing incremental game with all 118 elements.` tag `Java`
  - `BlackBox` `Terminal game in C++.` tag `C++`
- Group `Systems and utilities`
  - `Password Manager` `Team prototype of a credential vault for Windows and Linux.` tag `Team`
  - `Stock tool` `Stock tool written in C++.` tag `C++`

(Stock tool copy is thin because the brief has no more facts; replace with one real sentence when available.)

**Desktop wireframe.**
```
+------------------------------------------------------------------------------------+
| More work                                                              7 projects  |
|------------------------------------------------------------------------------------|
| Used by other    Turf Matchmaking        Krunker lobby finder with ...  JavaScript |
| people           Inventory Generator     Minecraft style inventory ...  Live demo  |
|                  Florist website         A site for a real client ...   Client     |
|------------------------------------------------------------------------------------|
| Games            LabInc: Chemical Tycoon Java Swing incremental ...     Java       |
|                  BlackBox                Terminal game in C++.           C++        |
|------------------------------------------------------------------------------------|
| Systems and      Password Manager        Team prototype of a ...         Team       |
| utilities        Stock tool              Stock tool written in C++.      C++        |
+------------------------------------------------------------------------------------+
  Group label cols 1-3 (14 px muted). Title cols 4-7 (30 px, weight 600, white).
  Description cols 8-11 (16 px). Tag col 12 right (13 px mono, muted).
  Rows 72 px tall. Hairlines only between groups. Padding normal (128 px).

  Hover on "Turf Matchmaking":
                  (o) Turf Matchmaking  <- steps in 24 px, node appears
                                 +----------------------+
                                 |  preview 320 x 200   |  follows the cursor
                                 |  (video plays)       |  with lag, tint glow
                                 +----------------------+
```

**Phone wireframe.**
```
+----------------------------------+
| More work               7 projects|
|----------------------------------|
| Used by other people             |
| Turf Matchmaking        [thumb]  |  88 x 55 poster
| Krunker lobby finder with        |
| filters. Other players use it.   |
|                                  |
| Inventory Generator     [thumb]  |
| Minecraft style inventory ...    |
| Live demo ->                     |
|                                  |
| Florist website                  |
| A site for a real client ...     |
|----------------------------------|
| Games                            |
| LabInc: Chemical Tycoon [thumb]  |
| ...                              |
+----------------------------------+
  Titles 22 px, descriptions 15 px. Whole row is the tap target (min 56 px).
```

**How media appears.** Turf Matchmaking and Inventory Generator: the real short videos play inside the floating preview (muted, from the start each time). LabInc and Password Manager: their screenshots, with their own tint glow (LabInc blue, Password Manager near-black, as on his current site). Rows with no media (Florist, BlackBox, Stock tool) show no preview; the description brightens to white instead. The preview opens with a mini "Switch on" (node, trace, open in 0.35 s total), so the signature has a small echo without being repeated at full scale. On phone: static poster thumbnails, no autoplay.

**Hover.** Row: title steps in one level, node appears at the old title position, row gets a #0e1216 band (fill from left, 0.35 s). Focus-visible shows the same, and the preview opens anchored to the row's right side. Rows link to the live demo or repo where one exists; otherwise the row is not a link and has no hover.

**Why better than v2.** v2's "More of my work" was a flat list and the preview was a still that the notes box partly covered. v3 groups the projects (category, then items: his own way of thinking, shown without a drawing), plays the two real videos where they matter, and keeps rows without media honest.

---

### Oscilloscope separator (first of two)

Unchanged from his current site: full content width, 140 px tall, a sine wave in the brand gradient that turns into a 4-term Fourier square wave (odd harmonics 1, 3, 5, 7, with the Gibbs ripple) near the cursor. Phone: no cursor, so the squared region drifts slowly along the wave on its own while in view, and follows the finger while touching. Reduced motion: one static sine frame. Placed here, it is the bridge into "electronics underneath".

---

### Section 4: About and right now (asymmetric pair)

**Purpose.** Who he is, what he is looking at now, and electronics as a supporting layer under the software, shown by hierarchy: software is big and bright, electronics is smaller and muted, one step deeper.

**Copy (exact).**
- `<h2>` (cols 1 to 7, 72 px, two lines): `Software first.` / `Electronics underneath.`
- Paragraph 1 (20 px, white 92%):
  `I am in my final semester of Electronics and Telecommunications at Gdańsk University of Technology, specialising in Computer Electronic Systems. I build applications and automation tools that connect APIs, data and AI services, mostly in Python and JavaScript, with Git and REST APIs every day.`
- Paragraph 2 (18 px, #b1b1b1, indented one level: depth 1):
  `Underneath that sits the degree. I have simulated circuits in LTspice and Micro-Cap, drawn boards in KiCad and EAGLE, run logic on a Basys 3 in Vivado and done some CNC engraving. That is why software that talks to hardware, embedded or IoT, is where I want to grow.`
  The phrases `Basys 3`, `Vivado` and `CNC engraving` are underlined links to his own photos (Basys 3 board on a breadboard, the Vivado waveform, the CNC engraving).
- Tools label `Every day` + chips (filled, white text, his chip style): `Python` `JavaScript` `REST APIs` `Git` `C/C++` `Java` `Docker` `Linux` `AutoHotkey` `Claude Code` `Codex`
- Tools label `Underneath` + chips (outline only, #7d8590, indented one level): `LTspice` `Micro-Cap` `KiCad` `EAGLE` `Vivado` `Basys 3`
- Right panel (cols 9 to 12, dark #0e1216 panel, his "Right now" checklist with blue check marks):
  - Title: `Right now`
  - `Thesis: training DQN agents to play Mario and ViZDoom`
  - `SeeSky, next stage: hardware and SDR`
  - `My own tools, JobManager and Yapper first`
  - `Tutoring high school math`
- Under the panel (14 px muted): `After hours: geography, blending music, gym and diet, AI audio separation tools, architectural visualisation in ComfyUI.`

**Desktop wireframe.**
```
+------------------------------------------------------------------------------------+
| Software first.                                        +--------------------------+ |
| Electronics underneath.                                | Right now                | |
|                                                        | v Thesis: training DQN   | |
| I am in my final semester of Electronics and           |   agents to play Mario   | |
| Telecommunications at Gdansk University of ...         |   and ViZDoom            | |
|                                                        | v SeeSky, next stage:    | |
|           Underneath that sits the degree. I have      |   hardware and SDR       | |
|           simulated circuits in LTspice ... run logic  | v My own tools, ...      | |
|           on a _Basys 3_ in _Vivado_ and done some     | v Tutoring high school   | |
|           _CNC engraving_. That is why ...             |   math                   | |
|                                                        +--------------------------+ |
| Every day   [Python][JavaScript][REST APIs][Git]...    After hours: geography,     |
|           Underneath  (LTspice)(Micro-Cap)(KiCad)...   blending music, ...         |
+------------------------------------------------------------------------------------+
  Left block cols 1-7, panel cols 9-12, panel top aligned to the h2 cap height.
  The panel moves at 0.94 scroll speed (slight parallax against the text column; it never
  overlaps the text because the columns do not share space). Padding normal (128 px).
```

**Phone wireframe.**
```
+----------------------------------+
| Software first.                  |
| Electronics                      |
| underneath.          [40 px]     |
|                                  |
| I am in my final semester of ... |
|                                  |
|   Underneath that sits the       |
|   degree. I have simulated ...   |
|                                  |
| [ photo ][ photo ][ ph           |  scroll-snap strip, 3 own photos,
|  Basys 3   Vivado    CNC         |  72% width each, captions
|                                  |
| Every day                        |
| [Python][JavaScript][REST APIs]  |
| [Git][C/C++] ...                 |
|   Underneath                     |
|   (LTspice)(Micro-Cap)(KiCad)... |
|                                  |
| +------------------------------+ |
| | Right now                    | |
| | v Thesis: ...                | |
| +------------------------------+ |
| After hours: geography, ...      |
+----------------------------------+
```

**How the electronics photos appear.** Desktop: hovering or focusing an underlined phrase (Basys 3, Vivado, CNC engraving) shows that one photo in a 260 x 170 floating frame beside the phrase, opened with the mini "Switch on". Phone: the three photos sit in a horizontal scroll-snap strip under paragraph 2, with captions. Electronics gets three small photos and two muted lines, nothing more: a supporting layer, as the brief asks.

**Hover.** Inline photo links: underline at rest that rises into a gradient band on hover. Chips: no hover (they are not links). Panel: none.

**Why better than v2.** v2 gave electronics its own big section ("A developer who also knows electronics", three photo cards: Simulate, Prototype, Make it real), which made it look like a second career and was part of the "middle that does not fit". v3 states the priority in the heading itself and in the type hierarchy (software chips bright, electronics chips muted and one level deeper), and keeps the real photos one hover away. It also brings back two things he likes from his current site: the dark "Right now" panel and the tool chips.

---

### Oscilloscope separator (second and last)

Same component, directly above contact, as on his current site.

---

### Section 5: Contact and footer (finale)

**Purpose.** One clear action, said in his own established style.

**Copy (exact).**
- Line above (16 px, #2c7ffe, sentence case, not tracked): `Open to a paid internship or a first part-time role`
- Display (Poppins 800, uppercase, clamp(72px, 13vw, 210px)): `LET'S TALK` with `TALK` in white outline (`-webkit-text-stroke: 2px #fff`, transparent fill) that fills blue on hover.
- Magnetic button: `EMAIL ME` (gradient circle, 168 px desktop, 136 px phone), mailto jeleniewicz@op.pl.
- Below: `jeleniewicz@op.pl` (24 px) + small `Copy` button.
- One line (16 px, muted): `Software development, system integration or automation. Remote, or hybrid in the Tricity.`
- Footer row (hairline above, 14 px): left `2026 Piotr Jeleniewicz, Gdynia`; centre `GitHub` (Xcape53), `LinkedIn` (piotr-jeleniewicz); right `CV on request`.

**Desktop wireframe.**
```
+------------------------------------------------------------------------------------+
| ~~~~~~~~~~~~~~~~~~~~~~ oscilloscope separator ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ |
|                                                                                    |
|               Open to a paid internship or a first part-time role                  |
|                                                                                    |
|                     LET'S  T A L K   (Poppins 800, TALK outlined)                  |
|                                                                                    |
|                               (  EMAIL ME  )   magnetic                            |
|                             jeleniewicz@op.pl  [Copy]                              |
|      Software development, system integration or automation. Remote, or hybrid ... |
|                                                                                    |
|------------------------------------------------------------------------------------|
| 2026 Piotr Jeleniewicz, Gdynia          GitHub   LinkedIn            CV on request |
+------------------------------------------------------------------------------------+
  Full viewport height. Centered here on purpose: it is the one centered composition on
  the page, the end of the reading line.
```

**Phone wireframe.**
```
+----------------------------------+
| ~~~~~~~~ oscilloscope ~~~~~~~~~~ |
| Open to a paid internship or a   |
| first part-time role             |
|                                  |
| LET'S                            |
| TALK          [84 px, 2 lines]   |
|                                  |
|        (  EMAIL ME  )            |
|   jeleniewicz@op.pl   [Copy]     |
| Software development, system ... |
|----------------------------------|
| GitHub   LinkedIn                |
| CV on request                    |
| 2026 Piotr Jeleniewicz, Gdynia   |
+----------------------------------+
```

**Hover and scroll.** TALK fills with #2c7ffe from left to right (clip-path inset on a filled copy, 0.5 s) on hover or focus of the heading link; on touch it fills once when the section is 60% in view. EMAIL ME: magnetic pull up to 18 px within a 120 px zone, the label moves at half the button's offset, press scale .96. Copy button: label rolls to `Copied`. Footer links: colour plus underline only (utility).

**Why better than v2.** v2 set "Let's talk" in mixed case Spline Sans, which is not his signature. v3 restores LET'S TALK in Poppins 800 with the outlined TALK, keeps the magnetic EMAIL ME, and adds the one fact a recruiter needs right above it: what he is open to and where.

---

## 4. Asset map (where every real asset goes)

| Asset | Section | Treatment |
|---|---|---|
| SeeSky tracking UI video (WebM, about 10 s) | 2, SeeSky | Full-width screen, Switch on, autoplay in view, Pause control |
| JobManager research view screenshot | 2, JobManager | Full-width still, scroll pan, lightbox |
| Yapper promo card | 2, Yapper | Still at its own ratio, lightbox |
| Turf Matchmaking video | 3 | Cursor preview (desktop), poster thumb (phone) |
| Inventory Generator video | 3 | Cursor preview, poster thumb |
| LabInc screenshot | 3 | Cursor preview with blue tint |
| Password Manager vault screenshot | 3 | Cursor preview with near-black tint |
| Basys 3, Vivado waveform, CNC photos | 4 | Inline hover photos (desktop), snap strip (phone) |

Budget: three 720p WebM clips at about 1.2 MB each, stills as WebP at 1440 wide (about 150 KB each), thumbs at 400 wide. Decode each data URI into a Blob URL only when its section is within 1.5 viewports. Total stays under 10 MB.

---

## 5. User feedback, point by point

| Feedback | What v3 does |
|---|---|
| "The tree section looks ugly" | No SVG tree, no connector lines anywhere. The tree is expressed by indentation (the outline sentence), by the need/parts hierarchy under each project, by grouped categories in More work, and by the breadcrumb path. All text is 16 px or larger, display lines 32 to 120 px. |
| "While scrolling the text behind it is practically invisible" | Nothing is pinned or sticky below the hero. Text and media never share space; media is never behind text. Text reveals start at 30% opacity, reach 100% by 75% of the viewport, and stay. The corner frame steps aside on scroll down, and the notes overlay sits in the margin. |
| "The video is weird, mediocre" | No fake player chrome, progress bars or timecodes. Real recordings shown big (full grid width), born from the Switch on gesture, with a real Pause control and a factual caption. Screenshots are presented honestly as stills. The two extra videos are used as index previews where they add value. |
| "The middle section does not fit" | The four-section middle (How I think, Split into modules, Interfaces first, Below the API) is replaced by one 95svh statement plus the breakdowns inside real projects. Electronics moves into About as a supporting layer. |
| "Minimalist but stunning" | 5 sections, one signature, two typefaces in use below the hero, one radius, one graphic device (the node). |
| "Parallax" | Three-layer node field continues behind the page from the hero; media pans inside frames; the Right now panel drifts slightly. Never on text. |
| "3D" | Hero 3D stays. Below it, each flagship screen settles from a 14 deg 3D tilt and tilts gently toward the cursor; the glow gives depth. No extra WebGL scene to compete with the hero. |
| "Videos of projects" | SeeSky full size, Turf Matchmaking and Inventory Generator as previews. |
| "Awwwards level" | One unmovable idea (his own symbol's node becomes the screen), one signature executed per frame, designed phone version of every section, full reduced-motion path, every primary target answers in the same verb (step in one level / grow from a node). |
| Keep the brand (v1 rejection) | Same colours, fonts, symbol, glows, oscilloscope, magnetic EMAIL ME, blue square buttons, Right now checklist, tool chips, LET'S TALK. Electronics is never the visual theme: no boards, no FPGA renders. |

---

## 6. What to cut from v2

1. The sticky tree stage and the scroll-drawn SVG decomposition tree of JobManager (thin lines, 12 px labels).
2. The "Split it into modules" and "Interfaces first, then the code" sections, and the five-step Requirements / Modules / Implementation / Integration / Validation list.
3. "Things I use every day" as a section heading and its intro paragraph.
4. Alternating left/right case rows with text beside media.
5. Rounded fake player frames, fake progress bars, play/pause icons over stills, timecodes like 0:02 / 0:12.
6. The chained mono chips "collect - filter - research - notify" joined by lines (now the readable Parts list).
7. "Case study" links that lead nowhere.
8. "Below the API / A developer who also knows electronics" as its own section, and the Simulate / Prototype / Make it real photo cards.
9. Tracked uppercase eyebrows ("EXAMPLE: JOBMANAGER", "MY PROJECTS", "HAVE A PROJECT IN MIND?").
10. "Let's talk" in Spline Sans mixed case (back to Poppins LET'S TALK).
11. Any WebGL below the hero beyond what the hero already renders; the hero canvas stops once off screen.

---

## 7. Acceptance checks for the build

- No em or en dash anywhere in visible text; no "elevate", "seamless", "unleash", "cutting-edge".
- One `<h1>` (hero name); every section uses `<h2>`; project titles `<h3>`.
- 390 px: no horizontal overflow, primary taps 44 px, LET'S TALK on two lines, outline sentence wraps with hanging indents.
- Reduced motion: every word visible, every frame open, videos paused with Play, separators static.
- Every primary target (case title link, buttons, index rows, inline photo links, EMAIL ME, nav) has hover, focus-visible and active states in the "step in one level" or fill treatment; utility links only change colour.
- Idle: root node breathes, videos loop in view, oscilloscope drifts, background node field drifts slowly. All pause off screen.
- Videos pause off screen and when the tab is hidden; the Switch on trigger never re-closes an opened screen.
- Placeholders to confirm: SeeSky demo URL, Yapper repo URL, Turf Matchmaking and Inventory Generator links, one real sentence for Stock tool.
