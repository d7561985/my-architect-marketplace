# Подтверждение результата: automation и решение аккаунта

Этот reference дополняет [epic-flow.md](epic-flow.md). Он описывает подготовленный контракт; фактические схемы и capabilities удалённого сервера всегда проверяются отдельно.

- **Automation:** проверенный MCP credential даёт attribution `mcp-key:<hash>`, kind automation, assurance credential-assertion. Это не уникальная личность агента, не согласие человека и не исполнение внешних тестов сервером. Actor рабочей задачи остаётся отдельным alias.
- **Account decision:** отдельная интерактивная поверхность проверяет session JWT и точный intended action. Kind account-session, assurance authenticated-account-action, humanPresenceVerified:false. Не объявляй браузерный клик биометрическим/физическим доказательством присутствия человека.
- **Legacy human-only:** requiresHuman:true не сопоставляется автоматически с account-session. Такая доставка unsupported, пока владелец явно не заменит assurance policy. Старые bytes/history остаются читаемы.
- **Нет policy:** работу и review можно продолжать. Конкретные delivery criteria/availability/WIP не выводятся из успешного теста, root status или этой инструкции. Подготовь reviewable proposal для владельца; не останавливай независимую разрешённую реализацию.

Перед подтверждением прочитай полные criteria, reviewed revision и evidence. Проверь источники по точной редакции. Сохрани request/operationId до записи. Сервер проверяет текущий modeled baseline и recorded criterion checks, но не выполняет CI/deploy и не удостоверяет внешний URL.

Если политика требует account-session, передай владельцу конкретное действие в UI. Агент не вызывает account endpoint как MCP, не меняет actor на имя владельца и не ослабляет policy. Для ответа на structured decision allow выполняет только записанный blockedAction; deny сохраняет блокировку для всех обычных переходов эпика, включая cancel/release/handoff/return, а не только clear_wait. Новый proposal — явный новый запрос; он не является повторным согласием на отказанный action. Изменение source scope требует нового proposal. Получателя бери из `capabilities.decisionRecipient.identity`; displayLabel/responsibleLabel хранится отдельно. Это discovery адресата, не account authority. Перед ответом человек видит полный exact blockedAction, proposal identity/revision и свежесть; пересказ последствий не заменяет параметров действия.

После timeout перечитай receipt по тому же operationId. Точный replay не является новой верификацией другого credential. Не меняй request для «починки» неопределённого исхода. После доказанного успеха сохрани evidence и текущий checkpoint; не закрывай всё по completion дочерних задач, SSR-тесту UI или наличию подготовленного плагина.
