namespace TodoApi.Models;

public class TodoItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public bool IsComplete { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Position in the user's manual ordering. Only meaningful when the client
    /// is showing the default order; every other sort ignores it.
    /// Existing records default to 0, so the default sort breaks ties on Id,
    /// which preserves creation order without needing a migration.
    /// </summary>
    public int DisplayOrder { get; set; }
}
