'use client';

import React from 'react';
import { Sun, Wind, Droplets, Eye, CloudRain } from 'lucide-react';

export const WeatherCard: React.FC = () => {
  return (
    <div className="glass-card rounded-[24px] p-6 shadow-soft border border-rakshak-border space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-rakshak-text font-sora font-bold text-sm">
          <Sun className="w-4 h-4 text-amber-500" />
          Field Micro-Climate Telemetry
        </div>
        <span className="text-[11px] font-mono text-rakshak-secondaryText bg-rakshak-secondaryBg px-2 py-0.5 rounded-full">
          Station #04 Live
        </span>
      </div>

      {/* Temp Display */}
      <div className="flex items-baseline justify-between pt-1">
        <div>
          <span className="font-mono text-4xl font-extrabold text-rakshak-text">24°C</span>
          <p className="text-xs text-rakshak-secondaryText font-inter">Partly Clear • Ideal Vision</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            Optimal Camera Range
          </span>
        </div>
      </div>

      {/* Grid Specs */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-rakshak-border text-xs font-mono">
        <div className="flex items-center gap-2.5 bg-rakshak-secondaryBg p-2.5 rounded-2xl">
          <Droplets className="w-4 h-4 text-blue-500" />
          <div>
            <span className="text-[10px] text-rakshak-secondaryText block">Humidity</span>
            <span className="font-bold text-rakshak-text">68%</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-rakshak-secondaryBg p-2.5 rounded-2xl">
          <Wind className="w-4 h-4 text-teal-600" />
          <div>
            <span className="text-[10px] text-rakshak-secondaryText block">Wind Speed</span>
            <span className="font-bold text-rakshak-text">12 km/h NW</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-rakshak-secondaryBg p-2.5 rounded-2xl">
          <Eye className="w-4 h-4 text-emerald-600" />
          <div>
            <span className="text-[10px] text-rakshak-secondaryText block">Visibility</span>
            <span className="font-bold text-rakshak-text">10 km</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-rakshak-secondaryBg p-2.5 rounded-2xl">
          <CloudRain className="w-4 h-4 text-indigo-500" />
          <div>
            <span className="text-[10px] text-rakshak-secondaryText block">Rain Prob.</span>
            <span className="font-bold text-rakshak-text">15% Low</span>
          </div>
        </div>
      </div>

    </div>
  );
};
