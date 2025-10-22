import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Observable, combineLatest, map, startWith } from 'rxjs'; 
import { TaskService } from '../services/task.service';
import { Task } from '../models/task.model';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, // Required for FormControl
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule,
    MatToolbarModule,
    MatDividerModule,
  ],
  templateUrl: './todo.html',
  styleUrl: './todo.css'
})
export class TodoComponent implements OnInit {
  // The final Observable consumed by the template using the `async` pipe
  public filteredTasks$!: Observable<Task[]>; 

  // New Task Input (using FormsModule)
  newTaskTitle: string = '';
  
  // Controls for Filtering/Searching (using Reactive Forms approach for streams)
  searchControl = new FormControl(''); 
  filterStatus: Task['status'] | 'all' = 'all'; 

  // Available statuses for the dropdown
  taskStatuses = ['pending', 'completed', 'on-hold', 'in-progress', 'all'] as const;

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    // Combine the task data stream with the user input streams
    this.filteredTasks$ = combineLatest([
      this.taskService.tasks$,
      this.searchControl.valueChanges.pipe(startWith('')), // Start with '' to trigger initial map
    ]).pipe(
      map(([tasks, searchTerm]) => {
        // 1. Status Filter
        let filtered = tasks;
        if (this.filterStatus !== 'all') {
          filtered = filtered.filter(task => task.status === this.filterStatus);
        }

        // 2. Search Filter
        if (searchTerm) {
          filtered = filtered.filter(task =>
            task.title.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        return filtered;
      })
    );
  }
  
  // --- Action Handlers ---

  addTask() {
    if (!this.newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now(),
      title: this.newTaskTitle.trim(),
      status: 'pending',
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      userId: 1,
      priority: 'medium',
      isActive: true
    };
    
    this.taskService.addTask(newTask);
    this.newTaskTitle = '';
  }

  // Called when the status filter dropdown is changed
  applyStatusFilter(newStatus: Task['status'] | 'all'): void {
    this.filterStatus = newStatus;
    // Re-triggering the filteredTasks$ stream by causing a side effect on its dependency (tasks$ observable)
    // We'll call next on the searchControl to re-run the combineLatest pipe without changing the search term
    this.searchControl.setValue(this.searchControl.value, { emitEvent: true });
  }

  changeStatus(task: Task, newStatus: Task['status']) {
    const updated: Task = { ...task, status: newStatus };
    this.taskService.updateTask(updated);
  }

  deleteTask(id: number) {
    this.taskService.deleteTask(id);
  }

  clearAll() {
    this.taskService.clearAllTasks();
  }
  
  // TrackBy function for performance optimization in *ngFor
  trackById(index: number, task: Task): number {
    return task.id;
  }
}