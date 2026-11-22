using OLAF.Contracts.Entities.Customers;
using OLAF.Contracts.Repositories;
using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace OLAF.Infrastructure.Customers;

public sealed class InMemoryCustomerRepository : ICustomerRepository
{
	private static readonly Customer[] FakeCustomers =
	{
		new(1, "Alex Morgan", "+381 64 111 2233", "alex.morgan@example.test", "", "admin", DateTimeOffset.UtcNow),
		new(2, "Jamie Wilson", "+381 63 222 3344", "jamie.wilson@example.test", "", "admin", DateTimeOffset.UtcNow),
		new(3, "Taylor Reed", "+381 65 333 4455", "taylor.reed@example.test", "", "admin", DateTimeOffset.UtcNow),
		new(4, "Jordan Lee", "+381 64 444 5566", "jordan.lee@example.test", "", "admin", DateTimeOffset.UtcNow),
		new(5, "Sam Parker", "+381 62 555 6677", "sam.parker@example.test", "", "admin", DateTimeOffset.UtcNow),
		new(6, "Casey Smith", "+381 60 666 7788", "casey.smith@example.test", "", "admin", DateTimeOffset.UtcNow),
	};

	private readonly ConcurrentDictionary<int, Customer> _customers = new(FakeCustomers.ToDictionary(x => x.Id, x => x));
	private int _nextId = FakeCustomers.Length;
	private readonly object _syncRoot = new();

	public Task<Customer> AddAsync(NewCustomer newCustomer, CancellationToken ct = default)
	{
		ArgumentNullException.ThrowIfNull(newCustomer);
		ct.ThrowIfCancellationRequested();

		lock (_syncRoot)
		{
			var id = ++_nextId;
			var customer = new Customer(id, newCustomer.DisplayCaption, newCustomer.Phone, newCustomer.Email, newCustomer.Notes, newCustomer.UpdatedBy, newCustomer.UpdatedAt);

			return _customers.TryAdd(id, customer)
				? Task.FromResult(customer)
				: throw new InvalidOperationException("Customer already exists");
		}
	}

	public Task<Customer?> GetByIdAsync(int id, CancellationToken ct = default)
	{
		ct.ThrowIfCancellationRequested();

		_customers.TryGetValue(id, out var customer);
		return Task.FromResult(customer);
	}

	public Task<Customer[]> SearchAsync(string? searchText, bool includeInactive, CancellationToken ct = default)
	{
		ct.ThrowIfCancellationRequested();

		var words = (searchText ?? string.Empty).Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries);
		lock (_syncRoot)
		{
			return Task.FromResult(
				_customers.Values
					.Where(customer => includeInactive || customer.IsActive)
					.Where(customer => words.All(word => Contains(customer.DisplayCaption, word) || Contains(customer.Phone, word) || Contains(customer.Email, word)))
					.OrderBy(customer => customer.DisplayCaption, StringComparer.OrdinalIgnoreCase)
					.ThenBy(customer => customer.Id)
					.ToArray());
		}
	}

	public Task<Customer?> UpdateAsync(int id, UpdatedCustomer input, CancellationToken ct = default)
	{
		ArgumentNullException.ThrowIfNull(input);
		ct.ThrowIfCancellationRequested();

		lock (_syncRoot)
		{
			if (!_customers.TryGetValue(id, out var current)) return Task.FromResult<Customer?>(null);

			var updated = current.Update(input.DisplayCaption, input.Phone, input.Email, input.Notes, input.UpdatedBy, input.UpdatedAt);
			_customers[id] = updated;

			return Task.FromResult<Customer?>(updated);
		}
	}

	public Task<Customer?> SetActiveAsync(int id, bool isActive, string updatedBy, DateTimeOffset updatedAt, CancellationToken ct = default)
	{
		ct.ThrowIfCancellationRequested();

		lock (_syncRoot)
		{
			if (!_customers.TryGetValue(id, out var current)) return Task.FromResult<Customer?>(null);

			var updated = current.SetActive(isActive, updatedBy, updatedAt);
			_customers[id] = updated;
			return Task.FromResult<Customer?>(updated);
		}
	}

	private static bool Contains(string? value, string word) => value?.Contains(word, StringComparison.OrdinalIgnoreCase) == true;
}
