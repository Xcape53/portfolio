# Motion, WebGL and video spec: everything below the hero (v3)

Author role: motion / WebGL direction. Scope: every section after the hero. The hero (3D neon symbol, 3 parallax node layers, logo flight to the top-left corner) is unchanged.

Stack (fixed by the brief): one HTML file, three.js r128 UMD (cdnjs) + `three@0.128.0/examples/js/postprocessing/{EffectComposer,RenderPass,ShaderPass,UnrealBloomPass}.js` and `shaders/{CopyShader,LuminosityHighPassShader}.js` (jsdelivr, all verified 200), GSAP 3.12.5 + ScrollTrigger + CustomEase (+ Flip only if needed, both verified 200 on cdnjs), Lenis 1.1.13. **SplitText is NOT on cdnjs for 3.12.5 (404, verified)**: split words/lines by hand (helper in section 9), do not mix in a 3.13 build.

---

## 0. Concept in one paragraph

**"One node, one signal."** His symbol is a tree grown from one node. Below the hero that node becomes the page's only moving system: a neon line (the same blue to violet tube as the glyph, drawn only at 0, 45 and 90 degree angles, the glyph's own grammar) leaves the logo in the corner, drops into the page and ends in a node. The node opens like an aperture into a project video, the video zooms to full bleed, then settles into one persistent "screen". The signal then switches the screen between projects with a sweep whose edge is the Fourier square wave from his oscilloscope separator. At the end the screen collapses back into a node and the line runs down into the rest of the page. At the contact section the full symbol regrows around the EMAIL ME button: the page ends where it started, at a root node.

**Motion verb: route, then lock.** Something travels along a line (signal), arrives, and snaps into a stable, readable state. Every animation is a variation of that: line draws, node arrives, screen locks, text locks. Eases: one family.

```js
CustomEase.create("route", "M0,0 C0.55,0 0.1,1 1,1");   // travel then lock (used for timed text/UI)
// scrubbed tweens: ease "none" (or power2.inOut only on box geometry inside the scrubbed timeline)
// hover: power3.out 0.35 s; text lock-in: expo.out 0.9 s, stagger 0.06
```

**One signature, the rest quiet.** The pinned "Selected work" stage is the only WebGL moment below the hero (plus the contact bookend, which reuses the same canvas and the same glyph). Everything else is DOM, transforms and one-shot reveals.

---

## 1. Page order below the hero

| # | Section | Height (desktop) | What moves | GL? |
|---|---|---|---|---|
| 1 | Statement "Every problem starts as one node" | ~100svh, not pinned | word ink fill, scrubbed | no |
| 2 | **Selected work** (signature) | pinned 100svh + 420% scroll | node, aperture, full-bleed zoom, screen, square-wave sweep | yes, stage canvas |
| 3 | More work (index) | auto (~90svh) | row hover, cursor preview with live video | no |
| 4 | Oscilloscope separator (his) | 160px | sine to Fourier square near cursor (existing) | 2D canvas |
| 5 | Below the API (electronics, supporting) | ~90svh | inner-image parallax | no |
| 6 | About + Right now + tools | auto | checklist ticks draw once, chips stagger once | no |
| 7 | Contact "LET'S TALK" | ~100svh | glyph regrows around EMAIL ME (bookend), magnetic button | yes, same stage canvas |
| 8 | Footer | auto | none | no |

Breadcrumb in the corner frame keeps narrating: `xcape / how-i-think`, `xcape / projects / seesky`, `xcape / projects / jobmanager`, `xcape / projects / yapper`, `xcape / projects / more`, `xcape / below-the-api`, `xcape / about`, `xcape / contact`. In the pinned stage the crumb is driven by the stage state, not by section rects.

---

## 2. Global runtime

### 2.1 Modes (decided once, with `gsap.matchMedia`)

```js
const mm = gsap.matchMedia();
mm.add({
  desk:   "(min-width: 1024px) and (hover: hover) and (prefers-reduced-motion: no-preference)",
  touch:  "((max-width: 1023px) or (hover: none)) and (prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)"
}, (ctx) => {
  const { desk, touch, reduce } = ctx.conditions;
  if (desk && glOK) initDeskStage();      // pinned WebGL stage + bloom
  else if (touch) initTouchWork();        // DOM sticky entry + stacked cards, no stage GL
  else initStaticWork();                  // reduced motion or no WebGL: finished static layout
  return () => teardown();                // matchMedia reverts tweens/ScrollTriggers itself
});
```

`<html>` classes: `gl-on` (stage GL running), `m-touch`, `rm` (reduced). CSS for each mode is complete on its own; the static layout must look designed, not broken.

### 2.2 Lenis + ScrollTrigger (one ticker)

```js
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });   // syncTouch stays false: native touch scroll
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
ScrollTrigger.config({ ignoreMobileResize: true });
document.fonts.ready.then(() => ScrollTrigger.refresh());
```

No Lenis under reduced motion. Everything (hero glyph, stage, oscilloscope, idle drift) runs off `gsap.ticker`, never its own `requestAnimationFrame`.

### 2.3 Canvases and layering

- Hero keeps its own `#glyph` canvas (do not touch the liked hero). It already stops rendering off screen.
- New: one **stage canvas** `#stage-gl`, `position: fixed; inset: 0; height: 100lvh; z-index: 0; pointer-events: none; contain: strict; opacity: 0`. It renders only while the work pin or the contact section is active (`ScrollTrigger` `onToggle`), and fades in/out over 0.3 s at those edges. Two WebGL contexts exist, at most one renders per frame.
- `main` sections: `position: relative; z-index: 1`. The work and contact sections have `background: transparent`; all other sections paint `#020816` themselves, so the canvas is never seen behind them.
- Z-stack: 0 stage canvas, 1 sections, 2 work stage DOM text, 10 nav + corner frame. **Text is always above the canvas in the DOM stack**, and layout (not luck) keeps it off the media rect (section 3.6).

---

## 3. Signature: "Selected work" pinned stage (desktop)

### 3.1 Storyboard (labels of one scrubbed timeline)

Units are timeline seconds; 1 unit is about 56svh of scroll (7.5 units over 420%).

