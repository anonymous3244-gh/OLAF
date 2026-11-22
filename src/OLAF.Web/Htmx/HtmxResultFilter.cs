using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.ViewEngines;

namespace OLAF.Web.Htmx;

public sealed class HtmxResultFilter : IAsyncResultFilter
{
	private readonly IModelMetadataProvider metadataProvider;
	private readonly ITempDataDictionaryFactory tempDataFactory;
	private readonly ICompositeViewEngine viewEngine;

	public HtmxResultFilter(IModelMetadataProvider metadataProvider, ITempDataDictionaryFactory tempDataFactory, ICompositeViewEngine viewEngine)
	{
		this.metadataProvider = metadataProvider;
		this.tempDataFactory = tempDataFactory;
		this.viewEngine = viewEngine;
	}

	public async Task OnResultExecutionAsync(ResultExecutingContext context, ResultExecutionDelegate next)
	{
		var supportsHtmx = context.ActionDescriptor.FilterDescriptors.Any(filter => filter.Filter is CanReturnHtmxAttribute);
		if (supportsHtmx)
		{
			context.HttpContext.Response.Headers.AppendCommaSeparatedValues("Vary", "HX-Request");
		}

		var isHtmx = context.HttpContext.Request.Headers.ContainsKey("HX-Request");
		if (isHtmx && supportsHtmx && context.Result is ObjectResult objectResult
			&& (objectResult.StatusCode is null || objectResult.StatusCode >= 200 && objectResult.StatusCode < 300)
			&& objectResult.Value is not null
			&& context.ActionDescriptor is ControllerActionDescriptor descriptor)
		{
			var viewName = $"~/Views/{descriptor.ControllerName}/{descriptor.ActionName}.cshtml";
			var viewResult = viewEngine.GetView(null, viewName, isMainPage: false);
			if (!viewResult.Success)
			{
				throw new InvalidOperationException($"The required HTMX partial view '{viewName}' could not be found.");
			}

			var viewData = new ViewDataDictionary(metadataProvider, context.ModelState)
			{
				Model = objectResult.Value
			};
			context.Result = new PartialViewResult
			{
				ViewName = viewName,
				ViewData = viewData,
				TempData = tempDataFactory.GetTempData(context.HttpContext),
				StatusCode = objectResult.StatusCode
			};
		}

		await next();
	}
}
