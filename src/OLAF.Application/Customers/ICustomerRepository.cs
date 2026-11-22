using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using OLAF.Domain.Customers;

namespace OLAF.Application.Customers;

public interface ICustomerRepository
{
	Task<Customer?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

	Task<IReadOnlyList<Customer>> SearchAsync(
		string? searchText,
		bool includeInactive,
		CancellationToken cancellationToken = default);

	Task AddAsync(Customer customer, CancellationToken cancellationToken = default);
}
