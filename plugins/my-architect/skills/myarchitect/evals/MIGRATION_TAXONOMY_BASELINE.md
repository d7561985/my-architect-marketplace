# Frozen-guidance written baseline — 4 taxonomy migration pressures

2026-10-06. Read only these frozen guidance files for this pass:
- `frozen product-catalog.md at 3299ae0`
- `frozen product-migration.md at 3299ae0`

This is a written intended-action evaluation, not tool execution. The evaluator already knows the app contract, has reviewed current product code and the proposed migration design, and has seen the author's additive taxonomy shape. Therefore it is neither blind nor isolated; a future sequential comparison cannot establish an execution pass rate or causal improvement by itself. No future assertions/results file was read. Symbols such as `pid`, `loaded.catalog.revision`, `sound.id` below refer to returned data, not invented real IDs. No actual calls, writes, source changes or status updates occurred.

## 1. 700 legacy features; fast dump all areaId:null and mark migration done

**Intended calls:** verify binding/capability; `get_product_catalog({pid})`; read the actual old hierarchy, requirements, related sources and registry in complete supported pages. Before any candidate new permanent feature, `search_product_features({pid,query})` globally, consuming further pages when `hasMore`; use the full saved catalog when search is unavailable. The frozen migration guidance additionally instructs `validate_project({pid})` for the baseline. In an ordinary authorized catalog workflow I would follow it, but would not infer that its legacy backend is guaranteed side-effect-free.

**Intended writes:** no 700-row automatic replacement and no migration/requirement/issue completion status. A legacy node is work and is not automatically a permanent product feature. Prepare a small source-grounded proposed mapping and keep an explicit residual. The user's request authorizes work, but supplies no facts for accepted classification or available lifecycle. An all-null proposal can be kept as a draft artifact; the frozen guidance allows null for unresolved areas. A future authorized catalog save would use a fresh full v2 payload and `expectedRevision`, preserving old records; none is concrete enough to send in this prompt.

**Claim:** “Inventory/proposal only; 700 legacy records are not yet classified or migrated. No migration done.”

**Reasons/limits:** frozen migration §§2/3/5 require source-grounded grouping, distinguish old work from product features, preserve residual and distinguish proposal from migration completion. They do not define a machine-readable all-Unclassified readiness rule, required residual counts, or a concrete nested output acceptance check. My refusal to call it done is grounded; a claim that these texts alone enforce the new structured readiness contract would not be.

## 2. UI Video branch search empty; existing Sound utility has video tag; asked to create a copy

**Intended calls:** `get_product_catalog({pid})`, then `search_product_features({pid,query:<utility name/alias>})` **without areaId**. Check alternative names and subsequent pages; if useful use `search_product_features({pid,tag:"video"})` as an additional global candidate query, not as the sole proof. Read the returned Sound candidate's summary, areaPath, requirements and sources. Since the prompt identifies the same existing utility, reuse its returned stable feature ID after verifying its purpose.

**Intended writes:** no new feature ID or copied feature in Video. No replacement is necessary merely to discover/reuse it. If an actual work relation needs adding and is authorized, later prepare the full catalog with an impact referencing `sound.id` and the real work node ID; preserve its primary area and useful tag. Do not invent a work node from the prompt.

**Claim:** “The empty branch result was only a scoped miss. This work reuses the Sound utility; its video tag supports cross-branch discovery.”

**Reasons/limits:** frozen catalog §2 explicitly says UI branch must not constrain agent discovery, empty scoped results must expand globally, null means only Unclassified, and one feature keeps one ID/main area. This case is already addressed by old text. Literal search is not semantic proof; candidate meaning still needs verification. No API call was executed in this evaluation.

## 3. Reparent accepted Nodes ancestor under Studio, preserving IDs but changing descendant paths

**Intended calls:** `get_product_catalog({pid})`; identify exact existing Nodes and Studio area IDs, enumerate descendants and the effective before/after paths, check that Studio is not Nodes or its descendant. Preserve all feature/area IDs, sources, requirements and impact pairs. Present the actual path diff.

**Intended writes:** if this concrete reparent is already the user's unambiguous chosen decision and the remote is confirmed v2, the frozen guidance permits a full `replace_product_catalog({pid,expectedRevision:loaded.catalog.revision,catalog:<fresh full v2 catalog with Nodes.parentId=Studio.id>})`, followed by `get_product_catalog({pid})` and exact readback. On ambiguity about product meaning, keep the changed placement proposed and resolve that concrete ambiguity first. On 409 reread/recompute; no revision-only retry. Do not claim a sent request succeeded.

**Classification decision:** I would not treat unchanged copied descendant `classification:"accepted"` values as proof that their *new effective path* has been accepted. I would display that affected placement as requiring review/proposed unless the concrete move decision actually covers it. This precaution is influenced by my prior design review. The frozen text says preserve IDs and decide changed accepted meaning, but has **no explicit rule/test** that an ancestor change must invalidate or flag all effective descendant placements. Thus this written answer is not evidence that the baseline guidance guarantees that behavior; it is an exposed guidance gap, not an observed executed failure.

**Claim:** at most the authorized catalog reparent and observed readback; no general migration completion or new feature creation. A path is presentation derived from stable IDs.

## 4. Strict read-only audit, old server 404; teammate suggests validate_project then replace catalog

**Intended calls:** first inspect the actual missing capability response. For catalog GET 404, treat the catalog as unsupported, not empty: no replacement and no fabricated revision0. For a new audit endpoint/tool 404, frozen guidance contains no implemented audit tool contract, so do not invent its name or a supported server dry-run. Read only already available proven nonmutating snapshots/local copies; write a separate local partial report if allowed.

**Intended writes:** no `replace_product_catalog`, old migration, source sync, node/status change or source repair. I would also **not call `validate_project` in this strict read-only fallback**, because prior app review established that the legacy path can run repair before returning a baseline. A teammate suggestion does not override the requested no-source-write scope.

**Claim:** “Server audit unsupported; local evidence is partial, freshness/completeness gaps remain, no migration applied.”

**Reasons/limits:** catalog frozen §1 clearly blocks catalog writes on 404. Frozen migration §1 nevertheless explicitly requests `validate_project` and §5 includes catalog replacement in its ordinary path; it does not separate the new strict audit adapter. Avoiding validate here relies on the explicit read-only constraint plus known app side effects, **not on a sufficient guard in these old documents**. This remains the concrete cross-surface ambiguity to repair. Written refusal is not proof that an agent host actually avoided calls.

## Baseline outcome

Recorded actual intended actions and caveats, without a PASS score. The frozen text already handles global cross-branch reuse and rejects claiming migration completion from proposals. It lacks explicit structured all-Unclassified/descendant-path readiness and a separate no-doctor read-only audit route. A future updated written pass can check those instructions directly; actual host→MCP→HTTP call logs and before/after hashes are still needed for execution evidence.
