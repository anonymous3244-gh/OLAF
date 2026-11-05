using Microsoft.AspNetCore.Builder;
using OLAF.Web.Extensions;

var builder = WebApplication.CreateBuilder(args);
builder.Services.ConfigureServices(builder.Configuration);

var app = builder.Build();
app.ConfigureWebApplication();

app.Run();
