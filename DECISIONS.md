# OLAF — Decision Log

Last updated: 2026-11-05

This document is the authoritative record of why significant business and technical choices were made. Functional requirements and business rules are maintained in `PROJECT.md`; technical architecture guidance is maintained in `ARCHITECTURE.md`.

## Decision format and status

Each decision retains its permanent ID, title, date and status. Related feature IDs identify the applicable requirements in `PROJECT.md`.

- **Accepted:** Currently agreed and applicable.
- **Deferred:** Intentionally postponed.
- **Superseded:** Replaced by a newer decision.

Decision IDs are permanent and must never be reused. When a decision changes, preserve the original record, mark it Superseded and create a new decision with the next available ID.

## 1. Accepted decisions

### DEC-001 — Initial deployment scope
- **Date:** 2026-11-01
- **Status:** Accepted
Initially serve one business. Multi-tenant support remains a future possibility. Use generic domain concepts where appropriate to avoid unnecessary coupling to one business.

### DEC-002 — Development principles
- **Date:** 2026-11-01
- **Status:** Accepted
Prefer simple, maintainable solutions; avoid premature abstractions; preserve future options where reasonably possible; discuss important decisions before implementation; develop incrementally and test each milestone; maintain documentation alongside implementation.

### DEC-003 — Mobile-first experience
- **Date:** 2026-11-01
- **Status:** Accepted
- **Related features:** USR, CLN

Provide a responsive, mobile-friendly interface, paying particular attention to small-screen workflows used by cleaning staff.

### DEC-004 — Unified reservation model
- **Date:** 2026-11-01
- **Status:** Accepted
- **Related features:** RES, AVL

Represent everything that occupies a bookable facility as a reservation. Use a unified model to simplify availability management and avoid artificial customer bookings for other facility activities.

### DEC-005 — Arbitrary reservation periods
- **Date:** 2026-11-01
- **Status:** Accepted
- **Related feature:** RES

Support custom start and end date/time values, including short, overnight and 24-hour-or-longer periods. Templates must not impose duration restrictions.

### DEC-006 — Reservation templates
- **Date:** 2026-11-01
- **Status:** Accepted
- **Related feature:** TMP

Use reusable, facility-specific reservation templates. Selecting a template populates the form, but managers retain control over all values and may enter custom values. The term *reservation template* is preferred over *shift template*.

### DEC-007 — Immediate confirmation and manager-managed reservations
- **Date:** 2026-11-01
- **Status:** Accepted
- **Related features:** RES, CUS, USR

Customer use reservations created by managers are confirmed immediately; there is no pending state in the initial release. Customers do not access OLAF or create reservations themselves.

### DEC-008 — No overlapping active reservations
- **Date:** 2026-11-01
- **Status:** Accepted
- **Related feature:** AVL

Active reservations of any type cannot overlap for the same facility. Managers cannot override conflicts. A facility can be taken Offline only after affected future Customer use reservations have been handled.

### DEC-009 — Cleaning between Customer use reservations
- **Date:** 2026-11-01
- **Status:** Accepted
- **Related features:** RES, AVL, CLN

A facility cannot transition directly from one Customer use reservation to another without the required Cleaning reservation.

### DEC-010 — Cancellation preserves reservation history
- **Date:** 2026-11-01
- **Status:** Accepted
- **Related features:** RES, AVL

Cancellation sets the reservation's cancellation state (`IsCancelled = true`) without deleting it or changing its original dates and times. Cancelled reservations do not block availability, so cancellation does not require availability validation.

### DEC-011 — Customer use completion is time-based
- **Date:** 2026-11-01
- **Status:** Accepted
- **Related feature:** RES

A Customer use reservation is considered completed when its end time passes. No separate completion status or database update is needed merely because it has ended.

### DEC-012 — Cleaning duration belongs to the facility
- **Date:** 2026-11-01
- **Status:** Accepted
- **Related features:** FAC, CLN

Each facility has one mandatory cleaning-duration setting. There is no separate cleaning-buffer setting; the configured duration determines generated Cleaning reservation length.

### DEC-013 — Every Customer use reservation generates one Cleaning reservation
- **Date:** 2026-11-01
- **Status:** Accepted
- **Related features:** RES, CLN

Generate exactly one associated Cleaning reservation for every Customer use reservation, and keep a reference to the associated Cleaning reservation on the Customer use reservation. Generate it eagerly, starting at the end of Customer use, with the facility's configured duration, a fixed deadline and no initial assignee. This ensures facilities can be cleaned as early as possible.

