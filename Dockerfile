FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /app

RUN curl -sL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs

# copy csproj and restore as distinct layers
COPY *.sln .
COPY Portfolio/*.csproj ./Portfolio/
RUN dotnet restore

# copy everything else and build app
COPY Portfolio/. ./Portfolio/
WORKDIR /app/Portfolio
RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS runtime
ENV ASPNETCORE_URLS http://*:5000
ENV TZ=America/New_York
WORKDIR /app
ADD /Portfolio/nginx.conf.sigil /app/nginx.conf.sigil
COPY /Portfolio/appsettings.json /app/
COPY --from=build /app/Portfolio/out ./

ENTRYPOINT ["dotnet", "Portfolio.dll"]