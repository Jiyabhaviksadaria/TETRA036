'use client';

import React, { useState, useEffect } from 'react';
import { Video, Moon, Radio, Maximize2, ShieldCheck, Eye } from 'lucide-react';
import { Camera } from '@/types/camera';
import { InfoPopover } from '../ui/InfoPopover';
import { useTheme } from '@/context/ThemeContext';

interface LiveFeedProps {
  cameras?: Camera[];
}

export const LiveFeed: React.FC<LiveFeedProps> = ({ cameras = [] }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [selectedCamIndex, setSelectedCamIndex] = useState(0);
  const [nightVision, setNightVision] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [isRecording, setIsRecording] = useState(true);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }) + ' . ' + now.toLocaleDateString());
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeCam = cameras[selectedCamIndex] || {
    name: 'Zone B Orchard Feed',
    location: 'Sector 4 North Boundary',
    resolution: '4K Ultra HD',
    fps: 60,
    streamUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1400&auto=format&fit=crop',
  };

  return (
    <div
      className={`rounded-[24px] p-5 border space-y-4 transition-all duration-300 ${
        isDark
          ? 'glass-panel bg-[#163E2D]/90 border-[#246B49]/60 text-[#F4F1E8] shadow-[0_10px_30px_rgba(14,40,28,0.8)]'
          : 'bg-white border-slate-200 text-slate-900 shadow-md'
      }`}
    >
      
      {/* Top Header & Camera Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#246B49]/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0E281C] border border-[#246B49] text-[#4ADE80] flex items-center justify-center shadow-sm">
            <Video className="w-4.5 h-4.5 text-[#4ADE80]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-display font-black text-sm sm:text-base tracking-wide ${isDark ? 'text-[#F2C879]' : 'text-[#0E281C]'}`}>
                LIVE CAMERA FEED
              </h3>
              <InfoPopover text="Real-time optical and thermal camera feed scanning Sector 4 crop zone." />
            </div>
            <h4 className={`font-bold text-xs sm:text-sm ${isDark ? 'text-[#F4F1E8]' : 'text-[#0E281C]'}`}>
              {activeCam.name} ({activeCam.resolution} @ {activeCam.fps}fps)
            </h4>
          </div>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setNightVision(!nightVision)}
            type="button"
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all border ${
              nightVision
                ? 'bg-[#0E281C] text-[#F2C879] border-[#4ADE80]'
                : isDark
                ? 'bg-[#0E281C]/70 text-[#A3B8AD] border-[#246B49]/40 hover:text-white'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:text-slate-900'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Night Vision {nightVision ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setIsRecording(!isRecording)}
            type="button"
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all border ${
              isRecording
                ? 'bg-red-500/20 text-red-400 border-red-500/40'
                : 'bg-slate-500/20 text-slate-400 border-slate-500/40'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
            <span>{isRecording ? 'REC' : 'PAUSED'}</span>
          </button>
        </div>
      </div>

      {/* 16:9 Live Feed Container */}
      <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#0E281C] border border-[#246B49] shadow-md group">
        
        {/* Background Stream Image with Night Vision Filter */}
        <img
          src={activeCam.streamUrl}
          alt={activeCam.name}
          className={`w-full h-full object-cover transition-all duration-500 ${
            nightVision ? 'brightness-125 contrast-125 hue-rotate-90 sepia-50' : 'brightness-100'
          }`}
        />

        {/* Top Telemetry Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 bg-[#0E281C]/90 border border-[#246B49]/60 px-3.5 py-1.5 rounded-full text-white text-xs font-mono">
            <Radio className="w-3.5 h-3.5 text-[#4ADE80] animate-pulse" />
            <span>OPTICAL NODE 04</span>
          </div>

          <div className="bg-[#0E281C]/90 border border-[#246B49]/60 px-3.5 py-1.5 rounded-full text-white text-xs font-mono">
            {currentTime || '13:48:12 . 01/08/2026'}
          </div>
        </div>

        {/* AI Bounding Box Simulation */}
        <div className="absolute top-[32%] left-[30%] w-[26%] h-[32%] border-2 border-[#4ADE80] bg-[#4ADE80]/20 rounded-xl p-2 animate-pulse">
          <div className="absolute -top-7 left-0 bg-[#0E281C] px-3 py-1 rounded-lg text-xs font-mono text-[#4ADE80] font-bold flex items-center gap-1.5 border border-[#4ADE80]/50 shadow-md">
            <Eye className="w-3.5 h-3.5" />
            <span>Target Intruder • YOLOv8 Active</span>
          </div>
        </div>

        {/* Bottom Feed Footer */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="bg-[#0E281C]/90 px-3.5 py-1.5 rounded-full text-[#4ADE80] text-xs font-mono flex items-center gap-1.5 border border-[#246B49]/60">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>YOLOv8 Optical Model Active</span>
          </div>

          <button type="button" className="pointer-events-auto w-8 h-8 rounded-full bg-[#0E281C]/90 text-white flex items-center justify-center hover:bg-white/20 transition-colors">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Camera Grid Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
        {cameras.map((c, i) => (
          <button
            key={c.id || i}
            type="button"
            onClick={() => setSelectedCamIndex(i)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
              selectedCamIndex === i
                ? 'bg-[#246B49] text-[#F2C879] border-[#4ADE80] shadow-sm'
                : isDark
                ? 'bg-[#0E281C]/70 text-[#A3B8AD] border-[#246B49]/40 hover:text-white'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:text-slate-900'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

    </div>
  );
};
