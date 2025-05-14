FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copy csproj and restore dependencies
COPY *.csproj ./
RUN dotnet restore

# Copy everything else and build
COPY . ./
RUN dotnet publish ChessTutorWeb.csproj -c Release -o out


# Install Node.js and npm
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/out .
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/wwwroot ./wwwroot
ENV ASPNETCORE_URLS=http://+:80
EXPOSE 8080
EXPOSE 80
EXPOSE 443
ENTRYPOINT ["dotnet", "ChessTutorWeb.dll"]
