# Changelog

All notable changes to the `my-architect` plugin are documented here.

This project follows [Semantic Versioning](https://semver.org/).

## [1.18.0] — 2026-08-20

### Added
- **SessionStart-хук `code-graph-context.sh`** — граф кода перестаёт быть триггером, который надо вспомнить, и становится фактом в контексте. Если в корне есть `graphify-out/graph.json`, сессия стартует уже зная путь, дату сборки, `fresh`/`STALE` относительно HEAD и правило композиции; графа нет — хук молчит (нулевая цена для не-graphified проектов). Причина бага: описание скила может сказать «используй меня, когда есть `graphify-out/`», но модель это условие проверить не может — в контекст на момент решения загружены только `description` скилов, а чтобы сходить на диск, надо уже решить сходить. Замкнутый круг; вся graph-дисциплина 1.15–1.16.1 лежала в lazy-reference и не доезжала до точки принятия решения. Хук едет в поставке — после `/plugin update` работает без правок пользовательского конфига.
- **Правило композиции** (`code-graph.md`, новый раздел «Композиция: граф заменяет Discovery, а не весь прогон») — порядок `graph → verify регионами → Workflow/агенты` не был записан нигде, из-за чего ultracode («всегда workflow») и graph-first читались как конкурирующие, а не как последовательные. Явно зафиксировано, что граф закрывает ориентацию, но НЕ даёт поведенческих фактов, и честная экономия — порядка половины Discovery, не всего прогона.

### Changed
- **`recursive-context`: Step 0 — code graph, перед размер-гейтом.** Проверка `graphify-out/graph.json` поднята из lazy-reference в тело скила: один `Bash`-вызов до `grep`/`Read`/`Workflow`/fan-out.
- **Триггеры `recursive-context` расширены формами задач, которые выглядят «не про кодовую базу»** (1018/1024): оценка трудозатрат, планирование, ревью, «где реализовано X», онбординг-доки, написание `CLAUDE.md` — включая `/init`. Наблюдавшийся отказ: агент классифицировал собственную задачу по жанру формулировки, а не по наличию индекса на диске, и разослал шесть агентов грепать структуру уже проиндексированного репозитория. Решение принимается по наличию файла, а не по жанру.
- **`myarchitect` → «Composes with»** получил явный пункт про граф перед любой фазой Discovery (раньше слова `graphify`/`graph.json` не встречались ни в одном `SKILL.md` — только в референсе).
- Red flags `recursive-context`: «это же не вопрос о кодовой базе, а оценка / план / ревью / доки» и «разослал агентов грепать структуру, не проверив `graphify-out/graph.json`».

### Не сделано (осознанно, к следующему проходу)
- `trigger-evals.json` расширен с 13 до 21 кейса (новые: оценка трудозатрат ×2, написание CLAUDE.md, `/init`, «где реализовано X», планирование раскатки + два near-miss отрицательных — docstring по готовому телу, bump версии в package.json). **Судьи по ним не прогонялись** — цифр покрытия для 1.18.0 нет, в отличие от 1.16.0/1.17.0. Прогнать до релиза.
- Хук проверен вручную по трём веткам (граф+git STALE, граф без git, графа нет → тишина, exit 0); end-to-end в живой сессии Claude Code — после `/plugin update`.

## [1.17.0] — 2026-07-06

### Added
- **Skill `design`** (feature-013) — architecture-aware дизайн-сессии: форк superpowers:brainstorming v5.1.0 (MIT-атрибуция). Диалоговое ядро сохранено (HARD-GATE, один вопрос за раз, 2–3 подхода, self-review); переопределены explore (get_project_context + code-graph + recursive-context), место спеки (док на узле, не docs/superpowers/specs/) и терминал (Workflow Z → writing-plans; план = файл-канон + зеркальный док с Source). Sketch mode отдаёт оцениваемый вариант в гейт Workflow I; эпики презентуются Event Storming канвасом до sequence.ok. Команда `/my-architect:design`; superpowers отключать не нужно (CON-008) — в проектах без my_architect продолжает работать оригинальный brainstorming.
- **Оверлей в myarchitect 1.15** — таблица переопределений трёх шагов оригинального brainstorming (на случай его срабатывания) + мосты: systematic-debugging Phase 4.5 → Workflow I/B; finishing-a-development-branch → ship=sync. Workflow I шаг 2 роутит в design (фолбэк — оригинал).
- Evals `skills/design/evals/design-evals.json`: RED→GREEN — триггеры 8/8 (3 судьи единогласно, 24/24 голосов), behavior dry-runs 4/4 (14/14 assertions), кросс-регрессия myarchitect 29/29 без дрейфа. README: секция design-sessions + 3-строчный CLAUDE.md-шаблон + совет skillListingBudgetFraction.

## [1.16.1] — 2026-07-03

### Added
- **Region-reads на verify** (code-graph, правило честности): кандидат графа приходит с `путь:строка` — verify читает регион ±30 строк (offset/limit или `sed -n`), не файл целиком; это главный конвертер пользы графа в экономию токенов. Assertion в behavior-кейсе 7; живьём наблюдалось в A/B-эксперименте.
- **A/B-замер «граф vs без графа»** на NestJS (2125 файлов, идентичные клоны, 3 класса вопросов, Sonnet): impact — паритет токенов (A: −16% вызовов); понимание подсистемы — **A дешевле в ~3.5×** (75.9k соло против ~262k у B с вложенным 5-агентным fan-out, вложенные 205.8k измерены из транскриптов); полный аудит — паритет (fan-out у обоих). Вывод в RESULTS.md: экономия графа реальна и селективна по классу задач; наивные сравнения недооценивают плечо со скрытой оркестрацией.

## [1.16.0] — 2026-07-03

### Added (закрытие пробелов покрытия по аудиту «до чего агент не додумается»)
- **Impact-вопросы по символам — самостоятельный вход**: «кто зовёт X», «что сломается при смене сигнатуры» (RU/EN) добавлены в description recursive-context (755/1024) и recipe map; в карте запросов — `graphify affected "X"` → verify по задетым файлам. Раньше такой вопрос вне трекаемой задачи не имел ни одного роутинга к графу. Триггеры: 30/30 голосов, дрейфа нет.
- **GRAPH_REPORT.md первым**: repo-audit шаг 0 и карта запросов велят читать готовую сводку (god-ноды, communities, surprising connections) до одиночных запросов — она уже посчитана. Behavior-кейс 10 (3/3).
- **Хук против вечного STALE**: если граф протух и git-хук не установлен — агент один раз предлагает `graphify hook install` (одним оффером с `--update`, без спама). Assertion в кейсе 8 (5/5).

## [1.15.0] — 2026-07-03

### Added
- **Bootstrap по согласию** (recursive-context/code-graph): графа нет + big-corpus задача по коду → агент один раз за сессию предлагает владельцу поставить и собрать граф (честная цена/выгода: `uv tool install graphifyy` (фолбэк pipx), локальная code-only сборка за секунды, git-хук, выбор коммитить/gitignore для `graphify-out/` — команде README рекомендует коммитить); на «да» — сам ставит, собирает, хук, и продолжает graph-first; на «нет» — базовые рецепты без повторных предложений. Молчаливые установки по-прежнему запрещены — ask-first доведён до действия. Behavior-кейс 9 (5/5 двумя независимыми грейдер-прогонами).

### Fixed
- **Роутинг в code-graph.md стал безусловным** для big-corpus задач по коду (recipe map + шаги 0 repo-audit/requirements-mining): раньше все указатели вели в рецепт только при НАЛИЧИИ графа — bootstrap-ветка была недостижима (Important, найдено ревью). Workflow D осознанно остаётся presence-gated (одиночная задача ≠ big-corpus).
- Оффер выровнен с README Graphify: uv-first; команде — коммитить `graphify-out/` (merge-driver из `hook install`), в .gitignore только `cost.json`/`cache/`; соло-вариант — весь каталог.

## [1.14.0] — 2026-07-03

### Added
- **Рецепт `code-graph`** в скиле recursive-context (`references/code-graph.md`) — персистентный локальный граф кода (Graphify-класс, `graphify-out/graph.json`) как источник КАНДИДАТОВ для repo-audit / requirements-mining / Workflow D: presence+freshness-check (mtime vs последний коммит, GNU-first stat-фолбэк — Linux-баг пойман ревью в docker), карта запросов (`/graphify query|path|explain`, MCP `query_graph`/`get_neighbors`/`shortest_path` — имена сверены с README), правило честности «граф = навигация и кандидаты, факт = только verify по живому файлу», фолбэк без деградации, запрет молчаливой установки инструмента.
- Evals: behavior-кейсы 7 (fresh → graph-first + verify) и 8 (stale → предупредить, предложить `--update`, не доверять), RED→GREEN 2/2 (8/8 assertions). LIVE на реальном репо: граф 2655 нод за секунды, дисциплина соблюдена включая незапланированный stale-кейс (граф старше HEAD на 16с — обнаружено и обработано), 10 verified-фактов; стоимость честно: навигация — да, экономия на needle-вопросе — нет (амортизация = гипотеза до статистики).

### Changed
- **myarchitect 1.14** — Workflow D шаг 1: при свежем локальном графе кода связи символов сперва у графа, факты — после verify по файлам (правила в recursive-context/references/code-graph.md).

## [1.13.0] — 2026-07-03

### Added
- **Skill `recursive-context`** — дисциплина Recursive Language Models (arXiv:2512.24601) нативными средствами Claude Code для oversized-входов: размер-гейт ДО чтения (>256 КБ / >5000 строк; пробы ≤50 строк), index-don't-ingest (нарезка кодом в scratchpad, coarse-pass grep для needle-задач), fan-out изолированных суб-агентов через Workflow `pipeline()` со schema-возвратами, рекурсия = loop-until-small с доказуемой терминацией (no-progress guard), честное покрытие (`failedGroups`, никаких silent caps), фолбэк на параллельные plain `Agent` без Workflow. Рецепты: `giant-file`, `repo-audit`, `requirements-mining` (факты `{claim, evidence_path, confidence}`, «факт без пути — не факт», дыры → `[факт: …]`); канонический map-reduce скрипт с защитным парсом `args` (живая находка L1: args может прийти JSON-строкой).
- Evals `recursive-context`: `trigger-evals.json` (6 позитивных + 4 негативных), `behavior-evals.json` (6 dry-run кейсов + live-критерии L1/L2), детерминированный генератор фикстуры `gen-fixture.sh` (~49 МБ, 12 иголок, guard аргументов). RED→GREEN→LIVE в `RESULTS.md`: триггеры **60/60 голосов** (3 судьи × 20 запросов, включая кросс-регрессию против myarchitect), поведение **6/6 кейсов (19/19 assertions)** с живой проверкой фолбэк-ветки, live L1 **12/12 иголок** настоящим Workflow-прогоном (60 map-агентов, 0 упавших групп), live L2 — **40 verified-фактов с путями** на реальном репо + 5/5 выборочных проверок.

### Changed
- **myarchitect 1.13** — Workflow Z шаг 3 и Workflow I шаг 3: при доступном репозитории факты из кода добывает `recursive-context`/requirements-mining (пометка `[факт: код <path>]`); секция Composes with — новый сосед-скил. Description не тронут.

## [1.12.0] — 2026-07-03

### Added
- **Initiative gate** (`references/initiative-gate.md`) — свод правил формирования инициатив (гейт 7 вопросов, правила текста, процесс «две корзины»); единственный источник истины для правил — воркфлоу и агенты ссылаются, не дублируют.
- **Workflow I — Authoring an initiative (DECIDE)**: фильтр «две корзины» (с ask-first при неясном объёме) → интервью по гейту только по дыркам (правило фактов: факт / оценка / цель, дырка → литеральный `[факт: …]`) → спина 7×1 → PROPOSE-then-CONFIRM → эпик фиксированной структуры + ноды по живым `levelNames`; «не делаем» (Опция 0 / нет потребителя) и «не сейчас + триггер пересмотра» — легитимные успешные исходы.
- **Workflow R — Business-Owner review (read-only)**: 5 проверок (generic-фразы, «было → станет» + чужая дельта, статус-кво-тест, «если не делать», противоречия и регистр) + блокер-скан незакрытых `[факт: …]`; выход — таблица «цитата → почему слабо → фикс из фактов дока → needs_user_fact» со счётом блокеры/рекомендации; «одна слабость — одна категория».
- Команды `/my-architect:initiative` и `/my-architect:bo-review` (тонкие обёртки); агенты `initiative-author` (Write/Edit для файла-канона эпика, субагентная WAIT-семантика) и `initiative-reviewer` (read-only: 4 читающих тулла + 15 мутаторов в `disallowedTools`).
- Evals: `initiative-evals.json` (роутинг в обе стороны / поведение / фикстура) + `fixtures/00-EPIC-weak.md` (13 заложенных слабостей с манифестом, включая обе CTO-фразы и противоречие «опора ↔ уже работает»); `trigger-evals.json` +9 кейсов. RED→GREEN в `RESULTS.md`: триггеры 9/9 + регрессия 20/20, роутинг 6/6, поведение 7 dry-run'ов, фикстура **13/13** (порог ≥10).

### Changed
- Workflow Z шаг 3: **четыре правила гейта** на upfront-требования (потребитель поимённо; «Сделаем X → актор сможет Y → увидим по Z»; модальность ЦЕЛЬ/СЕЙЧАС; стоп-лист) + мост к ask-first шага 1.
- SKILL.md: карта цикла — шаг «0. Decide → Workflow I» и publish-check Workflow R; триггеры инициатив в description (923 символа, ≤1024); Event Storming-абзац уточнён (после Decide-гейта); новый само-триггер про структурную работу без решения «делать ли».

## [1.11.0] — 2026-06-29

### Added
- **Event Storming canvas guidance** in the `myarchitect` skill. A new `event-storming` diagram type for collaborative domain/event modeling: author it with `create_diagram({diagramType:'event-storming', dsl})` on an epic/initiative, or embed a ` ```event-storming ` block in a node doc. The DSL is line-based, agent-native and round-trippable — `group "Context"` swimlane frames (cards inside move together), nested `[event|command|policy|readmodel|actor|aggregate|external|hotspot] "label"` cards, free cards with an `@x,y` pin, and `connect "A" -> "B"` causal arrows. It can also be created from the hierarchy node menu. Documented in `references/forming-nodes.md`; positions it as the "where the HOW lives" for domain flow + open questions (hotspot = neon-pink rotated diamond), above box/ASCII relationship graphs.
- **Event Storming as a sequencing control (process rule + MCP).** New SKILL.md lifecycle rule: when working an **epic/initiative**, by default run Event Storming as a sub-task before code and re-validate the sequence during implementation (strong default; skip only for trivial 1–2-step nodes). Backed by the MCP surface — `create_diagram(nodeId:…)` authors the board on the node; `get_diagram` returns a `sequence` analysis surfacing story breaches (event with no cause, command with no resulting event, policy that doesn't bridge, isolated cards, unresolved hotspots); `update_diagram` refines it until `sequence.ok`. WHY: at the epic/initiative altitude this catches missing steps and wrong order before and during coding, and keeps open questions visible.

### Compatibility
- **Skill-text only, but gated:** requires an app + `@my-architect/mcp` build where the `event-storming` diagram type is registered AND the MCP tools `create_diagram(nodeId)`, `get_diagram` (sequence analysis), `update_diagram` ship (feature-006). Until it ships to my-architect.app, `create_diagram` rejects this type and the sequence tools are absent — do not advertise it as live before the app/MCP deploy (avoids the "done-locally-not-shipped" trap).

## [1.10.0] — 2026-06-25

### Added
- **Verify-before-elevate guidance** (story-078) in `references/forming-nodes.md` + a `Don't` in `SKILL.md`: a node that asserts an integration ("X reads via Y", "calls service Z") must be verified against the code BEFORE creation. Unverified → a `draft` with a `VERIFY:` marker, not a confident block — a fabricated integration in the tree is worse than its absence (it steers work wrong). Altitude is about value; this is about truth — both checked pre-`build_hierarchy`.
- **Design-doc location guidance** (story-079) in `SKILL.md` "Composes with": when the architect is the project workspace, final design docs live ON nodes via `create_doc` (Workflow C), not in a local `docs/superpowers/specs/` — `brainstorming` yields, so the source of truth is not split between repo and nodes. Notes `update_doc` `find`/`replace`/`section` for long-doc edits.
- **Decomposition evals** (story-076) — `evals/decomposition-evals.json`: 4 prose-feature prompts that grade the proposed `build_hierarchy` tree for *altitude* (building blocks vs task-slices), the behavioral regression net for story-074/075. Embeds the MM case + over-split, multi-block, and order-as-dependency cases. Documented in `evals/RESULTS.md`.

### Compatibility
- Skill-text only. Best paired with `@my-architect/mcp` ≥ 1.5.3 (update_doc patch edits, `add_requirements`, `get_project_context` summary view) shipped alongside.

## [1.9.0] — 2026-06-25

### Added
- **HTML-wireframe recommendation** in the `myarchitect` skill (`references/forming-nodes.md`, Altitude section): when a building block needs a UI wireframe or a conceptual block-diagram, **prefer** authoring it as a self-contained ```html fragment (inline CSS, no external scripts) in the node's doc — My Architect renders it as a live preview in an isolated `sandbox` iframe next to Documents, at higher fidelity than ASCII art, and keeps the artifact attached to the block. This is where the "how" lives for design. ASCII/`box`/`mermaid` stay for quick sketches and relationship graphs; conceptual screen layouts go to HTML. Motivated by the MM-test post-mortem (the "Layers" wireframe had to be drawn in low-fidelity ASCII).

### Changed
- **Altitude lint is now live, as a warning.** `build_hierarchy` / `update_node` return non-blocking `altitude_warnings` when a title leads with a code-artifact noun (Коллекция/Поле/Endpoint/Hook/Migration/…) or a task verb (добавить/создать/прокинуть/add/create/wire/…) — the title names an artifact or a step, not a building-block outcome. It complements the RFC-013 *formulation* lint (which hard-rejects): formulation catches *how a node is named*, altitude catches *how high it is sliced*. Re-name to the observable result; the artifact stays in the description. Requires `@my-architect/mcp` ≥ 1.5.2.

### Compatibility
- Skill-text + MCP-client change. The wireframe rendering ships in the My Architect app (sandboxed iframe for ```html blocks and node docs); the `altitude_warnings` ship in `@my-architect/mcp` ≥ 1.5.2.

