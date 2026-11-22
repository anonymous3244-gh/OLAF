# OLAF — Architecture

This document defines the technical architecture and the rules governing project structure and dependencies. The initial technology stack is recorded in `DECISIONS.md` (DEC-027).

## 1. Architectural approach

OLAF follows a pragmatic, contract-driven, modular architecture based on capability-oriented design, dependency inversion and separation of concerns.

The architecture prioritizes maintainability, cohesion, reusability and independent evolution while avoiding unnecessary project fragmentation and speculative abstractions.

## 2. Architectural principles

- **Capability-oriented design:** Organize functionality around meaningful capabilities and responsibilities.
- **Contract-driven design:** Define explicit contracts at meaningful architectural boundaries.
- **Dependency inversion:** Consumers depend on abstractions rather than concrete implementations.
- **Provider independence:** Keep persistence concerns and provider-specific configuration within Infrastructure and composition boundaries. Prefer provider-neutral EF Core/LINQ for ordinary data access, and avoid unnecessary provider-specific dependencies. SQL Server Express is the initial provider; future PostgreSQL portability is desirable but not a requirement.
- **Pragmatic modularity:** Project boundaries represent meaningful architectural responsibilities, not individual classes or interfaces.
- **Separation of concerns:** Keep responsibilities distinct and place behavior with the project that owns it.
- **Pragmatic reuse:** Prefer established platform and library capabilities where they adequately meet the need.

Prefer the simplest architecture that establishes clear responsibilities, meaningful boundaries and manageable dependencies. Reusability is encouraged, but abstractions and project boundaries must be justified by actual needs rather than theoretical future possibilities.

## 3. Contracts and abstractions

Contracts should represent meaningful, independently consumable capabilities.

- Extract reusable contracts into dedicated projects only when their boundaries and independent value are established.
- Group related contracts into a small number of cohesive projects rather than creating numerous narrowly scoped projects.
- Keep OLAF-specific contracts within the projects that own the corresponding functionality.
- Interfaces introduced exclusively for internal implementation details or testability do not require separate projects.
- Avoid abstractions without a concrete architectural or practical benefit.

## 4. Project organization

Projects are organized around functional responsibilities and meaningful architectural boundaries.

The solution should generally distinguish between:

- **Presentation:** User interfaces and application entry points.
- **Application:** Use cases, orchestration and application-level contracts.
- **Domain:** Business concepts, rules and domain behavior.
- **Infrastructure:** External integrations and concrete technical implementations.
- **Shared contracts:** Independently consumable contracts, introduced only when justified.

Not every responsibility requires a separate project. Related functionality should remain together when doing so improves cohesion and maintainability.

## 5. Dependency rules

- Domain must not depend on application presentation or infrastructure.
- Application must not depend on concrete infrastructure implementations.
- Infrastructure implements contracts defined by the appropriate owning projects.
- Consumers depend on contracts rather than concrete providers.
- Dependencies must point toward the projects that own the relevant abstractions and business rules.
- Composition roots are responsible for registering and configuring implementations.

## 6. Dependency injection and composition

Use dependency injection to connect consumers to implementations through the relevant contracts.

Application entry points and other composition roots configure and register the implementations required by the application. Dependency registration and provider-specific configuration belong at these composition boundaries rather than being scattered through business logic.

The initial persistence provider is SQL Server Express, configured through the EF Core SQL Server provider. Keep provider-specific setup and any unavoidable provider-specific queries in Infrastructure or the composition root. Do not introduce a generic database abstraction solely to anticipate a possible future provider change.

## 7. API design and contracts

The application API is resource-oriented and uses the `/api/v1` base path. Follow HTTP resource semantics, methods and status codes at Richardson Maturity Model Level 2; HATEOAS links are not required.

- Use resource nouns in URIs and standard HTTP methods for resource operations.
- Use POST to create resources and PUT to update them. PUT operations must be idempotent; when an update changes only selected fields, define the meaning of omitted fields explicitly. Do not use PATCH.
- Return JSON DTOs for ordinary API requests. API DTOs are distinct from domain entities and are mapped at the application/presentation boundary.
- Keep controllers thin: accept and validate transport input, invoke an application use case and return its result.
- Enforce business constraints, uniqueness and concurrency requirements at the persistence boundary. A preliminary availability check is useful feedback, but cannot protect against simultaneous conflicting requests by itself.
- Do not add Idempotency-Key handling by default. Use database constraints and transactional business operations as the source of truth for data integrity.

## 8. HTMX response integration

An operation has one controller action and one application-service invocation, regardless of whether the caller is an ordinary API client or HTMX.

Actions opt into HTMX representation support using the parameterless `[CanReturnHtmx]` attribute. A centralized MVC result filter examines the action descriptor and successful DTO result:
- Without the `HX-Request` request header, return the DTO through the normal JSON formatter.
- With `HX-Request`, render the inferred Razor partial using the DTO as its model.
- Infer the partial from the MVC controller/action descriptors and the agreed view convention; do not parse the request URL.
- The inferred partial must exist. Missing partials are configuration/development errors and must throw rather than silently falling back to another representation.
- Do not use the `Accept` header to choose between JSON and HTML.
- Append `HX-Request` to the response `Vary` header while preserving existing values.
- Transform successful DTO results only. Leave unsuccessful results and unrelated result types untouched, and preserve relevant status codes and headers.

The attribute is an explicit declaration that the action supports both representations; the filter should remain focused on this responsibility rather than becoming a general-purpose result-processing framework.

## 9. Vertical slices and initial persistence

Implement business capabilities as vertical slices, connecting the user interface, API, application use case, domain behavior and persistence contract as each feature is developed. Do not build a separate frontend prototype and later replace its business interactions with a different backend workflow.

Keep responsibilities distinct:
- Presentation owns Razor Pages, controllers, HTMX/JavaScript interactions and transport DTOs.
- Application owns use cases, orchestration and repository contracts.
- Domain owns business entities, value objects and domain rules.
- Infrastructure owns repository implementations and external technical integrations.

API DTOs must remain separate from domain entities. Application services depend on repository interfaces rather than concrete Infrastructure classes.

Initially, implement business repositories in memory within Infrastructure while domain models and workflows stabilize. Do not add business EF Core entities or database migrations during this stage. When the domain schema is stable, consolidate migrations into a new initial migration that includes both Identity and OLAF business data; recreate the development database if necessary. Do not use `EnsureCreated()` as a temporary substitute for the migrations workflow.

## 10. Reuse of existing libraries

Prefer established NuGet packages and platform-provided abstractions over reinventing existing capabilities.

- Evaluate existing libraries before designing new generic capabilities.
- Reuse established contracts and implementations where they adequately satisfy requirements.
- Introduce custom abstractions when existing solutions are insufficient or a meaningful architectural boundary requires them.
- Avoid unnecessary wrappers around existing framework or library abstractions.

## 11. Architectural patterns

The architecture draws on:

- Contract-Based Design.
- Capability-Oriented Design.
- Dependency Inversion Principle (DIP).
- Interface Segregation Principle (ISP).
- Modular Architecture.
- Ports and Adapters (Hexagonal Architecture).
- Dependency Injection.

Apply these patterns pragmatically rather than treating them as mandatory structures. Choose the simplest approach that satisfies the actual responsibilities and dependency constraints.
