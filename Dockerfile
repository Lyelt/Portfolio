FROM mcr.microsoft.com/dotnet/core/sdk:2.1 AS build
WORKDIR /app

RUN curl -sL https://deb.nodesource.com/setup_11.x | bash -
RUN apt-get install -y nodejs

# copy csproj and restore as distinct layers
COPY *.sln .
COPY Portfolio/*.csproj ./Portfolio/
RUN dotnet restore

# copy everything else and build app
COPY Portfolio/. ./Portfolio/
WORKDIR /app/Portfolio
RUN dotnet publish -c Release -o out


FROM mcr.microsoft.com/dotnet/core/aspnet:2.1 AS runtime
ENV ASPNETCORE_URLS http://*:5000
WORKDIR /app
ADD /Portfolio/nginx.conf.sigil /app/nginx.conf.sigil
COPY /Portfolio/appsettings.json /app/appsettings.json
COPY --from=build /app/Portfolio/out ./
ENTRYPOINT ["dotnet", "Portfolio.dll"]