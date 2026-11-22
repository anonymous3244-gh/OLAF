using Microsoft.Extensions.DependencyInjection;
using OLAF.Contracts.Repositories;
using OLAF.Infrastructure.Customers;

namespace OLAF.Web.Extensions;

public static class CustomerServiceCollectionExtensions
{
	public static IServiceCollection AddInMemoryCustomerRepository(this IServiceCollection services)
	{
		services.AddSingleton<ICustomerRepository, InMemoryCustomerRepository>();
		return services;
	}
}