| Label | t | Visual | DOM text visible |
|---|---|---|---|
| `enter` | 0.0 to 0.6 | A neon line leaves the nav logo's root node, travels down in 45/90 degree steps (glyph grammar) to the viewport center and ends in a white node with a blue halo that pulses (idle). | Mono kicker top-left: `SELECTED WORK  01 / 03` |
| `iris` | 0.6 to 1.4 | The node opens as a circular aperture (radio-telescope dish nod, never literal) showing the SeeSky video. The neon line is consumed into the aperture rim: the rim IS the line. | kicker |
| `zoom` | 1.4 to 2.2 | Circle morphs into a rectangle and grows to full bleed. Rim thins to 0 as it reaches the viewport edges. | nothing over the video |
| `full` | 2.2 to 2.6 (hold) | Full-bleed SeeSky tracking UI playing. Bottom-left caption over a scrim: `SEESKY / TRACKING UI / 00:04 / 00:10` (real `currentTime`). Pause toggle bottom-right. | caption only |
| `settle` | 2.6 to 3.4 | The full-bleed screen shrinks and slides into the **frame** (right 8 of 12 columns). The neon rim traces the frame's perimeter clockwise from its top-left corner, 10px outside the media. Violet project glow fades in behind the frame. | SeeSky text locks in at the left when `settle` is 80% done |
| `seesky` | 3.4 to 3.8 (hold) | Screen + rim + glow at rest; video plays; idle: rim gradient drifts slowly, node at frame corner breathes. | SeeSky article |
| `toJob` | 3.8 to 4.8 | A bright packet runs once around the rim and enters at the left edge; the screen content switches SeeSky to JobManager with a **square-wave sweep** left to right (edge = 4-term Fourier square wave, neon on the edge). Glow tint violet to JobManager green. | SeeSky text out at sweep start, JobManager text in at 60% |
| `jobmanager` | 4.8 to 5.2 (hold) | JobManager research view (still) with a slow vertical scan pan tied to scroll. | JobManager article |
| `toYapper` | 5.2 to 6.2 | Same sweep, JobManager to Yapper. Tint green to blue `#2c7ffe`. | swap |
| `yapper` | 6.2 to 6.6 (hold) | Yapper promo card (still), scan pan. | Yapper article |
| `exit` | 6.6 to 7.5 | Text out. Rim un-draws (counter-clockwise), screen collapses into a node at the frame's bottom center, the node drops a line straight down off the bottom edge. The "More work" section's left rule continues that line in the DOM at the same x. | none |

Why this fixes the v2 complaints:
- "Video weird, mediocre": no browser chrome, no fake progress bar, no rounded cards. The video is the hero of the moment at full bleed, and then lives in one persistent screen that belongs to the brand line.
- "Tree section ugly": no diagram, no thin lines, no small labels. The tree is expressed by one thick neon line and one node, at the brand's weight.
- "Text behind it invisible": all text lives inside the pinned element, in its own column that never overlaps media, and it switches with timed (not scrubbed) transitions, so it is never half transparent at rest (3.6).

### 3.2 DOM

```html
<section id="work" class="work" aria-labelledby="work-h" data-path="projects">
  <div class="work__stage">                       <!-- this is what gets pinned -->
    <header class="work__head">
      <h2 id="work-h" class="mono">Selected work</h2>
      <nav class="work__count mono" aria-label="Projects">  <!-- keyboard jump targets -->
        <a href="#p-seesky" data-go="seesky">01</a><a href="#p-jobmanager" data-go="jobmanager">02</a><a href="#p-yapper" data-go="yapper">03</a>
      </nav>
    </header>
    <div class="work__grid">                      <!-- 12 cols, gap 24px, padding 0 48px -->
      <div class="work__texts">                   <!-- cols 1 to 4; articles share one grid cell -->
        <article class="work__item" id="p-seesky" data-i="0">
          <p class="kicker">Lead software developer · SimLE</p>
          <h3 class="work__title">SeeSky</h3>
          <p class="work__lead">Software for the 3 m radio telescope of the SimLE research club...</p>
          <ul class="chips"><li>Python</li><li>Flask</li><li>Astropy</li><li>JavaScript</li></ul>
          <a class="link" href="...">Case study</a>
        </article>
        <article class="work__item" id="p-jobmanager" data-i="1">...</article>
        <article class="work__item" id="p-yapper" data-i="2">...</article>
      </div>
      <figure class="work__frame" data-frame>     <!-- cols 5 to 12, aspect 16/10, max-height 70svh -->
        <video class="work__media" data-media="seesky" muted playsinline loop preload="none" poster="data:image/webp;..."></video>
        <img class="work__media" data-media="jobmanager" alt="JobManager research view: company, salary vs market, real stack, red flags" src="data:image/webp;...">
        <img class="work__media" data-media="yapper" alt="Yapper: push-to-talk dictation, online and offline transcription" src="data:image/webp;...">
      </figure>
    </div>
    <p class="work__caption mono" aria-hidden="true"></p>
    <button class="work__pause mono" type="button" aria-pressed="false">Pause video</button>
  </div>
</section>
```

- With `gl-on`, `.work__media` are `opacity: 0` (GL draws them), but stay in the DOM for semantics and as the no-GL fallback.
- `.work__frame` is only a measuring box when GL is on: `background: none; border: 0`.
- Stacked articles: `.work__texts { display: grid } .work__item { grid-area: 1 / 1; align-self: center }`. Inactive ones get `visibility: hidden` via `autoAlpha` and `inert`.

### 3.3 ScrollTrigger and timeline

```js
const st = { box: { cx: 0, cy: 0, hx: 0, hy: 0, r: 0 },           // the screen's rounded-box SDF (CSS px, y down)
             u:   { head: 0, tail: 0, trace: 0, mix: 0, pan: 0, packet: 0, packetAmt: 0, dim: 0, tint: 0, exitHead: 0 } };
const KB = {};                                     // keyframe boxes, recomputed on refresh
function measure() {
  const W = innerWidth, H = innerHeight, f = document.querySelector("[data-frame]").getBoundingClientRect();
  const R = Math.min(W, H) * 0.16;
  KB.node  = { cx: W / 2, cy: H / 2, hx: 0, hy: 0, r: 0 };
  KB.iris  = { cx: W / 2, cy: H / 2, hx: R, hy: R, r: R };          // r == half size: a circle
  KB.full  = { cx: W / 2, cy: H / 2, hx: W / 2, hy: H / 2, r: 0 };
  KB.frame = { cx: f.left + f.width / 2, cy: f.top + f.height / 2, hx: f.width / 2, hy: f.height / 2, r: 2 };
  KB.exit  = { cx: KB.frame.cx, cy: f.bottom, hx: 0, hy: 0, r: 0 };
  buildRoutes(W, H);                                // ribbons in px (3.5)
}
const to = (k) => ({ cx: () => KB[k].cx, cy: () => KB[k].cy, hx: () => KB[k].hx, hy: () => KB[k].hy, r: () => KB[k].r });

const tl = gsap.timeline({
  defaults: { ease: "none" },
  scrollTrigger: {
    trigger: "#work", pin: ".work__stage", start: "top top",
    end: () => "+=" + innerHeight * 4.2,
    scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
    onRefreshInit: measure,
    onToggle: (s) => stage.active(s.isActive),
    onUpdate: () => stage.sync(tl.time())         // text state machine + video play state (3.6, 3.7)
  }
});
tl.addLabel("enter")
  .set(st.box, to("node"))
  .to(st.u,   { head: 1, duration: 0.6 })                                        // route draws logo to center
  .addLabel("iris")
  .to(st.box, { ...to("iris"), duration: 0.8, ease: "power2.out" })
  .to(st.u,   { tail: 1, duration: 0.5 }, "<")                                   // line consumed into the rim
  .addLabel("zoom")
  .to(st.box, { ...to("full"), duration: 0.8, ease: "power2.inOut" })
  .addLabel("full")
  .to(st.u,   { dim: 1, duration: 0.2 })                                         // caption scrim in
  .to({}, { duration: 0.2 })
  .addLabel("settle")
  .to(st.u,   { dim: 0, duration: 0.2 })
  .to(st.box, { ...to("frame"), duration: 0.8, ease: "power2.inOut" }, "<")
  .to(st.u,   { trace: 1, duration: 0.6 }, "<0.2")
  .addLabel("seesky")
  .to({}, { duration: 0.4 })
  .addLabel("toJob")
  .to(st.u,   { packet: 1, packetAmt: 1, duration: 0.4 })
  .to(st.u,   { mix: 1, tint: 1, duration: 0.6 })                                // sweep A to B
  .addLabel("jobmanager")
  .to(st.u,   { pan: 1, duration: 0.4 })                                         // scan pan during hold
  .addLabel("toYapper")
  .set(st.u,  { packet: 0 })
  .to(st.u,   { packet: 1, duration: 0.4 })
  .to(st.u,   { mix: 2, tint: 2, duration: 0.6 })                                // sweep B to C
  .addLabel("yapper")
  .to(st.u,   { pan: 2, duration: 0.4 })
  .addLabel("exit")
  .to(st.u,   { trace: 0, packetAmt: 0, duration: 0.4 })
  .to(st.box, { ...to("exit"), duration: 0.5, ease: "power2.in" }, "<0.1")
  .to(st.u,   { exitHead: 1, duration: 0.3 });
```

