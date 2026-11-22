using OLAF.Contracts.Entities.Customers;
using OLAF.Contracts.Repositories;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace OLAF.Application.Customers;

public sealed class CustomerService(ICustomerRepository repository, TimeProvider timeProvider)
{
	private readonly ICustomerRepository _repository = repository ?? throw new ArgumentNullException(nameof(repository));
	private readonly TimeProvider _timeProvider = timeProvider ?? throw new ArgumentNullException(nameof(timeProvider));

	public Task<Customer[]> SearchAsync(string? searchText, bool includeInactive, CancellationToken ct = default)
		=> _repository.SearchAsync(searchText, includeInactive, ct);

	public Task<Customer?> GetByIdAsync(int id, CancellationToken ct = default)
		=> _repository.GetByIdAsync(id, ct);

	public Task<Customer> CreateAsync(CreateCustomerInput input, string updatedBy, CancellationToken ct = default)
	{
		ArgumentNullException.ThrowIfNull(input);
		return _repository.AddAsync(new NewCustomer(input.DisplayCaption, input.Phone, input.Email, input.Notes, updatedBy, _timeProvider.GetUtcNow()), ct);
	}

	public Task<Customer?> UpdateAsync(int id, UpdateCustomerInput input, string updatedBy, CancellationToken ct = default)
	{
		ArgumentNullException.ThrowIfNull(input);
		return _repository.UpdateAsync(id, new UpdatedCustomer(input.DisplayCaption, input.Phone, input.Email, input.Notes, updatedBy, _timeProvider.GetUtcNow()), ct);
	}

	public Task<Customer?> SetActiveAsync(int id, bool isActive, string updatedBy, CancellationToken ct = default)
		=> _repository.SetActiveAsync(id, isActive, updatedBy, _timeProvider.GetUtcNow(), ct);
}

public sealed record CreateCustomerInput(string DisplayCaption, string? Phone, string? Email, string? Notes);
public sealed record UpdateCustomerInput(string DisplayCaption, string? Phone, string? Email, string? Notes);
