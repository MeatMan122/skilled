---
name: trace-value-debugging
description: Debug runtime behavior by tracing actual values across small function, method, event, render, or data-flow boundaries. Use when an agent needs to prove or disprove assumptions with bounded logging, compare values across transformations, find the first mismatching boundary, or design safe diagnostic helpers without relying on broad architecture guesses.
---

# Trace Value Debugging

Use this skill to answer one question: "What values are these boundaries actually producing?"

Keep the investigation small, bounded, and falsifiable. Do not begin by redesigning the system. Begin by tracing the smallest value path that can prove or disprove the current theory.

## Core Process

1. State a falsifiable theory.
   Good: "The input value is gradual, but the display transform maps it to an almost complete visual state."
   Weak: "The animation is broken."

2. Pick the smallest value path that can disprove it.
   Choose two to four boundaries: source value, one or two transforms, and observed output.

3. Add bounded instrumentation.
   Capture only fields that answer the theory. Include ids, timestamps or ticks, inputs, outputs, branch flags, and derived values.

4. Run one concrete scenario.
   Prefer a deterministic test, script, replay, fixture, or local reproduction. Use live logs only when runtime behavior cannot be reproduced otherwise.

5. Compare actual values, not impressions.
   Find the first boundary where values diverge from expectation.

6. Patch only after the trace points at an owner.
   The first wrong value is usually closer to the fix than the most visible symptom.

7. Convert the finding into a regression.
   Assert the relationship that broke, not merely that the final state eventually works.

## When Helpers Are Missing

If the codebase does not already have diagnostics helpers, create the smallest local helper needed for the investigation:

- A rate-limited logger for hot paths.
- A bounded in-memory sample collector for deterministic traces.
- A small replay or script that exercises one scenario.
- A characterization test around the first wrong transformation.

Do not add a broad diagnostics framework unless the codebase already has that pattern or multiple investigations need it.

## Rate-Limited Logger Pattern

Use this shape when a log site can run often, such as render, tick, polling, event, queue, input, or network paths:

```ts
type DiagnosticSink = (message: string, data?: Record<string, unknown>) => void;

class RateLimitedLogger {
  private lastByKey = new Map<string, number>();

  constructor(
    private readonly options: {
      enabled: boolean;
      minIntervalMs: number;
      sink: DiagnosticSink;
      now?: () => number;
    },
  ) {}

  log(key: string, message: string, data: Record<string, unknown>): void {
    if (!this.options.enabled) return;

    const now = this.options.now?.() ?? Date.now();
    const last = this.lastByKey.get(key) ?? -Infinity;
    if (now - last < this.options.minIntervalMs) return;

    this.lastByKey.set(key, now);
    this.options.sink(message, data);
  }
}
```

Rules:

- Gate logs behind an explicit flag, config value, or test option.
- Use a stable key so repeated calls debounce.
- Keep data structured and small.
- Log only fields needed to prove or disprove the current theory.
- Never turn on noisy hot-path logs by default.
- Avoid unbounded in-memory records. If samples are retained, cap them.

## Bounded Trace Helper Pattern

Prefer this shape for deterministic investigations:

```ts
interface TraceSample {
  step: number;
  inputValue: number;
  outputValue: number;
  expectedValue: number;
  difference: number;
}

export function traceValueFlow(options: {
  maxSamples?: number;
  maxSteps?: number;
}): TraceSample[] {
  const maxSamples = options.maxSamples ?? 120;
  const maxSteps = options.maxSteps ?? 1200;
  const samples: TraceSample[] = [];

  for (let step = 0; step < maxSteps && samples.length < maxSamples; step += 1) {
    const inputValue = readInputValueForStep(step);
    const outputValue = computeOutputValue(inputValue);
    const expectedValue = computeExpectedValue(step);

    samples.push({
      step,
      inputValue,
      outputValue,
      expectedValue,
      difference: outputValue - expectedValue,
    });
  }

  return samples;
}
```

Keep trace helpers pure or nearly pure when possible. If the trace advances mutable state, make the max step and max sample caps explicit and test that the helper cannot grow without bound.

## Choosing Fields

Capture fields that let you compare before and after boundaries:

- Identity: entity id, selected id, request id, event id, item id, correlation id.
- Time or progress: tick, step, elapsed time, frame delta, progress fraction.
- Input: raw source value passed into the boundary.
- Output: returned, assigned, emitted, rendered, or persisted value.
- Derived values: ratios, clamped values, distances, thresholds, filter decisions.
- Branch flags: whether a branch ran, a value was dropped, a fallback fired, or a cache was used.

Avoid:

- Whole state dumps.
- Large object graphs.
- Large arrays without caps.
- Per-frame console spam without rate limiting.
- Logs that describe what the code should do instead of what values it produced.

## Interpreting Output

Look for the first mismatch in the chain:

```text
source value      = gradual/correct
transform A       = gradual/correct
transform B       = jumps/wrong
observed output   = follows transform B
```

The likely fix is at transform B or its assumptions, not at the source.

Use differences, thresholds, and progress ratios. A visible "snap" or wrong state is often a value-space mismatch:

- A correct source value mapped through the wrong scale.
- A gradual value clamped too early.
- A target value correct but interpolation too aggressive.
- A filtered value missing from one downstream view.
- A cached value not invalidated when the source changes.
- A fallback branch running for one boundary but not another.

## Regression Shape

Turn the discovered mismatch into an assertion:

```ts
assert.equal(actualId, expectedId);
assert.ok(Math.abs(actualValue - expectedValue) <= tolerance);
assert.ok(samples.length <= maxSamples);
```

For progression bugs, assert intermediate samples:

```ts
assert.ok(progressAt25Percent < 0.4);
assert.ok(progressAt50Percent > 0.35 && progressAt50Percent < 0.65);
```

For handoff bugs, assert boundary relationships:

```ts
assert.equal(presenterInput.id, sourceOutput.id);
assert.deepEqual(renderedIds, expectedIds);
assert.ok(outputTimestamp >= inputTimestamp);
```

## Maintenance

When a trace helper becomes reusable:

1. Put it near the code it traces or in the nearest existing diagnostics area.
2. Add a test that proves it is bounded.
3. Document the fields it captures and how to interpret them.
4. Keep it disabled by default unless the codebase already has always-on diagnostics.
