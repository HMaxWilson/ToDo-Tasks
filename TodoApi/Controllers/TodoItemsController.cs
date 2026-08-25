using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Deltas;
using Microsoft.AspNetCore.OData.Formatter;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using TodoApi.Models;
using TodoApi.Repositories;

namespace TodoApi.Controllers;

public class TodoItemsController : ODataController
{
    private readonly JsonTodoRepository _repository;

    public TodoItemsController(JsonTodoRepository repository)
    {
        _repository = repository;
    }

    [EnableQuery]
    public IActionResult Get()
    {
        return Ok(_repository.GetAll());
    }

    [EnableQuery]
    public IActionResult Get(int key)
    {
        var item = _repository.GetById(key);
        if (item is null) return NotFound();
        return Ok(item);
    }

    public IActionResult Post([FromBody] TodoItem item)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var created = _repository.Add(item);
        return Created(created);
    }

    public IActionResult Put(int key, [FromBody] TodoItem item)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var updated = _repository.Update(key, item);
        if (updated is null) return NotFound();
        return Updated(updated);
    }

    public IActionResult Patch(int key, [FromBody] Delta<TodoItem> delta)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var existing = _repository.GetById(key);
        if (existing is null) return NotFound();

        delta.Patch(existing);
        _repository.Update(key, existing);
        return Updated(existing);
    }

    /// <summary>
    /// POST /odata/TodoItems/Reorder with body { "ids": [3, 1, 2] }.
    /// Applies a new manual ordering in one write.
    /// </summary>
    [HttpPost]
    public IActionResult Reorder(ODataActionParameters parameters)
    {
        if (parameters is null ||
            !parameters.TryGetValue("ids", out var raw) ||
            raw is not IEnumerable<int> ids)
        {
            return BadRequest("Expected an 'ids' array of todo ids.");
        }

        var orderedIds = ids.ToList();

        if (orderedIds.Count == 0)
        {
            return BadRequest("'ids' must contain at least one id.");
        }

        if (orderedIds.Distinct().Count() != orderedIds.Count)
        {
            return BadRequest("'ids' must not contain duplicates.");
        }

        return _repository.Reorder(orderedIds)
            ? NoContent()
            : NotFound("One or more ids do not exist.");
    }

    public IActionResult Delete(int key)
    {
        var deleted = _repository.Delete(key);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
