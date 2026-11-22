using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OLAF.Contracts.Authorization;
using OLAF.Application.Customers;
using OLAF.Web.Htmx;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;

namespace OLAF.Web.Controllers;

[ApiController]
[Authorize(Policy = AuthorizationPolicies.Manager)]
[Route("api/v1/customers")]
public sealed class CustomersController(CustomerService customers) : Controller
{
	[HttpGet]
	[CanReturnHtmx]
	public async Task<ActionResult<CustomerSearchResponse>> Search(
		[FromQuery(Name = "s")] string? searchText,
		[FromQuery] bool includeInactive = false,
		CancellationToken ct = default)
	{
		var result = await customers.SearchAsync(searchText, includeInactive, ct);

		return new CustomerSearchResponse(result.Select(Customer.From).ToArray());
	}

	[HttpGet("{id:int}")]
	[CanReturnHtmx]
	public async Task<ActionResult<Customer>> Get(int id, CancellationToken ct = default)
	{
		var customer = await customers.GetByIdAsync(id, ct);

		return customer is null
			? NotFound()
			: Customer.From(customer);
	}

	[HttpPost]
	public async Task<ActionResult<Customer>> Create([FromBody] CustomerCreateRequest request, CancellationToken ct = default)
	{
		if (string.IsNullOrWhiteSpace(request.DisplayCaption))
		{
			ModelState.AddModelError(nameof(request.DisplayCaption), "A customer display caption is required.");
			return ValidationProblem(ModelState);
		}

		var customer = await customers.CreateAsync(
			new CreateCustomerInput(request.DisplayCaption, request.Phone, request.Email, request.Notes),
			CurrentUser(),
			ct);

		return CreatedAtAction(nameof(Get), new { id = customer.Id }, Customer.From(customer));
	}

	[HttpPut("{id:int}")]
	public async Task<ActionResult<Customer>> Update(int id, [FromBody] CustomerUpdateRequest request, CancellationToken ct = default)
	{
		if (string.IsNullOrWhiteSpace(request.DisplayCaption))
		{
			ModelState.AddModelError(nameof(request.DisplayCaption), "A customer display caption is required.");
			return ValidationProblem(ModelState);
		}

		var customer = await customers.UpdateAsync(id, new UpdateCustomerInput(request.DisplayCaption, request.Phone, request.Email, request.Notes), CurrentUser(), ct);

		return customer is null
			? NotFound()
			: Customer.From(customer);
	}

	[HttpPut("{id:int}/activation")]
	public async Task<ActionResult<Customer>> SetActivation(int id, [FromBody] CustomerActivationRequest request, CancellationToken ct = default)
	{
		if (request.IsActive is null)
		{
			ModelState.AddModelError(nameof(request.IsActive), "The desired active state must be supplied.");
			return ValidationProblem(ModelState);
		}

		var customer = await customers.SetActiveAsync(id, request.IsActive.Value, CurrentUser(), ct);

		return customer is null
			? NotFound()
			: Customer.From(customer);
	}

	private string CurrentUser() => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new System.InvalidOperationException("The authenticated user identifier is missing.");
}

public sealed record CustomerCreateRequest(string DisplayCaption, string? Phone, string? Email, string? Notes);
public sealed record CustomerUpdateRequest(string DisplayCaption, string? Phone, string? Email, string? Notes);
public sealed record CustomerActivationRequest(bool? IsActive);

public sealed record CustomerSearchResponse(Customer[] Customers);

public sealed record Customer(int Id, string DisplayCaption, string? Phone, string? Email, string? Notes, bool IsActive, string UpdatedBy, System.DateTimeOffset UpdatedAt)
{
	public static Customer From(Contracts.Entities.Customers.Customer customer) => new(customer.Id, customer.DisplayCaption, customer.Phone, customer.Email, customer.Notes, customer.IsActive, customer.UpdatedBy, customer.UpdatedAt);
}
