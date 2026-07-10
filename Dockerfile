# Node 18 is kept intentionally for Angular 16 compatibility. Both upstream
# images are multi-architecture and resolve to linux/arm64 on the hosting VM.
FROM node:18-bookworm-slim@sha256:f9ab18e354e6855ae56ef2b290dd225c1e51a564f87584b9bd21dd651838830e AS node

# ---------- build stage ----------
FROM mcr.microsoft.com/dotnet/sdk:10.0@sha256:ea8bde36c11b6e7eec2656d0e59101d4462f6bd630730f2c8201ed0572b295d5 AS build
WORKDIR /app

# Copy the pinned Node runtime instead of executing a remote setup script.
RUN apt-get update \
    && apt-get install -y --no-install-recommends libatomic1 \
    && rm -rf /var/lib/apt/lists/*
COPY --from=node /usr/local/ /usr/local/
RUN node --version && npm --version

# copy csproj and restore as distinct layers
COPY Portfolio.sln ./
COPY Portfolio/*.csproj ./Portfolio/
COPY PortfolioDatabase/*.csproj ./PortfolioDatabase/
RUN dotnet restore ./Portfolio.sln

# copy application sources and publish both artifacts
COPY Portfolio/. ./Portfolio/
COPY PortfolioDatabase/. ./PortfolioDatabase/
RUN dotnet publish ./Portfolio/Portfolio.csproj -c Release -o /out/web
RUN dotnet publish ./PortfolioDatabase/PortfolioDatabase.csproj -c Release -o /out/dbup

# ---------- runtime stage ----------
FROM mcr.microsoft.com/dotnet/aspnet:10.0@sha256:7644f992230d35cf230017189d4038c0ae0f7388b13f4f7ae1900a155bafb597 AS runtime
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*

ENV ASPNETCORE_HTTP_PORTS=8080 \
    DOTNET_EnableDiagnostics=0 \
    TZ=America/New_York

WORKDIR /app
COPY --from=build /out/web/ ./
COPY --from=build /out/dbup/ ./dbup/

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl --fail --silent --show-error http://127.0.0.1:8080/healthz || exit 1

USER $APP_UID
ENTRYPOINT ["dotnet", "Portfolio.dll"]
