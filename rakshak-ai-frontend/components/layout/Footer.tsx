import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/60 bg-slate-950/80 px-6 py-4 text-center text-xs text-slate-500">
      © {new Date().getFullYear()} Rakshak AI Defense System • Powered by TETRA036
    </footer>
  );
};
