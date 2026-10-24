# Agent skills / plugins for web animation and motion design (state as of 2026-10-24)

Method note: repo existence, stars, forks and creation dates were checked via the GitHub repository search API on 2026-10-24 (stars rounded). GitHub's `updated_at` field changes on any activity (including new stars), so it shows only that a repo is "live", not when the last commit landed. Install counts quoted from skills.sh mirrors (Skillselion, etc.) disagree between snapshots and should be read as rough figures. Context: target is a static plain HTML/CSS/JS portfolio (no build step, vanilla JS, Lenis already present via the template's `js/animation.js`, canvas parallax effects, planned 3D models and project videos). The user already has `juliobsz/skills` (/awwwards, /jury) and its recommended `wheresryan22/anatomy`.

## Is there an official GSAP / GreenSock agent skill or MCP? Official Remotion, Three.js/pmndrs, Motion.dev, Rive, Lottie, Lenis skills?

### Takeaway
There are first-party skills for GSAP (greensock/gsap-skills, about 17k stars, the strongest pick for this site), Remotion (remotion-dev/skills, about 5.6k stars), Motion (motiondivision/ai-kit: a free `/motion` skill plus a hosted MCP, with the extras behind the paid Motion+ tier), Rive (rive-app/skills, new and thin) and HeyGen HyperFrames (HTML to MP4, about 71k stars). I found no official skill from Three.js (mrdoob) or pmndrs (R3F), and none from Lenis/darkroom. For Three.js, CloudAI-X/threejs-skills (about 3.7k stars) is the de facto community standard. GreenSock does not appear to ship an MCP server; their offering is the skills.

