using System;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Portfolio.Models;

[assembly: HostingStartup(typeof(Portfolio.Areas.Identity.IdentityHostingStartup))]
namespace Portfolio.Areas.Identity
{
    public class IdentityHostingStartup : IHostingStartup
    {
        public void Configure(IWebHostBuilder builder)
        {
            builder.ConfigureServices((context, services) => {
                services.AddDbContext<PortfolioContext>(options =>
                    options.UseSqlite(
                        context.Configuration.GetConnectionString("PortfolioContextConnection")));

                services.AddDefaultIdentity<ApplicationUser>(options =>
                {
                    options.ClaimsIdentity.UserIdClaimType = IdentityHelpers.UserIdClaim;
                })
                .AddEntityFrameworkStores<PortfolioContext>();
            });
        }
    }
}