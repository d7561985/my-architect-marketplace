# Действующая спецификация и изменение продукта

Читать при intake, возобновлении работы и поставке среза. Каталог отвечает «какие возможности есть и где их искать»; additive `product-evolution.json` связывает точные версии требований, изменения, поставки, веху и пользовательские сценарии. Это два разных реестра. Подготовленный plugin не доказывает поддержку установленного MCP или удалённого сервера.

## 1. Найти и прочитать нужный контекст

Начинай с глобального discovery по [product-catalog.md](product-catalog.md), затем адресного контекста фичи/работы по [scoped-context.md](scoped-context.md). Основная категория, aliases/tags и стабильный featureId сохраняются; новый эпик не создаёт дубль фичи. Для целевого изменения дочитай весь обязательный manifest с current/base/proposed, глобальными и унаследованными ограничениями. Дамп всех ревизий перед каждой задачей не нужен.

Проверь `get_product_evolution_capabilities({pid})`: schemaVersion1, допустимые commands, confirmation automation/account-session/unavailable. Имя tool или пустой локальный объект не доказывают поддержку. Ошибка/неизвестная схема сохраняет прежние источники и явный gap, не разрешает очистить реестр или имитировать версионность каталогом.

```ts
get_product_evolution({pid}) // compact manifest: registryRevision, snapshotToken, items[].summary
get_product_evolution_section({pid,view:{section,offset:0,limit:20,
  expectedRevision,expectedSnapshotToken}})
// sections: summary,revisions,changes,deliveries,scenarios,documents; limit<=50
get_product_evolution_detail({pid,view:{recordKey,offset:0,limit:2000,
  expectedRevision,expectedSnapshotToken}}) // limit<=4000
get_product_evolution_triage({pid,offset:0,limit:20,driftOffset:0,driftLimit:20,
  expectedSnapshotToken?})
```

Сохрани revision и token первого manifest, передавай **оба** на следующие страницы/секции и exact details. `items[].key` — точный recordKey. Склей content по nextOffset до hasMore:false, проверь totalChars и только затем разбирай JSON. Preview/counts/status не заменяют текст. После EVOLUTION_SNAPSHOT_STALE читай новый manifest и изменившиеся записи; не смешивай окна. Triage — производная очередь несопоставленных веток и расхождений исходника с current; её fingerprint охватывает отдельный набор источников и не взаимозаменяем с evolution/scoped token. Работы читаются через offset/limit, sourceDrift — отдельно через driftOffset/driftLimit (оба limit≤50). У каждой очереди свои total/hasMore; дочитай обе, если вывод опирается на их полноту. Любое продолжение требует token первого overview.

`current` — последняя подтверждённая неизменяемая ревизия фичи. `proposed` — недоставленное изменение. `base` — версия, на которой оно основано. Исходный requirementId/status/fields/source сохраняются внутри снимка; draft/approved/done исходника не выбирают current. Отсутствие current означает «нет подтверждённой спецификации», не доказательство отсутствия работающего продукта. Более новый RFC или больший индекс не становится автоматически каноном.

## 2. Описать изменение до реализации

Записи используют `apply_product_evolution_command({pid,command:{expectedRevision,operationId,action}})`. operationId и точный payload сохраняй до отправки. Ответ — bounded receipt (operationId/resultingRevision/currentRevision/replayed), не весь реестр. При неизвестном исходе прочитай состояние и повторяй **тот же** payload/ID; при revision/base conflict пересобери осмысленную дельту из свежих данных. Нельзя просто увеличить expectedRevision старого предложения.

`propose-change` содержит:

