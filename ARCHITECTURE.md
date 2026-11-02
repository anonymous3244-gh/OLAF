# Architecture

## Architectural Approach

OLAF follows a pragmatic, contract-driven, modular architecture based on capability-oriented design, dependency inversion, and separation of concerns.

The architecture prioritizes maintainability, cohesion, reusability, and independent evolution while avoiding unnecessary project fragmentation and speculative abstractions.

## Architectural Principles

- **Capability-oriented design:** Organize functionality around meaningful capabilities and responsibilities.
- **Contract-driven design:** Define explicit contracts at meaningful architectural boundaries.
- **Dependency inversion:** Consumers depend on abstractions rather than concrete implementations.
- **Provider independence:** Multiple implementations may provide the same capability without requiring changes to consumers.
- **Dependency injection:** Connect implementations to consumers through dependency injection.
- **Centralized composition:** Application entry points and composition roots configure and connect required implementations.
- **Pragmatic modularity:** Project boundaries represent meaningful architectural responsibilities, not individual classes or interfaces.

## Contracts and Abstractions

Contracts should represent meaningful, independently consumable capabilities.

- Extract reusable contracts into dedicated projects only when their boundaries and independent value are established.
- Group related contracts into a small number of cohesive projects rather than creating numerous narrowly scoped projects.
- Keep OLAF-specific contracts within the projects that own the corresponding functionality.
- Interfaces introduced exclusively for internal implementation details or testability do not require separate projects.
- Avoid introducing abstractions without a concrete architectural or practical benefit.

## Reuse of Existing Libraries

Prefer established NuGet packages and platform-provided abstractions over reinventing existing capabilities.

- Evaluate existing libraries before designing new generic capabilities.
- Reuse established contracts and implementations where they adequately satisfy requirements.
- Introduce custom abstractions when existing solutions are insufficient or when a meaningful architectural boundary requires them.
- Avoid unnecessary wrappers around existing framework or library abstractions.

## Project Organization

Projects are organized around functional responsibilities and meaningful architectural boundaries.

The solution should generally distinguish between:

- **Presentation:** User interfaces and application entry points.
- **Application:** Use cases, orchestration, and application-level contracts.
- **Domain:** Business concepts, rules, and domain behavior.
- **Infrastructure:** External integrations and concrete technical implementations.
- **Shared contracts:** Independently consumable contracts, introduced only when justified.

Not every responsibility requires a separate project. Related functionality should remain together when doing so improves cohesion and maintainability.

## Dependency Rules

- Domain must not depend on application presentation or infrastructure.
- Application must not depend on concrete infrastructure implementations.
- Infrastructure implements contracts defined by the appropriate owning projects.
- Consumers depend on contracts rather than concrete providers.
- Composition roots are responsible for registering and configuring implementations.

## Architectural Patterns

The architecture draws on:

- Contract-Based Design
- Capability-Oriented Design
- Dependency Inversion Principle (DIP)
- Interface Segregation Principle (ISP)
- Modular Architecture
- Ports and Adapters (Hexagonal Architecture)
- Dependency Injection

These patterns should be applied pragmatically rather than treated as mandatory structures.

## Guiding Principle

Prefer the simplest architecture that establishes clear responsibilities, meaningful boundaries, and manageable dependencies.

Reusability is encouraged, but abstractions and project boundaries must be justified by actual needs rather than theoretical future possibilities.