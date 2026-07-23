using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Portfolio.Models.Auth;

namespace Portfolio.Data
{
    public class PortfolioContext : IdentityDbContext<ApplicationUser>
    {
        public PortfolioContext(DbContextOptions<PortfolioContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            PostgresTimestampMappings.ConfigureApplicationUserLockout(
                builder,
                Database.ProviderName == "Npgsql.EntityFrameworkCore.PostgreSQL");
        }
    }
}