### DEC-014 — Standalone Cleaning reservations
- **Date:** 2026-11-01
- **Status:** Accepted
- **Related feature:** CLN

Managers may create standalone Cleaning reservations without an associated Customer use reservation.

### DEC-015 — Atomic Customer use and Cleaning creation
- **Date:** 2026-11-01
- **Status:** Accepted
- **Related features:** RES, CLN, AVL

Create the Customer use reservation and its associated Cleaning reservation as one atomic operation. Both must pass availability validation; if either conflicts, neither is created.

### DEC-016 — Atomic Customer use and Cleaning modification
- **Date:** 2026-11-01
- **Status:** Accepted
- **Related features:** RES, CLN, AVL, AUD

Modify the Customer use reservation and its associated Cleaning reservation together, validating both and rolling back both if either change fails. Automatic associated-cleaning changes are allowed only before Customer use starts. Managers may independently edit Cleaning reservations. Record modifications in audit history.

### DEC-017 — Atomic Customer use and Cleaning cancellation
- **Date:** 2026-11-01
- **Status:** Accepted
- **Related features:** RES, CLN, AVL

Cancelling a Customer use reservation also cancels its associated Cleaning reservation atomically. Preserve dates and times and do not perform availability validation. Standalone Cleaning reservations may be cancelled independently.

### DEC-018 — Manual Cleaning assignment
- **Date:** 2026-11-01
- **Status:** Accepted
- **Related feature:** CLN

Generated Cleaning reservations start unassigned. Managers assign one cleaning staff member and may change the assignment. Automatic staff scheduling by shifts or workload is deferred.

### DEC-019 — Explicit Cleaning completion
- **Date:** 2026-11-01
- **Status:** Accepted
- **Related feature:** CLN

Cleaning requires an explicit completion action by assigned staff, including checklist completion and submission for manager review.

### DEC-020 — Mandatory manager approval
- **Date:** 2026-11-01
- **Status:** Accepted
- **Related feature:** CLN

Every completed Cleaning reservation requires manager approval. The workflow states are Pending, Completed, Correction requested and Approved.

### DEC-021 — Cleaning corrections require resubmission
- **Date:** 2026-11-01
- **Status:** Accepted
- **Related feature:** CLN

When corrections are requested, the assigned staff member corrects the specified checklist steps and resubmits the task. The cycle may repeat until approval.

### DEC-022 — No complex Cleaning escalation
- **Date:** 2026-11-01
- **Status:** Accepted
- **Related features:** CLN, NTF

Provide visibility into upcoming, overdue, awaiting-approval and correction-required Cleaning reservations, and warn managers when a Cleaning deadline passes without completion. Do not add automatic approvals, artificial deadline extensions or complex escalation. People remain responsible for resolving operational exceptions directly.

Rationale: OLAF should support operational accountability rather than attempt to automate every exceptional human situation.

### DEC-023 — Cleaning operations are auditable
- **Date:** 2026-11-01
- **Status:** Accepted
- **Related feature:** AUD

Record important Cleaning events, including assignment changes, completion submissions, approvals, correction requests, affected checklist steps and resubmissions.

### DEC-024 — Customers are managed by rental managers
- **Date:** 2026-11-01
- **Status:** Accepted
- **Related feature:** CUS

Customer management is part of the initial release. Managers maintain customer records and view reservation history; customers have no application access initially.

### DEC-025 — Customer selection during reservation creation
- **Date:** 2026-11-01
- **Status:** Accepted
- **Related features:** CUS, RES

Provide searchable selection of existing customers and a convenient way to create and automatically select a new customer without leaving the reservation form. An inline or modal interface is suitable.

### DEC-026 — Initial user roles
- **Date:** 2026-11-01
- **Status:** Accepted
- **Related feature:** USR

The initial roles are Administrator, Rental manager and Cleaning staff. Authorization must restrict operations according to each role's responsibilities.

### DEC-027 — Initial technology stack
- **Date:** 2026-11-01
- **Status:** Accepted
- **Related architecture:** ARCHITECTURE.md

The initial stack is C#/.NET 10, ASP.NET Core Razor Pages, HTMX, Entity Framework Core, ASP.NET Core Identity and Git/GitHub. SQL Server Express is the selected database provider. The preferred deployment model is a standalone .NET application hosted by Kestrel behind a reverse proxy such as Nginx; containerization remains an option.

### DEC-028 — UTC timestamp storage
- **Date:** 2026-11-01
- **Status:** Accepted
- **Related features:** RES, CLN, AUD

