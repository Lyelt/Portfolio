# ---------- build stage ----------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# install Node.js 18
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# copy solution and restore
COPY *.sln .
COPY Portfolio/*.csproj ./Portfolio/
RUN dotnet restore

# copy source and publish
COPY Portfolio/. ./Portfolio/
WORKDIR /app/Portfolio
RUN dotnet publish -c Release -o out

# ---------- runtime stage ----------
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
ENV ASPNETCORE_URLS=http://*:5000
ENV TZ=America/New_York

WORKDIR /app
ADD /Portfolio/nginx.conf.sigil /app/nginx.conf.sigil
COPY /Portfolio/appsettings.json /app/
COPY --from=build /app/Portfolio/out ./

ENTRYPOINT ["dotnet", "Portfolio.dll"]