`mix` runs 0..2: the shader binds the two textures around `floor(mix)` and sweeps with `fract(mix)` (3.4). Media binding is swapped on the CPU when `floor(mix)` changes.

**Snap (do it through Lenis, not ScrollTrigger `snap`).** ScrollTrigger's snap tween writes `scrollTop` directly and fights Lenis' interpolation (jitter, double easing). Instead: on Lenis `scroll`, debounce 140 ms of near-zero velocity while the pin is active, find the nearest *rest* point within 0.35 units (hold midpoints, not label starts: `REST = { full: 2.5, seesky: 3.6, jobmanager: 5.0, yapper: 6.4 }`), and `lenis.scrollTo(st.start + (st.end - st.start) * REST[k] / tl.duration(), { duration: 0.6, easing: t => 1 - Math.pow(1 - t, 3) })`. Never snap from inside a transition range larger than 0.35 units (the user is clearly scrolling through). The `01 02 03` links call the same `scrollTo` (keyboard and screen-reader users can jump states; `focusin` on an article does the same).

### 3.4 WebGL scene

**Renderer:** `new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" })`, `setPixelRatio(Math.min(devicePixelRatio, 1.5))`, `outputEncoding = THREE.LinearEncoding` (default) and **no tone mapping**: every color goes in as its raw sRGB hex value so `#2c7ffe` in GL equals `#2c7ffe` in CSS, and video/image textures (default `LinearEncoding`) display untouched. (The hero uses `sRGBEncoding` with MeshBasicMaterial; do not copy that here or the video gets washed out. Match the neon look to the hero by eye, side by side.)

**Camera:** none needed for 2D: all stage passes are fullscreen triangles/quads whose shaders work in CSS px from `gl_FragCoord`, plus the route ribbons whose vertex shader converts px to clip space. One `OrthographicCamera(-1,1,1,-1,0,1)` satisfies three's API. The contact glyph (section 8) uses a `PerspectiveCamera`.

**Scenes and passes (selective bloom without the layer trick):**

```
baseScene  : bgQuad (navy + project glow + grain)  ->  mediaQuad (videos/stills, SDF mask, square-wave sweep)
neonScene  : rimQuad (SDF outline, trace, packet)  +  routeRibbon (entry)  +  exitRibbon  +  nodes (one instanced quad)
bloomComposer (renderToScreen = false, setPixelRatio(0.5 * dpr)):
   RenderPass(neonScene, cam)  ->  UnrealBloomPass(res, strength 1.15, radius 0.55, threshold 0.0)
frame:
   renderer.render(baseScene, cam)                   // autoClear true
   renderer.autoClear = false
   renderer.render(neonScene, cam)                   // crisp neon cores on top
   renderer.render(bloomQuadScene, cam)              // additive fullscreen quad sampling bloomComposer.renderTarget2.texture
   renderer.autoClear = true
```

Why: bloom only ever touches neon. Running `UnrealBloomPass` over the whole frame would bloom the white UI text inside the videos into smears, and r128's `UnrealBloomPass` rendering to an alpha canvas breaks the alpha. Threshold 0 is fine because only neon is in the bloom scene. `UnrealBloomPass` has `needsSwap = false`, so the result sits in `renderTarget2` (same as three's selective-bloom example). On resize: `renderer.setSize`, `bloomComposer.setSize` (never set the bloom resolution by hand).

**Shared GLSL helpers:**

```glsl
precision highp float;
uniform vec2  uView;      // CSS px viewport
uniform float uDpr;
uniform vec4  uBox;       // cx, cy, hx, hy  (CSS px, y down)
uniform float uRad;
uniform float uTime;
const vec3 BLUE   = vec3(0.1725, 0.4980, 0.9961);   // #2c7ffe
const vec3 VIOLET = vec3(0.3922, 0.1804, 0.9922);   // #642efd
const vec3 NAVY   = vec3(0.0078, 0.0314, 0.0863);   // #020816
vec2 px() { return vec2(gl_FragCoord.x, uView.y * uDpr - gl_FragCoord.y) / uDpr; }
float sdBox(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
// The oscilloscope separator's square wave: 4 odd harmonics, Gibbs ripple included.
float sq(float x) { return 1.2732 * (sin(x) + sin(3.0*x)/3.0 + sin(5.0*x)/5.0 + sin(7.0*x)/7.0); }
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
```

`r == min(hx, hy)` with `hx == hy` makes the rounded box a perfect circle, so ONE SDF covers node, aperture, full bleed, frame and collapse. No geometry is ever rebuilt for the screen.

**bgQuad (fragment):** the page ground plus the per-project glow behind the frame.

```glsl
uniform vec3 uTintA, uTintB; uniform float uTintMix, uTintAmt;
void main() {
  vec2 p = px();
  float d = sdBox(p - uBox.xy, uBox.zw, uRad);
  vec3 tint = mix(uTintA, uTintB, uTintMix);
  vec3 col = NAVY + tint * uTintAmt * 0.32 * exp(-max(d, 0.0) / 110.0);   // soft solid halo, like his current per-project glow
  col += (hash(p + fract(uTime)) - 0.5) * 0.010;                          // grain: kills banding in the halo
  gl_FragColor = vec4(col, 1.0);
}
```

