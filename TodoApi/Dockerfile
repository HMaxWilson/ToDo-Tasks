# SDK image rather than the aspnet runtime image: dev mode needs `dotnet watch`.
FROM mcr.microsoft.com/dotnet/sdk:8.0

WORKDIR /src

# Restore as its own layer so dependency changes, not source changes,
# are what invalidate the cache.
COPY *.csproj ./
RUN dotnet restore

COPY . .

EXPOSE 8080

# --no-launch-profile is required: without it launchSettings.json overrides
# ASPNETCORE_URLS and the container would listen on 5055 instead of 8080.
CMD ["dotnet", "watch", "run", "--no-launch-profile"]
