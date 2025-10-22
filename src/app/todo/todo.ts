import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { TaskService } from '../services/task.service';
import { Task } from '../models/task.model';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './todo.html',
  styleUrl: './todo.css'
})
export class TodoComponent implements OnInit {
  tasks: Task[] = [];
  newTaskTitle = '';
  filterStatus = 'all';
  searchText = '';

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.tasks = this.taskService.getTasks();
  }

  addTask() {
    if (!this.newTaskTitle.trim()) return;
    const newTask: Task = {
      id: Date.now(),
      title: this.newTaskTitle.trim(),
      status: 'pending',
      date: new Date().toLocaleDateString(),
      userId: 1,
      priority: 'low',
      isActive: true
    };
    this.taskService.addTask(newTask);
    this.tasks = this.taskService.getTasks();
    this.newTaskTitle = '';
  }

  deleteTask(id: number) {
    this.taskService.deleteTask(id);
    this.tasks = this.taskService.getTasks();
  }

  changeStatus(task: Task, newStatus: 'pending' | 'completed' | 'on-hold' | 'in-progress') {
    const updated = { ...task, status: newStatus };
    this.taskService.updateTask(updated);
    this.tasks = this.taskService.getTasks();
  }

  clearAll() {
    localStorage.removeItem('tasks');
    this.tasks = [];
  }

  filteredTasks() {
    return this.tasks.filter(task => {
      const matchesFilter =
        this.filterStatus === 'all' || task.status === this.filterStatus;
      const matchesSearch = task.title
        .toLowerCase()
        .includes(this.searchText.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }
}