Tints: SeeSky `#642efd`, JobManager the green of his current site (`#3af555` to `#29ed81`, use the midpoint `#31f16b` at 0.32 strength), Yapper `#2c7ffe`. `uTintAmt` is 0 until `settle` (the full-bleed phase has no halo).

**mediaQuad (fragment):** cover-fit inside the box, square-wave sweep, caption scrim, scan pan.

```glsl
uniform sampler2D tA, tB; uniform vec2 uSizeA, uSizeB;   // texel sizes (videoWidth/Height or naturalW/H)
uniform float uSweep;  // fract(mix): 0..1 during a switch
uniform float uPanA, uPanB, uDim, uBloomEdge;
vec2 cover(vec2 l, vec2 box, vec2 img, float pan) {
  float s = max(box.x / img.x, box.y / img.y) * (1.0 + 0.12 * step(0.001, pan + 0.0001)); // stills: 12% overscan for the pan
  vec2 vis = box / (img * s);
  vec2 off = (1.0 - vis) * vec2(0.5, pan);                // pan scans top to bottom over the overscan
  return off + l * vis;
}
void main() {
  vec2 p = px();
  float d = sdBox(p - uBox.xy, uBox.zw, uRad);
  float inside = 1.0 - smoothstep(-0.75, 0.75, d);
  vec2 l = (p - (uBox.xy - uBox.zw)) / (2.0 * uBox.zw);   // 0..1 inside the box, y down
  vec3 a = texture2D(tA, cover(l, 2.0 * uBox.zw, uSizeA, uPanA)).rgb;
  vec3 col = a;
  if (uSweep > 0.0) {                                     // uniform branch: B is only fetched during a switch
    vec3 b = texture2D(tB, cover(l, 2.0 * uBox.zw, uSizeB, uPanB)).rgb;
    float edge = uSweep * 1.16 - 0.08 + 0.035 * sq(l.y * 6.2832 * 2.5 + uTime * 0.6);
    float m = smoothstep(edge + 0.002, edge - 0.002, l.x);
    col = mix(a, b, m);
    col += mix(BLUE, VIOLET, l.y) * exp(-abs(l.x - edge) * 220.0) * 0.9 * (1.0 - abs(uSweep * 2.0 - 1.0)); // neon on the edge
  }
  col *= 1.0 - uDim * 0.72 * smoothstep(0.55, 1.0, l.y) * smoothstep(0.65, 0.0, l.x);  // caption scrim, bottom-left
  gl_FragColor = vec4(col, inside);   // transparent: true, so the bgQuad halo shows around the box
}
```

Keep the quad's scissor to the box rect + 2px (`renderer.setScissor`) so fragments outside the box are never shaded: at full bleed that is the whole screen anyway, everywhere else it saves most of the fill rate. Use the scissor, not `discard`.

**rimQuad (fragment, additive, in neonScene):** the neon outline that IS the route line once the aperture opens.

```glsl
uniform float uTrace, uPacket, uPacketAmt, uRimAmt;   // uRimAmt fades to 0 at full bleed (rim leaves the screen)
float perim(vec2 q, vec2 b) {                // 0..1 clockwise from the top-left corner (rectangle approximation)
  float W = 2.0*b.x, H = 2.0*b.y; vec2 c = q + b;
  float dt = c.y, dr = W - c.x, db = H - c.y, dl = c.x, s;
  if (dt <= min(min(dr, db), dl)) s = c.x;
  else if (dr <= min(db, dl))     s = W + c.y;
  else if (db <= dl)              s = 2.0*W + H - c.x;
  else                            s = 2.0*W + 2.0*H - c.y;
  return s / (2.0 * (W + H));
}
void main() {
  vec2 q = px() - uBox.xy;
  vec2 b = uBox.zw + 10.0;                                   // 10px outside the media: neon never covers UI pixels
  float d = sdBox(q, b, uRad + 10.0);
  float t = perim(q, b);
  float drawn = smoothstep(uTrace + 0.002, uTrace - 0.002, t);
  float core = exp(-abs(d) / 1.1), halo = exp(-abs(d) / 8.0) * 0.30;
  vec3 col = mix(BLUE, VIOLET, t) * (core + halo) * drawn * uRimAmt;
  float k = abs(t - uPacket); k = min(k, 1.0 - k);
  col += vec3(1.0) * exp(-k * 70.0) * core * uPacketAmt;    // white packet lapping the rim before a switch
  gl_FragColor = vec4(col, 1.0);                             // AdditiveBlending, depthTest false
}
```

During `node`/`iris` the trace is forced to 1 (a circle has no corner to start from). `uRimAmt = 1.0 - smoothstep(0.8, 1.0, zoomProgress)` and back to 1 during `settle`.

**Route ribbons (entry and exit):** a `BufferGeometry` strip built on the CPU in CSS px (3.5); the vertex shader maps px to clip space.

```glsl
// vertex
attribute vec2 aPx; attribute float aDist; attribute float aSide;   // aDist 0..1 along the path, aSide -1..1 across
uniform vec2 uView; varying float vDist; varying float vSide;
void main() { vDist = aDist; vSide = aSide;
  vec2 c = aPx / uView * 2.0 - 1.0; gl_Position = vec4(c.x, -c.y, 0.0, 1.0); }
// fragment
uniform float uHead, uTail, uLenPx;
void main() {
  float vis = step(uTail, vDist) * step(vDist, uHead);
  float a = abs(vSide);
  float core = smoothstep(0.16, 0.0, a), halo = (1.0 - a) * (1.0 - a) * 0.28;   // 22px strip: ~3.5px core
  float spark = exp(-max(uHead - vDist, 0.0) * uLenPx / 16.0);                  // bright head (the signal)
  vec3 col = mix(BLUE, VIOLET, vDist) * (core + halo) + vec3(1.0) * spark * core;
  gl_FragColor = vec4(col * vis, 1.0);                                            // additive
}
```

The built-in halo means the line still glows with bloom off (low tier, see 6).

**Nodes:** one `InstancedMesh` of a quad (or 3 to 6 sprites) with a radial falloff shader: white core 4px, blue halo 18px, idle pulse `1.0 + 0.08 * sin(uTime * 2.0)` (same as the hero's root halo). Nodes sit at: logo root (start), every bend of the route (small, 2.5px core, like the glyph's joints), center node, frame top-left corner (after `settle`), exit node.

### 3.5 Route geometry (the glyph's grammar)

