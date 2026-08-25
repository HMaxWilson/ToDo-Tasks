# Node 20, not 22: Angular 17 supports ^18.13.0 || ^20.9.0.
FROM node:20

WORKDIR /app

# Install at build time so a cold start is fast.
COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 4200

# npm install runs again on every start, and that is deliberate.
#
# /app/node_modules is a named volume, so it shadows whatever the image built.
# Without this, installing a dependency on the host would never reach the
# container: `docker compose up --build` would produce a correct image and then
# mount the stale volume straight over the top of it. The failure is silent -
# you get a cascade of unrelated Angular compile errors rather than "module not
# found" - so it is worth a couple of seconds at startup to make it impossible.
#
# When nothing has changed this is a no-op.
#
# --host 0.0.0.0 or nothing outside the container can reach the dev server.
# --poll for the same bind-mount file-watching reason as the API.
CMD ["sh", "-c", "npm install --no-audit --no-fund && npx ng serve --host 0.0.0.0 --poll 2000"]
