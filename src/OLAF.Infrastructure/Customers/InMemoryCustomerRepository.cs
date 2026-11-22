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

	public Task<Customer?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
	{
		cancellationToken.ThrowIfCancellationRequested();

		lock (syncRoot)
		{
			customers.TryGetValue(id, out var customer);
			return Task.FromResult(customer);
		}
	}

	public Task<IReadOnlyList<Customer>> SearchAsync(
		string? searchText,
		bool includeInactive,
		CancellationToken cancellationToken = default)
	{
		cancellationToken.ThrowIfCancellationRequested();

		var words = (searchText ?? string.Empty)
			.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries);

		lock (syncRoot)
		{
			IReadOnlyList<Customer> results = customers.Values
				.Where(customer => includeInactive || customer.IsActive)
				.Where(customer => words.All(word =>
					Contains(customer.DisplayCaption, word)
					|| Contains(customer.Phone, word)
					|| Contains(customer.Email, word)))
				.OrderBy(customer => customer.DisplayCaption, StringComparer.OrdinalIgnoreCase)
				.ThenBy(customer => customer.Id)
				.ToArray();

			return Task.FromResult(results);
		}
	}

	public Task AddAsync(Customer customer, CancellationToken cancellationToken = default)
	{
		ArgumentNullException.ThrowIfNull(customer);
		cancellationToken.ThrowIfCancellationRequested();

		lock (syncRoot)
		{
			if (!customers.TryAdd(customer.Id, customer))
			{
				throw new InvalidOperationException($"A customer with ID {customer.Id} already exists.");
			}

			nextId = Math.Max(nextId, customer.Id + 1);
		}

		return Task.CompletedTask;
	}

	public int GetNextId()
	{
		lock (syncRoot)
		{
			return nextId++;
		}
	}

	private static bool Contains(string? value, string word)
	{
		return value?.Contains(word, StringComparison.OrdinalIgnoreCase) == true;
	}
}