```js
// Points in CSS px, recomputed in measure(). Only 0/45/90 degree segments.
function buildRoutes(W, H) {
  const L = document.querySelector(".nav__logo-root").getBoundingClientRect();     // a tiny span at the logo's root node
  const s = { x: L.left + L.width / 2, y: L.top + L.height / 2 };
  const c = { x: W / 2, y: H / 2 };
  const midY = Math.max(s.y + 60, H * 0.26);
  const dx = c.x - s.x;
  const run = Math.min(dx, c.y - midY);                                                // 45 degree run, clamped
  const entry = [s, { x: s.x, y: midY }, { x: s.x + run, y: midY + run }];
  if (s.x + run < c.x) entry.push({ x: c.x, y: midY + run });                         // horizontal remainder
  entry.push(c);                                                                      // final vertical drop
  routeEntry.set(ribbon(entry, 22, 14));             // width 22px, corner radius 14px (rounded joins like the glyph)
  const e0 = { x: KB.exit.cx, y: KB.exit.cy };
  routeExit.set(ribbon([e0, { x: e0.x, y: H + 40 }], 22, 0));
}
// ribbon(points, width, radius): fillet each corner with 6 arc samples, then extrude
// +-width/2 along the normal; write aPx, aDist (cumulative length / total), aSide (-1|+1).
```

`uLenPx` is the total length; `uHead` comes from `st.u.head`, `uTail` from `st.u.tail`. Rebuilt only on refresh/resize, never per frame.

Nav visibility: the v2 "frame steps aside" hides the nav on scroll down. While `enter`/`iris` is active force it visible (`html.frame-away` off), because the route starts at the logo. During `full`, the nav gets a top scrim (`html.on-media .nav::before { background: linear-gradient(#020816b3, transparent) }`).

### 3.6 Text inside the stage (the v2 readability fix, as rules)

1. **Everything visible during the pin is inside `.work__stage`.** No separate scrolling column next to a sticky stage (the v2 bug: copy scrolled behind the stage and was lost).
2. **Text and media never overlap by layout:** text in cols 1 to 4, frame in cols 5 to 12, frame measured from the DOM so GL can never drift onto text. The only text over media is the full-bleed caption: 13px mono, uppercase, bottom-left, on a scrim from both the shader (`uDim`) and a DOM gradient (`.work__caption::before`), contrast checked against the brightest SeeSky frame (target 4.5:1).
3. **Text is never scrubbed.** Opacity of copy is not tied to scroll. A state machine in `stage.sync(t)` derives the wanted state from `tl.time()` and, on change, plays timed transitions:

```js
// Gaps of "none" around each sweep: old copy leaves when the sweep starts, new copy locks in at 60% of it.
const STATES = [ ["none", 0, 2.2], ["full", 2.2, 2.6], ["none", 2.6, 3.24], ["seesky", 3.24, 4.2], ["none", 4.2, 4.56],
                 ["jobmanager", 4.56, 5.6], ["none", 5.6, 5.96], ["yapper", 5.96, 6.6], ["none", 6.6, 99] ];
function sync(t) {
  const want = STATES.find(([, a, b]) => t >= a && t < b)[0];
  if (want === cur) return;
  outro(cur);   // lines yPercent 0 -> -105 inside masks, 0.35 s, power3.in; autoAlpha 0; inert
  intro(want);  // lines yPercent 105 -> 0, 0.9 s, expo.out, stagger 0.06; chips stagger 0.02; delay 0.1
  cur = want; setCrumb(want); setCaption(want); setPlayback(want);
}
```

Transitions are interruptible (`overwrite: "auto"`), so fast scrolling never leaves two articles visible: `outro` kills the incoming tween of the same article.
4. **Text sits on flat navy.** The project glow is behind the frame only (decays over 110px, the text column starts at least 48px + gap away; check the halo luminance under the text is below `#0d1530`).
5. Body copy stays `#b1b1b1` on `#020816` (about 9:1). Titles white, Spline Sans 700, `clamp(44px, 5.2vw, 88px)`, uppercase like the hero name.

### 3.7 Video handling

- Elements: `<video muted playsinline loop preload="none">` with `muted`/`playsinline` set as attributes before `src` (iOS autoplay rule). `play()` returns a promise: always `.catch(() => showPoster())`.
- Sources: data URIs are decoded to Blob URLs **after first paint** (`requestIdleCallback`, chunked `atob` into a `Uint8Array`, `new Blob([...], { type: "video/webm" })`, `URL.createObjectURL`). Data-URI `src` on video seeks badly in Chrome and keeps the base64 string alive twice. Keep the base64 in a `<script type="application/octet-stream" id="v-seesky">` block, not in an HTML attribute (giant attributes slow the HTML parser).
- Texture: `new THREE.VideoTexture(video)`, `minFilter = magFilter = LinearFilter`, `generateMipmaps = false`. r128's VideoTexture already uses `requestVideoFrameCallback` (verified in the r128 build), so it uploads only on new frames: **a paused video costs nothing**. So pause aggressively.
- Playback rule (one decoder for the stage): `playing = stageActive && state in ["full", "seesky"] && !document.hidden && !userPaused`. Leaving the state pauses it (no restart to 0 on return; it resumes, it is a loop).
- Readout: `SEESKY / TRACKING UI / 00:04 / 00:10` in Spline Sans Mono 12px, updated every 250 ms from `currentTime` (real data, not decoration). No progress bar.
- Pause toggle (WCAG 2.2.2, loop longer than 5 s next to content): `.work__pause`, bottom-right of the frame (or of the viewport during `full`), mono label `Pause video` / `Play video`, `aria-pressed`.
- WebM support: `video.canPlayType('video/webm; codecs="vp9"')`. Older iOS Safari versions cannot decode WebM: then the texture is the poster image and SeeSky behaves like a still (scan pan). If the size budget allows, add an H.264 MP4 `<source>` for SeeSky only (it is the one at full bleed).
- Stills (JobManager, Yapper): honest stills, never faked as video. Life comes from the scan pan (12% overscan, `uPan` scrubbed during their hold) and the sweep.
- Textures are uploaded once at stage init (`renderer.initTexture(tex)` for stills) so the first sweep does not hitch.

### 3.8 Idle (alive, not busy)

While the stage is pinned and the user stops: rim gradient phase drifts (`t` offset by `uTime * 0.02`), node at the frame's top-left corner breathes, the square-wave edge in a running sweep slides (`uTime * 0.6`). Pointer: the whole screen box gets up to 6px of parallax toward the pointer (`box.cx += idle.x * 12`), applied in render only (never written back to the tweened object). Nothing else moves.

### 3.9 Render loop

