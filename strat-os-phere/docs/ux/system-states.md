# System States — UX Reference

**Purpose**: Canonical reference for UI state handling across Plinth. Defines when each state applies, recommended messaging, CTAs, and language rules.

**When to read this**: Before implementing empty/running/partial/complete/failed states in any UI component. Use as a "do not regress" checklist.

---

## Canonical States

The system recognizes five canonical states:

1. **empty** — No data exists yet
2. **running** — Operation in progress
3. **partial** — Some data exists, but incomplete
4. **complete** — All expected data is present
5. **failed** — Operation encountered an error

---

## State Definitions

### Empty

**When it applies:**
- User has not yet initiated an action (e.g., no analysis run, no competitors added)
- System has no data to display for a given context

**User-facing message:**
- Clear, actionable guidance on what to do next
- Example: "Add competitors to begin analysis" or "Create a new project to get started"

**Primary CTA:**
- Action that moves user toward first meaningful interaction
- Example: "Add Competitors" or "Create Project"

**Secondary CTA:**
- Optional: Link to help/docs, "View Example", or skip/skip-for-now

**Do:**
- Provide clear next steps
- Use encouraging but not hyped language
- Include brief context on what will happen when they take action

**Don't:**
- Use vague messages like "No data available"
- Present empty states as errors
- Add unnecessary decorative elements

**Telemetry (optional):**
- `empty_state_viewed` (context: page/component name)
- `empty_state_cta_clicked` (action: primary/secondary)

---

### Running

**When it applies:**
- Analysis generation in progress
- Evidence harvesting active
- Any long-running operation (> 2 seconds)

**User-facing message:**
- Clear indication of what is happening
- Example: "Generating analysis..." or "Harvesting evidence from competitors..."

**Primary CTA:**
- None (operation in progress) OR "Cancel" if cancellation is supported

**Secondary CTA:**
- None during operation

**Do:**
- Show progress indicators when available (percentage, step count, time estimate)
- Allow cancellation for long-running operations
- Provide context on what step is executing

**Don't:**
- Use vague loading messages
- Block all interactions unnecessarily
- Overpromise on timing ("This will only take a moment" if it takes minutes)

**Telemetry (optional):**
- `run_started` (context: operation type)
- `run_cancelled` (context: operation type, duration)
- `run_completed` (context: operation type, duration)

---

### Partial

**When it applies:**
- Some data exists but analysis is incomplete
- Evidence harvested but synthesis not finished
- Previous run exists but new run is in progress

**User-facing message:**
- Acknowledge existing data and current state
- Example: "Analysis in progress. Some results are available below." or "3 of 5 competitors processed."

**Primary CTA:**
- "Continue" or "View Partial Results" OR "Wait for Completion" if appropriate

**Secondary CTA:**
- "Cancel" if cancellation is supported
- "View Previous Results" if applicable

**Do:**
- Show what is available now
- Indicate what is still processing
- Allow users to see partial results when useful

**Don't:**
- Hide available data during processing
- Present partial state as an error
- Allow actions that depend on incomplete data without clear warnings

**Telemetry (optional):**
- `partial_state_viewed` (context: completion percentage)
- `partial_results_accessed` (context: operation type)

---

### Complete

**When it applies:**
- All expected data is present and finalized
- Analysis run completed successfully
- All competitors processed and results synthesized

**User-facing message:**
- No message needed (data speaks for itself) OR brief confirmation
- Example: "Analysis complete" (dismissible toast) or no message at all

**Primary CTA:**
- Context-dependent (e.g., "View Results", "Export", "Start New Analysis")
- Usually implicit in the data presentation

**Secondary CTA:**
- "Run Again", "Share", "Export", etc.

**Do:**
- Present data clearly with confidence indicators
- Allow navigation to different views/results
- Show completion timestamp if relevant

**Don't:**
- Add celebratory or hyped language
- Hide confidence boundaries or evidence quality
- Overstate completeness (if coverage is limited, say so)

**Telemetry (optional):**
- `complete_state_viewed` (context: result type, data quality metrics)
- `result_action_taken` (action: export/share/navigate)

---

### Failed

**When it applies:**
- Operation encountered an error
- Data fetch failed
- Analysis generation failed

**User-facing message:**
- Clear explanation of what went wrong
- Actionable next steps
- Example: "Analysis generation failed. Please try again. If this persists, check your competitor URLs are accessible."

**Primary CTA:**
- "Retry" or "Try Again"

