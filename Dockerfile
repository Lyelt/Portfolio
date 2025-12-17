# ---------- build stage ----------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# install Node.js 18
RUN apt-get update \
    && apt-get install -y curl \
    && curl -sL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# copy csproj and restore as distinct layers
COPY *.sln .
COPY Portfolio/*.csproj ./Portfolio/
COPY PortfolioDatabase/*.csproj ./PortfolioDatabase/
RUN dotnet restore

# copy everything and publish web
COPY Portfolio/. ./Portfolio/
RUN dotnet publish ./Portfolio/Portfolio.csproj -c Release -o /out/web

# copy everything and publish dbup exe
COPY PortfolioDatabase/. ./PortfolioDatabase/
RUN dotnet publish ./PortfolioDatabase/PortfolioDatabase.csproj -c Release -o /out/dbup

# ---------- runtime stage ----------
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
ENV ASPNETCORE_URLS=http://*:5000
ENV TZ=America/New_York

WORKDIR /app
ADD /Portfolio/nginx.conf.sigil /app/nginx.conf.sigil
COPY /Portfolio/appsettings.json /app/

COPY --from=build /out/web/ ./
COPY --from=build /out/dbup/ ./dbup/

ENTRYPOINT ["dotnet", "Portfolio.dll"]
