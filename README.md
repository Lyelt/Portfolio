# Portfolio

The source for [ghobrial.dev](https://ghobrial.dev), including the blog,
bowling and speedrun tools, game-night planning, and the Yu-Gi-Oh catalog.

## Architecture

- ASP.NET Core serves the API, SignalR hub, and production Angular assets.
- Angular lives in `Portfolio/ClientApp`.
- PostgreSQL is shared by the feature-specific EF Core contexts.
- `PortfolioDatabase` applies the ordered DbUp scripts before the app starts.
- The root `Dockerfile` publishes the web app and migration executable into one
  immutable, multi-architecture image.

## Local development

Prerequisites are the SDK pinned by `global.json`, Node.js 22, npm, and
PostgreSQL 17.

1. Start PostgreSQL and create an empty database.
2. Set `CONNECTION_STRING`, `JWT_SECURITY_KEY`, `JWT_ISSUER`, and
   `JWT_AUDIENCE` in the local shell. Use development-only values.
3. Apply the schema and start the API:

   ```sh
   dotnet restore Portfolio.sln
   dotnet run --project PortfolioDatabase/PortfolioDatabase.csproj
   dotnet run --project Portfolio/Portfolio.csproj
   ```

4. In another shell, start Angular:

   ```sh
   npm ci --prefix Portfolio/ClientApp
   npm start --prefix Portfolio/ClientApp
   ```

The API proxies development frontend requests to `http://localhost:4200`.

Run the same source checks as CI with:

```sh
npm audit --prefix Portfolio/ClientApp --audit-level=high
npm run build --prefix Portfolio/ClientApp -- --configuration production
npm test --prefix Portfolio/ClientApp -- --watch=false
dotnet build Portfolio.sln --configuration Release
dotnet test Portfolio.sln --configuration Release --no-build
```

CI intentionally does not enforce repository-wide `dotnet format`: the legacy
solution has a large untouched whitespace baseline. Format files you change;
normalizing that baseline belongs in a dedicated review. CI does reject
high-severity npm advisories.

## Operations

[HOSTING_SETUP.md](HOSTING_SETUP.md) is the Portfolio-specific deployment,
backup, promotion, and troubleshooting contract. Shared host bootstrap,
DNS/tunnel recovery, runner recreation, credential recovery, and the complete
restore drill are canonical in the private `Lyelt/MacMiniInfrastructure`
repository.
