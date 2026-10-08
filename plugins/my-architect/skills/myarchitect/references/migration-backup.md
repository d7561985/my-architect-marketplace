# Проверяемая копия серверного проекта

Читать в [миграционном workflow](product-migration.md), когда требуется сохранить серверные источники перед дальнейшими изменениями. Это отдельный технический срез: приватный bundle и проверка его восстановления. **Apply, live overlay restore, rollback, writer fence и перенос локальных источников не реализованы этим контрактом.** Backup не принимает Product Map и не завершает миграцию.

## 1. Явный scope и фактическая capability

Используй уже подтверждённый `pid`, не читай repairing legacy metadata только ради повторного Setup. Проверь реальный удалённый ответ:

```ts
get_migration_backup_capabilities({pid})
// {capabilities:{schemaVersion:1,rulesVersion:1,pid,supported,reason,
//   scope:'server-project',consistency:'observed-stable',canApply:false,
//   limits,metadataScope,excludedScopes}}
```

`supported:false` с `not-configured`, `unsafe-artifact-root` или `artifact-root-unavailable` — явная недоступность. Само наличие локального инструмента не разворачивает backend. Ошибка HTTP, неизвестная схема или старый сервер не означают пустую историю и не разрешают пробовать bootstrap/create/update вместо backup. Серверу нужна собственная настройка `MIGRATION_ARTIFACTS_DIR`; агент не передаёт путь и не создаёт произвольную серверную папку.

Scope всегда **`server-project`**: все поддерживаемые пути и application-content bytes выбранного серверного project root в пределах лимитов, включая неизвестные/повреждённые файлы, binary, raw catalog/flow/history и legacy variants. Метаданные: relative paths, entry types, bytes, empty directories и symlink target bytes. Внешняя цель symlink не читается. Hardlinks/special files и неподдержанные имена — отказ, не молчаливое упрощение. Ownership/ACL/xattrs/sparse allocation/execute permissions не обещаются.

`excludedScopes` явно содержит `local-inputs`, `browser-local`, `workspace-entry`, `external-symlink-targets`. Локальный `.architect`, curated/retained/test sources и browser data за пределами серверного root не собраны. Ранее выбранные 23 записи из 1056 не становятся полным local backup. Сохрани этот остаток в checkpoint. `audit.fullExportComplete:false` не меняется от успешного серверного bundle.

`observed-stable` означает, что повторные перечисления/хэши не обнаружили изменения в конечном окне. Это **не atomic snapshot**, не блокировка всех писателей и не защита будущего commit. Серверные mutex, совпадение revision или успешный restore не устанавливают live fence.

## 2. Capture с одним operationId

Capture/verify создают **приватные recovery artifacts**, поэтому MCP отмечает их `readOnlyHint:false`, хотя исходный проект не меняется. Выполняй их в рамках поручения сохранить/проверить копию; capability/status — обычные чтения. Отдельного согласования каждого технического чтения не требуется. Не передавай `path`, `approved`, `apply`, user identity или свои limits; строгий запрос их отвергнет.

```ts
capture_migration_backup({pid,operationId})
get_migration_backup({pid,operationId})
// both: {backup:{schemaVersion:1,rulesVersion:1,pid,operationId,backupId,
//   state,incompletePhase,scope:'server-project',consistency:'observed-stable',
//   canApply:false,metadataScope,excludedScopes,startedAt,captureFinishedAt,
//   captureComplete,manifestDigest,counts,verification,verificationCheck,failure}}
```

`operationId` — заранее сохранённый retry key, 1–128 ASCII символов, `^[A-Za-z0-9][A-Za-z0-9_-]*$`; для новой намеренной копии создай новый ID и запиши его **до вызова**. Он не является filesystem path. Повтор того же ID возвращает записанную операцию, не новую копию и не повторное чтение уже захваченного source tree.

