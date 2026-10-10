# Product catalog pilot verification — 2026-10-06

> Historical first-slice verification before the nested-taxonomy extension. Current v2 scenario/check counts and outstanding behavioral checks are recorded in [PRODUCT_TAXONOMY_RESULTS.md](PRODUCT_TAXONOMY_RESULTS.md). The earlier independent simulation below does not verify the changed taxonomy guidance.

Scope: prepared plugin 1.22.0. These instructions describe the first catalog read/write workflow; full migration apply/rollback is not implemented. No live project migration, release, tag or publication is established by this report.

## Behavioral verification status

`product-catalog-evals.json` contains ten fictional scenarios and 36 assertions. Fixtures and their expected actions are not successful behavioral runs.

The pre-change baseline is commit `bed93400c83b74276e09cbc849c069ea1f24b978`. A separate evaluator read the old skill/setup/workflows and answered the local-tool/remote-404 scenario. It refused catalog writes, did not equate 404 with an empty catalog, and distinguished done from verified available behavior. The evaluator explicitly retained prior catalog planning/implementation context: **this was not a cold baseline**, and its safe answer cannot be attributed to the old skill alone. No observed RED is established.

The authoring agent then exercised catalog-01, catalog-02, catalog-04 and catalog-08 using the current guidance. [Concrete responses and intended calls](PRODUCT_CATALOG_GUIDED.md) cover 15 assertions, including 404, partial requirements, CAS and pending human taxonomy decisions. The exercise exposed an underspecified fixture: catalog-02 now explicitly supplies legacy creation intent and requirement ownership, so `creates` need not be invented from a title. This is an author self-check with retained context, not an independent or cold GREEN. A subsequent independent agent read the new guidance and all ten scenarios without prior conversation or the author result files. Its [action traces](PRODUCT_CATALOG_INDEPENDENT.md) satisfy 36/36 assertions in a written simulation. This is one fresh context with assertions visible, not ten isolated blind runs or executed MCP calls. No pre-change cold RED is established.

For the baseline, provide the pre-change SKILL.md, init, setup and workflows from that commit, plus the selected scenario and its stated tool observations. For the guided run, provide the current skill, init/setup/workflows and product-catalog/product-migration references. Prohibit tool mutations in both runs. Record actual intended calls, questions and success claims, then assess each assertion; matching phrases alone is insufficient.

For the cold run, prioritize old remote support despite a new local tool, partial source requirements, concurrent replacement, unknown write outcome and interrupted review. Extend the recorded results with the evaluator's observations and any follow-up replay after corrections.

## Executed local checks

- `node --test plugins/my-architect/tests/traceability.test.mjs`: **46 passed, 0 failed**. The existing suite exercises the installer, synchronization and health hooks in isolated repositories; it does not prove catalog workflow behavior.
- Plugin/marketplace and eval JSON parsed; both manifests declare 1.22.0. Relative links in the modified skill references resolved. `git diff --check` passed.
- The initial direct CLI call was unavailable. Resolved with the official registry package, pinned after `npm view`: `npm exec --yes --package=@anthropic-ai/claude-code@2.1.291 -- claude plugin validate .` **passed**, then `claude plugin validate ./plugins/my-architect --strict` via the same package **passed**. This used the npm execution cache; no global CLI install or plugin install was performed. The root check validates the marketplace and the second validates the plugin. See the [official manifest validation reference](https://code.claude.com/docs/en/plugins-reference#validate-the-manifest).

No new dependencies were introduced. Runtime/catalog protocol tests belong to the application/MCP change and are not asserted here. Hosted CI and backend availability need their own observed evidence.

## Independent review notes

The independent run distinguishes planned calls from actual tool execution. In catalog-05, matching IDs/pairs after an ambiguous write is insufficient: compare the values before claiming complete application. In catalog-09, permission to resume proposals does not accept their classification. Those conditions are preserved in the recorded traces. Runtime behavior is covered separately by application integration tests, not by these written simulations. CLI validation subsequently passed as recorded above. Hosted release verification remains pending; these checks do not publish the plugin or deploy the backend.
