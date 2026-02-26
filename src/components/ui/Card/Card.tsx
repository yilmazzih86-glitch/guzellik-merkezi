import React from 'react';
import styles from './Card.module.css';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean; // Tıklanabilir efektini açıp kapatmak için
  selected?: boolean;    // Seçili durum çerçevesi için
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  interactive = false,
  selected = false,
  style,
  ...props 
}) => {
  // Koşullu sınıfları güvenli bir şekilde birleştiriyoruz
  const rootClass = [
    styles.card,
    interactive ? styles.interactive : '',
    selected ? styles.selected : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={rootClass} style={style} {...props}>
      {children}
    </div>
  );
};