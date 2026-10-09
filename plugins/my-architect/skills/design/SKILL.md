---
name: design
description: Architecture-aware design sessions for projects tracked in the my_architect MCP server. Use INSTEAD of superpowers:brainstorming whenever the project uses my_architect (pid in CLAUDE.md, my-architect MCP tools present) and creative work is proposed — new feature, component, functionality, behaviour change; «давай сделаем/спроектируем фичу X», «новая фича», "let's build/design X". Resolves setup, then global product discovery and complete addressed current/base/proposed context before design, with local code graph and recursive-context facts. Presents epic designs as Event Storming canvases, lands the spec in the project's canonical location, and continues through the existing or newly authorized work node and writing-plans. Sketch mode produces an assessable solution variant for the Workflow I initiative gate on undecided structural work.
---

# design — architecture-aware дизайн-сессии

> Derived from `superpowers:brainstorming` v5.1.0 by Jesse Vincent (github.com/obra/superpowers, MIT). Диалоговое ядро сохранено; explore, место спеки и терминал переопределены под экосистему my_architect.

Превращает идею в утверждённый дизайн через диалог — против живого проекта в my_architect, а не против голых файлов.

<HARD-GATE>
Никакой имплементации — ни кода, ни scaffold'а, ни implementation-skill'ов — пока дизайн не представлен и пользователь его не утвердил. Для КАЖДОГО проекта, независимо от кажущейся простоты.
</HARD-GATE>

Уже данное применимое одобрение дизайна/реализации сохраняется при продолжении: не запускай тот же gate заново. Сверь свежий контекст и показывай только изменившиеся решения; рутинные технические шаги внутри согласованного scope не требуют нового разрешения.

## Анти-паттерн: «это слишком просто для дизайна»

Каждый проект проходит процесс — todo-лист, однострочная утилита, правка конфига. «Простые» проекты — где непроверенные допущения стоят дороже всего. Дизайн может быть коротким (пара предложений), но он ОБЯЗАН быть показан и утверждён.

## Checklist (task на каждый пункт, по порядку)

0. **Setup + routing** — подтверждённый pid → global discovery → new/change/fix/technical; выбрать режим (sketch/full)
1. **Explore** — полный обязательный адресный контекст + граф кода + recursive-context
2. **Clarifying questions** — по одному за раз; дырки, а не анкета
3. **2–3 подхода** — trade-offs + рекомендация
4. **Present design** — секциями; эпик/инициатива → Event Storming канвас
5. **Спека на узел** — `create_doc({nodeId})` (Workflow C); канон в репо по CLAUDE.md проекта → на узле карточка с `Source`
6. **Spec self-review** — плейсхолдеры / противоречия / scope / неоднозначность
7. **User review** — пользователь читает спеку (узел или путь в репо), WAIT; после «да» — срок одной строкой
8. **Терминал** — Workflow Z → writing-plans (план-файл + зеркальный док)

## Шаг 0 — setup + режим

- **pid:** следуй [setup.md](../myarchitect/references/setup.md): проверь согласованную связь в CLAUDE.md и `.architect/traceability.json`, повторно используй уже сделанный выбор. `get_project_context({pid})` нужен при проверке связи/схемы проекта; не повторяй полный dump при каждом продолжении. Недоступность MCP не означает отсутствие проекта: сохраняй ограничения и уже прочитанные источники.
- **Контекст и тип работы:** прочитай [product-catalog.md](../myarchitect/references/product-catalog.md), [product-evolution.md](../myarchitect/references/product-evolution.md) и [scoped-context.md](../myarchitect/references/scoped-context.md). Сначала глобальный поиск независимо от выбранной UI-области, затем явный feature/work target и все обязательные current/base/proposed/global/inherited записи на свежем snapshot. Различи new/change/fix/technical, сохраняй существующие IDs и вложенный путь; техническая работа может иметь product/area/architecture scope без синтетической фичи/сценария. Неизвестные maturity, milestone и роли документов остаются явными. Недоступный reader не равен пустой успешной спецификации.
- **Роутинг по размеру:** структурная работа (критерий «двух корзин» из initiative-gate.md: дольше пары недель ИЛИ трогает межсервисные контракты), для которой не решено «делать ли» → **sketch mode**. Всё остальное → **full mode**.

## Sketch mode — вход в гейт Workflow I

Цель — НЕ спека, а **оцениваемый вариант решения**: 3–5 предложений (подход, затронутые контракты, грубый аппетит, обратимость) + 1–2 альтернативы одной строкой. Ровно столько, чтобы гейт мог ответить на вопросы 6 (аппетит) и 7 (обратимость).

Затем передай в **Workflow I** (myarchitect) и остановись — «делать ли» решает гейт, не дизайн. «Не делаем» / «не сейчас + триггер» — легитимные исходы, работа skill'а на этом успешно закончена. Гейт сказал «делаем» → full mode; **7 ответов гейта — вход clarifying-фазы, не переспрашивай их**.

## Full mode