```js
gsap.ticker.add((time) => {
  if (!stage.on || document.hidden) return;
  const z = zoomProgress();                       // derived from tl.time() between "zoom" and "full"
  setU(media, { uBox: [box.cx + idle.x * 12, box.cy + idle.y * 8, box.hx, box.hy], uRad: box.r,
                uSweep: u.mix % 1, uDim: u.dim, uPanA: ..., uTime: time });
  bindTextures(Math.floor(u.mix));                // swaps tA/tB uniforms only when the integer part changes
  setU(rim,   { uTrace: inIris ? 1 : u.trace, uPacket: u.packet, uPacketAmt: u.packetAmt, uRimAmt: 1 - smoothstep(0.8, 1, z) });
  setU(entry, { uHead: u.head, uTail: u.tail }); setU(exitR, { uHead: u.exitHead, uTail: 0 });
  setU(bg,    { uTintMix: u.tint % 1, uTintAmt: tintAmt() });
  if (tier.bloom) bloomComposer.render();
  drawFrame();                                    // order from 3.4
});
```

---

## 4. Statement: "Every problem starts as one node" (replaces the v2 tree)

- **Visual:** one large paragraph, Spline Sans 500, `clamp(30px, 4.4vw, 68px)`, line-height 1.08, max 18ch per line, left aligned on the grid (cols 2 to 10). Text: *"Every problem starts as one node. I break it into branches, then build the tools that connect them."* The words "one node" in the signature gradient (`background-clip: text`, `#2c7ffe` to `#642efd`). Under it, a single 18px paragraph in `#b1b1b1` about automation as that mindset in practice. No diagram, no SVG tree, no WebGL.
- **Motion:** word ink fill on scroll. Words split by hand into spans (helper in 9). Each word's color goes from `#5f6b80` (3.6:1 on navy: still readable at large size if the user stops mid-way) to `#ffffff`.

```js
gsap.to(words, { color: "#ffffff", stagger: 0.08, ease: "none",
  scrollTrigger: { trigger: ".statement", start: "top 70%", end: "bottom 55%", scrub: 0.5 } });
```

  The gradient words fill from 40% opacity to 100% instead (a gradient cannot tween to white).
- A tiny white node (8px, blue halo, CSS) sits before the first word and pulses once when the fill starts. It is the same node that the work stage's route line will end in: continuity in a single detail, not a diagram.
- Mobile: same, `font-size: 30px`, `start: "top 80%"`. Reduced motion: all words white, no split.

---

## 5. Signature on phones and touch (390px)

No pinned 420% stage on touch (address bar resizes, pin jumps, and a 4-screen pin with thumbs is tedious). Same story, DOM only, zero extra WebGL.

**5.1 Entry (CSS sticky, not a GSAP pin):** `.m-entry { height: 170svh } .m-entry__sticky { position: sticky; top: 0; height: 100svh; overflow: clip }` containing the SeeSky `<video>` (poster first). Scrubbed `clip-path` from a node-sized circle to full bleed, both written as `inset()` so GSAP can interpolate the numbers:

```js
const W = innerWidth, H = innerHeight, r = 26;
gsap.fromTo(".m-entry video",
  { clipPath: `inset(${H/2 - r}px ${W/2 - r}px ${H/2 - r}px ${W/2 - r}px round ${r}px)` },
  { clipPath: "inset(0px 0px 0px 0px round 0px)", ease: "none",
    scrollTrigger: { trigger: ".m-entry", start: "top top", end: "bottom bottom", scrub: 0.4 } });
```

The node before opening is a CSS dot with a static (not animated) `box-shadow` glow; it fades as the clip opens. The caption + pause button appear at the end (timed, not scrubbed). Video plays only while `.m-entry` intersects (IntersectionObserver, threshold 0.25).

**5.2 Project cards (stacked):** SeeSky, JobManager, Yapper. Each card: media first (full width inside 16px gutters, `aspect-ratio: 16/10`, square corners like his CV button), then kicker, title (`clamp(36px, 10vw, 44px)`), lead, chips, link. Text is always below media, never on it.

- Media reveal: the **square-wave sweep in CSS**: a `clip-path: polygon()` whose right edge is a 6-tooth square wave, its x animated from -12% to 112% once on enter (`start: "top 78%"`, 1.1 s, `expo.out`). Same point count at both ends so GSAP interpolates.

```js
function sqPoly(x, teeth = 6, amp = 3) {           // x and amp in %
  const pts = ["0% 0%"];
  for (let i = 0; i < teeth; i++) {
    const y0 = (i / teeth) * 100, y1 = ((i + 0.5) / teeth) * 100, y2 = ((i + 1) / teeth) * 100;
    pts.push(`${x + amp}% ${y0}%`, `${x + amp}% ${y1}%`, `${x - amp}% ${y1}%`, `${x - amp}% ${y2}%`);
  }
  pts.push("0% 100%");
  return `polygon(${pts.join(",")})`;
}
gsap.fromTo(media, { clipPath: sqPoly(-12) }, { clipPath: sqPoly(112), duration: 1.1, ease: "expo.out",
  scrollTrigger: { trigger: media, start: "top 78%", once: true } });
```

  A 2px neon bar (gradient, CSS) rides the edge via `translate` with the same tween, then fades.
- **Neon trunk:** a 2px vertical gradient line at `left: 7px` (inside the 16px gutter) running the height of the project list, with a CSS node (8px) at each card's kicker. It draws with `scaleY` (transform-origin top), scrubbed over the list (`start: "top 70%", end: "bottom 70%"`). Cheap, and it is the same line as on desktop.
- Video in cards: only SeeSky is a video here (already seen at the entry; the card uses its poster still). Turf and Inventory Generator videos live in "More work".

---

## 6. Performance budget

| Item | Desktop target | Touch target |
|---|---|---|
| Frame time | under 16.7 ms at 1440x900 on an integrated GPU (Iris Xe / M1); JS under 3 ms/frame | 60 fps on a Pixel 6a / Galaxy A54 / iPhone 12 class device |
| Stage GL | DPR min(dpr, 1.5); bloom composer at half of that; 5 mips | not created |
| Draw calls (stage) | bgQuad 1, mediaQuad 1 (scissored), rimQuad 1, ribbons 2, nodes 1, bloom ~11 internal, composite 1 | 0 |
| Shader cost | max 2 texture fetches per media pixel (only during a sweep), no loops over textures, no fbm | n/a |
| Active video decoders | max 2 (stage + index preview, never both visible) | max 1 |
| Texture memory | SeeSky video 1280x720, stills 1600px long edge (about 8 MB GPU total) | n/a |
| Main thread | no layout reads per frame: frame rect measured on refresh only (the pinned box does not move) | same |
| Long tasks | base64 decode chunked in idle callbacks, each chunk under 8 ms | same |

**Quality tiers (set at init, demoted at runtime):**

```js
const tier = { bloom: true, dpr: Math.min(devicePixelRatio, 1.5) };
if ((navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4) { tier.bloom = false; tier.dpr = 1; }
// runtime: rolling average of gsap.ticker deltaRatio over 90 frames; if > 1.35 -> bloom off; if still > 1.35 -> dpr 1.
```

