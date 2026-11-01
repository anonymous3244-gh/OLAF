# OLAF — Decision Log

Last updated: 2026-11-01

This document records business and architectural decisions that have been explicitly discussed and accepted.

It serves as the authoritative record of accepted decisions.

## Decision format

Each decision contains:
- **ID:** Unique decision identifier.
- **Date:** Date the decision was accepted.
- **Status:** Current decision status.
- **Decision:** What was agreed.
- **Rationale:** Why the decision was made, where useful.

Decision statuses:
- **Accepted:** Currently agreed and applicable.
- **Deferred:** Intentionally postponed.
- **Superseded:** Replaced by a newer decision.

---

# 1. Project scope and principles

## DEC-001: Initial deployment scope

- **Date:** 2026-11-01
- **Status:** Accepted

OLAF initially serves a single business.

Multi-tenant support is a possible future requirement but is not part of the initial implementation.

The application should use generic domain concepts where appropriate to avoid unnecessary coupling to a particular business.

## DEC-002: Development principles

- **Date:** 2026-11-01
- **Status:** Accepted

Development should follow these principles:

- Prefer simple, maintainable solutions.
- Avoid premature abstractions and unnecessary complexity.
- Preserve future options where reasonably possible.
- Discuss important business and architectural decisions before implementation.
- Develop incrementally and test each milestone.
- Maintain documentation alongside implementation.

## DEC-003: Mobile-first experience

- **Date:** 2026-11-01
- **Status:** Accepted

OLAF must provide a responsive, mobile-friendly interface.

Particular attention should be given to efficient use of small screens, especially for cleaning staff performing their daily tasks.

---

# 2. Reservation model

## DEC-004: Everything occupying a facility is a reservation

- **Date:** 2026-11-01
- **Status:** Accepted

Everything that occupies a bookable facility is represented as a reservation.

Initial reservation types include:
- Customer use.
- Cleaning.
- Offline/unavailable periods.

Reservations share common concepts such as facility, start/end date/time and type/purpose.

Price and assignee are optional because they are not meaningful for every reservation type.

Rationale: A unified reservation model simplifies availability management and prevents the need for artificial customer bookings to represent other facility activities.

## DEC-005: Reservations support arbitrary time periods

- **Date:** 2026-11-01
- **Status:** Accepted

Reservations must support arbitrary start and end date/time values.

Supported durations include:
- A few hours.
- 24 hours or longer.
- Overnight periods.
- Manually entered custom periods.

Reservation templates must not impose artificial restrictions on reservation duration.

## DEC-006: Reservation templates

- **Date:** 2026-11-01
- **Status:** Accepted

Reusable reservation templates contain:
- Name.
- Start time.
- End time.
- Price.

Templates can be associated with specific facilities.

Selecting a template populates the reservation form, but managers can modify all values or enter custom values.

Templates must support overnight periods and 24-hour reservations.

The term *reservation template* is preferred over *shift template*.

## DEC-007: Customer reservations are immediately confirmed

- **Date:** 2026-11-01
- **Status:** Accepted

Every customer reservation created by a manager is confirmed immediately.

There is no pending customer reservation state in the initial release.

Customers cannot access the application or create reservations themselves.

## DEC-008: No overlapping active reservations

- **Date:** 2026-11-01
- **Status:** Accepted

Two active reservations must never overlap for the same facility.

This applies to every reservation type, including:
- Customer use.
- Cleaning.
- Offline/unavailable periods.

Managers cannot override reservation conflicts.

If a facility needs to be taken offline despite existing future reservations, affected customer reservations must first be handled manually by contacting customers and cancelling or rescheduling their reservations.

## DEC-009: Consecutive customer reservations are not allowed

- **Date:** 2026-11-01
- **Status:** Accepted

Cleaning must take place between customer reservations.

A facility cannot transition directly from one customer reservation to another without the required cleaning reservation.

## DEC-010: Cancellation does not remove reservations

- **Date:** 2026-11-01
- **Status:** Accepted

Cancelled reservations remain in the database for historical and reporting purposes.

Cancellation changes the reservation's cancellation state (`IsCancelled = true`).

The original start and end times remain unchanged.

Cancelled reservations no longer block availability.

Cancellation does not require availability/conflict validation because it does not introduce or modify occupied time periods.

