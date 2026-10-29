# Indlela

Indlela (isiZulu for "path") is a mobile-first app that helps unemployed youth (18–35) in Rustenburg, North West affordably reach job opportunities. Transport costs from minibus taxi fares are factored into job listings, so users only see opportunities they can actually afford to attend.

## Problem

Youth unemployment in North West sits at 58.8% (QLFS Q1:2025). Minibus taxi fares make up a large share of a job seeker's budget, and fares rise with fuel prices. Most job boards show distance but not affordability — young people waste money on interviews they can't afford, or skip them entirely.

## Solution

Indlela combines two MVP features:

- **Dynamic Fare Index** — crowdsourced, up-to-date minibus taxi fares per rank and route, with fuel-price-aware alerts for upcoming fare increases. Cached offline for low-data use.
- **Affordability-First Job Feed** — jobs sorted by net gain (estimated wage minus round-trip transport cost), with a "Jobs I can afford this week" filter based on the user's weekly transport budget.

## Platform

Android mobile app (built and tested on Android first). iPhone is a future feature.

## Focus area (MVP)

Rustenburg, North West — specifically the top 5 taxi ranks in the area.

## Key features

| ID | Feature | Priority |
|---|---|---|
| F1 | Onboarding & Accounts | Must |
| F2 | Dynamic Fare Index | Must |
| F3 | Affordability-First Job Feed | Must |
| F4 | Fare Alerts & Budgeting | Should |
| F5 | Data-light & Offline Support | Should |

## Non-goals (v1)

- Ride hailing / taxi booking
- Voucher redemption
- User-to-user messaging
- Push notifications at scale
- Expansion beyond Rustenburg

## Repository structure

```
indlela-mvp/
├── README.md
├── docs/
│   ├── IDEA.md              # Original app concept document
│   ├── PRD.md               # Product requirements document (v0.4)
│   └── stitch-prompts.md    # Google Stitch UI design prompts
```

## Documentation

- [App Concept Document](docs/IDEA.md)
- [Product Requirements Document](docs/PRD.md)
- [Google Stitch Design Prompts](docs/stitch-prompts.md)

## Tech stack (planned)

- **Frontend:** Android (Kotlin)
- **Backend/Auth/DB:** Supabase
- **Fuel price data:** Manual snapshot (v1)

## Status

v0.4 — Approved PRD. Design prompts ready. Implementation pending.

## License

TBD
