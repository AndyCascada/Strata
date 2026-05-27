# ADR 0001: Pre-Analysis Over Real-Time

**Status**: Accepted  
**Date**: 2026-05-27

## Context

Strata adds three layers of historical context to news headlines using Claude. The core question was when to run that analysis: on-demand when a user opens a story, or on a scheduled batch before users arrive.

Real-time analysis would mean each headline is analyzed the moment a user requests it, keeping content maximally fresh. Pre-analysis means running Claude on yesterday's top 20 headlines overnight, so results are waiting when users open the app in the morning.

## Decision

Pre-analyze the previous day's top 20 headlines each night via a scheduled cron job (2am ET). Users always see fully-analyzed results — no waiting.

## Reasons

- **Product fit**: The app's value proposition is deliberate historical perspective, not breaking news. The "thought was given" feeling is part of the brand. Instant analysis would undercut that.
- **Cost**: 20 Claude API calls per day is predictable and cheap (~$0.10–0.50/day). On-demand analysis at scale could be orders of magnitude more expensive.
- **UX**: No loading spinners waiting for Claude. Every headline is already complete when the app opens.
- **Simplicity**: A cron job is far simpler to operate than a real-time analysis queue with caching, rate limiting, and retry logic.

## Consequences

- Content is always one day old by design. This is a feature, not a bug, but it means Strata is not suitable for breaking news.
- If the nightly job fails, users see an empty state for that day. Alerting on job failures is important.
- Re-running analysis for the same headline is idempotent (duplicate URLs are skipped), so re-running a failed job is safe.
