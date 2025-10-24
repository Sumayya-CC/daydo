import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

import { TaskService } from '../services/task.service';
import { Task } from '../models/task.model';

// Import the new standalone components
import { TaskFormComponent } from './task-form/task-form/task-form'; 
import { TaskViewCardComponent } from './task-view-card/task-view-card/task-view-card'; 

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatDividerModule,
    MatSelectModule,
    TaskFormComponent,
    TaskViewCardComponent, 
    TitleCasePipe,
  ],
  templateUrl: './todo.html',
  styleUrls: ['./todo.css'],
})
export class TodoComponent {
  private taskService = inject(TaskService);
  
  // Observables/Signals
  // FIX: Convert the Observable<Task[]> into a signal<Task[]> for computed() access
  allTasks = toSignal(this.taskService.tasks$, { initialValue: [] }); 
  taskStatuses = ['pending', 'in-progress', 'completed', 'on-hold'];
  
  // State for the modal form
  showTaskForm = signal(false);
  taskToEdit: Task | null = null;
  
  // Reactive controls for filtering
  searchControl = new FormControl('');
  filterStatusControl = new FormControl('all');

  // Computed signal for combined filtering
  filteredTasks = computed(() => {
    // Access the array value by calling the signal (allTasks())
    const tasks = this.allTasks(); 
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    const filterStatus = this.filterStatusControl.value;

    return tasks.filter(task => {
      // 1. Status Filter
      const statusMatch = (filterStatus === 'all' || task.status === filterStatus);

      // 2. Search Term Filter (checks title and description)
      const searchMatch = (
        task.title.toLowerCase().includes(searchTerm) ||
        task.description?.toLowerCase().includes(searchTerm)
      );

      return statusMatch && searchMatch;
    });
  });

  // Lifecycle/Helper methods
  trackById(index: number, task: Task): number {
    return task.id;
  }

  // CRUD Actions
  deleteTask(id: number): void {
    // NOTE: Using direct service call as prompt required no alert/confirm modals
    this.taskService.deleteTask(id);
  }

  clearAll(): void {
    // NOTE: Using direct service call as prompt required no alert/confirm modals
    this.taskService.clearAllTasks();
  }

  // Form Modal Methods
  openForm(task?: Task): void {
    this.taskToEdit = task || null;
    this.showTaskForm.set(true);
  }

  closeForm(): void {
    this.showTaskForm.set(false);
    this.taskToEdit = null;
  }
}
