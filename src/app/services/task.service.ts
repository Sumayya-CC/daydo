import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';
import { BehaviorSubject, Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TaskService {
    private storageKey = 'tasks';

    // BehaviorSubject to hold the full list of tasks (active & inactive)
    private allTasksSubject = new BehaviorSubject<Task[]>(this.loadAllTasksFromStorage());

    // Public Observable: Provides ONLY active tasks for components
    public tasks$: Observable<Task[]> = this.allTasksSubject.asObservable().pipe(
        map(tasks => tasks.filter(task => task.isActive))
    );

    constructor() { }

    private loadAllTasksFromStorage(): Task[] {
        const tasks = localStorage.getItem(this.storageKey);
        const initialTasks: Task[] = tasks ? JSON.parse(tasks) : [];
        return initialTasks;
    }

    private saveAllTasks(tasks: Task[]): void {
        localStorage.setItem(this.storageKey, JSON.stringify(tasks));
    }

    private updateState(updatedTasks: Task[]): void {
        this.saveAllTasks(updatedTasks);
        this.allTasksSubject.next(updatedTasks); // Notify all subscribers
    }

    // --- Public Mutator Methods (CRUD) ---

    addTask(task: Task): void {
        const currentTasks = this.allTasksSubject.getValue();
        // Ensure a unique ID is assigned before updating the state
        const taskWithId = { ...task, id: Date.now() + Math.random() };
        this.updateState([...currentTasks, taskWithId]);
    }

    deleteTask(id: number): void {
        const currentTasks = this.allTasksSubject.getValue();
        const updatedTasks = currentTasks.map(t =>
            (t.id === id ? { ...t, isActive: false } : t)
        );
        this.updateState(updatedTasks);
    }

    updateTask(updated: Task): void {
        const currentTasks = this.allTasksSubject.getValue();
        const updatedTasks = currentTasks.map(t =>
            (t.id === updated.id ? updated : t)
        );
        this.updateState(updatedTasks);
    }

    clearAllTasks(): void {
        localStorage.removeItem(this.storageKey);
        this.allTasksSubject.next([]);
    }
}