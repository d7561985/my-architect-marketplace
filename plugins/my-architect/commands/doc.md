---
description: Author or update the source-of-truth doc on a hierarchy node
argument-hint: "[node id or feature name]"
---

Use the **myarchitect** skill, **Workflow C** (authoring docs as source of truth). Resolve the project `pid`, then for the target node (from the arguments below, or the node currently in progress):

1. `get_node` → read existing docs via `get_doc`. Don't guess from the title.
2. `create_doc({ pid, nodeId, title, content })` to author, or `update_doc({ pid, docId, content })` to revise. Free-form markdown; lead with what the feature does, then **Why** / **How** / acceptance.
3. `validate_project({ pid })` — fix any dangling-doc-ref before finishing.

The doc is the long-form truth (what + how); the node description stays one line. Keep it current with the code.

$ARGUMENTS