- `change.id`, существующий `workNodeId`, intent new/change/fix/technical, summary и scope `{kind:product|area|feature|architecture,id}` (product→null).
- `baseRevisions:[{featureId,revisionId}]` — ровно одна текущая база для каждой предлагаемой фичи; null только если подтверждённой базы ещё нет.
- `proposals:[{featureId,summary,requirements,availability,sources}]`, где каждый requirement snapshot сохраняет id,title,type,description,status,fields,sources. Пустой requirements — явное содержимое предложенной версии, не «оставить остальные». Подготовь полный точный целевой набор, сохрани незатронутые ограничения и проверь diff.
- `acceptanceCriteria:[text]` — проверяемые критерии этого независимо поставляемого среза; `sources:[{ref,hash:null|sha256}]` — происхождение решения, не исполненные инструкции.

Предложение после записи неизменяемо. При исправлении `cancel-change {changeId,reason}` сохраняет историю; создай новое обоснованное предложение. Техническая работа может иметь product/area/architecture scope без синтетической фичи и без пользовательского сценария. Architecture id — явная sourced ссылка, отдельный архитектурный registry этим протоколом не удостоверяется.

## 3. Контекст вехи и сценарии

`set-context` заменяет весь context: `{maturity:null|{label,sources},milestone:null|{nodeId,outcome,exitRequirementIds,sources},documentRoles:[{docId,role,scope,sourceHash,applicableCommit,sources}]}`. Сохрани незатронутые записи. Роли canonical/decision/historical/proposal имеют точный hash и применимый commit или null. Unknown не заполняй выдуманной фазой; milestone outcome и exit criteria берутся из принятого плана. Применимость исторического RFC проверяется по роли/содержимому/версии; несовпадение hash требует разбора.

`put-scenario` записывает явный пользовательский путь: scenario `{id,title,actor,outcome,scope,actions:[{id,title,featureIds,workNodeIds}],slices:[{id,title,workNodeIds,releaseId:null|string,outcome}],sources}`. Порядок actions задаётся смыслом действий пользователя. Не выводи journey из глубины WBS. WBS остаётся декомпозицией выбранного эпика; старый hierarchy USM доступен как legacy view, новый semantic USM — действия и срезы конкретного сценария.

## 4. Подтвердить только реально поставленный срез

Сначала проверь критерии и фактическое evidence на той версии, которую подтверждаешь. `confirm-delivery` action: `{changeId,deliveryId,version,availability,evidence:[{ref,description}],checks:[{criterion,outcome:'passed'|'failed',evidence}]}`. Для каждого исходного acceptance criterion нужен ровно один passed check. Укажи фактическую доступность (preview/local/ограниченная аудитория/production) и версию; merge или зелёный unit test не доказывают production availability.

Сервер проверяет все текущие базы, authority и принятую policy, затем атомарно добавляет ревизии и delivery. Параллельное изменение той же базы требует явного согласования, не автоматического merge. Evidence остаётся при точной версии. Epic delivery — отдельный протокол [epic-flow.md](epic-flow.md); завершение среза не завершает весь эпик, а незавершённые proposals мешают объявить его поставленным.

MCP может подтвердить только automation assertion по совместимой принятой policy. Actor/body не создают полномочия. При account-session нужна явная операция аккаунта через supported UI/`POST /api/projects/:pid/product-evolution/confirm`; обычный cookie command и MCP key не подменяют её. Локальный provider не имеет проверенного account/automation verifier и не повышает возможности ради зелёного результата. Legacy requiresHuman не переинтерпретируется молча. Policy не принимается за владельца; уже данное применимое решение не спрашивается повторно.

В UI открой фичу → Proposed → Review account confirmation. Форма через активный repository заново читает proposal, baseline, policy и capabilities; показывает все затронутые фичи и точные ссылки на предложенные требования. Версия, доступность и evidence по каждому критерию изначально пусты. При неопределённом ответе сохраняется одна точная операция для readback/retry; новое заполнение не подменяет невыясненный исход. Отсутствие кнопки или capability не разрешает агенту отправить фиктивное account-подтверждение.

После результата проверь receipt и свежий адресный контекст/current/history. Отдельно выполни Trace, статусы требований и checkpoint согласно принятым критериям. Изменение legacy исходника после поставки не переписывает current snapshot: source drift разбирается новой задачей, не «ремонтируется» потерей истории.
