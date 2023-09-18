using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Serilog;
using Serilog.Events;
using Serilog.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portfolio.Extensions
{
    public static class LoggerExtensions
    {
        public static IServiceCollection ConfigureLogging(this IServiceCollection services, IConfiguration configuration)
        {
            Log.Logger = new LoggerConfiguration()
                .WriteTo.Console()
                .WriteTo.File("PortfolioLog.log")
                .MinimumLevel.Is(Enum.TryParse<LogEventLevel>(configuration.GetValue("Logging:LogLevel:Default", "Information"), out var level) ? level : LogEventLevel.Information)
                .CreateLogger();

            services.AddLogging(c => c.AddSerilog());
            services.AddSingleton<ILoggerFactory>(s => new SerilogLoggerFactory(Log.Logger));

            return services;
        }
    }
}
