import React from 'react';

interface AnimatedBorderProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedBorder: React.FC<AnimatedBorderProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`relative p-[1px] overflow-hidden rounded-2xl group ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 opacity-75 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-x" />
      <div className="relative bg-slate-950 rounded-2xl h-full w-full">
        {children}
      </div>
    </div>
  );
};
