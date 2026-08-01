import React from 'react';

export const WeatherCard: React.FC = () => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
          Sector Environment
        </span>
        <span className="text-xl">🌙</span>
      </div>
      <div className="text-2xl font-bold text-white mb-1">24°C • Clear Night</div>
      <div className="flex justify-between text-xs text-slate-400 mt-3 pt-2 border-t border-slate-800">
        <span>Wind: 8 km/h</span>
        <span>Visibility: 98%</span>
      </div>
    </div>
  );
};
