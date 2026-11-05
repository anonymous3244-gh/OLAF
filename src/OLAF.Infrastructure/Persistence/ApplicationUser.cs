using Microsoft.AspNetCore.Identity;

namespace OLAF.Infrastructure.Persistence;

public class ApplicationUser : IdentityUser
{
	public bool MustChangePassword { get; set; }
}
