import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AddTodoComponent } from './components/add-todo/add-todo.component';
import { TodoItemComponent } from './components/todo-item/todo-item.component';
import { TodoListComponent } from './components/todo-list/todo-list.component';

@NgModule({
    declarations: [
        AppComponent,
        TodoListComponent,
        TodoItemComponent,
        AddTodoComponent,
    ],
    imports: [BrowserModule, FormsModule, HttpClientModule, DragDropModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
