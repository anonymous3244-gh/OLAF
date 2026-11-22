using System;
using System.Linq;
using System.Threading.Tasks;
using OLAF.Application.Customers;
using OLAF.Infrastructure.Customers;

namespace OLAF.Infrastructure.UnitTests.Customers;

public sealed class InMemoryCustomerRepositoryTests
{
	[Fact]
	public async Task AddAsync_GeneratesUniqueIdsForConcurrentCreates()
	{
		var repository = new InMemoryCustomerRepository();
		var creates = Enumerable.Range(0, 100)
			.Select(index => repository.AddAsync(new NewCustomerRecord(
				"Customer " + index, null, null, null, "manager", DateTimeOffset.UtcNow)));

		var customers = await Task.WhenAll(creates);

		Assert.Equal(100, customers.Select(customer => customer.Id).Distinct().Count());
		Assert.Equal(100, (await repository.SearchAsync(null, false)).Count);
	}

	[Fact]
	public async Task SearchAsync_UsesMultiWordAndMatchingAcrossFields()
	{
		var repository = new InMemoryCustomerRepository();
		await repository.AddAsync(new NewCustomerRecord("John Smith", "+381 64 123", "john@example.test", null, "manager", DateTimeOffset.UtcNow));
		await repository.AddAsync(new NewCustomerRecord("John Smith", null, "other@example.test", null, "manager", DateTimeOffset.UtcNow));

		var results = await repository.SearchAsync("john 123", false);

		var customer = Assert.Single(results);
		Assert.Equal("+381 64 123", customer.Phone);
	}

	[Fact]
	public async Task SetActiveAsync_ExcludesInactiveByDefaultAndCanIncludeThem()
	{
		var repository = new InMemoryCustomerRepository();
		var created = await repository.AddAsync(new NewCustomerRecord("Customer", null, null, "note", "manager", DateTimeOffset.UtcNow));

		await repository.SetActiveAsync(created.Id, false, "manager", DateTimeOffset.UtcNow);

		Assert.Empty(await repository.SearchAsync(null, false));
		Assert.Single(await repository.SearchAsync(null, true));
	}

	[Fact]
	public async Task UpdateAsync_ReplacesImmutableSnapshotAndPreservesId()
	{
		var repository = new InMemoryCustomerRepository();
		var created = await repository.AddAsync(new NewCustomerRecord("Customer", null, null, null, "manager", DateTimeOffset.UtcNow));

		var updated = await repository.UpdateAsync(created.Id, new CustomerUpdateRecord("New caption", "phone", null, "updated notes", "manager2", DateTimeOffset.UtcNow));

		Assert.NotNull(updated);
		Assert.Equal(created.Id, updated.Id);
		Assert.Equal("New caption", updated.DisplayCaption);
		Assert.Equal("updated notes", updated.Notes);
		Assert.Equal("Customer", created.DisplayCaption);
	}
}
