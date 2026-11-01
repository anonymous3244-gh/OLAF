# OLAF — Session Handover

Last updated: 2026-11-01

## 1. Current project status

**Phase:** Requirements clarification and initial architecture (Phase 0).

**Implementation has not started.**

The initial requirements, accepted decisions, architecture and development roadmap are documented.

The next objective is to resolve the remaining implementation-blocking questions before starting development.

## 2. Technology stack

| Component | Technology |
|---|---|
| Backend | C# / .NET 10 |
| Web application | ASP.NET Core Razor Pages |
| Dynamic interactions | HTMX |
| Data access | Entity Framework Core |
| Authentication | ASP.NET Core Identity |
| Version control | Git / GitHub |

Database provider and hosting environment remain undecided.

## 3. Documentation — source of truth

Always consult the repository documents before making assumptions:

| Document | Responsibility |
|---|---|
| `README.md` | Project overview and navigation |
| `PROJECT.md` | Functional requirements |
| `DECISIONS.md` | Authoritative accepted decisions |
| `ARCHITECTURE.md` | Technical architecture |
| `ROADMAP.md` | Development phases and progress |
| `SESSION.md` | Current session handover |

`PROJECT.md` and `DECISIONS.md` take precedence over historical discussions and session notes.

Do not duplicate their contents here.

## 4. Important context

- OLAF initially serves one business.
- Initial roles: Administrator, Rental manager and Cleaning staff.
- Customers have no application access in the initial release.
- The application is mobile-first.
- Everything occupying a facility is represented as a reservation.
- Customer reservations automatically generate associated cleaning reservations.
- Cleaning reservations are initially unassigned.
- Reservation operations involving associated customer and cleaning reservations must be atomic.
- Cleaning requires explicit staff completion and mandatory manager approval.

See `PROJECT.md` and `DECISIONS.md` for the complete requirements and business rules.

## 5. Outstanding work

Phase 0 is not yet complete.

Remaining architectural and technical questions include:

- Database provider and hosting.
- Solution/project structure and database schema.
- Reservation concurrency and idempotency implementation.
- File storage and background processing.
- Notification delivery.
- Detailed authorization policies.

Outstanding functional questions and their current status are maintained in `PROJECT.md` and `DECISIONS.md`.

## 6. Immediate next steps

1. Continue reviewing unresolved business requirements.
2. Resolve implementation-blocking architectural decisions.
3. Update `DECISIONS.md` when decisions are accepted.
4. Update `ARCHITECTURE.md` and `ROADMAP.md` when their contents change.
5. Complete Phase 0 before starting implementation.

## 7. Working preferences

- Keep discussions concise and focused.
- Explain important trade-offs.
- Raise significant questions early.
- Never silently turn proposals into accepted decisions.
- Prefer simple, maintainable solutions.
- Avoid premature abstractions and unnecessary complexity.
- Keep documentation synchronized with project decisions.

Repository: https://github.com/anonymous3244-gh/OLAF

The repository is the single source of truth for project documentation and development state.