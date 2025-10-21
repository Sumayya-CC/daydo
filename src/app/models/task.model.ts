export interface Task {
  id: number;
  title: string;
  status: 'pending' | 'completed' | 'on-hold' | 'in-progress';
  date: string;
  priority: 'low' | 'medium' | 'high';
  description?: string;
  isArchived: boolean;
}
