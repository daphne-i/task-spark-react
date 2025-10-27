import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import DatePicker from 'react-datepicker';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTaskStore } from '../store/taskStore';
import {
  db,
  type Task,
  type Category,
  type TaskPriority,
  type RecurringFrequency,
} from '../db/db';

import 'react-datepicker/dist/react-datepicker.css';
import './ModalStyles.css';
import styles from './AddTaskScreen.module.css';

Modal.setAppElement('#root');

type Props = {
  isOpen: boolean;
  onClose: () => void;
  editingTask: Task | null;
};

const priorityMap: Record<TaskPriority, { label: string; color: string }> = {
  Low: { label: 'Low', color: '#57E88D' },
  Medium: { label: 'Medium', color: '#F3E566' },
  High: { label: 'High', color: '#FF6F61' },
};

const frequencyOptions: RecurringFrequency[] = [
  'Daily',
  'Weekly',
  'Monthly',
  'Quarterly',
  'Half-Yearly',
  'Yearly',
];

export const AddTaskScreen: React.FC<Props> = ({ isOpen, onClose, editingTask }) => {
  // --- Form State ---
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  
  const [setDeadline, setSetDeadline] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<RecurringFrequency>('Daily'); // Default

  const { addTask, updateTask, deleteTask } = useTaskStore();
  const categories = useLiveQuery(() => db.categories.toArray(), []);

  // --- Effect to pre-fill form ---
  useEffect(() => {
    if (editingTask) {
      // Editing
      setTitle(editingTask.title);
      setNotes(editingTask.notes || '');
      setPriority(editingTask.priority);
      setCategoryId(editingTask.categoryId);
      setDueDate(editingTask.dueDate ? new Date(editingTask.dueDate) : null);
      setSetDeadline(!!editingTask.dueDate);
      setIsRecurring(editingTask.recurring !== 'None');
      setFrequency(editingTask.recurring !== 'None' ? editingTask.recurring : 'Daily');
    } else {
      // Creating
      setTitle('');
      setNotes('');
      setPriority('Medium');
      setCategoryId(categories?.[0]?.id);
      setDueDate(null);
      setSetDeadline(false);
      setIsRecurring(false);
      setFrequency('Daily');
    }
  }, [editingTask, isOpen, categories]);

  // If "Make Recurring" is turned on, force "Set Deadline" to also be on
  useEffect(() => {
    if (isRecurring) {
      setSetDeadline(true);
    }
  }, [isRecurring]);

  // --- Handlers ---
  const handleSave = async () => {
    if (!title) {
      alert('Please enter a title');
      return;
    }
    if (!categoryId) {
      alert('Please select a category');
      return;
    }
    
    // Final frequency based on toggle
    const finalFrequency = isRecurring ? frequency : 'None';
    
    // --- FIX: Change 'dueDate' to 'dueDate || undefined' ---
    // This converts `null` to `undefined`, satisfying the type.
    const finalDueDate = setDeadline ? (dueDate || undefined) : undefined;

    // Check if recurring is set without a due date
    if (finalFrequency !== 'None' && !finalDueDate) {
      alert('Please set a due date for recurring tasks.');
      return;
    }

    const taskData: Omit<Task, 'id' | 'isCompleted'> = {
      title,
      notes,
      priority,
      categoryId,
      dueDate: finalDueDate, // This line is now type-safe
      recurring: finalFrequency,
    };

    try {
      if (editingTask) {
        await updateTask(editingTask.id!, taskData);
      } else {
        await addTask(taskData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save task:', error);
      alert('Failed to save task.');
    }
  };

  const handleDelete = async () => {
    if (editingTask && window.confirm(`Are you sure you want to delete "${editingTask.title}"?`)) {
      try {
        await deleteTask(editingTask.id!);
        onClose();
      } catch (error) {
        console.error('Failed to delete task:', error);
        alert('Failed to delete task.');
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal-content"
      overlayClassName="modal-overlay"
      closeTimeoutMS={300}
    >
      <div className="modal-header">
        <h2>{editingTask ? 'Edit Task' : 'New Task'}</h2>
        <button onClick={handleSave} className="modal-save-btn">
          Save
        </button>
      </div>

      <div className={styles.formContent}>
        <input
          type="text"
          className={styles.formInput}
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        
        <textarea
          className={styles.formTextarea}
          placeholder="Notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {/* --- Category Dropdown --- */}
        <div className={styles.formGroup}>
          <label htmlFor="category-select">Category</label>
          <select
            id="category-select"
            className={styles.formInput}
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
          >
            <option value="">Select Category</option>
            {categories?.map((cat: Category) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* --- Priority Buttons --- */}
        <div className={styles.formGroup}>
          <label>Priority</label>
          <div className={styles.buttonContainer}>
            {(Object.keys(priorityMap) as TaskPriority[]).map((key) => (
              <button
                key={key}
                onClick={() => setPriority(key)}
                className={`${styles.formButton} ${
                  priority === key ? styles.buttonSelected : ''
                }`}
                style={{
                  '--button-color': priorityMap[key].color,
                } as React.CSSProperties}
              >
                {priorityMap[key].label}
              </button>
            ))}
          </div>
        </div>
        
        {/* --- Deadline & Recurring Toggles --- */}
        <div className={styles.toggleRow}>
          <label htmlFor="deadline-toggle">Set Deadline</label>
          <input
            type="checkbox"
            id="deadline-toggle"
            className={styles.toggleSwitch}
            checked={setDeadline}
            // Cannot turn off deadline if recurring is on
            onChange={() => setSetDeadline(!setDeadline)}
            disabled={isRecurring}
          />
        </div>

        {/* --- Conditionally render Date Picker --- */}
        {setDeadline && (
          <div className={styles.formGroup}>
            <DatePicker
              id="date-picker"
              selected={dueDate}
              onChange={(date: Date | null) => setDueDate(date)}
              className={styles.formInput}
              placeholderText="Select date"
              isClearable
              dateFormat="MM/dd/yyyy"
            />
          </div>
        )}
        
        <div className={styles.toggleRow}>
          <label htmlFor="recurring-toggle">Make Recurring</label>
          <input
            type="checkbox"
            id="recurring-toggle"
            className={styles.toggleSwitch}
            checked={isRecurring}
            onChange={() => setIsRecurring(!isRecurring)}
          />
        </div>

        {/* --- Conditionally render Frequency Grid --- */}
        {isRecurring && (
          <div className={styles.formGroup}>
            <label>Frequency</label>
            <div className={`${styles.buttonContainer} ${styles.gridContainer}`}>
              {frequencyOptions.map((key) => (
                <button
                  key={key}
                  onClick={() => setFrequency(key)}
                  className={`${styles.formButton} ${styles.gridButton} ${
                    frequency === key ? styles.buttonSelected : ''
                  }`}
                  style={{
                    '--button-color': 'var(--grad-color-3)',
                  } as React.CSSProperties}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        )}

        {editingTask && (
          <button onClick={handleDelete} className={styles.deleteButton}>
            Delete Task
          </button>
        )}
      </div>
    </Modal>
  );
};