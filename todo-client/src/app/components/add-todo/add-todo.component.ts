import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-add-todo',
    templateUrl: './add-todo.component.html',
    styleUrl: './add-todo.component.css',
})
export class AddTodoComponent {
    /** True while the parent has a create request in flight. */
    @Input() submitting = false;

    @Output() addTodo = new EventEmitter<string>();

    newTitle = '';

    onSubmit(): void {
        if (this.submitting) return;

        const title = this.newTitle.trim();
        if (!title) return;

        this.addTodo.emit(title);
        this.newTitle = '';
    }
}
