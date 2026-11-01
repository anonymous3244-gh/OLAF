OLAF — Project Context and Session Handover

Last updated: 2026-10-30

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
| :--- | :---: | ---: |
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

AGREED: A decision has been discussed and accepted.

DEFERRED: The decision is intentionally postponed.

FUTURE CONSIDERATION: An idea worth retaining but not currently committed to.

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

## 4.3 Booking conflicts

AGREED PRINCIPLE:

Two confirmed reservations must never overlap for the same bookable unit.
Consecutive reservations will never happen, since cleaning period should always be present in between.

The system must handle:
Simultaneous booking attempts, using optimistic locking - the one who finishes booking first, wins, the others are notified before submitting the booking request that it can't be booked anymore.
Modifications and cancellations.
Maintenance and owner-use blocking periods.

## 4.4 Booking modification

The system must validate proposed changes before saving them.
Changes must be atomic and checked against other reservations.

## 4.5 Cancellation

Cancelled reservations should remain in the database for historical and reporting purposes but should no longer block availability.

## 4.6 Maintenance and unavailable periods

AGREED:

Maintenance periods and other unit unavailability should be represented separately from customer reservations. If the price charged is zero, we should know what's the reason for that: offline, gift, cleaning.

Examples:
- Out of service / Offline (maintenance, renovations, temporary closure).
- Gift (promotional, owner use).
- Cleaning (cleaning between uses).

Do not create fake customer bookings to represent unavailable periods.

## 4.7 Search and filter bookings.

To be discussed.

# 5. Cleaning and preparation workflow

Cleaning is an important part of OLAF, not merely an additional feature.

## 5.1 Cleaning buffer

AGREED:

A cleaning buffer is required between reservations to ensure consistent quality for all customers.
Cleaning buffers are fixed per facility.
The buffer should be considered when calculating actual availability.

Example:

Reservation A: 12:00–16:00.
Cleaning buffer: 60 minutes.
Earliest next reservation: 17:00.

Customer reservation time and operational preparation time must be treated as separate concepts.

## 5.2 Cleaning policy — Facilities should be cleaned eagerly

Cleaning tasks are generated right after the booking timeslot.
Staff scheduling and workload.

## 5.3 Cleaning functionality

Planned features:

Upcoming cleaning tasks.
Task assignment: unassigned, assigned (to 1 person from the cleaning staff).
Task states: pending, complete.
Step-by-step cleaning checklists.
Reference photographs for checklist items.
Mobile camera workflow with semi-transparent reference image overlay.
Completion photographs.
Submission for manager review.
Manager approval or correction requests.

A native Android application is not required for the initial cleaning workflow. Browser camera APIs and custom JavaScript are potential implementation tools.

# 6. Technical and operational requirements

## 6.1 Time zones

AGREED:

Store timestamps in UTC.
Display times in the browser's local time zone.
Use appropriate time-zone conversion at application boundaries.

## 6.2 Duplicate submissions and idempotency

AGREED PRINCIPLE:

Prevent accidental duplicate reservations using REST/idempotency principles.
A repeated submission of the same logical operation should not create multiple reservations.

## 6.3 Concurrent editing

Two managers may edit the same reservation.
The application must detect stale updates and prevent silent overwriting of another manager's changes.
Investigate EF Core optimistic concurrency tokens and appropriate conflict-resolution workflows.

## 6.4 Audit log

AGREED:

Maintain an audit history for important operations.

At minimum, record:
- Who made the change.
- What was changed.
- When it happened.
Previous and new values where appropriate.

Important changes include reservation dates, prices, statuses and cancellations.

## 6.5 Photographs

Photographs should generally be stored as files rather than database blobs.
The database should contain file references and relevant metadata.
Storage implementation remains undecided.

# 7. Reporting

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

# 8. Authentication and administration

Planned:
- ASP.NET Core Identity.
- Database-backed accounts.
- Roles: administrator, rental manager and cleaning staff.
- Role-based authorization.
- User and role administration.
- Future WebAuthn/passkey or mTLS support.

# 9. Future features

Not part of the initial release:
- Android caller identification companion application.
- External booking-channel integrations.
- Advanced APIs and integrations.
- Multi-tenancy.
- Automated email/push notifications.
- Payments and invoicing.
- Advanced analytics.

## 9.1. Android caller-id app

Rental managers who receive customer calls on Android phones would like to identify an incoming call's phone number against the customer database and show relevant information during the ringing phase. Information displayed can be something like the customer's name, risk score, comment, etc.

The proposed approach is a small native Android companion application that communicates with the .NET backend.

# 10. Development milestones

Foundation:
- Solution structure.
- Database configuration.
- Responsive layout.
- Authentication.
- Navigation.

Units and reservations:
- Manage bookable units.
- Create and edit reservations.
- Time-based availability.
- Conflict prevention.
- Shift templates.
- HTMX interactions.

Cleaning operations:
- Auto/Manually generate cleaning tasks.
- Checklists.
- Photographs.
- Manager review.

Reporting:
- Weekly, monthly and yearly reports.

Security and polish:
- Permissions.
- Audit history.
- Mobile usability.
- WebAuthn or mTLS planning/integration.

Implementation has NOT started.

# 11. Outstanding business decisions

The following require further discussion before finalizing the booking and cleaning architecture:

- Manual booking overrides: Which exceptional situations should managers be allowed to handle?

# 12. Outstanding technical investigations

EF Core concurrency handling.
Idempotency key implementation.
Database provider selection.

# 13. Immediate next steps

At the beginning of the next session:
- Review this context.
- Discuss outstanding items.
- Update README.md, PROJECT.md, ARCHITECTURE.md, DECISIONS.md and ROADMAP.md once the relevant decisions have been agreed upon.

Do not start implementation until the business rules and initial architecture have been sufficiently clarified.

# 14. Working preferences

Keep discussions relatively short and concise, because we expect many follow-up questions.
Explain trade-offs and raise important questions early.
Do not silently turn proposals into agreed decisions.
Prefer simple solutions and avoid premature complexity.
Git repository: https://github.com/anonymous3244-gh/OLAF
The repository should become the single source of truth for project documentation and development state.

At the end of each session, create updated SESSION.md with decisions, outstanding questions and the next concrete actions.
