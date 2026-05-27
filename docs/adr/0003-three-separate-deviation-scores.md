# ADR 0003: Three Separate Deviation Scores Per Headline

**Status**: Accepted  
**Date**: 2026-05-27

## Context

Each headline is analyzed across three dimensions: recent history (last 20-30 years), broad history (all of recorded history), and human nature (recurring patterns in human behavior). A design choice was whether to collapse these into a single overall deviation score or surface all three independently.

## Decision

Show three separate deviation scores — one per dimension — rather than a single aggregate score.

## Reasons

- **Richer signal**: An event can be "Within Norms" for recent history but "Historical Outlier" for broad history. Collapsing to a single score would hide this distinction, which is often the most interesting part of the analysis.
- **Avoids false precision**: Averaging three qualitative scores into one number implies a mathematical precision that doesn't exist. The scores are judgments, not measurements.
- **Supports the media literacy goal**: Showing all three separately forces the reader to engage with each layer rather than anchoring on a single verdict. This is central to what makes Strata different from a bias-rating app.
- **The evidence is the point**: The score alone is not the product — the historical context underneath each score is. Three scores create three natural entry points into that context.

## Consequences

- The UI must display three badges per headline without feeling cluttered. The current implementation uses compact colored badges with layer labels.
- Claude's prompt must request structured output for all three dimensions independently, which it does reliably.
- There is no single "how alarming is today's news" number, which means Strata cannot be summarized with a headline metric. This is intentional.
