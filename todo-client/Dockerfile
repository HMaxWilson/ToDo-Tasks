# Node 20, not 22: Angular 17 supports ^18.13.0 || ^20.9.0.
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 4200

# --host 0.0.0.0 or nothing outside the container can reach the dev server.
# --poll for the same bind-mount file-watching reason as the API.
CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--poll", "2000"]