## [1.8.0] — 2026-06-24

### Added
- **Feature-altitude guidance** in the `myarchitect` skill (story-074): a new **Altitude** section in `references/forming-nodes.md` teaches feature-as-**building-block** — the thinnest independently-shippable slice with an observable result (may cut across services), not a code-layer task. Adds the **merge-test** and **demo-test** (run pre-flight before `build_hierarchy`), result-not-artifact title grammar, "implementation + `file:line` → acceptance/doc, not child nodes" (anchors become impl-notes, never lost), cross-cutting≠feature, order = dependencies + releases, and a granularity-budget smell. A lean pointer from the core lifecycle map. Complements — does not replace — the RFC-013 formulation lint: that catches *how a node is named*, this catches *how high it is sliced*.

### Compatibility
- Skill-text only; no MCP/API change. The matching server-side title-lint extension (flagging artifact/task titles) ships separately.

## [1.7.0] — 2026-06-22

### Changed
- **Progressive-disclosure refactor of the `myarchitect` skill** (story-062): `SKILL.md` is now a lean ~100-line core (3 principles + setup ladder + always-first + the feature-lifecycle map as a *router* + decision rubric + Don't guardrails). The detailed procedures moved into `references/` and load on demand: `references/workflows.md` (full Workflow Z/D/A/B/C bodies + Description template + the `plan_release` note) and `references/forming-nodes.md` (preset/level model, granularity tests, title lint, `build_hierarchy`, `move_node`/`set_node_type`). Behaviour and the workflow letters (A/B/C/D/Z) are unchanged — the slash commands stay wired and the map tells the agent which reference to open at each step. All behavioural content preserved (verified token-by-token); regression-checked with trigger + behavioural evals (`evals/`).

### Compatibility
- No behavioural or API change — `description` (the trigger) is byte-identical. Same `@my-architect/mcp` requirements as 1.6.0.

## [1.6.0] — 2026-06-22

### Added
- **/my-architect:feature** command — the CREATE entry point of the lifecycle. A thin wrapper over Workflow Z: dispatches the new feature-author agent to turn prose into a proposed `build_hierarchy` tree + upfront requirements + optional doc, presents it, and writes only after you confirm (propose-then-confirm gate), then `validate_project` + echoes the created IDs.
- **Four plugin agents** (`agents/`, auto-discovered, each runs in its own context): **feature-author** (Workflow Z — the engine behind `/feature`), **reconciler** (verify draft nodes against the codebase and close what shipped, only with evidence), **debt-scanner** (Workflow A scan-for-gaps + Workflow B — file each surfaced deferred/caveat/known-issue, de-duped), **progress-auditor** (read-only status audit with drift flags; uses `disallowedTools` to stay read-only).
- **Debt-scan hook** (`hooks/hooks.json`): a single `PostToolUse` hook matched to the `complete_task` MCP tool (`mcp__plugin_my-architect_my-architect__complete_task`) that, on feature close, reminds Claude to run the scan-for-gaps pass and dispatch the debt-scanner. Exactly one hook, scoped to one tool — nothing fires on unrelated turns.
- Skill **drift-prevention guidance**: a **ship = sync** rule (any user-visible release — a feature-shipping commit or a tagged version — moves the matching node to its done/next status in the SAME turn) added to the lifecycle map and the Don't section; Workflow Z step 2 hardened so a shippable feature is never authored as one childless node (always ≥1 child slice per the project's `levelNames`), cross-referencing the new `validate_project` **status-rollup-lag** warning.

