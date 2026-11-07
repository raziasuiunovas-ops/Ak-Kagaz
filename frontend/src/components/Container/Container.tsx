import { ReactNode } from 'react';
import styles from './Container.module.css';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'default' | 'narrow' | 'wide';
}

export function Container({ children, className = '', size = 'default' }: ContainerProps) {
  const sizeClass = size === 'narrow' ? styles.narrow : size === 'wide' ? styles.wide : styles.default;
  
  return (
    <div className={`${styles.container} ${sizeClass} ${className}`}>
      {children}
    </div>
  );
}
