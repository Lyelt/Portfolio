using DbUp;
using System.Reflection;

var connStr = Environment.GetEnvironmentVariable("CONNECTION_STRING");

if (string.IsNullOrWhiteSpace(connStr))
{
    Console.Error.WriteLine("Required environment variable CONNECTION_STRING is not set.");
    return 1;
}

try
{
    EnsureDatabase.For.PostgresqlDatabase(connStr);

    var upgradeEngine = DeployChanges.To
        .PostgresqlDatabase(connStr)
        .WithScriptsEmbeddedInAssembly(Assembly.GetExecutingAssembly())
        .LogToConsole()
        .Build();

    var result = upgradeEngine.PerformUpgrade();
    if (!result.Successful)
    {
        Console.Error.WriteLine("Database migration failed.");
        return 1;
    }

    Console.WriteLine("Database migration completed successfully.");
    return 0;
}
catch (Exception exception)
{
    Console.Error.WriteLine($"Database migration failed ({exception.GetType().Name}).");
    return 1;
}
