import React from 'react';

export const RecommendationCard: React.FC = () => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
      <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-2">
        💡 AI Recommendation
      </h3>
      <p className="text-sm text-slate-200 mb-4">
        Deploy drone patrol 02 to Sector 4 and adjust PTZ camera zoom to inspect perimeter fence marker B-12.
      </p>
      <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold text-xs rounded-lg border border-cyan-500/20 transition-colors">
        Execute Recommendation
      </button>
    </div>
  );
};
