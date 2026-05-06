# Todo Node API

A Node.js + Express + TypeScript substitute for the .NET `TodoApi` back end.  
Uses a local JSON file for persistence — no database required.

## Prerequisites

- Node.js 18+
- npm 9+

## Setup

```bash
cd todo-node-api
npm install
```

## Development (watch mode)

```bash
npm run dev
```

The server starts on **http://localhost:7234** by default (same port as the .NET API so the Angular client works without any changes).

## Production

```bash
npm run build   # compiles TypeScript → dist/
npm start       # runs compiled output
```

## Configuration

| Environment variable | Default | Description |
|---|---|---|
| `PORT` | `7234` | Port the server listens on |

## API Endpoints

All routes mirror the OData-style URLs used by the .NET API.

| Method | Path | Description |
|---|---|---|
| `GET` | `/odata/TodoItems` | List all todos (returns `{ value: [...] }`) |
| `GET` | `/odata/TodoItems(id)` | Get single todo |
| `POST` | `/odata/TodoItems` | Create todo |
| `PUT` | `/odata/TodoItems(id)` | Replace todo |
| `PATCH` | `/odata/TodoItems(id)` | Partial update (e.g. toggle `isComplete`) |
| `DELETE` | `/odata/TodoItems(id)` | Delete todo |

## Data storage

Todo items are stored in `data/todos.json` (created automatically on first run, excluded from git).
