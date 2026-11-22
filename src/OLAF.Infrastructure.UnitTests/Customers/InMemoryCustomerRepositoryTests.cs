using OLAF.Contracts.Repositories;
using OLAF.Infrastructure.Customers;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace OLAF.Infrastructure.UnitTests.Customers;

public sealed class InMemoryCustomerRepositoryTests
{
	[Fact]
	public async Task AddAsync_GeneratesUniqueIdsForConcurrentCreates()
	{
		var repository = new InMemoryCustomerRepository();
		var creates = Enumerable.Range(0, 100)
			.Select(index => Task.Run(() => repository.AddAsync(new NewCustomer(
				"Customer " + index, null, null, null, "manager", DateTimeOffset.UtcNow))));

		var customers = await Task.WhenAll(creates);

		Assert.Equal(100, customers.Select(customer => customer.Id).Distinct().Count());
		Assert.Equal(100, (await repository.SearchAsync(null, false, TestContext.Current.CancellationToken)).Length);
	}

	[Fact]
	public async Task SearchAsync_UsesMultiWordAndMatchingAcrossFields()
	{
		var repository = new InMemoryCustomerRepository();
		await repository.AddAsync(new NewCustomer("John Smith", "+381 64 123", "john@example.test", null, "manager", DateTimeOffset.UtcNow), TestContext.Current.CancellationToken);
		await repository.AddAsync(new NewCustomer("John Smith", null, "other@example.test", null, "manager", DateTimeOffset.UtcNow), TestContext.Current.CancellationToken);

		var results = await repository.SearchAsync("john 123", false, TestContext.Current.CancellationToken);

		var customer = Assert.Single(results);
		Assert.Equal("+381 64 123", customer.Phone);
	}

	[Fact]
	public async Task UpdateAsync_WithIdenticalValues_DoesNotChangeAuditMetadata()
	{
		var repository = new InMemoryCustomerRepository();
		var createdAt = DateTimeOffset.UtcNow;
		var created = await repository.AddAsync(new NewCustomer("Customer", null, null, null, "manager", createdAt), TestContext.Current.CancellationToken);

		var unchanged = await repository.UpdateAsync(created.Id, new UpdatedCustomer("Customer", null, null, null, "another-manager", createdAt.AddMinutes(1)), TestContext.Current.CancellationToken);

		Assert.Same(created, unchanged);
		Assert.Equal("manager", unchanged!.UpdatedBy);
		Assert.Equal(createdAt, unchanged.UpdatedAt);
	}

	[Fact]
	public async Task SetActiveAsync_ExcludesInactiveByDefaultAndCanIncludeThem()
	{
		var repository = new InMemoryCustomerRepository();
		var created = await repository.AddAsync(new NewCustomer("Customer", null, null, "note", "manager", DateTimeOffset.UtcNow), TestContext.Current.CancellationToken);

		await repository.SetActiveAsync(created.Id, false, "manager", DateTimeOffset.UtcNow, TestContext.Current.CancellationToken);

		Assert.Empty(await repository.SearchAsync(null, false, TestContext.Current.CancellationToken));
		Assert.Single(await repository.SearchAsync(null, true, TestContext.Current.CancellationToken));
	}

	[Fact]
	public async Task UpdateAsync_ReplacesImmutableSnapshotAndPreservesId()
	{
		var repository = new InMemoryCustomerRepository();
		var created = await repository.AddAsync(new NewCustomer("Customer", null, null, null, "manager", DateTimeOffset.UtcNow), TestContext.Current.CancellationToken);

		var updated = await repository.UpdateAsync(created.Id, new UpdatedCustomer("New caption", "phone", null, "updated notes", "manager2", DateTimeOffset.UtcNow), TestContext.Current.CancellationToken);

		Assert.NotNull(updated);
		Assert.Equal(created.Id, updated.Id);
		Assert.Equal("New caption", updated.DisplayCaption);
		Assert.Equal("updated notes", updated.Notes);
		Assert.Equal("Customer", created.DisplayCaption);
	}
}
