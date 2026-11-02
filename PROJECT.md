# OLAF — Project Requirements

Last updated: 2026-11-03

This document is the authoritative source for OLAF's functional requirements and business rules.

## 1. Purpose and scope

OLAF is a mobile-first rental management application for managing bookable facilities, customer use, reservations and cleaning operations.

The initial release serves one business. It supports facility and customer management, reservation templates, reservation and availability management, cleaning workflows, operational notifications, reporting and audit history.

Customers do not have access to OLAF in the initial release. Rental managers create and manage customer records and reservations.

## 2. Initial release

The initial release includes the features defined in sections 3–13.

Initial user roles are:
- **Administrator:** Has all application permissions, including user and permission management.
- **Rental manager:** Has all application permissions except user and permission management.
- **Cleaning staff:** Can access only cleaning reservations assigned to them and perform the permitted cleaning workflow actions on those reservations.

Customer self-service, multi-tenant support and other future possibilities are outside the initial release unless explicitly moved into scope through a new decision.

## 3. Facilities (FAC)

The application must support managing bookable facilities/units.

Managers must be able to:
- Create, edit and deactivate facilities.
- Manage facility-specific reservation settings.
- Associate reservation templates with specific facilities.

Each facility must have a mandatory cleaning-duration setting. It represents the time required to clean the facility after Customer use. It determines the duration of automatically generated Cleaning reservations and is not a separate cleaning-buffer setting.

A facility can have multiple reservations throughout the same calendar day, provided all availability rules are satisfied.

## 4. Customers (CUS)

Customer management is part of the initial release.

Managers must be able to:
- Create and edit customer records.
- Search and browse existing customers.
- View customer reservation history.
- Maintain internal comments and relevant customer information.

Potential customer information includes name, contact information, reservation history, internal comments and relevant operational information such as a risk assessment.

During reservation creation, the interface must provide:
- A searchable dropdown for selecting an existing customer.
- An action to create a customer without leaving the reservation form.
- Automatic selection of the newly created customer after successful creation.

Customer creation may use an inline or modal interface. The objective is to avoid interrupting reservation creation.

Customers cannot access the application or create their own reservations in the initial release.

## 5. Reservation templates (TMP)

Managers must be able to define reusable reservation templates containing:
- Name.
- Start time.
- End time.
- Price.

Templates may be associated with specific facilities.

Selecting a template populates the reservation form with its predefined values. Managers can modify those values or enter completely custom reservation times and prices.

Templates must support overnight periods and 24-hour reservations. They must not impose artificial restrictions on reservation duration.

The term **reservation template** is used; *shift template* is not the preferred term.

## 6. Reservations (RES)

### 6.1 Reservation model and types

Everything that occupies a bookable facility is represented as a reservation.

The initial release has exactly three reservation types:

- **Customer use:** A facility reserved for customer bookings, owner use or complimentary stays. These are purposes or contexts of Customer use, not separate reservation types.
- **Cleaning:** A facility reserved for cleaning and preparation. Cleaning reservations may be generated automatically or created independently.
- **Offline:** A facility unavailable due to maintenance, renovations, temporary closure or similar reasons. Offline reservations do not generate cleaning reservations.

Reservations share common concepts:
- Facility.
- Start date/time.
- End date/time.
- Type and, where applicable, purpose.
- Optional price.
- Optional assignee.

Price and assignee are not applicable to every reservation type.

### 6.2 Reservation times

Reservations must support arbitrary start and end date/time values, including:
- A few hours.
- 24 hours or longer.
- Overnight periods.
- Manually entered custom periods.

Reservations must not be artificially restricted to predefined durations.

### 6.3 Confirmation and completion

Customer use reservations created by a manager are confirmed immediately. There is no pending Customer use reservation state in the initial release.

Customer use reservations do not require an explicit completed status. Once their end time passes, they are considered completed based on their timestamps.

Cleaning reservations have a separate explicit completion and approval workflow defined in section 9.

### 6.4 Modification and cancellation

Managers can modify and cancel reservations subject to the availability rules and the associated cleaning workflow.

Cancelled reservations:
- Remain in the database for historical and reporting purposes.
- No longer block availability.
- Retain their original start and end times.

Cancellation changes the cancellation state only; it does not change the occupied time period and therefore does not require availability validation.

Modifying or cancelling a Customer use reservation must also handle its associated Cleaning reservation as defined in section 9. Related changes must succeed together or be rolled back together.

