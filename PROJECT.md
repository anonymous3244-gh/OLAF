# OLAF — Project Requirements

Last updated: 2026-11-06

This document is the authoritative source for OLAF's functional requirements and business rules.

## 1. Purpose and scope

OLAF is a mobile-first rental management application for managing bookable facilities, customer use, reservations and cleaning operations.

The initial release serves one business. It supports facility and customer management, reservation templates, reservation and availability management, cleaning workflows, operational notifications, reporting and audit history.

Customers do not have access to OLAF in the initial release. Rental managers create and manage customer records and reservations.

## 2. Initial release

The initial release includes the features defined in sections 3–13.

Initial user roles are:
- **Administrator:** Has all application permissions, including management of all user accounts and settings.
- **Rental Manager:** Has all operational permissions and can manage Cleaning Staff accounts, but cannot manage Administrator or Rental Manager accounts.
- **Cleaning Staff:** Can access assigned and unassigned Cleaning reservations, but not tasks assigned to other staff, and can perform only the permitted cleaning workflow actions.

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

Cleaning reservations have a separate explicit completion and approval workflow defined in Cleaning and preparation (CLN).

### 6.4 Modification and cancellation

Managers can modify and cancel reservations subject to the availability rules and the associated cleaning workflow.

Cancelled reservations:
- Remain in the database for historical and reporting purposes.
- No longer block availability.
- Retain their original start and end times.

Cancellation changes the cancellation state only; it does not change the occupied time period and therefore does not require availability validation.

Modifying or cancelling a Customer use reservation must also handle its associated Cleaning reservation as defined in Cleaning and preparation (CLN). Related changes must succeed together or be rolled back together.

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

### 8.4 Cleaning staff workflow

Cleaning staff must be able to:
- View Cleaning reservations assigned to them and unassigned Cleaning reservations, but not tasks assigned to other staff.
- See upcoming cleaning deadlines and open eligible task details.
- Claim an eligible unassigned Pending task.
- Complete the checklist and submit the task for review.
- Correct only the steps requested by the latest correction review and resubmit.

Cleaning staff cannot edit reservation details or release an assignment themselves. They may complete an assigned task before its scheduled end; the end time is the deadline by which the facility must be vacated, not the earliest permitted completion time.

The calendar is shared with managers, but Cleaning Staff see only Cleaning reservations that are assigned to them or unassigned. They can select active facilities in the calendar selector; the selected facilities filter the calendar but do not expand task visibility beyond those permissions.

### 8.5 Manager review workflow and states

Cleaning reservations use these states:
- **Pending:** Not yet submitted for review.
- **ReadyForReview:** Staff submitted the cleaning and it awaits a manager.
- **InReview:** A manager has claimed the review.
- **CorrectionRequested:** The manager requested corrections to specified steps.
- **Approved:** The cleaning was approved; this is a final state.

A staff submission moves Pending or CorrectionRequested to ReadyForReview, unless that staff member has automatic approval enabled, in which case it moves directly to Approved. Automatic approval is configurable on the staff account by Administrators and Rental Managers, defaults to disabled, and affects future submissions only. It does not change tasks already awaiting review.

All managers are notified when a task enters ReadyForReview. The first manager to start reviewing it atomically claims it and changes it to InReview; other managers cannot review it concurrently. The claim records the manager and time. The review-request notification is withdrawn for all managers when the task is claimed.

A manager completes the review by approving or requesting corrections. Approval comments are optional. A correction request requires at least one actionable comment on a step. The assigned staff member is notified of approval (including any comments) or a correction request (including its comments).

Only an Administrator may return a task from InReview to ReadyForReview. This exceptional action requires a reason, is audit-logged and notifies all managers again. There is no automatic release, escalation or time threshold.

A task may go through multiple correction and review cycles. Each submission creates a distinct immutable Review record containing its outcome, timestamp, submitted-photo snapshot and step comments. Earlier reviews and photos remain available for history and audit; later reviews never overwrite them.

