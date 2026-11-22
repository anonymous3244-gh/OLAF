using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using OLAF.Application.Customers;
using OLAF.Domain.Customers;

namespace OLAF.Infrastructure.Customers;

public sealed class InMemoryCustomerRepository : ICustomerRepository
{
	private readonly object syncRoot = new();
	private readonly Dictionary<int, Customer> customers = new();
	private int nextId = 1;

	public Task<Customer> AddAsync(NewCustomerRecord input, CancellationToken cancellationToken = default)
	{
		ArgumentNullException.ThrowIfNull(input);
		cancellationToken.ThrowIfCancellationRequested();
		lock (syncRoot)
		{
			var id = nextId++;
			var customer = Customer.Create(id, input.DisplayCaption, input.Phone, input.Email, input.Notes, input.UpdatedBy, input.UpdatedAt);
			customers.Add(id, customer);
			return Task.FromResult(customer);
		}
	}

	public Task<Customer?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
	{
		cancellationToken.ThrowIfCancellationRequested();
		lock (syncRoot)
		{
			customers.TryGetValue(id, out var customer);
			return Task.FromResult(customer);
		}
	}

	public Task<IReadOnlyList<Customer>> SearchAsync(string? searchText, bool includeInactive, CancellationToken cancellationToken = default)
	{
		cancellationToken.ThrowIfCancellationRequested();
		var words = (searchText ?? string.Empty).Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries);
		lock (syncRoot)
		{
			IReadOnlyList<Customer> results = customers.Values
				.Where(customer => includeInactive || customer.IsActive)
				.Where(customer => words.All(word => Contains(customer.DisplayCaption, word) || Contains(customer.Phone, word) || Contains(customer.Email, word)))
				.OrderBy(customer => customer.DisplayCaption, StringComparer.OrdinalIgnoreCase)
				.ThenBy(customer => customer.Id)
				.ToArray();
			return Task.FromResult(results);
		}
	}

	public Task<Customer?> UpdateAsync(int id, CustomerUpdateRecord input, CancellationToken cancellationToken = default)
	{
		ArgumentNullException.ThrowIfNull(input);
		cancellationToken.ThrowIfCancellationRequested();
		lock (syncRoot)
		{
			if (!customers.TryGetValue(id, out var current)) return Task.FromResult<Customer?>(null);
			var updated = current.Update(input.DisplayCaption, input.Phone, input.Email, input.Notes, input.UpdatedBy, input.UpdatedAt);
			customers[id] = updated;
			return Task.FromResult<Customer?>(updated);
		}
	}

	public Task<Customer?> SetActiveAsync(int id, bool isActive, string updatedBy, DateTimeOffset updatedAt, CancellationToken cancellationToken = default)
	{
		cancellationToken.ThrowIfCancellationRequested();
		lock (syncRoot)
		{
			if (!customers.TryGetValue(id, out var current)) return Task.FromResult<Customer?>(null);
			var updated = current.SetActive(isActive, updatedBy, updatedAt);
			customers[id] = updated;
			return Task.FromResult<Customer?>(updated);
		}
	}

	private static bool Contains(string? value, string word)
		=> value?.Contains(word, StringComparison.OrdinalIgnoreCase) == true;
}