Automatic changes to associated cleaning are permitted only before the Customer use reservation starts. Once it has started, it cannot be modified or cancelled in a way that requires changing its associated Cleaning reservation. Managers may independently edit Cleaning reservations when necessary.

### 6.5 Idempotency and concurrent changes

Repeating the same logical reservation operation must not create duplicate reservations or duplicate associated Cleaning reservations.

The application must detect stale updates when multiple managers edit the same reservation. Changes must never silently overwrite another manager's modifications.

## 7. Availability and conflicts (AVL)

Two active reservations must never overlap for the same facility. This applies to all three reservation types: Customer use, Cleaning and Offline.

Cancelled reservations do not block availability.

A facility cannot transition directly from one Customer use reservation to another without the required Cleaning reservation. The required cleaning time must be available between Customer use reservations.

Availability/conflict validation is required when:
- Creating a reservation.
- Modifying a reservation.
- Creating a standalone Cleaning reservation.
- Creating an Offline reservation.
- Adjusting the associated Cleaning reservation when a Customer use reservation is modified.

Creating a Customer use reservation and its associated Cleaning reservation is one atomic operation. Both resulting reservations must pass availability validation; if either conflicts, neither is created.

Simultaneous booking attempts must be handled safely so that only one conflicting operation can succeed. Managers cannot override existing reservation conflicts.

If a facility must be taken Offline despite existing future reservations, the manager must first contact affected customers and cancel or reschedule their reservations before creating the Offline reservation.

Cancellation does not require availability validation because it does not introduce or modify an occupied time period.

## 8. Cleaning and preparation (CLN)

### 8.1 Cleaning reservations

Cleaning is represented by an actual reservation.

A Cleaning reservation has:
- Facility.
- Start date/time.
- End date/time.
- Cleaning status.
- Optional price/cost.
- Optional assigned cleaning staff member.

A Cleaning reservation has a fixed time slot and a deadline equal to its end time. It does not automatically extend until the next Customer use reservation. Cleaning reservations occupy the facility and participate in availability/conflict validation.

### 8.2 Automatic generation and relationship to Customer use

Every Customer use reservation automatically generates exactly one associated Cleaning reservation, and the Customer use reservation references that associated Cleaning reservation.

The generated Cleaning reservation:
- Starts when the Customer use reservation ends.
- Has a duration equal to the facility's configured mandatory cleaning duration.
- Has a fixed end time, which is its deadline.
- Is initially unassigned.

Cleaning reservations are generated eagerly, even when no subsequent Customer use reservation exists. Facilities should be cleaned as early as possible and remain ready for future customers.

The following operations are atomic:

**Creation**
- Create the Customer use reservation.
- Create exactly one associated Cleaning reservation.
- Leave the generated Cleaning reservation unassigned.
- Validate availability for both reservations.
- If either reservation conflicts, create neither.

**Modification**
- Modify the Customer use reservation and automatically adjust its associated Cleaning reservation.
- Validate all resulting conflicts.
- Succeed together or roll back together.
- Perform automatic associated-cleaning changes only before the Customer use reservation starts.

Once a Customer use reservation has started, it cannot be modified or cancelled in a way that requires changing its associated Cleaning reservation.

**Cancellation**
- Cancel the Customer use reservation and its associated Cleaning reservation together.
- Preserve both reservations' original dates and times.
- Do not perform availability validation.

Standalone Cleaning reservations do not require an associated Customer use reservation. Managers may create as many as necessary, subject to availability. Managers can independently edit or cancel standalone Cleaning reservations.

### 8.3 Assignment

Automatically generated Cleaning reservations are initially unassigned.

Managers manually assign one cleaning staff member and may change the assignment when necessary.

Automatic staff scheduling based on working shifts and workload is outside the initial release.

### 8.4 Staff workflow

Cleaning staff must be able to:
- View only their assigned Cleaning reservations.
- See upcoming cleaning deadlines.
- Open an assigned Cleaning reservation.
- Follow a step-by-step cleaning checklist.
- View reference photographs for checklist items.
- Capture completion photographs.
- Mark cleaning as completed and submit it for manager review.
- Reopen a task when corrections have been requested, correct the specified checklist steps and resubmit it.

A future mobile camera workflow may include a semi-transparent reference-photograph overlay to help staff reproduce the desired result.

### 8.5 Manager workflow and states

