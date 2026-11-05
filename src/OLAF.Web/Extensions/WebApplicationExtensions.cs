using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;

namespace OLAF.Web.Extensions;

public static class WebApplicationExtensions
{
	public static WebApplication ConfigureWebApplication(this WebApplication app)
	{
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

		return app;
	}
}
