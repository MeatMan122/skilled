---
name: surface-churn
description: Identify points of churn, friction, mistaken assumptions, unclear constraints, or repeated rework in an agent task. Use when the user says "not quite", "not yet", "closer", "this is wrong", "no", "still broken", asks for changes to recently completed work, redirects an implementation, or explicitly asks why the agent is struggling, looping, assuming too much, or missing the target.
---

# Surface Churn

Use this skill to pause and make the working model explicit before doing more work. The goal is to reduce friction, not to defend prior choices.

Keep the output concise. Prefer direct evidence, concrete constraints, and one actionable next move.

## Churn Check

1. Reflect on the conversation so far.
   Include recent user corrections, changed requirements, failed attempts, and any point where your own interpretation may have drifted.

2. Quote the user.
   Use short direct quotes from the user's prompt or correction. For each quote, state how you are interpreting it. Give examples, not a line-by-line summary.

3. Name assumptions.
   Separate facts from guesses. Mark assumptions that are driving implementation, verification, or scope choices.

4. State constraints.
   Include technical constraints, repo conventions, validation requirements, time or context limits, user preferences, and anything the user explicitly ruled in or out.

5. Explain the current mental model.
   Briefly describe what you think the user wants, what "done" should look like, and what outcome you expect after the next change.

6. Identify churn points.
   List likely sources of friction: ambiguous target, missing runtime evidence, weak reproduction, scattered ownership, visual mismatch, brittle manual steps, insufficient tests, stale assumptions, unclear acceptance criteria, or missing domain research.

7. End with actionable insight.
   Give the single highest-leverage action to reduce friction. If the causes are evenly shared, give the top three and say which to start with.

## Output Shape

Use this structure when the user is frustrated, corrective, or asking for a reset:

```text
What I heard:
- "<short quote>" -> I interpret this as <meaning>.

Current working model:
- Target: <expected outcome>.
- Constraints: <hard limits and conventions>.
- Assumptions: <important guesses that may be wrong>.

Likely churn:
- <specific friction point and why it matters>.

Best friction reducer:
- Start with <action>, because <reason>.
```

## Good Friction Reducers

Pick actions that create evidence or remove ambiguity:

- Add or run a repeatable script.
- Add a small helper or characterization test.
- Add bounded logging or trace output.
- Patch a browser, replay, or feedback harness path.
- Capture screenshots, recordings, logs, or other concrete evidence.
- Do focused research from primary sources.
- Ask one targeted clarification question.
- Write a small skill for repeated agent behavior.
- Extract a helper method to centralize repeated logic.
- Summarize acceptance criteria before continuing.

## Rules

- Do not bury the actionable insight. Put it last and make it executable.
- Do not use this as a long postmortem unless the user asks.
- If you continue implementation after the churn check, state the chosen next action first.
- When quoting the user, quote only enough words to anchor the interpretation.