Without bloom the neon still reads (each ribbon/rim has its own built-in halo).

**Lifecycle:** stage renders only while the work pin or contact is active; hero canvas only while the hero is visible; all videos pause on `visibilitychange`. Handle `webglcontextlost`: drop `gl-on`, show the static layout (section 7 CSS), never a black hole.

**Asset budget (base64 adds about 33%):**

| Asset | Encode | Raw | In file |
|---|---|---|---|
| SeeSky tracking UI | 1280x720, 30 fps, 8 to 10 s, VP9 CRF 36 | ~1.3 MB | ~1.75 MB |
| Turf Matchmaking (preview) | 800x500, VP9 CRF 40 | ~0.5 MB | ~0.65 MB |
| Inventory Generator (preview) | 800x500, VP9 CRF 40 | ~0.5 MB | ~0.65 MB |
| Posters x3 | WebP q70 | ~0.1 MB | ~0.13 MB |
| Stills (JobManager, Yapper, LabInc, Password Manager, Florist) | WebP q72, 1600px (stage) / 800px (index) | ~0.6 MB | ~0.8 MB |
| Photos (Basys 3, CNC, Vivado) | WebP q70, 1000px | ~0.3 MB | ~0.4 MB |
| Total media | | ~3.3 MB | **~4.4 MB** (well under 10 MB) |

```bash
ffmpeg -i seesky.mp4 -t 10 -vf "scale=1280:-2,fps=30" -an -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 -deadline good -cpu-used 2 seesky.webm
ffmpeg -i turf.mp4   -t 8  -vf "scale=800:-2,fps=30"  -an -c:v libvpx-vp9 -b:v 0 -crf 40 -row-mt 1 turf.webm
ffmpeg -ss 0.5 -i seesky.webm -frames:v 1 -vf "scale=1280:-2" -c:v libwebp -q:v 70 seesky-poster.webp
```

Cut loops at a visually matching frame (or end on a static UI frame) so `loop` has no visible jump.

---

## 7. Reduced motion and no-WebGL (one finished static layout)

`html.rm` or no WebGL or context lost:

- No Lenis, no pins, no scrub, no stage canvas, no hero-style idle motion below the hero.
- Statement: all words white, "one node" gradient.
- Work: the three articles stacked like the touch layout, but with media and text side by side on desktop (alternating is not needed: media right, text left, every row). Media: SeeSky shows its poster with a real `controls` video (no autoplay); stills plain. A static 2px neon rule (CSS gradient, fully drawn) runs down the left of the list with a node per project. Project glows: static CSS radial gradient behind each media box (`radial-gradient(closest-side, rgb(var(--tint) / .28), transparent)`), no blur filter.
- Index preview: thumbnail inline in each row (no cursor follower), videos show posters.
- Oscilloscope: one static frame, square-wave section centered.
- Contact: the glyph is a static inline SVG of the symbol (the favicon path) at 40% opacity around the button; no regrow.
- Hovers keep a visible state (color, underline, fill), no movement.
- The screenshot of the reduced-motion page must look complete: check it.

---

## 8. Quiet sections

### 8.1 More work (index)
- Rows: LabInc, Turf Matchmaking, Inventory Generator, Password Manager, Florist website, BlackBox, Stock tool. Grid `5fr 6fr 1fr`: title (Spline Sans 600, 28px), one line, mono tag (`JAVA`, `JS`, `LIVE DEMO`, `CLIENT`, `C++`).
- **Continuity:** a 2px gradient rule runs down the left edge of the list at the exact x where the stage's exit line left the screen (set a CSS variable from `KB.exit.cx` on refresh). It draws with `scaleY` from `top bottom` to `top 40%` (scrub 0.5). Each row has a node on that rule.
- **Row hover (one treatment for all project links):** the row's node fills white with a blue halo (0.3 s), a 1px gradient line draws from the node across the row (`background-size` 0 to 100%, 0.45 s, power3.out), title nudges 8px right. Same on `:focus-visible`. Touch: `:active` fill only.
- **Preview (desktop, fine pointer):** one fixed `.preview` box (`width: 26vw; aspect-ratio: 16/10`, square corners, 1px `#1a2233` border), follows the pointer with `gsap.quickTo` (0.6 s, power3.out) and rotates up to 6 degrees with horizontal velocity. Entry: clip `inset(50% 0 50% 0)` to `inset(0)` 0.45 s expo.out. For **Turf Matchmaking and Inventory Generator the preview plays the real video** (muted loop, `play()` on enter, `pause()` on leave, `currentTime` kept); other rows show stills. Hide on scroll when the pointer is no longer over the list (`elementFromPoint` check).
- Touch: inline 96x60 thumbnail at the row's right for rows with media; the two video rows autoplay muted only while the row is at least 60% in view, one at a time.

### 8.2 Oscilloscope separator
Existing behavior (sine that becomes a 4-term Fourier square wave near the cursor). Use it once, between More work and Below the API (it introduces the electronics). Pause its 2D canvas off screen; touch: the squared region follows scroll velocity at the viewport center instead of the cursor; reduced motion: one static frame. Its `sq()` is the same function as the stage's sweep edge: one visual idea, two places.

### 8.3 Below the API (electronics, supporting role)
- Heading + 2 short paragraphs left; three photos right (Vivado waveform "Simulate", Basys 3 on breadboard "Prototype", CNC engraving "Make it real"), square frames, captions below.
- Motion: inner-image parallax only. The `<img>` is 112% tall inside an `overflow: clip` frame, `yPercent: -6` to `6`, `scrub: true`, `start: "top bottom", end: "bottom top"`. Frames reveal once (clip `inset(0 0 100% 0)` to `inset(0)`, 1.2 s expo.out, stagger 0.1).
- Touch: a horizontal scroll-snap row of 3 cards at 78vw, no parallax. No 3D boards, no circuit FX (v1 was rejected for exactly that).

### 8.4 About, Right now, tools
- Dark panels `#0e1216`, the liked "Right now" checklist (thesis DQN agents in Mario and ViZDoom, SeeSky, own tools, tutoring math).
- Motion: when the panel enters (`start: "top 80%"`, once), each checkmark's SVG path draws (`strokeDashoffset` to 0, 0.5 s, stagger 0.08), text already visible (never hide content behind a reveal it depends on). Tool chips: `y: 12, autoAlpha: 0` to rest, 0.6 s, stagger 0.02, once. Chip hover: 1px gradient border via a pseudo-element `opacity` change.
- "After hours" line (geography, blending music, gym, ComfyUI arch-viz) as plain text, no motion.