For a CorrectionRequested review, only steps commented on in that latest correction-requested review require new work. Previously approved steps do not reappear in the staff workflow. For each correction step, staff can see the previously submitted photo and the manager's comment. Initial submission requires one photo for every checklist step; a correction submission requires one new photo for each step requiring correction. Each step has exactly one photo per review.

Staff can preview and replace photos before submitting. There is no draft-saving; photo capture and submission happen in one sitting. Photos are captured using the device camera only; selecting existing files from device storage is not supported. The same camera flow is used on phones, tablets and desktop browsers where a camera is available. If no camera is available, submission cannot proceed. Browser camera restrictions discourage reuse of old images but are not treated as protection against virtual-camera workarounds.

Managers can review each submitted step, toggle the original/reference photo over the submitted photo for comparison, and leave one optional multiline comment per step. Comments and decisions remain attached to their specific Review. There are no comment threads or replies.

Pending tasks do not count as work in progress and multiple non-overlapping tasks may be assigned to one staff member. ReadyForReview and CorrectionRequested tasks count as work in progress; Approved tasks do not. A staff member cannot have overlapping assigned Cleaning reservations, regardless of facility or task status.

Managers may assign or reassign a Cleaning task until its scheduled end time has passed. Only active Cleaning Staff accounts are available in the assignment selector. All managers can see all Cleaning reservations. Deactivating a staff account does not automatically change its assignments; an Administrator must handle reassignment when necessary.

Automatic cleaning duration changes affect newly generated Cleaning reservations only. Existing reservations retain their original times.

## 9. Users and permissions (USR)

The initial roles are Administrator, Rental Manager and Cleaning Staff.

- **Administrator:** All application permissions, including management of all user accounts and settings.
- **Rental Manager:** All operational application permissions and management of Cleaning Staff accounts, but not Administrator or Rental Manager accounts.
- **Cleaning Staff:** Access to assigned and unassigned Cleaning tasks, subject to the workflow permissions in CLN. They cannot access tasks assigned to another staff member.

There is no public self-registration. Administrators create Administrator and Rental Manager accounts; Administrators and Rental Managers can create Cleaning Staff accounts.

User accounts are deactivated rather than deleted. Deactivated users cannot sign in, but their identities remain associated with historical reservations, reviews, comments and audit records. Deactivation does not automatically unassign active Cleaning reservations; an Administrator handles reassignment when necessary.

Reactivating an account restores its previous role and settings. Rental Managers may manage basic account details and the automatic-approval setting for Cleaning Staff, but may not change preferences or other settings controlled by the staff member. Administrators can manage all account settings.

Rental Managers may reset Cleaning Staff passwords. A password reset requires the staff member to choose a new password at the next sign-in, using the existing mandatory-password-change mechanism. Deactivated accounts are retained indefinitely; permanent deletion is not supported.

Cleaning Staff may claim eligible unassigned Pending Cleaning tasks, but cannot release their own assignments. Account and permission boundaries must be enforced server-side; hiding interface elements alone is insufficient.

Customers have no direct application access in the initial release. Rental Managers manage customer records and reservations.

## 10. Notifications (NTF)

In-app notifications are persistent and are the source of truth. Web Push is used for supported devices as an immediate, best-effort delivery channel. Push delivery failure must not prevent the in-app notification from being recorded.

The initial notification events are:
- A Cleaning task enters ReadyForReview without automatic approval: notify all managers.
- A manager claims a review: withdraw that review-request notification for all managers.
- A Cleaning task is Approved: notify the assigned Cleaning Staff member, including any review comments.
- A Cleaning task enters CorrectionRequested: notify the assigned Cleaning Staff member, including the required comments.

Notifications are high-priority and action-oriented; do not send routine status updates, reminders or low-value messages. Do not group or batch notifications initially. Opening a notification marks it as read. Selecting it opens the relevant task or review, subject to authorization. Obsolete notifications are withdrawn when their action is no longer available.

