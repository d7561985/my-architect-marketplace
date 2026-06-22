# Forming nodes — the hierarchy model

Read this when creating nodes (Workflow Z step 2, Workflow B step 4, or any `build_hierarchy` / reclassification).

Уровни, их имена и **глубину** читать live из `get_project_context` (`project.levelNames`) — НЕ хардкодить. Схема **фиксируется при ините** проекта пресетом (`scaffold_project({preset})`); тип ноды выводится из позиции уровня (`levelNameToType(levelNames, level)`):

| Preset | Уровни (сверху вниз) |
|---|---|
| `agile` (default) | Epic → Feature → Story → Task |
| `safe` | Initiative → Epic → Feature → Story (лист — Story, **Task'а нет**) |
| `simple` | Category → Item |
| `custom` | свои `levelNames` |

Тесты гранулярности ниже даны на примере `agile`. Для другого пресета **переноси те же тесты** на реальные `levelNames` проекта (в `safe` лист — Story, не Task; в `simple` всего два уровня). **Не заводи уровень, которого нет в схеме.**

| Уровень | Что это | Тест гранулярности |
|---|---|---|
| **Epic** | крупный исход / направление | объединяет несколько фич; сам не «делается» за один заход |
| **Feature** | отгружаемая способность | одна внятная приёмка; влезает в релиз |
| **Story** | пользовательский срез фичи | «как `<роль>` я `<действие>`, чтобы `<ценность>`» |
| **Task** | атомарный шаг разработки | один коммит/PR; закрывается одним человеком |

**Хорошая нода:**

- **Title — имя СУЩНОСТИ, не работы.** Существительное/исход — «что существует, когда готово», а не глагол/шаги/приёмка/перечень. ✅ `Render diagrams from DSL` · `SVG export` ❌ `Frontend: GET .dsl → parse → render (no position persistence)` · `Expose document tools + validate_project via MCP`.
  - **Линт отклонит смелый тайтл** при `build_hierarchy`/`update_node` (RFC-013): стрелки-пайплайны `→…→`, `+`-перечни, матрицы `a/b/c` / `×`, запятые-списки, impl/приёмка в скобках, >10 слов. `(RFC-NNN)` и одиночная стрелка-трансформ — ок. Пиши имя сразу правильно; детали — в description / requirements / дочерние ноды.
- **Description** — лидируй фактом по шаблону (см. [workflows.md → Description template](workflows.md)): что это · **Why** · **How/acceptance** · **Source**. Title = «о чём в строку», doc = «как именно» (Workflow C).
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
