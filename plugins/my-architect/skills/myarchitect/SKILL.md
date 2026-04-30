---
name: myarchitect
description: Use when surfacing or closing work in a project that uses the my_architect MCP server — deferred items, known issues, caveats, "to be tested when X", just-shipped features with follow-ups, scope questions about the backlog. Encodes the proactive tracking rule + ask-when-ambiguous decision rubric. Triggers on words like "deferred", "отложил", "caveat", "known issue", "не подключено", "not yet wired", "could improve later", "is this tracked?", "мы это не потеряем?", "what's next?", or after any commit that closes a feature.
---

# myarchitect — proactive backlog tracker

Кодифицирует две вещи поверх любого проекта, использующего MCP-сервер `my_architect`:

1. Любой surfaced gap (deferred / caveat / known issue / "to be tested when") становится my_architect-нодой **до конца текущего хода**.
2. Когда приоритет/release спорный — **остановиться и спросить**, не выдумывать.

Skill универсальный: project ID, эпики, релизы и конвенции тайтлов читаются из текущего проекта, а не захардкожены.

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

**Когда НЕ загружать.** Ассистент в середине имплементации фичи и ни одно из выше не сработало — skill не для самой работы, а для backlog touchpoints.

## Always-first

```
mcp__my-architect__get_project_context({ pid: "<resolved-pid>" })
```

Один вызов даёт `meta + hierarchy + backlog + diagrams + stats`. Кешировать ментально на остаток хода — не перевызывать пока не было create/update.

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

## On `plan_release` vs `bulk_update_nodes`

Предпочитать **`bulk_update_nodes`** для массовых release-апдейтов: явный контракт `successful`/`failed`, проще валидировать.

`plan_release` использует тот же bulk endpoint под капотом и должен работать; но в некоторых проектах историчски замечалась частичная запись (см. local `CLAUDE.md` если он явно об этом говорит) — fallback на `bulk_update_nodes` напрямую.

**В любом случае валидировать ответ.** Не доверять `updated: N` без проверки `successful` vs `failed`.

## Composes with

- **`superpowers:verification-before-completion`** — запустить ДО объявления фичи готовой; этот skill подхватывает после (closure + scan).
- **`superpowers:dispatching-parallel-agents`** — если closure-scan нашёл 5+ новых нод для filed'инга, это subagent task, не main-thread.

---

**Version:** 1.0 (2026-04-29). Bump при изменении rubric или setup-логики.