### 8.5 Contact: the bookend
- Kicker "Have a project in mind?", "LET'S TALK" (Poppins 800, TALK outline that fills blue on hover, unchanged), magnetic EMAIL ME (unchanged), email address, links.
- Heading lines rise once on enter (masks, 1.0 s, expo.out, stagger 0.08).
- **Glyph regrows around EMAIL ME.** The stage canvas wakes (`ScrollTrigger` on `#contact`, `onToggle`). A `glyphScene` reuses the hero's builder (factor the hero's 43-node `P` / `ORDER` mesh construction into `buildGlyph(THREE)`, used by both canvases) with geometry translated so the root node is at the origin. Perspective camera; each frame the group's position is set so the root projects to the button's **rest** center (cache the rect on refresh; ignore the magnetic offset, so the button visibly pulls away from the root and springs back: attraction made literal).
  - Grow: scrubbed, `start: "top 80%"`, `end: "center center"`, scrub 0.8, same per-segment scale logic as the hero's `grow`.
  - Size: glyph diameter about 1.8x the button; nothing else may sit inside that circle (the email line is below it with 32px clearance). Branches peek around the button; the button covers the root.
  - Look: same tubes as the hero, rendered into the bloom scene (second `RenderPass(glyphScene, perspCam)` with `clear = false`), opacity 0.55, slow rotation `idle * 0.04` + pointer tilt up to 0.25 rad.
  - Touch: the glyph is a static inline SVG (favicon path, gradient stroke) behind the button, drawn once with `strokeDashoffset` on enter. Reduced motion: static SVG.

---

## 9. Helpers

```js
// Hand split (SplitText is not on cdnjs 3.12.5). Words for the statement, masked lines for titles.
function splitWords(el) {
  const words = el.textContent.trim().split(/\s+/);
  el.setAttribute("aria-label", el.textContent.trim());
  el.innerHTML = words.map((w) => `<span class="w" aria-hidden="true">${w}</span>`).join(" ");
  return [...el.querySelectorAll(".w")];
}
function splitLines(el) {                         // after document.fonts.ready; re-run on resize (debounced)
  const ws = splitWords(el); const lines = []; let top = null;
  ws.forEach((w) => { const t = w.offsetTop; if (t !== top) { lines.push([]); top = t; } lines.at(-1).push(w); });
  el.innerHTML = lines.map((l) => `<span class="ln" aria-hidden="true"><span class="ln__i">${l.map((w) => w.textContent).join(" ")}</span></span>`).join("");
  return [...el.querySelectorAll(".ln__i")];      // CSS: .ln { display: block; overflow: clip } .ln__i { display: block }
}
```

Keep gradient words (`<em>one node</em>`) as their own span so `background-clip: text` survives the split.

---

## 10. Pitfalls to avoid

1. **Text behind a sticky stage (the v2 failure).** Never put a scrolling text column beside or behind a sticky/pinned visual. Everything visible during a pin lives inside the pinned element; text and media are separated by layout; copy opacity is never scrubbed; the canvas is always below the DOM.
2. **Half-faded text at rest.** Scrubbed opacity leaves copy at 40% when the user stops. Use the state machine (3.6) plus Lenis-driven snap to rest labels.
3. **SplitText from cdnjs 3.12.5 does not exist (404).** Hand split, or move the whole site to one newer GSAP build; never mix versions.
4. **Bloom on everything.** Full-frame `UnrealBloomPass` blooms white UI text in the videos and breaks canvas alpha in r128. Bloom only the neon scene (3.4).
5. **Color mismatch GL vs CSS.** Stage renderer stays `LinearEncoding`, no tone mapping, raw sRGB hex in shaders. Do not set `texture.encoding = sRGBEncoding` on video in a custom ShaderMaterial (r128 does not decode it for you; colors shift).
6. **Snap fighting Lenis.** ScrollTrigger `snap` + Lenis jitters. Snap with `lenis.scrollTo` after scroll settles (3.3).
7. **Pins and refresh order.** Create ScrollTriggers top to bottom; `refresh()` after fonts and after video metadata loads (poster size can shift layout); `invalidateOnRefresh` on every function-based value; `anticipatePin: 1`.
8. **Fixed canvas on mobile browsers.** Size to `100lvh`, `ignoreMobileResize: true`, never resize the renderer on toolbar show/hide (compare width only).
9. **Horizontal overflow at 390px.** No `100vw` widths (scrollbar width), use `100%` / `inset: 0`; check `scrollWidth === innerWidth` at 390px.
10. **Video autoplay and WebM on iOS.** `muted` + `playsinline` attributes before `src`, catch `play()` rejections, test `canPlayType` and fall back to poster + scan pan.
11. **Data URI video.** Convert to Blob URLs after first paint; never put multi-MB base64 in an HTML attribute.
12. **Hidden work wasted.** Pause videos and stop rendering off screen and on `visibilitychange`; VideoTexture uploads only on new frames (rVFC in r128), so a paused video is free.
13. **`discard` and full-screen fill rate.** Scissor the media quad to the box rect; keep fullscreen shaders to a handful of ALU ops (no fbm).
14. **Filters and shadows on scroll.** No animated `filter: blur()`, no animated `box-shadow`; glows are GL (desktop) or static CSS gradients (fallback).
15. **Nav hiding at the wrong moment.** The route starts at the logo: force the nav visible during `enter`/`iris`; add a top scrim while media is full bleed.
16. **Keyboard and screen readers in the pinned stage.** Inactive articles are `inert` and hidden; the `01 02 03` links and `focusin` jump to their label so every project is reachable; the DOM `<video>`/`<img>` remain for semantics with real `alt` text.
17. **Two WebGL contexts.** Fine, but only one may render per frame; dispose nothing on scroll (re-creating contexts on mobile leaks), just stop rendering.
18. **Brand drift.** Only `#020816`, `#0a2a78`, `#0e1216`, `#09080c`, `#b1b1b1`, white, `#2c7ffe`, `#642efd` and the blue to violet gradient; the per-project glows (JobManager green, SeeSky violet, Yapper blue) are his own liked signature and appear only behind the frame. No new hues, no glassmorphism.
19. **Typography in copy.** No em or en dashes in any visible text (use commas, colons or "to").

---

## 11. Build order and QA

1. Factor `buildGlyph()` out of the hero (no visual change to the hero; screenshot diff it).
2. Static layout for work/index/etc. (this is also the reduced-motion layout). Get 390px right first.
3. Stage canvas: bgQuad + mediaQuad with the SDF box driven by a debug slider; then the timeline; then rim and ribbons; then bloom; then text state machine; then video playback rules; then Lenis snap.
4. Touch variant (5), then contact bookend (8.5).
5. QA: Playwright screenshots at 1440x900 and 390x844 at each rest label (`full`, `seesky`, `jobmanager`, `yapper`) and mid-transition; reduced-motion screenshot; FPS sample with 4x CPU throttle (target 55+ desktop); `scrollWidth` check at 390px; contrast of the caption over the brightest SeeSky frame; keyboard pass (Tab reaches all three projects' links); no console errors with WebGL disabled (`--disable-webgl`).
