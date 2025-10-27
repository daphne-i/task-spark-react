import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db, type Task, type RecurringFrequency } from '../db/db';

type NewTaskData = Omit<Task, 'id' | 'isCompleted'>;

// --- Helper function to calculate next due date ---
function getNextDueDate(
  currentDate: Date,
  frequency: RecurringFrequency
): Date {
  const nextDate = new Date(currentDate.getTime());
  switch (frequency) {
    case 'Daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'Weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'Monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'Quarterly':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case 'Half-Yearly':
      nextDate.setMonth(nextDate.getMonth() + 6);
      break;
    case 'Yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
  }
  return nextDate;
}

type TaskStore = {
  // Actions
  addTask: (data: NewTaskData) => Promise<void>;
  updateTask: (id: number, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  toggleTaskCompleted: (id: number, currentStatus: boolean) => Promise<void>;
  clearCompleted: () => Promise<void>;
  
  // State
  activeCategoryFilter: number | null;
  setCategoryFilter: (id: number | null) => void;
  
  scratchPadText: string;
  setScratchPadText: (text: string) => void;

  // Confetti
  showConfetti: boolean;
  triggerConfetti: () => void;
  resetConfetti: () => void;
};

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      // --- Actions Implementation ---
      addTask: async (data) => {
        const newTask: Task = {
          ...data,
          isCompleted: false,
          notes: data.notes || '',
          priority: data.priority || 'Medium',
          recurring: data.recurring || 'None',
        };
        await db.tasks.add(newTask);
      },
      updateTask: async (id, updates) => {
        await db.tasks.update(id, updates);
      },
      deleteTask: async (id) => {
        await db.tasks.delete(id);
      },
      
      toggleTaskCompleted: async (id, currentStatus) => {
        // If we are marking a task as *complete* (not incomplete)
        if (!currentStatus) {
          const task = await db.tasks.get(id);
          
          // Check if it's a recurring task with a due date
          if (task && task.recurring !== 'None' && task.dueDate) {
            
            // 1. Calculate the next due date
            const nextDueDate = getNextDueDate(task.dueDate, task.recurring);
            
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: _id, ...taskWithoutId } = task; // Destructure 'id' out
            
            // 2. Create the new, uncompleted task
            const newTask: Task = {
              ...taskWithoutId,
              dueDate: nextDueDate,
              isCompleted: false,
            };
            
            await db.tasks.add(newTask);

            // 3. Update the *old* task to be complete AND non-recurring
            await db.tasks.update(id, {
              isCompleted: true,
              recurring: 'None', // Stop it from recurring again
            });
            return; // Exit
          }
        }
        
        // --- Fallback for non-recurring tasks ---
        await db.tasks.update(id, { isCompleted: !currentStatus });
      },
      
      // --- FIX: This is a more robust way to delete ---
      // It filters all tasks where isCompleted is true, then deletes them.
      clearCompleted: async () => {
        await db.tasks.filter(task => task.isCompleted === true).delete();
      },
      
      // --- State Implementation ---
      activeCategoryFilter: null,
      setCategoryFilter: (id) => set({ activeCategoryFilter: id }),

      scratchPadText: '',
      setScratchPadText: (text) => set({ scratchPadText: text }),

      // --- Confetti Implementation ---
      showConfetti: false,
      triggerConfetti: () => set({ showConfetti: true }),
      resetConfetti: () => set({ showConfetti: false }),
    }),
    {
      name: 'task-store-storage',
      partialize: (state) => ({ 
        activeCategoryFilter: state.activeCategoryFilter,
        scratchPadText: state.scratchPadText 
      }),
    }
  )
);