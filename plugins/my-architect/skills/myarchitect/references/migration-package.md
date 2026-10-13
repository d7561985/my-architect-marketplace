# Проверяемый пакет перехода: review → apply → verify → rollback

Используй для порученной организации проекта либо additive adoption унаследованных сопоставлений в scope текущей задачи по [границе маршрутов](../SKILL.md#граница-обычной-записи-и-adoption). Отдельный запрос «мигрируй» не обязателен. Новая обычная дельта в уже разобранной области не требует повторной миграции; пустой current у явно новой proposed-фичи не является legacy-пробелом. Init сам по себе не разрешает массово переделать проект, а read-only поручение не разрешает prepare/apply. Этот протокол дополняет [сохранение сервера](migration-backup.md), [локальные источники](local-migration-sources.md) и [dry-run](product-migration.md). Старый bounded audit остаётся `canApply:false` — его результат не становится пакетом автоматически.

## Проверка возможностей и источников

1. Установи точный `pid`. Вызови `get_migration_package_capabilities({pid,protocolVersion:2})` и проверь **ответ backend**, а не только наличие имени инструмента. Отсутствие инструмента, `supported:false`, 404, невалидный JSON, неизвестная схема или отсутствие private storage останавливают зависимые миграционные записи; не обходи это `replace_product_catalog`, ручным JSON или старым sync/doctor. Сохрани точное ограничение и продолжай независимую разрешённую работу. Текущий протокол поддерживает **один серверный процесс**, который обслуживает всех согласованных writers. Несколько серверов и прямые записи файловой системы не защищены этим fence. Это ограничение deployment, не недостаток, который агент вправе молча игнорировать.
Для automation нужны `schemaVersion:2`, `reviewAuthority:authenticated-principal`, `reviewModes` с `automation` и `automationGuards:{affectedSources:true,accountReviewHolds:true}`. Отсутствующий `protocolVersion`/v1 сохраняет старый account-only ответ. Неизвестная v2 не разрешает удалить mode и применить пакет другим путём. Совместимый v1 допускает старый account-session процесс при действительном выборе этого режима, но не impersonation и не скрытый downgrade. Capability удостоверяет поддержку, а не поручение на live-миграцию.

2. Сохрани и свежо проверь полный server-project backup по прежнему протоколу. У пакета `serverBackup:{operationId,manifestDigest}`; backend сверяет raw manifest с текущим серверным деревом при prepare и повторно проверяет backup при apply. Успешная вчерашняя проверка не оправдывает повреждённый сегодня blob.
3. Собери **все записи объявленных источников**, сохранив исходные файлы отдельно. `.architect`, curated/retained, тестовые ссылки, CI и другие объявленные roots не подменяются удобной выборкой. Полнота одного root не означает полноту продукта. Скрипты источников не исполняются. Test-reference — ссылка/аннотация, а не результат выполнения теста. Сохраняй каждый физический вариант одного ID с source ID, точным pointer и digest; ни сервер, ни индекс не выигрывают автоматически.
4. Metadata источников передаётся только в разрешённый проект/среду. Локальные receipts имеют уровень **verified-client**, не server-verified. Private raw paths/credentials не помещаются в label/reference/публичный отчёт. Отсутствующие источники получают missing/unavailable и отдельный остаток. Передача нового private source на сервер — отдельное действие в рамках действительного поручения, не подразумеваемое read-only inventory.

## Подготовка конкретного diff

Прежде чем предложить новый ID: прочитай существующее дерево областей и выполни **глобальный** поиск по названию, aliases/tags и другим веткам. Пустая scoped выдача не разрешает дубликат. Названия и глубина областей выводятся из возможностей и языка конкретного продукта; отраслевые примеры не являются обязательной схемой. Сквозная утилита получает одно основное размещение и отдельные теги/aliases, не копии в каждой категории. Перемещение сохраняет feature ID и связи.

```ts
prepare_migration_package({pid, package:{
  reviewMode:'automation', // только после actual v2 discovery; отсутствие = legacy account-session
  packageId, // один стабильный ID; повтор допустим только для точного того же запроса
  scope:{label,nodeIds,completeProject:false},
  sources:[{id,kind,label,reference,status,sha256,recordCount,
    verificationReference?,excludedScopes:[]}],
  records:[{key,sourceId,kind,id,pointer,payloadDigest,contentReference}],
  proposals:[{id,sourceRefs,role,featureIds,rationale,status}],
  catalog: ProductCatalogContentV2,
  rationale, unresolved:[{recordKey,reason}], flatReason?,
  sourceBindings?:[{source,recordKeys,reason}], // только после actual v3 discovery
  serverBackup:{operationId,manifestDigest}
}})
```

Вход имеет отдельный явный предел **16 MiB / 100 000 metadata records / 2 000 000 traversed JSON nodes / depth 40**. Это не расширяет bounded audit v1. Несоответствие `recordCount`, дублирующий key, несуществующий sourceRef и превышение границ — ошибка, не основание усечь список и назвать его полным. Source `kind` описывает фактически прочитанный вид; название не доказывает поддержку парсера. Status: `verified-client | captured-client | missing | unavailable | not-applicable`.

`proposals.role`: `product-feature | change | history | constraint | unresolved`; `status`: `proposed | conflict`. `sourceRefs` содержит точные `records[].key`, а не source ID или выдуманный URI. Каждый новый area/feature имеет собственное основание, разрешающееся в inventory. Все старые ID сохраняются. Local-only requirement не добавляется в серверный `requirementIds`, пока поддерживаемый серверный resolver его не знает: происхождение/остаток сохраняются отдельно, новая битая ссылка не является переносом.

Кандидат содержит вложенные `parentId`, primary `areaId`, отдельные aliases/tags и stable IDs. Всё во flat/Unclassified не считается законченной классификацией. Простому продукту допустима обоснованная малая глубина через `flatReason`; это объяснение структуры, не факт поставки продукта. Существующая accepted classification не переносится на изменившуюся смысловую границу автоматически. У pending migration package можно явно предложить target `classification:accepted` для конкретных before/after: это запрашиваемый результат, который агент проверит в порученном scope либо передаст на account review. Prepare и authenticated review не изменяют каталог; accepted попадает в каталог только при apply после принятия exact digest. Если target оставлен proposed, apply не повышает его молча. Старый read-only audit по-прежнему требует proposed для новых/изменённых границ. Lifecycle новой фичи остаётся proposed независимо от принятия таксономии — это не доказательство поставки поведения.

### Старые текстовые ссылки каталога → проверяемые записи

Если `catalog.sources` содержит человеческую ссылку вместо exact recordKey, сначала прочитай её фактический исходник и объявленный inventory целиком. Вызови `get_migration_package_capabilities({pid,protocolVersion:3})`: нужны `schemaVersion:3`, `sourceBindings:'record-keys'` и прежние guards automation/holds. v1/v2 не менялись; unsupported/404/неизвестная v3 не разрешают пробный prepare, удаление поля или обход через raw catalog write. Наличие нового плагина не обновляет уже открытый MCP-процесс.

В optional immutable `sourceBindings:[{source,recordKeys,reason}]` поле `source` — **точный исходный текст** ссылки, `recordKeys` — непустой список точных `records[].key`, `reason` — проверенное основание соответствия. Исходный `catalog.sources` сохраняется: не заменяй текст фиктивным URI и не переписывай исторический источник. В bindings нет default, старый request без поля сохраняет прежний digest/replay. Нельзя переопределять существующий exact recordKey, повторять source или ключи, придумывать отсутствующую запись. Новое намеренное изменение bindings меняет immutable request; неизвестный исход требует чтения того же package ID и exact retry, а не нового package ID.

Однозначное соответствие в уже порученном scope агент устанавливает сам, используя принятое решение и фактически прочитанный источник; дополнительный вопрос владельцу для каждой ссылки не нужен. Если соответствие неоднозначно или исходник недоступен, не выбирай по совпадению заголовка: сохрани конкретный residual/вопрос и продолжай независимую часть. Это привязка происхождения, не доказательство выполнения требования и не новая authority.

Проверяй before **и** after, включая ссылку, удалённую из target, затронутые дочерние области и impacts. Binding не выбирает winning copy: весь объявленный physical inventory сохраняется, проверка включает identity/proposal closure и все объявленные варианты, даже с одинаковым содержимым. Conflicts, unresolved и account holds сохраняются; смена alias, package/feature ID их не отменяет. Серверная проверка недостающих вариантов остаётся по `(kind,id,payloadDigest)` — новая привязка сама по себе не доказывает наличие всех не объявленных идентичных физических копий. Полнота источников и сохранение raw originals остаются отдельной обязанностью.

Перед review дочитай `section:'sourceBindings'`, exact JSON windows при `truncatedFields`, весь соответствующий inventory и свежий `reviewBlockers`. Compact summary не достаточен для смыслового решения. Offline compose сохраняет эти поля после объединения полных inventory, сетевой prepare helper тоже требует actual v3, даже для account mode или пустого `sourceBindings:[]`. Не добавляй пустое поле в старые запросы ради косметики.

### Полные metadata без переписывания моделью

Семантический `plan.json` содержит все поля `package` из примера, включая `sources:[]`/`records:[]` для server metadata и явно отсутствующих источников. Это полная целевая карта с неизменёнными существующими записями, обоснованной дельтой и residual; helper не придумывает её.

Для server audit сохраняй точные record `key/sourceId/kind/id`, `payloadDigest = hash` прочитанного record, `pointer = key` как адрес audit record, `contentReference = server-audit:<snapshotToken>#<recordKey>`. Source сохраняет фактический id/kind/path/sha256; `reference = server-source:<relative path>`, `recordCount` равен числу всех включённых metadata данного source. Успешно прочитанный audit — `captured-client`, missing → `missing`, недоступный/пропущенный → `unavailable`; server backup проверяется отдельно. Не хешируй усечённый preview вместо исходного hash, не считай contentStatus вне scope прочитанным. В plan не помещаются private absolute paths. Сохрани исходный report/snapshot и exact details, чтобы адрес оставался проверяемым.

Полный local inventory получи по [local-migration-sources.md](local-migration-sources.md). Сохранённый metadata файл передаётся целиком; не копируй список из summary. Поставляемый helper соединяет его с планом **offline**:

```sh
node <plugin-root>/scripts/prepare-migration-package.mjs compose \
  --pid <точный-pid> --plan-file <абсолютный-private-plan.json> \
  --inventory-file <абсолютный-full-inventory.json> \
  --output-file <абсолютный-new-private-request.json>
```

Повторяй `--inventory-file` для разных объявленных roots; без локальных источников опусти флаг. Проверяются pid, exact inventoryDigest, counts, уникальные identities, sourceRefs/residual и пределы. Каждая physical variant сохраняется; conflict не дедуплицируется. `reviewMode` не добавляется по умолчанию. Выход `{pid,package}` — точный вход `prepare_migration_package`, не разрешение на применение. Входные файлы/родители private, без symlinks, regular input 0600; output эксклюзивный 0600, точный offline повтор идемпотентен. Источники и проект не изменяются, скрипты источников не исполняются.

Для небольшого запроса используй actual MCP prepare с этим полным содержимым. Когда metadata не помещается в надёжный tool input, отдельный явный сетевой шаг передаёт **сохранённый** файл без усечения:

```sh
node <plugin-root>/scripts/prepare-migration-package.mjs prepare \
  --request-file <абсолютный-private-request.json> \
  --output-file <абсолютный-new-private-prepared-result.json>
```

Это authenticated HTTP bridge существующего prepare API, не MCP вызов и не offline команда. Использует только настроенные `MA_API_URL`/`MCP_API_KEY` в окружении (shell может не наследовать MCP child env); не ищи чужие credentials. Перед POST проверяет actual capabilities выбранного режима. Запрос ограничен 16 MiB, каждый HTTP шаг 30 секундами, фактически прочитанный ответ 96 MiB; redirects запрещены, request/proposal hashes и точный pid/package проверяются, полный ответ хранится приватно, stdout содержит только compact receipt. Helper не review/apply/repair, не меняет mode при ошибке и не даёт authority через файл. При timeout сохрани input/output, прочитай тот же package ID через MCP до exact retry; новый output filename не означает новую logical operation.

Ответ prepare компактен. Дочитай полный diff, source coverage, конфликты и остаток:

```ts
get_migration_package({pid,packageId,expectedProposalDigest,expectedSnapshotToken,
  section:'summary'|'reviewHistory'|'sourceBindings'|'sources'|'records'|'reconciliation'|'residual'|'proposals'|
          'taxonomyChanges'|'areas'|'features'|'impacts'|'findings'|'auditGaps',
  offset:0,limit:10})
// при truncatedFields: тот же section и возвращённый detailIndex
get_migration_package({pid,packageId,expectedProposalDigest,expectedSnapshotToken,
  section,detailIndex,detailOffset:0})
// Собери exact JSON окна по nextOffset до null перед смысловым выводом.
```

Каждая страница возвращает `snapshotToken` и связана одним proposalDigest. После первого чтения передавай `expectedSnapshotToken` в следующие страницы и exact windows. Для изменяемых `summary`/`reviewHistory` continuation требует этот pin; изменение состояния возвращает `MIGRATION_PACKAGE_SNAPSHOT_CHANGED` вместо смешанного ответа, отсутствие обязательного pin — `MIGRATION_PACKAGE_SNAPSHOT_REQUIRED`. В таком случае начни чтение текущего состояния заново и не объединяй куски разных snapshots. Верхний summary также ограничен: `truncatedFields` явно отмечает сокращённые scope/receipts/verification, `counts` сохраняет полные количества, `detail` указывает section:'summary', detailIndex:0 для точных окон. Текущий review не заменяет всю `reviewHistory`; история читается отдельной секцией. Для действий закрепи operationId и повторно сверь состояние/receipt после дочитывания: proposalDigest удостоверяет неизменный замысел, snapshotToken отдельно закрепляет review/history/receipts/verification в ходе чтения. Unknown/missing не становятся matching от отсутствия текста. Сохрани baseline находок; прежние нарушения не маскируются изменением статусов или уменьшением тестового набора.

## Review в порученном scope и применение

Для нового automation package агент сам проверяет exact before/after, все затронутые источники и physical variants, основное размещение, ссылки, конфликты и остаток. Поручение мигрировать включает это решение без отдельного человеческого accept каждой области или пакета. Режим не создаёт полномочий из воздуха: проверь фактическое поручение, проект и границы источников. Не подставляй actor, имя человека или `humanApproved`.

Перед решением дочитай актуальный блокирующий остаток:

```ts
get_migration_package({pid,packageId,expectedProposalDigest,
  section:'reviewBlockers',offset:0,limit:20})
// {eligible,total,hasMore,blockers,snapshotToken,...}; limit<=20
// offset>0: expectedSnapshotToken из первого ответа ЭТОЙ секции
review_migration_package({pid,packageId,operationId,expectedReviewRevision,
  expectedProposalDigest,decision:'accept',reason})
// decision: accept | reject | defer; expectedReviewRevision = длина полной reviewHistory
```

`reviewBlockers` — свежая серверная оценка, её token отдельный от страниц immutable package. Это единственная секция с max20; остальные остаются max10. Сервер может уменьшить фактический limit по byte budget: следующий offset = текущий offset + blockers.length, не запрошенный limit. Дочитай все страницы; при смене snapshot начни assessment заново. `MIGRATION_PACKAGE_AUTOMATION_BLOCKED` возвращает bounded первую страницу details, а не полный остаток. Blocker codes различают `LEGACY_ACCOUNT_REVIEW_REQUIRED`, `AFFECTED_SOURCE_CONFLICT`, `AFFECTED_SOURCE_UNRESOLVED`, `AFFECTED_PROVENANCE_REQUIRED`, `AFFECTED_SERVER_VARIANT_MISSING`, `AFFECTED_SERVER_SOURCE_INVALID` и `ACCOUNT_REVIEW_HOLD`. Применимый конфликт, unresolved provenance или пропущенный доступный server variant блокирует затронутую часть; независимый исторический остаток сам по себе не запрещает другой чистый срез. Не скрывай источник и не меняй ID, чтобы искусственно вывести конфликт из scope. Сохрани спорную часть и сформулируй предметный вопрос; отдельно подготовь независимое изменение со всей его source closure.

Сервер устанавливает principal из настоящего credential: automation означает `kind:automation`, `assurance:credential-assertion`, `humanPresenceVerified:false`. Это честная атрибуция агента, не account review. Если `reviewMode` отсутствует либо равен `account-session`, MCP не может принять такой пакет: используй настоящий `reviewUrl`/`#/project/<pid>/migration/<packageId>` и supported account action. Legacy mode не меняют в существующем immutable request. Account endpoint сохраняет возможность review для обоих режимов.

Сохранённый account reject/defer защищает смысл и источники через новые package/feature IDs. Автоматика не разрешает такой hold. Account resolution относится к точному прежнему `packageId/proposalDigest/reviewRevision`; покажи это решение и его последствия в поддерживаемом UI. Не используй прямой HTTP, alternate writer или новую таксономию для обхода отказа. При неподтверждённом review сначала читай тот же package/history; exact operationId/payload повторяют без новых revision. Поздний reject не отменяется replay старого accept.

После successful review и в разрешённом scope:

```ts
apply_migration_package({pid,packageId,operationId,expectedProposalDigest})
verify_migration_package({pid,packageId})
```

Backend повторно проверяет источник, catalog revision, exact review, применимые conflicts/holds и backup под writer fence. Запись только additive catalog: старые дерево/описания/docs/diagrams/requirements/issues не переписываются. Каталог получает ровно target classification из reviewed diff; lifecycle/current/поставка не повышаются автоматически. `SOURCE_CONFLICT` требует свежего разбора и новой явно названной редакции с review, а не подмены expected revision. Account hold требует действительного разрешения account, а не повторного automation accept.

Успешная catalog verify — промежуточный результат. Продолжи [migration-adoption.md](migration-adoption.md): current/proposed/specs, активная очередь, полный адресный контекст и остаток через существующие отдельные команды. Общий запрос «организовать проект» не заканчивается одной картой, если эти шаги входят в порученный scope.

## Обрыв, повтор и откат

Перед mutation сохрани pid/packageId/proposalDigest/operationId и точный запрос в checkpoint. При timeout, invalid response или неизвестном результате **сначала** `get_migration_package` того же ID. GET согласует сохранённый журнал с before/after фактического каталога; не создавай новый ID и не повторяй prepare ради обхода неопределённости. Известный apply receipt возвращается до проверки сегодняшних источников. Даже после чужой более поздней работы потерянный ответ не создаёт второй commit.

`verificationCheck:not-performed` в GET — историческое состояние, а не свежая проверка. Explicit verify проверяет текущую own projection; более поздние изменения legacy-источников показаны отдельно от сохранности при commit. `passed` относится к этому пакету и объявленному scope, не ко всей истории/всем roots/поставленному поведению продукта.

```ts
rollback_migration_package({pid,packageId,operationId,expectedProposalDigest})
```

Rollback выполняется только по действительному поручению отменить пакет. Он обращает собственный diff: сохраняет чужие независимые записи, отказывает при изменении собственных объектов или новых ссылках из каталога, спецификаций/сценариев либо изменённых legacy-документов. Сохрани конфликт и покажи конкретный затронутый ID; не удаляй зависимость ради зелёного отката. Старый полный snapshot не накладывается поверх текущего проекта. Private workspace marker вне исходного project привязывает его к первоначальному journal/artifact root. Обычные catalog writers читают эту привязку после рестарта, даже если migration config отключён или изменён. Пропавший/невалидный связанный журнал блокирует запись; новый artifact root не обходит старый WAL (`STORAGE_BINDING_CONFLICT`). Marker и журнал не удаляются/не переносятся автоматически. Не редактируй private WAL/receipts/marker вручную; `RECOVERY_CONFLICT` останавливает затронутые catalog writes до разрешения.

Программный rollback отличается от отмены package: выключение UI не разрешает старому binary писать новый формат. Новый plugin + старый backend → read-only/unsupported без пробной мутации. Старый plugin + новый backend сохраняет отдельные sidecars и проходит обычные доменные guards. Если доступны только локальные/browser данные без compatible backend, remote package unsupported; сохрани источники/предложение и не заявляй серверный apply.

## Полный проверенный receipt → производный локальный sidecar

MCP намеренно возвращает компактные ответы. **Не создавай фиктивный полный package JSON из summary** и не заполняй отсутствующие baseline/authority поля вручную. Для явного экспорта полного результата используй поставляемый standalone helper (это сетевой шаг, отдельно от offline CLI):

```sh
node <plugin-root>/scripts/export-migration-package.mjs \
  --pid <точный-pid> --package-id <packageId> \
  --expected-proposal-digest <proposalDigest> \
  --output-file <абсолютный-приватный-файл.json>
```

Он использует уже настроенные `MA_API_URL`/`MCP_API_KEY`, выполняет только настоящий POST verify с `{}`, запрещает redirects, ограничивает время 30 секундами и реально прочитанный ответ 96 MiB. Никогда не печатай ключи/полный ответ ради отладки. Parent output folder уже существует с private permissions, каждый ancestor без symlink; файл создаётся эксклюзивно 0600. Export сохраняет full JSON, проверяет точные identity/digests и свежую прошедшую integrity check; полную структурную схему повторно проверяет offline runtime ниже. Не представляй helper как независимую аутентификацию сервера или локальный offline сбор.

Один файл хранит конкретный verification response. Точный повтор тех же bytes идемпотентен; новый verify обычно имеет новое время и требует **нового output filename**. Старый файл не перезаписывается. При неизвестном результате сначала проверь сохранённый output и package, не удаляй файл ради повторного вызова.

После разрешённого обновления производного `.architect`:

```sh
my-architect-mcp local-migration projection-source-digest --source-root <абсолютный-.architect>
my-architect-mcp local-migration projection \
  --pid <точный-pid> --source-root <абсолютный-.architect> \
  --expected-source-digest <sourceDigest-из-предыдущего-ответа> \
  --expected-proposal-digest <proposalDigest> \
  --input-file <полный-сохранённый-verify-response.json>
```

Эти две команды offline: они не обращаются к серверу и не запускают source scripts. Offline runtime повторно вычисляет immutable request/proposal hashes и производный inventory по полному содержимому; совпадение строк digest при изменённом diff недостаточно. Предел full projection input: 96 MiB, 8 000 000 JSON nodes, depth 50; превышение не усекать. Входной result должен иметь bound pid/digest, актуальный passed `verificationCheck` и соответствующий apply/rollback receipt. Новый `migration-projection-<packageId>-<operationId>.json` сохраняет **только собственный diff пакета**, provenance и предоставленную квитанцию; он не заменяет requirements-index/snapshot и не объявляет весь продукт мигрированным. Исходные retained/unknown файлы не переписываются. Drift между fingerprint и созданием, symlink, конфликтный/повреждённый существующий файл приводят к отказу. Точный повтор имеет `sourceCheck:not-performed`: это повтор ранее сохранённого результата, не новая проверка других источников. После rollback добавляется отдельная квитанция; старые не удаляются.

В checkpoint передай фактические receipts, SHA экспортированного полного ответа, local projection result, последнюю integrity check, scope coverage, конфликтующие варианты, неразобранные объекты, ссылки на принятые решения и следующий поддерживаемый вызов. Не сужай исходный тестовый набор и не выкидывай retained requirements из последующего обновления индексов.