Push is enabled by default on supported devices and requires the browser/device permission. OLAF does not provide a global push opt-out; users can control notifications through their operating system or browser. Device sound and vibration remain under OS control. iOS/iPadOS push support requires adding OLAF to the Home Screen on supported versions (16.4 or later); provide setup instructions. Initially, one push-enabled device is registered per user; registering another replaces the previous subscription. In-app notifications remain available on any device after sign-in.

There is no automatic escalation or time-based reassignment of reviews. The exceptional Administrator action for returning an InReview task to ReadyForReview is human-initiated and reasoned.

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

- The application must provide a responsive, mobile-first experience.
- Store timestamps in UTC, display times in the browser's local time zone, and perform appropriate time-zone conversions at application boundaries.
- Prevent repeated submissions of the same logical reservation operation from creating duplicates.
- Detect stale reservation updates rather than silently overwriting concurrent changes.
- Store photographs as files rather than database blobs. Store file references and relevant metadata in the database; the storage provider remains undecided.
- Important user, reservation and cleaning workflow changes must be auditable.
- Authorization and business rules must be enforced server-side.

## 14. Calendar and interaction experience (M6)

### 14.1 Calendar

The reservation overview is the main workspace for Administrators and Rental Managers. Cleaning Staff use the same calendar implementation with role-filtered data.

On desktop and tablet, show a weekly calendar with days horizontally and time vertically. On mobile, show one day at a time with vertical scrolling, previous/next-day controls, Today and a date picker; horizontal swipes change the day. Desktop navigation provides previous week, Today, next week and a date picker. A fresh calendar opening starts on the current date, not the last viewed date.

The calendar is a combined timeline for all selected facilities, not a set of fixed facility lanes. Reservations for different facilities that overlap in time appear side by side; a single reservation can use the full available width. Keep placement stable according to selected-facility order where practical. Reservation type determines the block background; a narrow stripe at the left identifies the facility.

Default displayed hours are 06:00–23:00. This is a global display range, not a booking restriction; times outside it remain bookable and reachable by scrolling. Administrators and Rental Managers can change the range. There are no separate availability indicators or reservation-type filters.

Cancelled reservations are hidden by default. A Show cancelled toggle reveals them in a muted style and resets to off whenever the calendar is freshly opened. There is no drag-and-drop editing.

The facility selector is one scrollable checkbox list with a tag filter, Select all and Deselect all. Facilities may have multiple tags. The global Selected calendar units color palette defines both the number of simultaneously selectable facilities and their colors. Selected facilities receive colors dynamically in selector order, not checkbox-click order. The first selected facility receives the first palette color, and so on; colors are not permanently assigned to facilities and are not cycled. When the limit is reached, remaining unchecked facilities are disabled.

Selected facilities are remembered per user and browser/device in local storage, not in the database. The preference is not audited and is not synchronized between devices. On mobile, the filter control displays the selected count rather than facility names; its panel is a full-screen overlay. On desktop, the selector is a side panel. Closing it preserves calendar date and other view state.

Cleaning Staff may select from all active facilities, but their calendar displays only Cleaning reservations assigned to them or unassigned. Managers see all reservations.

### 14.2 Reservation creation, editing and details

Creating a reservation starts by selecting an empty calendar slot. If multiple facilities are selected, first choose one facility from those available for the selected time; do not automatically choose one. If only one facility is selected, it is already known. The facility is fixed before the form opens and is not editable inside the create/edit form.

After facility selection, show a centered reservation-type dialog with three stacked text-only choices: Customer, Cleaning and Offline, each with its configured color indicator. Selecting a type immediately opens its form. The type dialog shows no slot preview and closes on Escape or outside click because no data has yet been entered.

Reservation create/edit forms use a centered modal on desktop and a full-screen modal on mobile. Dim and block the background, prevent background scrolling, trap keyboard focus and allow scrolling within the modal when needed. Clicking outside does nothing. Escape or an explicit close/navigation action attempts to close the modal; if there are unsaved changes, show a confirmation modal above it. The confirmation reads “You have unsaved changes. Discard them?” and offers Discard changes and Keep editing. Clicking outside the confirmation does nothing; Escape means Keep editing. Browser refresh, tab close or navigation away from the page also invokes the browser's native unsaved-changes warning. OLAF navigation that would destroy the form is intercepted and uses the same confirmation. The form remains intact beneath the confirmation.

