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

## Как устроен этот skill

Этот файл — лёгкое ядро (принципы + setup + карта жизненного цикла + guardrails). Подробные процедуры лежат рядом и читаются **по необходимости**, когда дошёл до шага:

- [`references/workflows.md`](references/workflows.md) — полные тела Workflow Z / D / A / B / C + Description template + `plan_release` note.
- [`references/forming-nodes.md`](references/forming-nodes.md) — модель иерархии: пресеты/уровни, тест гранулярности, lint тайтлов, `build_hierarchy`, `move_node`/`set_node_type`.

Карта ниже говорит, **когда** какой файл открыть. Не держи всё в голове — дошёл до Workflow → прочитал его тело.

## Setup — определить project ID (один раз за разговор)

Лестница попыток (выполнять по порядку, остановиться на первом успехе):

1. **Local `CLAUDE.md` проекта.** Поискать литеральный паттерн `pid:\s*["']([\w-]+)["']` рядом с упоминанием `my_architect` или `my-architect`. Это естественный маркер — туллы обычно цитируются с `pid` явно (пример: `mcp__my-architect__get_project_context({pid: "<id>"})`).
2. **`mcp__my-architect__list_projects({})`.** Если ровно один проект — он и есть. Если несколько — **спросить пользователя**, в каком работаем сейчас. Не угадывать.
3. **Ноль проектов.** Предложить `mcp__my-architect__scaffold_project({...})`, но НЕ выполнять без подтверждения (создание проекта — scope decision, не routine). При scaffold — выбрать **preset** (`agile|safe|simple|custom`): он фиксирует схему уровней на весь проект, поменять потом нетривиально. Не дефолтить в `agile` молча, если проект явно не agile.

Запомнить выбранный `pid` на остаток разговора. Не перепроверять каждый ход.

## When this fires

Триггеры из пользовательской речи живут в `description` (frontmatter) — RU+EN, «deferred / отложил / caveat / known issue / не подключено / is this tracked? / что дальше?» и т.п. Помимо них, **сам себя триггеришь**, когда:

- Закрыл feature через `complete_task` или сказал «feature done / shipped».
- Написал commit body или acceptance report со списком follow-ups / deferreds / «out of scope» / «what's NOT covered».
- Упомянул будущий триггер («at scale», «when paid users arrive», «next tier»).
- Починил случайный баг по дороге, не зафайлив его.
- **Берёшься за работу по трекаемой ноде** (`start_task`, «беру/реализую <фичу>»), по ходу поменялось понимание фичи, или формируешь новую фичу/эпик с нуля.

**Когда НЕ загружать.** Чисто разговорный ход или тривиальная правка, не связанная ни с одной трекаемой нодой.

## Always-first

```
mcp__my-architect__get_project_context({ pid: "<resolved-pid>" })
```

Один вызов даёт `meta + hierarchy + backlog + diagrams + stats`. Кешировать ментально на остаток хода — не перевызывать пока не было create/update.

## Feature lifecycle — the map (router)

Жизненный цикл фичи, по порядку. Буквы воркфлоу исторические (на них ссылаются слэш-команды) — последовательность задаёт **эта карта, не алфавит**. Тела всех воркфлоу — в [`references/workflows.md`](references/workflows.md); открой нужный, когда дошёл до шага.

1. **Create → Workflow Z** — описать фичу ДО кода: дерево нод + upfront-требования (FR/NFR/SAR/CON) + (опц.) дока + релиз → `validate_project` + echo ID. Дробление нод — [`references/forming-nodes.md`](references/forming-nodes.md). Shippable-фича **никогда** не заводится одиночной childless-нодой (≥1 дочерний срез).
2. **Work → Workflow D** — взять задачу: `get_node` + доки + `get_requirements(inherited)` ДО кода; вести против ноды/доки и держать их актуальными по ходу.
3. **Close → Workflow A** — `complete_task` с summary → scan-for-gaps (перечитать commit + чат-ход на deferred/caveat/known-issue) → end-of-turn summary.
4. **File deferred → Workflow B** — каждый всплывший долг становится нодой: de-dup → parent epic → priority/release (rubric) → `build_hierarchy` → validate.
- **Docs → Workflow C** — сквозной источник истины; вплетается в Z (создание) и D (работа).

Authoring **ведёт** цикл — фичу формируешь ДО кода, а не дописываешь ноды постфактум.

