# Проверяемый пакет перехода: review → apply → verify → rollback

Используй только при поручении разобрать/перевести действующий проект. Обычная новая задача работает с адресным контекстом и существующей Product Map; не запускай миграцию при init. Этот протокол дополняет [сохранение сервера](migration-backup.md), [локальные источники](local-migration-sources.md) и [dry-run](product-migration.md). Старый bounded audit остаётся `canApply:false` — его результат не становится пакетом автоматически.

## Проверка возможностей и источников

1. Установи точный `pid`. Вызови `get_migration_package_capabilities({pid})` и проверь **ответ backend**, а не только наличие имени инструмента. `supported:false`, 404, невалидный JSON, неизвестная схема или отсутствие private storage означают отсутствие возможности записи; не обходи это `replace_product_catalog`, ручным JSON или старым sync/doctor. Текущий протокол поддерживает **один серверный процесс**, который обслуживает всех согласованных writers. Несколько серверов и прямые записи файловой системы не защищены этим fence. Это ограничение deployment, не недостаток, который агент вправе молча игнорировать.
2. Сохрани и свежо проверь полный server-project backup по прежнему протоколу. У пакета `serverBackup:{operationId,manifestDigest}`; backend сверяет raw manifest с текущим серверным деревом при prepare и повторно проверяет backup при apply. Успешная вчерашняя проверка не оправдывает повреждённый сегодня blob.
3. Собери **все записи объявленных источников**, сохранив исходные файлы отдельно. `.architect`, curated/retained, тестовые ссылки, CI и другие объявленные roots не подменяются удобной выборкой. Полнота одного root не означает полноту продукта. Скрипты источников не исполняются. Test-reference — ссылка/аннотация, а не результат выполнения теста. Сохраняй каждый физический вариант одного ID с source ID, точным pointer и digest; ни сервер, ни индекс не выигрывают автоматически.
4. Metadata источников передаётся только в разрешённый проект/среду. Локальные receipts имеют уровень **verified-client**, не server-verified. Private raw paths/credentials не помещаются в label/reference/публичный отчёт. Отсутствующие источники получают missing/unavailable и отдельный остаток. Передача нового private source на сервер — отдельное действие в рамках действительного поручения, не подразумеваемое read-only inventory.

## Подготовка конкретного diff

Прежде чем предложить новый ID: прочитай существующее дерево областей и выполни **глобальный** поиск по названию, aliases/tags и другим веткам. Пустая scoped выдача не разрешает дубликат. Узлы текст/видео/аудио — пример подходящих вложенных областей, не универсальный шаблон. Лор может иметь более широкую родительскую область. Сквозная утилита получает одно основное размещение и отдельные теги/aliases, не копии в каждой категории. Перемещение сохраняет feature ID и связи.

```ts
prepare_migration_package({pid, package:{
  packageId, // один стабильный ID; повтор допустим только для точного того же запроса
  scope:{label,nodeIds,completeProject:false},
  sources:[{id,kind,label,reference,status,sha256,recordCount,
    verificationReference?,excludedScopes:[]}],
  records:[{key,sourceId,kind,id,pointer,payloadDigest,contentReference}],
  proposals:[{id,sourceRefs,role,featureIds,rationale,status}],
  catalog: ProductCatalogContentV2,
  rationale, unresolved:[{recordKey,reason}], flatReason?,
  serverBackup:{operationId,manifestDigest}
}})
```

Вход имеет отдельный явный предел **16 MiB / 100 000 metadata records / 2 000 000 traversed JSON nodes / depth 40**. Это не расширяет bounded audit v1. Несоответствие `recordCount`, дублирующий key, несуществующий sourceRef и превышение границ — ошибка, не основание усечь список и назвать его полным. Source `kind` описывает фактически прочитанный вид; название не доказывает поддержку парсера. Status: `verified-client | captured-client | missing | unavailable | not-applicable`.

`proposals.role`: `product-feature | change | history | constraint | unresolved`; `status`: `proposed | conflict`. `sourceRefs` содержит точные `records[].key`, а не source ID или выдуманный URI. Каждый новый area/feature имеет собственное основание, разрешающееся в inventory. Все старые ID сохраняются. Local-only requirement не добавляется в серверный `requirementIds`, пока поддерживаемый серверный resolver его не знает: происхождение/остаток сохраняются отдельно, новая битая ссылка не является переносом.

