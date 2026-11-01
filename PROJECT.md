# OLAF — Project Requirements

Last updated: 2026-11-01

## 1. Purpose and scope

OLAF is a mobile-first rental management application for managing bookable facilities, customer reservations and cleaning operations.

The initial release serves one business and has three main user roles:

- **Administrator:** Manages users, permissions and application administration.
- **Rental manager:** Manages facilities, reservations, customers and operational activities.
- **Cleaning staff:** Views assigned cleaning reservations and performs cleaning tasks.

Customers do not have access to the application in the initial release. All customer reservations are managed by rental managers.

The application should provide:
- Facility and availability management.
- Customer management.
- Customer reservation management.
- Reusable reservation templates.
- Cleaning scheduling and management.
- Operational monitoring and notifications.
- Financial and operational reporting.

## 2. Facilities

The application must support managing bookable facilities/units.

Each facility should have configurable properties relevant to its operation.

Planned functionality:
- Create, edit and deactivate facilities.
- Manage facility-specific reservation settings.
- Configure mandatory cleaning duration.
- Associate reservation templates with specific facilities.

Cleaning duration is a mandatory facility setting. It represents the time required to clean the facility after customer use.

This duration determines the length of automatically generated cleaning reservations. It is not a separate cleaning buffer setting.

A facility can have multiple reservations throughout the same calendar day.

## 3. Reservations

### 3.1 Reservation types

Everything that occupies a facility is represented as a reservation.

Initial reservation types include:

- **Customer use:** A facility reserved by a customer.
- **Cleaning:** A facility reserved for cleaning and preparation.
- **Offline/unavailable:** A facility unavailable due to maintenance, renovations, temporary closure or similar reasons.

Other purposes, such as promotional gifts or owner use, may also be represented through appropriate reservation types or purposes.

All reservation types share common concepts:
- Facility.
- Start date/time.
- End date/time.
- Type/purpose.
- Optional price.
- Optional assignee.

Price and assignee are not applicable to every reservation type.

### 3.2 Reservation times

Reservations must support arbitrary start and end date/time values.

Supported scenarios include:
- Reservations lasting a few hours.
- Reservations lasting 24 hours or longer.
- Overnight reservations.
- Manually entered start and end times.

Reservations must not be artificially restricted to predefined durations.

### 3.3 Reservation templates

Managers should be able to define reusable reservation templates containing:
- Name.
- Start time.
- End time.
- Price.

Selecting a template should populate the reservation form with its predefined values.

Managers must still be able to modify these values or enter completely custom reservation times and prices.

Templates may be associated with specific facilities.

Templates must support overnight periods and 24-hour reservations.

### 3.4 Reservation confirmation

All customer reservations are confirmed immediately when created by a manager.

There is no pending reservation state in the initial release.

### 3.5 Availability and conflicts

Two active reservations must never overlap for the same facility.

This applies to all reservation types, including customer use, cleaning and offline periods.

Consecutive customer reservations are not allowed because cleaning must take place between customer uses.

The system must validate availability when:
- Creating reservations.
- Modifying reservations.
- Creating cleaning reservations.
- Creating offline/unavailable periods.

Simultaneous booking attempts must be handled safely. Only one conflicting reservation can succeed.

Managers cannot override existing reservation conflicts.

If a facility must be taken offline despite existing future reservations, the manager must first contact affected customers, cancel or reschedule their reservations and then create the offline reservation.

### 3.6 Modification and cancellation

Managers can modify and cancel reservations, subject to availability and the associated cleaning workflow.

Cancelled reservations remain in the database for historical and reporting purposes but no longer block availability.

Customer reservation modifications must also account for their associated cleaning reservation (see section 4).

Cancellation does not change reservation dates or times. It simply changes the cancellation state, so no availability validation is necessary.

## 4. Cleaning and preparation

Cleaning is a core part of OLAF.

### 4.1 Cleaning reservations

Cleaning is represented by an actual reservation.

A cleaning reservation has:
- Facility.
- Start date/time.
- End date/time.
- Cleaning status.
- Optional price/cost.
- Optional assigned cleaning staff member.

A cleaning reservation has a fixed time slot and a clearly defined deadline equal to its end time.

It does not automatically extend until the next customer reservation.

Cleaning reservations occupy the facility and participate in availability/conflict validation.

### 4.2 Customer and cleaning reservation relationship

Every customer reservation automatically generates exactly one associated cleaning reservation.

Every customer reservation must reference its associated cleaning reservation.

Standalone cleaning reservations are also supported. Managers can create as many as necessary, without requiring an associated customer reservation.

The following operations must be atomic:

**Creating a customer reservation:**
- Create the customer reservation.
- Automatically create its cleaning reservation.
- Initially leave the cleaning reservation unassigned.

Both reservations must pass availability validation. If either reservation conflicts with an existing active reservation, neither reservation is created.

**Cancelling a customer reservation:**
- Cancel the customer reservation.
- Cancel its associated cleaning reservation.

Cancellation simply changes the cancellation state of both reservations. Their dates and times remain unchanged, and no availability validation is necessary.

**Modifying a customer reservation:**
- Modify the customer reservation.
- Automatically adjust its associated cleaning reservation.
- Validate all resulting conflicts.

All related changes must succeed together or be rolled back.

Automatic modifications to the associated cleaning reservation are only permitted if the customer reservation has not started.

Once a customer reservation has started, it cannot be cancelled or modified in a way that requires changing its associated cleaning reservation.

The cleaning reservation must never take place before the customer reservation ends.

Managers can independently edit cleaning reservations when necessary.

### 4.3 Cleaning scheduling

Facilities should be cleaned eagerly.

Every customer reservation generates a cleaning reservation immediately, even when no subsequent customer reservation exists.

