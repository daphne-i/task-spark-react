import Dexie, { type Table } from 'dexie';

// Define interfaces for your data
export interface Category {
  id?: number;
  name: string;
  color: string;
}

export type TaskPriority = 'Low' | 'Medium' | 'High';
// --- FIX: Add all recurring frequencies ---
export type RecurringFrequency =
  | 'None'
  | 'Daily'
  | 'Weekly'
  | 'Monthly'
  | 'Quarterly'
  | 'Half-Yearly'
  | 'Yearly';

export interface Task {
  id?: number;
  title: string;
  notes: string;
  priority: TaskPriority;
  categoryId: number;
  dueDate?: Date;
  isCompleted: boolean;
  recurring: RecurringFrequency;
}

export class AppDB extends Dexie {
  tasks!: Table<Task>;
  categories!: Table<Category>;

  constructor() {
    super('TaskSparkleDB');
    this.version(1).stores({
      categories: '++id, name',
      tasks: '++id, title, categoryId, isCompleted, dueDate',
    });
    
    this.on('populate', this.populateDatabase);
  }

  populateDatabase = async () => {
    const defaultCategories: Category[] = [
      { name: 'Work', color: '#FF6F61' },
      { name: 'Home', color: '#6B5B95' },
      { name: 'Shopping', color: '#88B04B' },
      { name: 'Personal', color: '#F7CAC9' },
    ];
    await this.categories.bulkAdd(defaultCategories);
  }
}

export const db = new AppDB();

db.open().catch((err) => {
  console.error('Failed to open db: ' + (err.stack || err));
});