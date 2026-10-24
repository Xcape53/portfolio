# Scroll-driven 3D + parallax techniques for a static (GitHub Pages) portfolio, 2025-2026

Research date: 2026-10-24. Library versions and sizes were checked live on that date. Bundle sizes come from the Bundlephobia API (minified + gzip, whole package entry, not tree-shaken). Browser support comes from MDN browser-compat-data v8.1.7 (timestamp 2026-10-22), downloaded from unpkg and queried directly.

## Which 3D library is the best fit for a mostly-static portfolio with 1-3 hero models, and what does integration code look like for scroll-linked rotation/camera moves?

### Takeaway
For a plain-HTML site that already runs jQuery, GSAP and Lenis, vanilla **Three.js** loaded as an ES module (an importmap from a CDN, or a Vite/Astro build) is the best fit. It costs about 185 KB gzip for the full build and has no React tax, and a scroll-linked camera or rotation is a few lines: a GSAP `scrub` tween on `model.rotation` / `camera.position`, rendered from the shared `gsap.ticker`. `<model-viewer>` (~73 KB gzip) is the low-effort fallback for "spin this one board" with no custom shaders. R3F only makes sense if the site moves to React/Astro islands. Spline's runtime is about 1 MB+ of JS plus several MB of WASM, which is too heavy for hero decoration. OGL (~34 KB gzip) is the lightest, but you build more yourself: glTF loading and compression decoders are not on par with Three's addons.

