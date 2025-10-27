import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Task, type TaskPriority } from '../db/db';
import { useTaskStore } from '../store/taskStore';
// --- 1. Import the Edit icon ---
import { MdEdit } from 'react-icons/md';

import styles from './TaskListItem.module.css';

// Define priority colors
const priorityColors: Record<TaskPriority, string> = {
  Low: '#57E88D',
  Medium: '#F3E566',
  High: '#FF6F61',
};

type Props = {
  task: Task;
  onEdit: (task: Task) => void;
};

export const TaskListItem: React.FC<Props> = ({ task, onEdit }) => {
  const { deleteTask, toggleTaskCompleted, triggerConfetti } = useTaskStore();

  const category = useLiveQuery(
    () => db.categories.get(task.categoryId),
    [task.categoryId]
  );

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); 
    
    if (!task.isCompleted) {
      triggerConfetti();
    }
    toggleTaskCompleted(task.id!, task.isCompleted);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault(); 
    
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      deleteTask(task.id!);
    }
  };
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(task);
  }

  return (
    <div
      className={styles.listItem}
      onClick={() => onEdit(task)} // Click anywhere to edit
      onContextMenu={handleDelete} // Right-click to delete
    >
      {/* Priority Bar */}
      <div
        className={styles.priorityBar}
        style={{ backgroundColor: priorityColors[task.priority] }}
      />

      {/* Checkbox */}
      <input
        type="checkbox"
        className={styles.checkbox}
        checked={task.isCompleted}
        onChange={handleToggle}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Task Text Content */}
      <div className={styles.textContainer}>
        <span
          className={styles.title}
          style={{
            textDecoration: task.isCompleted ? 'line-through' : 'none',
            opacity: task.isCompleted ? 0.5 : 1,
          }}
        >
          {task.title}
        </span>
        <span className={styles.subtitle}>
          {task.priority}
          {category ? ` • ${category.name}` : ''}
          {task.dueDate ? ` • Due: ${task.dueDate.toLocaleDateString()}` : ''}
        </span>
      </div>
      
      {/* --- 2. Replace the text button with an icon button --- */}
      <button
        className={styles.editButton}
        onClick={handleEdit}
        aria-label="Edit task"
      >
        <MdEdit />
      </button>
    </div>
  );
};