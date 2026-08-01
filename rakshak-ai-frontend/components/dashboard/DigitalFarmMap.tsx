'use client';

import React from 'react';
import { Compass, MapPin, Navigation, ShieldCheck } from 'lucide-react';
import { InfoPopover } from '../ui/InfoPopover';

interface DigitalFarmMapProps {
  cropZone?: { x: number; y: number; width: number; height: number };
  riskZone?: { x: number; y: number; width: number; height: number };
  animal?: {
    x: number;
    y: number;
    direction: string;
    type: string;
    emoji: string;
    threat: string;
  };
}

export const DigitalFarmMap: React.FC<DigitalFarmMapProps> = ({
  cropZone = { x: 30, y: 30, width: 40, height: 40 },
  riskZone = { x: 15, y: 15, width: 70, height: 70 },
  animal = {
    x: 82,
    y: 72,
    direction: 'SW',
    type: 'Wild Boar',
    emoji: '🐗',
    threat: 'CRITICAL',
  },
}) => {
  const isHighThreat = animal.threat === 'CRITICAL' || animal.threat === 'HIGH';

  const getRotationAngle = (dirStr: string) => {
    if (dirStr.includes('SW')) return 225;
    if (dirStr.includes('NW')) return 315;
    if (dirStr.includes('SE')) return 135;
    if (dirStr.includes('NE')) return 45;
    if (dirStr.includes('W')) return 270;
    if (dirStr.includes('E')) return 90;
    if (dirStr.includes('S')) return 180;
    return 0; // N
  };

  const rotation = getRotationAngle(animal.direction);

  return (
    <div className="dark-panel p-5 flex flex-col justify-between relative overflow-hidden font-sans">
      
      {/* Header Bar with InfoPopover */}
      <div className="flex items-center justify-between pb-3 border-b border-[#0C9276]/30 z-10">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#E3EF26]" />
          <span className="section-label text-[#E3EF26]">DIGITAL FARM TWIN MAP</span>
          <InfoPopover text="Top-down digital twin showing crop field, buffer risk zone, and spatial intruder vector." />
        </div>
        <div className="flex items-center gap-3 text-xs font-mono text-[#8AA294]">
          <span className="flex items-center gap-1 text-[#E3EF26]">
            <Compass className="w-3.5 h-3.5" /> {animal.direction}
          </span>
          <span>N 28°38&apos; E 77°12&apos;</span>
        </div>
      </div>

      {/* 2D Top-Down Interactive Field Grid */}
      <div className="relative w-full aspect-[16/9] min-h-[220px] rounded-lg bg-[#06231D] border border-[#0C9276]/40 my-3 overflow-hidden">
        
        {/* Grid pattern lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c927620_1px,transparent_1px),linear-gradient(to_bottom,#0c927620_1px,transparent_1px)] bg-[size:24px_24px]" />

        {/* Risk Zone (Dashed Teal-Light Rectangle) */}
        <div
          style={{
            left: `${riskZone.x}%`,
            top: `${riskZone.y}%`,
            width: `${riskZone.width}%`,
            height: `${riskZone.height}%`,
          }}
          className="absolute border-2 border-dashed border-[#0C9276] rounded-lg bg-[#0C9276]/10 pointer-events-none flex items-start justify-end p-2 transition-all duration-500"
        >
          <span className="text-[10px] font-mono font-bold text-[#0C9276] bg-[#06231D]/90 px-1.5 py-0.5 rounded border border-[#0C9276]/40">
            RISK BUFFER ZONE
          </span>
        </div>

        {/* Crop Zone (Filled Lime Rectangle --lime #E3EF26) */}
        <div
          style={{
            left: `${cropZone.x}%`,
            top: `${cropZone.y}%`,
            width: `${cropZone.width}%`,
            height: `${cropZone.height}%`,
          }}
          className="absolute border-2 border-[#8C9614] bg-[#E3EF26] rounded-md pointer-events-none flex items-center justify-center p-2 transition-all duration-500 shadow-md"
        >
          <div className="flex items-center gap-1.5 bg-[#06231D] px-2.5 py-1 rounded border border-[#8C9614]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#E3EF26]" />
            <span className="text-[11px] font-mono font-bold text-[#E3EF26]">
              PROTECTED CROP ZONE
            </span>
          </div>
        </div>

        {/* Animal Position Marker (Smooth Position CSS Transition) */}
        <div
          style={{
            left: `${animal.x}%`,
            top: `${animal.y}%`,
            transition: 'all 1.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group cursor-pointer"
        >
          {/* Dot with pulse */}
          <div className="relative">
            {isHighThreat && (
              <span className="absolute -inset-3 rounded-full bg-[#C43B2E]/50 animate-ping" />
            )}
            <div
              className={`w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-base shadow-lg z-10 relative ${
                isHighThreat ? 'bg-[#C43B2E] text-white shadow-[0_0_15px_#C43B2E]' : 'bg-[#E3EF26] text-[#06231D]'
              }`}
            >
              {animal.emoji}
            </div>

            {/* Direction Arrow */}
            <div
              style={{ transform: `rotate(${rotation}deg)` }}
              className="absolute -top-3 left-1/2 -translate-x-1/2 transition-transform duration-500 text-[#E3EF26]"
            >
              <Navigation className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>

          {/* Animal Telemetry Badge */}
          <div className="mt-1 px-2 py-0.5 rounded bg-[#06231D] border border-[#0C9276] text-[10px] font-mono font-bold text-[#E3EF26] whitespace-nowrap shadow-md">
            {animal.type} ({animal.x}%, {animal.y}%)
          </div>
        </div>

      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-between text-xs font-mono text-[#8AA294] pt-2 border-t border-[#0C9276]/30">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#E3EF26] border border-[#8C9614]" /> Crop Field
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded border border-dashed border-[#0C9276]" /> Risk Zone
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C43B2E] animate-pulse" /> Intruder
          </span>
        </div>
        <span className="text-[#E3EF26] font-bold">2D TWIN ACTIVE</span>
      </div>
    </div>
  );
};
