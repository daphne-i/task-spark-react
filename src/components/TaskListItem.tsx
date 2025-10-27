import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Task, type TaskPriority } from '../db/db';
import { useTaskStore } from '../store/taskStore';

import styles from './TaskListItem.module.css'; // We will create this

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

// This is the correct function signature
export const TaskListItem: React.FC<Props> = ({ task, onEdit }) => {
  const { deleteTask, toggleTaskCompleted, triggerConfetti } = useTaskStore();

  // Fetch the category name for this task
  // This will update automatically if the category ever changes
  const category = useLiveQuery(
    () => db.categories.get(task.categoryId),
    [task.categoryId]
  );

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent the 'onEdit' click from firing when checking the box
    e.stopPropagation(); 
    
    // Trigger confetti *before* toggling, if task is being completed
    if (!task.isCompleted) {
      triggerConfetti();
    }
    toggleTaskCompleted(task.id!, task.isCompleted);
  };

  const handleDelete = (e: React.MouseEvent) => {
    // Prevent the 'onEdit' click from firing on right-click/long-press
    e.stopPropagation();
    e.preventDefault(); // Prevent context menu
    
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      deleteTask(task.id!);
    }
  };
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(task);
  }

  // --- This is the fix. We MUST return JSX ---
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
        onClick={(e) => e.stopPropagation()} // Stop click from bubbling to the div
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
          {/* Format the subtitle just like the Flutter app */}
          {task.priority}
          {category ? ` • ${category.name}` : ''}
          {task.dueDate ? ` • Due: ${task.dueDate.toLocaleDateString()}` : ''}
        </span>
      </div>
      
      {/* Edit Button */}
      <button className={styles.editButton} onClick={handleEdit}>
        {/* You can use an SVG icon here later */}
        Edit
      </button>
    </div>
  );
};