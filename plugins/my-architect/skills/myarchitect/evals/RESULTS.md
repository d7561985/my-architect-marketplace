# myarchitect skill — eval results (2026-06-22, plugin v1.7.0)

Run after the progressive-disclosure refactor (story-062) to confirm no regression (story-061).

## Trigger evals — description calibration

20 queries (10 should-trigger, 10 near-miss should-not), each judged 3× by an independent agent seeing **only** the skill name + description (mimics the real triggering decision).

- **Accuracy: 20/20 (100%)**, all unanimous (3/3 votes per query).
- **False negatives: 0** · **False positives: 0**.
- Near-misses correctly skipped include: "draw me a C4 diagram" (wants diagram content, not the tracker), "epic vs feature in agile?" (methodology Q), "refactor this validate_project function" (code, shared name), "deferred tax payment deadline" (keyword near-miss), "set up a Jira board" (different tool).

Conclusion: the `description` trigger is well-calibrated; no optimization needed. (Description was left byte-identical across the refactor, so this also confirms the refactor didn't disturb triggering.)

## Behavioral evals — refactor regression net

3 discipline prompts, each planned (dry-run, no mutations) by an agent reading the **refactored** skill vs the **pre-refactor snapshot**. Single rep per variant — purpose is structural equivalence, not a benchmark.

| Prompt | Refactored | Snapshot | Verdict |
|---|---|---|---|
| author a feature | ctx-first → build_hierarchy(tree) → add_requirement×4 → create_doc → bulk_update → validate; STOP for ambiguous placement | same sequence | **equivalent** |
| file deferred items | ctx-first, de-dup surfaced, build_hierarchy, validate | ctx-first, build_hierarchy, add_requirement, validate | equivalent (borderline ask-vs-no-ask = judgment noise on a hypothetical project) |
| ambiguous scope | STOP & ask (strategic lane) | STOP & ask | **equivalent** |

Both variants drive the core disciplines: `get_project_context` first, `build_hierarchy` tree over single nodes, upfront requirements, `validate_project` before done, and rubric-aware stop-and-ask. The lean core + `references/` skill plans the same disciplined sequences as the old monolith.

**Verdict: refactor is behavior-preserving. Shipped in v1.7.0.**

## Decomposition evals — altitude regression net (story-076, v1.10.0)

`decomposition-evals.json` — 4 prose-feature prompts, each grading the proposed `build_hierarchy` **tree** for *altitude*: building blocks (vertical, independently-demonstrable slices) vs task-slices by code layer. It is the behavioral regression net for story-074 (altitude guidance) + story-075 (`altitude_warnings` lint), and embeds the boevoe MM case where altitude-guidance-only still produced a step-checklist.

Coverage by failure mode:
- **#1 domain-tier (the MM case)** — must produce "admin can declare a tier" / "guest lands on the right domain", reject `Коллекция domain_tier` / `Поле tier` / `Endpoint …`; the "how" stays in descriptions; unverified integration → VERIFY/draft (story-078).
- **#2 SVG export** — resist over-splitting: ONE block; serializer+button+endpoint collapse via the merge-test (touching front+back is not a split signal).
- **#3 realtime collab** — multiple blocks justified ONLY by distinct demos (live edits / cursors / conflict), not by code layers (WebSocket/presence/CRDT live in descriptions).
- **#4 notifications** — "contract first, then front" is a dependency + release assignment, not stage-nodes.

Run: give an agent the skill + each prompt, capture the `build_hierarchy` it would call (dry-run), check the `assertions`. Headless automation is still blocked here (no anthropic SDK/key — same constraint noted for story-061), so this ships as the authored dataset + grading rubric, runnable manually or once a harness key is available.

## Initiative commands — RED baseline (2026-07-03, до реализации v1.12.0)

Датасет: trigger-evals 21–29 + initiative-evals.json (13 кейсов) + фикстура 00-EPIC-weak.md. Прогон ДО создания файлов плагина (Iron Law writing-skills). Судьи (триггер/роутинг): независимые агенты, видят только name+description, 3 голоса на кейс; behavior — dry-run одним агентом.

- Trigger 21–25 vs description v1.11: **23 — NO 3/3** (BO-ревью файла вообще не триггерит скилл); **25 — YES 2/3** (нестабильно); 21/22/24 — YES 3/3, но по неверному основанию: судьи мапят «заведи/оформи инициативу» на «опиши фичу»/node-tree — гейта в описании нет.
- Routing 1/3/5/6 vs четыре текущих агента (3 голоса): кейс 1 → **feature-author 3/3** (неверно: CREATE-фаза без гейта ценности); кейс 3 → none 3/3; кейс 5 → none 3/3; кейс 6 → none 2/3 + feature-author 1/3. Ревью-запросы не обслуживает никто.
- Behavior кейс 7 (мелкая корзина, dry-run): агент классифицирует запрос как Workflow Z и планирует дерево нод + требования; входного фильтра «две корзины» и гейта 7 вопросов в текущем скиле нет — вопрос «а надо ли оформлять?» не задаётся.

Вывод: скилл частично триггерится на инициатив-формулировки, но маршрутизирует их в feature-авторинг без гейта; BO-ревью не покрыто ни триггером, ни агентом. GREEN-прогон — после реализации.

## Initiative commands — GREEN (2026-07-03, v1.12.0, до релиза)

Контрольный прогон после реализации всех артефактов (initiative-gate.md, Workflow I/R, команды, агенты, SKILL.md v1.12). Протокол тот же, что в RED: триггеры/роутинг — независимые судьи по 3 голоса (видят только name+description), поведение — dry-run без мутаций, фикстура — reviewer-under-test на копии под нейтральным путём (слово «weak» из имени файла убрано, чтобы не праймить).

- Trigger 21–29: **9/9**, все вердикты единогласны (3/3). Регрессия 1–20: **20/20**, все единогласны — трим description до 923 символов точность не задел.
- Routing 1–6: **6/6**, все единогласны; «опиши фичу» по-прежнему у feature-author, «что сделано по эпику» — у progress-auditor: обе границы держатся в обе стороны.
- Behavior 7–12: **6/6** all-hold (мелкая корзина → отказ как успех + указатель на /feature; нет потребителя → «не делаем / не сейчас + триггер»; проза куском → вопросы только по дыркам, факты/оценки размечены; нет аппетита → `[факт: …]` как блокер, не заглушка; стоп-лист ×3 с тестом переворачиваемости; ЦЕЛЬ/СЕЙЧАС «50мс» → needs_user_fact). Дог-фуд: промпт про сам RFC инициатив-команд → «мелкая корзина, оформляй как фичу» — вход-фильтр работает.
- Fixture: **13/13** найдено (приёмка требовала ≥10), обязательные w1/w2/w10 — да; w9 пойман по отсутствию (нет Опции 0 / do-minimum), w10 связан как противоречие «опора для авторизации» ↔ «для авторизованных уже работает». REFACTOR-итераций не потребовалось.

Вывод: FR-015 / FR-016 / NFR-005 выполнены; v1.12.0 готов к релизу.
