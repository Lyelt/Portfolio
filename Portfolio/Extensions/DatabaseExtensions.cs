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
            services
                .AddDbContext<PortfolioContext>(o => GetOptions(o))
                .AddDbContext<SpeedrunContext>(o => GetOptions(o))
                .AddDbContext<BowlingContext>(o => GetOptions(o))
                .AddDbContext<DogContext>(o => GetOptions(o))
                .AddDbContext<YugiohContext>(o => GetOptions(o))
                .AddDbContext<GameNightContext>(o => GetOptions(o));

            return services;
        }

        private static DbContextOptionsBuilder GetOptions(DbContextOptionsBuilder options)
        {
            var connStr = Environment.GetEnvironmentVariable("CONNECTION_STRING");
            var version = ServerVersion.AutoDetect(connStr);

            return options
                .UseMySql(connStr, version)
                .EnableDetailedErrors();
        }
    }
}
