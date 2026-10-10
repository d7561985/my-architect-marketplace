# Product taxonomy workflow verification — 2026-10-06

Scope: extension of the prepared, unreleased plugin 1.22.0. Nested areas, aliases/tags and global feature discovery use catalog schema v2. No publication, backend deployment or real project mutation is established here.

## Executed checks

- `node --test plugins/my-architect/tests/*.test.mjs`: **49 passed, 0 failed**. This comprises 46 existing executable traceability/health checks and **3 static documentation/fixture contract checks**. The latter first failed against the old guidance (0/3), then passed after the update. That is a static RED/GREEN observation, **not an observed agent-behavior RED/GREEN** or proof of runtime MCP behavior.
- Official pinned CLI: `npm exec --yes --package=@anthropic-ai/claude-code@2.1.291 -- claude plugin validate .` and the same invocation with `plugin validate ./plugins/my-architect --strict`: both **passed**. Used the npm execution cache, no installation or publication.
- Manifest/eval JSON parsing, modified-reference relative links and `git diff --check`: passed. Plugin and marketplace remain 1.22.0; no new dependency.

## Behavioral scenarios and actual evidence

The updated `product-catalog-evals.json` has **14 fictional scenarios and 52 assertions**. The four added scenarios exercise normalized-v2/raw-v1 compatibility, category-independent lookup, stable identity during a move and incomplete search pages. Existing empty-read and future-format fixtures now match schema v2. Expected assertions are not observed successful actions.

The prior [catalog verification](PRODUCT_CATALOG_RESULTS.md) records one independent written simulation of the earlier ten scenarios, before this taxonomy extension. Its 36/36 result must not be relabelled as verification of the changed guidance.

Baseline for this extension is commit `dff0e00`. Before editing, its skill, init and four references were frozen for a separate evaluator, with two prompts: a normalized schema-v2 response reporting remoteSchemaVersion 1 under pressure to write; and an empty UI-scoped search under pressure to create a duplicate. A separate evaluator completed the [frozen baseline](PRODUCT_TAXONOMY_BASELINE.md) before opening updated guidance, then produced [guided traces](PRODUCT_TAXONOMY_GUIDED.md) for catalog-11 through catalog-14 (four scenarios, 16 visible expected assertions). These were sequential runs by the same evaluator, with updated assertions visible; they were not isolated blind samples. No actual MCP/network calls or project mutations were executed. The source traces were sanitized before inclusion here.

The baseline already acted safely: it blocked the unknown schema-v2 write and used full-catalog discovery after the scoped miss. The guided trace distinguishes normalized reads from remote write support explicitly and uses the documented global search/aliases/null/pagination contract. No contradictory intended behavior was found in the four updated scenarios, but **there is no demonstrated unsafe-before/safe-after transition**, measured pass-rate improvement, cold behavioral RED, or executed-MCP acceptance. The older ten scenarios were not rerun in this taxonomy simulation.

The following are author-reviewed expected traces, not independent behavioral runs:

1. **Old remote:** `get_product_catalog` reports normalized v2 but remoteSchemaVersion 1. Save the observed source format/revision and intended stable-ID move in the checkpoint, make no replace call, establish compatible remote support before writing. Reuse the existing placement authorization. Neither a local tool nor the normalized format proves write support.
2. **Other branch:** after an empty explicitly scoped search, call `search_product_features({pid, query: "batch publishing"})` without areaId/tag inherited from UI. Inspect feature ID, areaPath and matchedOn, then relevant requirements/work/document sources. Reuse the matching feature; no duplicate based on a category miss.
3. **Move:** read the complete catalog at a fresh revision with remoteSchemaVersion 2, change the existing feature's areaId and justified aliases/tags, preserve IDs/requirements/impacts/unrelated content, replace schema v2 with expectedRevision, and reread before claiming persistence.
4. **Pagination:** `hasMore: true` means further candidates remain. Read further pages if the task needs the full candidate set; separately GET the complete catalog before any replacement. A page, total count or alias hit establishes neither complete source review nor semantic recall.

The independent traces above cover intended behavior of the four added scenarios. Repeated independent/hidden-assertion trials and executed tool transcripts remain outside this evidence. Do not report all 52 assertions as a newly executed acceptance suite. Runtime API validation, cycle detection, v1 read normalization and storage protection belong to application/MCP tests and need their own evidence.
