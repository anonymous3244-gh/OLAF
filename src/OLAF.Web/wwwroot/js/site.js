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
