'use client';

import React from 'react';
import { AlertTriangle, Navigation, Clock, ShieldAlert, Target } from 'lucide-react';

export const ThreatCard: React.FC = () => {
  return (
    <div className="glass-card rounded-[24px] p-6 shadow-soft border-l-4 border-l-rakshak-danger border-rakshak-border space-y-4 relative overflow-hidden">
      
      {/* Header Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rakshak-danger animate-pulse" />
          <span className="text-xs font-mono font-bold text-rakshak-danger uppercase bg-red-50 px-3 py-1 rounded-full border border-red-200">
            Threat Level: Critical
          </span>
        </div>
        <span className="text-xs font-mono text-rakshak-secondaryText font-semibold">
          Conf: 94%
        </span>
      </div>

      {/* Animal Detected Header */}
      <div>
        <h3 className="font-sora text-xl font-bold text-rakshak-text flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rakshak-danger" />
          Wild Boar Intrusion Pack
        </h3>
        <p className="text-xs text-rakshak-secondaryText font-inter mt-1">
          4 Adult Wild Boars detected advancing from North Perimeter Wall.
        </p>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-3 gap-2 pt-2 text-center font-mono">
        <div className="bg-rakshak-secondaryBg p-2.5 rounded-2xl">
          <div className="flex items-center justify-center gap-1 text-rakshak-secondaryText text-[10px]">
            <Target className="w-3 h-3 text-rakshak-primary" />
            Distance
          </div>
          <p className="font-bold text-rakshak-text text-sm mt-0.5">120 m</p>
        </div>

        <div className="bg-rakshak-secondaryBg p-2.5 rounded-2xl">
          <div className="flex items-center justify-center gap-1 text-rakshak-secondaryText text-[10px]">
            <Navigation className="w-3 h-3 text-rakshak-primary" />
            Vector
          </div>
          <p className="font-bold text-rakshak-text text-sm mt-0.5">NW → Crop</p>
        </div>

        <div className="bg-rakshak-secondaryBg p-2.5 rounded-2xl">
          <div className="flex items-center justify-center gap-1 text-rakshak-secondaryText text-[10px]">
            <Clock className="w-3 h-3 text-rakshak-danger" />
            Est. Arrival
          </div>
          <p className="font-bold text-rakshak-danger text-sm mt-0.5">&lt; 2 min</p>
        </div>
      </div>

      {/* Target Zone Note */}
      <div className="pt-2 border-t border-rakshak-border flex items-center justify-between text-xs font-inter text-rakshak-secondaryText">
        <span>Target Sector: Sugarcane Field 4</span>
        <span className="font-mono text-[11px] text-rakshak-primary font-semibold">Zone B Perimeter</span>
      </div>

    </div>
  );
};
