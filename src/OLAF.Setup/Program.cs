using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using OLAF.Application.Authorization;
using OLAF.Infrastructure.Persistence;
using OLAF.Setup.Exceptions;
using System;
using System.Security.Cryptography;

var builder = Host.CreateApplicationBuilder(args);
builder.Configuration.AddUserSecrets<Program>();

builder.Logging.AddFilter("Microsoft.EntityFrameworkCore", LogLevel.Warning);

var connectionString = builder
	.Configuration
	.GetConnectionString("DefaultConnection")
	?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<ApplicationDbContext>(
	options => options.UseSqlServer(connectionString));

builder.Services
	.AddIdentityCore<ApplicationUser>()
	.AddRoles<IdentityRole>()
	.AddEntityFrameworkStores<ApplicationDbContext>();

using var host = builder.Build();

using var scope = host.Services.CreateScope();

var services = scope.ServiceProvider;
var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();

try
{
	foreach (var role in ApplicationRoles.All)
	{
		if (!await roleManager.RoleExistsAsync(role))
		{
			var result = await roleManager.CreateAsync(new IdentityRole(role));
			if (!result.Succeeded) throw new CreateRoleException(role, result);
		}
	}

	var administrators = await userManager.GetUsersInRoleAsync(ApplicationRoles.Administrator);
	if (administrators.Count > 0)
	{
		Console.WriteLine("An Administrator already exists. No changes were made.");
		return;
	}

	Console.Write("Initial Administrator email: ");
	var email = Console.ReadLine()?.Trim();
	if (string.IsNullOrWhiteSpace(email)) throw new InvalidOperationException("An email address is required.");
	if (await userManager.FindByEmailAsync(email) is not null) throw new NonAdminUserException(email);

	var password = "Aa1!" + Convert.ToBase64String(RandomNumberGenerator.GetBytes(48));
	var administrator = new ApplicationUser
	{
		UserName = email,
		Email = email,
		EmailConfirmed = true,
		MustChangePassword = true,
	};

	var createResult = await userManager.CreateAsync(administrator, password);
	if (!createResult.Succeeded) throw new CreateUserException(administrator.UserName, createResult);

	var roleResult = await userManager.AddToRoleAsync(administrator, ApplicationRoles.Administrator);
	if (!roleResult.Succeeded)
	{
		await userManager.DeleteAsync(administrator);
		throw new AssignRoleException(administrator.UserName, ApplicationRoles.Administrator, roleResult);
	}

	Console.WriteLine();
	Console.WriteLine("Initial Administrator created.");
	Console.WriteLine($"Email: {email}");
	Console.WriteLine($"Temporary password: {password}");
	Console.WriteLine("Store these credentials securely. The password will not be shown again.");
}
catch (Exception exception)
{
	Console.Error.WriteLine($"Setup failed: {exception.Message}");
	Environment.ExitCode = 1;
}