Managers must be able to:
- Monitor upcoming and overdue Cleaning reservations.
- Review submitted cleaning sessions.
- Approve completed cleaning.
- Request corrections to specific checklist steps.

Cleaning reservations have four states:
- **Pending:** Cleaning has not yet been completed.
- **Completed:** Cleaning staff submitted the task for manager approval.
- **Correction requested:** The manager requested corrections.
- **Approved:** The manager accepted the completed cleaning.

Cleaning staff may move an assigned Cleaning reservation from Pending or Correction requested to Completed. Managers review Completed reservations and may move them to Approved or Correction requested. Manager approval is mandatory; staff completion alone does not mean that cleaning is approved.

When corrections are requested, the task becomes available to its assigned staff member again. The staff member corrects the specified steps and resubmits it for manager approval. This cycle may repeat until approval.

There are no automatic approvals or complex escalation mechanisms if a manager does not review a submission. Managers and cleaning staff are responsible for ensuring cleaning is completed and approved before the next customer arrives. If a facility is not ready for an upcoming customer, the responsible people must resolve the situation directly.

The application must provide visibility into:
- Upcoming cleaning deadlines.
- Overdue Cleaning reservations.
- Cleaning awaiting manager approval.
- Cleaning requiring corrections.

If a Cleaning reservation reaches its end time without being marked Completed, managers must receive a warning/notification.

## 9. Users and permissions (USR)

The initial roles and permissions are:

- **Administrator:** All application permissions, including user and permission management.
- **Rental manager:** All application permissions except user and permission management.
- **Cleaning staff:** Access only to Cleaning reservations assigned to that staff member, with permission to perform the assigned cleaning workflow actions.

Customers have no direct application access in the initial release. Rental managers manage customer records and reservations.

Authorization must enforce these boundaries; hiding interface elements alone is not sufficient.

## 10. Notifications (NTF)

The application must notify managers when a Cleaning reservation reaches its deadline without being marked Completed.

Other possible notification events include:
- Changes to assigned Cleaning reservations.
- Cleaning assignment changes.
- Cleaning completion submissions.
- Requests for cleaning corrections.

Notification channels and escalation rules remain to be defined. No automatic escalation or approval mechanisms are planned for overdue manager reviews.

Automated email and push notifications are a possible future enhancement, not a committed initial-release requirement.

## 11. Reporting (RPT)

The initial reporting periods are:
- Weekly.
- Monthly.
- Yearly.

Reports should cover:
- Revenue.
- Reservation counts.
- Facility occupancy.
- Cleaning workload.
- Cleaning completion rates.

Customer revenue must be distinguished from cleaning costs and Offline reservations, which are non-revenue facility reservations.

Reporting definitions and calculations must be agreed before implementation.

## 12. Audit history (AUD)

Important reservation and cleaning workflow changes must be recorded in an audit history.

At minimum, audit records must capture:
- Who performed the operation.
- What changed.
- When it happened.
- Previous and new values where appropriate.

Relevant events include reservation creation, modification and cancellation; reservation date, price and type changes; Cleaning reservation creation, modification and cancellation; assignment changes; status transitions; completion submissions; manager approvals; correction requests; affected checklist steps; and resubmissions.

The exact audit implementation is not prescribed here.

## 13. General requirements

- The application must provide a responsive, mobile-friendly experience, with particular attention to cleaning staff using small screens during daily work.
- Store timestamps in UTC, display times in the browser's local time zone, and perform appropriate time-zone conversions at application boundaries.
- Prevent repeated submissions of the same logical reservation operation from creating duplicates.
- Detect stale reservation updates rather than silently overwriting concurrent changes.
- Photographs should be stored as files rather than database blobs. The database should store file references and relevant metadata; the storage implementation remains undecided.

## 14. Future possibilities

The following items are outside the initial release. Their presence here does not by itself commit them to a delivery date:

1. Automatic cleaning staff scheduling based on working shifts and workload.
2. WebAuthn/passkeys.
3. mTLS.
4. Customer self-service reservations. Before introducing this, consider prepayment or customer-specific trust rules because Customer use reservations are immediately confirmed.
5. Payments and invoicing.
6. A native Android caller-identification companion application connected to the OLAF customer database, potentially showing customer name, risk score, internal comments and relevant reservation history.
7. External booking-channel integrations.
8. Multi-tenant support.
9. Advanced external APIs and integrations.
10. Advanced analytics and reporting.

Database provider and hosting selection remain deferred technical choices, not future product features.
