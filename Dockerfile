FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build
WORKDIR /app

RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs

# copy csproj and restore as distinct layers
COPY *.sln .
COPY Portfolio/*.csproj ./Portfolio/
RUN dotnet restore

# copy everything else and build app
COPY Portfolio/. ./Portfolio/
WORKDIR /app/Portfolio
RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:5.0 AS runtime
ENV ASPNETCORE_URLS http://*:5000
WORKDIR /app
ADD /Portfolio/nginx.conf.sigil /app/nginx.conf.sigil
COPY /Portfolio/appsettings.json /app/
COPY --from=build /app/Portfolio/out ./

#RUN sed -i 's/TLSv1.2/TLSv1.0/g' /etc/ssl/openssl.cnf
#RUN sed -i "s|DEFAULT@SECLEVEL=2|DEFAULT@SECLEVEL=1|g" /etc/ssl/openssl.cnf

ENTRYPOINT ["dotnet", "Portfolio.dll"]