---
name: recursive-context
description: 'Use when an input is too big to read wholesale and must be decomposed programmatically before reading — a multi-MB log, data dump, or very long document/transcript ("разбери этот лог на 200МБ", "analyze this huge dump", "выжми транскрипт"), or a whole-repo comprehension task — аудит кодовой базы, сбор требований/фактов из репозитория ("проведи аудит репо", "собери требования из кода", "audit this codebase"). Fires BEFORE reading the artifact — check size first. Also fires for symbol-impact questions across a codebase — "кто зовёт X", "что сломается при смене сигнатуры", "who calls X / what breaks if I change it". Fires too, regardless of size, whenever a code graph may be present (graphify-out/) and the task needs codebase understanding beyond one known file: оценка трудозатрат, планирование, ревью, «где реализовано X», онбординг-доки, написание CLAUDE.md (в т.ч. /init). Not for ordinary-size files, not for editing a few known files, not for running the same operation over N independent records/tickets.'
---

# recursive-context — programmatic decomposition of oversized inputs

## Overview

Дисциплина Recursive Language Models (arXiv:2512.24601) нативными средствами Claude Code: oversized-вход — это **внешняя среда, а не содержимое промпта**. Индексируй его кодом, раздай изолированным суб-агентам по кускам, рекурсивно сворачивай агрегат до малого, потом синтезируй. Примитивы уже есть: `Bash` (детерминированная преднарезка), `agent()` в `Workflow` (изолированный суб-вызов = `rlm_query()`), `pipeline()`/`parallel()` (батчинг), `budget` (потолок затрат).

## Step 0 — code graph (ПЕРЕД размер-гейтом, одна команда)

Задача требует понимания кодовой базы шире одного известного файла? Сначала — есть ли готовый индекс:

```bash
[ -f graphify-out/graph.json ] && echo present || echo absent
```

`present` → **граф первым**: он закрывает фазу Discovery за секунды, до `grep`, до `Read`, до `Workflow`, до fan-out агентов. Полная дисциплина (freshness, карта запросов, verify регионами, bootstrap по согласию) — [references/code-graph.md](references/code-graph.md).

Проверка стоит один вызов `Bash` и не тащит контент в контекст. Не пропускай её на том основании, что задача «не выглядит как вопрос о кодовой базе»: оценка, планирование, ревью, аудит, онбординг-док, `/init` и «где реализовано X» — всё это Discovery по чужому коду, и все они этой проверке подлежат.

`absent` → размер-гейт ниже; на big-corpus задаче см. «Bootstrap по согласию» в том же референсе.

## The size gate (ВСЕГДА первым после Step 0)

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
| Big-corpus задача по коду ИЛИ impact-вопрос по символу («кто зовёт X», «что сломается») — граф есть или нет | всегда сверься с [references/code-graph.md](references/code-graph.md): presence/freshness/bootstrap; кандидаты из графа, факты — по файлам |

## Non-negotiables (для всех рецептов)

- **Index, don't ingest.** Границы чанков устанавливает код (`Bash`, в scratchpad), не чтение. Для needle-задач — сперва coarse-pass `grep`'ом: кандидаты влезли в разумный объём → вырежи и отвечай напрямую, fan-out не нужен.
- **Изоляция суб-агента.** Каждому — ТОЛЬКО его чанк + узкий вопрос; никакого контекста твоей сессии. Возврат строго по `opts.schema` — маленький структурный результат, не проза.
- **Рекурсия = цикл.** `workflow()` не вкладывается глубже одного уровня — recurse выражай loop-until-small внутри ОДНОГО скрипта.
- **Гейт Workflow пройден.** Инструкции этого скила явно велят звать `Workflow` — это легитимный opt-in, ultracode не нужен.
- **Budget + честность.** Задан бюджет — `budget.remaining()` ограничивает глубину/ширину; любое усечение покрытия — в `log()`. Никаких silent caps: в финальном ответе — сколько чанков обработано и что пропущено.
- **Фолбэк.** Workflow недоступен/неуместен → параллельные plain `Agent`-вызовы (fresh, НЕ fork), та же дисциплина, без `pipeline()`/`budget`.

## Red flags — СТОП, ты нарушаешь дисциплину

- «Сначала просто прочитаю файл, чтобы понять» (размер-гейт — первым)
- «Это же не вопрос о кодовой базе, а оценка / план / ревью / доки» — Discovery по чужому коду есть в каждой из них; Step 0 подлежит выполнению
- Разослал агентов грепать структуру проекта, не проверив `graphify-out/graph.json`
- «Прочитаю первые 100КБ, наверное хватит»
- Читаешь чанки сам вместо диспатча агентов
- Промпт суб-агента тащит контекст твоей сессии
- Суб-агенты возвращают прозу вместо schema
- В ответе нет покрытия («обработано X из Y чанков»)
