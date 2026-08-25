import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TodoItem } from '../../models/todo-item.model';

@Component({
    selector: 'app-todo-list',
    templateUrl: './todo-list.component.html',
    styleUrl: './todo-list.component.css',
})
export class TodoListComponent {
    @Input() todos: TodoItem[] = [];

    /** Ids of items with an in-flight request, owned by the parent. */
    @Input() pendingIds = new Set<number>();

    @Output() toggleComplete = new EventEmitter<TodoItem>();
    @Output() deleteTodo = new EventEmitter<number>();

    onToggle(item: TodoItem): void {
        this.toggleComplete.emit(item);
    }

    onDelete(id: number): void {
        this.deleteTodo.emit(id);
    }

    /**
     * Keeps DOM nodes stable across list updates. The parent replaces the
     * todos array on every mutation, so without this Angular tears down and
     * rebuilds every row each time.
     */
    trackById(_index: number, item: TodoItem): number {
        return item.id;
    }

    isPending(id: number): boolean {
        return this.pendingIds.has(id);
    }

    pendingCount(): number {
        return this.todos.filter((t) => !t.isComplete).length;
    }
}
