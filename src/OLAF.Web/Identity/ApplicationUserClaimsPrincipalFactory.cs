using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using OLAF.Infrastructure.Persistence;
using System.Security.Claims;
using System.Threading.Tasks;

namespace OLAF.Web.Identity;

public sealed class ApplicationUserClaimsPrincipalFactory(
	UserManager<ApplicationUser> userManager,
	RoleManager<IdentityRole> roleManager,
	IOptions<IdentityOptions> options
) : UserClaimsPrincipalFactory<ApplicationUser, IdentityRole>(userManager, roleManager, options)
{
	protected override async Task<ClaimsIdentity> GenerateClaimsAsync(ApplicationUser user)
	{
		var identity = await base.GenerateClaimsAsync(user);

		if (user.MustChangePassword)
		{
			identity.AddClaim(new Claim(OlafClaimTypes.MustChangePassword, "true"));
		}

		return identity;
	}
}