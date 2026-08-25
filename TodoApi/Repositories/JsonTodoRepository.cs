using System.Text.Json;
using TodoApi.Models;

namespace TodoApi.Repositories;

public class JsonTodoRepository
{
    private readonly string _filePath;
    private readonly JsonSerializerOptions _jsonOptions = new() { WriteIndented = true };
    private readonly object _lock = new();

    public JsonTodoRepository(IConfiguration configuration)
    {
        var dataDir = configuration["DataDirectory"] ?? Path.Combine(AppContext.BaseDirectory, "data");
        Directory.CreateDirectory(dataDir);
        _filePath = Path.Combine(dataDir, "todos.json");

        if (!File.Exists(_filePath))
        {
            File.WriteAllText(_filePath, JsonSerializer.Serialize(new List<TodoItem>(), _jsonOptions));
        }
    }

    public IQueryable<TodoItem> GetAll()
    {
        return ReadAll().AsQueryable();
    }

    public TodoItem? GetById(int id)
    {
        return ReadAll().FirstOrDefault(t => t.Id == id);
    }

    public TodoItem Add(TodoItem item)
    {
        lock (_lock)
        {
            var items = ReadAll();
            item.Id = items.Count > 0 ? items.Max(t => t.Id) + 1 : 1;
            item.CreatedAt = DateTime.UtcNow;
            // New items go to the end of the manual ordering.
            item.DisplayOrder = items.Count > 0 ? items.Max(t => t.DisplayOrder) + 1 : 0;
            WriteAll([..items, item]);
            return item;
        }
    }

    public TodoItem? Update(int id, TodoItem updated)
    {
        lock (_lock)
        {
            var items = ReadAll();
            var existing = items.FirstOrDefault(t => t.Id == id);
            if (existing is null) return null;

            existing.Title = updated.Title;
            existing.IsComplete = updated.IsComplete;
            WriteAll(items);
            return existing;
        }
    }

    public bool Delete(int id)
    {
        lock (_lock)
        {
            var items = ReadAll();
            var item = items.FirstOrDefault(t => t.Id == id);
            if (item is null) return false;

            items.Remove(item);
            WriteAll(items);
            return true;
        }
    }

    /// <summary>
    /// Reassigns DisplayOrder to match the supplied sequence of ids.
    /// Ids not present in the sequence keep their relative order and are
    /// placed after those that were supplied.
    /// </summary>
    /// <returns>False if any supplied id does not exist.</returns>
    public bool Reorder(IReadOnlyList<int> orderedIds)
    {
        lock (_lock)
        {
            var items = ReadAll();
            var byId = items.ToDictionary(t => t.Id);

            if (orderedIds.Any(id => !byId.ContainsKey(id)))
            {
                return false;
            }

            for (var i = 0; i < orderedIds.Count; i++)
            {
                byId[orderedIds[i]].DisplayOrder = i;
            }

            // Anything the client did not send keeps its relative order and
            // sits after the supplied set, so a partial list cannot lose items.
            var supplied = orderedIds.ToHashSet();
            var next = orderedIds.Count;

            foreach (var item in items
                .Where(t => !supplied.Contains(t.Id))
                .OrderBy(t => t.DisplayOrder))
            {
                item.DisplayOrder = next++;
            }

            WriteAll(items);
            return true;
        }
    }

    private List<TodoItem> ReadAll()
    {
        var json = File.ReadAllText(_filePath);
        return JsonSerializer.Deserialize<List<TodoItem>>(json, _jsonOptions) ?? new List<TodoItem>();
    }

    private void WriteAll(List<TodoItem> items)
    {
        File.WriteAllText(_filePath, JsonSerializer.Serialize(items, _jsonOptions));
    }
}
