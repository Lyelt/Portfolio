FROM mcr.microsoft.com/dotnet/core/sdk:2.2 AS build
WORKDIR /app

# copy csproj and restore as distinct layers
COPY *.sln .
COPY Portfolio/*.csproj ./Portfolio/
RUN dotnet restore

# copy everything else and build app
COPY Portfolio/. ./Portfolio/
WORKDIR /app/Portfolio
RUN dotnet publish -c Release -o out


FROM mcr.microsoft.com/dotnet/core/aspnet:2.2 AS runtime
ENV ASPNETCORE_URLS http://*:5000 
WORKDIR /app
COPY --from=build /app/Portfolio/out ./
ENTRYPOINT ["dotnet", "Portfolio.dll"]