The cleaning reservation:
- Starts when the customer reservation ends.
- Has a duration equal to the facility's configured cleaning duration.
- Has an explicit, fixed end time.

The objective is to ensure that facilities are cleaned and ready for the next customer as early as possible.

### 4.4 Cleaning staff assignment

INITIAL APPROACH:

- Cleaning reservations are created automatically as unassigned.
- Managers manually assign one cleaning staff member.
- Managers can change assignments when necessary.

Automatic staff scheduling based on working shifts and workload is deferred.

### 4.5 Cleaning workflow

Cleaning staff should be able to:
- View their assigned cleaning reservations.
- See upcoming cleaning deadlines.
- Open a cleaning reservation.
- Follow a step-by-step cleaning checklist.
- View reference photographs for checklist items.
- Capture completion photographs.
- Mark cleaning as completed.
- Submit the completed cleaning session for manager review.

A future mobile camera workflow may include a semi-transparent reference photograph overlay to help staff reproduce the desired result.

Managers should be able to:
- Monitor upcoming and overdue cleaning reservations.
- Review submitted cleaning sessions.
- Approve completed cleaning.
- Request corrections when necessary.

Manager approval is mandatory for every completed cleaning reservation.

Staff completion alone does not mean the cleaning operation is fully approved.

If a cleaning reservation reaches its end time without being marked as completed, managers must receive a warning/notification.

### 4.6 Cleaning approval workflow

Cleaning reservations have the following states:

- **Pending:** Cleaning has not yet been completed.
- **Completed:** Cleaning staff submitted the task for manager approval.
- **Correction requested:** Manager requested corrections to specific checklist steps.
- **Approved:** Manager accepted the completed cleaning.

When corrections are requested:
- The cleaning reservation becomes available to the assigned cleaning staff member again.
- The staff member can reopen the task.
- The staff member corrects the specified checklist steps.
- The staff member resubmits the cleaning for manager approval.

The workflow can repeat until the manager approves the cleaning.

There are no automatic approvals or complicated escalation mechanisms if a manager fails to review a submission.

Managers and cleaning staff are responsible for ensuring that cleaning is completed and approved before the next customer arrives.

If a customer is due to arrive and the facility is not ready, the manager and cleaning staff must resolve the situation directly.

The application should provide visibility into:
- Upcoming cleaning deadlines.
- Overdue cleaning reservations.
- Cleaning awaiting manager approval.
- Cleaning requiring corrections.

Important cleaning events must be recorded in the audit history, including submissions, approvals, correction requests, affected checklist steps and resubmissions.

### 4.7 Customer reservation completion

Customer reservations do not require an explicit completed status.

Once their end time passes, they are considered completed based on their timestamps.

Cleaning reservations are different because their completion requires an explicit action from the assigned cleaning staff member, followed by mandatory manager approval.

## 5. Customers

Customer management is part of the initial release.

Managers should be able to:
- Create customers.
- Edit customer information.
- Search and browse existing customers.
- View customer reservation history.
- Maintain internal comments and relevant customer information.

Potential customer information includes:
- Name.
- Contact information.
- Reservation history.
- Internal comments.
- Risk assessment or other relevant operational information.

### 5.1 Customer selection during reservation creation

The reservation creation interface should make customer selection and creation convenient.

The proposed interface includes:
- A searchable dropdown for selecting an existing customer.
- A `+` action to create a new customer without leaving the reservation creation screen.
- Automatic selection of the newly created customer after successful creation.

An inline or modal customer creation interface would be suitable.

The objective is to avoid interrupting the reservation creation workflow.

## 6. Users and permissions

Initial user roles:

- Administrator.
- Rental manager.
- Cleaning staff.

Rental managers are responsible for creating and managing customer reservations.

Cleaning staff can access their assigned cleaning reservations and perform the cleaning workflow.

Customers cannot access the application in the initial release.

Permissions must ensure that users can only perform operations appropriate to their roles.

## 7. Notifications

The application must notify managers when a cleaning reservation reaches its deadline without being completed.

Other notification requirements may include:
- Changes to assigned cleaning reservations.
- Cleaning assignment changes.
- Cleaning completion submissions.
- Requests for cleaning corrections.

Notification channels and escalation rules remain to be defined.

No automatic escalation or approval mechanisms are planned for overdue manager reviews.

## 8. Reporting

Planned reporting periods:
- Weekly.
- Monthly.
- Yearly.

Potential reports include:
- Revenue.
- Reservation counts.
- Facility occupancy.
- Cleaning workload.
- Cleaning completion rates.

Reporting definitions and calculations must be established before implementation.

Customer revenue must be distinguished from cleaning costs and offline reservations.

## 9. Future functionality

The following are outside the initial release scope.

### 9.1 Customer self-service

Allow customers to create and manage their own reservations.

Before introducing this functionality, payment/prepayment or customer-specific trust rules must be considered because reservations are confirmed immediately upon creation.

### 9.2 Android caller identification

A native Android companion application for identifying incoming customer calls against the OLAF customer database.

Potential information displayed:
- Customer name.
- Risk score.
- Internal comments.
- Relevant reservation history.

### 9.3 Additional possibilities

- External booking-channel integrations.
- Payments and invoicing.
- Automated email and push notifications.
- Automatic cleaning staff scheduling based on working shifts and workload.
- Advanced analytics and reporting.
- Multi-tenant support.
- Advanced external APIs.

## 10. Project status

Implementation has NOT started.

Business requirements and initial architecture are being clarified before development begins.

See:
- [DECISIONS.md](DECISIONS.md) for accepted business and architectural decisions.
- [ARCHITECTURE.md](ARCHITECTURE.md) for technical design.
- [ROADMAP.md](ROADMAP.md) for development milestones.