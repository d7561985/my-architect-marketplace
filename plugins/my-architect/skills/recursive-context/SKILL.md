---
name: recursive-context
description: 'Use when an input is too big to read wholesale and must be decomposed programmatically before reading — a multi-MB log, data dump, or very long document/transcript ("разбери этот лог на 200МБ", "analyze this huge dump", "выжми транскрипт"), or a whole-repo comprehension task — аудит кодовой базы, сбор требований/фактов из репозитория ("проведи аудит репо", "собери требования из кода", "audit this codebase"). Fires BEFORE reading the artifact — check size first. Not for ordinary-size files, not for editing a few known files, not for running the same operation over N independent records/tickets.'
---

# recursive-context — programmatic decomposition of oversized inputs

## Overview

Дисциплина Recursive Language Models (arXiv:2512.24601) нативными средствами Claude Code: oversized-вход — это **внешняя среда, а не содержимое промпта**. Индексируй его кодом, раздай изолированным суб-агентам по кускам, рекурсивно сворачивай агрегат до малого, потом синтезируй. Примитивы уже есть: `Bash` (детерминированная преднарезка), `agent()` в `Workflow` (изолированный суб-вызов = `rlm_query()`), `pipeline()`/`parallel()` (батчинг), `budget` (потолок затрат).

## The size gate (ВСЕГДА первым)

До чтения ЛЮБОГО потенциально большого артефакта:

1. `ls -la <path>` / `wc -l <path>` (файл) или `git ls-files | wc -l` + `du -sh` (репо) — дёшево, контент через контекст не течёт.
2. **Ниже порога** (≤256 КБ И ≤5000 строк) — читай нормально, этот скил не применяется.
3. **Выше порога** — или задача класса «понять репозиторий целиком» — выбирай рецепт ниже. НЕ читай артефакт в лоб; проба структуры — максимум `head`/`tail` на ≤50 строк суммарно.

Порог — стартовый дефолт; правь его осознанно (например, окно уже частично занято → порог ниже).

## Recipe map

| Вход | Рецепт |
|---|---|
| Один огромный файл: лог, дамп, транскрипт, документ | [references/giant-file.md](references/giant-file.md) |
| «Пойми / проаудируй репозиторий целиком» | [references/repo-audit.md](references/repo-audit.md) |
| Факты из кода для требований / гейта инициатив | [references/requirements-mining.md](references/requirements-mining.md) |
| Канонический Workflow-скрипт (его адаптируют все рецепты) | [references/map-reduce-workflow.md](references/map-reduce-workflow.md) |
| В репо есть локальный граф кода (`graphify-out/graph.json`) | сперва [references/code-graph.md](references/code-graph.md): кандидаты из графа, факты — по файлам |

## Non-negotiables (для всех рецептов)

- **Index, don't ingest.** Границы чанков устанавливает код (`Bash`, в scratchpad), не чтение. Для needle-задач — сперва coarse-pass `grep`'ом: кандидаты влезли в разумный объём → вырежи и отвечай напрямую, fan-out не нужен.
- **Изоляция суб-агента.** Каждому — ТОЛЬКО его чанк + узкий вопрос; никакого контекста твоей сессии. Возврат строго по `opts.schema` — маленький структурный результат, не проза.
- **Рекурсия = цикл.** `workflow()` не вкладывается глубже одного уровня — recurse выражай loop-until-small внутри ОДНОГО скрипта.
- **Гейт Workflow пройден.** Инструкции этого скила явно велят звать `Workflow` — это легитимный opt-in, ultracode не нужен.
- **Budget + честность.** Задан бюджет — `budget.remaining()` ограничивает глубину/ширину; любое усечение покрытия — в `log()`. Никаких silent caps: в финальном ответе — сколько чанков обработано и что пропущено.
- **Фолбэк.** Workflow недоступен/неуместен → параллельные plain `Agent`-вызовы (fresh, НЕ fork), та же дисциплина, без `pipeline()`/`budget`.

## Red flags — СТОП, ты нарушаешь дисциплину

- «Сначала просто прочитаю файл, чтобы понять» (размер-гейт — первым)
- «Прочитаю первые 100КБ, наверное хватит»
- Читаешь чанки сам вместо диспатча агентов
- Промпт суб-агента тащит контекст твоей сессии
- Суб-агенты возвращают прозу вместо schema
- В ответе нет покрытия («обработано X из Y чанков»)
