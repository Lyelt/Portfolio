using DbUp;
using System.Reflection;

var connStr = Environment.GetEnvironmentVariable("CONNECTION_STRING");

EnsureDatabase.For.PostgresqlDatabase(connStr);

var upgradeEngine = DeployChanges.To
    .PostgresqlDatabase(connStr)
    .WithScriptsEmbeddedInAssembly(Assembly.GetExecutingAssembly())
    .LogToConsole()
    .Build();

upgradeEngine.PerformUpgrade();