---
name: myarchitect
description: Use when surfacing, working, or closing work in a project that uses the my_architect MCP server — deferred items, known issues, caveats, "to be tested when X", just-shipped features with follow-ups, scope questions about the backlog. Also when starting or implementing a tracked feature (start_task, "беру/реализую <фичу>"), forming a node tree from scratch ("как сформировать ноды", "опиши фичу"), or keeping a feature's doc/node current while working. Encodes the living-source-of-truth + proactive tracking rules + ask-when-ambiguous decision rubric. Triggers on words like "deferred", "отложил", "caveat", "known issue", "не подключено", "not yet wired", "could improve later", "is this tracked?", "мы это не потеряем?", "what's next?", or after any commit that closes a feature.
---

# myarchitect — proactive backlog tracker

Кодифицирует три вещи поверх любого проекта, использующего MCP-сервер `my_architect`:

1. **Архитектор — живой источник истины, а не журнал постфактум.** Берёшь задачу — сперва читаешь ноду и её доки, ведёшь работу против них и держишь их в актуальном состоянии, пока работаешь (не только на старте и финише).
2. Любой surfaced gap (deferred / caveat / known issue / "to be tested when") становится my_architect-нодой **до конца текущего хода**.
3. Когда приоритет/release спорный — **остановиться и спросить**, не выдумывать.

Skill универсальный: project ID, эпики, релизы, уровни иерархии и конвенции тайтлов читаются из текущего проекта, а не захардкожены.

## Setup — определить project ID (один раз за разговор)

Лестница попыток (выполнять по порядку, остановиться на первом успехе):

1. **Local `CLAUDE.md` проекта.** Поискать литеральный паттерн `pid:\s*["']([\w-]+)["']` рядом с упоминанием `my_architect` или `my-architect`. Это естественный маркер — туллы обычно цитируются с `pid` явно (пример: `mcp__my-architect__get_project_context({pid: "<id>"})`).
2. **`mcp__my-architect__list_projects({})`.** Если ровно один проект — он и есть. Если несколько — **спросить пользователя**, в каком работаем сейчас. Не угадывать.
3. **Ноль проектов.** Предложить `mcp__my-architect__scaffold_project({...})`, но НЕ выполнять без подтверждения (создание проекта — scope decision, не routine).

Запомнить выбранный `pid` на остаток разговора. Не перепроверять каждый ход.

## When to load this skill

**Пользователь говорит/пишет** (case-insensitive, RU+EN):

- «deferred» / «отложил» / «отложим» / «пока не делаем» / «потом»
- «known issue» / «известная проблема» / «known limitation»
- «caveat» / «оговорка» / «caveat hint»
- «not yet wired» / «не подключено» / «не доделано»
- «to be tested when X» / «протестируем когда»
- «could improve later» / «можно улучшить»
- «is this tracked?» / «это где-то записано?» / «мы это не потеряем?»
- «what's next?» / «что дальше?» / «backlog» / «next task»

**Ассистент сам только что сделал что-то такое** (self-trigger):

- Закрыл feature через `complete_task` или сказал «feature done / shipped».
- Написал commit body со списком follow-ups, deferreds, «known issue».
- Написал acceptance report со списком «what's NOT covered» / «out of scope».
- Упомянул будущий триггер («at scale», «when paid users arrive», «next tier»).
- Починил случайный баг по дороге, не зафайлив его.

**Берёшься за работу по трекаемой ноде** (during-work):

- Начинаешь задачу/фичу, у которой есть нода в my_architect (`start_task`, «беру <feature>», «реализую <node>»).
- По ходу работы поменялось понимание фичи — доку/ноду надо синхронизировать с реальностью.
- Создаёшь новую фичу/эпик с нуля — нужно правильно сформировать дерево нод.

**Когда НЕ загружать.** Чисто разговорный ход или тривиальная правка, не связанная ни с одной трекаемой нодой.

## Always-first

```
mcp__my-architect__get_project_context({ pid: "<resolved-pid>" })
```

Один вызов даёт `meta + hierarchy + backlog + diagrams + stats`. Кешировать ментально на остаток хода — не перевызывать пока не было create/update.

## Forming nodes — the hierarchy model

Уровни и их имена читать live из `get_project_context` (`project.levelNames`, `project.releases`) — НЕ хардкодить. Типовой agile-стек уровней и тест на правильную гранулярность:

