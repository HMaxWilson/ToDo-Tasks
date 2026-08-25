using Microsoft.AspNetCore.OData;
using Microsoft.OData.ModelBuilder;
using TodoApi.Models;
using TodoApi.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Build the OData EDM model with camelCase naming
var modelBuilder = new ODataConventionModelBuilder();
modelBuilder.EnableLowerCamelCase();
var todoItems = modelBuilder.EntitySet<TodoItem>("TodoItems");

// Collection-bound action: POST /odata/TodoItems/Reorder  { "ids": [3, 1, 2] }
// Reordering is one user action over many rows, so it is a single call
// rather than a PATCH per item - which would be N requests racing.
var reorder = todoItems.EntityType.Collection.Action("Reorder");
reorder.CollectionParameter<int>("ids");
var edmModel = modelBuilder.GetEdmModel();

// Add services
builder.Services.AddScoped<JsonTodoRepository>();
builder.Services.AddControllers().AddOData(options =>
    options
        .Select()
        .Filter()
        .OrderBy()
        .SetMaxTop(100)
        .Count()
        .Expand()
        .AddRouteComponents("odata", edmModel));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularDev", policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

app.UseCors("AllowAngularDev");
app.MapControllers();

app.Run();