**Secondary CTA:**
- "Contact Support" or "View Help" (if error persists)
- "Cancel" or "Go Back" (if retry is not appropriate)

**Do:**
- Explain the error in user terms (avoid technical jargon)
- Provide actionable recovery steps
- Log technical details server-side for debugging

**Don't:**
- Use generic error messages without context
- Blame the user
- Show technical stack traces to end users
- Present transient errors as permanent failures

**Telemetry (optional):**
- `error_encountered` (error_type, context, user_action)
- `error_retry_clicked` (error_type)
- `error_support_contacted` (error_type)

---

## Language Rules (Trust Preservation)

### Allowed Terms

Use these terms to communicate confidence and evidence quality:

- **"directional"** — Signal suggests a direction but requires validation
- **"early signal"** — Initial evidence detected, more research needed
- **"confidence boundary"** — Explicit acknowledgment of uncertainty level
- **"evidence coverage"** — How comprehensively evidence covers a topic
- **"converging signals"** — Multiple independent sources pointing to same conclusion

### Avoid These Terms

Do not use language that overpromises or suggests false certainty:

- ❌ "AI magic" or "powered by AI" (too hyped, not informative)
- ❌ "guaranteed" or "definitive" (unless you can truly guarantee)
- ❌ "complete picture" (unless coverage is genuinely comprehensive)
- ❌ "perfect" or "flawless" (nothing is)
- ❌ Marketing buzzwords that don't add information value

### Tone Guidelines

- **Calm and direct** — State facts without hype
- **Transparent about limitations** — Acknowledge what is unknown
- **Actionable** — Focus on what users can do with the information
- **Respectful of user intelligence** — Avoid condescension or over-explanation

---

## Product Bar Mapping

When evaluating whether an opportunity or result is "ready to ship externally," consider these five questions:

### 1. Job not being done

**Guidance:** Is there a clear customer job (JTBD-framed) that current solutions are not addressing well? The opportunity should articulate a specific job, not just a generic problem.

**State mapping:** If this cannot be answered clearly, the opportunity is likely in an **exploratory** state.

### 2. For whom + context

**Guidance:** Can you identify the specific customer segment and context where this job gap matters most? Generic opportunities lack this specificity.

**State mapping:** Clear customer/context definition moves toward **directional** or **investment_ready**.

### 3. Why competitors miss it

**Guidance:** What structural or strategic reason prevents competitors from easily addressing this? This is about defensibility.

**State mapping:** Strong defensibility arguments indicate higher confidence (**directional** or **investment_ready**).

### 4. What evidence proves it

**Guidance:** What concrete evidence (citations, data points, market signals) supports the existence of this opportunity? Evidence quality and coverage matter.

**State mapping:** Limited evidence = **exploratory**. Strong, multi-source evidence = **investment_ready**.

### 5. Why it ranks above other bets

**Guidance:** Among all possible opportunities, why should this one be prioritized? This requires comparative evaluation.

**State mapping:** Clear ranking rationale suggests **investment_ready** readiness.

### Readiness Checklist

An opportunity is "ready to ship externally" when:

- ✅ All five questions can be answered with confidence
- ✅ Evidence coverage is **moderate** or **strong** (see coverage examples)
- ✅ Confidence level is **directional** or **investment_ready** (see opportunity examples)
- ✅ Risks and assumptions are explicitly documented
- ✅ Citations are present and traceable

If any question cannot be answered confidently, the opportunity may need more research or should be presented with appropriate confidence boundaries.

---

## Implementation Notes

### State Transitions

- **empty → running** — User initiates action
- **running → partial** — First results available (if applicable)
- **running → complete** — Operation finishes successfully
- **running → failed** — Operation encounters error
- **partial → complete** — Remaining processing finishes
- **partial → failed** — Processing encounters error
- **failed → running** — User retries

### Component Patterns

- Use consistent state detection logic across components
- Centralize state-to-message mapping where possible
- Prefer declarative state props over imperative logic
- Test all state transitions in component tests

### Accessibility

- Ensure loading states are announced to screen readers
- Error messages must be focusable and keyboard-navigable
- Empty states should provide alternative navigation paths
- Progress indicators should include aria-live regions for updates

---

## Related Documentation

- [Opportunity Model](../../../docs/OPPORTUNITY_MODEL.md) — Data structure for opportunities
- [Design System](../../../docs/principles/DesignSystem.md) — Visual design patterns
- [Microcopy](../../lib/copy/microcopy.ts) — User-facing copy library

