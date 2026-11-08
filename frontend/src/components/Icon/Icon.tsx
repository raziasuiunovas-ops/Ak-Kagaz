import { CSSProperties } from 'react';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
  filled?: boolean; // Заполненная иконка (по умолчанию false для outlined)
}

export function Icon({ 
  name, 
  size = 24, 
  className = '', 
  style, 
  filled = false 
}: IconProps) {
  return (
    <span 
      className={`material-symbols-outlined ${className}`}
      style={{
        fontSize: `${size}px`,
        fontVariationSettings: filled 
          ? '"FILL" 1, "wght" 300, "GRAD" 0, "opsz" 24'
          : '"FILL" 0, "wght" 300, "GRAD" 0, "opsz" 24',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        ...style,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
