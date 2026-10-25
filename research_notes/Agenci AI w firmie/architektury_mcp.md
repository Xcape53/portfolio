# Designing AI agent systems: architectures, tools, skills, MCP (state as of Oct 2026)

Note on sources: all pages were fetched on 2026-10-25. Anthropic engineering posts are primary sources. The MCP spec was read at the **current** revision `2026-07-28`. The OpenAI guide PDF (cdn.openai.com) downloaded but was not machine-readable here, so OpenAI-guide details come from secondary summaries and are marked as such.

## 1. Workflows vs autonomous agents, and the core patterns

### Takeaway
Both Anthropic and OpenAI say to start with the simplest thing that works: a single LLM call, then a fixed workflow, and an autonomous agent only for open-ended tasks where the path can't be predicted. The five canonical workflow patterns (chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer) remain the standard vocabulary.

### Cited Findings
- Definitions: workflows are systems where LLMs and tools are "orchestrated through predefined code paths". Agents are systems where LLMs "dynamically direct their own processes and tool usage". Published 2024-12-19. The page itself now notes that much of the tooling it describes has changed since then. - [Anthropic, Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- Rule: find the simplest solution and add complexity only when needed. Agents trade latency and cost for better task performance. Workflows give predictability for well-defined tasks. Agents fit open-ended problems that need model-driven decisions. For many applications, a single optimized LLM call with retrieval and in-context examples is enough. - [Anthropic, Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- When to use each pattern - [Anthropic, Building effective agents](https://www.anthropic.com/engineering/building-effective-agents):
  - **Prompt chaining**: sequential steps, trading latency for accuracy. Use it when a task decomposes cleanly into fixed subtasks. Programmatic "gates" between steps are possible.
  - **Routing**: classify the input, then send it to a specialized follow-up, for example sending easy questions to a smaller model.
  - **Parallelization**: either "sectioning" (independent subtasks) or "voting" (the same task several times) for speed or confidence.
  - **Orchestrator-workers**: a central LLM decomposes the task dynamically and delegates the pieces. Use it when subtasks can't be predicted in advance, for example multi-file code changes.
  - **Evaluator-optimizer**: a generate-then-critique loop. Use it when clear evaluation criteria exist and iteration adds measurable value.
- Frameworks "often create extra layers of abstraction that can obscure the underlying prompts". The advice is to start with LLM APIs directly. Other principles: keep the design simple, make the agent's planning steps visible, and invest in the agent-computer interface (ACI). - [Anthropic, Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- OpenAI's "A practical guide to building agents" (about 32 pages, published 2025-04-17) gives three components: model, tools and instructions. It suggests starting with the most capable model to set a baseline, then swapping in smaller models. The best candidates for agents are workflows where rule-based automation falls short: complex judgment calls (refund approvals), unwieldy rule sets (vendor security reviews), and heavy reliance on unstructured data (insurance claims). - [Maginative summary](https://www.maginative.com/article/how-to-build-ai-agents-a-detailed-practical-guide-from-openai/) (secondary). Original PDF: [OpenAI PDF](https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf)

### Inferences
- Rule of thumb for companies: if the process can be drawn as a flowchart, build a workflow with an LLM in some of the steps. Use an agent only where the number of steps and which tools to call genuinely depend on the data.
- Evaluator-optimizer only pays off when the evaluation criterion is explicit, such as tests, a rubric or a schema.

### Gaps
- The exact wording of the OpenAI guide (its "when to build an agent" criteria and direct quotes) could not be verified from the PDF. Treat those points as second-hand.

## 2. Single agent vs multi-agent / subagents

### Takeaway
Multi-agent setups pay off for broad, parallelizable work such as research. They cost a lot of tokens, roughly 15x a chat, and work poorly when the agents need shared context or the subtasks depend on each other, which covers most coding. The default is one agent. Subagents are worth using mainly as a way to isolate context, returning short summaries.

### Cited Findings
- Anthropic's Research system: a multi-agent setup (Claude Opus 4 as lead, Claude Sonnet 4 as subagents) beat a single Claude Opus 4 agent by **90.2%** on Anthropic's internal research eval. Published 2025-06-13. - [Anthropic, How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)
- Cost: agents use about **4x** more tokens than chat, and multi-agent systems about **15x**. Quote: "multi-agent systems work mainly because they help spend enough tokens to solve the problem". - [same](https://www.anthropic.com/engineering/multi-agent-research-system)
- Poor fits for multi-agent: domains where all agents must share the same context, tasks with many dependencies between agents, and "most coding tasks", which have fewer truly parallel subtasks. LLM agents are not yet good at real-time coordination and delegation. - [same](https://www.anthropic.com/engineering/multi-agent-research-system)
- Observed failure modes: spawning 50 subagents for simple queries, searching endlessly for sources that don't exist, agents distracting each other with too many updates, duplicated work and coverage gaps from vague delegation, a preference for SEO content farms, and overly long search queries. - [same](https://www.anthropic.com/engineering/multi-agent-research-system)
- Lessons: give every subagent an objective, an output format, tool and source guidance, and clear boundaries. Build effort-scaling rules into the prompt (a simple query needs about 1 agent and 3-10 tool calls). Having Claude 4 rewrite a flawed tool description cut task time by 40%. Parallel subagents plus parallel tool calls cut research time by up to 90%. - [same](https://www.anthropic.com/engineering/multi-agent-research-system)
- Evaluation: start with about 20 real queries, because large effect sizes are easy to see. An LLM judge with a rubric (factual accuracy, citations, completeness, source quality, tool efficiency) giving a 0.0-1.0 score plus pass/fail matched human judgment best. Humans still catch edge cases. For stateful agents, evaluate the end state, not the exact path. - [same](https://www.anthropic.com/engineering/multi-agent-research-system)
- Counterpoint (Cognition, 2025-06-12): "Share context, and share full agent traces, not just individual messages" and "Actions carry implicit decisions, and conflicting decisions carry bad results". In their Flappy Bird example, two subagents misread the goal in incompatible ways. They recommend a single-threaded linear agent plus history compression, which they call "hard to get right". - [Cognition, Don't build multi-agents](https://cognition.com/blog/dont-build-multi-agents)
- Context engineering (2025-09-29): "the set of strategies for curating and maintaining the optimal set of tokens". It names "context rot", where recall degrades as context grows. Techniques: compaction, structured note-taking to memory outside the context window, subagents in clean windows that return "a condensed, distilled summary" (often 1,000-2,000 tokens), and just-in-time retrieval by reference (paths, queries, links). - [Anthropic, Effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- OpenAI: maximize a single agent first and move to multi-agent "only when complexity demands it". Two patterns: **manager** (a central orchestrator with agents as tools) and **decentralized** (agents hand off control to each other). - [Maginative summary of OpenAI guide](https://www.maginative.com/article/how-to-build-ai-agents-a-detailed-practical-guide-from-openai/) (secondary)

### Inferences
- Anthropic and Cognition largely agree in practice. Parallel subagents are fine for read-only work (searching, research, review). Writing work that depends on shared decisions, such as editing one codebase, should stay in a single thread or get very precise contracts.
- Before approving a multi-agent design, check whether the task's value justifies roughly 15x the tokens of a chat.

### Gaps
- No independent (non-vendor) benchmark comparing single- and multi-agent setups for typical business processes was found.

## 3. Tool design, human-in-the-loop, memory and context

### Takeaway
Tools are an interface for the model (an "ACI"), and they deserve as much care as a UX. That means few tools that each match a high-value workflow, namespacing, high-signal and token-efficient responses, actionable errors, and unambiguous parameters. Use a human-in-the-loop for high-risk and irreversible actions, and as an escalation after repeated failures.

### Cited Findings
- "Poka-yoke your tools. Change the arguments so that it is harder to make mistakes." For example, requiring absolute file paths fixed the SWE-bench agent's errors. "Put yourself in the model's shoes": include examples, edge cases and input requirements in the tool definition. - [Anthropic, Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- "Writing effective tools for AI agents" (2025-09-11) gives these rules - [Anthropic](https://www.anthropic.com/engineering/writing-tools-for-agents):
  - "More tools don't always lead to better outcomes". Prefer `search_contacts` over `list_contacts`, and merge steps that are usually chained (`schedule_event` both finds availability and books).
  - Namespace tools with prefixes, such as `asana_search` and `jira_search`.
  - Return high-signal information and drop low-level identifiers (UUIDs, MIME types).
  - Offer a `response_format` parameter (`DETAILED`/`CONCISE`). In the Slack example the concise mode used about 1/3 of the tokens.
  - Use pagination, filtering and truncation with sensible defaults. Claude Code limits tool responses to **25,000 tokens** by default.
  - Errors should give specific guidance instead of "opaque error codes or tracebacks", ideally with an example of correct input.
  - Write descriptions as if for "a new hire on your team". Use unambiguous parameter names (`user_id`, not `user`) and strict data models.
- A common failure is "bloated tool sets that cover too much functionality". If a human engineer can't say which tool to use, neither can the agent. - [Anthropic, Effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- The MCP spec separates protocol errors (JSON-RPC: unknown tool, malformed request) from **tool execution errors** (`isError: true`) that carry actionable feedback. Clients "SHOULD provide tool execution errors to language models to enable self-correction". Example: "Invalid departure date: must be in the future. Current date is 08/08/2025." - [MCP spec 2026-07-28, Tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)
- MCP on HITL: "there SHOULD always be a human in the loop with the ability to deny tool invocations". Clients SHOULD show which tools are exposed, signal invocations, ask for confirmation on sensitive operations, and show tool inputs to the user before calling the server. - [MCP spec 2026-07-28, Tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)
- OpenAI's guide: layered guardrails (relevance classifier, safety classifier for jailbreaks and prompt injection, PII filter, moderation, tool safeguards that rate each tool's risk as low/medium/high). It names two triggers for a human: exceeding a failure threshold (for example, repeatedly failing to understand intent) and high-risk actions (sensitive, irreversible or high-stakes, such as cancelling orders, large refunds or payments). - [search summaries of OpenAI guide](https://www.maginative.com/article/how-to-build-ai-agents-a-detailed-practical-guide-from-openai/) (secondary)
- Memory and context: compaction, notes kept outside the context window, and just-in-time retrieval. - [Anthropic, Effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents). In Claude Code, the context window is "the most important resource to manage", and after more than two failed corrections the advice is `/clear` and a better prompt. - [Claude Code best practices](https://code.claude.com/docs/en/best-practices)

### Inferences
- A practical checklist for every company tool: does it match a business action (not a raw API endpoint)? Does it have a prefix, a token limit, a concise mode, an error that suggests a fix, and a risk rating that decides whether a human must confirm?

### Gaps
- No published industry standard for tool risk classification was found. OpenAI only proposes a low/medium/high scale (second-hand).

## 4. Agent Skills and MCP: definitions, permissions, isolation, auth, risks

### Takeaway
Skills are folders of instructions and scripts loaded on demand (progressive disclosure). They are an open standard. MCP is the protocol that connects agents to tools and data. The current revision `2026-07-28` made MCP stateless and changed authorization (OAuth 2.1, resource indicators, issuer validation, deprecated DCR). The main risks are prompt injection through tool descriptions (tool poisoning or "line jumping"), rug pulls, cross-server shadowing, token passthrough and confused deputy, overly broad scopes, and the "lethal trifecta".

### Cited Findings
**Agent Skills**
- Skills are "organized folders of instructions, scripts, and resources that agents can discover and load dynamically". `SKILL.md` has YAML frontmatter with two required fields, `name` and `description`. Progressive disclosure has three levels: (1) metadata in the system prompt, (2) the SKILL.md body read when the skill is relevant, (3) linked files only when needed. Scripts are good for deterministic operations and don't load code into context. Published 2025-10-16. A 2025-12-18 update made Skills "an open standard for cross-platform portability". - [Anthropic, Equipping agents with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- Skill security: install only from trusted sources. Audit less-trusted skills (code, dependencies, resources, any instructions to contact the network). A malicious skill can direct the agent to exfiltrate data. - [same](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- In Claude Code, skills live in `.claude/skills/<name>/SKILL.md`. The `disable-model-invocation: true` flag is for workflows with side effects, so only a human starts them. CLAUDE.md is for rules that always apply. Skills are for knowledge that is "only relevant sometimes". - [Claude Code best practices](https://code.claude.com/docs/en/best-practices)

**MCP: version and architecture (as of Oct 2026)**
- The current protocol version is **2026-07-28**. Versions are `YYYY-MM-DD` dates of the last backwards-incompatible change. - [MCP Versioning](https://modelcontextprotocol.io/specification/versioning)
- Key changes from 2025-11-25: removal of protocol sessions and `Mcp-Session-Id`, and removal of the `initialize` handshake, so MCP is now **stateless**. The version and capabilities travel in each request's `_meta`. Servers MUST implement a new `server/discover`. Tasks moved to an extension. A new Multi Round-Trip Requests pattern replaces server-initiated requests (sampling, elicitation, roots). **Roots, Sampling and Logging are deprecated**, and so is **Dynamic Client Registration** (in favour of Client ID Metadata Documents). Clients MUST validate `iss` (RFC 9207). - [MCP changelog 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/changelog)
- **Outdated warning:** many 2025 tutorials and posts describe sessions, the `initialize` handshake, Sampling and DCR as the norm. As of 2026-07-28 these are removed or deprecated. - [MCP changelog](https://modelcontextprotocol.io/specification/2026-07-28/changelog)
- `tools/list` MUST NOT vary per connection but MAY vary by the authorization on the request (for example, only the tools the token's scopes allow). Clients aggregating several servers SHOULD disambiguate names (a server prefix). "clients MUST consider tool annotations to be untrusted unless they come from trusted servers". - [MCP spec, Tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)
- Security obligations: servers MUST validate inputs, enforce access control, rate-limit and sanitize outputs. Clients SHOULD ask for confirmation, show inputs, validate results, use timeouts and log calls for audit. - [MCP spec, Tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)
- Stateful tools: since there is no session, use explicit handles passed as arguments. "a handle is a name, not a capability". Servers must check authorization on every call. - [MCP spec, Tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)

**MCP: authorization (OAuth)**
- Authorization is optional. HTTP transports SHOULD follow the spec. **stdio SHOULD NOT** use it and should "retrieve credentials from the environment". An MCP server is an OAuth 2.1 resource server. It MUST implement Protected Resource Metadata (RFC 9728). Clients MUST use resource indicators (RFC 8707) with the server's canonical URI and PKCE. Servers MUST check the token's audience. "MCP servers MUST NOT accept or transit any other tokens". Tokens MUST NOT go in the query string. Client registration options, in order: CIMD, pre-registration, DCR (deprecated). - [MCP spec 2026-07-28, Authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization)
- Scopes: least privilege, with step-up authorization via 403 `insufficient_scope` plus a `scope` parameter. Clients take the union of earlier and new scopes. - [same](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization)

**MCP: attacks and mitigations (spec Security Best Practices)** - [MCP Security Best Practices](https://modelcontextprotocol.io/specification/draft/basic/security_best_practices) (draft page that matches the current spec)
- **Confused deputy**: an MCP proxy with a static client ID, DCR and a third-party consent cookie lets an attacker steal the authorization code. Proxies MUST keep per-client consent before forwarding to the third party, use exact redirect_uri matching, use a single-use `state` set only after consent, and use `__Host-` cookies.
- **Token passthrough** is explicitly forbidden. Risks include bypassing rate limits and monitoring, losing the audit trail, and using the server as an exfiltration proxy.
- **SSRF** during OAuth discovery (for example, `169.254.169.254`): use HTTPS, block private ranges, validate redirects, use an egress proxy.
- **State handle hijacking**: holding a handle is not authentication. Bind handles to the user ID from the token.
- **Local server compromise**: one-click configuration MUST show the full command and require consent. Clients SHOULD sandbox with minimal privileges. Local servers should prefer `stdio` or require a token.
- **Authorization URL validation**: allow only http/https, never open URLs through a shell (XSS/RCE risk).
- **Scope minimization**: avoid `*`, `all` and `full-access`. Avoid publishing every scope in `scopes_supported`.

**Research on MCP risks**
- **Tool poisoning** (Invariant Labs, 2025-04-01): hidden instructions in a tool description, invisible to the user. In the example, an `add` tool tells the model to read `~/.cursor/mcp.json` and `~/.ssh/id_rsa`. **Rug pull**: "a malicious server can change the tool description after the client has already approved it". **Shadowing**: one server's description changes how a trusted tool from another server (`send_email`) behaves, without its own tool ever being called. Mitigations: show descriptions in the UI, pin versions and hashes of tools, and enforce cross-server boundaries and dataflow controls. - [Invariant Labs](https://invariantlabs.ai/blog/mcp-security-notification-tool-poisoning-attacks)
- **Line jumping** (Trail of Bits, 2025-04-21): the injection reaches the model at `tools/list`, before any tool is called. It turns HITL into a "human-as-the-rubber-stamp". Demonstrations include ANSI escape codes hiding instructions. Defense: their tool `mcp-context-protector` with trust-on-first-use pinning. - [Trail of Bits, Jumping the line](https://blog.trailofbits.com/2025/04/21/jumping-the-line-how-mcp-servers-can-attack-you-before-you-ever-use-them/); [Trail of Bits, security layer](https://blog.trailofbits.com/2025/07/28/we-built-the-security-layer-mcp-always-needed/) (the second post's details were known only from the search snippet)
- **Lethal trifecta** (Simon Willison, 2025-06-16): access to private data, plus exposure to untrusted content, plus an external communication channel, together lead to exfiltration. MCP makes it easy to assemble all three by accident (example: a GitHub MCP exploit that read public issues, accessed private repos and created a PR). After untrusted input, the agent must be constrained so the input cannot trigger consequential actions. Don't rely on guardrail products claiming "95%". - [Simon Willison](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/)

### Inferences
- Company policy for MCP: an allowlist of servers, pinning or hashing of tool descriptions with alerts on change, OAuth with narrow scopes and audience validation (never a shared PAT), sandboxing for local servers, logging calls, and an architectural break of the trifecta (for example, an agent that reads email gets no egress).
- Skills and MCP complement each other. MCP supplies access to systems, and Skills supply the procedural knowledge for how to use that access. Both are supply-chain artifacts that need review.

### Gaps
- No primary statistics on the scale of real-world (not demo) MCP attacks were found.
- The security best-practices page was read in its `draft` URL version. Its content matches 2026-07-28 (it references stateless MCP), but whether it is identical to the frozen version was not checked.

## 5. Using coding agents (Claude Code, Codex) responsibly

### Takeaway
Explore, plan, implement, commit. Give the agent a check it can run itself (tests, build, screenshot). Keep CLAUDE.md/AGENTS.md short. Manage context aggressively. Use permission allowlists and sandboxing. Have an independent review in a fresh context ("writer/reviewer"). Don't ship what you can't verify.

### Cited Findings
- "Give Claude a check it can run: tests, a build, a screenshot to compare." Without a check, "looks done" is the only signal and you become the verification loop. Ask for evidence (command output, a screenshot) rather than a claim. Deterministic gates include `/goal`, a Stop hook, or a verification subagent, so "the agent doing the work isn't the one grading it". - [Claude Code best practices](https://code.claude.com/docs/en/best-practices)
- Four phases: Explore (plan mode, read-only), Plan (the plan can be edited with `Ctrl+G`), Implement (with tests), Commit/PR. "If you could describe the diff in one sentence, skip the plan." - [same](https://code.claude.com/docs/en/best-practices)
- CLAUDE.md: keep it short. For each line ask "Would removing this cause Claude to make mistakes?" Bloated files make the agent ignore rules. Hooks are deterministic while CLAUDE.md is "advisory". - [same](https://code.claude.com/docs/en/best-practices)
- Permissions: auto mode (a classifier blocks scope escalation, unknown infrastructure and actions driven by hostile content) is the default from v2.1.283. Manual mode, allowlists (`/permissions`) and OS-level sandboxing (`/sandbox`) are also available. For batches, use `--allowedTools` plus `--permission-mode dontAsk`. Test on 2-3 files before a mass run. - [same](https://code.claude.com/docs/en/best-practices)
- Writer/Reviewer: "A fresh context improves code review since Claude won't be biased toward code it just wrote." The reviewer should report only gaps that affect correctness and requirements, because chasing every finding leads to over-engineering. - [same](https://code.claude.com/docs/en/best-practices)
- Failure patterns: the "kitchen sink session", "correcting over and over", an over-specified CLAUDE.md, the "trust-then-verify gap" ("If you can't verify it, don't ship it"), and "infinite exploration". Checkpoints don't cover changes made through Bash: "This isn't a replacement for git." - [same](https://code.claude.com/docs/en/best-practices)
- Also see Anthropic's original tool-design point that "good agent-computer interfaces" matter as much as HCI. - [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)

### Inferences
- Minimum company process for coding agents: a task with acceptance criteria, then plan approval for multi-file changes, then small diffs on a branch or worktree, then CI tests as the gate, then review by a human or an agent in a fresh context, and only then a merge. Never auto-push to production.

### Gaps
- An official OpenAI Codex best-practices guide (AGENTS.md, sandbox and approval modes) was not fetched in this session for lack of time. Verify at developers.openai.com/codex before citing anything Codex-specific.
- The Claude Code page has no publication date (it is living documentation, read 2026-10-25). Version numbers such as v2.1.283 change quickly.