### Changed
- README: documents the commands, agents, and hook; clarifies that there is no marketplace-author auto-update toggle (auto-update is a per-user setting; the manual `/plugin update` path is reliable, and the MCP server always runs `@latest`).

### Compatibility
- No new MCP tools required. The `status-rollup-lag` warning is server-side (live on my-architect.app); the `delete_node` fix ships in `@my-architect/mcp` ≥ 1.5.1. Still requires `@my-architect/mcp` ≥ 1.5.0 for `move_node`/`set_node_type` + the title lint.

## [1.5.0] — 2026-06-16

### Added
- Skill **Workflow Z — Authoring a feature from scratch (CREATE)**: the missing front of the lifecycle — prose → `build_hierarchy` tree (feature + stories, tasks lazily) → **upfront requirements** (`add_requirement` FR/NFR/SAR/CON, no longer a deferred-only afterthought) → optional node doc (Workflow C) → release via `bulk_update_nodes` → `validate_project` + echo created IDs. Includes a story/task **breakdown heuristic** (when a feature needs stories, when a story needs tasks).
- Skill **"Feature lifecycle — the map"**: orders the workflows as Create (Z) → Work (D) → Close (A) → File deferred (B), with Docs (C) woven through. Authoring now **leads** the skill instead of closure.
- **Preset-aware hierarchy**: Forming-nodes, Workflow Z, and Setup now read the project's level scheme (fixed at init by the `scaffold_project` preset — `agile` Epic→Feature→Story→Task, `safe` Initiative→Epic→Feature→Story, `simple` Category→Item, or `custom`) instead of assuming the agile stack. Granularity tests carry across presets, and the skill won't invent a level absent from `levelNames` (e.g. SAFe has no Task). Verified against product source.

