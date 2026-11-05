using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OLAF.Application.Authorization;
using OLAF.Infrastructure.Persistence;
using OLAF.Web.Identity;
using System;
using System.Threading.Tasks;

namespace OLAF.Web.Extensions;

public static class ServiceCollectionExtensions
{
	public static IServiceCollection ConfigureServices(this IServiceCollection services, IConfigurationRoot configuration)
	{
		var connectionString = configuration
			.GetConnectionString("DefaultConnection")
			?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

		services.AddDbContext<ApplicationDbContext>(options => options.UseSqlServer(connectionString));

		services.AddDatabaseDeveloperPageExceptionFilter();

		services
			.AddDefaultIdentity<ApplicationUser>(options => options.SignIn.RequireConfirmedAccount = false)
			.AddRoles<IdentityRole>()
			.AddEntityFrameworkStores<ApplicationDbContext>();

		services.AddScoped<IUserClaimsPrincipalFactory<ApplicationUser>, ApplicationUserClaimsPrincipalFactory>();

		services.ConfigureApplicationCookie(options =>
		{
			options.Events.OnRedirectToAccessDenied = context =>
			{
				var redirectUri = context.HttpContext.User.HasClaim(OlafClaimTypes.MustChangePassword, "true")
					? "/Identity/Account/ChangePassword"
					: context.RedirectUri;

				context.Response.Redirect(redirectUri);
				return Task.CompletedTask;
			};
		});

		services.AddRazorPages();

		services.AddAuthorization(options =>
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

		return services;
	}
}
