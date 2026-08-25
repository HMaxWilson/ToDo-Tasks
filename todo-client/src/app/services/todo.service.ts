import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TodoItem } from '../models/todo-item.model';

interface ODataResponse<T> {
    value: T[];
}

@Injectable({
    providedIn: 'root',
})
export class TodoService {
    private readonly apiUrl = 'http://localhost:5080/odata/TodoItems';

    constructor(private http: HttpClient) {}

    getAll(): Observable<TodoItem[]> {
        return this.http
            .get<ODataResponse<TodoItem>>(this.apiUrl)
            .pipe(map((response) => response.value));
    }

    getById(id: number): Observable<TodoItem> {
        return this.http.get<TodoItem>(`${this.apiUrl}(${id})`);
    }

    create(item: Partial<TodoItem>): Observable<TodoItem> {
        return this.http.post<TodoItem>(this.apiUrl, item);
    }

    update(id: number, item: TodoItem): Observable<TodoItem> {
        return this.http
            .put<TodoItem>(`${this.apiUrl}(${id})`, item)
            .pipe(map((response) => response ?? item));
    }

    toggleComplete(item: TodoItem): Observable<TodoItem> {
        const toggled: TodoItem = { ...item, isComplete: !item.isComplete };
        return this.http
            .patch<void>(`${this.apiUrl}(${item.id})`, {
                isComplete: !item.isComplete,
            })
            .pipe(map(() => toggled));
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}(${id})`);
    }
}
