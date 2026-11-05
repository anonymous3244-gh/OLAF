using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace OLAF.Application.Authorization;

public static class ApplicationRoles
{
	public const string Administrator = "Administrator";
	public const string RentalManager = "RentalManager";
	public const string CleaningStaff = "CleaningStaff";

	public static IReadOnlyCollection<string> All { get; } =
		typeof(ApplicationRoles)
			.GetFields(BindingFlags.Public | BindingFlags.Static)
			.Where(field => field.IsLiteral)
			.Select(field => (string)field.GetRawConstantValue()!)
			.ToArray();
}