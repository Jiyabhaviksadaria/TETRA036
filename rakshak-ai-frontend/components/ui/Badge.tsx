import React from 'react';

interface BadgeProps {
  variant?: 'critical' | 'high' | 'medium' | 'low' | 'online' | 'offline';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'medium',
  children,
  className = '',
}) => {
  const styles = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    online: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    offline: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-md uppercase tracking-wider ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
