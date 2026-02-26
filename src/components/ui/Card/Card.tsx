import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties; // <-- style özelliğini (prop) buraya ekledik
}

export const Card: React.FC<CardProps> = ({ children, className = '', style }) => {
  return (
    <div className={`${styles.card} ${className}`.trim()} style={style}>
      {children}
    </div>
  );
};