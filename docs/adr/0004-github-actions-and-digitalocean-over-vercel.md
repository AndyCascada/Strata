# ADR 0004: GitHub Actions + DigitalOcean Over Vercel

**Status**: Accepted  
**Date**: 2026-05-27

## Context

The app needs a hosting platform and a mechanism to run the nightly analysis job. Vercel is the natural default for Next.js apps and offers built-in cron jobs. DigitalOcean with a VPS droplet is a more general-purpose option.

## Decision

Host on a DigitalOcean droplet managed by PM2, with GitHub Actions handling both deploys (on push to main) and the nightly analysis cron job (SSH into droplet, run script).

## Reasons

- **SQLite compatibility**: Vercel's serverless runtime has no persistent filesystem. SQLite requires a writable file on disk. Switching to Vercel would require replacing SQLite with a hosted database, adding cost and complexity. The DigitalOcean droplet has a persistent filesystem by default.
- **Cron job simplicity**: The nightly analysis script runs as a Node process with direct database access. On a VPS this is trivial. On Vercel it would require an HTTP endpoint, authentication, and a timeout-aware serverless function — more moving parts.
- **Cost**: A $6/month DigitalOcean droplet covers both the web app and the analysis job. Vercel's free tier does not include cron jobs and their Pro plan is $20/month before any database costs.
- **Control**: The VPS gives full control over the Node version, process management (PM2), and server configuration (nginx, SSL).

## Consequences

- Ops responsibility: server uptime, OS updates, and SSL renewal are self-managed. Vercel would have handled these automatically.
- Deploys are slightly more involved (SSH + git pull + build + PM2 reload) versus Vercel's git-push-to-deploy. The GitHub Actions workflow abstracts this away.
- Horizontal scaling requires manual work (load balancer, multiple droplets). Vercel scales automatically.

## Revisit When

- The app outgrows a single droplet and needs auto-scaling.
- The database is migrated to a hosted solution that is compatible with Vercel's serverless environment.
