# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

COPY bingo-api.sln .
COPY bingo-api/bingo-api.csproj ./bingo-api/

# Restore
RUN dotnet restore bingo-api.sln

# Copy the rest of the source
COPY . .

WORKDIR /app/bingo-api
RUN dotnet publish bingo-api.csproj -c Release -o /out

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /out .

ENTRYPOINT ["dotnet", "bingo-api.dll"]