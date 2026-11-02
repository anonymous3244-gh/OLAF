# OLAF — Development Roadmap

Last updated: 2026-11-03

## 1. Development status

Initial application scaffolding has been established. Core OLAF business functionality has not yet been implemented.

Phase 0 is In progress. Phase 1 and all subsequent phases are Not started. The existing scaffold does not count as Phase 1 progress.

This roadmap defines implementation order and completion outcomes. Functional requirements are maintained in `PROJECT.md`; accepted decisions are maintained in `DECISIONS.md`; technical architecture guidance is maintained in `ARCHITECTURE.md`.

## 2. Development phases

| Phase | Scope | Status |
|---|---|---|
| 0 | Requirements and architecture | In progress |
| 1 | Application foundation | Not started |
| 2 | Core data management | Not started |
| 3 | Reservation management | Not started |
| 4 | Cleaning workflow | Not started |
| 5 | Operational monitoring | Not started |
| 6 | Reporting | Not started |
| 7 | Testing and deployment | Not started |

## 3. Milestones

### Phase 0 — Requirements and architecture

- [x] Define initial application scope and user roles.
- [x] Establish the initial technology stack.
- [x] Define core reservation and cleaning business rules.
- [x] Record accepted decisions.
- [x] Establish the approved documentation structure and feature IDs.
- [x] Restructure the requirements, decision log and architecture guidance.
- [x] Complete the final cross-document consistency review.
- [ ] Resolve any decisions necessary to begin Phase 1.

**Completion criteria:** Requirements and initial architecture are sufficiently defined to begin implementation without guessing critical business rules.

### Phase 1 — Application foundation

- Review and complete the .NET solution and application structure.
- Select and configure the database provider and Entity Framework Core.
- Configure ASP.NET Core Identity.
- Implement the initial roles and authorization (USR).
- Establish the responsive Razor Pages layout.
- Integrate HTMX.
- Configure development and deployment environments.
- Establish automated testing infrastructure.

**Completion criteria:** Users can authenticate, navigate the application and access role-appropriate areas.

### Phase 2 — Core data management

- Implement facility management and configuration (FAC).
- Implement mandatory facility cleaning duration (FAC, CLN).
- Implement customer management, search and reservation history (CUS).
- Implement reservation template management and facility-specific association (TMP).

**Completion criteria:** Managers can maintain the core data required for reservations.

### Phase 3 — Reservation management

- Implement the unified reservation model and the three initial reservation types (RES).
- Implement reservation creation, modification, cancellation and historical retention (RES).
- Implement availability validation, overlap prevention and concurrent-request protection (AVL).
- Implement Customer use and associated Cleaning reservation creation, modification and cancellation with atomic behavior (RES, CLN, AVL).
- Implement idempotent reservation operations and stale-update detection (RES).
- Implement reservation audit history (AUD).
- Implement reservation search and filtering (RES).

**Completion criteria:** Managers can reliably manage reservations without violating facility availability or Customer use/Cleaning relationship rules.

### Phase 4 — Cleaning workflow

- Implement Cleaning reservation assignment and staff-specific views (CLN, USR).
- Implement cleaning checklist configuration and execution (CLN).
- Implement reference and completion photographs (CLN).
- Implement cleaning submission, manager approval and correction requests (CLN).
- Implement staff correction and resubmission (CLN).
- Implement cleaning audit history (AUD).

**Completion criteria:** The complete cleaning lifecycle works, including repeated correction and approval cycles, while cleaning staff can access only their assigned work.

### Phase 5 — Operational monitoring

- Implement upcoming and overdue Cleaning overviews (CLN, NTF).
- Implement views for Cleaning awaiting approval and requiring corrections (CLN, NTF).
- Implement manager warnings when cleaning deadlines are reached without completion (NTF).
- Implement the required notification delivery mechanism (NTF).

**Completion criteria:** Managers can identify operational problems and receive required deadline warnings.

### Phase 6 — Reporting

- Implement weekly, monthly and yearly reporting (RPT).
- Implement revenue reporting (RPT).
- Implement reservation counts and facility occupancy (RPT).
- Implement cleaning workload and completion statistics (RPT).
- Apply the agreed distinction between customer revenue, cleaning costs and non-revenue Offline reservations (RPT).

**Completion criteria:** Reports provide consistent operational and financial information based on agreed definitions.

### Phase 7 — Testing and deployment

- Perform end-to-end workflow testing.
- Perform reservation concurrency testing.
- Perform transaction and rollback testing.
- Perform authorization testing, including role permissions and verification that cleaning staff can access only assigned work.
- Conduct a mobile usability review using real workflows, not only layout-fit checks.
- Review error handling and logging.
- Establish backup and recovery procedures.
- Finalize deployment configuration.
- Conduct a security review.
- Perform the initial production deployment.

**Completion criteria:** The initial release is operationally reliable and ready for real-world use.

## 4. Development principles

- Implement incrementally, following phase dependencies.
- Test business rules as they are implemented.
- Do not move forward while critical integrity requirements remain unsatisfied.
- Avoid implementing future features prematurely.
- Update milestone status as work progresses.
- Keep `PROJECT.md`, `DECISIONS.md`, `ARCHITECTURE.md` and `ROADMAP.md` synchronized with significant changes.

## 5. Current next step

Complete Phase 0 by finalizing the project documentation, reviewing architectural guidance, and resolving only the decisions necessary to begin Phase 1.
