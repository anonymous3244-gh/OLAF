using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using OLAF.Application.Authorization;
using OLAF.Infrastructure.Persistence;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace OLAF.Web.Areas.Identity.Pages.Account;

[Authorize(Policy = AuthorizationPolicies.MustChangePassword)]
public class ChangePasswordModel(
	UserManager<ApplicationUser> userManager,
	SignInManager<ApplicationUser> signInManager) : PageModel
{
	[BindProperty]
	public InputModel Input { get; set; } = new();

	public class InputModel
	{
		[Required]
		[DataType(DataType.Password)]
		public string CurrentPassword { get; set; } = string.Empty;

		[Required]
		[StringLength(100, MinimumLength = 12)]
		[DataType(DataType.Password)]
		[Display(Name = "New password")]
		public string NewPassword { get; set; } = string.Empty;

		[Required]
		[DataType(DataType.Password)]
		[Compare(nameof(NewPassword))]
		[Display(Name = "Confirm new password")]
		public string ConfirmPassword { get; set; } = string.Empty;
	}

	public void OnGet()
	{
	}

	public async Task<IActionResult> OnPostAsync()
	{
		if (!ModelState.IsValid) return Page();

		var user = await userManager.GetUserAsync(User);
		if (user is null) return NotFound();

		var result = await userManager.ChangePasswordAsync(user, Input.CurrentPassword, Input.NewPassword);
		if (!result.Succeeded) return PageWithErrors(result.Errors.Select(x => x.Description));

		user.MustChangePassword = false;

		result = await userManager.UpdateAsync(user);
		if (!result.Succeeded) return PageWithErrors(result.Errors.Select(x => x.Description));

		await signInManager.RefreshSignInAsync(user);

		return RedirectToPage("/Index");
	}

	private PageResult PageWithErrors(IEnumerable<string> errors)
	{
		foreach (var error in errors)
		{
			ModelState.AddModelError(string.Empty, error);
		}

		return Page();
	}
}