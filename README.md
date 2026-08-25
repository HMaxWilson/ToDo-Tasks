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

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/) and npm
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

## Project structure

```
full-stack-todo/
├── TodoApi/                     # ASP.NET Core 8 + OData API
│   ├── Controllers/
│   │   └── TodoItemsController.cs
│   ├── Models/
│   │   └── TodoItem.cs
│   ├── Repositories/
│   │   └── JsonTodoRepository.cs
│   ├── data/                    # Created at runtime; holds todos.json
│   ├── Program.cs
│   └── TodoApi.csproj
│
└── todo-client/                 # Angular 17 frontend
    └── src/app/
        ├── models/
        │   └── todo-item.model.ts
        ├── services/
        │   └── todo.service.ts
        ├── components/
        │   ├── add-todo/
        │   ├── todo-item/
        │   └── todo-list/
        ├── app.component.ts
        └── app.module.ts
```
