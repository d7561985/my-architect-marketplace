# Канонический map-reduce Workflow-скрипт

Скопируй, адаптируй точки ниже и передай в тул `Workflow` через `script` (+ `args`). Предусловие: чанки уже лежат на диске — их режет main loop через `Bash` (скрипты Workflow не имеют доступа к ФС; агенты внутри — имеют).

```javascript
export const meta = {
  name: 'recursive-context-map-reduce',
  description: 'Fan out sub-agents over pre-cut chunks, reduce until small',
  phases: [
    { title: 'Map', detail: 'one agent per chunk group' },
    { title: 'Reduce', detail: 'merge partials until the working set is small' },
  ],
}

// args = { chunks: ['/abs/path/chunk-000', ...], question: 'что извлекать', batch: 3 }
const FINDING = {
  type: 'object',
  properties: {
    findings: { type: 'array', items: { type: 'object', properties: {
      claim:    { type: 'string' },   // одна конкретная находка/фрагмент ответа
      evidence: { type: 'string' },   // точная цитата или ссылка на строку внутри чанка
      chunk:    { type: 'string' },   // путь чанка-источника
    }, required: ['claim', 'evidence', 'chunk'] } },
  },
  required: ['findings'],
}

phase('Map')
const B = args.batch || 3
const groups = []
for (let i = 0; i < args.chunks.length; i += B) groups.push(args.chunks.slice(i, i + B))
log(`${args.chunks.length} chunks in ${groups.length} groups`)

// не .filter сразу: pipeline сохраняет порядок, null на месте упавшей группы —
// это единственный способ узнать, ЧТО именно не покрыто
const rawPartials = await pipeline(
  groups,
  (g, _orig, i) => agent(
    `Read ONLY these files: ${g.join(', ')}. Question: ${args.question}. ` +
    `Report every relevant finding with an exact supporting quote. If nothing relevant, return empty findings.`,
    { label: `map:${i}`, phase: 'Map', schema: FINDING }
  ),
)
const partials = rawPartials.filter(Boolean)
const failedGroups = rawPartials.map((r, i) => (r ? -1 : i)).filter(i => i >= 0)
if (failedGroups.length) log(`map groups FAILED: [${failedGroups.join(', ')}] — их чанки НЕ покрыты`)

phase('Reduce')
let working = partials.flatMap(p => p.findings)
log(`map produced ${working.length} findings`)

// loop-until-small: рекурсия выражена циклом, НЕ вложенным workflow().
// Гарантия терминации: если раунд не уменьшил агрегат — выходим (reduce-агенты
// могут легитимно вернуть столько же находок, сколько получили).
let prevSize = Infinity
while (JSON.stringify(working).length > 30_000) {
  const size = JSON.stringify(working).length
  if (size >= prevSize) { log(`reduce made no progress (${size} chars) — stopping with ${working.length} findings`); break }
  prevSize = size
  if (budget.total && budget.remaining() < 20_000) {
    log(`budget floor hit — stopping with ${working.length} unmerged findings`)
    break
  }
  const parts = []
  for (let i = 0; i < working.length; i += 40) parts.push(working.slice(i, i + 40))
  log(`reducing ${working.length} findings in ${parts.length} groups`)
  const rawReduced = await parallel(parts.map((part, i) => () => agent(
    `Merge these findings for the question "${args.question}": dedupe, keep evidence and chunk paths, drop irrelevant. ` +
    `Findings: ${JSON.stringify(part)}`,
    { label: `reduce:${i}`, phase: 'Reduce', schema: FINDING }
  )))
  const okReduced = rawReduced.filter(Boolean)
  if (okReduced.length < rawReduced.length) log(`${rawReduced.length - okReduced.length} reduce agents failed — до ${(rawReduced.length - okReduced.length) * 40} находок потеряно (учтено в отчёте)`)
  working = okReduced.flatMap(p => p.findings)
}

return {
  findings: working,
  chunksTotal: args.chunks.length,
  groupsTotal: groups.length,
  groupsSucceeded: partials.length,
  failedGroups,
}
```

## Точки адаптации

- **`FINDING`** — форма результата под задачу: для repo-audit `{module, purpose, key_apis, risks, facts}`; для requirements-mining `{claim, evidence_path, confidence}` — там `evidence_path` это путь файла в репозитории (не путь чанка), и reduce-промпт правь соответственно («keep evidence paths»).
- **`question`** — узкий и конкретный; агент чанка не знает контекста сессии.
- **`batch`** — крупнее чанки → меньше batch (агент читает 100–300 КБ суммарно).
- **Порог 30_000** — «агрегат достаточно мал для синтеза»; при занятом окне — ниже.
- **Reduce-партии по 40** — счётчик по умолчанию; при длинных evidence-цитатах режь по суммарному размеру (~20–30 КБ JSON на партию), иначе reduce-промпт разбухает.
- **`parallel` внутри цикла — легитимный барьер:** следующему раунду reduce нужны ВСЕ результаты предыдущего.
- **Покрытие честно:** `failedGroups` из результата обязан попасть в финальный ответ пользователю («обработано X из Y групп, не покрыты: …») — молчаливое сужение покрытия запрещено SKILL.md.
