import { Component, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms'; // Reactive Forms
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Task } from '../../../models/task.model';
import { TaskService } from '../../../services/task.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
  ],
  template: `
    <mat-card class="task-form-card">
      <mat-card-title class="form-title">{{ isEditMode ? 'Edit Task' : 'Add New Task' }}</mat-card-title>
      <mat-card-content>
        <form [formGroup]="taskForm" (ngSubmit)="saveTask()">
          
          <!-- Title -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Title</mat-label>
            <input matInput formControlName="title">
            <mat-error *ngIf="taskForm.get('title')?.hasError('required')">Title is required</mat-error>
          </mat-form-field>

          <!-- Description -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3"></textarea>
          </mat-form-field>
          
          <!-- Status & Priority -->
          <div class="form-row">
            <mat-form-field appearance="outline" class="flex-field">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status">
                <mat-option *ngFor="let s of statuses" [value]="s">{{ s | titlecase }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="flex-field">
              <mat-label>Priority</mat-label>
              <mat-select formControlName="priority">
                <mat-option *ngFor="let p of priorities" [value]="p">{{ p | titlecase }}</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          
          <!-- Date -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Due Date</mat-label>
            <input matInput type="date" formControlName="date"> 
            <mat-icon matSuffix>event</mat-icon>
            <mat-error *ngIf="taskForm.get('date')?.hasError('required')">Date is required</mat-error>
          </mat-form-field>
          
          <!-- Actions -->
          <div class="form-actions">
            <button mat-button type="button" (click)="close.emit()" class="cancel-btn">
                <mat-icon>close</mat-icon> Cancel
            </button>
            <button mat-flat-button color="primary" type="submit" [disabled]="taskForm.invalid" class="save-btn">
              <mat-icon>{{ isEditMode ? 'save' : 'add' }}</mat-icon>
              {{ isEditMode ? 'Update Task' : 'Create Task' }}
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    /* -----------------------------------------------------------------
       MODAL STYLES (MATCHING MAIN CARD AESTHETICS)
    ----------------------------------------------------------------- */
    .task-form-card {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90%;
      max-width: 550px;
      z-index: 1000;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 15px 30px rgba(0, 0, 0, 0.35); /* Deeper shadow for modal */
      border: 1px solid #ddd;
    }
    
    .form-title {
        font-size: 24px;
        font-weight: 600;
        color: #1e3c72;
        margin-bottom: 20px;
        text-align: center;
    }

    .full-width {
      width: 100%;
    }
    
    .form-row {
      display: flex;
      gap: 15px;
      width: 100%;
    }
    
    .flex-field {
      flex: 1;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 15px;
      margin-top: 25px;
    }
    
    .save-btn {
        font-weight: 600;
        padding: 10px 20px;
        border-radius: 8px;
    }
    
    .cancel-btn {
      color: #757575; /* Gray color */
      border: 1px solid #ccc;
      border-radius: 8px;
    }

    @media (max-width: 500px) {
        .form-row {
            flex-direction: column;
        }
        .form-actions {
            flex-direction: column-reverse;
            gap: 10px;
        }
        .form-actions button {
            width: 100%;
        }
    }
  `]
})
export class TaskFormComponent implements OnChanges {
  // --- Modern Angular Feature: `inject` ---
  // Inject services using the `inject` function instead of the constructor for cleaner code
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);

  @Input() task: Task | undefined;
  @Output() close = new EventEmitter<void>();

  taskForm!: FormGroup;
  isEditMode: boolean = false;

  statuses = ['pending', 'completed', 'on-hold', 'in-progress'];
  priorities = ['low', 'medium', 'high'];

  constructor() {
    this.createForm();
  }

  // Use ngOnChanges to react when the parent passes a new `task` object
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task'] && this.task) {
      // Edit Mode: Patch the form with the task details
      this.isEditMode = true;
      this.taskForm.patchValue(this.task);
    } else {
      // New Task Mode: Reset form to default values
      this.isEditMode = false;
      this.taskForm.reset(this.getDefaultTaskValues());
    }
  }

  private createForm(): void {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      status: ['pending', Validators.required],
      date: [this.getDefaultDate(), Validators.required],
      priority: ['medium', Validators.required],
      // Hidden controls for internal logic
      id: [null],
      userId: [1],
      isActive: [true],
    });
  }

  private getDefaultTaskValues() {
    return {
      title: '',
      description: '',
      status: 'pending',
      date: this.getDefaultDate(),
      priority: 'medium',
      id: null,
      userId: 1,
      isActive: true,
    };
  }

  private getDefaultDate(): string {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  }

  saveTask(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const taskData: Task = this.taskForm.value;

    if (this.isEditMode) {
      // Update: Use the existing ID from the form control
      this.taskService.updateTask(taskData);
    } else {
      // Add: ID is generated in the service to ensure uniqueness
      this.taskService.addTask(taskData);
    }

    this.close.emit();
  }
}