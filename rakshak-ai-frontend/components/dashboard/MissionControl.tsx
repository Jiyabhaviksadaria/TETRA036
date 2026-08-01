'use client';

import React from 'react';
import { SystemStatus } from '../../services/mockApi';
import { ShieldCheck, Cpu, Camera, Activity, BrainCircuit } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface MissionControlProps {
  status: SystemStatus;
}

export const MissionControl: React.FC<MissionControlProps> = ({ status }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const getIndicator = (
    val: string
  ) => {
    switch (val) {
      case 'safe':
      case 'active':
      case 'ready':
      case 'complete':
        return {
          isGreen: true,
          led: 'bg-[#22C55E] shadow-[0_0_10px_#22C55E]',
          label: val.toUpperCase(),
          text: 'text-[#4ADE80]',
          border: 'border-[#22C55E]/40 bg-[#22C55E]/10',
        };
      case 'caution':
      case 'analyzing':
        return {
          isGreen: false,
          led: 'bg-[#FACC15] shadow-[0_0_10px_#FACC15] animate-pulse',
          label: val.toUpperCase(),
          text: 'text-[#FACC15]',
          border: 'border-[#FACC15]/40 bg-[#FACC15]/10',
        };
      case 'alert':
      case 'detected':
      case 'critical':
      case 'standby':
      case 'waiting':
      case 'idle':
      default:
        return {
          isGreen: false,
          led: 'bg-[#EF4444] shadow-[0_0_10px_#EF4444] animate-pulse',
          label: val.toUpperCase(),
          text: 'text-[#EF4444]',
          border: 'border-[#EF4444]/40 bg-[#EF4444]/10',
        };
    }
  };

  const indicators = [
    { key: 'farm', title: 'FARM', icon: ShieldCheck, val: status.farm },
    { key: 'system', title: 'SYSTEM', icon: Cpu, val: status.system },
    { key: 'camera', title: 'CAMERA', icon: Camera, val: status.camera },
    { key: 'motion', title: 'MOTION', icon: Activity, val: status.motion },
    { key: 'ai', title: 'AI ENGINE', icon: BrainCircuit, val: status.ai },
  ];

  return (
    <div
      className={`sticky top-0 z-20 border-b px-4 py-2.5 transition-colors duration-300 font-mono text-xs ${
        isDark
          ? 'bg-[#163E2D]/95 border-[#246B49]/50 backdrop-blur-md text-[#F4F1E8] shadow-[0_4px_20px_rgba(14,40,28,0.6)]'
          : 'bg-[#0E281C] border-[#246B49] backdrop-blur-md text-white shadow-md'
      }`}
    >
      <div className="max-w-[1440px] mx-auto flex items-center justify-between overflow-x-auto gap-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        
        {/* Left Mission Control Badge */}
        <div className="flex items-center gap-2.5 pr-4 border-r border-[#246B49]/60 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#4ADE80] shadow-[0_0_8px_#4ADE80] animate-pulse" />
          <span className="font-display font-extrabold tracking-wider text-xs uppercase text-[#4ADE80]">
            MISSION CONTROL
          </span>
        </div>

        {/* 5 Distinct Feasible Status Tiles (Green = Active/Safe, Red = Standby/Alert) */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0 py-0.5">
          {indicators.map((ind, i) => {
            const Icon = ind.icon;
            const style = getIndicator(ind.val);
            return (
              <React.Fragment key={ind.key}>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${style.border} transition-all`}>
                  <Icon className="w-3.5 h-3.5 text-white/80" />
                  <span className="text-white/70 font-bold text-[11px]">{ind.title}:</span>
                  
                  {/* Glowing LED Light (Green for Active/Safe, Red for Standby/Alert) */}
                  <span className={`w-2.5 h-2.5 rounded-full ${style.led}`} />
                  
                  <span className={`font-black text-[11px] tracking-wider ${style.text}`}>
                    {style.label}
                  </span>
                </div>

                {i < indicators.length - 1 && (
                  <span className="text-white/20 font-bold hidden md:inline">|</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Real-time Telemetry Live Indicator */}
        <div className="hidden xl:flex items-center gap-2 pl-4 border-l border-[#246B49]/60 shrink-0 text-[11px] text-[#A3B8AD]">
          <span className="font-mono text-white/70">PULSE: 120Hz</span>
          <span className="font-bold text-[#4ADE80] flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-ping" />
            LIVE
          </span>
        </div>

      </div>
    </div>
  );
};