| Уровень | Что это | Тест гранулярности |
|---|---|---|
| **Epic** | крупный исход / направление | объединяет несколько фич; сам не «делается» за один заход |
| **Feature** | отгружаемая способность | одна внятная приёмка; влезает в релиз |
| **Story** | пользовательский срез фичи | «как `<роль>` я `<действие>`, чтобы `<ценность>`» |
| **Task** | атомарный шаг разработки | один коммит/PR; закрывается одним человеком |

**Хорошая нода:**

- **Title — имя СУЩНОСТИ, не работы.** Существительное/исход — «что существует, когда готово», а не глагол/шаги/приёмка/перечень. ✅ `Render diagrams from DSL` · `SVG export` ❌ `Frontend: GET .dsl → parse → render (no position persistence)` · `Expose document tools + validate_project via MCP`.
  - **Линт отклонит смелый тайтл** при `build_hierarchy`/`update_node` (RFC-013): стрелки-пайплайны `→…→`, `+`-перечни, матрицы `a/b/c` / `×`, запятые-списки, impl/приёмка в скобках, >10 слов. `(RFC-NNN)` и одиночная стрелка-трансформ — ок. Пиши имя сразу правильно; детали — в description / requirements / дочерние ноды.
- **Description** — лидируй фактом по шаблону (см. «Description template»): что это · **Why** · **How/acceptance** · **Source**. Title = «о чём в строку», doc = «как именно» (Workflow C).
- **Parent** — правильный эпик из live-структуры. **Release** — проставлен.
- **Один уровень granularity на ноду.** Если в приёмке «и…, и…, и…» — это дерево, а не одна нода.

**Создавать деревом, не по одной.** `build_hierarchy` строит весь подграф за вызов:

```
mcp__my-architect__build_hierarchy({
  pid, parentId: "<epic-id>",
  tree: [{ title, type, description, children: [{ title, type, description }] }]
})
```

Сформировал дерево фичи ДО кода → работа идёт против явной структуры, а не «в голове».

**Ошибся типом или местом — ИСПРАВЛЯЙ, не пересоздавай** (RFC-013). Понял по ходу, что «story» на самом деле epic, или нода висит под не тем родителем:

- `move_node({ pid, nodeId, newParentId })` — перенести поддерево (уровни и тип реконсилятся каскадно; циклы и превышение глубины отклоняются).
- `set_node_type({ pid, nodeId, type })` — переклассифицировать на месте (id, slug, доки, дети, рефы сохраняются; идемпотентно).

НЕ `delete_node` + создать заново — потеряешь id, доки и историю. `validate_project` подсветит ladder-инверсии (epic под story) — чини их этими туллами.

## Workflow A — Closing a feature

1. **Закрыть с summary:**
   ```
   mcp__my-architect__complete_task({
     pid, nodeId,
     summary: "<commit SHA> — <one-line outcome> — acceptance: <T-cases or smoke> — caveats: <list or none>"
   })
   ```
   Каскадирует статус по предкам, возвращает `next_task`. Не дублировать `update_node({status: "done"})` — `complete_task` делает оба.

2. **Scan-for-gaps pass.** Перечитать commit body **и** текущий чат-ход. Помечать каждое вхождение: «deferred», «caveat», «known issue», «not yet wired», «to be tested when», «could improve later», «out of scope», «manual probes pending». Каждый помеченный айтем → Workflow B.

3. **End-of-turn summary.** Перечислить либо «<X> уже отслеживается в `<node-id>`», либо «новая нода `<node-id>` создана под эпик `<epic-id>`, релиз `<release-id>`». Это закрывает «не теряем ли мы это?».

## Workflow B — Adding a deferred item

1. **De-dup.** Keyword-поиск в кешированном `get_project_context`. Если нашёл draft/in-progress ноду с overlap по тайтлу/описанию ≥60% — **процитировать ID, не создавать**. Дубликаты ломают `get_next_task` (он leaf-first + alpha — дубль может опередить настоящую работу).

2. **Parent epic.** Из live-структуры проекта (`get_project_context` → top-level эпики). Tech-debt существующей фичи → тот же эпик. Cross-cutting вопрос (безопасность/инфра) → соответствующий cross-cutting эпик если есть, иначе спросить.

