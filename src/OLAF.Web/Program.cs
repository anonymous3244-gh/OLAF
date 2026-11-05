using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using OLAF.Application.Authorization;
using OLAF.Infrastructure.Persistence;
using OLAF.Web.Extensions;
using OLAF.Web.Identity;
using System;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var connectionString = builder
	.Configuration
	.GetConnectionString("DefaultConnection")
	?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<ApplicationDbContext>(
	options => options.UseSqlServer(connectionString));

builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services
	.AddDefaultIdentity<ApplicationUser>(options => options.SignIn.RequireConfirmedAccount = false)
	.AddRoles<IdentityRole>()
	.AddEntityFrameworkStores<ApplicationDbContext>();
builder.Services.AddScoped<IUserClaimsPrincipalFactory<ApplicationUser>, ApplicationUserClaimsPrincipalFactory>();

builder.Services.AddRazorPages();

builder.Services.AddAuthorization(options =>
{
	options.DefaultPolicy = new AuthorizationPolicyBuilder()
		.RequireAuthenticatedUser()
		.RequireNoClaim(OlafClaimTypes.MustChangePassword, "true")
		.Build();

	options.FallbackPolicy = options.DefaultPolicy;

	options.AddPolicy(
		AuthorizationPolicies.MustChangePassword,
		policy => policy
			.RequireAuthenticatedUser()
			.RequireClaim(OlafClaimTypes.MustChangePassword, "true"));

	options.AddPolicy(
		AuthorizationPolicies.Administrator,
		policy => policy
			.RequireAuthenticatedUser()
			.RequireRole(ApplicationRoles.Administrator)
			.RequireNoClaim(OlafClaimTypes.MustChangePassword, "true"));

	options.AddPolicy(
		AuthorizationPolicies.Manager,
		policy => policy
			.RequireAuthenticatedUser()
			.RequireRole(ApplicationRoles.Administrator, ApplicationRoles.RentalManager)
			.RequireNoClaim(OlafClaimTypes.MustChangePassword, "true"));

	options.AddPolicy(
		AuthorizationPolicies.CleaningStaff,
		policy => policy
			.RequireAuthenticatedUser()
			.RequireRole(ApplicationRoles.CleaningStaff)
			.RequireNoClaim(OlafClaimTypes.MustChangePassword, "true"));
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
	app.UseMigrationsEndPoint();
}
else
{
	app.UseExceptionHandler("/Error");
	// The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
	app.UseHsts();
}

app.UseHttpsRedirection();

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapStaticAssets()
	.AllowAnonymous();
app.MapRazorPages()
	.WithStaticAssets();

app.Run();