Reservation details remain read-only by default and use the same modal presentation as reservation creation and editing: a centered modal on desktop and a full-screen modal on mobile. The calendar remains in the background and is non-interactive while any reservation modal is open. The detail view has separate presentations for Customer, Cleaning and Offline reservations. It shows the facility name prominently, reservation type, status near the top, dates/times (not a separate duration), reservation ID formatted as #12345, and Last modified by/at. A narrow reservation-type color stripe appears in the header; no facility color stripe is shown in details. Use structured read-only content, not editable-looking fields. A fixed action bar provides Edit and Cancel reservation. The customer and its associated Cleaning reservation remain separate calendar items and detail views; do not expose their internal relationship in the UI.

### 14.3 Reservation forms and availability feedback

Customer forms contain Customer details (name and phone), Quick fill, Start/End date and time, Total price and Notes. Name and phone are side by side on desktop and stacked on mobile; Start/End follow the same responsive pattern. Quick fill is a full-width row above Start/End. Selecting an optional facility-specific template immediately overwrites only the fields relevant to that form; there is no Apply step or persistent template relationship. Values remain editable. Customer details and Notes are not changed by template selection. Total price is entered manually, without automatic calculation.

Customer records are identified through one primary customer name and phone number. Phone numbers are normalized for uniqueness. Selecting a known phone prefills the existing customer's name, which is read-only in the reservation form. A manager can change the customer on an existing reservation by selecting another or creating a new customer. Existing customer phone numbers are immutable; changing a phone requires a new customer record and does not merge records or alter historical reservations. Customer internal IDs are not displayed. Customer search supports partial name/phone matching. Customer history shows the latest ten reservations, all types including cancelled, newest first.

Cleaning forms use the common reservation fields plus an optional assigned Cleaning Staff member. Offline forms use the common reservation fields, a mandatory free-text reason and optional Notes. Templates are optional on all three forms; selecting one changes only fields applicable to that form. Start and End are populated for all types; Total price is populated only for Customer. Customer details, assignee, Offline reason and Notes are not overwritten by template selection.

Availability is checked after both Start and End are valid and rechecked 500 ms after the last valid change to either value. Unit/facility is already fixed and does not change inside the form. Show a subtle inline loading indicator, then only a conflict message or a green success checkmark (no “Available” text). A conflict message near the date/time fields identifies the conflicting reservation type and start/end times, without repeating the known facility. Save is enabled only when all required fields are valid and availability is confirmed. Save disables immediately on submission and shows a loading state. On failure, keep the form open and entered values intact; display the error and keep Save disabled until a relevant field changes and validation succeeds. Unrelated field edits do not clear an existing availability conflict or trigger a new availability check. Server-side validation is authoritative. Concurrent conflicts discovered at save are shown inline without discarding the form.

### 14.4 Reservation cancellation, restoration and refresh

Cancellation uses one confirmation dialog for all reservation types, with an optional reason and Confirm cancellation / Go back actions. Cancellation preserves the original reservation details and times and does not run availability validation. Cancelling Customer use also cancels its associated active Cleaning reservation in the same transaction.

Cancelled reservations cannot be deleted. Create new from this is available only for cancelled reservations and copies the relevant original data into a new form; the new reservation receives a new ID and fresh history and undergoes normal validation. A Customer use copy generates a fresh associated Cleaning reservation.

Restoration is a dedicated status-only action. It restores the previous status without changing dates, times, customer, price, notes, assignment or other details, and is subject to normal availability/business-rule validation. Restoring Customer use also attempts to restore its associated cancelled Cleaning reservation in the same transaction; if either restoration fails, both roll back. If the associated Cleaning reservation is already active, leave it unchanged. Edit requires restoring first.

