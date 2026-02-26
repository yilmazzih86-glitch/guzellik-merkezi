'use client';

import React, { useState } from 'react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    // Dinamik sınıfları belirliyoruz
    const wrapperClasses = [
      styles.wrapper,
      isFocused ? styles.wrapperFocus : '',
      error ? styles.wrapperError : '',
      className
    ].filter(Boolean).join(' ');

    const inputClasses = [
      styles.input,
      error ? styles.inputError : ''
    ].filter(Boolean).join(' ');

    return (
      <div className={wrapperClasses}>
        <label className={styles.label}>{label}</label>
        <input 
          ref={ref}
          className={inputClasses} 
          onFocus={(e) => {
            setIsFocused(true);
            if (onFocus) onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            if (onBlur) onBlur(e);
          }}
          {...props} 
        />
        {error && <span className={styles.errorText}>{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';