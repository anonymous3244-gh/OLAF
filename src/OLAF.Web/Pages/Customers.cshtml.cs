using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.RazorPages;
using OLAF.Application.Customers;
using OLAF.Contracts.Authorization;
using OLAF.Contracts.Entities.Customers;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OLAF.Web.Pages;

[Authorize(Policy = AuthorizationPolicies.Manager)]
public sealed class CustomersModel(CustomerService customers) : PageModel
{
	public IReadOnlyList<Customer> Customers { get; private set; } = [];

	public async Task OnGetAsync()
	{
		Customers = await customers.SearchAsync(null, false, HttpContext.RequestAborted);
	}
}
