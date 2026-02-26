import React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  className = '',
  disabled,
  ...props 
}) => {
  const rootClass = `${styles.btn} ${styles[variant]} ${styles[size]} ${className}`.trim();

  return (
    <button className={rootClass} disabled={disabled || isLoading} {...props}>
      {isLoading ? 'Lütfen bekleyin...' : children}
    </button>
  );
};