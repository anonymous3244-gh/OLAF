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
  const currentTimeIndicator = document.getElementById('currentTimeIndicator');
  const currentTimeLabel = document.getElementById('currentTimeLabel');
  const mobileReservationCount = document.getElementById('mobileReservationCount');
  const formatDate = (date, options) => new Intl.DateTimeFormat('en', options).format(date);
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
    });

    if (mobileDate) mobileDate.textContent = formatDate(selectedDate, { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
    if (mobileDayName) mobileDayName.textContent = formatDate(selectedDate, { weekday: 'long' }).toUpperCase();
    if (mobileTrack) {
      const reservations = mobileTrack.querySelectorAll('.mobile-reservation');
      if (mobileReservationCount) mobileReservationCount.textContent = reservations.length + ' reservations';
      reservations.forEach((reservation) => {
        const startHour = Number(reservation.dataset.start);
        const endHour = Number(reservation.dataset.end);
        reservation.style.top = ((startHour - 6) / 17 * 100) + '%';
        reservation.style.height = ((endHour - startHour) / 17 * 100) + '%';
      });

      const now = new Date();
      const isToday = selectedDate.getTime() === new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const currentHour = now.getHours() + now.getMinutes() / 60;
      const showCurrentTime = isToday && currentHour >= 6 && currentHour <= 23;
      if (currentTimeIndicator) {
        currentTimeIndicator.hidden = !showCurrentTime;
        if (showCurrentTime) currentTimeIndicator.style.top = ((currentHour - 6) / 17 * 100) + '%';
      }
      if (currentTimeLabel && showCurrentTime) {
        currentTimeLabel.textContent = formatDate(now, { hour: '2-digit', minute: '2-digit', hour12: false });
      }
    }
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
})();
