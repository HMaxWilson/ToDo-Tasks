# full-stack-todo

A full-stack Todo application with an **ASP.NET Core 8 / OData** backend and an **Angular 17** frontend.

## Architecture

| Layer    | Technology                         | Notes                                  |
|----------|------------------------------------|----------------------------------------|
| API      | ASP.NET Core 8 + OData 8           | OData endpoint at `/odata/TodoItems`   |
| Storage  | JSON file                          | `TodoApi/data/todos.json`              |
| Frontend | Angular 17 (NgModule, non-standalone) | `@Input()`/`@Output()`, RxJS observables |

---

## Getting started

### Option 1 — Docker

Requires only [Docker Desktop](https://www.docker.com/products/docker-desktop/)
(or OrbStack / Colima). No local .NET SDK or Node install needed.

```bash
docker compose up --build
```

Both services start with hot reload enabled:

| Service  | URL                     |
|----------|-------------------------|
| API      | http://localhost:5080   |
| Frontend | http://localhost:4200   |

Source directories are bind-mounted, so edits on the host rebuild inside the
containers. Todo data is written to the `todo-data` named volume via the
`DataDirectory` setting, so it survives rebuilds.

```bash
docker compose down          # stop, keep data
docker compose down -v       # stop and remove the data volume
```

### Option 2 — Local install

#### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/) and npm — see `.nvmrc`
- [Angular CLI 17](https://angular.io/cli): `npm install -g @angular/cli@17`

---

### Run the backend

```bash
cd TodoApi
dotnet run
```

The API will listen on **http://localhost:5080**.

#### OData endpoints

| Method   | URL                              | Description          |
|----------|----------------------------------|----------------------|
| GET      | `/odata/TodoItems`               | List all todos       |
| GET      | `/odata/TodoItems(1)`            | Get todo by id       |
| POST     | `/odata/TodoItems`               | Create a todo        |
| PUT      | `/odata/TodoItems(1)`            | Replace a todo       |
| PATCH    | `/odata/TodoItems(1)`            | Partial update       |
| DELETE   | `/odata/TodoItems(1)`            | Delete a todo        |

OData query options (`$filter`, `$orderby`, `$select`, `$top`, `$skip`, `$count`) are supported on the GET collection endpoint.

Example:
```
GET http://localhost:5080/odata/TodoItems?$filter=isComplete eq false&$orderby=createdAt desc
```

---

### Run the frontend

```bash
cd todo-client
npm install
ng serve
```

Open **http://localhost:4200** in your browser.

---

## A note on ports

The API runs on **5080** rather than the conventional ASP.NET `5000`. On macOS,
port 5000 is bound by AirPlay Receiver by default, which makes it unusable without
disabling an OS feature.

The value appears in four places and they must agree:

| File                                           | Purpose                         |
|------------------------------------------------|---------------------------------|
| `compose.yaml`                                 | Published host port for Docker  |
| `TodoApi/Properties/launchSettings.json`       | Port for `dotnet run`           |
| `todo-client/src/app/services/todo.service.ts` | API base URL used by the client |
| This README                                    | Documentation                   |

---

## Project structure

```
full-stack-todo/
├── compose.yaml                 # Docker setup for both services
├── .nvmrc                       # Node version for local installs
│
├── TodoApi/                     # ASP.NET Core 8 + OData API
│   ├── Controllers/
│   │   └── TodoItemsController.cs
│   ├── Models/
│   │   └── TodoItem.cs
│   ├── Repositories/
│   │   └── JsonTodoRepository.cs
│   ├── data/                    # Created at runtime; holds todos.json
│   ├── Dockerfile
│   ├── Program.cs
│   └── TodoApi.csproj
│
├── todo-client/                 # Angular 17 frontend
│   ├── Dockerfile
│   └── src/app/
│       ├── models/
│       │   └── todo-item.model.ts
│       ├── services/
│       │   └── todo.service.ts
│       ├── components/
│       │   ├── add-todo/
│       │   ├── todo-item/
│       │   └── todo-list/
│       ├── app.component.ts
│       └── app.module.ts
│
└── todo-node-api/               # Alternative Express/TypeScript API
```
