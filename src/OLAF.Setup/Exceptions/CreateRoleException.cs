using Microsoft.AspNetCore.Identity;
using System;

namespace OLAF.Setup.Exceptions;

public class CreateRoleException(string role, IdentityResult result)
	: InvalidOperationException($"Could not create role '{role}': {string.Join("; ", result.Errors)}");

public class NonAdminUserException(string email)
	: InvalidOperationException($"An account '{email}'  already exists but is not an Administrator.");

public class CreateUserException(string username, IdentityResult result)
	: InvalidOperationException($"Could not create user '{username}': {string.Join("; ", result.Errors)}");

public class AssignRoleException(string username, string role, IdentityResult result)
	: InvalidOperationException($"Could not assign role '{role}' to user '{username}: {string.Join("; ", result.Errors)}");