3. **Priority + release** по rubric ниже. Если rubric говорит ASK — **остановиться и спросить, дальше не идти**.

4. **Создать ноду:**
   ```
   mcp__my-architect__build_hierarchy({
     pid,
     parentId: "<epic-id>",
     tree: [{
       title: "<convention from local CLAUDE.md or asked once>",
       description: "<lead sentence>\n\n**Why:** ...\n\n**How to apply:** ...\n\n**Source:** <commit SHA / chat turn / spec ref>"
     }]
   })
   ```
   Конвенция тайтлов (типа `P<N>-tech-debt:` / `P<N>:` или другая) — посмотреть в local `CLAUDE.md` проекта; если не нашёл — спросить пользователя один раз и зафиксировать в его CLAUDE.md.

5. **Назначить release:**
   - **Один айтем:** `mcp__my-architect__update_node({ pid, nodeId, release: "<release-id>" })`.
   - **2+ айтемов сразу:** `mcp__my-architect__bulk_update_nodes({ pid, updates: [{ id, fields: { release: "<id>" } }, ...] })`. Атомарный вызов, явно возвращает `successful` и `failed`.
   - **Всегда валидировать:** длина `successful` должна совпасть с числом запрошенных апдейтов, `failed` — пустой. Если нет — ретрай только по failed-ID. Не считать апдейт состоявшимся пока не проверил ответ.

6. **Опционально: requirement.** Если у дефера есть hard testable criterion — `add_requirement` с `type: "FR"` (поведение), `"NFR"` (SLO/качество), `"SAR"` (arch constraint) или `"CON"` (hard constraint).

## Workflow C — Authoring docs as source of truth

Когда у фичи/эпика остаётся только микро-дескрипшен + пара требований — это уровень «assumption». Привязанные к ноде md-документы превращают её в полноценный источник истины (для агентов и для человека в UI). Доступно через `@my-architect/mcp` ≥ 1.4.0.

### Когда писать док

- На ноде есть нетривиальная логика, которой нет места ни в title, ни в коротком description.
- Закрываешь эпик/фичу и есть «как именно мы это решили» / ADR-материал.
- Заказчик спрашивает «что именно делает <фича>?» — ответ должен жить в репо, не в чате.

### Workflow

1. **На старте задачи** — после `start_task` глянуть `get_node({pid, nodeId}).docIds` и прочитать каждый док через `get_doc({pid, docId})`. Это исток правды о фиче; не догадываться по title.

2. **Авторинг** — `create_doc({pid, title, content, nodeId})`. Маркдаун; ведущий `# Title` добавляется автоматически, если его нет. Без `nodeId` — проектный док (PRODUCT, ARCHITECTURE и т.п.). Под одной нодой можно много доков.

3. **Правка** — `update_doc({pid, docId, content})` (заменяет содержимое целиком; title берётся из ведущего `# Heading`).

4. **Перед `complete_task`** — `validate_project({pid})`. Возвращает `{valid, issues[]}`; для каждого issue — `type`, `severity` (error|warning), `nodeId`, `message`. Чинить **минимум** все `dangling-doc-ref` / `dangling-diagram-ref` до закрытия таски. `hierarchy-cycle` / `dangling-parent` — errors, всегда блокируют.

5. **Удаление** — `delete_doc({pid, docId, nodeId})`. `nodeId` обязателен если док привязан к ноде (иначе остаётся в `node.docIds` как dangling). Irreversible.

### Don't (доки)

- **Не дублировать description**. Description — «о чём нода в одну строку», док — «как именно». Если описание влезает в description — не плоди файл.
- **Не писать док без `nodeId`** для фичи/эпика — он повиснет в проекте, и `validate_project` не поймает его как осиротевший.
- **Не игнорировать issues валидатора** перед `complete_task` — это не косметика, это битые ссылки в источнике истины.

## Workflow D — Working a task against the architect (живой источник истины)

Архитектор — то, против чего ведёшь работу и что держишь актуальным, а не запись постфактум.

1. **Перед кодом** — `get_node({pid, nodeId})` + прочитать каждый док из `docIds` (`get_doc`). Истина о фиче — в доке, не в title. Дока нет, а логика нетривиальна → первый шаг работы: завести её (Workflow C) из обсуждения/спеки, а не держать в голове.

