import React from 'react';
import { Camera } from '@/types/camera';
import { Badge } from '@/components/ui/Badge';

export const CameraCard: React.FC<{ camera: Camera }> = ({ camera }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden hover:border-cyan-500/40 transition-all duration-300">
      <div className="relative h-40 bg-slate-950 flex items-center justify-center border-b border-slate-800">
        <span className="text-4xl text-slate-700">📹</span>
        <div className="absolute top-3 right-3">
          <Badge variant={camera.status === 'online' ? 'online' : 'critical'}>
            {camera.status}
          </Badge>
        </div>
        <div className="absolute bottom-2 left-3 text-[10px] bg-slate-900/80 px-2 py-0.5 rounded text-slate-400 font-mono">
          {camera.resolution} • {camera.fps} FPS
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-semibold text-slate-100">{camera.name}</h4>
        <p className="text-xs text-slate-400 mt-1">{camera.location}</p>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-3">
          <span>IP: {camera.ipAddress}</span>
          <span className="text-cyan-400 font-medium">Live Feed →</span>
        </div>
      </div>
    </div>
  );
};
