using OLAF.Contracts.Entities.Customers;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace OLAF.Contracts.Repositories;

public interface ICustomerRepository
{
	Task<Customer> AddAsync(NewCustomer newCustomer, CancellationToken ct = default);
	Task<Customer?> GetByIdAsync(int id, CancellationToken ct = default);
	Task<Customer[]> SearchAsync(string? searchText, bool includeInactive, CancellationToken ct = default);
	Task<Customer?> UpdateAsync(int id, UpdatedCustomer updatedCustomer, CancellationToken ct = default);
	Task<Customer?> SetActiveAsync(int id, bool isActive, string updatedBy, DateTimeOffset updatedAt, CancellationToken ct = default);
}

public sealed record NewCustomer(string DisplayCaption, string? Phone, string? Email, string? Notes, string UpdatedBy, DateTimeOffset UpdatedAt);
public sealed record UpdatedCustomer(string DisplayCaption, string? Phone, string? Email, string? Notes, string UpdatedBy, DateTimeOffset UpdatedAt);