Состояния: `capturing`, `captured`, `capture-failed`, `verifying`, `verified`, `verify-failed`, `incomplete`. `capturing`/`verifying` — работа ещё не подтверждена как завершённая; `incomplete` — исход не подтверждён, а не доказательство завершения или смерти другого процесса. У незавершённого capture нет готового manifest/counts. Ошибка/quota/нечитаемый файл/обнаруженное изменение не превращаются в complete receipt. Сводка не содержит исходных file contents, raw filenames, абсолютных server paths или credentials.

При timeout, lost response или `BACKUP_OUTCOME_UNCONFIRMED` **не меняй operationId**: сначала вызови `get_migration_backup` с прежними pid/ID. Сохрани наблюдаемый результат. Не запускай новый capture, не считая старый исход; pending/failed/incomplete не возобновляются автоматически. GET может успешно вернуть failed operation — это успешное чтение ошибки, не успешная копия. Action tools для failed/incomplete возвращают `isError:true`. Новая намеренная попытка после рассмотренного неуспеха — отдельный ID, старые artifacts сохраняются.

## 3. Verify точного manifest

Только после `captureComplete:true` и `state:'captured'` прочитай точный `manifestDigest` и выполни:

```ts
verify_migration_backup({pid,operationId,expectedManifestDigest})
// {backup:...}, успешный текущий результат:
// state:'verified', verification.manifestDigest === expectedManifestDigest,
// verification.pathsEqual:true, bytesEqual:true, symlinkTargetsEqual:true,
// verificationCheck:{status:'passed',checkedAt:<actual observation time>}
```

Сервер восстанавливает содержимое в новый изолированный приватный каталог; live tree не читается/не перезаписывается. Произвольный destination или restore поверх проекта отсутствуют. Verify и GET работают по сохранённым artifacts даже после удаления исходного проекта. Другой digest — conflict, не разрешение подменить ожидаемый hash свежим без разбора.

`verification` — историческая квитанция, привязанная к manifest и verifier version. **GET и capture replay возвращают `verificationCheck.status:'not-performed'`**, даже если state хранит `verified`: они не перечитывают всё содержимое. Для новой проверки целостности нужен explicit verify. Повтор ранее успешного verify заново хэширует текущий bundle и сохранённое restore tree; новое дерево не создаётся. Tamper/missing blob/изменение восстановленного файла даёт failed check, старый receipt остаётся историческим и не заменяет свежую ошибку. Не ремонтируй artifacts, чтобы получить зелёный ответ.

Failed/incomplete verify не запускается заново автоматически. Сохрани failure/diagnosticRef и ограничь зависимые действия; не изображай resume сменой digest или ID. Даже новый успешный verify всегда `canApply:false`; равенство байтов не удостоверяет смысл требований, полноту внешних источников или принятие классификации.

## 4. Product Map и продолжение

Следуй [каталогу](product-catalog.md) и [миграционному proposal](product-migration.md): глобальный discovery по всем страницам до нового feature ID; стабильные area/feature IDs; вложенные области с обоснованными parent paths; tags/aliases отдельно от основной области; связи одной работы с несколькими фичами и точные source refs. Предложение, unresolved/Unclassified и спорные границы остаются такими после backup. Успешная копия не превращает all-flat dump в проверенную таксономию. Маленькая простая структура допустима при обосновании, не как автоматическая универсальная схема.

Checkpoint хранит pid, operationId/backupId, фактически возвращённое state, scope/excludedScopes, captureComplete, manifestDigest/counts, исторический receipt и **последний verificationCheck с временем**, ошибки/неясный исход, локальный остаток, точный taxonomy proposal/diff и нерешённые смысловые решения, следующий шаг. Не копируй приватный manifest/raw sources в публичный репозиторий. При продолжении сначала GET прежнего ID; если нужна свежая integrity evidence — verify того же digest. Если нужен новый снимок изменившегося live source, это новый намеренный capture, а не обновление старого bundle.

Финальный отчёт различает «серверная копия захвачена», «изолированное восстановление проверено», «локальные источники не собраны», «таксономия предложена/принята» и «миграция применена». Последнее этот срез не умеет. Не эмулируй apply/rollback старыми bulk/create/update или заменой нового каталога старым.
