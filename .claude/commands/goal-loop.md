---
description: Work toward a goal spec in goals/ using a plan → build → verify loop. Usage: /goal-loop <goal-name>
---

# Goal Loop

You are running a goal loop against the spec file `goals/$ARGUMENTS.md`. If no argument was given, list the files in `goals/` and ask which one to run.

## Setup (once per session)

1. Read `goals/$ARGUMENTS.md` in full. It contains the feature description, UX, schema, milestones, and acceptance criteria.
2. Read the **Progress Log** section at the bottom of the goal file to see what's already done. This loop must be resumable across sessions — the goal file is the source of truth, not your memory.
3. Explore the relevant parts of the codebase before writing anything: existing recipe schema, Supabase client setup, routing, component conventions. Match the project's existing patterns (Vue SFC style, naming, folder structure).
4. If the goal file conflicts with what you find in the codebase (e.g., field names in the real `recipes` table differ from the spec), the codebase wins — update the goal file to match reality and note it in the Progress Log.

## The Loop

Repeat until all acceptance criteria pass or you're blocked:

1. **Pick** the next unchecked milestone from the goal file. Work on exactly one milestone at a time.
2. **Plan** briefly: which files change, what new files are created, what could break.
3. **Build** the milestone. Small, complete increments — the app should still run after every milestone.
4. **Verify**:
   - Run the dev build / type check / lint and fix any errors you introduced.
   - Run existing tests if the project has them.
   - Re-read the milestone's acceptance criteria and check your work against each one honestly.
5. **Record**: check off the milestone in the goal file and append a dated entry to the Progress Log: what was done, decisions made, anything deferred.
6. **Loop** back to step 1.

## Rules

- Never mark a milestone done if the build fails or a criterion isn't met.
- If blocked (missing credentials, unclear requirement, needs a manual step like creating a Supabase bucket), write a **BLOCKED** entry in the Progress Log describing exactly what the human needs to do, then stop and tell them.
- Anything that needs manual setup outside the repo (Supabase dashboard steps, env vars, API keys) goes in the goal file's **Manual Setup** section as a checklist for the human.
- Don't expand scope. New ideas go in the goal file under **Later**, not into the code.
- Secrets (Anthropic API key, Supabase service role key) never go in client code or committed files — Edge Function env vars only.

## Ending a session

Before stopping, summarize for the user: milestones completed this session, current state of the app, and the single next step.
