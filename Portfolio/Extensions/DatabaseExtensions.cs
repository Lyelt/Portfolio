﻿using Microsoft.EntityFrameworkCore;
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
            string connStr = Environment.GetEnvironmentVariable("CONNECTION_STRING");

            services
                .AddDbContext<PortfolioContext>(options => options.UseMySql(connStr))
                .AddDbContext<SpeedrunContext>(options => options.UseMySql(connStr))
                .AddDbContext<BowlingContext>(options => options.UseMySql(connStr));
            return services;
        }
    }
}