**Explore (переопределяет «files, docs, recent commits» оригинала):**
- Адресный контекст из шага 0 прочитан полностью в обязательной части; summary не заменяет требования. Сравни действующую базу с предлагаемой дельтой и существующей работой. При возобновлении проверь свежесть и изменившиеся источники; source drift не переписывает подтверждённую версию.
- Есть свежий локальный граф кода (Graphify-класс) → связи символов сперва у графа; факты — только после verify по файлам (правила и freshness-check — recursive-context, references/code-graph.md).
- Репо oversized или задача «понять подсистему целиком» → skill recursive-context, рецепт requirements-mining: факты с путями `[факт: код <path>]`. Факт без пути — не факт.
- **Пробы, которыми доказан дефект** (скрипты на реальных данных пользователя), сохраняй как приёмочную проверку: их же прогоняют после первой задачи, меняющей экран, — так видимое пользователю проверяется в начале реализации, а не в конце.

**Clarifying questions:** по одному за раз; multiple choice предпочтителен; фокус — цель, ограничения, критерии успеха. Не переспрашивай то, что уже дал гейт I или проза пользователя. Слишком большой запрос (несколько независимых подсистем) → сперва декомпозиция на под-проекты, дизайн первого.

**2–3 подхода:** с trade-offs, рекомендация — первой и с обоснованием. YAGNI безжалостно.

**Present design:** секциями, масштаб секции по её сложности, подтверждение после каждой. Покрыть: архитектуру, компоненты, поток данных, обработку ошибок, тестирование.
- **Эпик/инициатива** → Event Storming суб-задачей ДО утверждения: `create_diagram({diagramType:'event-storming', nodeId, dsl})` → `get_diagram` → поле `sequence` показывает бреши → чинить `update_diagram` до `sequence.ok` (карта — myarchitect SKILL.md, lifecycle).
- Концептуальный UI → HTML-wireframe в доке узла (myarchitect references/forming-nodes.md → Altitude), не ASCII.
- **Решает не инженер (владелец продукта, заказчик) → страница решения — не больше ~400 слов плюс макеты.** Каждое решение — через последствие его словами («оплатишь ролик, который выйдет не той сценой»), а не номером пункта или внутренним именем. Инженерные схемы, самопроверка и гейты остаются в спеке. Длинный текст такой читатель не дочитывает, макет принимает сразу.

## Спека и терминал

- **Если CLAUDE.md проекта держит канон спеки в репо** (например RFC в `docs/rfc/`) — на узле карточка: итог, решения, требования, `**Source:** <путь>`. Дословную копию длинного текста не делать: две копии расходятся.
- **Иначе канон спеки — док на узле:** используй существующий подходящий work ID; только если работы ещё нет, сначала **Workflow Z** (дерево нод + FR/NFR/SAR/CON + `validate_project`), затем `create_doc({pid, nodeId, title, content})` (Workflow C). Документ сам по себе не выбирает current: proposal и точная база следуют product-evolution reference. Локальный md-черновик допустим как промежуток, но итог переносится на узел **в том же ходу**. Никогда — `docs/superpowers/specs/` как канон.
- **Spec self-review (inline):** плейсхолдеры (TBD/TODO), внутренние противоречия, scope (один план или декомпозиция), двоякие формулировки. Чинить сразу, без повторного ревью.
- **User review gate:** «Спека — док `<docId>` на узле `<nodeId>` (или `<путь>` в репо + карточка на узле). Посмотри; правки или переходим к плану?» **WAIT.**
- **После одобрения — срок как договор, одной строкой:** срок, время первого показа (по часам владельца), каждая добавка сверх его минимума с ценой в часах, выбор «глубоко ~N ч / быстрее ~M ч». Добавки без названной цены — главный источник раздувания срока: пользователь одобряет их, не видя, во что они обходятся.
- **Терминал — superpowers:writing-plans:** план = **файл в репо** (канон для executing-plans / subagent-driven-development; путь — конвенция проекта, иначе `docs/plans/YYYY-MM-DD-<slug>-plan.md`, спросить один раз и зафиксировать в CLAUDE.md) **+ в том же ходу зеркальный док на ноде** с `**Source:** <путь>` — правило «канон один» (myarchitect, Workflow I шаг 6). Дальше имплементация ведётся против нод (Workflow D).

## Don't

- Не пропускать шаг 0 даже для «очевидно маленькой» идеи — de-dup против backlog дешевле дубля в трекере.
- Не класть канон спеки в `docs/superpowers/specs/` — источник истины дробится между репо и нодами.
- Не решать «делать ли» внутри дизайна — это Workflow I; дизайн отвечает «как».
- Не выдавать кандидатов графа за факты без verify по файлам.
- Не переспрашивать ответы гейта I и не превращать clarifying-фазу в анкету.

## Composes with

- **myarchitect** (этот плагин) — Workflow Z (терминал), I (sketch-гейт), C (доки), D (имплементация); Event Storming; decision rubric.
- **recursive-context** (этот плагин) — explore для oversized-репо; правила code-graph.
- **superpowers:writing-plans / subagent-driven-development / executing-plans** — план и исполнение. Переопределение мест спеки/плана санкционировано самими skills: «User preferences for spec/plan location override this default».

---

**Version:** 1.1 (2026-09-24): страница решения для не-инженера, срок-договор после одобрения, канон спеки в репо → карточка на узле, пробы как приёмка. 1.0 (2026-07-06). Форк superpowers:brainstorming v5.1.0 (feature-013, R3). Visual-companion оригинала не перенесён: визуальные вопросы закрывают Event Storming канвас и HTML-wireframe в доке узла.