## DEC-011: Customer reservation completion is time-based

- **Date:** 2026-11-01
- **Status:** Accepted

Customer reservations do not require an explicit completed status.

Once their end time passes, they are considered completed based on their timestamps.

No database update is necessary merely because a reservation has ended.

Rationale: An additional completion status would not provide meaningful information for customer reservations.

---

# 3. Cleaning operations

## DEC-012: Cleaning duration belongs to the facility

- **Date:** 2026-11-01
- **Status:** Accepted

Every facility has a mandatory cleaning duration setting.

This represents the time required to clean the facility after customer use.

There are no separate cleaning-duration and cleaning-buffer settings.

The configured duration determines the length of automatically generated cleaning reservations.

## DEC-013: Every customer reservation creates a cleaning reservation

- **Date:** 2026-11-01
- **Status:** Accepted

Creating a customer reservation automatically creates exactly one associated cleaning reservation.

Every customer reservation has a reference to its associated cleaning reservation.

The cleaning reservation:
- Starts when the customer reservation ends.
- Has a duration equal to the facility's configured cleaning duration.
- Has a fixed end time, which is its deadline.
- Is initially unassigned.

Cleaning reservations are generated eagerly, even when no subsequent customer reservation exists.

Rationale: Facilities should be cleaned as early as possible and remain ready for future customers.

## DEC-014: Standalone cleaning reservations are allowed

- **Date:** 2026-11-01
- **Status:** Accepted

Managers can create as many standalone cleaning reservations as necessary.

Standalone cleaning reservations do not require an associated customer reservation.

## DEC-015: Customer and cleaning reservation creation is atomic

- **Date:** 2026-11-01
- **Status:** Accepted

Creating a customer reservation and its associated cleaning reservation is one atomic operation.

Both reservations must pass availability validation.

If either reservation conflicts with an existing active reservation, neither reservation is created.

There must never be a customer reservation without its associated cleaning reservation, or vice versa as a result of a failed creation operation.

## DEC-016: Customer and cleaning reservation modifications are atomic

- **Date:** 2026-11-01
- **Status:** Accepted

Modifying a customer reservation automatically adjusts its associated cleaning reservation.

Both changes must:
- Be validated against existing reservations.
- Succeed together.
- Be rolled back together if either change fails.

Automatic changes to the associated cleaning reservation are only permitted if the customer reservation has not started.

Once a customer reservation has started, it cannot be cancelled or modified in a way that requires changing its associated cleaning reservation.

Managers can independently edit cleaning reservations when necessary.

All modifications must be recorded in the audit history.

## DEC-017: Customer and cleaning reservation cancellation is atomic

- **Date:** 2026-11-01
- **Status:** Accepted

Cancelling a customer reservation also cancels its associated cleaning reservation.

Both cancellation state changes must succeed together.

Cancellation does not modify reservation dates or times and does not require availability validation.

Standalone cleaning reservations can be cancelled independently.

## DEC-018: Cleaning reservations are initially unassigned

- **Date:** 2026-11-01
- **Status:** Accepted

Automatically generated cleaning reservations are initially created without an assigned cleaning staff member.

Managers manually assign one cleaning staff member.

Managers can change assignments when necessary.

Automatic staff scheduling based on working shifts and workload is deferred.

## DEC-019: Cleaning requires explicit completion

- **Date:** 2026-11-01
- **Status:** Accepted

Unlike customer reservations, cleaning reservations require an explicit completion action from the assigned cleaning staff member.

Cleaning staff must complete the required checklist and submit the cleaning for manager review.

## DEC-020: Manager approval is mandatory

- **Date:** 2026-11-01
- **Status:** Accepted

Every completed cleaning reservation requires manager approval.

Cleaning staff submission alone does not mean the cleaning operation has been approved.

The cleaning workflow has four states:

- Pending.
- Completed (submitted for approval).
- Correction requested.
- Approved.

## DEC-021: Cleaning corrections require staff resubmission

- **Date:** 2026-11-01
- **Status:** Accepted

When a manager requests corrections:
- The manager identifies the checklist steps requiring correction.
- The assigned cleaning staff member can reopen the cleaning task.
- The staff member corrects the specified steps.
- The staff member resubmits the cleaning for manager approval.

The workflow can repeat until approval.

## DEC-022: No complex cleaning escalation workflow