2. **По ходу** — всплыло реальное под-разбиение → сформировать дочерние ноды (`build_hierarchy`, см. «Forming nodes»). Не давай скоупу жить только в твоей голове.

3. **Понимание изменилось** — `update_doc` сразу, не «потом». Дока описывает то, что фича делает СЕЙЧАС, а не первую догадку. Нода/дока, которые врут, хуже их отсутствия.

4. **Закрытие** — `validate_project` (почини dangling-ref) → `complete_task` с summary. К этому моменту дока и статус ноды совпадают с реальностью.

## Decision rubric

| Lane | Сигналы | Действие |
|---|---|---|
| **Tech-debt только что закрытой фичи** | Broken plumbing, dropped reference, retry path не подключен, length/style guard пропущен, FP rate caveat. Всегда привязано к feature, который только что закрылся. | Префикс типа `P3-tech-debt:` (или конвенция из local CLAUDE.md), тот же эпик, релиз = релиз родителя. **No ask.** |
| **Future enhancement с явным триггером** | «at scale», «when paid users arrive», «if FP > X%», «next tier», «когда появится N юзеров». Триггер observable. | Новый feature-нода, последний/будущий релиз, триггер прописан в описании. **No ask.** |
| **Strategic / scope / ethical** | «Нужна ли вообще эта фича?», меняет персону / consent flow / дефолты, добавляет dependency вне принятого стека. Или: сигналы реально конфликтуют. | **STOP.** Показать 2-3 варианта размещения с trade-offs. Спросить. |

Tie-break при сомнениях — лень в сторону STOP. Стоимость 30-секундного подтверждения дешевле неправильного размещения, всплывшего на не том milestone.

## Description template

Лидируй фактом, потом объясняй:

```
<one-sentence: что отложено / что не работает / что упускается>

**Why:** <user impact или failure mode который оставляем открытым>

**How to apply:**
- <step 1>
- <step 2>
- <acceptance: как поймём что починили>

**Source:** commit <SHA>, chat turn <date>, spec ref <doc §>.
```

## Don't

- **`delete_node`** — irreversible. Если нода зафайлена неправильно — `update_node({ status: "blocked", description: "<reason>" })` reversible альтернатива до подтверждения owner.
- **Skip de-dup** — дубликаты в backlog ломают приоритизацию `get_next_task`.
- **Ask twice** — если rubric говорит «no ask», не спрашивать. Пользователь ценит проактивность на routine.
- **Хардкодить эпики / релизы / конвенции** в самом skill — читать live из `get_project_context` и local `CLAUDE.md`. Skill универсальный, проектные данные живут в проекте.
- **Restate local `CLAUDE.md`** — он всегда в контексте, дублировать в skill = дрейф. Reference, don't duplicate.
- **Не оставлять ноду/доку устаревшей.** Разошлась работа с тем, что записано — синхронизировать в том же ходу (`update_doc` / `update_node`) или пометить `status: "blocked"` с причиной. Молчаливый дрейф источника истины — худшее из зол.

## On `plan_release` vs `bulk_update_nodes`

Предпочитать **`bulk_update_nodes`** для массовых release-апдейтов: явный контракт `successful`/`failed`, проще валидировать.

`plan_release` использует тот же bulk endpoint под капотом и должен работать; но в некоторых проектах историчски замечалась частичная запись (см. local `CLAUDE.md` если он явно об этом говорит) — fallback на `bulk_update_nodes` напрямую.

**В любом случае валидировать ответ.** Не доверять `updated: N` без проверки `successful` vs `failed`.

## Composes with

- **`superpowers:verification-before-completion`** — запустить ДО объявления фичи готовой; этот skill подхватывает после (closure + scan).
- **`superpowers:dispatching-parallel-agents`** — если closure-scan нашёл 5+ новых нод для filed'инга, это subagent task, не main-thread.

---

**Version:** 1.4 (2026-06-07). Bump: RFC-013 naming + reclassification — "name the entity, not the work" title rule + lint awareness (`build_hierarchy`/`update_node` reject step/scope/acceptance titles), and `move_node` / `set_node_type` to fix mis-typed/mis-placed nodes instead of delete+recreate. (1.3 added slash commands.) Requires `@my-architect/mcp` ≥ 1.5.0 for `move_node`/`set_node_type` + the lint.
