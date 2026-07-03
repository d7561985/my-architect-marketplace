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

const partials = (await pipeline(
  groups,
  (g, _orig, i) => agent(
    `Read ONLY these files: ${g.join(', ')}. Question: ${args.question}. ` +
    `Report every relevant finding with an exact supporting quote. If nothing relevant, return empty findings.`,
    { label: `map:${i}`, phase: 'Map', schema: FINDING }
  ),
)).filter(Boolean)

phase('Reduce')
let working = partials.flatMap(p => p.findings)
log(`map produced ${working.length} findings`)

// loop-until-small: рекурсия выражена циклом, НЕ вложенным workflow()
while (JSON.stringify(working).length > 30_000) {
  if (budget.total && budget.remaining() < 20_000) {
    log(`budget floor hit — stopping with ${working.length} unmerged findings`)
    break
  }
  const parts = []
  for (let i = 0; i < working.length; i += 40) parts.push(working.slice(i, i + 40))
  log(`reducing ${working.length} findings in ${parts.length} groups`)
  working = (await parallel(parts.map((part, i) => () => agent(
    `Merge these findings for the question "${args.question}": dedupe, keep evidence and chunk paths, drop irrelevant. ` +
    `Findings: ${JSON.stringify(part)}`,
    { label: `reduce:${i}`, phase: 'Reduce', schema: FINDING }
  )))).filter(Boolean).flatMap(p => p.findings)
}

return { findings: working, chunksProcessed: args.chunks.length, groups: groups.length }
```

## Точки адаптации

- **`FINDING`** — форма результата под задачу (для repo-audit: `{module, purpose, key_apis, risks, facts}`).
- **`question`** — узкий и конкретный; агент чанка не знает контекста сессии.
- **`batch`** — крупнее чанки → меньше batch (агент читает 100–300 КБ суммарно).
- **Порог 30_000** — «агрегат достаточно мал для синтеза»; при занятом окне — ниже.
- **`parallel` внутри цикла — легитимный барьер:** следующему раунду reduce нужны ВСЕ результаты предыдущего.
