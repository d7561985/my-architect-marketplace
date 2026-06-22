# Workflows Z / D / A / B / C — full bodies

The [Feature-lifecycle map in SKILL.md](../SKILL.md) routes here. The letters are historical (slash commands reference them); the **map** defines the sequence, not the alphabet. Read the relevant workflow when you reach that lifecycle step.

- **Create → Workflow Z** · **Work → Workflow D** · **Close → Workflow A** · **File deferred → Workflow B** · **Docs → Workflow C** (cross-cutting)

Node-forming mechanics (preset levels, title lint, `build_hierarchy`, reclassification) live in [forming-nodes.md](forming-nodes.md).

## Workflow Z — Authoring a feature from scratch (CREATE)

Превращает prose-описание в спецированную фичу-ноду **до кода**. Это вход в цикл; не путать с Workflow B (тот — про долги уже existing/закрытой работы).

1. **Prose → spec.** Из описания вытащи: что существует, когда готово (исход); для какой роли; чем меряется приёмка; какие hard-ограничения. Не ясно — спроси (rubric ниже), не выдумывай.

2. **Сформировать дерево** — `build_hierarchy` (см. [forming-nodes.md](forming-nodes.md)): одна нода верхнего **shippable**-уровня + по дочерней ноде на каждый независимый срез приёмки. Имена уровней бери из схемы проекта (`agile`: feature + stories; `safe`: лист — story, **Task'а нет**; `simple`: category + items). Атомарный (commit/PR) уровень — только если он есть в схеме и срез очевидно многокоммитный; иначе заводишь лениво на работе (Workflow D, шаг 2). **Не выдумывай уровень вне `levelNames`.**

   **Shippable-нода НИКОГДА не заводится одиночной childless-нодой.** У неё всегда минимум один дочерний срез по `levelNames` проекта (`agile`: хотя бы одна story; `safe`: хотя бы одна story; `simple`: хотя бы один item). Бездетная shippable-нода — это drift smell: либо приёмка не разложена на срезы, либо нода на самом деле атомарная и заведена не на том уровне. Если срез реально один — он всё равно становится явной дочерней нодой, а не схлопывается в родителя. Cross-ref: `validate_project` warning'ом подсвечивает **status-rollup-lag** (родитель завис позади своих done/in-progress детей) — childless shippable-нода и rollup-lag это две стороны одного дрейфа статуса.

3. **Upfront-требования** (не «потом»). У фичи с тестируемой приёмкой — `add_requirement` сразу на feature-ноду:
   - `FR` — поведение («что система делает»);
   - `NFR` — качество/SLO («как быстро/надёжно»);
   - `SAR` — архитектурное ограничение («что трогаем/не трогаем, где живёт»);
   - `CON` — hard-ограничение («чего нельзя»).

   Требования — **часть описания фичи**, а не довесок к долгам. Проверь ответ (созданные ID).

4. **Дока, если логика нетривиальна** — `create_doc({nodeId})` (Workflow C). Лидируй фактом, добавь **Source** (чат-ход/спека), чтобы на доку можно было опираться позже. Влезает в description — не плоди файл.

5. **Релиз + приоритет.** 2+ ноды — `bulk_update_nodes` (атомарно, проверь `successful`/`failed`). Релиз спорный → rubric (**STOP & ask**).

6. **Проверить результат, не «записал молча».** `validate_project` → чисто; перечисли созданные ID (фича / стори / требования / док). Только после этого фича «заведена».

**Когда дробить:**

- *Feature → stories*: приёмка распадается на независимые «и…, и…», несколько ролей/флоу, или не влезает в один заход.
- *Story → tasks*: больше одного коммита/PR, или разные компоненты (backend / frontend / tests).
- *По умолчанию*: feature + stories заводишь сразу; tasks — лениво на работе, кроме явно многокоммитных стори.

## Workflow D — Working a task against the architect (WORK · живой источник истины)

Архитектор — то, против чего ведёшь работу и что держишь актуальным, а не запись постфактум.

1. **Перед кодом** — `get_node({pid, nodeId})` + прочитать каждый док из `docIds` (`get_doc`) **и** `get_requirements({pid, nodeId, inherited: true})` (приёмка). Истина о фиче — в доке/требованиях, не в title. Дока нет, а логика нетривиальна → первый шаг работы: завести её (Workflow C) из обсуждения/спеки, а не держать в голове.

2. **По ходу** — всплыло реальное под-разбиение → сформировать дочерние ноды (`build_hierarchy`, см. [forming-nodes.md](forming-nodes.md)). Не давай скоупу жить только в твоей голове.

3. **Понимание изменилось** — `update_doc` сразу, не «потом». Дока описывает то, что фича делает СЕЙЧАС, а не первую догадку. Нода/дока, которые врут, хуже их отсутствия.

4. **Закрытие** — `validate_project` (почини dangling-ref) → `complete_task` с summary (Workflow A). К этому моменту дока и статус ноды совпадают с реальностью.

## Workflow A — Closing a feature (CLOSE)

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

3. **Priority + release** по rubric (в SKILL.md). Если rubric говорит ASK — **остановиться и спросить, дальше не идти**.

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

## On `plan_release` vs `bulk_update_nodes`

Предпочитать **`bulk_update_nodes`** для массовых release-апдейтов: явный контракт `successful`/`failed`, проще валидировать.

`plan_release` использует тот же bulk endpoint под капотом и должен работать; но в некоторых проектах историчски замечалась частичная запись (см. local `CLAUDE.md` если он явно об этом говорит) — fallback на `bulk_update_nodes` напрямую.

**В любом случае валидировать ответ.** Не доверять `updated: N` без проверки `successful` vs `failed`.
