(() => {
  const body = document.body;
  const sidebar = document.getElementById('sidebar');
  const menuButton = document.getElementById('mobileMenuButton');
  const drawerCloseButton = document.getElementById('drawerCloseButton');
  const scrim = document.getElementById('mobileScrim');
  const collapseButton = document.getElementById('collapseSidebar');

  const setMobileMenu = (open) => {
    if (!sidebar || !menuButton || !scrim) return;
    sidebar.classList.toggle('mobile-open', open);
    body.classList.toggle('menu-open', open);
    scrim.classList.toggle('visible', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  };

  menuButton?.addEventListener('click', () => {
    setMobileMenu(!sidebar?.classList.contains('mobile-open'));
  });
  drawerCloseButton?.addEventListener('click', () => setMobileMenu(false));

  // The dimmed area intentionally does not dismiss the drawer.
  scrim?.addEventListener('click', (event) => event.preventDefault());

  collapseButton?.addEventListener('click', () => {
    body.classList.toggle('sidebar-collapsed');
    const collapsed = body.classList.contains('sidebar-collapsed');
    collapseButton.setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
    collapseButton.querySelector('.nav-label').textContent = collapsed ? 'Expand sidebar' : 'Collapse sidebar';
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 700) setMobileMenu(false);
  });

  const dateRange = document.getElementById('dateRange');
  const mobileDate = document.getElementById('mobileDate');
  const mobileDayName = document.getElementById('mobileDayName');
  const mobileTrack = document.getElementById('mobileDayTrack');
  const calendarFrame = document.querySelector('.calendar-frame');
  const desktopTracks = document.querySelectorAll('.desktop-calendar .day-track');
  const currentTimeIndicator = document.getElementById('currentTimeIndicator');
  const currentTimeLabel = document.getElementById('currentTimeLabel');
  const mobileReservationCount = document.getElementById('mobileReservationCount');
  const formatDate = (date, options) => new Intl.DateTimeFormat('en', options).format(date);

  const facilityButton = document.getElementById('facilityFilterButton');
  const facilityPanel = document.getElementById('facilityPanel');
  const facilityBackdrop = document.getElementById('facilityPanelBackdrop');
  const facilityClose = document.getElementById('facilityPanelClose');
  const facilityTagInput = document.getElementById('facilityTagInput');
  const facilityTagChips = document.getElementById('facilityTagChips');
  const facilityTagSuggestions = document.getElementById('facilityTagSuggestions');
  const facilityTagCombobox = document.getElementById('facilityTagCombobox');
  const facilityList = document.getElementById('facilityList');
  const facilityCheckboxes = [...(facilityList?.querySelectorAll('input[type="checkbox"]') || [])];
  const facilityLabel = document.getElementById('facilityFilterLabel');
  const facilityCount = document.getElementById('facilityFilterCount');
  const facilitySummary = document.getElementById('facilitySelectionSummary');
  const facilityStorageKey = 'olaf.calendar.selectedFacilities';
  const availableTags = [...new Set(facilityCheckboxes.flatMap((checkbox) =>
    checkbox.closest('.facility-option').dataset.tags.split(',').map((tag) => tag.trim())
  ))].sort((a, b) => a.localeCompare(b));
  const selectedTags = new Set();
  let activeTagSuggestion = 0;
  let selectedFacilities = new Set(facilityCheckboxes.map((checkbox) => checkbox.value));
  try {
    const saved = JSON.parse(localStorage.getItem(facilityStorageKey) || 'null');
    if (Array.isArray(saved)) selectedFacilities = new Set(saved.filter((id) => facilityCheckboxes.some((checkbox) => checkbox.value === id)));
  } catch { /* Use the default selection when local storage is unavailable. */ }

  const applyFacilitySelection = () => {
    facilityCheckboxes.forEach((checkbox) => { checkbox.checked = selectedFacilities.has(checkbox.value); });
    document.querySelectorAll('[data-facility]').forEach((reservation) => {
      reservation.hidden = !selectedFacilities.has(reservation.dataset.facility);
    });
    const count = selectedFacilities.size;
    if (facilityCount) facilityCount.textContent = String(count);
    if (facilityLabel) facilityLabel.textContent = count === facilityCheckboxes.length ? 'All facilities' : count === 0 ? 'No facilities' : window.innerWidth <= 700 ? 'Selected facilities' : count + ' facilities';
    if (facilitySummary) facilitySummary.textContent = count + ' of ' + facilityCheckboxes.length + ' selected';
    const visibleMobileReservations = mobileTrack?.querySelectorAll('.mobile-reservation:not([hidden])').length || 0;
    if (mobileReservationCount) mobileReservationCount.textContent = visibleMobileReservations + ' reservations';
    try { localStorage.setItem(facilityStorageKey, JSON.stringify([...selectedFacilities])); } catch { /* Selection still works for this page view. */ }
  };

  const setFacilityPanel = (open) => {
    if (!facilityPanel || !facilityButton || !facilityBackdrop) return;
    facilityPanel.hidden = !open;
    facilityBackdrop.hidden = !open;
    facilityButton.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('facility-panel-open', open);
    if (open) (facilityClose || facilityTagInput)?.focus();
    else facilityButton.focus();
  };

  facilityButton?.addEventListener('click', () => setFacilityPanel(facilityPanel.hidden));
  facilityClose?.addEventListener('click', () => setFacilityPanel(false));
  document.getElementById('facilityPanelDone')?.addEventListener('click', () => setFacilityPanel(false));
  facilityBackdrop?.addEventListener('click', () => setFacilityPanel(false));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && facilityPanel && !facilityPanel.hidden) setFacilityPanel(false);
  });
  const applyTagFilter = () => {
    facilityList?.querySelectorAll('.facility-option').forEach((option) => {
      const optionTags = option.dataset.tags.split(',').map((tag) => tag.trim());
      option.hidden = [...selectedTags].some((tag) => !optionTags.includes(tag));
    });
  };

  const closeTagSuggestions = () => {
    if (!facilityTagSuggestions || !facilityTagInput) return;
    facilityTagSuggestions.hidden = true;
    facilityTagInput.setAttribute('aria-expanded', 'false');
  };

  const renderTagSuggestions = () => {
    if (!facilityTagInput || !facilityTagSuggestions) return;
    const query = facilityTagInput.value.trim().toLocaleLowerCase();
    const matches = query
      ? availableTags.filter((tag) => !selectedTags.has(tag) && tag.toLocaleLowerCase().includes(query))
      : [];
    facilityTagSuggestions.replaceChildren();
    activeTagSuggestion = 0;
    matches.forEach((tag, index) => {
      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'tag-suggestion' + (index === activeTagSuggestion ? ' active' : '');
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', String(index === activeTagSuggestion));
      option.textContent = tag;
      option.addEventListener('mousedown', (event) => event.preventDefault());
      option.addEventListener('click', () => addSelectedTag(tag));
      facilityTagSuggestions.appendChild(option);
    });
    facilityTagSuggestions.hidden = matches.length === 0;
    facilityTagInput.setAttribute('aria-expanded', String(matches.length > 0));
  };

  const renderSelectedTags = () => {
    if (!facilityTagChips) return;
    facilityTagChips.replaceChildren();
    selectedTags.forEach((tag) => {
      const chip = document.createElement('span');
      chip.className = 'tag-chip';
      const label = document.createElement('span');
      label.textContent = tag;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'tag-chip-remove';
      remove.setAttribute('aria-label', 'Remove ' + tag + ' tag');
      remove.textContent = '×';
      remove.addEventListener('click', () => {
        selectedTags.delete(tag);
        renderSelectedTags();
        applyTagFilter();
        renderTagSuggestions();
      });
      chip.append(label, remove);
      facilityTagChips.appendChild(chip);
    });
  };

  const addSelectedTag = (tag) => {
    if (!availableTags.includes(tag) || selectedTags.has(tag)) return;
    selectedTags.add(tag);
    if (facilityTagInput) facilityTagInput.value = '';
    renderSelectedTags();
    applyTagFilter();
    closeTagSuggestions();
    facilityTagInput?.focus();
  };

  facilityTagInput?.addEventListener('input', renderTagSuggestions);
  facilityTagInput?.addEventListener('keydown', (event) => {
    const suggestions = [...(facilityTagSuggestions?.querySelectorAll('.tag-suggestion') || [])];
    if (event.key === 'ArrowDown' && suggestions.length) {
      event.preventDefault();
      activeTagSuggestion = (activeTagSuggestion + 1) % suggestions.length;
    } else if (event.key === 'ArrowUp' && suggestions.length) {
      event.preventDefault();
      activeTagSuggestion = (activeTagSuggestion - 1 + suggestions.length) % suggestions.length;
    } else if ((event.key === 'Enter' || event.key === 'Tab') && suggestions.length) {
      event.preventDefault();
      addSelectedTag(suggestions[activeTagSuggestion].textContent);
    } else if (event.key === 'Escape') {
      closeTagSuggestions();
    } else if (event.key === 'Backspace' && !facilityTagInput.value && selectedTags.size) {
      const lastTag = [...selectedTags].at(-1);
      selectedTags.delete(lastTag);
      renderSelectedTags();
      applyTagFilter();
    }
    suggestions.forEach((option, index) => {
      option.classList.toggle('active', index === activeTagSuggestion);
      option.setAttribute('aria-selected', String(index === activeTagSuggestion));
    });
  });
  facilityTagInput?.addEventListener('blur', () => {
    window.setTimeout(closeTagSuggestions, 120);
  });
  facilityTagCombobox?.addEventListener('focusout', (event) => {
    if (!facilityTagCombobox.contains(event.relatedTarget)) closeTagSuggestions();
  });
  facilityCheckboxes.forEach((checkbox) => checkbox.addEventListener('change', () => {
    selectedFacilities = new Set(facilityCheckboxes.filter((item) => item.checked).map((item) => item.value));
    applyFacilitySelection();
  }));
  document.getElementById('selectAllFacilities')?.addEventListener('click', () => {
    facilityList?.querySelectorAll('.facility-option:not([hidden]) input').forEach((checkbox) => selectedFacilities.add(checkbox.value));
    applyFacilitySelection();
  });
  document.getElementById('deselectAllFacilities')?.addEventListener('click', () => {
    facilityList?.querySelectorAll('.facility-option:not([hidden]) input').forEach((checkbox) => selectedFacilities.delete(checkbox.value));
    applyFacilitySelection();
  });
  applyFacilitySelection();
  const selectedDate = new Date();
  selectedDate.setHours(0, 0, 0, 0);

  const getMonday = (date) => {
    const monday = new Date(date);
    monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
    return monday;
  };

  const renderDate = () => {
    const weekStart = getMonday(selectedDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    if (dateRange) {
      dateRange.textContent = formatDate(weekStart, { month: 'short', day: 'numeric' }) + ' – ' + formatDate(weekEnd, { day: 'numeric', year: 'numeric' });
    }

    document.querySelectorAll('.desktop-calendar .day-column').forEach((column, index) => {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + index);
      const heading = column.querySelector('.day-heading');
      if (!heading) return;
      heading.querySelector('span').textContent = formatDate(day, { weekday: 'short' }).toUpperCase();
      heading.querySelector('strong').textContent = formatDate(day, { day: 'numeric' });
      column.classList.toggle('today-column', day.getTime() === selectedDate.getTime());
      const track = column.querySelector('.day-track');
      if (track) {
        track.querySelectorAll('.desktop-current-time').forEach((marker) => marker.remove());
        if (day.getTime() === new Date().setHours(0, 0, 0, 0)) {
          const marker = document.createElement('div');
          marker.className = 'current-time-indicator desktop-current-time';
          marker.innerHTML = '<span></span>';
          track.appendChild(marker);
        }
      }
    });

    if (mobileDate) mobileDate.textContent = formatDate(selectedDate, { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
    if (mobileDayName) mobileDayName.textContent = formatDate(selectedDate, { weekday: 'long' }).toUpperCase();
    if (mobileTrack) {
      const reservations = mobileTrack.querySelectorAll('.mobile-reservation');
      if (mobileReservationCount) mobileReservationCount.textContent = reservations.length + ' reservations';
      reservations.forEach((reservation) => {
        const startHour = Number(reservation.dataset.start);
        const endHour = Number(reservation.dataset.end);
        reservation.style.top = (startHour / 24 * 100) + '%';
        reservation.style.height = ((endHour - startHour) / 24 * 100) + '%';
      });

      const now = new Date();
      const isToday = selectedDate.getTime() === new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const currentHour = now.getHours() + now.getMinutes() / 60;
      const showCurrentTime = isToday;
      if (currentTimeIndicator) {
        currentTimeIndicator.hidden = !showCurrentTime;
        if (showCurrentTime) currentTimeIndicator.style.top = (currentHour / 24 * 100) + '%';
      }
      if (currentTimeLabel && showCurrentTime) {
        currentTimeLabel.textContent = formatDate(now, { hour: '2-digit', minute: '2-digit', hour12: false });
      }
    }

    document.querySelectorAll('.desktop-calendar .reservation').forEach((reservation) => {
      const range = reservation.dataset.timeRange || '';
      const match = range.match(/(\d{2}):(\d{2})–(\d{2}):(\d{2})/);
      if (!match) return;
      const start = Number(match[1]) + Number(match[2]) / 60;
      let end = Number(match[3]) + Number(match[4]) / 60;
      if (end <= start) end += 24;
      reservation.style.top = (start / 24 * 100) + '%';
      reservation.style.height = ((end - start) / 24 * 100) + '%';
    });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const currentHour = now.getHours() + now.getMinutes() / 60;
    document.querySelectorAll('.desktop-current-time').forEach((marker) => {
      marker.style.top = (currentHour / 24 * 100) + '%';
      marker.querySelector('span').textContent = formatDate(now, { hour: '2-digit', minute: '2-digit', hour12: false });
    });
  };

  document.getElementById('previousDay')?.addEventListener('click', () => {
    selectedDate.setDate(selectedDate.getDate() - (window.innerWidth <= 700 ? 1 : 7));
    renderDate();
  });
  document.getElementById('nextDay')?.addEventListener('click', () => {
    selectedDate.setDate(selectedDate.getDate() + (window.innerWidth <= 700 ? 1 : 7));
    renderDate();
  });
  document.getElementById('todayButton')?.addEventListener('click', () => {
    selectedDate.setTime(new Date().setHours(0, 0, 0, 0));
    renderDate();
  });
  renderDate();


  // Interactive calendar prototype: changes remain in the page and are not persisted.
  const reservationDialog = document.getElementById('reservationDialog');
  const reservationForm = document.getElementById('reservationForm');
  const reservationType = document.getElementById('reservationType');
  const reservationUnit = document.getElementById('reservationUnit');
  const reservationTitle = document.getElementById('reservationTitle');
  const reservationTitleField = document.getElementById('reservationTitleField');
  const customerPickerField = document.getElementById('customerPickerField');
  const customerSearch = document.getElementById('customerSearch');
  const customerSearchResults = document.getElementById('customerSearchResults');
  const customerSelectionHint = document.getElementById('customerSelectionHint');
  const reservationStartDate = document.getElementById('reservationStartDate');
  const reservationEndDate = document.getElementById('reservationEndDate');
  const reservationStart = document.getElementById('reservationStart');
  const reservationEnd = document.getElementById('reservationEnd');
  const reservationTypeHint = document.getElementById('reservationTypeHint');
  const reservationDialogTitle = document.getElementById('reservationDialogTitle');
  const reservationDialogEyebrow = document.getElementById('reservationDialogEyebrow');
  const customerDialog = document.getElementById('customerDialog');
  const customerForm = document.getElementById('customerForm');
  const customerName = document.getElementById('customerName');
  const customerPhone = document.getElementById('customerPhone');
  const customerEmail = document.getElementById('customerEmail');
  const customerNotes = document.getElementById('customerNotes');
  const reservationUnits = facilityCheckboxes.map((checkbox) => ({ id: checkbox.value, label: checkbox.closest('.facility-option').querySelector('strong').textContent }));
  let editingReservation = null;
  let selectedCustomerId = null;
  let selectedCustomerRecord = null;
  let customers = [];

  // Make the illustrative reservations editable too, using their displayed calendar dates.
  document.querySelectorAll('.desktop-calendar .reservation').forEach((element) => {
    const column = element.closest('.day-column');
    const index = [...(column?.parentElement?.querySelectorAll('.day-column') || [])].indexOf(column);
    const date = getMonday(selectedDate);
    date.setDate(date.getDate() + index);
    const match = (element.dataset.timeRange || '').match(/(\\d{2}:\\d{2})–(\\d{2}:\\d{2})/);
    if (match) {
      element.dataset.date = dateKey(date);
      element.dataset.startDate = dateKey(date);
      element.dataset.endDate = dateKey(date);
      element.dataset.startTime = match[1];
      element.dataset.endTime = match[2];
    }
    element.dataset.type = element.classList.contains('cleaning-block') ? 'cleaning' : element.classList.contains('offline-block') ? 'offline' : 'customer';
    element.addEventListener('click', (event) => {
      event.stopPropagation();
      openReservationDialog({ reservation: element });
    });
  });
  document.querySelectorAll('.mobile-calendar .mobile-reservation').forEach((element) => {
    const start = Number(element.dataset.start);
    const end = Number(element.dataset.end);
    element.dataset.date = dateKey(selectedDate);
    element.dataset.startDate = dateKey(selectedDate);
    element.dataset.endDate = dateKey(selectedDate);
    element.dataset.startTime = toTime(Math.floor(start), Math.round((start % 1) * 60));
    element.dataset.endTime = toTime(Math.floor(end), Math.round((end % 1) * 60));
    element.dataset.type = element.classList.contains('cleaning-block') ? 'cleaning' : element.classList.contains('offline-block') ? 'offline' : 'customer';
    element.addEventListener('click', (event) => {
      event.stopPropagation();
      openReservationDialog({ reservation: element });
    });
  });

  function dateKey(date) { return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-'); }
  function toTime(hour, minute) {
    const normalized = ((hour * 60 + minute) % 1440 + 1440) % 1440;
    return String(Math.floor(normalized / 60)).padStart(2, '0') + ':' + String(normalized % 60).padStart(2, '0');
  }
  const selectedUnitIds = () => [...selectedFacilities];
  const populateUnitOptions = (preferredId) => {
    reservationUnit.replaceChildren();
    const candidates = selectedUnitIds().length ? selectedUnitIds() : reservationUnits.map((unit) => unit.id);
    reservationUnits.filter((unit) => candidates.includes(unit.id)).forEach((unit) => {
      const option = document.createElement('option');
      option.value = unit.id;
      option.textContent = unit.label;
      reservationUnit.appendChild(option);
    });
    if (preferredId && candidates.includes(preferredId)) reservationUnit.value = preferredId;
    reservationUnit.disabled = candidates.length === 1;
  };
  const updateTypeHint = () => {
    const hints = {
      customer: 'Customer reservations automatically create a cleaning task.',
      cleaning: 'Use the title to describe the cleaning task.',
      offline: 'Use the title to describe the maintenance or offline period.'
    };
    const isCustomer = reservationType.value === 'customer';
    reservationTypeHint.textContent = hints[reservationType.value];
    customerPickerField.hidden = !isCustomer;
    reservationTitleField.hidden = isCustomer;
    reservationTitle.required = !isCustomer;
    reservationTitle.placeholder = reservationType.value === 'cleaning' ? 'Cleaning task' : 'Maintenance / offline reason';
  };
  const renderCustomerSearch = async () => {
    if (!customerSearchResults) return;
    const query = customerSearch.value.trim();
    customerSearchResults.replaceChildren();
    if (!query) { customerSearchResults.hidden = true; return; }
    try {
      const response = await fetch('/api/v1/customers?s=' + encodeURIComponent(query), { credentials: 'same-origin' });
      if (!response.ok) throw new Error('Customer search failed.');
      const result = await response.json();
      const matches = result.customers || [];
      customers = matches;
    matches.forEach((customer) => {
      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'customer-search-option';
      option.setAttribute('role', 'option');
      option.innerHTML = '<strong></strong><span></span>';
      option.querySelector('strong').textContent = customer.displayCaption;
      option.querySelector('span').textContent = [customer.phone, customer.email].filter(Boolean).join(' · ') || 'No contact details';
      option.addEventListener('click', () => selectCustomer(customer));
      customerSearchResults.appendChild(option);
    });
    if (query && !matches.length) {
      const empty = document.createElement('p');
      empty.className = 'customer-search-empty';
      empty.textContent = 'No matching customer. Use ＋ to create a new one.';
      customerSearchResults.appendChild(empty);
    }
      customerSearchResults.hidden = false;
    } catch (error) {
      const failed = document.createElement('p');
      failed.className = 'customer-search-empty';
      failed.textContent = error.message;
      customerSearchResults.appendChild(failed);
      customerSearchResults.hidden = false;
    }
  };
  const selectCustomer = (customer) => {
    selectedCustomerId = customer.id;
    selectedCustomerRecord = customer;
    customerSearch.value = customer.displayCaption;
    customerSearchResults.hidden = true;
    customerSelectionHint.textContent = [customer.phone, customer.email].filter(Boolean).join(' · ') || 'Customer selected — contact details can be added later.';
  };
  const clearCustomerSelection = () => {
    selectedCustomerId = null;
    selectedCustomerRecord = null;
    customerSelectionHint.textContent = 'Choose an existing customer or create a new one.';
  };
  customerSearch?.addEventListener('input', () => {
    clearCustomerSelection();
    renderCustomerSearch();
  });
  customerSearch?.addEventListener('focus', renderCustomerSearch);

  const openReservationDialog = ({ date, start, end, unitId, reservation } = {}) => {
    if (!reservationDialog) return;
    editingReservation = reservation || null;
    reservationForm.reset();
    populateUnitOptions(unitId || reservation?.dataset.facility);
    reservationType.value = reservation?.dataset.type || 'customer';
    reservationTitle.value = reservation?.querySelector('b')?.textContent || '';
    const startDate = reservation?.dataset.startDate || reservation?.dataset.date || dateKey(date || selectedDate);
    let endDate = reservation?.dataset.endDate || startDate;
    let startTime = reservation?.dataset.startTime || start || '09:00';
    let endTime = reservation?.dataset.endTime || end || '10:00';
    if (!reservation && end && end < (start || '09:00')) {
      const next = new Date(startDate + 'T00:00:00');
      next.setDate(next.getDate() + 1);
      endDate = dateKey(next);
    }
    reservationStartDate.value = startDate;
    reservationEndDate.value = endDate;
    reservationStart.value = startTime;
    reservationEnd.value = endTime;
    selectedCustomerId = null;
    customerSearch.value = '';
    customerSearchResults.hidden = true;
    const existingName = reservation?.dataset.type === 'customer' ? reservation.querySelector('b')?.textContent : null;
    const existingCustomer = existingName ? customers.find((customer) => customer.name === existingName) : null;
    if (existingCustomer) selectCustomer(existingCustomer);
    else if (existingName) {
      customerSearch.value = existingName;
      clearCustomerSelection();
      customerSelectionHint.textContent = 'This is sample calendar data. Select a customer record before saving.';
    } else clearCustomerSelection();
    reservationDialogTitle.textContent = editingReservation ? 'Edit reservation' : 'New reservation';
    reservationDialogEyebrow.textContent = editingReservation ? 'EDIT RESERVATION' : 'CALENDAR';
    updateTypeHint();
    reservationDialog.showModal();
    (reservationType.value === 'customer' ? customerSearch : reservationTitle).focus();
  };
  const closeReservationDialog = () => {
    if (reservationDialog?.open) reservationDialog.close();
    editingReservation = null;
  };
  document.getElementById('newReservationButton')?.addEventListener('click', () => {
    const chosenUnits = selectedUnitIds();
    if (!chosenUnits.length) {
      window.alert('Select at least one facility in the Facilities filter first.');
      return;
    }
    openReservationDialog({ date: selectedDate, start: '09:00', end: '10:00' });
  });
  document.getElementById('reservationDialogClose')?.addEventListener('click', closeReservationDialog);
  document.getElementById('reservationCancel')?.addEventListener('click', closeReservationDialog);
  reservationType?.addEventListener('change', updateTypeHint);
  // Keep editing locked: Escape and backdrop clicks do not discard the form.
  reservationDialog?.addEventListener('cancel', (event) => event.preventDefault());
  reservationDialog?.addEventListener('click', (event) => {
    if (event.target === reservationDialog) event.preventDefault();
  });

  document.getElementById('newCustomerButton')?.addEventListener('click', () => {
    customerForm.reset();
    customerDialog.showModal();
    customerName.focus();
  });
  const closeCustomerDialog = () => { if (customerDialog.open) customerDialog.close(); };
  document.getElementById('customerDialogClose')?.addEventListener('click', closeCustomerDialog);
  document.getElementById('customerCancel')?.addEventListener('click', closeCustomerDialog);
  customerDialog?.addEventListener('cancel', (event) => event.preventDefault());
  customerDialog?.addEventListener('click', (event) => { if (event.target === customerDialog) event.preventDefault(); });
  customerForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!customerForm.reportValidity()) return;
    const payload = {
      displayCaption: customerName.value,
      phone: customerPhone.value || null,
      email: customerEmail.value || null,
      notes: customerNotes?.value || null
    };
    try {
      const response = await fetch('/api/v1/customers', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Customer could not be created (' + response.status + ').');
      const customer = await response.json();
      closeCustomerDialog();
      selectCustomer(customer);
      customerSearchResults.hidden = true;
      customerSearch.focus();
    } catch (error) {
      customerSelectionHint.textContent = error.message;
    }
  });

  const setReservationData = (element, data) => {
    element.dataset.facility = data.unitId;
    element.dataset.date = data.startDate;
    element.dataset.startDate = data.startDate;
    element.dataset.endDate = data.endDate;
    element.dataset.type = data.type;
    element.dataset.startTime = data.start;
    element.dataset.endTime = data.end;
    element.querySelector('b').textContent = data.title;
    const unitLabel = reservationUnits.find((unit) => unit.id === data.unitId)?.label || data.unitId;
    const dateLabel = data.endDate !== data.startDate ? ' · until ' + data.endDate : '';
    element.querySelector('span').textContent = unitLabel + ' · ' + data.start + '–' + data.end + dateLabel;
    element.classList.remove('customer-block', 'cleaning-block', 'offline-block');
    element.classList.add(data.type + '-block');
    const startParts = data.start.split(':').map(Number);
    const endParts = data.end.split(':').map(Number);
    const startValue = startParts[0] + startParts[1] / 60;
    let endValue = endParts[0] + endParts[1] / 60;
    if (data.endDate !== data.startDate || endValue <= startValue) endValue += 24;
    if (element.classList.contains('mobile-reservation')) {
      element.dataset.start = String(startValue);
      element.dataset.end = String(endValue);
    } else {
      element.dataset.timeRange = data.start + '–' + data.end;
    }
  };
  const makeReservationElement = (data, mobile) => {
    const element = document.createElement('div');
    element.className = (mobile ? 'mobile-reservation ' : 'reservation ') + data.type + '-block';
    element.innerHTML = '<b></b><span></span>';
    setReservationData(element, data);
    element.addEventListener('click', (event) => {
      event.stopPropagation();
      openReservationDialog({ reservation: element });
    });
    return element;
  };
  const getDesktopTrackForDate = (date) => {
    const monday = getMonday(date);
    const dayIndex = Math.round((new Date(date.getFullYear(), date.getMonth(), date.getDate()) - monday) / 86400000);
    return desktopTracks[dayIndex] || null;
  };
  const saveReservation = (data) => {
    if (editingReservation) {
      setReservationData(editingReservation, data);
    } else {
      const desktopTrack = getDesktopTrackForDate(new Date(data.startDate + 'T00:00:00'));
      if (desktopTrack) desktopTrack.appendChild(makeReservationElement(data, false));
      if (mobileTrack && data.startDate === dateKey(selectedDate)) mobileTrack.appendChild(makeReservationElement(data, true));
    }
    renderDate();
    applyFacilitySelection();
    closeReservationDialog();
  };
  reservationForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!reservationForm.reportValidity()) return;
    const isCustomer = reservationType.value === 'customer';
    const data = {
      type: reservationType.value,
      unitId: reservationUnit.value,
      title: isCustomer ? selectedCustomerRecord?.displayCaption : reservationTitle.value.trim(),
      customerId: isCustomer ? selectedCustomerId : null,
      startDate: reservationStartDate.value,
      endDate: reservationEndDate.value,
      start: reservationStart.value,
      end: reservationEnd.value
    };
    if (!data.title || !data.unitId || !data.startDate || !data.endDate || !data.start || !data.end) {
      if (isCustomer && !selectedCustomerId) customerSearch.focus();
      return;
    }
    if (data.endDate < data.startDate || (data.endDate === data.startDate && data.end <= data.start)) {
      window.alert('The end date and time must be later than the start date and time.');
      return;
    }
    saveReservation(data);
  });

  const timeFromTrackClick = (track, event) => {
    const bounds = track.getBoundingClientRect();
    const hour = Math.max(0, Math.min(23.75, (event.clientY - bounds.top) / bounds.height * 24));
    const minutes = Math.round(hour * 4) * 15;
    const startMinutes = Math.min(1425, minutes);
    const endMinutes = startMinutes + 60;
    return { start: toTime(Math.floor(startMinutes / 60), startMinutes % 60), end: toTime(Math.floor(endMinutes / 60), endMinutes % 60) };
  };
  desktopTracks.forEach((track) => track.addEventListener('click', (event) => {
    if (event.target.closest('.reservation')) return;
    const column = track.closest('.day-column');
    const index = [...column.parentElement.querySelectorAll('.day-column')].indexOf(column);
    const date = getMonday(selectedDate);
    date.setDate(date.getDate() + index);
    const times = timeFromTrackClick(track, event);
    const chosenUnits = selectedUnitIds();
    if (!chosenUnits.length) {
      window.alert('Select at least one facility in the Facilities filter first.');
      return;
    }
    openReservationDialog({ date, ...times });
  }));
  mobileTrack?.addEventListener('click', (event) => {
    if (event.target.closest('.mobile-reservation')) return;
    const times = timeFromTrackClick(mobileTrack, event);
    if (!selectedUnitIds().length) {
      window.alert('Select at least one facility in the Facilities filter first.');
      return;
    }
    openReservationDialog({ date: selectedDate, ...times });
  });

  // Center the current-time line once when today's calendar first opens.
  if (calendarFrame && selectedDate.getTime() === new Date().setHours(0, 0, 0, 0)) {
    requestAnimationFrame(() => {
      const marker = window.innerWidth <= 700
        ? currentTimeIndicator
        : document.querySelector('.desktop-current-time');
      if (!marker || marker.hidden) return;
      const markerTop = marker.getBoundingClientRect().top - calendarFrame.getBoundingClientRect().top + calendarFrame.scrollTop;
      calendarFrame.scrollTop = Math.max(0, markerTop - calendarFrame.clientHeight / 2);
    });
  }
})();
