import React from 'react';

export const LiveFeed: React.FC<{ cameraName?: string }> = ({
  cameraName = 'Sector 4 PTZ Feed',
}) => {
  return (
    <div className="relative aspect-video w-full rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center group shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60 z-10 pointer-events-none" />
      <span className="text-6xl text-slate-800 animate-pulse">🎥</span>

      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
        <span className="text-xs font-bold text-white tracking-wide uppercase bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded-md border border-slate-700">
          LIVE • {cameraName}
        </span>
      </div>

      <div className="absolute bottom-4 right-4 z-20 text-xs font-mono text-cyan-400 bg-slate-900/80 px-2.5 py-1 rounded border border-cyan-500/20">
        AI BOX DETECT: 98.2% CONFIDENCE
      </div>
    </div>
  );
};
