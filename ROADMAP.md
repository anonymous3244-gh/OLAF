# OLAF — Development Roadmap

Last updated: 2026-11-01

## 1. Purpose

This document defines the planned implementation sequence for OLAF.

Functional requirements are maintained in `PROJECT.md`, and accepted decisions in `DECISIONS.md`.

No implementation milestones have been started.

## 2. Development phases

| Phase | Scope | Status |
|---|---|---|
| 0 | Requirements and architecture | In progress |
| 1 | Application foundation | Not started |
| 2 | Facilities, customers and templates | Not started |
| 3 | Reservation management | Not started |
| 4 | Cleaning workflow | Not started |
| 5 | Operational monitoring and notifications | Not started |
| 6 | Reporting | Not started |
| 7 | Testing, hardening and initial deployment | Not started |

## 3. Milestones

### Phase 0 — Requirements and architecture

- [x] Define initial application scope and user roles.
- [x] Establish the initial technology stack.
- [x] Define core reservation and cleaning business rules.
- [x] Document accepted decisions.
- [ ] Complete `ARCHITECTURE.md`.
- [ ] Complete `ROADMAP.md`.
- [ ] Resolve implementation-blocking architectural decisions.
- [ ] Review documentation consistency.

**Completion criteria:** Requirements and initial architecture are sufficiently defined to begin implementation without guessing critical business rules.

### Phase 1 — Application foundation

- Create the .NET solution and application structure.
- Configure the database provider and EF Core.
- Configure ASP.NET Core Identity.
- Implement initial roles and authorization.
- Establish the responsive Razor Pages layout.
- Integrate HTMX.
- Configure development and deployment environments.
- Establish automated testing infrastructure.

**Completion criteria:** Users can authenticate, navigate the application and access role-appropriate areas.

### Phase 2 — Facilities, customers and templates

- Facility management and configuration.
- Mandatory facility cleaning duration.
- Customer management and search.
- Customer reservation history.
- Reservation template management.
- Facility-specific template association.

**Completion criteria:** Managers can maintain the core data required for reservations.

### Phase 3 — Reservation management

- Unified reservation model.
- Reservation types and purposes.
- Reservation creation and modification.
- Reservation cancellation and historical retention.
- Availability validation.
- Overlap prevention, including concurrent requests.
- Customer reservation and automatic cleaning reservation creation.
- Atomic modification and cancellation.
- Idempotent operations.
- Audit history.
- Reservation search and filtering.

**Completion criteria:** Managers can reliably manage reservations without violating facility availability or customer/cleaning relationship rules.

### Phase 4 — Cleaning workflow

- Cleaning reservation assignment.
- Staff-specific cleaning views.
- Cleaning checklist configuration and execution.
- Reference photographs.
- Completion photographs.
- Cleaning submission for approval.
- Manager approval and correction requests.
- Staff correction and resubmission.
- Cleaning audit history.

**Completion criteria:** The complete cleaning lifecycle works, including repeated correction and approval cycles.

### Phase 5 — Operational monitoring and notifications

- Upcoming cleaning overview.
- Overdue cleaning overview.
- Cleaning awaiting approval.
- Cleaning requiring corrections.
- Manager warning for cleaning deadlines reached without completion.
- Notification delivery mechanism.

**Completion criteria:** Managers can identify operational problems and receive required deadline warnings.

### Phase 6 — Reporting

- Weekly reporting.
- Monthly reporting.
- Yearly reporting.
- Revenue reporting.
- Reservation counts and occupancy.
- Cleaning workload and completion statistics.

Reporting calculations must distinguish customer revenue, cleaning costs and non-revenue reservation types.

**Completion criteria:** Reports provide consistent operational and financial information based on agreed definitions.

### Phase 7 — Testing, hardening and initial deployment

- End-to-end workflow testing.
- Reservation concurrency testing.
- Transaction and rollback testing.
- Authorization testing.
- Mobile usability review.
- Error handling and logging.
- Backup and recovery procedures.
- Deployment configuration.
- Security review.
- Initial production deployment.

**Completion criteria:** The initial release is operationally reliable and ready for real-world use.

## 4. Future considerations

Not included in the initial release roadmap:

| Feature | Status |
|---|---|
| Customer self-service reservations | Future consideration |
| Payments and invoicing | Future consideration |
| Android caller identification companion app | Future consideration |
| External booking integrations | Future consideration |
| Multi-tenant support | Future consideration |
| Automatic cleaning staff scheduling | Deferred |
| WebAuthn/passkeys | Future consideration |
| mTLS | Future consideration |
| Advanced APIs and integrations | Future consideration |
| Advanced analytics | Future consideration |

See `DECISIONS.md`, section 6, for the authoritative list.

## 5. Development principles

- Implement incrementally, following phase dependencies.
- Test business rules as they are implemented.
- Do not move forward while critical integrity requirements remain unsatisfied.
- Avoid implementing future features prematurely.
- Update milestone status as work progresses.
- Keep `PROJECT.md`, `DECISIONS.md` and `ARCHITECTURE.md` synchronized with significant changes.

## 6. Current next step

Complete Phase 0 by reviewing the architecture and resolving the decisions necessary to establish the application foundation.