- **Date:** 2026-11-01
- **Status:** Accepted

The system should provide visibility into:
- Upcoming cleaning deadlines.
- Overdue cleaning reservations.
- Cleaning awaiting manager approval.
- Cleaning requiring corrections.

Managers must receive a warning/notification when a cleaning reservation reaches its end time without being marked as completed.

No automatic approval, artificial deadline extensions or complex escalation mechanisms are planned.

Managers and cleaning staff are responsible for ensuring facilities are ready before customers arrive.

If a cleaning or approval delay affects an upcoming customer arrival, the responsible people must resolve the situation directly.

Rationale: OLAF should support operational accountability rather than attempt to automate every exceptional human situation.

## DEC-023: Cleaning operations must be auditable

- **Date:** 2026-11-01
- **Status:** Accepted

Important cleaning events must be recorded in the audit history.

These include:
- Assignment changes.
- Completion submissions.
- Manager approvals.
- Correction requests.
- Checklist steps requiring correction.
- Resubmissions.

---

# 4. Customers and users

## DEC-024: Customers are managed by rental managers

- **Date:** 2026-11-01
- **Status:** Accepted

Customer management is part of the initial release.

Managers can create, edit, search and browse customers and view their reservation history.

Customers cannot access OLAF in the initial release.

## DEC-025: Customer selection during reservation creation

- **Date:** 2026-11-01
- **Status:** Accepted

The reservation creation interface should provide:
- A searchable dropdown for existing customers.
- A convenient action to create a new customer without leaving the reservation form.
- Automatic selection of the newly created customer.

An inline or modal interface is suitable.

## DEC-026: Initial user roles

- **Date:** 2026-11-01
- **Status:** Accepted

The initial application has three roles:

- Administrator.
- Rental manager.
- Cleaning staff.

Role-based authorization must restrict users to operations appropriate to their responsibilities.

---

# 5. Technical and operational decisions

## DEC-027: Initial technology stack

- **Date:** 2026-11-01
- **Status:** Accepted

The initial technology stack is:

| Component | Technology |
|---|---|
| Backend | C# / .NET 10 |
| Web application | ASP.NET Core Razor Pages |
| Dynamic interactions | HTMX |
| Data access | Entity Framework Core |
| Authentication | ASP.NET Core Identity |
| Version control | Git / GitHub |

Database provider and hosting environment remain undecided.

## DEC-028: UTC timestamp storage

- **Date:** 2026-11-01
- **Status:** Accepted

Store timestamps in UTC.

Display times in the browser's local time zone.

Perform appropriate time-zone conversions at application boundaries.

## DEC-029: Idempotent reservation operations

- **Date:** 2026-11-01
- **Status:** Accepted

Prevent accidental duplicate reservations caused by repeated submissions of the same logical operation.

A repeated submission must not create multiple reservations.

The specific implementation remains to be investigated.

## DEC-030: Optimistic concurrency for editing

- **Date:** 2026-11-01
- **Status:** Accepted

The application must detect stale updates when multiple managers edit the same reservation.

Changes must never silently overwrite another manager's modifications.

The specific EF Core concurrency implementation remains to be investigated.

## DEC-031: Audit history

- **Date:** 2026-11-01
- **Status:** Accepted

Maintain an audit history for important operations.

At minimum, record:
- Who performed the operation.
- What changed.
- When it happened.
- Previous and new values where appropriate.

Important changes include reservation dates, prices, types, statuses, cancellations, assignments and cleaning workflow events.

## DEC-032: Photograph storage

- **Date:** 2026-11-01
- **Status:** Accepted

Photographs should generally be stored as files rather than database blobs.

The database should contain file references and relevant metadata.

The actual storage implementation remains undecided.

---

# 6. Deferred and future considerations

The following items have intentionally not been committed to the initial implementation.

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

Customer self-service will require further consideration of prepayment or customer-specific trust rules because customer reservations are immediately confirmed upon creation.

Database provider and hosting selection are also deferred.

---

# 7. Decision history

This document is maintained throughout the project.

When an accepted decision changes:
- Update the existing decision's status to Superseded.
- Preserve its original content and rationale.
- Create a new decision with a new ID.
- Reference the superseded decision where appropriate.

New decisions should receive the next available ID.

Proposals must never be recorded as accepted decisions without explicit agreement.