### Changed
- **Workflow D** moved into the WORK slot (after Z, before A) and now reads `get_requirements({inherited:true})` alongside the node docs before coding. Workflow **letters kept stable** (A/B/C/D) so the `/next`, `/doc`, `/progress`, `/reconcile` commands stay wired; the map — not the alphabet — defines the sequence.

### Compatibility
- No new MCP tools required. Still requires `@my-architect/mcp` ≥ 1.5.0 (for `move_node`/`set_node_type` + the title lint introduced in plugin 1.4.0).

## [1.4.1] — 2026-06-10

### Fixed
- README: token location updated to the new app UI — **API Keys** page (user menu → API Keys) replaces the old *Settings → Connect Agent* path. The app now also features a **Claude Skills** tab (first, recommended) on that page with the exact `/plugin marketplace add` + `/plugin install` commands from this README. Doc-only release; skill and plugin config unchanged.

## [1.4.0] — 2026-06-07

### Changed
- **Forming nodes** title rule sharpened to RFC-013: *name the entity (noun/outcome), not the work (verb/steps/acceptance/scope)*, with the real ❌→✅ rewrite. Adds lint awareness — `build_hierarchy` / `update_node` now **reject** step/scope/acceptance titles (arrow-pipelines, `+`-lists, `a/b/c`/`×` matrices, comma-lists, impl-in-parens, >10 words; `(RFC-NNN)` + single-arrow allowed), so the skill tells the agent to name it right the first time.

