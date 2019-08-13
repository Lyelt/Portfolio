using System;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Portfolio.Data;
using Portfolio.Models;
using Portfolio.Models.Auth;

[assembly: HostingStartup(typeof(Portfolio.Identity.IdentityHostingStartup))]
namespace Portfolio.Identity
{
    public class IdentityHostingStartup : IHostingStartup
    {
        public void Configure(IWebHostBuilder builder)
        {
            builder.ConfigureServices((context, services) =>
            {
                services.AddDefaultIdentity<ApplicationUser>(options =>
                {
                    options.ClaimsIdentity.UserIdClaimType = IdentityHelpers.UserIdClaim;
                })
                .AddRoles<IdentityRole>()
                .AddEntityFrameworkStores<PortfolioContext>();
            });
        }
    }
}