### Cited Findings
**GSAP (official)**
- `greensock/gsap-skills` is described as "Official AI skills for GSAP". It was created 2026-03-04 and has about 17,051 stars and 1,035 forks - [GitHub search API / repo](https://github.com/greensock/gsap-skills)
- It has 8 skills: gsap-core, gsap-timeline, gsap-scrolltrigger (pinning, scrub, refresh/cleanup), gsap-plugins (ScrollToPlugin, ScrollSmoother, Flip, Draggable, Inertia, Observer, SplitText, ScrambleText, SVG/physics plugins, CustomEase, GSDevTools), gsap-utils, gsap-react (useGSAP), gsap-performance and gsap-frameworks (Vue/Svelte). The README says it covers vanilla JS, and `examples/` holds vanilla and React demos. It is MIT licensed - [greensock/gsap-skills README](https://github.com/greensock/gsap-skills)
- Install with `npx skills add https://github.com/greensock/gsap-skills`. In Claude Code use `/plugin marketplace add greensock/gsap-skills`. In Cursor it can be added as a Remote Rule. Manual install is copying `skills/` to `~/.claude/skills/` - [README](https://github.com/greensock/gsap-skills)
- The README mentions no MCP server and says nothing about Lenis. Smooth scroll is covered only through ScrollSmoother in gsap-plugins - [README](https://github.com/greensock/gsap-skills)
- The README states that GSAP, including the former Club plugins (SplitText, MorphSVG and others), is now 100% free, commercial use included - [jsDelivr mirror of README](https://cdn.jsdelivr.net/gh/greensock/gsap-skills@main/README.md)
- One aggregator puts the gsap-scrolltrigger skill at about 37.9k installs on skills.sh - [Skillselion listing](https://skillselion.com/skills/greensock/gsap-skills/gsap-scrolltrigger) (aggregator, approximate)

**Remotion (official)**
- `remotion-dev/skills` ("Agent Skills") was created 2026-01-19 and has about 5,617 stars and 626 forks. A separate `remotion-dev/claude-code-plugin` ("Remotion Agent Skills for Claude Code") was created 2026-07-16 and has about 62 stars - [GitHub search API](https://github.com/remotion-dev/skills), [plugin repo](https://github.com/remotion-dev/claude-code-plugin)
- It has 12 skills: /remotion-best-practices (umbrella), /remotion-create, /remotion-markup (compositions, animations, layout, typography, media, effects, audio, fonts, timing), /remotion-studio, /remotion-render, /remotion-maps, /remotion-captions, /remotion-saas, /remotion-interactivity, /remotion-docs, /remotion-upgrade and /remotion-multimedia (Mediabunny) - [remotion-dev/skills README](https://github.com/remotion-dev/skills)
- The official docs give the install as `npx skills add remotion-dev/skills`. Skills go into `.agents/skills`, and Claude Code reaches them through a `.claude/skills` symlink. `npx remotion skills add` and `npx remotion skills update` also work - [remotion.dev docs: AI skills](https://www.remotion.dev/docs/ai/skills), [remotion.dev CLI skills](https://www.remotion.dev/docs/cli/skills)
- A third-party guide says the skills hold conventions only and do not replace the Remotion project or renderer. It also says Alpine Linux and NixOS are unsupported - [mer.vin guide](https://mer.vin/2026/05/remotion-agent-skills-install-remotion-dev-skills-for-claude-code-and-cursor/) (secondary)
- Remotion is React-based. Its company license requires a paid license for companies above a size threshold; this is from background knowledge and was not re-verified here, so it is listed under Gaps.

**Motion (motion.dev, official)**
- The Motion AI Kit installs with `npx motion-ai` (add `--plus` for the Motion+ MCP). It has four parts: a `/motion` skill (MIT, source at github.com/motiondivision/ai-kit), a free hosted `motion` MCP for docs and example search, a paid Motion+ MCP, and a transition editor (MCP Apps / VS Code extension). Motion+ adds CSS spring generation, MotionScore audits, the transition editor and premium source. Supported agents are Claude Code, Cursor, Amp, OpenCode, Gemini CLI and Copilot - [motion.dev AI Kit install](https://motion.dev/docs/ai-kit-install)
- An earlier snapshot of the docs listed the skills as /motion, /motion-audit, /css-spring and /see-transition, installed with a dashboard token. The current page has moved to hosted MCP plus sign-in, so the set of skills has changed over time - [motion.dev AI Kit install (search snippet)](https://motion.dev/docs/ai-kit-install)
- LLM docs are served as MCP Resources (preferred) or as Markdown at llms.motion.dev - [motion.dev AI/LLM documentation](https://motion.dev/docs/ai-llm-documentation)
- `motiondivision/ai-kit` (described as "A Cursor plugin for Motion") was created 2026-07-27 and has about 60 stars - [GitHub](https://github.com/motiondivision/ai-kit)
- Unrelated namesakes to avoid confusing with it: motion.so (video) and Motion (task app) both have their own MCP servers - [docs.motion.so](https://docs.motion.so/guides/mcp)

**Three.js / React Three Fiber (no official skill found, so community only)**
- No `skills` repo turned up under pmndrs (empty search result for `user:pmndrs skills`) - [GitHub search](https://github.com/pmndrs)
- `CloudAI-X/threejs-skills` was created 2026-01-19 and has about 3,709 stars, 429 forks and 0 open issues. It has 13 skills (fundamentals, geometry, materials, lighting, textures, animation, loaders [glTF + Draco/meshopt/KTX2], shaders [ShaderMaterial, TSL], postprocessing, interaction, performance, react-three-fiber [R3F 9.8 / drei 10.7], asset-pipeline [gltf-transform 4.5]). It targets three r186 and is MIT licensed. Install with `npx skills add cloudai-x/threejs-skills`. No skill covers scroll or parallax - [CloudAI-X/threejs-skills](https://github.com/CloudAI-X/threejs-skills)
- `scottstts/Threejs-Awesome-Graphics-Agent-Skills` (about 931 stars, created 2026-06-19) focuses on "awesome graphics for scenes and games" - [GitHub](https://github.com/scottstts/Threejs-Awesome-Graphics-Agent-Skills)
- `majidmanzarpour/threejs-game-skills` (about 2,579 stars) is game-focused, so it has low relevance for a portfolio - [GitHub](https://github.com/majidmanzarpour/threejs-game-skills)
- `viettranx/3dviz-pro-max` (about 888 stars, created 2026-09-10) is a Claude Code and Codex plugin that claims "223 recipes, 22 proved kits", covering Three.js and Blender scenes with glTF - [GitHub](https://github.com/viettranx/3dviz-pro-max)
- `emalorenzo/three-agent-skills` (about 64 stars) holds `r3f-best-practices` - [GitHub](https://github.com/emalorenzo/three-agent-skills)
- `Impertio-Studio/Three.js-Claude-Skill-Package` (about 23 stars; also linked as OpenAEC-Foundation) has 24 skills covering r160+, R3F, Drei, WebGPU and physics. It is installed by cloning into `.claude/skills` - [GitHub](https://github.com/Impertio-Studio/Three.js-Claude-Skill-Package), [OpenAEC link](https://github.com/OpenAEC-Foundation/Three.js-Claude-Skill-Package)
- Niche but on-topic: `JudyZZ/threejs-parallax-skill` (about 24 stars) builds a "2.5D parallax effect using Three.js with layered transparent PNG assets". `ahmettasdemirusa/threejs-product-skills` (about 1 star) covers product viewer, glTF optimisation and `<model-viewer>` - [GitHub](https://github.com/JudyZZ/threejs-parallax-skill), [GitHub](https://github.com/ahmettasdemirusa/threejs-product-skills)

**Rive (official, thin)**
- `rive-app/skills` was created 2026-10-15 and had 0 stars at check time. It contains one discovery skill, `rive`, which tells the agent when Rive fits and then points it to `rive docs` and the generated `AGENTS.md`. It has no runtime or state-machine detail by design. Install in Claude Code with `/plugin marketplace add rive-app/skills` then `/plugin install rive@rive`; for other agents, `npx skills add rive-app/skills` - [rive-app/skills](https://github.com/rive-app/skills)

**Lottie (official, unclear)**
- LottieFiles has `LottieFiles/skills` (created 2026-04-17, 0 stars, no description) and `LottieFiles/creator-agent-plugin` (about 2 stars, created 2026-09-05; topics include claude-code-plugin, mcp and lottie; described as "Distribution metadata for the LottieFiles Creator agent plugin"). Neither is clearly a web-runtime animation skill - [LottieFiles/skills](https://github.com/LottieFiles/skills), [LottieFiles/creator-agent-plugin](https://github.com/LottieFiles/creator-agent-plugin)

**Lenis (no official skill found)**
- Darkroom Engineering, the authors of Lenis, publish `darkroomengineering/cc-settings` ("Claude Code configuration - agents, skills, hooks & settings for Darkroom Engineering", about 52 stars). It is their internal config, not a packaged Lenis skill - [GitHub](https://github.com/darkroomengineering/cc-settings)
- Lenis is covered as part of broader skills: `juliobsz/skills` (/awwwards uses GSAP + Lenis + OGL) - [juliobsz/skills README](https://github.com/juliobsz/skills). `yojahny55/cinematic-scroll-kit` (about 4 stars, topics gsap and lenis) - [GitHub](https://github.com/yojahny55/cinematic-scroll-kit). `WJLGraph/haute-gsap-skills` (0 stars, created 2026-10-14, "GSAP3/Lenis recipes") - [GitHub](https://github.com/WJLGraph/haute-gsap-skills)
- `freshtechbro/claudedesignskills` covers locomotive-scroll and barba-js but does not mention Lenis - [README](https://github.com/freshtechbro/claudedesignskills)

### Inferences
- For this site (vanilla JS, Lenis already loaded, canvas effects), the GSAP skill is the highest-value install. Its vanilla JS and ScrollTrigger coverage fits directly, it is first-party and it is heavily adopted. One thing to watch: the skill knows ScrollSmoother but not Lenis, so the agent should be told that Lenis already handles smooth scroll (sync it with ScrollTrigger rather than adding ScrollSmoother).
- The Motion AI Kit's free tier is useful mainly when the site moves to React. For a jQuery/vanilla template it is lower priority than GSAP.
- For 3D models in a static page, CloudAI-X/threejs-skills is the safest bet (MIT, large adoption, glTF loaders plus the asset pipeline for compressing models). Its R3F skill is irrelevant unless the site moves to React.

### Gaps
- Could not confirm any official GreenSock MCP server (none mentioned in the README; no search hit).
- Could not confirm the current exact skill list inside motiondivision/ai-kit. The docs page changed between snapshots.
- Remotion's company-license terms were not re-verified in this session.
- No official skill was found from three.js/mrdoob, pmndrs, Lenis/darkroom or Spline.
- LottieFiles' skill repos have no README description visible in search, so their contents are unverified.

## What do skill directories list for animation, and which are maintained/high quality vs thin wrappers?

### Takeaway
The ecosystem is centred on the `npx skills` CLI (vercel-labs/skills, about 36k stars), which feeds the skills.sh leaderboard. On skills.sh the most-installed animation skills are HeyGen's HyperFrames-related entries (gsap, css-animations, animejs, waapi), then GreenSock's own skills. Higher quality: greensock/gsap-skills, remotion-dev/skills, CloudAI-X/threejs-skills, heygen-com/hyperframes, juliobsz/skills, wheresryan22/anatomy. Broad multi-library packs such as freshtechbro/claudedesignskills are older (late 2025) and wider than they are deep. Many very new single-author repos with 0-5 stars are effectively untested.

### Cited Findings
- `vercel-labs/skills` ("The open agent skills tool - npx skills", about 36,396 stars, created 2026-01-14) is the CLI behind `npx skills add owner/repo`. `vercel-labs/agent-skills` (about 32,954 stars) is Vercel's own skill collection - [vercel-labs/skills](https://github.com/vercel-labs/skills), [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills)
- `anthropics/skills` ("Public repository for Agent Skills", about 183k stars, created 2025-09-22) is Anthropic's reference repo - [GitHub](https://github.com/anthropics/skills). Background knowledge, not re-verified this session: it includes design-adjacent skills such as frontend-design, canvas-design, algorithmic-art and web-artifacts-builder, but no GSAP/Three.js-specific skill.
- `juliobsz/skills` has about 931 stars and was created 2026-10-12. /awwwards takes a one-line brief through concept, art direction, build, a Playwright QA loop and ship (deploy only after confirmation). /jury scores sites like an Awwwards jury, using screenshots and a blind critic subagent. The default stack is Next.js/Astro + GSAP + Lenis + OGL (no Three.js). It recommends wheresryan22/anatomy. Install with `npx skills add juliobsz/skills -g` or `/plugin install awwwards --marketplace juliobsz/skills` - [juliobsz/skills README](https://github.com/juliobsz/skills)
- `wheresryan22/anatomy` has about 20,105 stars and was created 2026-10-08. It is "an agent skill for creating detailed, interactive isometric illustrations of real-world machines and complex systems", producing SVG with optional WebGL shaders and 3D effects. Companion repos are `anatomy-figures` (52 figures as React or custom elements) and `anatomy-community` - [GitHub](https://github.com/wheresryan22/anatomy), [anatomy-figures](https://github.com/wheresryan22/anatomy-figures)
- `freshtechbro/claudedesignskills` (about 1,123 stars, created 2025-10-25) is a plugin marketplace with 22 skills and 27 plugins. It includes gsap-scrolltrigger, threejs-webgl, react-three-fiber, motion-framer, babylonjs, aframe-webxr, lightweight-3d-effects, pixijs, locomotive-scroll, barba-js, animejs, lottie-animations, spline-interactive, rive-interactive, blender-web-pipeline and modern-web-design. Install with `/plugin marketplace add freshtechbro/claudedesignskills` then `/plugin install <name>`. The latest dated README entries are from 2025-10/11 - [README](https://github.com/freshtechbro/claudedesignskills)
- `feitangyuan/motion-web` (about 787 stars, created 2026-09-08, only 3 commits) is a "motion-first creative websites" skill on vanilla Canvas 2D, WebGL2, DOM/SVG and CSS. It ships no build tools and no CDNs, has 7 single-file HTML cases, spring-damper physics references and Playwright "oracle" verification scripts. Install by `git clone ... ~/.claude/skills/motion-web` - [GitHub](https://github.com/feitangyuan/motion-web)
- Skillselion (a skills.sh mirror) gives conflicting snapshots. One (June 2026) puts gsap by heygen-com first at about 92k installs. A later one (August 2026) has css-animations by heygen-com at about 72k, animejs at about 70k, waapi at about 69k and remotion-to-hyperframes at about 74k. vercel-react-view-transitions is listed at about 59k in one and about 160k in the other. Framer Motion skills are much smaller (about 1.4k-11k) - [Skillselion guide](https://skillselion.com/guides/best-web-animation-skills-for-claude-code), [Skillselion animation guide](https://skillselion.com/guides/web-animation-framer-motion-gsap-guide) (aggregator; figures inconsistent)
- The only CSS scroll-driven-animations skill found is OrchestKit's `scroll-driven-animations` (ScrollTimeline/ViewTimeline, `view()`, `scroll()`, `animation-range`, progressive enhancement). It has about 34 installs - [Playbooks listing](https://playbooks.com/skills/yonatangross/orchestkit/scroll-driven-animations), [Skillselion](https://skillselion.com/skills/yonatangross/orchestkit/scroll-driven-animations)
- Other small scroll skills: `harshavarma02/zero-jank-scroll-agent-skill` (1 star; IntersectionObserver, CSS scroll timelines, Motion or ScrollTrigger, parallax, accessibility) - [GitHub](https://github.com/harshavarma02/zero-jank-scroll-agent-skill); `dylantarre/animation-principles` (scroll-animations, framer-motion) - [Skillselion](https://skillselion.com/skills/dylantarre/animation-principles/scroll-animations)
- Third-party directories seen in this research: skills.sh, Skillselion, vibeindex.ai, tessl.io (which publishes reviews and evals of gsap-skills), claudemarketplaces.com, playbooks.com, allclaw.org, open-design.ai - [tessl gsap-plugins review](https://tessl.io/registry/skills/github/greensock/gsap-skills/gsap-plugins/review), [claudemarketplaces](https://claudemarketplaces.com/skills/freshtechbro/claudedesignskills/react-three-fiber)

### Inferences
- Ranked for this portfolio (static, vanilla JS, parallax, 3D models, project videos):
  1. **greensock/gsap-skills**: official, maintained, vanilla-friendly, MIT. Install.
  2. **CloudAI-X/threejs-skills**: best community Three.js pack (glTF, shaders, performance). Install when the 3D models are added.
  3. **heygen-com/hyperframes**: HTML/GSAP to MP4, the most natural route to project reels from this HTML/GSAP stack (see the video section).
  4. **remotion-dev/skills**: official and high quality, but React-based. Use it as a separate reel project, not inside the site.
  5. **juliobsz/skills + wheresryan22/anatomy**: already installed. /jury is useful as a QA gate after changes. Anatomy could illustrate the electronics/FPGA projects in the site's "how it works" style.
  6. **feitangyuan/motion-web**: closest in spirit to the existing vanilla canvas effects (no build, single-file, physics). Worth reading as reference even if not installed. Low commit count.
  7. **motiondivision/ai-kit**: official, but only valuable with React or the Motion vanilla API. The free MCP is good for docs lookups.
  8. **freshtechbro/claudedesignskills**: broad coverage (Lottie, Rive, Spline, Locomotive, Barba), but older and generalist. Cherry-pick individual plugins rather than taking bundles.
  9. **rive-app/skills, LottieFiles**: install only if those formats are actually used. Both are thin.
  10. **OrchestKit scroll-driven-animations**: the only native-CSS scroll-timeline skill. Low adoption, but CSS scroll-driven animation is a good fit for lightweight parallax on a static site, so it is worth reviewing as a reference.
- Thin-wrapper signals: 0-5 stars, created within the last few weeks, a single README with marketing claims ("Awwwards-grade", "AAA"), and few commits. haute-gsap-skills, the threejs-skill-package clones and cinematic-scroll-kit fall into this group.

### Gaps
- The live skills.sh leaderboard could not be fetched directly. Install counts come from mirrors with inconsistent snapshots.
- No quality evaluation (reading every SKILL.md) was done for the community Three.js packs beyond their READMEs.

## Any skill for producing videos of websites/screens (Remotion, Playwright recording) suitable for portfolio project reels?

### Takeaway
Yes, there are two strong first-party options. HeyGen HyperFrames is an Apache-2.0 "write HTML, render video" framework with agent skills, GSAP/CSS/Lottie/Three.js adapters and a `/remotion-to-hyperframes` skill. It is the best fit for an HTML/GSAP site. Remotion's official skills are the React-based alternative. For literally recording the live site, the only dedicated skill found is a brand-new, unproven Playwright screen-recording skill. A plain Playwright `recordVideo` script is the reliable fallback, and Playwright is already on the user's machine.

### Cited Findings
- `heygen-com/hyperframes` ("Write HTML. Render video. Built for agents.") has about 71,428 stars and was created 2026-03-10. It is Apache 2.0 and turns HTML, CSS, media and seekable animations into deterministic MP4. GSAP timelines are seeked frame by frame in headless Chrome and then encoded with FFmpeg. GSAP, CSS animations, Anime.js, WAAPI, Lottie and Three.js are supported adapters. It requires Node 22+ and FFmpeg - [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes)
- HyperFrames skills: /hyperframes, /hyperframes-cli, /hyperframes-registry and /media-use as the core set, plus /figma, /slideshow and /remotion-to-hyperframes on demand. Install with `npx skills add heygen-com/hyperframes` (`--all` for everything, `--skill <name>` for one) or as a Claude Code plugin with `claude plugin marketplace add heygen-com/hyperframes` then `claude plugin install hyperframes@hyperframes`. Scaffold with `npx hyperframes init my-video`, then `npx hyperframes render` - [README](https://github.com/heygen-com/hyperframes)
- HeyGen also publishes `heygen-com/hyperframes-community-skills` (about 228 stars) and `heygen-com/website-to-hyperframes-demo` ("Website to HyperFrames skill demo video", about 73 stars), which implies a website-to-video workflow exists - [GitHub](https://github.com/heygen-com/hyperframes-community-skills), [GitHub](https://github.com/heygen-com/website-to-hyperframes-demo)
- The README describes building compositions rather than capturing arbitrary live websites, so existing animations need adapting to its composition structure - [README](https://github.com/heygen-com/hyperframes)
- Remotion (see section 1) provides /remotion-create, /remotion-render, /remotion-captions and /remotion-multimedia for programmatic video in React - [remotion-dev/skills](https://github.com/remotion-dev/skills)
- `abozaralizadeh/ClaudeScreenRecordingSkill` ("Record website demo videos with a smooth visible cursor", Playwright, created 2026-10-14) had 0 stars at check time - [GitHub](https://github.com/abozaralizadeh/ClaudeScreenRecordingSkill)
- `juliobsz/skills` already ships `shoot.mjs`/`serve.mjs` Playwright helpers. They are for screenshots, not video - [README](https://github.com/juliobsz/skills)
- `lanzhu1993/Logo-Animations-Skills` (1 star) turns logos into GIF/MP4 with FFmpeg, for 31 offline effects - [GitHub](https://github.com/lanzhu1993/Logo-Animations-Skills)

### Inferences
- A suggested reel pipeline for this portfolio: (a) record each project's real UI with a short Playwright `recordVideo` script, or use the existing screenshots in `images/projects/`; (b) assemble titled reels in HyperFrames (HTML/GSAP, the same language as the site) or Remotion; (c) export short muted MP4/WebM loops and embed them as `<video autoplay muted loop playsinline>` in the `.tf__project_hero` media columns.
- HyperFrames' popularity signals momentum but also heavy marketing. It is an HeyGen product; check its telemetry and licence terms before use.

### Gaps
- I did not confirm whether a dedicated `website-to-hyperframes` skill is currently shipped, as opposed to the demo repo only.
- The ClaudeScreenRecordingSkill contents were not reviewed; with 0 stars and created days earlier, it is unvetted.

## Security caveat (applies to every entry)

### Takeaway
Skills are instructions plus scripts that the agent executes with the user's permissions. Every repo above should be read (SKILL.md and any scripts) before installing, and copy-installs (`--copy`) are preferable to symlinks into auto-updated remotes.

### Cited Findings
- juliobsz/skills itself warns that skills "are instructions the agent follows, and they run builds and scripts on your machine. Read each SKILL.md before installing". It also notes that the skills CLI collects anonymous telemetry, which `DISABLE_TELEMETRY=1` or `DO_NOT_TRACK=1` turns off - [juliobsz/skills README](https://github.com/juliobsz/skills)
- Lookalike repos appear quickly around popular skills. For example `mateocouffignal26-dotcom/npx-skills-add-wheresryan22-anatomy` is a repo whose name mimics the install command for anatomy, and there are several third-party "anatomy" ports and mirrors (wenxingdi/anatomy, plgonzalezrx8/anatomy-codex and others) - [GitHub search](https://github.com/mateocouffignal26-dotcom/npx-skills-add-wheresryan22-anatomy), [wenxingdi/anatomy](https://github.com/wenxingdi/anatomy)
- Aggregator sites repackage skills from many authors (for example `mxyhi/ok-skills` re-hosts gsap-skills) - [aitoolly listing](https://aitoolly.com/ja/skills/mxyhi-ok-skills-gsap-skills-gsap-scrolltrigger)

### Inferences
- Install from the canonical owner (greensock, remotion-dev, heygen-com, CloudAI-X, motiondivision, rive-app), never from mirrors or name-squatting repos.
- Prefer project-scoped installs for this repo. Everything committed to this repo is auto-deployed to GitHub Pages, so `.claude/` / `.agents/` skill folders should not be committed unintentionally.

### Gaps
- The contents of the lookalike repo were not inspected, so it is flagged as suspicious by name only and not confirmed malicious.
