import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glow = false,
}) => {
  return (
    <div
      className={`glass-card rounded-[24px] p-6 shadow-soft border border-rakshak-border transition-all duration-300 ${
        glow ? 'shadow-glow border-rakshak-accent/50' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