**Ship = sync (нет отложенного статуса).** Любой user-visible релиз — коммит, который отгружает фичу, или тегнутая версия — в ТОМ ЖЕ ходу двигает соответствующую ноду в её done/next-статус (`complete_task` или `update_node({status})`). Закрыть код и обновить архитектора — один шаг, не два: «отгрузил сейчас, статус проставлю потом» создаёт ровно тот дрейф, который этот skill предотвращает. Если отгрузка не привязана ни к одной ноде — это сигнал, что фича не была заведена (Workflow Z), а не разрешение пропустить синк.

## Decision rubric

Когда `Priority + release` спорный (Workflow B шаг 3, Workflow Z шаг 5):

| Lane | Сигналы | Действие |
|---|---|---|
| **Tech-debt только что закрытой фичи** | Broken plumbing, dropped reference, retry path не подключен, length/style guard пропущен, FP rate caveat. Всегда привязано к feature, который только что закрылся. | Префикс типа `P3-tech-debt:` (или конвенция из local CLAUDE.md), тот же эпик, релиз = релиз родителя. **No ask.** |
| **Future enhancement с явным триггером** | «at scale», «when paid users arrive», «if FP > X%», «next tier», «когда появится N юзеров». Триггер observable. | Новый feature-нода, последний/будущий релиз, триггер прописан в описании. **No ask.** |
| **Strategic / scope / ethical** | «Нужна ли вообще эта фича?», меняет персону / consent flow / дефолты, добавляет dependency вне принятого стека. Или: сигналы реально конфликтуют. | **STOP.** Показать 2-3 варианта размещения с trade-offs. Спросить. |

Tie-break при сомнениях — лень в сторону STOP. Стоимость 30-секундного подтверждения дешевле неправильного размещения, всплывшего на не том milestone.

## Don't

- **`delete_node`** — irreversible. Если нода зафайлена неправильно — `update_node({ status: "blocked", description: "<reason>" })` reversible альтернатива до подтверждения owner.
- **Skip de-dup** — дубликаты в backlog ломают приоритизацию `get_next_task`.
- **Ask twice** — если rubric говорит «no ask», не спрашивать. Пользователь ценит проактивность на routine.
- **Хардкодить эпики / релизы / конвенции** в самом skill — читать live из `get_project_context` и local `CLAUDE.md`. Skill универсальный, проектные данные живут в проекте.
- **Restate local `CLAUDE.md`** — он всегда в контексте, дублировать в skill = дрейф. Reference, don't duplicate.
- **Не оставлять ноду/доку устаревшей.** Разошлась работа с тем, что записано — синхронизировать в том же ходу (`update_doc` / `update_node`) или пометить `status: "blocked"` с причиной. Молчаливый дрейф источника истины — худшее из зол.
- **Не отгружать без синка статуса (ship = sync).** Любой user-visible релиз — коммит, отгружающий фичу, или тегнутая версия — в ТОМ ЖЕ ходу двигает соответствующую ноду в done/next-статус (`complete_task` / `update_node({status})`). Закрыть код и обновить архитектора — один шаг, никакого «статус проставлю позже». Отложенный синк = гарантированный дрейф; `validate_project` поймает его как status-rollup-lag, но ловить уже поздно.

## Composes with

- **`superpowers:verification-before-completion`** — запустить ДО объявления фичи готовой; этот skill подхватывает после (closure + scan).
- **`superpowers:dispatching-parallel-agents`** — если closure-scan нашёл 5+ новых нод для filed'инга, это subagent task, не main-thread.

---

**Version:** 1.7 (2026-06-22). Bump: progressive-disclosure refactor (story-062) — SKILL.md теперь лёгкое ядро (принципы + setup + карта жизненного цикла как router + decision rubric + Don't), а тела Workflow Z/D/A/B/C, модель Forming-nodes и Description template вынесены в `references/` и читаются по необходимости. Поведение и буквы воркфлоу (A/B/C/D/Z) сохранены — слэш-команды (`/feature` `/next` `/doc` `/progress` `/reconcile`) остаются wired. (1.6 — drift-prevention: ship=sync + childless-shippable hardening + status-rollup-lag cross-ref; 1.5 — Workflow Z + lifecycle map + preset-aware levels; 1.4 — RFC-013 naming.) Requires `@my-architect/mcp` ≥ 1.5.0 for `move_node`/`set_node_type` + the lint.
