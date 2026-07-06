---
description: Architecture-aware design session — dialogue to an approved spec on a my_architect node, then Workflow Z + plan
argument-hint: "[idea description]"
---

Use the **design** skill (this plugin). Resolve the project `pid` via the myarchitect setup ladder, then run the checklist from step 0: routing (sketch vs full) by work size; sketch mode hands off to Workflow I and STOPS; full mode explores via get_project_context + local code graph + recursive-context, asks one question at a time, proposes 2–3 approaches, presents the design (Event Storming canvas for epics/initiatives, fixed to sequence.ok), lands the spec as a doc on the node (create_doc, Workflow C — never docs/superpowers/specs/), and after user approval terminates into Workflow Z → superpowers:writing-plans (plan file in the repo + mirror doc on the node with Source, same turn).

Keep this a thin wrapper; the logic lives in the design skill.

$ARGUMENTS
