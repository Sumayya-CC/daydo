import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormControl } from '@angular/forms'; // Reactive Forms
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';

import { TaskFormComponent } from './task-form/task-form/task-form';
import { TaskService } from '../services/task.service';
import { Task } from '../models/task.model';
import { combineLatest, map, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop'; // <-- NEW: RxJS to Signal utility

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // <-- Use Reactive Forms
    TitleCasePipe,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule,
    MatToolbarModule,
    MatDividerModule,
    TaskFormComponent,
  ],
  templateUrl: './todo.html',
  styleUrl: './todo.css'
})
export class TodoComponent implements OnInit {
  // --- Modern Angular Feature: `inject` ---
  private taskService = inject(TaskService);
  private fb = inject(FormBuilder);

  // --- Reactive Form Controls for Filtering/Searching ---
  searchControl = this.fb.control('', { nonNullable: true });
  filterStatusControl = this.fb.control<Task['status'] | 'all'>('all', { nonNullable: true });

  // --- Signal for Filtered Tasks ---
  // The stream of tasks, filtered based on the controls' value changes
  filteredTasks = toSignal(
    combineLatest([
      this.taskService.tasks$, // Stream of active tasks
      this.searchControl.valueChanges.pipe(startWith(this.searchControl.value)),
      this.filterStatusControl.valueChanges.pipe(startWith(this.filterStatusControl.value)),
    ]).pipe(
      map(([tasks, searchTerm, filterStatus]) => 
        this.applyFilters(tasks, searchTerm, filterStatus)
      )
    ),
    { initialValue: [] } // Initialize with an empty array
  );

  // --- Modal State ---
  showTaskForm: boolean = false;
  taskToEdit: Task | undefined;

  // Static options for dropdowns
  taskStatuses = ['pending', 'completed', 'on-hold', 'in-progress'] as const;

  ngOnInit(): void {
    // No manual subscriptions needed! Everything is managed by `toSignal`.
  }

  // --- Filtering Logic (Pure Function) ---
  private applyFilters(
    tasks: Task[],
    searchTerm: string,
    filterStatus: Task['status'] | 'all'
  ): Task[] {
    let filtered = tasks;

    // 1. Status Filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus);
    }

    // 2. Search Filter (by title)
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }

  // --- Action Handlers ---

  openForm(task?: Task): void {
    this.taskToEdit = task; 
    this.showTaskForm = true;
  }

  closeForm(): void {
    this.showTaskForm = false;
    this.taskToEdit = undefined;
  }

  deleteTask(id: number) {
    this.taskService.deleteTask(id);
  }

  clearAll() {
    this.taskService.clearAllTasks();
  }
  
  trackById(index: number, task: Task): number {
    return task.id;
  }
}