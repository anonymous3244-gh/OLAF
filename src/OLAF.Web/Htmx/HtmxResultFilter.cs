using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace OLAF.Web.Htmx;

public sealed class HtmxResultFilter(
	IModelMetadataProvider metadataProvider,
	ITempDataDictionaryFactory tempDataFactory,
	ICompositeViewEngine viewEngine
) : IAsyncResultFilter
{
	private const string HxRequestHeaderName = "HX-Request";

	public async Task OnResultExecutionAsync(ResultExecutingContext context, ResultExecutionDelegate next)
	{
		var actionSupportsHtmx = context
			.ActionDescriptor
			.FilterDescriptors
			.Any(filter => filter.Filter is CanReturnHtmxAttribute);

		if (actionSupportsHtmx)
		{
			context.HttpContext.Response.Headers.AppendCommaSeparatedValues("Vary", HxRequestHeaderName);
		}

		var isHtmxRequest = context.HttpContext.Request.Headers.ContainsKey(HxRequestHeaderName);
		if (isHtmxRequest && actionSupportsHtmx
			&& context.Result is ObjectResult objectResult && objectResult.StatusCode is null or >= 200 and < 300 && objectResult.Value is not null
			&& context.ActionDescriptor is ControllerActionDescriptor descriptor)
		{
			var viewName = $"~/Views/{descriptor.ControllerName}/{descriptor.ActionName}.cshtml";
			var viewResult = viewEngine.GetView(null, viewName, isMainPage: false);
			if (!viewResult.Success) throw new InvalidOperationException($"The required HTMX partial view '{viewName}' could not be found.");

			context.Result = new PartialViewResult
			{
				ViewName = viewName,
				ViewData = new ViewDataDictionary(metadataProvider, context.ModelState)
				{
					Model = objectResult.Value
				},
				TempData = tempDataFactory.GetTempData(context.HttpContext),
				StatusCode = objectResult.StatusCode
			};
		}

		await next();
	}
}
