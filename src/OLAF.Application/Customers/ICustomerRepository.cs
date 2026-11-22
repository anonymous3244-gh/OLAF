using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using OLAF.Domain.Customers;

namespace OLAF.Application.Customers;

public interface ICustomerRepository
{
	Task<Customer> AddAsync(NewCustomerRecord customer, CancellationToken cancellationToken = default);
	Task<Customer?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
	Task<IReadOnlyList<Customer>> SearchAsync(string? searchText, bool includeInactive, CancellationToken cancellationToken = default);
	Task<Customer?> UpdateAsync(int id, CustomerUpdateRecord customer, CancellationToken cancellationToken = default);
	Task<Customer?> SetActiveAsync(int id, bool isActive, string updatedBy, System.DateTimeOffset updatedAt, CancellationToken cancellationToken = default);
}
