# Pricing Strategy

## Overview

db-gui uses a **Free + Pro + Team** pricing model designed to:
1. Maximize adoption with a generous free tier
2. Convert power users to Pro
3. Capture team/enterprise value

---

## Tier Definitions

### Free
**Price**: $0/month
**Target**: Individual developers, students, hobbyists, evaluation

| Feature | Included |
|---------|----------|
| Connect to PostgreSQL databases | ✓ |
| SQL editor with autocomplete | ✓ |
| Query execution & results | ✓ |
| Table browser | ✓ |
| Export to CSV | ✓ |
| Connection limit | 2 connections |
| Query history | Last 50 queries |

### Pro
**Price**: $12/month or $120/year (save 17%)
**Target**: Professional developers, freelancers, power users

Everything in Free, plus:

| Feature | Included |
|---------|----------|
| Unlimited connections | ✓ |
| Unlimited query history | ✓ |
| Export to CSV, JSON, Excel | ✓ |
| Visual query builder | ✓ |
| Schema diff & migrations | ✓ |
| Dark mode & themes | ✓ |
| SSH tunneling | ✓ |
| Priority support | ✓ |

### Team
**Price**: $29/user/month or $290/user/year (save 17%)
**Target**: Development teams, agencies, companies

Everything in Pro, plus:

| Feature | Included |
|---------|----------|
| Shared connections | ✓ |
| Team query library | ✓ |
| Role-based access control | ✓ |
| Audit logs | ✓ |
| SSO (SAML, OIDC) | ✓ |
| Admin dashboard | ✓ |
| Onboarding support | ✓ |
| SLA | 99.9% uptime |

---

## Feature Gating Philosophy

1. **Free should be genuinely useful** - Not crippled. A solo developer should be able to do real work.
2. **Pro unlocks power features** - Things that save time or enable workflows.
3. **Team is about collaboration** - Sharing, permissions, compliance.

---

## Competitive Positioning

| Competitor | Their Price | Our Advantage |
|------------|-------------|---------------|
| TablePlus | $99 one-time | More generous free tier, team features |
| DataGrip | $229/year | Lighter, faster, PostgreSQL-focused |
| DBeaver Pro | $210/year | Better UX, modern interface |
| pgAdmin | Free | Much better UX, pro features |

---

## Open Questions

- [ ] Should we offer a one-time "lifetime" Pro license?
- [ ] Enterprise tier for large orgs (1000+ seats)?
- [ ] Education/OSS discounts?
- [ ] What's the free trial length for Pro? (14 days? 30 days?)