Кандидат содержит вложенные `parentId`, primary `areaId`, отдельные aliases/tags и stable IDs. Всё во flat/Unclassified не считается законченной классификацией. Простому продукту допустима обоснованная малая глубина через `flatReason`; это объяснение структуры, не approval за владельца. Существующая accepted classification не переносится на изменившуюся смысловую границу автоматически. У pending migration package можно явно предложить target `classification:accepted` для конкретных before/after: это запрашиваемый результат, а не уже полученное согласие. Prepare и account review не изменяют каталог; accepted попадает в каталог только при apply после принятия exact digest. Если target оставлен proposed, apply не повышает его молча. Старый read-only audit по-прежнему требует proposed для новых/изменённых границ. Lifecycle новой фичи остаётся proposed независимо от принятия таксономии — это не доказательство поставки поведения.

Ответ prepare компактен. Дочитай полный diff, source coverage, конфликты и остаток:

```ts
get_migration_package({pid,packageId,expectedProposalDigest,expectedSnapshotToken,
  section:'summary'|'reviewHistory'|'sources'|'records'|'reconciliation'|'residual'|'proposals'|
          'taxonomyChanges'|'areas'|'features'|'impacts'|'findings'|'auditGaps',
  offset:0,limit:10})
// при truncatedFields: тот же section и возвращённый detailIndex
get_migration_package({pid,packageId,expectedProposalDigest,expectedSnapshotToken,
  section,detailIndex,detailOffset:0})
// Собери exact JSON окна по nextOffset до null перед смысловым выводом.
```

Каждая страница возвращает `snapshotToken` и связана одним proposalDigest. После первого чтения передавай `expectedSnapshotToken` в следующие страницы и exact windows. Для изменяемых `summary`/`reviewHistory` continuation требует этот pin; изменение состояния возвращает `MIGRATION_PACKAGE_SNAPSHOT_CHANGED` вместо смешанного ответа, отсутствие обязательного pin — `MIGRATION_PACKAGE_SNAPSHOT_REQUIRED`. В таком случае начни чтение текущего состояния заново и не объединяй куски разных snapshots. Верхний summary также ограничен: `truncatedFields` явно отмечает сокращённые scope/receipts/verification, `counts` сохраняет полные количества, `detail` указывает section:'summary', detailIndex:0 для точных окон. Текущий review не заменяет всю `reviewHistory`; история читается отдельной секцией. Для действий закрепи operationId и повторно сверь состояние/receipt после дочитывания: proposalDigest удостоверяет неизменный замысел, snapshotToken отдельно закрепляет review/history/receipts/verification в ходе чтения. Unknown/missing не становятся matching от отсутствия текста. Сохрани baseline находок; прежние нарушения не маскируются изменением статусов или уменьшением тестового набора.

## Решение владельца и применение

Человек видит конкретное before/after, вложенные пути, последствия и несколько смысловых границ. Отправь `reviewUrl` из ответа, либо страницу `#/project/<pid>/migration/<packageId>`. Surface принимает accept/reject/defer **точного digest** с объяснением от аутентифицированной учётной записи. Новый review-запрос содержит стабильный `operationId` и `expectedReviewRevision` (длина прочитанной `reviewHistory`). Сохрани точное тело при неизвестном результате. Повтор ID ищется во всей истории и возвращает текущее состояние без повторного применения старого решения: потерянный accept не отменит более поздний reject. Новый ID с устаревшей review revision отвергается. Старые исторические записи без этих полей остаются читаемыми. UI проверяет активный provider; локальный проект не может читать/одобрять одноимённый remote пакет. MCP credential не может притвориться человеком; `review_migration_package` в MCP отсутствует. Фикстурный account в тесте не является принятием таксономии Дмитрием.

Это не запрос одобрения каждой технической записи. Одно решение покрывает показанный пакет в его явных границах. Спорный остаток не мешает отдельному согласованному пакету. Разрешение разрабатывать механизм, успех backup, зелёный test и accepted classification другой версии — не acceptance этого diff и не разрешение применять его к live-проекту.

После реального согласования и авторизации применения:

```ts
apply_migration_package({pid,packageId,operationId,expectedProposalDigest})
verify_migration_package({pid,packageId})
```

Backend проверяет исходный fingerprint, catalog revision и account review, пишет только additive catalog. Старые дерево/описания/docs/diagrams/requirements/issues не переписываются. Каталог получает ровно классификацию из принятого exact diff (proposed или явно запрошенную accepted); package review не повышает её вне показанного target. Принятие таксономии отдельно от принятия текущей спецификации/доступности фичи. `SOURCE_CONFLICT` означает устаревший пакет: перечитай изменившиеся источники и создай явно новую редакцию/ID с новым review, не меняй expected revision вслепую.

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
