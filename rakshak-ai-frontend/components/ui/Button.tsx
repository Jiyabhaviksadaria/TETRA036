import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseStyle =
    'inline-flex items-center justify-center font-sora font-semibold transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 shadow-soft';

  const variants = {
    primary:
      'bg-rakshak-primary hover:bg-rakshak-primary/90 text-white hover:shadow-glow focus:ring-rakshak-primary',
    secondary:
      'glass-card text-rakshak-text border border-rakshak-border hover:bg-white focus:ring-rakshak-border',
    danger:
      'bg-rakshak-danger text-white hover:bg-rakshak-danger/90 hover:shadow-glow-danger focus:ring-rakshak-danger',
    ghost:
      'bg-transparent text-rakshak-secondaryText hover:text-rakshak-text hover:bg-rakshak-secondaryBg focus:ring-rakshak-border',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
