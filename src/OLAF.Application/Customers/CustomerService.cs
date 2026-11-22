using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using OLAF.Domain.Customers;

namespace OLAF.Application.Customers;

public sealed class CustomerService
{
	private readonly ICustomerRepository repository;
	private readonly TimeProvider timeProvider;

	public CustomerService(ICustomerRepository repository, TimeProvider timeProvider)
	{
		this.repository = repository ?? throw new ArgumentNullException(nameof(repository));
		this.timeProvider = timeProvider ?? throw new ArgumentNullException(nameof(timeProvider));
	}

	public Task<IReadOnlyList<Customer>> SearchAsync(string? searchText, bool includeInactive, CancellationToken cancellationToken = default)
		=> repository.SearchAsync(searchText, includeInactive, cancellationToken);

	public Task<Customer?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
		=> repository.GetByIdAsync(id, cancellationToken);

	public Task<Customer> CreateAsync(CreateCustomerInput input, string updatedBy, CancellationToken cancellationToken = default)
	{
		ArgumentNullException.ThrowIfNull(input);
		return repository.AddAsync(new NewCustomerRecord(input.DisplayCaption, input.Phone, input.Email, input.Notes, updatedBy, timeProvider.GetUtcNow()), cancellationToken);
	}

	public Task<Customer?> UpdateAsync(int id, UpdateCustomerInput input, string updatedBy, CancellationToken cancellationToken = default)
	{
		ArgumentNullException.ThrowIfNull(input);
		return repository.UpdateAsync(id, new CustomerUpdateRecord(input.DisplayCaption, input.Phone, input.Email, input.Notes, updatedBy, timeProvider.GetUtcNow()), cancellationToken);
	}

	public Task<Customer?> SetActiveAsync(int id, bool isActive, string updatedBy, CancellationToken cancellationToken = default)
		=> repository.SetActiveAsync(id, isActive, updatedBy, timeProvider.GetUtcNow(), cancellationToken);
}

public sealed record CreateCustomerInput(string DisplayCaption, string? Phone, string? Email, string? Notes);
public sealed record UpdateCustomerInput(string DisplayCaption, string? Phone, string? Email, string? Notes);