Store timestamps in UTC, display times in the browser's local time zone and perform appropriate time-zone conversions at application boundaries.

### DEC-029 — Idempotent reservation operations
- **Date:** 2026-11-01
- **Status:** Accepted
- **Related features:** RES, CLN

Repeated submissions of the same logical operation must not create duplicate reservations or associated Cleaning reservations. The implementation remains to be investigated.

### DEC-030 — Optimistic concurrency for editing
- **Date:** 2026-11-01
- **Status:** Accepted
- **Related features:** RES, AVL

Detect stale updates when multiple managers edit the same reservation. Never silently overwrite another manager's changes. The specific EF Core implementation remains to be investigated.

### DEC-031 — Audit history
- **Date:** 2026-11-01
- **Status:** Accepted
- **Related feature:** AUD

Maintain an audit history recording who performed an operation, what changed, when it happened and previous/new values where appropriate. Important changes include reservation dates, prices, types, statuses, cancellations, assignments and Cleaning workflow events.

### DEC-032 — Photograph storage
- **Date:** 2026-11-01
- **Status:** Accepted
- **Related features:** CLN

Store photographs as files rather than database blobs. Store file references and relevant metadata in the database. The storage implementation remains undecided.

### DEC-033 — SQL Server Express database provider
- **Date:** 2026-11-03
- **Status:** Accepted
- **Related architecture:** ARCHITECTURE.md

Use SQL Server Express as the initial database engine and Microsoft's EF Core SQL Server provider. Keep provider-specific configuration and implementation details at the Infrastructure/composition boundary. Prefer provider-neutral EF Core and LINQ for ordinary data access, and avoid unnecessary SQL Server-specific dependencies so a future PostgreSQL migration remains feasible. Provider portability is a desirable option, not a requirement; do not introduce speculative abstraction or compromise the initial implementation to guarantee it.

### DEC-034 — Standalone Kestrel deployment behind a reverse proxy
- **Date:** 2026-11-03
- **Status:** Accepted

The preferred deployment model is a standalone .NET application hosted by Kestrel behind a reverse proxy such as Nginx. Containerization may be introduced later but is not a requirement for the initial deployment. The exact hosting provider and server environment remain open.

### DEC-035 — One-time initial Administrator provisioning
- **Date:** 2026-11-05
- **Status:** Accepted
- **Related feature:** USR

Create the initial Administrator through a separate, explicitly invoked setup command after database migrations. Prompt for an email address, generate a temporary password and display it once, and require a password change at first sign-in. Do not modify an existing Administrator or automatically recreate one if all administrators are later deleted.

## 2. Deferred decisions

- **Hosting environment:** The deployment model is selected; the concrete hosting provider and server environment remain open.
- **Audit implementation:** The required audit information and events are established; the technical implementation remains open.
- **Photograph storage provider:** File-based storage is established; the concrete storage location/provider remains open.
- **Idempotency implementation:** The required behavior is established; the implementation remains open.
- **Concurrency implementation:** Stale updates must be detected; the concrete EF Core mechanism remains open.

## 3. Superseded decisions

No decisions have been superseded.

## 4. Future considerations

These items are not committed to the initial release. IDs and their order are stable.

| ID | Topic | Status |
|---|---|---|
| FUT-001 | Multi-tenant support | Future consideration |
| FUT-002 | Customer self-service reservations | Future consideration |
| FUT-003 | Payments and invoicing | Future consideration |
| FUT-004 | Android caller-identification application | Future consideration |
| FUT-005 | External booking-channel integrations | Future consideration |
| FUT-006 | Automatic cleaning staff scheduling | Deferred |
| FUT-007 | WebAuthn/passkeys | Future consideration |
| FUT-008 | mTLS | Future consideration |
| FUT-009 | Advanced APIs and integrations | Future consideration |
| FUT-010 | Advanced analytics | Future consideration |

Customer self-service requires further consideration of prepayment or customer-specific trust rules because Customer use reservations are immediately confirmed.

The possibility of automated email and push notifications is recorded in `PROJECT.md` as an uncommitted future enhancement. It has not been assigned a FUT ID or promoted to a committed future consideration.

## 5. Decision history

This log records decisions that have been explicitly accepted. Proposals must never be recorded as accepted decisions without explicit agreement.

When an accepted decision changes:
- Mark the existing decision Superseded.
- Preserve its original content and rationale.
- Create a new decision with a new permanent ID.
- Reference the superseded decision where appropriate.

New decisions receive the next available DEC ID. Feature IDs are defined in `PROJECT.md` and reused here without creating a separate registry.
