using Microsoft.Extensions.DependencyInjection;
using OLAF.Application.Customers;

namespace OLAF.Infrastructure.Customers;

public static class CustomerServiceCollectionExtensions
{
	public static IServiceCollection AddInMemoryCustomerRepository(this IServiceCollection services)
	{
		services.AddSingleton<ICustomerRepository, InMemoryCustomerRepository>();
		services.AddSingleton(TimeProvider.System);
		services.AddScoped<CustomerService>();
		return services;
	}
}
