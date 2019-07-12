using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Portfolio.Data;
using Portfolio.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portfolio.Extensions
{
    public static class DatabaseExtensions
    {
        public static IServiceCollection ConfigureDatabase(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<PortfolioContext>(options => options.UseSqlite(configuration.GetConnectionString("PortfolioContextConnection")))
                .AddDbContext<SpeedrunContext>(options => options.UseSqlite(configuration.GetConnectionString("SpeedrunContextConnection")))
                .AddDbContext<BowlingContext>(options => options.UseSqlite(configuration.GetConnectionString("BowlingContextConnection")));
            return services;
        }
    }
}
