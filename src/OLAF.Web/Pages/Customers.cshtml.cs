using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.RazorPages;
using OLAF.Application.Authorization;
using OLAF.Application.Customers;
using OLAF.Domain.Customers;

namespace OLAF.Web.Pages;

[Authorize(Policy = AuthorizationPolicies.Manager)]
public sealed class CustomersModel : PageModel
{
	private readonly CustomerService customers;

	public CustomersModel(CustomerService customers) { this.customers = customers; }

	public IReadOnlyList<Customer> Customers { get; private set; } = [];

	public async Task OnGetAsync()
	{
		Customers = await customers.SearchAsync(null, false, HttpContext.RequestAborted);
	}
}
