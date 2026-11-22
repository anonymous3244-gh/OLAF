using System;

namespace OLAF.Web.Htmx;

[AttributeUsage(AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
public sealed class CanReturnHtmxAttribute : Attribute
{
}
