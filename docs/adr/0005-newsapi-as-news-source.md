# ADR 0005: NewsAPI as the News Source

**Status**: Accepted  
**Date**: 2026-05-27

## Context

Strata needs a source of daily top headlines. Options considered included NewsAPI (newsapi.org), The Guardian API, GDELT, and direct RSS aggregation from major outlets.

## Decision

Use NewsAPI's `/v2/everything` endpoint, filtered by a broad keyword query sorted by popularity, to fetch the previous day's top 20 headlines.

## Reasons

- **Speed to working product**: NewsAPI has a clean REST API, reliable uptime, and a free developer tier that covers 20 requests/day comfortably.
- **Popularity sorting**: The `sortBy=popularity` parameter surfaces articles that gained traction, which aligns with the use case — we want the stories people actually saw, not just anything published that day.
- **Broad coverage**: NewsAPI aggregates hundreds of sources across politics, technology, science, business, and world news, which suits Strata's goal of broad, non-US-centric coverage.

## Limitations

- **Free tier restrictions**: The developer tier (free) only allows queries for articles up to 1 month old and limits to 100 requests/day. The paid plan ($449/month) removes these limits. This is not a current constraint but is worth monitoring.
- **US and English bias**: Despite aiming for broader coverage, NewsAPI's most popular results skew toward English-language and US-focused sources. The keyword query partially mitigates this but does not eliminate it.
- **No direct "top headlines by global impact" signal**: Popularity is a proxy for importance. Highly-shared entertainment or sports stories can crowd out substantive news.
- **Source quality varies**: NewsAPI includes sources of varying editorial quality. No filtering by source credibility is currently applied.

## Revisit When

- The developer tier's 1-month article limit becomes a constraint (e.g., for backfilling historical dates).
- A more editorially curated or globally representative source is identified.
- The keyword query approach produces consistently poor headline selection and needs rethinking.
