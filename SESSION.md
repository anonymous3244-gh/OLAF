# OLAF — Session Handover

Last updated: 2026-11-01

## 1. Project status

OLAF is a mobile-first rental management application for managing bookable facilities, customer reservations, cleaning operations and operational reporting.

**Current phase:** Requirements clarification and initial architecture design.

**Implementation has not started.**

The initial release serves one business and has three user roles:

- Administrator
- Rental manager
- Cleaning staff

Customers do not have application access in the initial release.

## 2. Technology stack

| Component | Technology |
|---|---|
| Backend | C# / .NET 10 |
| Web application | ASP.NET Core Razor Pages |
| Dynamic interactions | HTMX |
| Data access | Entity Framework Core |
| Authentication | ASP.NET Core Identity |
| Version control | Git / GitHub |
| Database provider | Undecided |
| Hosting environment | Undecided |

## 3. Authoritative documentation

Always consult these documents before making assumptions:

- `README.md` — Project overview and documentation index.
- `PROJECT.md` — Functional requirements and application scope.
- `DECISIONS.md` — Authoritative record of accepted decisions.
- `ARCHITECTURE.md` — Technical architecture (being prepared).
- `ROADMAP.md` — Development milestones (being prepared).

`DECISIONS.md` takes precedence over older discussions and session notes.

Never treat proposals or future considerations as accepted decisions.

## 4. Important domain concepts

- Everything occupying a facility is represented as a reservation.
- Reservation types initially include customer use, cleaning and offline/unavailable periods.
- Reservations support arbitrary start/end date-times, including overnight and 24-hour periods.
- Reservation templates provide reusable default times and prices.
- Active reservations belonging to the same facility must never overlap.
- Every customer reservation automatically generates exactly one associated cleaning reservation.
- Cleaning reservations occupy the facility and participate in availability validation.
- Cleaning duration is mandatory and configured per facility.
- Automatically generated cleaning reservations are initially unassigned.
- Managers manually assign cleaning staff.
- Standalone cleaning reservations are supported.
- Customer reservations are considered completed based on their end timestamps.
- Cleaning requires explicit staff completion and mandatory manager approval.

See `PROJECT.md` and `DECISIONS.md` for the complete business rules.

## 5. Critical reservation rules

Customer reservations and their associated cleaning reservations must be handled atomically.

- Creation: Both reservations must be created successfully or neither is created.
- Modification: Both reservations must be updated successfully or neither is updated.
- Cancellation: Both reservations must be cancelled successfully or neither is cancelled.
- Automatic modification of associated cleaning is only allowed before the customer reservation starts.
- Cancelled reservations remain in the database but no longer block availability.
- Managers cannot override reservation conflicts.
- Reservation operations must prevent accidental duplicates and detect concurrent modifications.

## 6. Cleaning workflow

Cleaning reservations have four states:

1. Pending.
2. Completed (submitted for manager approval).
3. Correction requested.
4. Approved.

When corrections are requested, staff must correct the specified checklist items and resubmit the task.

Important cleaning events must be auditable.

Managers must receive a warning when a cleaning reservation reaches its deadline without completion.

Complex automatic escalation and automatic staff scheduling are not part of the initial release.

## 7. Technical principles

- Store timestamps in UTC and display them in the browser's local time zone.
- Use appropriate time-zone conversions at application boundaries.
- Maintain an audit history of important operations.
- Detect stale concurrent updates instead of silently overwriting changes.
- Prevent duplicate logical submissions.
- Store photographs as files, with references and metadata in the database.
- Prioritize responsive, mobile-first interfaces.
- Prefer simple, maintainable solutions over premature abstractions.
- Discuss significant business and architectural decisions before implementation.

## 8. Outstanding architectural decisions

- Database provider and hosting environment.
- Application structure and project boundaries.
- Domain entity relationships and database schema.
- Reservation overlap prevention under concurrent transactions.
- Idempotency implementation.
- EF Core optimistic concurrency implementation.
- Time-zone and daylight-saving handling.
- Photograph storage implementation.
- Background processing and deadline notifications.
- Notification delivery mechanism.

## 9. Outstanding requirements clarification

- Reservation search and filtering.
- Final reservation type/purpose definitions.
- Detailed cleaning checklist configuration.
- Reporting definitions and calculations.
- Notification channels and delivery preferences.
- Detailed user permissions.

Consult `PROJECT.md` and `DECISIONS.md` before adding or changing requirements.

## 10. Next steps

1. Finalize the outstanding business requirements.
2. Complete `ARCHITECTURE.md`.
3. Complete `ROADMAP.md`.
4. Review and synchronize `README.md`, `PROJECT.md` and `DECISIONS.md`.
5. Begin implementation only after the initial architecture and critical business rules are sufficiently defined.

## 11. Working guidelines for future sessions

- Read this document and the authoritative project documents before continuing.
- Do not repeat already accepted decisions as open questions.
- Record newly accepted decisions in `DECISIONS.md`.
- Update `PROJECT.md` when functional requirements change.
- Update `ARCHITECTURE.md` when technical design decisions are finalized.
- Update `ROADMAP.md` as milestones and progress change.
- Keep this handover concise and focused on genuinely useful session context.