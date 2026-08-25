import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { TodoItem } from './models/todo-item.model';
import {
    DEFAULT_TODO_SORT,
    TODO_SORT_OPTIONS,
} from './models/todo-sort.model';
import { TodoService } from './services/todo.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
    todos: TodoItem[] = [];
    errorMessage: string | null = null;

    /** True while any load is in flight. */
    isLoading = false;

    /** True once a load has completed, successfully or not. */
    hasLoaded = false;

    /** True while a create request is in flight. */
    isAdding = false;

    /** Ids of items with an in-flight update or delete. */
    pendingIds = new Set<number>();

    readonly sortOptions = TODO_SORT_OPTIONS;

    /** Current OData $orderby expression. */
    sortBy = DEFAULT_TODO_SORT;

    /**
     * True when a local change may have invalidated the order the API returned.
     * See onToggleComplete for why we surface this rather than silently re-sort.
     */
    sortStale = false;

    private destroy$ = new Subject<void>();

    constructor(private todoService: TodoService) {}

    ngOnInit(): void {
        this.loadTodos();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Only the very first load replaces the list with a loading message.
     * Later loads keep the list on screen so the layout does not jump.
     */
    get isFirstLoad(): boolean {
        return this.isLoading && !this.hasLoaded;
    }

    dismissError(): void {
        this.errorMessage = null;
    }

    /** Re-fetch in the current order, clearing the stale-order hint. */
    resort(): void {
        this.loadTodos();
    }

    onSortChange(value: string): void {
        if (value === this.sortBy) return;
        this.sortBy = value;
        this.loadTodos();
    }

    loadTodos(): void {
        this.isLoading = true;
        this.errorMessage = null;

        this.todoService
            .getAll(this.sortBy)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => {
                    this.isLoading = false;
                    this.hasLoaded = true;
                }),
            )
            .subscribe({
                next: (todos) => {
                    this.todos = todos;
                    this.sortStale = false;
                },
                error: () => {
                    this.errorMessage =
                        'Failed to load todos. Is the API running?';
                },
            });
    }

    onAddTodo(title: string): void {
        // Guard against double submission while a create is already running.
        if (this.isAdding) return;

        this.isAdding = true;
        this.errorMessage = null;

        this.todoService
            .create({ title, isComplete: false })
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => (this.isAdding = false)),
            )
            .subscribe({
                next: () => {
                    // Where a new item belongs depends on the active sort,
                    // which only the API knows how to apply. Appending locally
                    // would always put it last, which is wrong under every
                    // ordering except "oldest first". Reload instead.
                    this.loadTodos();
                },
                error: () => {
                    this.errorMessage = 'Failed to add todo.';
                },
            });
    }

    onToggleComplete(item: TodoItem): void {
        if (this.pendingIds.has(item.id)) return;

        this.markPending(item.id);

        this.todoService
            .toggleComplete(item)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.clearPending(item.id)),
            )
            .subscribe({
                next: (updated) => {
                    this.todos = this.todos.map((t) =>
                        t.id === updated.id ? updated : t,
                    );

                    // Deliberately NOT reloading. Re-ordering here would make
                    // the row leap away from under the user's cursor the moment
                    // they tick it. Instead, if the active sort depends on
                    // completion state, flag that the order is now stale and
                    // let the user re-sort when they choose to.
                    if (this.sortBy.includes('isComplete')) {
                        this.sortStale = true;
                    }
                },
                error: () => {
                    this.errorMessage = `Failed to update "${item.title}".`;
                },
            });
    }

    onDeleteTodo(id: number): void {
        if (this.pendingIds.has(id)) return;

        const item = this.todos.find((t) => t.id === id);
        this.markPending(id);

        this.todoService
            .delete(id)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.clearPending(id)),
            )
            .subscribe({
                next: () => {
                    this.todos = this.todos.filter((t) => t.id !== id);
                },
                error: () => {
                    this.errorMessage = item
                        ? `Failed to delete "${item.title}".`
                        : 'Failed to delete todo.';
                },
            });
    }

    // Sets are mutated in place, so replace the reference to keep the
    // binding change-detection friendly.
    private markPending(id: number): void {
        this.pendingIds = new Set(this.pendingIds).add(id);
    }

    private clearPending(id: number): void {
        const next = new Set(this.pendingIds);
        next.delete(id);
        this.pendingIds = next;
    }
}
