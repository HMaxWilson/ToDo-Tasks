import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TodoItem } from '../../models/todo-item.model';

@Component({
    selector: 'app-todo-item',
    templateUrl: './todo-item.component.html',
    styleUrl: './todo-item.component.css',
})
export class TodoItemComponent {
    @Input() todo!: TodoItem;

    /** True while this item has a request in flight. */
    @Input() pending = false;

    /** True when the list is in manual-order mode, so the handle is shown. */
    @Input() draggable = false;

    @Output() toggleComplete = new EventEmitter<TodoItem>();
    @Output() deleteTodo = new EventEmitter<number>();

    onToggle(): void {
        if (this.pending) return;
        this.toggleComplete.emit(this.todo);
    }

    onDelete(): void {
        if (this.pending) return;
        this.deleteTodo.emit(this.todo.id);
    }
}
