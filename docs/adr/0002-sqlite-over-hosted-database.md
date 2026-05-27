# ADR 0002: SQLite Over a Hosted Database

**Status**: Accepted  
**Date**: 2026-05-27

## Context

Strata needs to store analyzed headlines. Options considered were SQLite (file-based, runs on the same server as the app) and a hosted database such as Supabase (Postgres) or PlanetScale (MySQL).

The data model is simple: one table, ~20 rows written per day, read-only after that. There are no concurrent writers and no need for cross-region replication.

## Decision

Use SQLite via Prisma 7 with the libSQL adapter. The database file lives on the DigitalOcean droplet alongside the app.

## Reasons

- **Scale fits**: 20 rows/day × 365 days = 7,300 rows/year. SQLite handles millions of rows without issue. There is no realistic growth scenario that SQLite cannot serve.
- **Simplicity**: No external service to provision, pay for, or lose connectivity to. The database is a single file on disk.
- **Cost**: Zero additional cost. A hosted Postgres instance would add $15–25/month for no benefit at this scale.
- **Backup**: The database file can be backed up with a simple `cp` or included in a DigitalOcean snapshot.

## Consequences

- The database cannot be accessed from multiple servers. If Strata ever needs horizontal scaling or multiple write sources (e.g., analysis running on a separate machine from the web app), this decision must be revisited.
- The nightly GitHub Actions job must SSH into the same droplet where the app runs rather than connecting to a database from the Actions runner directly.
- Migrations are managed with `prisma migrate deploy` and run on the droplet at deploy time.

## Revisit When

- The app needs to run on more than one server simultaneously.
- The analysis job needs to run somewhere other than the app server.
- A managed backup and point-in-time recovery solution becomes a requirement.
