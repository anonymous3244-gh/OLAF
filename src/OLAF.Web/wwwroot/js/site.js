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
  const mobileDate = document.querySelector('.mobile-day-heading strong');
  const formatDate = (date, options) => new Intl.DateTimeFormat('en', options).format(date);
  const start = new Date(2026, 5, 15);
  const renderDate = () => {
    if (dateRange) {
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      dateRange.textContent = formatDate(start, { month: 'short', day: 'numeric' }) + ' – ' + formatDate(end, { day: 'numeric', year: 'numeric' });
    }
    if (mobileDate) mobileDate.textContent = formatDate(start, { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
  };
  document.getElementById('previousDay')?.addEventListener('click', () => { start.setDate(start.getDate() - (window.innerWidth <= 700 ? 1 : 7)); renderDate(); });
  document.getElementById('nextDay')?.addEventListener('click', () => { start.setDate(start.getDate() + (window.innerWidth <= 700 ? 1 : 7)); renderDate(); });
  document.getElementById('todayButton')?.addEventListener('click', () => { const now = new Date(); start.setFullYear(now.getFullYear(), now.getMonth(), now.getDate()); renderDate(); });
  renderDate();
})();
