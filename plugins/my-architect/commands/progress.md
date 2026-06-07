---
description: Show my_architect project progress and route to the next action
---

Use the **myarchitect** skill. Resolve the project `pid`, then `get_project_context({ pid })` and report:

- Overall: done / in-progress / draft counts and % complete.
- Per release (MVP/R1 first) and per epic: what's done vs open.
- The single in-progress item, if any, and what's left on it.
- The next task `get_next_task` would surface.

Flag status drift: if "draft" nodes look already shipped, say so and offer a `/my-architect:reconcile` sweep. Don't invent — read live state.

$ARGUMENTS
