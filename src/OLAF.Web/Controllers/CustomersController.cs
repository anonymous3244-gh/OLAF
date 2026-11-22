using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OLAF.Application.Authorization;
using OLAF.Application.Customers;
using OLAF.Domain.Customers;
using OLAF.Web.Htmx;

namespace OLAF.Web.Controllers;

[ApiController]
[Authorize(Policy = AuthorizationPolicies.Manager)]
[Route("api/v1/customers")]
public sealed class CustomersController : Controller
{
	private readonly CustomerService customers;

	public CustomersController(CustomerService customers)
	{
		this.customers = customers;
	}

	[HttpGet]
	[CanReturnHtmx]
	public async Task<ActionResult<CustomerSearchResponse>> Search(
		[FromQuery(Name = "s")] string? searchText,
		[FromQuery] bool includeInactive = false,
		CancellationToken cancellationToken = default)
	{
		var result = await customers.SearchAsync(searchText, includeInactive, cancellationToken);
		return new CustomerSearchResponse(result.Select(CustomerDto.From).ToArray());
	}

	[HttpGet("{id:int}")]
	[CanReturnHtmx]
	public async Task<ActionResult<CustomerDto>> Get(int id, CancellationToken cancellationToken = default)
	{
		var customer = await customers.GetByIdAsync(id, cancellationToken);
		if (customer is null) return NotFound();
		return CustomerDto.From(customer);
	}

	[HttpPost]
	public async Task<ActionResult<CustomerDto>> Create(
		[FromBody] CustomerWriteRequest request,
		CancellationToken cancellationToken = default)
	{
		if (string.IsNullOrWhiteSpace(request.DisplayCaption))
		{
			ModelState.AddModelError(nameof(request.DisplayCaption), "A customer display caption is required.");
			return ValidationProblem(ModelState);
		}

		var customer = await customers.CreateAsync(
			new CreateCustomerInput(request.DisplayCaption, request.Phone, request.Email, request.Notes),
			CurrentUser(),
			cancellationToken);
		var dto = CustomerDto.From(customer);
		return CreatedAtAction(nameof(Get), new { id = customer.Id }, dto);
	}

	[HttpPut("{id:int}")]
	public async Task<ActionResult<CustomerDto>> Update(
		int id,
		[FromBody] CustomerWriteRequest request,
		CancellationToken cancellationToken = default)
	{
		if (string.IsNullOrWhiteSpace(request.DisplayCaption))
		{
			ModelState.AddModelError(nameof(request.DisplayCaption), "A customer display caption is required.");
			return ValidationProblem(ModelState);
		}

		var customer = await customers.UpdateAsync(
			id,
			new UpdateCustomerInput(request.DisplayCaption, request.Phone, request.Email, request.Notes),
			CurrentUser(),
			cancellationToken);
		if (customer is null) return NotFound();
		return CustomerDto.From(customer);
	}

	[HttpPut("{id:int}/activation")]
	public async Task<ActionResult<CustomerDto>> SetActivation(
		int id,
		[FromBody] CustomerActivationRequest request,
		CancellationToken cancellationToken = default)
	{
		var customer = await customers.SetActiveAsync(id, request.IsActive, CurrentUser(), cancellationToken);
		if (customer is null) return NotFound();
		return CustomerDto.From(customer);
	}

	private string CurrentUser()
		=> User.FindFirstValue(ClaimTypes.NameIdentifier)
			?? throw new System.InvalidOperationException("The authenticated user identifier is missing.");
}

public sealed record CustomerWriteRequest(string DisplayCaption, string? Phone, string? Email, string? Notes);
public sealed record CustomerActivationRequest(bool IsActive);
public sealed record CustomerSearchResponse(CustomerDto[] Customers);
public sealed record CustomerDto(int Id, string DisplayCaption, string? Phone, string? Email, string? Notes, bool IsActive, string UpdatedBy, System.DateTimeOffset UpdatedAt)
{
	public static CustomerDto From(Customer customer)
		=> new(customer.Id, customer.DisplayCaption, customer.Phone, customer.Email, customer.Notes, customer.IsActive, customer.UpdatedBy, customer.UpdatedAt);
}