### Cited Findings
- **Current package sizes (min / gzip, Bundlephobia, 2026-10-24):** three@0.186.1 is 736 KB / 185 KB; @react-three/fiber@9.8.2 is 183 KB / 58 KB, plus React, react-dom and its 10 dependencies (it also needs `three`); ogl@1.0.11 is 131 KB / 34 KB; @google/model-viewer@4.4.0 is 236 KB / 73 KB (bundles three internally, depends on lit); @splinetool/runtime@2.0.111 has a main chunk of 998 KB / 279 KB plus WASM assets "hana-ui" (3.35 MB / 1.1 MB gzip) and "physics" (1.57 MB / 587 KB gzip); @splinetool/viewer's main chunk is 3.59 MB / 976 KB gzip; gsap@3.15.0 is 71 KB / 27 KB; lenis@1.3.27 is 19 KB / 5.5 KB - [Bundlephobia API](https://bundlephobia.com/api/size?package=three) (same endpoint per package)
- **Three.js vs R3F, measured:** One blog measured a small example at 462 KB for vanilla Three.js and 1,035 KB for React Three Fiber, and concluded that "for simple hero scenes, vanilla Three.js wins on bundle size". The build method is not stated, so treat the numbers as rough - [svilenkovic.com](https://svilenkovic.com/3d/three-js-vs-react-three-fiber)
- **model-viewer:** a Google web component "for easily embedding interactive 3D models (glTF/GLB) and AR experiences into HTML pages" - [Needle comparison](https://cloud.needle.tools/compare/needle-vs-modelviewer-vs-r3f)
- **OGL:** described as a lightweight WebGL framework focused on 3D rendering - [best-of-web / oframe/ogl](https://best-of-web.builder.io/library/oframe/ogl)
- **GSAP is free:** the entire toolset, including former Club plugins (ScrollTrigger, SplitText, MorphSVG, ScrollSmoother), is "FREE, even for commercial use!" after the Webflow acquisition. Install it from the public `gsap` npm package or a CDN. The old private `npm.greensock.com` registry and auth-token instructions are outdated - [GSAP 3.15.0 README](https://cdn.jsdelivr.net/npm/gsap@3.15.0/README.md); [GSAP plugins skill (greensock)](https://tessl.io/registry/skills/github/greensock/gsap-skills/gsap-plugins)
- **Pattern for syncing HTML images with WebGL planes:** a Codrops tutorial gathers every `<img>` marked with a data attribute, creates one mesh per image and binds mouseenter/move/leave per mesh. The author says aligning HTML images with WebGL was a long struggle that turned out to have a simple fix - [Codrops, Jul 2024](https://tympanus.net/codrops/2024/07/18/how-to-create-distortion-and-grain-effects-on-scroll-with-shaders-in-three-js/)

### Inferences
- **Recommended stack for this repo:** vanilla Three.js (r18x) plus `GLTFLoader` + `MeshoptDecoder` (+ `KTX2Loader` if KTX2 is used), driven by GSAP ScrollTrigger `scrub`. The site already loads GSAP and Lenis (`js/main.js`, `js/animation.js`), so 3D adds only Three's cost. Load it lazily: `import()` it when the hero section nears the viewport (IntersectionObserver), the same idea as the existing `near(el)` gating in `js/effects.js`.
- **Static hosting works without a bundler.** A `<script type="importmap">` mapping `"three"` and `"three/addons/"` to a pinned jsDelivr/unpkg URL serves fine from GitHub Pages. Pin an exact version, per the project's CDN conventions.
- **Integration sketch.** This is derived from the GSAP and Lenis APIs cited in the Lenis section; it was not copied from one source.
  ```js
  import * as THREE from 'three';
  import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
  import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(35, w/h, 0.1, 100);
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const { scene: board } = await loader.loadAsync('models/basys3.glb');
  scene.add(board);
  // scroll-linked: one timeline, one ScrollTrigger, scrub
  gsap.timeline({ scrollTrigger: { trigger: '#hero3d', start: 'top top', end: '+=150%', pin: true, scrub: 1 } })
      .to(board.rotation, { y: Math.PI * 1.25, ease: 'none' }, 0)
      .to(camera.position, { z: 3, y: 0.4, ease: 'none' }, 0);
  // render on the same ticker that drives Lenis; render only when visible
  gsap.ticker.add(() => { if (visible) { camera.lookAt(0,0,0); renderer.render(scene, camera); } });
  ```
- **Spline:** acceptable only as a pre-rendered video/image export, or for a single interactive "toy". Its runtime alone is larger than three + gsap + lenis combined.
- **model-viewer:** has its own camera-orbit attributes, so scroll-linking means GSAP tweening `cameraOrbit` strings, which is less flexible than raw Three. It suits a "click to rotate the Basys 3" card better than a pinned cinematic hero.
- **WebGL image effects (hover distortion, DOM-synced planes):** worth it only for one signature gallery (for example, the project screenshots). Each synced plane needs a WebGL texture of the screenshot plus resize and scroll syncing, and it adds complexity around the existing `.tf__ph_gallery` wheel/cross-fade logic and lightbox. For this site's electronics language, a cheaper option is a CSS filter / SVG `feDisplacementMap` hover, or a single fullscreen canvas with one plane on hover.

### Gaps
- No authoritative 2025-2026 tree-shaken size comparison was found. Bundlephobia's numbers are whole-entry sizes; a real Three.js import of WebGLRenderer + GLTFLoader typically tree-shakes smaller, but no source gave a figure.
- No 2025-2026 Codrops article was found specifically on DOM-synced WebGL planes. The best match is from July 2024; the classic hover-distortion library is from 2018 ([Codrops 2018](https://tympanus.net/codrops/2018/04/10/webgl-distortion-hover-effects/)).
- Three.js WebGPURenderer / TSL maturity for production portfolios in 2026 was not researched. The WebGLRenderer path above is the safe choice.
- R3F/drei `ScrollControls` specifics were not fetched.

## Exact gltf-transform CLI commands for a production pipeline; target file sizes

### Takeaway
Use `npx @gltf-transform/cli optimize in.glb out.glb --compress meshopt --texture-compress webp --texture-size 1024` (or `ktx2`) as the one-shot pipeline. Since current versions, the optimize defaults are already meshopt, `auto` textures, 2048 px maximum, simplify, weld, join, prune and dedup. Prefer **Meshopt** over Draco for hero models: it is the gltf-transform default, decodes faster, and also covers animation and morph targets. Use **KTX2** (ETC1S for colour, UASTC for normal maps) when GPU memory matters, and WebP for the smallest download with simplest support.

### Cited Findings
- **One-line example from the docs:** `gltf-transform optimize input.glb output.glb --compress draco --texture-compress webp` - [gltf-transform.dev/cli](https://gltf-transform.dev/cli)
- **Available commands:** `draco`, `meshopt`, `etc1s`, `uastc`, `webp`, `resize`, `simplify`, `dedup`, `prune`, `weld`, among others. Global `--vertex-layout` defaults to "interleaved" - [gltf-transform.dev/cli](https://gltf-transform.dev/cli)
- **`optimize` options and defaults (from cli.ts source):**
  - `--compress` (`draco` | `meshopt` | `quantize` | `false`), default **`meshopt`**
  - `--texture-compress` (`ktx2` | `webp` | `avif` | `auto` | `false`), default **`auto`**
  - `--texture-size`, default **2048**
  - `--simplify` true, with `--simplify-ratio`, `--simplify-error` and `--simplify-lock-border`
  - `--weld` true ("required for simplification")
  - `--flatten` true, `--join` true (reduces draw calls)
  - `--instance` true, `--palette` true (merges materials into palette textures)
  - `--prune` true, `--prune-attributes` true, `--prune-solid-textures` true
  - `--sparse` true, `--resample` true
  - `--meshopt-level` default `high` - [glTF-Transform cli.ts](https://raw.githubusercontent.com/donmccurdy/glTF-Transform/main/packages/cli/src/cli.ts)
- **Per-command flags:**
  - `meshopt --level medium|high --quantize-position/--quantize-normal/--quantize-texcoord <bits>`
  - `draco --method edgebreaker|sequential --encode-speed/--decode-speed 0-10`
  - `etc1s --quality 1-255 --compression 0-5 --rdo --resize`
  - `uastc --level 0-4 --rdo --rdo-lambda --zstd 1-22`
  - `resize --width --height --power-of-two nearest|ceil|floor --filter LANCZOS3` - [glTF-Transform cli.ts](https://raw.githubusercontent.com/donmccurdy/glTF-Transform/main/packages/cli/src/cli.ts)
- **Draco vs Meshopt:**
  - Draco "often reduce[s] geometry size by 90-95%" and decodes in a Web Worker. Meshopt covers geometry, morph targets and animation - [A-Frame gltf-model docs](https://aframe.io/docs/1.6.0/components/gltf-model.html)
  - Draco leaves animation tracks and morph targets untouched; use Meshopt for animated content - [svilenkovic.com meshopt](https://svilenkovic.com/3d/meshopt-compression)
  - The same blog claims Draco is better for typical 1-3 hero models. That is a single personal blog and conflicts with gltf-transform defaulting to meshopt ([cli.ts](https://raw.githubusercontent.com/donmccurdy/glTF-Transform/main/packages/cli/src/cli.ts))
- **Gzip on servers:** "some web servers do not support gzip with .glb or .gltf files", which affects Meshopt's additional gzip gains - [A-Frame docs](https://aframe.io/docs/1.6.0/components/gltf-model.html)
- **Draco + KTX2:** Draco only compresses meshes; textures need Basis/KTX. Draco and KTX2 can be combined with no conflict - [three.js forum](https://discourse.threejs.org/t/compression-draco-ktx2-example/31382)
- **KTX2 and GPU memory:** KTX textures stay compressed in GPU memory, whereas most glTF texture formats "have to be wholly uncompressed before they can be rendered" - [Khronos KTX Artist Guide](https://github.com/KhronosGroup/3D-Formats-Guidelines/blob/main/KTXArtistGuide.md)
- **ETC1S vs UASTC:** ETC1S gives "significantly smaller transmission and GPU memory sizes than JPEG and PNG". UASTC gives higher quality with significant memory savings and is particularly suited to normal maps - [Khronos KTX](https://khronos.org/ktx/); [Khronos press release](https://www.khronos.org/news/press/khronos-ktx-2-0-textures-enable-compact-visually-rich-gltf-3d-assets)
- **Common workflow:** ETC1S for most textures, UASTC for the few that need it. This is vendor guidance, not a Khronos rule - [Needle docs](https://engine.needle.tools/docs/how-to-guides/optimization/compress-textures.md)

### Inferences
- **Recommended pipeline.** Install with `npm i -g @gltf-transform/cli`, or run via `npx`. KTX2 requires the KTX-Software `toktx`/`ktx` binary on PATH (this is the usual requirement; it was not verified in this session).
  ```bash
  # 0) inspect
  gltf-transform inspect board.glb
  # 1) one-shot (WebP textures, simplest client: no KTX2 transcoder needed)
  gltf-transform optimize board.glb board.opt.glb --compress meshopt --texture-compress webp --texture-size 1024
  # 1b) GPU-memory-friendly variant
  gltf-transform optimize board.glb board.opt.glb --compress meshopt --texture-compress ktx2 --texture-size 1024
  # (fine control alternative)
  gltf-transform dedup in.glb t1.glb && gltf-transform prune t1.glb t2.glb && gltf-transform weld t2.glb t3.glb \
   && gltf-transform simplify t3.glb t4.glb --ratio 0.5 --error 0.001 \
   && gltf-transform resize t4.glb t5.glb --width 1024 --height 1024 \
   && gltf-transform etc1s t5.glb t6.glb --slots "{baseColorTexture,emissiveTexture}" \
   && gltf-transform uastc t6.glb t7.glb --slots "normalTexture" --zstd 18 \
   && gltf-transform meshopt t7.glb out.glb
  ```
- **Client decoders:** Meshopt needs `MeshoptDecoder` (small and synchronous). Draco needs `DRACOLoader` plus decoder WASM files hosted alongside the site or on a CDN. KTX2 needs `KTX2Loader` plus the Basis transcoder WASM. All of these are static files, so GitHub Pages is fine.
- **Target budgets** (engineering rules of thumb, not sourced):
  - Size: a hero model of about 0.5-2 MB transferred, under 5 MB total 3D payload per page.
  - Geometry: 50k-150k triangles per hero PCB model; the KiCad export of a board with all components can easily exceed 1M triangles before simplify.
  - Textures: 1024 px maximum (2048 only for a full-screen close-up).
  - Draw calls: a few dozen, which `--join` and `--palette` help with.
- **On GitHub Pages,** `.glb` gzip behaviour depends on the CDN. Meshopt's own compression does not depend on gzip, so this is another reason to prefer meshopt there.

### Gaps
- Numeric defaults for `SIMPLIFY_DEFAULTS.ratio/error`, `ETC1S_DEFAULTS.quality` and the like were not visible; the source only references the constants. Check `gltf-transform optimize -h` locally.
- No authoritative published "target file size" for portfolio hero GLBs was found. The budgets above are inference.
- Whether GitHub Pages' Fastly CDN gzips `model/gltf-binary` responses was not verified.

## How to convert a KiCad PCB to GLB with good materials; free/licensed Basys 3 or FPGA board models; telescope dish models; Sketchfab licensing

### Takeaway
KiCad 9+ can export GLB directly (GUI File > Export, or `kicad-cli pcb export glb`). For "good materials" (solder mask sheen, copper, silkscreen, component PBR), the established route is **pcb2blender**: KiCad plugin to `.pcb3d`, Blender import, Blender's glTF exporter, then gltf-transform. Digilent posts an official **Basys 3 STEP** file in the "Additional Resources" section of the Basys 3 Resource Center. STEP becomes GLB via FreeCAD/Blender (CAD importer) and then gltf-transform. For dish models, Sketchfab glTF downloads under CC BY (credit required), CC0, or the Standard license are all usable; avoid NC/ND.

### Cited Findings
- **KiCad native export:** KiBot's `export_3d` output "Exports the PCB as a 3D model using KiCad 9 or newer, using kicad-cli", in BREP, GLB, STL, STEP and XAO formats (added for KiCad 9) - [KiBot export_3d docs](https://kibot.readthedocs.io/en/latest/configuration/outputs/export_3d.html); [KiBot changelog](https://kibot.readthedocs.io/en/v1.9.0/Changelog.html)
- **CLI:** the KiCad 10 CLI manual lists "PCB export: GLB". A user reported running `kicad-cli pcb export glb` with flags such as `--subst-models` and `--include-tracks` - [KiCad 10 CLI PDF](https://docs.kicad.org/10.0/en/cli/cli.pdf)
- **Colour caveat:** a report from the 8.99 dev cycle found that GLB export from the CLI Docker image lacked colours while the GUI export had them. A 9.0.9/10.0.1 regression drops component models in `kicad-cli pcb render`; that is a render issue, not GLB export - [kicad-cli-docker issue #8](https://gitlab.com/kicad/packaging/kicad-cli-docker/-/issues/8); [KiCad forum](https://forum.kicad.info/t/kicad-cli-pcb-render-excludes-component-3d-models-in-both-9-0-9-and-10-0-1/68911)
- **pcb2blender:** export the board as `.pcb3d` from KiCad (the plugin is available in the Plugin and Content Manager), then use File > Import > PCB (.pcb3d) in Blender. Install the Blender importer as the zip file, not unpacked. The tool is aimed at rendering - [pcb2blender GitHub](https://github.com/30350n/pcb2blender); [KiCad forum tutorial (KiCad 7-era)](https://forum.kicad.info/t/simple-tutorial-how-to-create-blender-3d-model-from-kicad/46485)
- **KiLeidoscope:** a newer, real-time KiCad-to-Blender bridge using KiCad's IPC API, targeting KiCad 10. Its author notes that pcb2blender "requires several manual steps… focuses on rendering, and is 1-way only" - [KiCad forum](https://forum.kicad.info/t/kileidoscope-open-source-real-time-interactive-kicad-to-blender-bridge-flex-pcb-ims-pcb-support/71755)
- **KiBot Blender export** is another automated KiCad-to-Blender path - [KiBot blender_export](https://kibot.readthedocs.io/en/v1.6.5/configuration/outputs/blender_export.html)
- **Basys 3 STEP:** a Digilent staff reply says the Basys 3 STEP file sits in "Additional Resources" at the bottom of the Resource Center page, and that any Digilent 3D models "if they exist, will be in a similar location". Digilent does "not partner with any other website for creating or specifically hosting our 3D models" - a third-party partcommunity download was broken - [Digilent forum](https://forum.digilent.com/topic/23889-3d-models-of-boards/); resource page: [digilent.com/reference/programmable-logic/basys-3/start](https://digilent.com/reference/programmable-logic/basys-3/start)
- **Sketchfab licenses:** each downloadable model is under a Standard License or a Creative Commons license, and the author may change the license after you download. CC licenses other than CC0 require crediting the creator. CC BY-NC forbids commercial use. The Standard License allows all uses, including commercial - [Sketchfab Help](https://help.sketchfab.com/en/articles/16152217)
- **Sketchfab model counts:** the "vast majority" of downloadable models are CC BY, and Sketchfab has a button that copies a formatted attribution. There are 2000+ CC0 models - [Sketchfab blog](https://sketchfab.com/blogs/community/over-half-a-million-free-3d-models-on-sketchfab); [Sketchfab blog 600k](https://sketchfab.com/blogs/community/600000-free-3d-models-on-sketchfab)
- **Sketchfab glTF export:** glTF is offered as a standard export for all downloadable models - [Sketchfab glTF](https://www.sketchfab.com/features/gltf)

### Inferences
- **Recommended route for the user's own PCBs:**
  1. Install pcb2blender from KiCad's PCM and export `.pcb3d`.
  2. Import into Blender; it gives procedural solder-mask, copper and silkscreen materials.
  3. Bake the procedural materials to image textures. The glTF exporter cannot export Blender procedural node setups, a well-known Blender glTF limitation not verified in this session.
  4. Run File > Export > glTF Binary.
  5. Run `gltf-transform optimize`.

  The quick route is the KiCad 9 GUI File > Export > GLB straight into gltf-transform. It gives flat vertex colours, which can look fine for a stylised hero.
- **Basys 3:** convert Digilent's STEP via FreeCAD (STEP to glTF) or Blender with a STEP-import add-on; tessellation quality is set at import. Then simplify heavily: component pins and through-holes generate huge triangle counts. Check the Digilent STEP file's licence or terms on the resource page before publishing. No explicit licence text was found.
- **Radio telescope dish:** given the site's electronics language, modelling a parabolic dish procedurally in Three.js is trivial (`LatheGeometry` of a parabola plus a feed tripod) and avoids licence issues. A Sketchfab CC BY or CC0 model is the alternative, credited in the footer.

### Gaps
- KiCad 9's GLB material fidelity (PBR versus vertex colour, and whether the soldermask colour is preserved) was not confirmed from official docs.
- No specific CC-licensed radio-telescope or Basys 3 models on Sketchfab were identified. Each model's page must be checked individually.
- The licence terms of Digilent's STEP file are unknown.

## Lenis + GSAP ScrollTrigger recommended setup in 2025-2026, and known pitfalls

### Takeaway
Drive Lenis from `gsap.ticker`, not from its own rAF loop. Call `ScrollTrigger.update` on every Lenis scroll event, set `gsap.ticker.lagSmoothing(0)` and include `lenis.css`. Then follow GSAP's "common mistakes" list: one ScrollTrigger per timeline (not per nested tween), creation in scroll order with pinning, function-based values with `invalidateOnRefresh`, `ScrollTrigger.refresh()` after images load, and no CSS `scroll-behavior: smooth`. **This repo currently violates the first two rules and has `scroll-behavior: smooth` on `body`.** That is a strong candidate for the "data-animation ScrollTriggers never fire in #projects/#online" bug noted in CLAUDE.md.

### Cited Findings
- **Official setup (Lenis README v1.3.26):**
  - Sync scroll events with `lenis.on('scroll', ScrollTrigger.update)`.
  - Add `gsap.ticker.add((time) => { lenis.raf(time * 1000) })`, since GSAP reports seconds and Lenis expects milliseconds.
  - Call `gsap.ticker.lagSmoothing(0)`.
  - Install via CDN `https://unpkg.com/lenis@1.3.26/dist/lenis.min.js` and include `lenis/dist/lenis.css`. - [Lenis README](https://cdn.jsdelivr.net/gh/darkroomengineering/lenis@1.3.26/README.md); [npm lenis](https://npmjs.com/package/lenis). The latest on npm is 1.3.27 ([Bundlephobia](https://bundlephobia.com/api/size?package=lenis))
- **Lenis options and defaults:**
  - `lerp` 0.1, `duration` 1.2 (ignored when lerp is set), `smoothWheel` true
  - `syncTouch` false, `autoRaf` false, `autoResize` true (ResizeObserver)
  - `anchors` false: anchor links are blocked unless this is enabled
  - `allowNestedScroll` false (it checks the DOM on every scroll event)
  - `respectReducedMotion` true, `overscroll` true
  - `prevent(node)` callback
  - `data-lenis-prevent`, `-wheel`, `-touch`, `-vertical` and `-horizontal` attributes - [Lenis README](https://cdn.jsdelivr.net/gh/darkroomengineering/lenis@1.3.26/README.md)
- **Lenis limitations:**
  - CSS scroll-snap is unsupported (use `lenis/snap`).
  - Safari is capped at 60 fps, and 30 fps in Low Power mode.
  - Smooth scrolling stops over iframes.
  - `position: fixed` may lag on pre-M1 Macs in Safari.
  - `syncTouch` on iOS below 16 is unreliable. - [Lenis README](https://cdn.jsdelivr.net/gh/darkroomengineering/lenis@1.3.26/README.md)
- **Custom scroll containers:** pair Lenis with `ScrollTrigger.scrollerProxy` and a `scroller` option, together with the same update/ticker/lagSmoothing trio - [Codrops, May 2026](https://tympanus.net/codrops/2026/05/28/the-never-ending-story-building-a-seamless-infinite-scroll-experience-with-gsap-lenis/)
- **GSAP official "common ScrollTrigger mistakes"** - [gsap.com/resources/st-mistakes](https://gsap.com/resources/st-mistakes/):
  1. Don't nest ScrollTriggers in child tweens of a timeline; put one on the parent timeline.
  2. Several `to()` tweens on the same properties cache start values. Use `immediateRender:false`, `fromTo()` or one timeline.
  3. One tween on many elements animates all of them together. Loop and create one trigger per element.
  4. Hard-coded start/end values break on resize. Use function values plus `invalidateOnRefresh:true`.
  5. Creating triggers out of order with pinning breaks the offsets of later triggers. Create them top to bottom, or use `refreshPriority`.
  6. Not calling `ScrollTrigger.refresh()` after content or images load. Images without width/height shift the layout.
  7. A scrub that jumps on load has a start before scroll 0. Adjust it or use `clamp()`.
  8. CSS `scroll-behavior: smooth` breaks refresh measurement. Remove it or override it with `scroll-behavior: auto !important`.
  9. `duration` does not lengthen a scrub; move `end` further out instead.
  10. In SPAs, kill or recreate triggers on navigation.
- **Repo state (read from code):**
  - `js/main.js` `lenisScrollAnimation()` creates `new Lenis()` and drives it from its own `requestAnimationFrame(raf)` loop. There is no `lenis.on('scroll', ScrollTrigger.update)` and no ticker integration.
  - `createScrollTrigger()` uses only `onEnter`.
  - `css/style.css` line 28 sets `body { scroll-behavior: smooth; }`. The later override `.lenis.lenis-smooth { scroll-behavior: auto !important; }` (line ~3006) applies only to the `html` element carrying those classes, not to `body`.
  - `js/effects.js` runs a separate rAF loop. - local files `/home/user/portfolio/js/main.js`, `/home/user/portfolio/css/style.css`

### Inferences
- **Recommended replacement for `lenisScrollAnimation()`** (keep the Polish-comment convention when applying):
  ```js
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ lerp: 0.1, anchors: true });   // autoRaf stays false
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  window.addEventListener('load', () => ScrollTrigger.refresh()); // after images/fonts
  ```
  Then move the `effects.js` rAF body onto `gsap.ticker.add(...)` too, so there is a single ticker and the "one ticker" goal is met.
- **The CSS `scroll-behavior: smooth`** on `body` should be removed, since GSAP explicitly flags it as breaking ScrollTrigger refresh. Combined with the missing `ScrollTrigger.update` hook and the `bg-window` padding hacks shifting layout after load, this plausibly explains the #projects/#online reveal bug. This is unverified and should be tested.
- **Jank avoidance:**
  - Animate only `transform` and `opacity`.
  - Use `scrub: 0.5`-`1` for a smoothed catch-up rather than `scrub: true` when Lenis is already smoothing.
  - Set explicit `width`/`height` on images.
  - Use `gsap.matchMedia()` together with `prefers-reduced-motion` to disable pin and scrub.
  - Avoid `filter: blur()` on large animated layers. The existing `::before` glow is static, which is fine.
- **Lenis `anchors: true`** can replace the custom `a[href^="#"]` click handler in main.js.

### Gaps
- No official GSAP doc page dedicated to Lenis integration was fetched; the integration snippet is from Lenis's README.
- Whether the user's `js/animation.js` is Lenis 1.x (new options such as `autoRaf`) or an older `@studio-freight/lenis` build was not checked.
- GSAP's `ScrollSmoother` as an alternative to Lenis (now also free) was not compared in depth.

## CSS scroll-driven animations and View Transitions: support in Chrome, Safari, Firefox as of 2026

### Takeaway
**CSS scroll-driven animations** (`animation-timeline: scroll()/view()`, `animation-range`, `scroll-timeline`, `view-timeline`, `timeline-scope`) are in Chrome/Edge 115+ (July 2023), Safari 26+ (Sept 2025), and **Firefox 159, which ships to stable on 2026-10-27**, three days after this research date. They become cross-browser by November 2026, but should still be gated with `@supports` for older Firefox and Safari 18. **Same-document View Transitions** (`document.startViewTransition`) are Baseline: Chrome 111, Safari 18, Firefox 144. **Cross-document View Transitions** (`@view-transition { navigation: auto; }`) work in Chrome/Edge 126+ and Safari 18.2+, but **not in Firefox** (unimplemented, bug 1860854). They degrade to a normal page load, so they are safe as progressive enhancement on a multi-page GitHub Pages site.

### Cited Findings
- **MDN BCD v8.1.7 (2026-10-22):**
  - `css.properties.animation-timeline` and its `scroll`/`view` values, `animation-range`, `scroll-timeline`, `view-timeline`, `timeline-scope`, `api.ScrollTimeline` and `api.ViewTimeline`: Chrome 115, Edge 115, **Firefox 159**, Safari 26, Safari iOS 26. Status is standard-track and not experimental.
  - Firefox 159's release date is 2026-10-27 (status "beta" on 2026-10-22). Firefox 158 (2026-10-13) is "current". Safari 26 shipped 2025-09-15; Chrome 115 shipped 2023-07-18. - [MDN browser-compat-data via unpkg](https://unpkg.com/@mdn/browser-compat-data/data.json)
- **Earlier status of the Firefox flag:** secondary sources said Firefox 152 (June 2026) still had scroll-driven animations behind a flag in stable, on in Nightly, as an Interop 2026 focus area. That is consistent with BCD's later 159 ship version. Pages claiming Firefox shipped in 126/132 conflict with BCD and are wrong - [cssawwwards guide 2026](https://cssawwwards.com/blog/css-scroll-driven-animations-guide-2026); [frontendhorizon](https://www.frontendhorizon.com/blog/view-transitions-api-and-css-scroll-driven-animations-the-browser-wins-of-2026)
- **Interop 2026:** WebKit announced Interop 2026, which aims for consistent cross-browser behaviour; scroll-driven animations shipped in Safari 26.0 - [WebKit blog](https://webkit.org/blog/17818/announcing-interop-2026/)
- **Fallback practice:** write the final state as the default and wrap the animation in `@supports (animation-timeline: scroll())` - [cssawwwards](https://cssawwwards.com/blog/css-scroll-driven-animations-guide-2026); [ICS MEDIA](https://ics.media/en/entry/230718/)
- **View Transitions (BCD v8.1.7):**
  - `api.Document.startViewTransition` and `view-transition-name`: Chrome 111, Firefox 144 (2025-10-14), Safari 18.
  - `view-transition-class`: Chrome 125, Firefox 144, Safari 18.2.
  - The `:active-view-transition` selector: Chrome 125, Firefox 144, Safari 18.
  - The **`@view-transition` at-rule (cross-document): Chrome/Edge 126, Safari/iOS 18.2, Firefox `false`** (impl bug [1860854](https://bugzil.la/1860854)). - [MDN browser-compat-data](https://unpkg.com/@mdn/browser-compat-data/data.json)
- **Fallback for unsupported browsers:** unsupported browsers ignore `@view-transition`, and navigation falls back to a normal page load. One Astro article claims Firefox 144+ support, but that relies on Astro's client router (same-document), not the native at-rule - [trade-assistance 2026 guide](https://trade-assistance.com/blog/cross-document-view-transitions-mpa-2026/); [CSS-Tricks gotchas](https://css-tricks.com/cross-document-view-transitions-part-1/); [brainstormsandraves 2026](https://brainstormsandraves.com/css/view-transitions-2026/)

### Inferences
- **For this site**, CSS scroll-driven animations are now a viable no-JS replacement for simple parallax and reveals, such as the custom `.fx-reveal` IntersectionObserver or header shrink effects:
  ```css
  @supports (animation-timeline: view()) {
    .fx-reveal { animation: reveal linear both; animation-timeline: view(); animation-range: entry 0% cover 30%; }
  }
  @keyframes reveal { from { opacity: 0; transform: translateY(40px); } }
  ```
  Keep pinning, scrubbed 3D camera moves and anything that drives WebGL in GSAP: CSS timelines cannot drive canvas or three.js state without JS (`ScrollTimeline` JS objects can, but GSAP is simpler and already loaded).
- **Lenis and CSS scroll timelines:** CSS timelines read the real scroll position, so they work alongside Lenis because Lenis scrolls the actual document. This was not tested here.
- **Multi-page static site:** add `@view-transition { navigation: auto; }` to every page's CSS, plus `view-transition-name` on shared elements such as the logo or a project hero image. This gives Chrome and Safari animated page changes, while Firefox simply navigates, with zero risk on GitHub Pages. For a single-page site, `document.startViewTransition()` is Baseline (Firefox 144+) and could animate the lightbox open/close or project-gallery swaps.
- **Outdated advice to flag:**
  - "Firefox does not support animation-timeline" was true until Oct 2026 and is now outdated.
  - "View Transitions are Chrome-only" is outdated (true before 2024).
  - "Use the scroll-timeline polyfill" is mostly unnecessary in late 2026.
  - "GSAP Club plugins require a paid membership" is outdated since 2025.

### Gaps
- No official Mozilla release note for Firefox 159 was read; the ship version comes from BCD data dated 2026-10-22, before the 2026-10-27 release. A last-minute pref flip is possible, so confirm on the [Firefox 159 release notes](https://developer.mozilla.org/docs/Mozilla/Firefox/Releases/159).
- No timeline for Firefox shipping cross-document view transitions was found.
- caniuse global-usage percentages were not fetched. Secondary sources cite about 82-84% for scroll-driven animations in mid-2026, before Firefox shipped.
