(() => {
	const api = '/api/v1/customers';
	const list = document.getElementById('customersList');
	const search = document.getElementById('customersSearch');
	const includeInactive = document.getElementById('includeInactive');
	const status = document.getElementById('customersStatus');
	const dialog = document.getElementById('customerManagementDialog');
	const form = document.getElementById('customerManagementForm');
	const caption = document.getElementById('managedCustomerCaption');
	const phone = document.getElementById('managedCustomerPhone');
	const email = document.getElementById('managedCustomerEmail');
	const notes = document.getElementById('managedCustomerNotes');
	const title = document.getElementById('customerManagementTitle');
	let editingId = null;
	let customers = [];

	const request = async (url, options = {}) => {
		const response = await fetch(url, { credentials: 'same-origin', ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
		if (response.status === 401 || response.status === 403) throw new Error('You are not authorized to perform this action. Please sign in again if your session expired.');
		if (!response.ok) {
			const body = await response.json().catch(() => null);
			throw new Error(body?.title || body?.detail || ('Request failed (' + response.status + ').'));
		}
		return response.status === 204 ? null : response.json();
	};

	const render = items => {
		list.replaceChildren();
		if (!items.length) {
			const empty = document.createElement('p');
			empty.className = 'customers-empty';
			empty.textContent = 'No customers found.';
			list.append(empty);
			return;
		}
		items.forEach(customer => {
			const article = document.createElement('article');
			article.className = 'customer-card';
			const main = document.createElement('div');
			main.className = 'customer-card-main';
			const heading = document.createElement('div');
			heading.className = 'customer-card-heading';
			const name = document.createElement('h3');
			name.textContent = customer.displayCaption;
			const state = document.createElement('span');
			state.className = 'customer-state ' + (customer.isActive ? 'active' : 'inactive');
			state.textContent = customer.isActive ? 'Active' : 'Inactive';
			heading.append(name, state);
			const contact = document.createElement('p');
			contact.className = 'customer-contact';
			contact.textContent = [customer.phone, customer.email].filter(Boolean).join(' · ');
			main.append(heading, contact);
			if (customer.notes) {
				const note = document.createElement('p');
				note.className = 'customer-notes';
				note.textContent = customer.notes;
				main.append(note);
			}
			const actions = document.createElement('div');
			actions.className = 'customer-card-actions';
			const edit = document.createElement('button');
			edit.type = 'button'; edit.className = 'secondary-button'; edit.textContent = 'Edit';
			edit.addEventListener('click', () => openEditor(customer));
			const toggle = document.createElement('button');
			toggle.type = 'button'; toggle.className = 'secondary-button';
			toggle.textContent = customer.isActive ? 'Deactivate' : 'Activate';
			toggle.addEventListener('click', () => changeActivation(customer));
			actions.append(edit, toggle);
			article.append(main, actions);
			list.append(article);
		});
	};

	const load = async () => {
		status.textContent = 'Loading…';
		try {
			const params = new URLSearchParams();
			if (search.value.trim()) params.set('s', search.value.trim());
			if (includeInactive.checked) params.set('includeInactive', 'true');
			const result = await request(api + '?' + params.toString());
			customers = result.customers;
			render(customers);
			status.textContent = customers.length + ' customer' + (customers.length === 1 ? '' : 's');
		} catch (error) { status.textContent = error.message; }
	};

	const openEditor = customer => {
		editingId = customer?.id ?? null;
		title.textContent = editingId ? 'Edit customer' : 'New customer';
		caption.value = customer?.displayCaption ?? '';
		phone.value = customer?.phone ?? '';
		email.value = customer?.email ?? '';
		notes.value = customer?.notes ?? '';
		dialog.showModal();
		caption.focus();
	};
	const closeEditor = () => { if (dialog.open) dialog.close(); };
	document.getElementById('createCustomerButton').addEventListener('click', () => openEditor(null));
	document.getElementById('customerManagementClose').addEventListener('click', closeEditor);
	document.getElementById('customerManagementCancel').addEventListener('click', closeEditor);
	dialog.addEventListener('cancel', event => event.preventDefault());
	dialog.addEventListener('click', event => { if (event.target === dialog) event.preventDefault(); });

	form.addEventListener('submit', async event => {
		event.preventDefault();
		if (!form.reportValidity()) return;
		const payload = { displayCaption: caption.value, phone: phone.value || null, email: email.value || null, notes: notes.value || null };
		try {
			await request(editingId ? api + '/' + editingId : api, { method: editingId ? 'PUT' : 'POST', body: JSON.stringify(payload) });
			closeEditor();
			await load();
		} catch (error) { status.textContent = error.message; }
	});
	const changeActivation = async customer => {
		try {
			await request(api + '/' + customer.id + '/activation', { method: 'PUT', body: JSON.stringify({ isActive: !customer.isActive }) });
			await load();
		} catch (error) { status.textContent = error.message; }
	};
	let searchTimer;
	search.addEventListener('input', () => { window.clearTimeout(searchTimer); searchTimer = window.setTimeout(load, 250); });
	includeInactive.addEventListener('change', load);
	list.addEventListener('click', async event => {
		const button = event.target.closest('.edit-customer, .toggle-customer');
		if (!button) return;
		const customer = customers.find(item => item.id === Number(button.dataset.id));
		if (!customer) return;
		if (button.classList.contains('edit-customer')) openEditor(customer);
		else await changeActivation(customer);
	});
	load();
})();