After a successful save, cancellation or restoration, close the form/dialog and reload all reservations in the currently visible calendar range. Preserve the current date, selected facilities and view settings. Do not show a success toast.

### 14.5 Calendar refresh and request recovery

While the calendar is the active workspace, refresh reservations every 30 seconds. Pause polling while any reservation modal/dialog is open and while the browser tab is hidden. When a modal closes or the tab becomes visible again, refresh immediately and resume the interval. Do not overlap refresh requests. A refresh must not disturb an open form or its unsaved values.

Share request-recovery conventions between two thin integrations: HTMX lifecycle handling and a helper for ordinary Fetch requests. Do not build a general-purpose HTTP client abstraction.

- **401:** Session expired. Preserve the form and show a note explaining that the user can sign in in another tab, with a login link that opens a new tab. Do not redirect away from the form. When the original tab becomes visible again, retry the normal availability check first; only if it returns 401, attempt session/antiforgery recovery and retry the availability check once if recovery succeeds.
- **403:** The user is authenticated but lacks permission. Show a clear error; do not retry automatically.
- **419:** App-specific antiforgery-token failure. Obtain a fresh token and retry the request once. This is distinct from ordinary 400 Bad Request; do not automatically retry every 400.
- Prevent infinite retries and duplicate submissions.

### 14.6 Shared settings and user preferences

Administrators and Rental Managers can configure two global palettes: Selected calendar units colors and reservation type colors (Customer, Cleaning, Offline). Palette values are hexadecimal HTML/CSS colors, validated with live previews. Exact duplicates are rejected after case normalization; visually similar colors are allowed. The facility palette contains one or more colors and determines the maximum number of facilities selectable at once. Changes apply on the next calendar load and do not force-refresh open calendars.

The first day of the week is an individual Administrator/Rental Manager preference, defaulting to Monday with Sunday as an alternative. The selected calendar units preference is stored locally per user/browser. The global calendar display range defaults to 06:00–23:00 and is configurable by Administrators and Rental Managers.

### 14.7 Notifications and operational review

Notification behavior is defined in section 10. Review history and submitted photos are immutable; staff-facing correction work is limited to steps requested in the latest correction review.

### 14.8 Application navigation

Desktop and tablet use a persistent, collapsible sidebar. It opens expanded whenever OLAF is reopened. When expanded, navigation items show icons and text labels; when collapsed, they show icons only. Navigation is tailored to the signed-in user's role.

- **Administrator:** Full application navigation (Calendar, Customers, Cleaning Staff, Notifications, Reports and Settings), plus a separate collapsible Administration group at the bottom containing User Management and Audit History.
- **Rental Manager:** Calendar, Customers, Cleaning Staff, Notifications, Reports and Settings.
- **Cleaning Staff:** Calendar and Notifications. Cleaning tasks are accessed through the Calendar and relevant notifications; there is no separate Cleaning navigation item.

All roles have Profile and Sign out in a separate area at the bottom of the sidebar. These actions are accessed through the sidebar only; do not add a duplicate user/avatar menu to the page header. The shared page header contains the page title and, on mobile, the navigation menu button. Profile provides access to personal account details, password changes and individual preferences. Application-wide configuration remains under Settings and is available according to role permissions.

Notifications display an unread-count badge for all roles. Opening a notification marks it as read and updates the count immediately.

On mobile, a hamburger button opens a navigation drawer over the current page. Selecting a navigation item closes the drawer automatically.

## 15. User account management (USR)

Account lifecycle and role permissions are defined in section 9. Account management must preserve the identity of deactivated users in historical data. Deactivated accounts are retained indefinitely and cannot be permanently deleted.

Every role has a Profile area for managing personal account details, changing the password and maintaining individual preferences. Application-wide configuration is managed separately through Settings, subject to role permissions.

## 16. Future possibilities

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

The selected database provider and preferred deployment model are recorded in `DECISIONS.md`; the concrete hosting environment remains open.
