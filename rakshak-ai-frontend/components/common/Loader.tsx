import React from 'react';

export const Loader: React.FC<{ message?: string }> = ({ message = 'Loading Rakshak AI...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-slate-400">
      <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mb-4" />
      <span className="text-sm font-medium tracking-wide">{message}</span>
    </div>
  );
};
