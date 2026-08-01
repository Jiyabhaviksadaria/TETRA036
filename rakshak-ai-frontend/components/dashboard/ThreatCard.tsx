import React from 'react';

export const ThreatCard: React.FC = () => {
  return (
    <div className="bg-slate-900/80 border border-red-500/30 rounded-xl p-5 shadow-lg shadow-red-500/5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-red-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          Active Threat Level
        </h3>
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-500/20 text-red-300">
          ELEVATED
        </span>
      </div>
      <div className="text-3xl font-extrabold text-white mb-2">Level 3 / 5</div>
      <p className="text-xs text-slate-400">
        Multiple unauthorized motion vectors flagged in Sector 4 North Perimeter.
      </p>
    </div>
  );
};