### Added
- **Reclassification guidance**: when a node is mis-typed or mis-placed, use `move_node` (re-parent, levels/type reconcile, cycle/depth guards) or `set_node_type` (relabel in place, refs preserved) instead of `delete_node` + recreate. Notes that `validate_project` surfaces ladder inversions (epic under a story).

### Compatibility
- Requires `@my-architect/mcp` ≥ 1.5.0 for `move_node` / `set_node_type` and the creation-time title lint.

## [1.3.0] — 2026-06-07

### Added
- Four slash commands (auto-discovered from `commands/`): **/my-architect:next** (pull + work the next task via Workflow D), **/my-architect:progress** (project progress + routing), **/my-architect:doc** (author/update a node's source-of-truth doc via Workflow C), **/my-architect:reconcile** (sweep draft nodes against the codebase, close what's already shipped). Thin prompt wrappers over the my_architect MCP flow + the myarchitect skill.

### Compatibility
- No new MCP tools required beyond 1.1.0's set; still requires `@my-architect/mcp` ≥ 1.4.0.

## [1.2.0] — 2026-06-05

### Added
- Skill section **Forming nodes — the hierarchy model**: level/granularity table (Epic → Feature → Story → Task, read live from `project.levelNames`), what makes a good node (outcome title, lead-with-fact description, correct parent + release, one granularity per node), and `build_hierarchy` to create a feature tree in one call before coding.
- Skill **Workflow D — Working a task against the architect**: the during-work loop — read the node + its docs before coding, form child nodes as scope emerges, `update_doc` the moment understanding changes, `validate_project` → `complete_task` at close.

