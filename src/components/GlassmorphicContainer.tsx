import React from 'react';
import styles from './GlassmorphicContainer.module.css';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export const GlassmorphicContainer: React.FC<Props> = ({ children, className }) => {
  return (
    <div className={`${styles.container} ${className || ''}`}>
      {children}
    </div>
  );
};