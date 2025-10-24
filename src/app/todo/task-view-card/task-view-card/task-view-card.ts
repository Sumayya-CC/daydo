import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Task } from '../../../models/task.model';

@Component({
  selector: 'app-task-view-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    TitleCasePipe,
  ],
  template: `
    <mat-card class="task-item-card">
      <mat-card-content class="task-content">
        <div class="task-details">
          <span class="task-title">{{ task.title }}</span>
          <p class="task-description">{{ task.description || 'No description provided.' }}</p>
          
          <!-- Task Meta (Chips/Badges) -->
          <div class="task-meta">
            <!-- Status Chip -->
            <span class="meta-chip status-chip" [ngClass]="'status-' + task.status">
              {{ task.status | titlecase }} 
            </span>
            <!-- Priority Chip -->
            <span class="meta-chip priority-chip" [ngClass]="'priority-' + task.priority">
              Priority: {{ task.priority | titlecase }}
            </span>
            <span class="task-date">Due: {{ task.date }}</span>
          </div>
        </div>
        
        <div class="task-actions">
          <button mat-icon-button color="primary" (click)="editTask.emit(task)" title="Edit Task" class="edit-btn">
            <mat-icon>edit</mat-icon>
          </button>
          <button mat-icon-button color="warn" (click)="deleteTask.emit(task.id)" title="Delete Task" class="delete-btn">
            <mat-icon>delete</mat-icon>
          </button>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    /* -----------------------------------------------------------------
       TASK LIST ITEMS (Styles moved from todo.css)
    ----------------------------------------------------------------- */
    .task-item-card {
        margin-bottom: 12px;
        padding: 15px 20px;
        border-radius: 10px;
        border-left: 5px solid #2a5298; /* Feature border */
        transition: all 0.2s ease-in-out;
    }

    /* Subtle Hover Effect */
    .task-item-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
    }

    .task-content {
        display: flex;
        justify-content: space-between;
        align-items: center; /* Align content vertically */
        padding: 0 !important; 
    }

    .task-details {
        display: flex;
        flex-direction: column;
        align-items: flex-start; 
        gap: 8px;
        flex-grow: 1;
        margin-right: 20px;
    }

    .task-title {
        font-weight: 600;
        font-size: 19px;
        color: #333;
        margin: 0;
    }

    .task-description {
        font-size: 14px;
        color: #6c757d;
        margin: 0;
    }

    .task-meta {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .task-date {
        font-size: 13px;
        color: #999;
        font-style: italic;
    }

    /* Meta Chips (Status and Priority) */
    .meta-chip {
        padding: 5px 10px;
        border-radius: 15px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        min-width: 60px;
        text-align: center;
        white-space: nowrap; /* Prevent wrap inside chip */
    }

    /* Status Colors */
    .status-completed {
        background-color: #e8f5e9;
        color: #388e3c;
    }

    .status-pending {
        background-color: #fffde7;
        color: #fbc02d;
    }

    .status-on-hold {
        background-color: #f5f5f5;
        color: #757575;
    }

    .status-in-progress {
        background-color: #e3f2fd;
        color: #1976d2;
    }

    /* Priority Colors */
    .priority-high {
        background-color: #fbebeb;
        color: #d32f2f;
    }

    .priority-medium {
        background-color: #fff8e1;
        color: #f57f17;
    }

    .priority-low {
        background-color: #e1f5fe;
        color: #0288d1;
    }

    /* Task Actions */
    .task-actions {
      display: flex;
      gap: 5px;
      margin-left: 15px;
    }
    
    .task-actions button {
        transition: transform 0.1s;
    }

    .task-actions button:hover {
        transform: scale(1.1);
    }

    /* Responsive adjustments for the card content */
    @media (max-width: 600px) {
        .task-content {
            flex-direction: column;
            align-items: stretch;
        }

        .task-actions {
            margin-left: 0;
            margin-top: 10px;
            justify-content: flex-end;
        }

        .task-details {
            margin-right: 0;
        }

        .task-meta {
            flex-wrap: wrap;
            margin-top: 5px;
        }
    }
  `]
})
export class TaskViewCardComponent {
  // Input: The task data object
  @Input({ required: true }) task!: Task;
  
  // Output: Emits the task object when the edit button is clicked
  @Output() editTask = new EventEmitter<Task>();
  
  // Output: Emits the task ID when the delete button is clicked
  @Output() deleteTask = new EventEmitter<number>();
}
