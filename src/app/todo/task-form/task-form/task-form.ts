import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { Task } from '../../../models/task.model';
import { TaskService } from '../../../services/task.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatDatepickerModule,
    TitleCasePipe,
  ],
  providers: [provideNativeDateAdapter()], // Required for MatDatepicker
  template: `
    <mat-card class="task-form-card">
      <mat-card-header class="form-header">
        <mat-card-title>{{ isEditMode ? 'Edit Task' : 'Add New Task' }}</mat-card-title>
        <button mat-icon-button (click)="closeForm.emit()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="taskForm" (ngSubmit)="saveTask()" class="task-form-layout">
          
          <!-- Title -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Title</mat-label>
            <input matInput formControlName="title" placeholder="e.g., Finish report" required>
            <mat-error *ngIf="taskForm.get('title')?.invalid && taskForm.get('title')?.touched">
              Title is required.
            </mat-error>
          </mat-form-field>
          
          <!-- Description -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description (Optional)</mat-label>
            <textarea matInput formControlName="description" rows="3"></textarea>
          </mat-form-field>

          <!-- Status -->
          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status" required>
              <mat-option *ngFor="let status of taskStatuses" [value]="status">
                {{ status | titlecase }}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="taskForm.get('status')?.invalid && taskForm.get('status')?.touched">
              Status is required.
            </mat-error>
          </mat-form-field>

          <!-- Priority -->
          <mat-form-field appearance="outline">
            <mat-label>Priority</mat-label>
            <mat-select formControlName="priority" required>
              <mat-option *ngFor="let priority of taskPriorities" [value]="priority">
                {{ priority | titlecase }}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="taskForm.get('priority')?.invalid && taskForm.get('priority')?.touched">
              Priority is required.
            </mat-error>
          </mat-form-field>

          <!-- Date -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Due Date</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="date" required>
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
            <mat-error *ngIf="taskForm.get('date')?.invalid && taskForm.get('date')?.touched">
              Due Date is required.
            </mat-error>
          </mat-form-field>

          <!-- Actions -->
          <div class="form-actions">
            <!-- CRITICAL: Emit close event on cancel -->
            <button mat-stroked-button type="button" (click)="closeForm.emit()">Cancel</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="taskForm.invalid">
              {{ isEditMode ? 'Save Changes' : 'Create Task' }}
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .task-form-card {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90%;
      max-width: 500px;
      z-index: 1000;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      padding: 0;
      overflow: hidden;
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translate(-50%, -60%); }
      to { opacity: 1; transform: translate(-50%, -50%); }
    }

    .form-header {
      background-color: #6a5acd; /* Primary header color */
      color: white;
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .form-header mat-card-title {
      font-size: 1.25rem;
    }

    .close-btn {
      color: white;
      transition: transform 0.2s;
    }
    .close-btn:hover {
        transform: rotate(90deg);
    }
    
    mat-card-content {
      padding: 24px;
    }

    .task-form-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .form-actions {
      grid-column: 1 / -1;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 10px;
    }

    mat-form-field {
      width: 100%;
    }
    
    /* Responsive adjustment */
    @media (max-width: 600px) {
        .task-form-layout {
            grid-template-columns: 1fr;
        }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskFormComponent implements OnInit {
  private taskService = inject(TaskService);
  private fb = inject(FormBuilder);

  @Input() task: Task | null = null;
  // Output event to notify the parent to close the form
  @Output() closeForm = new EventEmitter<void>(); 

  taskForm!: FormGroup;
  isEditMode: boolean = false;

  taskStatuses = ['pending', 'in-progress', 'completed', 'on-hold'];
  taskPriorities = ['low', 'medium', 'high'];

  ngOnInit(): void {
    this.isEditMode = !!this.task;
    this.initForm();
  }

  private initForm(): void {
    this.taskForm = this.fb.group({
      id: [this.task?.id || null],
      title: [this.task?.title || '', Validators.required],
      description: [this.task?.description || ''],
      status: [this.task?.status || 'pending', Validators.required],
      priority: [this.task?.priority || 'medium', Validators.required],
      date: [this.task?.date || this.getCurrentDate(), Validators.required],
      // Inherit or set default hidden properties
      userId: [this.task?.userId || 1],
      isActive: [this.task?.isActive ?? true],
    });
  }

  private getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  saveTask(): void {
    if (this.taskForm.valid) {
      const taskData: Task = this.taskForm.value;

      if (this.isEditMode && taskData.id) {
        this.taskService.updateTask(taskData);
      } else {
        this.taskService.addTask(taskData);
      }
      // CRITICAL: Emit event to parent to close form after successful save
      this.closeForm.emit(); 
    }
  }
}
