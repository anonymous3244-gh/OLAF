# OLAF — Project Context and Session Handover

Last updated: 2026-11-01

# 1. Project overview

OLAF is a mobile-friendly rental management application that helps rental managers track bookings and helps cleaning staff prepare rental units before the next customer arrives.

The application will help managers:
- Manage bookable facilities/units.
- Manage customer reservations.
- Define reusable booking shifts with predefined start/end times and prices.
- Prevent conflicting reservations.
- Manage cleaning and preparation operations between customers.
- Monitor cleaning deadlines and approve completed cleaning sessions.
- Generate operational and financial reports.

The initial release serves one business. Multi-tenant support is a possible future requirement, not an initial implementation requirement.

The architecture should use generic concepts such as bookable units, reservations, time slots, shifts and operational tasks wherever appropriate.

Mobile experience: Responsive, mobile-first layouts, with particular attention to efficient use of small screens.

# 2. Technology stack

Current agreed decisions:

| Component | Technology |
| :--- | :--- |
| Backend | C# / .NET 10 |
| Web application | ASP.NET Core Razor Pages |
| Dynamic interactions | HTMX |
| Data access | Entity Framework Core |
| Authentication | ASP.NET Core Identity |
| Version control | Git / GitHub |
| Database provider | Deferred |
| Hosting environment | Deferred |

Additional considerations:

- WebAuthn/passkeys may be introduced later.
- mTLS may also be introduced later.
- API controllers may be added when external integrations become necessary.

# 3. Development principles

Agreed working principles:

- Avoid premature decisions. Preserve future options wherever reasonably possible.
- Don't introduce unnecessary abstractions or complexity. Prefer simple, maintainable solutions.
- Discuss important architectural and business decisions before implementation.
- Develop incrementally and test each milestone.
- Maintain documentation alongside code.

Decision classification:

- AGREED: A decision has been discussed and accepted.
- DEFERRED: The decision is intentionally postponed.
- PROPOSED: A suggested design that has not yet been accepted.
- FUTURE CONSIDERATION: An idea worth retaining but not currently committed to.

# 4. Booking and reservation model

## 4.1 Time-based reservations

Reservations must support precise arrival and departure date/time values.

A facility may be reserved multiple times during one calendar day.

The system must support:
- Reservations lasting a few hours.
- Reservations lasting 24 hours or potentially longer.
- Arbitrary start and end date/time values.
- Configurable reusable shift templates.
- Manual start/end entry without artificial restrictions.

## 4.2 Shift templates (Reservation templates)

PROPOSED DESIGN:

A shift template should contain at least:
- Name.
- Start time.
- End time.
- Price.

Selecting a shift in the booking interface should conveniently populate the reservation's start time, end time and price.

Managers should also be able to enter custom start/end times and price manually.

Shift templates can be assigned to specific facilities/units to avoid excessive templates everywhere.

Shifts can cross midnight for night shifts.

Important: Shift templates should not impose artificial restrictions on reservation duration. A 24-hour shift should be possible.

## 4.3 Reservation types and common model

AGREED:

Everything that occupies a bookable unit is represented as a reservation.

This includes:
- Customer use.
- Cleaning.
- Offline/unavailable periods (maintenance, renovations, temporary closure, owner use, etc.).

These reservations share common concepts:
- Bookable unit.
- Start and end date/time.
- Reservation type/purpose.
- Optional price, where applicable.
- Optional assignee, where applicable.

Price is meaningful for some reservation types but not necessarily all. Zero or negative values may also be meaningful, for example when representing cleaning costs.

The system must retain the reason for a reservation even when its price is zero. For example, maintenance/offline, promotional gift or cleaning.

Do not create fake customer bookings to represent unavailable periods.

The exact entity structure and database representation remain to be designed.

## 4.4 Booking conflicts

AGREED PRINCIPLE:

Two active reservations must never overlap for the same bookable unit.

Consecutive customer reservations will never happen because a cleaning reservation must always be scheduled between customer uses.

The system must prevent conflicting reservations, including:
- Simultaneous booking attempts.
- Reservation modifications.
- Maintenance and owner-use blocking periods.
- Cleaning reservations.

Managers cannot simply override an existing reservation conflict.

When a unit needs to be taken offline but already has future customer reservations, the manager must first contact the affected customers, cancel/reschedule their reservations and then create the offline reservation.

Concurrent booking attempts must be handled safely. The intended principle is that the first successful booking wins and competing attempts are notified that availability has changed.

The exact concurrency implementation remains subject to technical investigation.

## 4.5 Booking modification

The system must validate proposed changes before saving them.

Changes must be atomic and checked against other reservations.

Customer reservation modifications must also account for their associated cleaning reservation (see section 5).

## 4.6 Cancellation

