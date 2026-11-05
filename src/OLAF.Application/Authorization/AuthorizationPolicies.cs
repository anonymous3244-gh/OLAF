namespace OLAF.Application.Authorization;

public static class AuthorizationPolicies
{
	public const string Administrator = "Administrator";
	public const string Manager = "Manager";
	public const string CleaningStaff = "CleaningStaff";
	public const string MustChangePassword = "MustChangePassword";
}
