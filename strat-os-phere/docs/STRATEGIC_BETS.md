# Strategic Bets

## What Strategic Bets Are (and Aren't)

Strategic Bets are **commitment-ready decisions** that synthesize existing analytical artifacts (Jobs to Be Done, Opportunities, Competitive Scores, Live Market Signals) into concrete bets suitable for VP+ Product and UX leaders.

### What They Are

- **Decision-ready commitments** that force explicit tradeoffs
- **Synthesized insights** from multiple analytical artifacts
- **Concrete bets** with clear success/failure criteria
- **Organizational implications** that surface required capabilities
- **Competitive defensibility** based on structural constraints, not speed or brand

### What They Aren't

- **Not ideas or opportunities** — they are commitments under constraint
- **Not generic recommendations** — they are opinionated and uncomfortable (in a good way)
- **Not aspirational** — competitor defensibility must be structural, not "we can move faster"
- **Not research or planning** — first proof must be behavioral, testable in 2–4 weeks

## How They're Generated

Strategic Bets are generated as part of the Results v2 pipeline, after Jobs to Be Done, Opportunities, and Scoring Matrix have been created.

### Generation Process

1. **Input artifacts consumed:**
   - Jobs to Be Done (JTBD)
   - Opportunities v2
   - Scoring matrix
   - Live market signals (from competitor snapshots)

2. **Synthesis:**
   - LLM analyzes all artifacts to identify patterns
   - Candidate bets are ranked internally
   - Top 2–4 bets are selected (mutually exclusive or clearly competing)

3. **Validation:**
   - Each bet is validated against the schema
   - Banned language is detected and penalized
   - Quality signals are computed

4. **Storage:**
   - Stored as `artifact_type = "strategic_bets"`
   - Linked to the same `run_id` as other Results v2 artifacts

### Prompt Rules

The generation prompt enforces strict quality standards:

- **Banned language:** "leverage", "enhance", "delight", "best-in-class"
- **Mutual exclusivity:** Bets must be mutually exclusive or clearly competing
- **Real sacrifice:** Every bet must involve a real sacrifice
- **Structural defensibility:** Competitor constraints must be structural, not aspirational
- **Behavioral proof:** First proof must be behavioral, not research or planning

## How Leaders Should Use Them

Strategic Bets are designed to be used in strategy discussions and decision-making contexts.

### Decision-Making

Each bet is structured to answer key questions a VP+ leader would ask:

1. **What are we committing to?** (Title + Summary)
2. **What are we saying no to?** (What we say no to)
3. **What must we build?** (Forced capabilities)
4. **Why won't competitors follow?** (Why competitors won't follow)
5. **How do we validate this?** (First real-world proof)
6. **When do we stop?** (Invalidation signals)

### Usage Patterns

- **Strategy offsites:** Use bets as discussion starters for leadership alignment
- **Product planning:** Reference bets when prioritizing roadmap items
- **Resource allocation:** Use forced capabilities to identify org gaps
- **Risk management:** Monitor invalidation signals to know when to pivot

### Copy to Clipboard

Each bet can be copied as markdown for use in:
- Strategy documents
- Product planning tools
- Executive presentations
- Team alignment sessions

## Common Misinterpretations

### "These are just opportunities"

**No.** Strategic Bets are commitments under constraint. They force explicit tradeoffs and require specific capabilities. Opportunities are inputs; bets are outputs.

### "We can do all of these"

**No.** Bets are designed to be mutually exclusive or clearly competing. Choosing one bet means deprioritizing others. This is intentional.

### "Competitors can just copy this"

**No.** Each bet includes "Why competitors won't follow" that explains structural constraints (pricing model, customer segments, architecture, business model). If the defensibility is only "we can move faster," the bet is invalid.

### "This is just planning"

**No.** First real-world proof must be behavioral and testable in 2–4 weeks. Research and planning don't count. You must be able to observe actual behavior change.

### "High confidence means guaranteed success"

**No.** Confidence scores (0–100) reflect signal strength, consensus, and data freshness. They indicate how well-supported the bet is, not how likely it is to succeed. All bets require validation.

## Schema Structure

Each Strategic Bet includes:

- **id:** Unique identifier
- **title:** Specific, non-buzzword-y title
- **summary:** 2–3 sentence plain-English description
- **opportunity_source_ids:** References to Opportunities v2 / JTBD IDs used
- **what_we_say_no_to:** Explicit deprioritized directions, features, or customers
- **forced_capabilities:** Capabilities, systems, or org muscles required to win
- **why_competitors_wont_follow:** Structural, economic, or organizational friction
- **first_real_world_proof:** Behavioral test with timeframe and success signal
- **invalidation_signals:** What evidence would prove this bet is wrong
- **confidence_score:** 0–100 derived from signal strength, consensus, and data freshness
- **supporting_signals:** Array of signal sources with citation counts
- **created_at:** ISO 8601 timestamp
- **schema_version:** Always 1

## Future: Co-Creation Roadmap

While Strategic Bets are currently read-only (no editing, voting, or approvals), future enhancements may include:

- **Co-creation:** Allow leaders to refine bets based on organizational context
- **Collaboration:** Share bets with stakeholders for feedback
- **Tracking:** Monitor progress against first real-world proof
- **Iteration:** Update bets based on invalidation signals

These features are explicitly out of scope for the current version, which focuses on clarity first, not workflow.

## Related Documentation

- [RESULTS_V2.md](./RESULTS_V2.md) — Results v2 generation pipeline
- [SCHEMAS.md](../docs/Schemas.md) — Schema definitions
- [GUARDRAILS.md](./GUARDRAILS.md) — Quality guardrails and validation