AGREED:

Cancelled reservations should remain in the database for historical and reporting purposes but should no longer block availability.

Cancelling a customer reservation must also cancel its associated cleaning reservation.

Both operations must be atomic: either both succeed or neither does.

## 4.7 Search and filter bookings

To be discussed.

# 5. Cleaning and preparation workflow

Cleaning is an important part of OLAF, not merely an additional feature.

## 5.1 Cleaning reservations

AGREED:

Cleaning is represented by an actual reservation, just like customer use.

A cleaning reservation has:
- A bookable unit.
- Explicit start and end date/time.
- An assigned cleaning staff member (initial approach).
- A cleaning status.
- An optional price/cost.

A cleaning reservation has a fixed time slot with a clearly defined start and end.

Its deadline is the end of that time slot. It does not extend automatically until the next customer reservation.

Cleaning reservations must be considered when calculating unit availability.

## 5.2 Customer reservation and cleaning reservation relationship

AGREED:

Every customer reservation automatically creates a new cleaning reservation.

Every customer reservation has a reference to its associated cleaning reservation.

The relationship is mandatory for customer reservations, but standalone cleaning reservations are also allowed.

Managers can create as many standalone cleaning reservations as necessary, regardless of whether customer reservations exist.

A standalone cleaning reservation does not need an associated customer reservation.

The following operations must be handled atomically:

**Creating a customer reservation:**
- Create the customer reservation.
- Automatically create its associated cleaning reservation.
- Assign a cleaning staff member using the initial simple approach.

All required operations must succeed together or be rolled back.

**Cancelling a customer reservation:**
- Cancel the customer reservation.
- Cancel its associated cleaning reservation.

Both operations must succeed together or be rolled back.

**Modifying a customer reservation:**
- Modify the customer reservation.
- Automatically adjust its associated cleaning reservation accordingly.
- Validate all resulting time-slot conflicts.

Both modifications must succeed together or be rolled back.

This automatic modification applies only if the customer reservation has not started yet.

Once a customer reservation has started, it cannot be cancelled or modified in a way that requires changing its associated cleaning reservation.

The cleaning reservation must never be performed before the customer reservation has ended.

Cleaning reservations can also be edited independently by managers when necessary. Such modifications must be recorded in the audit log.

## 5.3 Cleaning scheduling policy

AGREED:

Facilities should be cleaned eagerly.

Every customer reservation automatically generates a cleaning reservation, even when no subsequent customer reservation exists.

The purpose is to ensure that the facility is cleaned and ready for the next customer as early as possible.

The cleaning reservation is generated based on the customer reservation's departure time and a predefined cleaning duration for the facility.

The cleaning reservation has an explicit fixed time slot.

## 5.4 Cleaning assignment — initial approach

AGREED:

Use the simple initial approach for cleaning staff assignment.

A cleaning staff member is assigned when the cleaning reservation is created.

Automatic staff scheduling based on working shifts and workload distribution is deferred.

FUTURE CONSIDERATION:

Introduce cleaning shifts and scheduling logic that can automatically determine which cleaning staff member should be assigned to each cleaning reservation.

## 5.5 Cleaning workflow

Planned features:

- Upcoming cleaning reservations.
- Assignment to one cleaning staff member.
- Cleaning states: pending and complete.
- Step-by-step cleaning checklists.
- Reference photographs for checklist items.
- Mobile camera workflow with semi-transparent reference image overlay.
- Completion photographs.
- Submission for manager review.
- Manager approval or correction requests.

The assigned cleaning staff member must manually mark the cleaning reservation as completed.

If the cleaning reservation reaches its end time without being marked as completed, a warning/notification must be sent to the manager(s).

The notification mechanism (email, in-app notification, etc.) remains to be designed.

A native Android application is not required for the initial cleaning workflow. Browser camera APIs and custom JavaScript are potential implementation tools.

## 5.6 Customer reservation completion

AGREED:

Customer reservations do not need an explicit completed status.

Once the reservation's end time has passed, the customer use is considered completed based on its timestamps.

No database update is necessary simply because a customer reservation has ended.

Cleaning reservations are different because their completion requires an explicit action from the assigned cleaning staff member.

# 6. Reservation management and permissions

AGREED:

Only managers can create and manage reservations in the initial release.

Customers do not have access to the application.

All customer reservations are considered confirmed immediately upon creation by a manager.

There is no pending customer reservation state in the initial release.

Future customer self-service functionality is deferred.

When customer self-service is eventually introduced, payment/prepayment or customer-specific trust rules will need to be considered before allowing customers to create confirmed reservations.

Cleaning staff can access their assigned cleaning reservations and perform the cleaning workflow.

# 7. Technical and operational requirements

## 7.1 Time zones

AGREED:

