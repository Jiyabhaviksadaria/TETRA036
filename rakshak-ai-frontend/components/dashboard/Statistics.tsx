'use client';

import React from 'react';
import { Camera, Zap, ShieldCheck, Clock } from 'lucide-react';

export const Statistics: React.FC = () => {
  const stats = [
    { label: 'Active Cameras', value: '8 / 8', change: '100% Online', icon: Camera },
    { label: 'Detections (24h)', value: '14', change: 'Boar & Nilgai', icon: Zap },
    { label: 'AI Accuracy', value: '98.7%', change: 'YOLOv8 Vision Node', icon: ShieldCheck },
    { label: 'Avg Response', value: '3.4s', change: 'Automated Sirens', icon: Clock },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={idx}
            className="glass-card rounded-[24px] p-5 shadow-soft border border-rakshak-border transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between text-rakshak-secondaryText text-xs font-mono font-semibold mb-2">
              <span>{stat.label}</span>
              <div className="w-8 h-8 rounded-xl bg-rakshak-secondaryBg text-rakshak-primary flex items-center justify-center">
                <IconComponent className="w-4 h-4" />
              </div>
            </div>
            <div className="font-mono text-2xl font-extrabold text-rakshak-text">{stat.value}</div>
            <div className="text-[11px] text-rakshak-primary font-mono font-semibold mt-1">
              {stat.change}
            </div>
          </div>
        );
      })}
    </div>
  );
};
