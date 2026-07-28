using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpOverrides;
using Portfolio.Extensions;
using System;
using Portfolio.Data;
using Microsoft.Extensions.Hosting;
using Portfolio.Models.Dog;
using Portfolio.Models.Auth;
using Portfolio.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Net;
using System.Text.Json.Serialization;

namespace Portfolio
{
    public class Startup
    {
        private readonly IWebHostEnvironment _environment;

        public Startup(IConfiguration configuration, IWebHostEnvironment environment)
        {
            Configuration = configuration;
            _environment = environment;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services
                .ConfigureDatabase()
                .ConfigureAuthentication()
                .AddIdentityCore<ApplicationUser>(options =>
                {
                    options.ClaimsIdentity.UserIdClaimType = IdentityHelpers.UserIdClaim;
                })
                .AddRoles<IdentityRole>()
                .AddEntityFrameworkStores<PortfolioContext>()
                .Services
                .AddSingleton<IDogService, DogService>()
                .AddSingleton<IGameNightChooserFactory, GameNightChooserFactory>()
                .AddTransient<IGameNightService, GameNightService>()
                .AddScoped<IBowlingDashboardService, BowlingDashboardService>();

            services.AddSignalR(options =>
            {
                options.EnableDetailedErrors = _environment.IsDevelopment();
            });

            services
                .AddOptions<YugiohCatalogOptions>()
                .Bind(Configuration.GetSection("Api:Yugioh"))
                .Validate(options => Uri.TryCreate(options.CardEndpoint, UriKind.Absolute, out _), "Api:Yugioh:CardEndpoint must be an absolute URI.")
                .Validate(options => options.CacheDurationMinutes > 5, "Api:Yugioh:CacheDurationMinutes must be greater than five.")
                .Validate(options => options.RequestTimeoutSeconds > 0 && options.RequestTimeoutSeconds <= 600, "Api:Yugioh:RequestTimeoutSeconds must be between 1 and 600.")
                .ValidateOnStart();

            services.AddHttpClient(YugiohApiClient.HttpClientName, (serviceProvider, client) =>
            {
                var options = serviceProvider.GetRequiredService<IOptions<YugiohCatalogOptions>>().Value;
                client.BaseAddress = new Uri(options.CardEndpoint);
                client.Timeout = System.Threading.Timeout.InfiniteTimeSpan;
            });
            services.AddSingleton<TimeProvider>(TimeProvider.System);
            services.AddSingleton<IYugiohApiClient, YugiohApiClient>();
            services.AddSingleton<IYugiohCardCatalog, YugiohCardCatalog>();

            services
                .AddMvc(config =>
                {
                    var policy = new AuthorizationPolicyBuilder()
                                    .RequireAuthenticatedUser()
                                    .Build();
                    config.Filters.Add(new AuthorizeFilter(policy));
                })
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
                });

            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/dist";
            });

        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            var forwardedHeaders = new ForwardedHeadersOptions
            {
                ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
            };
            if (!env.IsDevelopment())
            {
                var configuredProxy = Environment.GetEnvironmentVariable("FORWARDED_HEADERS_KNOWN_PROXY");
                if (!IPAddress.TryParse(configuredProxy, out var proxyAddress))
                    throw new InvalidOperationException("FORWARDED_HEADERS_KNOWN_PROXY must contain Caddy's Docker IPv4 address.");

                forwardedHeaders.KnownProxies.Add(proxyAddress);
            }
            app.UseForwardedHeaders(forwardedHeaders);

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            app.UseExceptionHandler("/error");
            app.UseStaticFiles();
            if (!env.IsDevelopment())
                app.UseSpaStaticFiles();

            app.UseAuthentication();
            app.UseRouting();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapGet("/livez", async context =>
                {
                    context.Response.StatusCode = StatusCodes.Status200OK;
                    context.Response.ContentType = "text/plain";
                    await context.Response.WriteAsync("alive");
                }).WithMetadata(new AllowAnonymousAttribute());
                endpoints.MapGet("/healthz", async context =>
                {
                    context.Response.ContentType = "text/plain";
                    try
                    {
                        var database = context.RequestServices.GetRequiredService<PortfolioContext>();
                        var canConnect = await database.Database.CanConnectAsync(context.RequestAborted);
                        context.Response.StatusCode = canConnect
                            ? StatusCodes.Status200OK
                            : StatusCodes.Status503ServiceUnavailable;
                        await context.Response.WriteAsync(canConnect ? "healthy" : "database unavailable");
                    }
                    catch (Exception)
                    {
                        context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
                        await context.Response.WriteAsync("database unavailable");
                    }
                }).WithMetadata(new AllowAnonymousAttribute());
                endpoints.MapControllerRoute("default", "{controller}/{action=Index}/{id?}");
                endpoints.MapHub<DogHub>("/dogs");
            });

            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "ClientApp";

                if (env.IsDevelopment())
                {
                    spa.UseProxyToSpaDevelopmentServer("http://localhost:4200");
                }
            });
        }
    }
}