Store timestamps in UTC.

Display times in the browser's local time zone.

Use appropriate time-zone conversion at application boundaries.

## 7.2 Duplicate submissions and idempotency

AGREED PRINCIPLE:

Prevent accidental duplicate reservations using REST/idempotency principles.

A repeated submission of the same logical operation should not create multiple reservations.

## 7.3 Concurrent editing

Two managers may edit the same reservation.

The application must detect stale updates and prevent silent overwriting of another manager's changes.

Investigate EF Core optimistic concurrency tokens and appropriate conflict-resolution workflows.

## 7.4 Audit log

AGREED:

Maintain an audit history for important operations.

At minimum, record:
- Who made the change.
- What was changed.
- When it happened.
- Previous and new values where appropriate.

Important changes include reservation dates, prices, types, statuses and cancellations.

Changes to associated cleaning reservations must also be auditable.

## 7.5 Photographs

Photographs should generally be stored as files rather than database blobs.

The database should contain file references and relevant metadata.

Storage implementation remains undecided.

# 8. Reporting

Planned reporting periods:
- Weekly.
- Monthly.
- Yearly.

Potential reports:
- Revenue.
- Reservation counts.
- Occupancy.
- Cleaning workload.
- Cleaning completion.

Reporting definitions and calculations must be established before implementation.

Reports must account for the different reservation types. For example, cleaning and offline reservations should not be counted as customer revenue.

# 9. Authentication and administration

Planned:
- ASP.NET Core Identity.
- Database-backed accounts.
- Roles: administrator, rental manager and cleaning staff.
- Role-based authorization.
- User and role administration.
- Future WebAuthn/passkey or mTLS support.

# 10. Future features

Not part of the initial release:
- Android caller identification companion application.
- External booking-channel integrations.
- Advanced APIs and integrations.
- Multi-tenancy.
- Automated email/push notifications.
- Payments and invoicing.
- Advanced analytics.
- Automatic cleaning staff scheduling based on working shifts and workload.
- Customer self-service reservations.

## 10.1. Android caller-ID app

Rental managers who receive customer calls on Android phones would like to identify an incoming call's phone number against the customer database and show relevant information during the ringing phase.

Information displayed can be something like the customer's name, risk score, comment, etc.

The proposed approach is a small native Android companion application that communicates with the .NET backend.

# 11. Development milestones

Foundation:
- Solution structure.
- Database configuration.
- Responsive layout.
- Authentication.
- Navigation.

Units and reservations:
- Manage bookable units.
- Create and edit reservations.
- Reservation types.
- Time-based availability.
- Conflict prevention.
- Shift templates.
- Automatic cleaning reservation creation.
- Atomic customer/cleaning reservation modifications and cancellations.
- HTMX interactions.

Cleaning operations:
- Cleaning reservation management.
- Staff assignment.
- Checklists.
- Photographs.
- Completion workflow.
- Manager review.
- Deadline warnings.

Reporting:
- Weekly, monthly and yearly reports.

Security and polish:
- Permissions.
- Audit history.
- Mobile usability.
- WebAuthn or mTLS planning/integration.

Implementation has NOT started.

# 12. Outstanding business decisions

The following require further discussion:

- Reservation search and filtering.
- Exact reservation types and their associated business rules.
- Cleaning duration configuration per facility.
- Whether cleaning reservations should initially be created as unassigned before a manager assigns a staff member, or whether the manager must select the staff member during customer reservation creation.
- Detailed cleaning checklist and approval workflow.
- Reporting definitions and calculations.
- Notification channels and escalation rules.

# 13. Outstanding technical investigations

- EF Core concurrency handling.
- Idempotency key implementation.
- Database provider selection.
- Atomic creation, modification and cancellation of customer/cleaning reservation pairs.
- Reservation overlap validation and concurrency-safe booking.
- Time-zone handling, including daylight-saving transitions.
- File storage implementation.
- Background processing for deadline warnings and notifications.

# 14. Immediate next steps

At the beginning of the next session:
- Review this context.
- Discuss outstanding items.
- Continue clarifying the reservation and cleaning architecture.
- Update README.md, PROJECT.md, ARCHITECTURE.md, DECISIONS.md and ROADMAP.md once the relevant decisions have been agreed upon.

Do not start implementation until the business rules and initial architecture have been sufficiently clarified.

# 15. Working preferences

Keep discussions relatively short and concise, because we expect many follow-up questions.

Explain trade-offs and raise important questions early.

Do not silently turn proposals into agreed decisions.

Prefer simple solutions and avoid premature complexity.

Git repository: https://github.com/anonymous3244-gh/OLAF

The repository should become the single source of truth for project documentation and development state.

At the end of each session, create updated SESSION.md with decisions, outstanding questions and the next concrete actions.