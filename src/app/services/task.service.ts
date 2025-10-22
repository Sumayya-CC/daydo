import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';
import { BehaviorSubject, Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TaskService {
    private storageKey = 'tasks';
    
    // BehaviorSubject holds the full list of tasks (active & inactive) internally
    private allTasksSubject = new BehaviorSubject<Task[]>(this.loadAllTasksFromStorage());
    
    // Public Observable: Components subscribe to this stream, which provides ONLY active tasks
    public tasks$: Observable<Task[]> = this.allTasksSubject.asObservable().pipe(
        map(tasks => tasks.filter(task => task.isActive))
    );

    constructor() { }

    // --- Private Storage/Initialization Methods ---

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
        this.allTasksSubject.next(updatedTasks); // Notify subscribers
    }

    // --- Public Mutator Methods (CRUD) ---

    addTask(task: Task): void {
        const currentTasks = this.allTasksSubject.getValue();
        this.updateState([...currentTasks, task]);
    }
    
    // Soft Delete
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

    // Clear All (Removes all tasks from storage and state)
    clearAllTasks(): void {
        localStorage.removeItem(this.storageKey);
        this.allTasksSubject.next([]);
    }

}