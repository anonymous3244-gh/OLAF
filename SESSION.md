# OLAF — Session Handover

Last updated: 2026-11-02

## 1. Current project status

**Phase:** Transition from initial architecture to application foundation (Phase 0 → Phase 1).

The initial solution structure and web application scaffold have been established.

The repository currently contains:
- A .NET solution with separate Application, Domain and Infrastructure projects.
- Corresponding unit-test projects.
- An ASP.NET Core Razor Pages web application.
- Initial ASP.NET Core Identity and Entity Framework Core integration.
- An initial Identity database migration.

**Core OLAF business functionality has not yet been implemented.**

The current implementation is primarily framework and application scaffolding. The domain model, application use cases and operational workflows remain to be developed.

## 2. Technology stack

| Component | Technology |
|---|---|
| Backend | C# / .NET 10 |
| Web application | ASP.NET Core Razor Pages |
| Dynamic interactions | HTMX |
| Data access | Entity Framework Core |
| Authentication | ASP.NET Core Identity |
| Version control | Git / GitHub |

SQL Server is currently configured in the web application scaffold, but the database provider has not yet been formally established as an accepted architectural decision.

The hosting environment also remains undecided.

## 3. Documentation — source of truth

Always consult the repository documents before making assumptions:

| Document | Responsibility |
|---|---|
| `README.md` | Project overview and navigation |
| `PROJECT.md` | Functional requirements |
| `DECISIONS.md` | Authoritative accepted decisions |
| `ARCHITECTURE.md` | Technical architecture and design principles |
| `ROADMAP.md` | Development phases, milestones and progress |
| `SESSION.md` | Current development state and handover |

`PROJECT.md` and `DECISIONS.md` take precedence over historical discussions and session notes.

`ARCHITECTURE.md` defines architectural principles and boundaries.

`ROADMAP.md` defines implementation priorities and sequencing.

Do not unnecessarily duplicate the contents of these documents.

## 4. Important project context

- OLAF initially serves one business.
- Initial roles: Administrator, Rental manager and Cleaning staff.
- Customers have no application access in the initial release.
- The application is mobile-first.
- Everything occupying a facility is represented as a reservation.
- Customer reservations automatically generate associated cleaning reservations.
- Cleaning reservations are initially unassigned.
- Reservation operations involving associated customer and cleaning reservations must be atomic.
- Cleaning requires explicit staff completion and mandatory manager approval.

These are established business requirements, not implementation assumptions.

See `PROJECT.md` and `DECISIONS.md` for the complete requirements and accepted business rules.

## 5. Architectural direction

OLAF follows a pragmatic, contract-driven, modular architecture.

Important principles:

- Capability-oriented design.
- Explicit contracts at meaningful architectural boundaries.
- Dependency inversion and provider independence.
- Dependency injection and centralized composition.
- Project boundaries based on meaningful responsibilities.
- Reuse of established framework abstractions and libraries.
- Avoidance of unnecessary abstractions and premature project fragmentation.

The current solution structure provides the initial foundation. It should evolve according to actual implementation needs rather than theoretical future requirements.

See `ARCHITECTURE.md` for the complete architectural guidance.

## 6. Outstanding work

The following areas still require decisions or implementation:

### Technical decisions
- Confirm the database provider and hosting environment.
- Review the initial solution structure and project dependencies.
- Establish the application database model and migration strategy.
- Define reservation concurrency and idempotency implementation.
- Decide on file storage and background processing.
- Define notification delivery.
- Establish detailed authentication and authorization policies.

### Implementation
- Develop the initial domain model.
- Implement application capabilities and use cases.
- Establish infrastructure implementations.
- Complete application authentication and role management.
- Implement the initial facility and customer management functionality.
- Establish automated unit and integration testing.

Functional questions and accepted decisions are maintained in `PROJECT.md` and `DECISIONS.md`.

## 7. Immediate next steps

1. Review and finalize the development roadmap.
2. Resolve implementation-blocking technical decisions.
3. Confirm the database provider and hosting strategy.
4. Establish the initial domain and application boundaries.
5. Begin implementing the application foundation.
6. Update milestone status as implementation progresses.

Do not start implementing functionality based on unresolved assumptions.

## 8. Working principles

- Keep discussions focused and explain important trade-offs.
- Raise significant questions before implementation.
- Never silently turn proposals into accepted decisions.
- Prefer simple, maintainable solutions.
- Avoid premature abstractions and unnecessary complexity.
- Follow the architectural principles documented in `ARCHITECTURE.md`.
- Develop incrementally and test business rules as they are implemented.
- Keep project documentation synchronized with actual decisions and implementation progress.

Repository: https://github.com/anonymous3244-gh/OLAF

The repository is the single source of truth for project documentation and development state.