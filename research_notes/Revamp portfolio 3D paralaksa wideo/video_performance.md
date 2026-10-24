# Video and heavy 3D on a portfolio site without wrecking performance (as of Oct 2026)

Context: static site on GitHub Pages with a custom domain, no build step, an existing single rAF effects loop (`js/effects.js`) that already gates canvases with `near(el)` and honors `prefers-reduced-motion`. Research budget: about 20 tool calls. Some primary sources were unreachable: the ffmpeg trac wiki returned an Anubis bot wall, and the Codrops OPTIKKA article returned 403. Those gaps are noted where they matter.

## Q1. Best encoding recipe for short (5-20 s) silent UI screen recordings, with ffmpeg commands for AV1/WebM + H.264 fallback

### Takeaway
Ship two or three files in `<source>` order, best codec first: AV1 (or VP9) in WebM, then H.264 MP4 as the universal fallback. Use CRF (constant-quality) mode, no audio track, `yuv420p`, an even-dimension scale, and `+faststart` on the MP4. Every attribute and the source ordering come from web.dev. The exact AV1 CRF value and the "-an / -g" details are practitioner choices that no single official 2025-26 doc pins down.

### Cited Findings
- web.dev's canonical commands (from the "replace GIFs with video" article, last substantively updated 2019, so the codec choices are dated but the pattern holds): H.264 `ffmpeg -i in.gif -b:v 0 -crf 25 -f mp4 -vcodec libx264 -pix_fmt yuv420p out.mp4`, and VP9 `ffmpeg -i in.gif -c vp9 -b:v 0 -crf 41 out.webm`. Add `-vf "crop=trunc(iw/2)*2:trunc(ih/2)*2"` for odd dimensions, because libx264 + yuv420p needs even width and height. - [web.dev: Replace animated GIFs with video](https://web.dev/articles/replace-gifs-with-videos)
- Example savings: GIF 3.7 MB, MP4 551 KB (about 85% smaller), WebM 341 KB (about 91% smaller). - [web.dev](https://web.dev/articles/replace-gifs-with-videos)
- Source ordering matters. Browsers do not pick the smallest file; they take the first `<source>` whose type they support. Put WebM first and MP4 last. - [web.dev](https://web.dev/articles/replace-gifs-with-videos)
- The Lighthouse "use video formats for animated content" audit page has a last-update date of 2019-05-02. As of Lighthouse 13 it is folded into the "Improve image delivery" insight. - [Chrome for Developers: efficient-animated-content](https://developer.chrome.com/docs/lighthouse/performance/efficient-animated-content)
- libsvtav1 CRF range is 0-63. The default CRF differs between wiki revisions (30 / 35 / 50 are all cited), so set `-crf` explicitly. Presets run 0-13; higher is faster, and 13 is only for debugging. The wiki notes CRF about 38 is usually enough for VMAF ≥95 on 4K-8K sources. - [ffmpeg trac Encode/AV1 (rev 51)](https://trac.ffmpeg.org/wiki/Encode/AV1?version=51), [rev 52](https://trac.ffmpeg.org/wiki/Encode/AV1?version=52) (search-snippet level only; the live wiki was bot-walled)
- A community default for SVT-AV1 is CRF 35 at preset 6, explicitly not an official recommendation. - [Cinelerra list, Sep 2024](https://lists.cinelerra-gg.org/pipermail/cin/2024-September/008651.html)
- In an SVT-AV1 preset benchmark, presets 0-4 cluster on the high-quality side. - [OTTVerse](https://ottverse.com/analysis-of-svt-av1-presets-and-crf-values/)
- `-movflags +faststart` (moves the moov atom to the front so playback can start before the full download) is recommended for web MP4. I found it only in a secondary 2025 guide, because the official wiki was unreachable. - [skillselion ffmpeg-fundamentals-2025](https://skillselion.com/skills/josiahsiegel/claude-plugin-marketplace/ffmpeg-fundamentals-2025)
- AV1 support on Apple: the iPhone 15 Pro (A17 Pro, Sept 2023) was the first Apple device with hardware AV1 decode. M3 Macs and the M4 iPad Pro followed. Safari exposes AV1 only on devices with a hardware decoder, from Safari 17 on newer devices. Older iPhones and M1/M2 Macs fall through to the next `<source>`. - [Bitmovin: Apple AV1 support](https://bitmovin.com/apple-av1-support), [Discourse Meta thread citing caniuse](https://meta.discourse.org/t/eta-on-safari-playback-issues/388277)

### Inferences
- Recommended recipe for silent 5-20 s UI recordings. Synthesized from the sources above; the specific values are my recommendation, not quoted from one source. Tune CRF by eye, because UI text is sensitive to blur:
  ```bash
  # 0) common: scale to display width, even dims, drop audio, 30 fps is plenty for UI
  VF="scale='min(1280,iw)':-2:flags=lanczos,fps=30"

  # 1) AV1 in WebM (best compression; Chrome/Edge/Firefox, Safari on HW-AV1 devices)
  ffmpeg -i rec.mov -vf "$VF" -an -c:v libsvtav1 -preset 6 -crf 35 \
         -g 60 -pix_fmt yuv420p -svtav1-params tune=0 out.av1.webm
  #    (tune=0 = visual/subjective tune; keyframe every 2 s at 30 fps)

  # 2) VP9 WebM (optional middle tier; web.dev-style constant quality)
  ffmpeg -i rec.mov -vf "$VF" -an -c:v libvpx-vp9 -b:v 0 -crf 36 \
         -row-mt 1 -g 60 -pix_fmt yuv420p out.vp9.webm

  # 3) H.264 MP4 fallback (plays everywhere, incl. older iPhones)
  ffmpeg -i rec.mov -vf "$VF" -an -c:v libx264 -preset slow -crf 23 \
         -profile:v high -pix_fmt yuv420p -g 60 -movflags +faststart out.mp4

  # 4) poster = first frame, as AVIF/WebP
  ffmpeg -i out.mp4 -frames:v 1 -q:v 2 poster.png   # then convert to .webp/.avif
  ```
  HTML:
  ```html
  <video autoplay muted loop playsinline preload="none" poster="poster.webp" width="1280" height="720">
    <source src="out.av1.webm" type='video/webm; codecs="av01.0.05M.08"'>
    <source src="out.vp9.webm" type='video/webm; codecs="vp9"'>
    <source src="out.mp4"      type='video/mp4; codecs="avc1.640028"'>
  </video>
  ```
  The `codecs=` parameter is needed for the AV1 source so Safari on non-AV1 hardware skips it rather than picking a WebM it cannot decode. This comes from general knowledge of how `canPlayType` works, not from a source fetched here.
- For UI screencasts (sharp text, flat colours), web.dev's VP9 CRF 41 is probably too aggressive; text gets mushy. Starting around CRF 30-36 (VP9/AV1) and 20-24 (x264) is safer. Expect roughly 150-600 KB per 10 s clip at 1280 px wide for AV1, but measure on your own footage.
- HEVC/H.265 MP4 is an option for Apple devices without AV1 hardware, but it adds a fourth file for little gain over H.264 at these tiny sizes. Skip it for a portfolio.
- Dropping audio (`-an`) matters beyond file size. Per the WebKit policy (Q4/Q5), a video with no audio track autoplays even if `muted` is somehow lost.

### Gaps
- I could not read the current ffmpeg trac AV1/VP9/H.264 wiki pages (bot wall), so I could not confirm current official CRF guidance or `-svtav1-params` options such as `fast-decode`.
- I could not open the live caniuse AV1 page. Exact 2026 global AV1 support percentages are unverified.

## Q2. Best technique for scroll-scrubbed video in 2026 and its trade-offs

### Takeaway
Three options exist. `video.currentTime` scrubbing is the smallest payload but janky. A pre-decoded image sequence drawn to `<canvas>` is the most reliable and frame-accurate, but heaviest on the network. WebCodecs (decode the MP4 into frames, draw them to canvas) is the efficient middle path, with more code and an up-front decode cost. For a no-build portfolio, the practical 2026 answer is a canvas image sequence (WebP/AVIF frames, about 60-150 frames, loaded progressively). Use `currentTime` scrubbing only with an all-intra / very short-GOP encode.

### Cited Findings
- `currentTime` seeking is asynchronous and throttled by the decoder. The `seeked` event can lag scroll input by about 50-150 ms depending on codec and keyframe spacing (the guide's own figure, not independently measured). - [tessl: scroll-scrubbed visual sequence](https://tessl.io/registry/skills/github/MengTo/Skills/scroll-scrubbed-visual-sequence)
- A developer who moved a scroll-scrubbed portfolio off `<video>` reports async seeks plus keyframe gaps causing stutter, and mobile Safari complicating autoplay and inline playback. The canvas + frames approach fixed it. - [DEV: scroll-scrubbed video portfolio (Next.js 15 + GSAP + canvas)](https://dev.to/pratham7711/how-i-made-a-scroll-scrubbed-video-portfolio-fast-nextjs-15-gsap-canvas-1mj6)
- CSS WG discussions (2024-2025) on scroll-driven animations note that scrubbing video with scroll timelines does not work well out of the box, and that frequent keyframes in the encode matter more than buffering. There is no native "scroll-timeline drives video" feature. - [W3C public-css-archive Sep 2024](https://lists.w3.org/Archives/Public/public-css-archive/2024Sep/0784.html), [Jan 2025](https://lists.w3.org/Archives/Public/public-css-archive/2025Jan/0884.html)
- Image sequences on canvas are presented as the most reliable frame-accurate option. The trade-off is bandwidth, mitigated by re-encoding frames as WebP and tuning quality per asset. - [DEV article](https://dev.to/pratham7711/how-i-made-a-scroll-scrubbed-video-portfolio-fast-nextjs-15-gsap-canvas-1mj6); [Codrops: OPTIKKA, from HTML5 video to frame sequences](https://tympanus.net/codrops/?p=103024) (title and summary only; the full article returned 403)
- WebCodecs gives direct frame access, so frames can be drawn to canvas in both scroll directions without buffering lag. The tutorial author notes little production material exists (Aug 2025). - [Medium: WebCodecs video scroll synchronization](https://lionkeng.medium.com/a-tutorial-webcodecs-video-scroll-synchronization-8b251e1a1708)
- The `scrolly-video` npm component supports both modes. It says WebCodecs gives the best performance but must decode all frames up front, and it describes WebCodecs as Chrome-only with no polyfill. That claim is likely outdated (see Inferences). - [scrolly-video on npm](https://www.npmjs.com/package/scrolly-video)

### Inferences
- **Outdated advice flag:** "WebCodecs is Chrome-only" (scrolly-video README) is stale. From prior knowledge, Safari shipped `VideoDecoder` in 16.4 and Firefox shipped WebCodecs in 130 (2024). I did not re-verify this on caniuse this session, so check caniuse.com/webcodecs before relying on it.
- If you use `currentTime` scrubbing, encode the scrub clip all-intra or near-intra so any seek lands on a keyframe: `ffmpeg -i in.mov -an -c:v libx264 -crf 22 -g 1 -keyint_min 1 -sc_threshold 0 -pix_fmt yuv420p -movflags +faststart scrub.mp4`. A short GOP (`-g 5`-`10`) is a size/smoothness compromise. All-intra files are typically 3-6x larger than normal GOP encodes, which erodes the "smallest payload" advantage. These are my numbers, not a cited figure.
- Throttle seeks to one in flight: set `currentTime` only after the previous `seeked` fires, and drive the target from a lerped scroll value inside the existing rAF loop. This avoids the decoder queue thrash described above.
- For this site (no bundler, existing canvas FX loop), the canvas-sequence approach fits the established `fx-host` / `fx-bg` / `near(el)` pattern. Load a low-res, every-4th-frame pass first, fill in the rest, `createImageBitmap()` the frames, and draw only when the section is near the viewport. With reduced motion, show a single static frame.
- Rough sizing: 90 frames x about 40-80 KB (WebP, 1280 px) is about 3.5-7 MB. That is heavy for mobile, so serve a smaller frame set (e.g. 720 px, 60 frames) below about 768 px viewport width, or skip scrubbing on mobile entirely and show a looping clip or a still. These figures are illustrative, not sourced.

### Gaps
- No authoritative 2025-26 benchmark compares the three techniques head-to-head on mid-range phones.
- The Codrops OPTIKKA article (frame counts, formats, payload numbers) could not be fetched (403).

## Q3. Where to host videos for a GitHub Pages site, and the limits

### Takeaway
Small, optimized clips (well under 50 MB each, a few MB in practice) can live in the repo and be served by Pages. The hard walls are 100 MiB per file (git push block), 1 GB published-site size and a 100 GB/month soft bandwidth cap. Do not use Git LFS for Pages assets; it is not documented as served. For anything larger or numerous, use Cloudflare R2 behind a custom subdomain (zero egress), Bunny Stream (cheap HLS/CDN) or Cloudflare Stream (per-minute). For long demo reels, use a YouTube/Vimeo embed behind a click-to-load facade.

### Cited Findings
- GitHub Pages limits: published site ≤ 1 GB; source repo recommended ≤ 1 GB; soft bandwidth limit 100 GB/month; soft limit of 10 builds/hour, which does not apply when publishing with a custom GitHub Actions workflow (this repo uses `.github/workflows/static.yml`); deployments time out after 10 min; rate-limited requests get HTTP 429. The Pages limits page does not mention Git LFS. - [GitHub Docs: GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
- Git file limits: warning above 50 MiB, block above 100 MiB, browser upload cap 25 MiB. Files beyond the block "must use Git LFS". - [GitHub Docs: About large files on GitHub](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)
- GitHub Release assets have no total release size limit and no delivery bandwidth cap; each file must be under the plan's Git LFS max. - [GitHub Docs: About large files](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)
- Git LFS does not integrate with Pages builds; you get pointer files rather than content (stated for cloud.gov Pages, and the same pattern is reported for GitLab Pages). I found no official GitHub statement either way. - [cloud.gov Pages: large file handling](https://cloud.gov/pages/documentation/large-file-handling), [GitLab issue #16027](https://gitlab.com/gitlab-org/gitlab/-/issues/16027)
- Cloudflare R2: free tier of 10 GB-month Standard storage, 1 M Class A and 10 M Class B ops/month (recurring); egress $0; paid $0.015/GB-month. One aggregator claims no free plan as of June 2026, contradicting the others; treat that as an outlier. - [Filebase: R2 pricing 2026](https://filebase.com/blog/cloudflare-r2-pricing-costs-savings-and-alternatives-in-2026/), [Mecanik: R2 pricing explained](https://mecanik.dev/en/posts/cloudflare-r2-pricing-explained-real-costs-vs-s3-and-backblaze/); contradicted by [CostBench](https://costbench.com/software/cloud-infrastructure/cloudflare-r2/free-plan/)
- Cloudflare Stream: ingress and encoding free; $5 per 1,000 minutes stored (prepaid); $1 per 1,000 minutes delivered, egress included. No free tier found. - [Cloudflare Stream pricing docs](https://developers.cloudflare.com/stream/pricing/index.md)
- Bunny Stream (official page): free encoding, storage from $0.01/GB, CDN from $0.005/GB, $1/month minimum. Third parties quote region-dependent delivery ($0.010/GB EU/NA, up to $0.060/GB elsewhere), so check the official page. - [bunny.net Stream pricing](https://bunny.net/pricing/stream/), [Bitdoze review 2026](https://www.bitdoze.com/bunny-net-review/)
- YouTube facade: Paul Irish's `lite-youtube-embed` web component (about 3 KB) shows a thumbnail and play button and loads the real iframe on click, using `youtube-nocookie.com`. web.dev recommends it. Monitoring data cited by corewebvitals.io shows about 800 ms faster average LCP vs direct embeds. Lighthouse's "lazy load third-party resources with facades" audit was retired in Lighthouse 13. - [corewebvitals.io: Perfect YouTube Core Web Vitals](https://corewebvitals.io/pagespeed/perfect-youtube-core-web-vitals), [WP Rocket docs](https://docs.wp-rocket.me/article/1458-lazy-load-third-party-resources-with-facades), [GTmetrix](https://gtmetrix.com/lazy-load-third-party-resources-with-facades.html)

### Inferences
- For this portfolio, 3 project reels plus hover previews at about 0.3-2 MB each total well under 50 MB. Keeping them in the repo (e.g. `video/`) is fine and simplest; Pages serves them from Fastly with HTTP range requests. Every committed byte deploys, so keep the source `.mov` files out of the repo (e.g. via `.gitignore`).
- Bandwidth sanity check: 100 GB/month at about 5 MB of video per full visit is about 20,000 full visits/month, far above portfolio traffic. The soft cap is not a practical concern.
- If moving to R2: create a public bucket on a custom subdomain such as `media.<domain>`. The free-tier `r2.dev` URL is rate-limited and not meant for production (prior knowledge, not verified this session). Set CORS if videos are drawn to canvas or decoded via WebCodecs, otherwise the canvas is tainted / fetch fails.
- Avoid YouTube/Vimeo for short silent loops and hover previews: their players cannot do seamless muted loops cheaply, and they add hundreds of KB of JS. Use them only for long, narrated walkthroughs, behind a facade.

### Gaps
- No official GitHub doc explicitly says "Pages does not serve LFS objects". This is inferred from absence and from other platforms.
- The 2026 pricing figures come mostly from secondary sources. Re-check the official Cloudflare R2 and Bunny pages before committing.

## Q4. Concrete performance budget numbers (web.dev / Chrome team / industry) for a 3D + video site on mid-range phones

### Takeaway
Core Web Vitals "good" thresholds are unchanged in 2026: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at the 75th percentile, split by mobile and desktop. INP replaced FID in 2024. For byte budgets, Alex Russell's P75-device series (the most-cited industry baseline) gives about 1.3 MiB total critical-path weight for a JS-heavy site and about 300-350 KiB gzipped JS (2023 edition) for a 5 s first load. Treat 3D/GLB and video as lazy, post-LCP payloads outside that critical budget.

### Cited Findings
- CWV thresholds: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1, assessed at the 75th percentile, segmented mobile/desktop. A page passes only if all three meet target. INP became a stable Core Web Vital in 2024, replacing FID. Advice still citing FID / 100 ms is outdated. - [web.dev: Web Vitals](https://web.dev/articles/vitals)
- The "needs improvement / poor" bands (LCP > 4 s, INP > 500 ms, CLS > 0.25 = poor) are defined in web.dev's threshold-methodology article, which the vitals page links but does not restate. - [web.dev: Web Vitals](https://web.dev/articles/vitals) (bands from prior knowledge; not re-fetched)
- Russell, Performance Inequality Gap 2024: targets P75 devices and networks; for a 5 s first load, about 1.3 MiB total for JS-based sites (split about evenly markup/JS), or about 2.5 MiB for markup-centric stacks. JS is at least 3x more expensive per byte than HTML/CSS/images/fonts on low-end hardware. The 2023 edition gave about 300-350 KiB gzipped JS. No dedicated 2025 edition was found; his JSNation 2025 talk restates the thesis. - [infrequently.org (2024 edition listing)](https://www.infrequently.org/page/2/), [2023 baseline](https://infrequently.org/2022/12/performance-baseline-2023?ref=refind), [Jim Nielsen notes on JSNation 2025 talk](https://notes.jim-nielsen.com/n/2025-07-11-1311/)
- At one site, P75 Android time-to-interactive was 66% slower than iOS (single-site data). - [Web Performance Calendar](https://calendar.perfplanet.com/?p=2890)
- Three.js on mobile: cap DPR with `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`, because DPR 2-3 screens render 4-9x the pixels. On weak devices, drop to 1 or even 0.5; pixel ratio is the single biggest lever. Render on demand (R3F `frameloop="demand"` + `invalidate()`; in vanilla three.js, skip `render()` unless dirty) to bring idle GPU use near zero. - [hontran.dev: three.js performance optimization](https://www.hontran.dev/blog/three-js-performance-optimization), [three.js forum: weak devices](https://discourse.threejs.org/t/searching-ways-for-flexible-performance-improvement-on-weak-devices/2439), [three.js forum: pixel ratio by FPS](https://discourse.threejs.org/t/changing-pixelratio-based-on-fps-good-or-bad-idea/34563)
- `detect-gpu` (`getGPUTier()`) can run before the 3D bundle loads, to pick model, texture and DPR quality. Its caveat: the benchmark DB may not recognise new GPUs if the package isn't updated, and GPU alone ignores load and resolution. Laptops with integrated or Optimus graphics can be weaker than phones, so "is mobile" is a bad proxy. - [three.js forum](https://discourse.threejs.org/t/searching-ways-for-flexible-performance-improvement-on-weak-devices/2439), [Snyk detect-gpu examples](https://snyk.io/advisor/npm-package/detect-gpu/example)
- `navigator.hardwareConcurrency` is Baseline since March 2022, but Safari clamps it to 4 or 8 to resist fingerprinting. `navigator.deviceMemory` is Chromium-only (not Safari/Firefox, per a secondary source). Neither is reliable alone. - [MDN: hardwareConcurrency](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/hardwareConcurrency), [caniuse: hardwareconcurrency](https://caniuse.com/hardwareconcurrency), [send.win: Device Memory API](https://blog.send.win/device-memory-api-fingerprinting/)
- Native `loading="lazy"` for `<video>`/`<audio>` defers the network request until near the viewport. Reported for Chrome 148 (2026) on desktop, Android and WebView. Reporting is press-level, not a Chrome release note. Older web.dev text already describes `loading="lazy"` on media working alongside `poster`, `preload` and `autoplay`. - [PCWorld: Chrome 148 will lazy-load video and audio](https://www.pcworld.com/article/3106354/chrome-148-will-lazy-load-video-and-audio-closing-a-long-standing-gap.html), [web.dev: Lazy loading video](https://web.dev/articles/lazy-loading-video)
- web.dev lazy-video pattern: for non-autoplay video use `preload="none"` + `poster` (the default `metadata` preload can fetch more than expected via range requests), optionally switching to `preload="metadata"` on `mouseenter`. For autoplay video, put sources in `data-src`, swap them in via IntersectionObserver, call `video.load()`, then unobserve. - [web.dev: Lazy loading video](https://web.dev/articles/lazy-loading-video)
- iOS (WebKit policy): muted or audio-less `<video autoplay>` plays only while visible and pauses when it leaves the viewport. `play()` without a gesture is allowed if muted / no audio and returns a Promise that rejects otherwise. Unmuting without a gesture pauses playback. `playsinline` is required on iPhone to avoid fullscreen. The policy dates from 2016 and is still the operative baseline. - [WebKit: New video policies for iOS](https://webkit.org/blog/6784/new-video-policies-for-ios/)

### Inferences
Suggested budget for this site on a mid-range Android (Moto G / Galaxy A-class, 4G). This is a synthesis, not an official table:

| Item | Budget | Notes |
|---|---|---|
| LCP (P75 mobile) | ≤ 2.5 s, aim ≤ 2.0 s in lab on "Slow 4G" | LCP element should be text or a small poster image, never a WebGL canvas or a video download |
| INP | ≤ 200 ms | Keep rAF work per frame under about 8-10 ms; no long tasks from GLB parsing on the main thread (use DRACO/Meshopt decoders in workers) |
| CLS | ≤ 0.1 | `width`/`height` or `aspect-ratio` on every `<video>`, canvas and gallery box |
| Critical-path JS (gz) | ≤ about 150-350 KiB | Russell's 2023 range is the ceiling; three.js core alone is about 150-180 KiB gz (prior knowledge), so load it dynamically after LCP |
| Total initial load (pre-scroll) | ≤ about 1-1.5 MB | Matches Russell's about 1.3 MiB figure |
| Per 3D model (GLB, Draco/Meshopt + KTX2) | ≤ about 1-2 MB mobile, ≤ 3-5 MB desktop | Industry rule of thumb, not an official number |
| Hover-preview clip | ≤ about 300-800 KB, 3-6 s, ≤ 720 px wide | Load on hover/intent only |
| Hero background loop | ≤ about 1-2 MB, ≤ 10 s, with poster | Or no video on mobile/Save-Data |
| Project reel (click to play) | any size, `preload="none"` | Not counted in the initial budget |

- Off-screen pausing: reuse the existing `near(el)` gating. For `<video>`, also `pause()` via IntersectionObserver when out of view, because only iOS does this automatically. Pause everything on `visibilitychange` when hidden.
- Low-end tiering heuristic: `prefers-reduced-motion` OR `navigator.connection?.saveData` OR `deviceMemory <= 4` (Chromium) OR `hardwareConcurrency <= 4` OR detect-gpu tier ≤ 1 → static poster images and no WebGL. Add a runtime FPS watchdog: if the median frame time exceeds about 25 ms over 2 s, drop DPR to 1, then fall back to a static image.

### Gaps
- No 2025-26 official Chrome/web.dev number for GLB or video byte budgets exists. The table's GLB and video rows are rules of thumb, not citations.
- Russell's 2025/2026 budget editions (if any) were not found.
- Chrome 148 `loading="lazy"` for video: final shipping status not confirmed from a primary source (chromestatus).

## Q5. How award-winning heavy sites keep LCP < 2.5 s on mobile

### Takeaway
They make sure the LCP element is cheap: a text heading or a small, preloaded poster image. The video, WebGL scene and image sequences load after first paint and fade in over the poster. The heavy experience is progressive enhancement layered on a fast static page, tiered down or off on weak devices.

### Cited Findings
- Since Chrome 116 (Aug 2023), a `<video>` can be an LCP candidate like an image, timed at the first presented frame. Before that, only posters counted. - [Chromium metrics changelog 2023_08_lcp](https://chromium.googlesource.com/chromium/src/+/main/docs/speed/metrics_changelog/2023_08_lcp.md)
- LCP is recorded when the poster or the first frame shows, whichever comes first. Swapping the poster for the video usually does not create a new LCP entry, so a fast poster "locks in" LCP. Preload the poster with `<link rel="preload" as="image" fetchpriority="high">`. Make the poster smaller than the video (WebP/AVIF), use the same aspect ratio, and use `object-fit: cover`. Chrome does not support preloading the video file itself, so preload the poster instead. Real-world example: a video LCP of 10.5 s. Demo: 1.55 s → 1.23 s with a poster → 1.2 s with a preloaded poster. - [DebugBear: Optimize video LCP (updated Oct 2025)](https://www.debugbear.com/blog/optimize-video-lcp)
- Facading third-party video embeds cuts average LCP by about 800 ms in one monitoring dataset. - [corewebvitals.io](https://corewebvitals.io/pagespeed/perfect-youtube-core-web-vitals)
- Rendering on demand and capping DPR keep the main thread and GPU free (see Q4 sources).

### Inferences
- Pattern for this site: keep the banner's LCP as the `<h1>`/intro text, which is already the case with the D3 graph. Never make a WebGL canvas or autoplay video the largest element above the fold. If a hero video is added, give it a preloaded AVIF/WebP poster under about 60 KB, and inject `<source>` only after `load` / `requestIdleCallback`.
- Load 3D libraries with dynamic `import()` triggered by IntersectionObserver (`rootMargin: '200px'`), never in `<head>`. For a no-build site, use an ES-module CDN URL with an exact version, or vendor the file.
- I found no source quantifying what Awwwards/FWA winners actually score. Many heavy award sites fail CWV in CrUX; "award-winning" does not imply fast. This is unverified, so it stays an inference.

### Gaps
- No case study (Codrops, Awwwards) with measured mobile LCP for a 3D-heavy portfolio was retrieved. The Codrops OPTIKKA article was 403.

## Q6. Accessibility: prefers-reduced-motion for parallax / 3D / video, pause controls (WCAG 2.2.2), captions, keyboard

### Takeaway
Any auto-starting motion that lasts more than 5 s and sits alongside other content needs a visible pause/stop/hide control. This includes background loops, parallax/3D canvases and hover-started previews, because "starts automatically" includes starting on scroll, hover or focus. Under `prefers-reduced-motion: reduce`, show posters or static frames instead of autoplay, scrubbing and parallax. Videos that carry information need captions or a text alternative; silent UI demos need a short text description.

### Cited Findings
- WCAG 2.2 SC 2.2.2 Pause, Stop, Hide (Level A): moving, blinking or scrolling content that (1) starts automatically, (2) lasts more than 5 s and (3) is presented in parallel with other content must offer a mechanism to pause, stop or hide it, unless the movement is essential. Moving content explicitly includes videos and animations. - [W3C Understanding SC 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)
- "Starts automatically" includes content triggered by indirect interaction such as focusing, hovering or scrolling an element into view. Such content may also fail SC 2.3.3 Animation from Interactions (AAA). Flashing is governed by 2.3.1/2.3.2. - [W3C Understanding SC 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)
- Background video is not addressed specifically; it falls under the general rule above. - [W3C Understanding SC 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)

### Inferences
- Implementation for this site:
  - `matchMedia('(prefers-reduced-motion: reduce)')`: do not autoplay (remove `autoplay`, keep `poster`, show a play button). Disable scroll-scrubbing and parallax (render one static frame, as effects.js already does). Render the WebGL scene once, or replace it with a pre-rendered image. Listen for `change` events so toggling the OS setting takes effect live.
  - Hero/background loops longer than 5 s: add a visible, keyboard-focusable pause `<button aria-pressed>` with a label. Alternatively, keep loops ≤ 5 s and stop after one pass, or loop only while hovered. A global "pause animations" toggle in the nav, persisted in `localStorage`, can satisfy 2.2.2 for all canvases at once.
  - Hover previews: also trigger on `:focus-visible` of the card link so keyboard users get parity. Pause on `mouseleave`/`blur`. Never require hover to reach content.
  - Project reels with controls: use native `controls` (keyboard-accessible). Add `<track kind="captions">` (WebVTT) if there is narration. For silent UI demos, a visible caption or `aria-describedby` text summarising what the clip shows is the practical equivalent (SC 1.2.1 media alternative; this is my mapping, not cited above).
  - The wheel-to-cycle galleries in `#projects` already release the scroll at the ends. Keep a keyboard path too, such as arrow keys or the existing dots as buttons.
  - Decorative background `<video>`/`<canvas>`: `aria-hidden="true"`, no tab stop.

### Gaps
- I did not fetch the MDN `prefers-reduced-motion` page or WCAG 1.2.x Understanding docs this session. The caption guidance above is standard practice, not re-verified here.
