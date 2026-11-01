# OLAF — Architecture

Last updated: 2026-11-01

## 1. Purpose

This document describes OLAF's technical architecture, major application boundaries and implementation principles.

It complements:
- `PROJECT.md` — Functional requirements.
- `DECISIONS.md` — Accepted decisions.
- `ROADMAP.md` — Development sequence.

Only explicitly accepted decisions are binding. Proposed structures remain subject to review.

## 2. Application overview

OLAF is a single-business, mobile-first web application for rental and cleaning management.

### Technology stack

| Component | Technology | Status |
|---|---|---|
| Language | C# | Accepted |
| Runtime | .NET 10 | Accepted |
| Web framework | ASP.NET Core Razor Pages | Accepted |
| Dynamic UI | HTMX | Accepted |
| Data access | Entity Framework Core | Accepted |
| Authentication | ASP.NET Core Identity | Accepted |
| Database provider | TBD | Deferred |
| Hosting | TBD | Deferred |

Git and GitHub are used for version control.

### Architectural direction

The initial application should remain a relatively simple server-rendered web application.

- Razor Pages handle page rendering and request processing.
- HTMX provides partial updates and dynamic interactions.
- Application/domain logic remains independent of presentation concerns.
- EF Core handles persistence.
- ASP.NET Core Identity handles authentication and role management.

A separate SPA, microservices architecture or dedicated public API is not required for the initial release.

## 3. Logical application structure

The following is a proposed logical separation, not a finalized project/solution structure.

| Area | Responsibilities |
|---|---|
| Presentation | Razor Pages, HTMX interactions, forms and UI validation |
| Application | Use cases, orchestration, authorization and transaction boundaries |
| Domain | Business rules, reservation lifecycle and cleaning workflow |
| Infrastructure | EF Core, database, file storage and external services |

The separation should prevent business rules from becoming dependent on Razor Pages or database-specific implementation details.

Avoid introducing additional projects, abstractions or architectural patterns without a concrete need.

## 4. Core domain model

The central domain concept is the **Facility** and its **Reservations**.

Everything occupying a facility is represented by a reservation.

### Main concepts

| Concept | Responsibility |
|---|---|
| Facility | Bookable unit and facility-specific settings |
| Reservation | Occupancy period, type, purpose and applicable price/assignee |
| Reservation template | Reusable default reservation times and price |
| Customer | Customer information and reservation history |
| User | Authenticated application account |
| Cleaning workflow | Checklist, completion, corrections and approval |
| Audit history | Record of important operational changes |
| Photograph | File reference and associated metadata |

Reservation types initially include:
- Customer use.
- Cleaning.
- Offline/unavailable.

The exact entity relationships and database representation remain to be designed.

### Reservation relationships

Every customer reservation generates exactly one associated cleaning reservation.

Standalone cleaning reservations are also supported.

The relationship must be maintained through atomic creation, modification and cancellation operations.

See `PROJECT.md`, section 4, and `DECISIONS.md`, decisions DEC-004 through DEC-023.

## 5. Business logic boundaries

### Reservation management

Reservation operations should be handled through application-level use cases rather than directly inside page handlers.

Responsibilities include:
- Availability validation.
- Reservation creation and modification.
- Conflict prevention.
- Customer/cleaning reservation coordination.
- Cancellation.
- Idempotency.
- Audit recording.

All reservation types must participate in facility availability validation.

### Cleaning management

Cleaning is a distinct operational workflow associated with cleaning reservations.

Responsibilities include:
- Staff assignment.
- Checklist execution.
- Reference and completion photographs.
- Submission for approval.
- Correction requests and resubmission.
- Manager approval.
- Deadline monitoring.

The four cleaning states are defined in `PROJECT.md` and `DECISIONS.md`.

### Transaction boundaries

Customer reservation operations involving associated cleaning reservations must be atomic.

A failed operation must not leave only part of the intended changes persisted.

Reservation conflict prevention must also remain safe under concurrent requests.

The concrete transaction and concurrency implementation is TBD.

## 6. Persistence and consistency

EF Core is the accepted data-access technology.

The database provider has not been selected.

Important consistency requirements:

- Active reservations for the same facility must not overlap.
- Concurrent booking attempts must not both succeed when they conflict.
- Repeated submissions must not create duplicate reservations.
- Concurrent edits must detect stale updates.
- Related customer and cleaning reservation changes must succeed or roll back together.
- Important changes must be auditable.

These are business and consistency requirements, not commitments to a particular database feature or locking strategy.

## 7. Authentication and authorization

ASP.NET Core Identity is the accepted authentication foundation.

Initial roles:

- Administrator.
- Rental manager.
- Cleaning staff.

Authorization must be enforced server-side, not merely by hiding UI elements.

Customers do not have application access in the initial release.

Detailed permission policies remain to be defined.

## 8. Time handling

Accepted approach:

- Store timestamps in UTC.
- Display times in the browser's local time zone.
- Convert appropriately at application boundaries.

Time-zone handling must account for daylight-saving transitions.

The application must support arbitrary reservation durations, overnight periods and 24-hour reservations.

See DEC-028.

## 9. Files and photographs

Photographs should generally be stored as files rather than database blobs.

The database stores file references and relevant metadata.

Storage provider, file organization, upload limits and retention policies remain TBD.

## 10. Background processing and notifications

The application must warn managers when a cleaning reservation reaches its deadline without completion.

The notification mechanism and background processing infrastructure have not been selected.

Do not introduce a distributed messaging system or complex job infrastructure without a demonstrated requirement.

## 11. User interface

The application uses Razor Pages and HTMX.

UI principles:
- Mobile-first responsive design.
- Efficient cleaning workflows on small screens.
- Server-side business validation.
- Partial page updates where they improve usability.
- Progressive enhancement where practical.

A native Android application is not required for the initial release.

## 12. Deferred architectural decisions

| Topic | Status |
|---|---|
| Database provider | Deferred |
| Hosting and deployment | Deferred |
| Solution/project structure | To be designed |
| Database schema and relationships | To be designed |
| Reservation concurrency strategy | To be investigated |
| Idempotency implementation | To be investigated |
| File storage provider | Deferred |
| Background job mechanism | Deferred |
| Notification delivery | Deferred |
| Detailed authorization policies | To be defined |

## 13. Architecture principles

1. Keep the initial architecture simple.
2. Keep business rules independent of UI and persistence concerns.
3. Prefer explicit transaction boundaries for multi-entity operations.
4. Treat concurrency and data integrity as first-class requirements.
5. Avoid premature abstractions and infrastructure.
6. Preserve future extensibility without implementing speculative features.
7. Record significant accepted architectural decisions in `DECISIONS.md`.