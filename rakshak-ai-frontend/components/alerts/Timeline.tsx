import React from 'react';

export const Timeline: React.FC = () => {
  const events = [
    { time: '11:15 AM', title: 'Intrusion Alert Tripped', sector: 'Sector 4' },
    { time: '11:14 AM', title: 'PTZ Camera Locked Target', sector: 'Cam 01' },
    { time: '11:10 AM', title: 'AI Model Sector Scan Finished', sector: 'System' },
  ];

  return (
    <div className="relative pl-6 border-l-2 border-slate-800 space-y-6">
      {events.map((evt, idx) => (
        <div key={idx} className="relative">
          <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-cyan-400 border-4 border-slate-950" />
          <div className="text-xs text-cyan-400 font-mono">{evt.time}</div>
          <div className="text-sm font-semibold text-slate-200 mt-0.5">
            {evt.title}
          </div>
          <div className="text-xs text-slate-500">{evt.sector}</div>
        </div>
      ))}
    </div>
  );
};
