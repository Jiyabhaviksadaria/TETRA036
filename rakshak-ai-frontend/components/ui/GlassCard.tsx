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
      className={`relative backdrop-blur-xl bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-2xl transition-all duration-300 hover:border-cyan-500/30 ${
        glow ? 'shadow-cyan-500/10' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
