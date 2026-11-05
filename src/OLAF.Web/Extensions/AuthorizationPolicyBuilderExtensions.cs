using Microsoft.AspNetCore.Authorization;

namespace OLAF.Web.Extensions
{
	public static class AuthorizationPolicyBuilderExtensions
	{
		public static AuthorizationPolicyBuilder RequireNoClaim(this AuthorizationPolicyBuilder source, string type, string value)
			=> source.RequireAssertion(context => !context.User.HasClaim(type, value));
	}
}