### Changed
- Scope reframed: the skill now covers using the architect as a **living source of truth during work**, not only backlog touchpoints. New opening principle, during-work load triggers, narrowed "when NOT to load", and a `Don't` against letting a node/doc go stale (sync in-turn or mark `blocked`).
- `description` extended with during-work triggers (starting/implementing a tracked feature, forming a node tree, keeping a doc current).

### Compatibility
- No new MCP tools required beyond 1.1.0's set; still requires `@my-architect/mcp` ≥ 1.4.0.

## [1.1.0] — 2026-05-29

### Added
- Skill **Workflow C — Authoring docs as source of truth**: when to write a doc, the create / read / update / delete lifecycle, and the `validate_project` gate before `complete_task`. Covers `list_docs`, `get_doc`, `create_doc` (`nodeId` attaches), `update_doc`, `delete_doc` (`nodeId` detaches), `validate_project`.

### Compatibility
- Requires `@my-architect/mcp` ≥ 1.4.0 (new doc tools + `GET /api/projects/:pid/validate` route on the server).
- Plugin MCP config still resolves `@my-architect/mcp@latest`, so the new tools reach users automatically once the npm release publishes; no user-side change beyond updating the plugin to 1.1.0 for the new skill text.

## [1.0.1] — 2026-05-03

### Added
- `author` field in `plugin.json` (name, email, url) — silences the "No author information provided" warning from `claude plugin tag` and provides attribution metadata for the plugin registry.

### Changed
- No functional or behavioural changes. Skill content, MCP config, and decision rubric are unchanged from 1.0.0.

## [1.0.0] — 2026-04-29

### Added
- Initial release of the `my-architect` plugin.
- Skill `myarchitect` — proactive backlog tracker that creates my_architect nodes for surfaced gaps (deferred / caveat / known issue), with a 3-lane decision rubric (tech-debt / future-with-trigger / strategic-ASK).
- Auto-configured MCP server `@my-architect/mcp@latest` via `mcpServers` in `plugin.json`. User supplies `MCP_API_KEY` from shell env; `MA_API_URL` defaults to `https://my-architect.app`.

### Compatibility
- Claude Code 2.0+
- `@my-architect/mcp` ≥ 1.2.1
- Node ≥ 20
