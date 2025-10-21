import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
    private storageKey = 'tasks';

    // Get all tasks
    getTasks(): Task[] {
        const tasks = localStorage.getItem(this.storageKey);
        return tasks ? JSON.parse(tasks).filter((t: { isActive: any; }) => t.isActive) : [];
    }

    // Save all tasks
    saveTasks(tasks: Task[]): void {
        localStorage.setItem(this.storageKey, JSON.stringify(tasks));
    }

    // Add new task
    addTask(task: Task): void {
        const tasks = this.getTasks();
        tasks.push(task);
        this.saveTasks(tasks);
    }

    // Delete a task
    deleteTask(id: number): void {
        const tasks = this.getTasks();
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.isActive = false;
        }
        this.saveTasks(tasks);
    }

    // Update a task (e.g., status change)
    updateTask(updated: Task): void {
        const tasks = this.getTasks().map(t => (t.id === updated.id ? updated : t));
        this.saveTasks(tasks);
    }

}