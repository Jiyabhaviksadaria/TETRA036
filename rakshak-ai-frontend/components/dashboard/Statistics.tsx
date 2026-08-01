import React from 'react';

export const Statistics: React.FC = () => {
  const stats = [
    { label: 'Active Cameras', value: '48/50', change: '+2 online', icon: '📹' },
    { label: 'Detections (24h)', value: '1,284', change: '-12% vs yesterday', icon: '⚡' },
    { label: 'AI Accuracy', value: '99.4%', change: 'Optimal model v4.2', icon: '🎯' },
    { label: 'Avg Response', value: '1.2s', change: 'Real-time pipeline', icon: '⏱️' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 transition-all hover:border-slate-700"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>{stat.label}</span>
            <span className="text-base">{stat.icon}</span>
          </div>
          <div className="text-2xl font-black text-white">{stat.value}</div>
          <div className="text-[11px] text-cyan-400 font-medium mt-1">
            {stat.change}
          </div>
        </div>
      ))}
    </div>
  );
};
