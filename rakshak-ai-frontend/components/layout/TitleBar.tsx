'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, ShieldCheck, Cpu, Camera, Activity, BrainCircuit } from 'lucide-react';
import { SystemStatus } from '../../services/mockApi';

interface TitleBarProps {
  status?: SystemStatus;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  status = {
    farm: 'safe',
    system: 'active',
    camera: 'standby',
    motion: 'waiting',
    ai: 'ready',
  },
}) => {
  const getLedColor = (val: string) => {
    switch (val) {
      case 'safe':
      case 'active':
      case 'ready':
      case 'complete':
        return 'bg-[#076653] shadow-[0_0_8px_#0C9276]';
      case 'alert':
      case 'detected':
      case 'critical':
        return 'bg-[#C43B2E] shadow-[0_0_8px_#C43B2E] animate-pulse';
      case 'caution':
      case 'analyzing':
        return 'bg-amber-400 shadow-[0_0_8px_#FBBF24]';
      case 'standby':
      case 'waiting':
      case 'idle':
      default:
        return 'bg-[#8AA294]';
    }
  };

  const statusTiles = [
    { label: 'Farm Status', icon: ShieldCheck, val: status.farm },
    { label: 'System Node', icon: Cpu, val: status.system },
    { label: 'Camera Feed', icon: Camera, val: status.camera },
    { label: 'Motion Sensors', icon: Activity, val: status.motion },
    { label: 'AI Decision Engine', icon: BrainCircuit, val: status.ai },
  ];

  return (
    <header className="h-[64px] bg-[#FFFFFF] border-b border-[#DCE8B8] px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm font-sans">
      
      {/* Left Brand Mark */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="w-9 h-9 rounded-xl bg-[#076653] text-[#E3EF26] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
          <Shield className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div className="flex flex-col leading-none">
          <div className="font-extrabold text-lg text-[#06231D] tracking-tight">
            Rakshak <span className="text-[#076653]">AI</span>
          </div>
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#4C6B5C] uppercase mt-0.5">
            FARM SENTINEL
          </span>
        </div>
      </Link>

      {/* Right Compact Status Tiles (No text labels, icon + LED dot, hover tooltip) */}
      <div className="flex items-center gap-2.5">
        <span className="text-[11px] font-bold text-[#076653] uppercase tracking-wider hidden sm:inline mr-2">
          STATUS MONITOR:
        </span>

        {statusTiles.map((tile) => {
          const Icon = tile.icon;
          const ledClass = getLedColor(tile.val);

          return (
            <div key={tile.label} className="relative group">
              {/* Tile Button / Box */}
              <div className="w-10 h-10 rounded-lg bg-[#F2F8DC] border border-[#DCE8B8] flex items-center justify-center text-[#06231D] relative transition-all group-hover:border-[#076653] cursor-pointer">
                <Icon className="w-4 h-4 text-[#076653]" />

                {/* Corner LED Indicator Dot */}
                <span className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full border border-white ${ledClass}`} />
              </div>

              {/* Hover Tooltip */}
              <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-[#0C342C] text-white text-[11px] font-mono px-2.5 py-1 rounded shadow-md whitespace-nowrap z-50 pointer-events-none">
                {tile.label}: <span className="font-bold text-[#E3EF26] uppercase">{tile.val}</span>
              </div>
            </div>
          );
        })}
      </div>

    </header>
  );
};
