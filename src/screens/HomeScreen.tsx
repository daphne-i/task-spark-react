import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import {
  MdCleaningServices,
  MdNotes,
  MdDarkMode,
  MdLightMode,
  MdAdd,
} from 'react-icons/md';

import { db, type Task } from '../db/db';
import { useTaskStore } from '../store/taskStore';
import { useThemeStore } from '../theme/themeStore';

import { GlassmorphicContainer } from '../components/GlassmorphicContainer';
import { ModernProgressBar } from '../components/ModernProgressBar';
import { TaskListItem } from '../components/TaskListItem';
import { AddTaskScreen } from './AddTaskScreen';
import { ScratchPadScreen } from './ScratchPadScreen';

import styles from './HomeScreen.module.css';

// Helper function to map priority string to number for sorting
const priorityToSortNumber = (priority: Task['priority']): number => {
  switch (priority) {
    case 'High':
      return 3;
    case 'Medium':
      return 2;
    case 'Low':
    default:
      return 1;
  }
};

export const HomeScreen: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();
  const {
    activeCategoryFilter,
    setCategoryFilter,
    clearCompleted,
    showConfetti,
    resetConfetti,
  } = useTaskStore();

  const { width, height } = useWindowSize();

  // Modal State
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [isScratchPadOpen, setScratchPadOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Database Live Queries
  const categories = useLiveQuery(() => db.categories.toArray());

  const tasks = useLiveQuery(async () => {
    let query;

    if (activeCategoryFilter !== null) {
      query = db.tasks.where('categoryId').equals(activeCategoryFilter);
    } else {
      query = db.tasks.toCollection();
    }

    const filteredTasks = await query.toArray();

    // Apply multi-level sorting
    filteredTasks.sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
      if (a.dueDate && b.dueDate) {
        if (a.dueDate.getTime() !== b.dueDate.getTime()) {
          return a.dueDate.getTime() - b.dueDate.getTime();
        }
      } else if (a.dueDate) return -1;
      else if (b.dueDate) return 1;
      const priorityA = priorityToSortNumber(a.priority);
      const priorityB = priorityToSortNumber(b.priority);
      if (priorityA !== priorityB) return priorityB - priorityA;
      return (a.id ?? 0) - (b.id ?? 0);
    });

    return filteredTasks;
  }, [activeCategoryFilter]);

  // --- FIX: Updated Memoized Calculations ---
  const { progress, headerText } = useMemo(() => {
    const allTasks = tasks || [];
    const totalTasks = allTasks.length; // This is 'm'

    if (totalTasks === 0) {
      return {
        progress: 0,
        headerText: 'You have no tasks.',
      };
    }

    // Calculate total progress
    const completed = allTasks.filter((t) => t.isCompleted).length;
    const progressPercent = (completed / totalTasks) * 100;

    // Calculate pending today
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    
    const pendingTodayCount = allTasks.filter((t) => { // This is 'n'
      return (
        !t.isCompleted &&
        t.dueDate &&
        t.dueDate >= todayStart &&
        t.dueDate < tomorrowStart
      );
    }).length;

    // Build the exact string from home_screen.dart
    const headerText = `You have ${pendingTodayCount} task${pendingTodayCount === 1 ? '' : 's'} pending today, out of ${totalTasks} total task${totalTasks === 1 ? '' : 's'}.`;

    return {
      progress: progressPercent,
      headerText: headerText,
    };
  }, [tasks]);

  // Event Handlers
  const handleOpenEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const handleOpenNewTask = () => {
    setEditingTask(null);
    setTaskModalOpen(true);
  };

  const handleClearCompleted = () => {
    if (window.confirm('Are you sure you want to delete all completed tasks? This cannot be undone.')) {
      clearCompleted();
    }
  };

  return (
    <>
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={300}
          onConfettiComplete={resetConfetti}
        />
      )}

      <main className={styles.homeScreen}>
        <GlassmorphicContainer className={styles.mainContainer}>
          {/* 1. Header */}
          <header className={styles.header}>
            <div className={styles.headerText}>
              <h1>Hello!</h1>
              {/* --- FIX: Use the new headerText variable --- */}
              <p>{headerText}</p>
            </div>
            <button onClick={toggleTheme} className={`${styles.iconButton} ${styles.themeToggle}`} aria-label="Toggle theme">
              {theme === 'light' ? <MdDarkMode /> : <MdLightMode />}
            </button>
          </header>

          {/* 2. Progress Bar (This now shows total progress) */}
          <ModernProgressBar progress={progress} />

          {/* 3. Task List Header */}
          <div className={styles.taskListHeader}>
            <h2>Your Tasks</h2>
            <div className={styles.taskListActions}>
              <select
                className={styles.filterMenu}
                value={activeCategoryFilter ?? 'all'}
                onChange={(e) => {
                  const val = e.target.value;
                  setCategoryFilter(val === 'all' ? null : Number(val));
                }}
              >
                <option value="all">All</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <button
                onClick={handleClearCompleted}
                className={`${styles.iconButton} ${styles.clearButton}`}
                aria-label="Clear completed tasks"
              >
                <MdCleaningServices />
              </button>
              <button
                onClick={() => setScratchPadOpen(true)}
                className={styles.iconButton}
                aria-label="Open scratch pad"
              >
                <MdNotes />
              </button>
            </div>
          </div>

          {/* 4. Task List */}
          <div className={styles.taskList}>
            {tasks && tasks.length > 0 ? (
              tasks.map((task) => (
                <TaskListItem
                  key={task.id}
                  task={task}
                  onEdit={handleOpenEditTask}
                />
              ))
            ) : (
              <div className={styles.emptyState}>
                <p>No tasks found.</p>
                {activeCategoryFilter === null ? (
                   <p>Click the '+' button to add your first task!</p>
                ) : (
                   <p>No tasks match this filter.</p>
                )}
              </div>
            )}
          </div>
        </GlassmorphicContainer>

        {/* 5. Floating Action Button (FAB) */}
        <button onClick={handleOpenNewTask} className={styles.fab} aria-label="Add new task">
          <MdAdd />
        </button>

        {/* 6. Modals */}
        <AddTaskScreen
          isOpen={isTaskModalOpen}
          onClose={() => setTaskModalOpen(false)}
          editingTask={editingTask}
        />
        <ScratchPadScreen
          isOpen={isScratchPadOpen}
          onClose={() => setScratchPadOpen(false)}
        />
      </main>
    </>
  );
};