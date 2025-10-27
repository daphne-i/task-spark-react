import styles from './ModernProgressBar.module.css';

type Props = {
  progress: number; // A value between 0 and 100
};

export const ModernProgressBar: React.FC<Props> = ({ progress }) => {
  return (
    <div className={styles.barContainer}>
      <div 
        className={styles.barFill} 
        style={{ width: `${progress}%` }} 
      />
    </div>
  );
};