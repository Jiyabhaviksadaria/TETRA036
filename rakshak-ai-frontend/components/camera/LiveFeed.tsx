'use client';

import React, { useState, useEffect } from 'react';
import { Video, Moon, Radio, Maximize2, ShieldCheck, Eye, RefreshCw, Volume2 } from 'lucide-react';
import { Camera } from '@/types/camera';

interface LiveFeedProps {
  cameras?: Camera[];
}

export const LiveFeed: React.FC<LiveFeedProps> = ({ cameras = [] }) => {
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
    name: 'Zone B Orchard Perimeter',
    location: 'North Field Boundary',
    resolution: '4K Ultra HD',
    fps: 60,
    streamUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1400&auto=format&fit=crop',
  };

  return (
    <div className="glass-card rounded-[24px] overflow-hidden shadow-soft-lg border border-rakshak-border p-4 space-y-4">
      
      {/* Top Feed Header & Camera Selector Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-rakshak-secondaryBg text-rakshak-primary flex items-center justify-center">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-sora font-bold text-base text-rakshak-text flex items-center gap-2">
              {activeCam.name}
              <span className="text-xs font-mono font-normal text-rakshak-secondaryText bg-rakshak-secondaryBg px-2 py-0.5 rounded-full">
                {activeCam.resolution} @ {activeCam.fps}fps
              </span>
            </h3>
            <p className="text-xs text-rakshak-secondaryText font-inter">{activeCam.location}</p>
          </div>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setNightVision(!nightVision)}
            className={`px-3 py-1.5 rounded-full font-mono text-xs font-semibold flex items-center gap-1.5 transition-all ${
              nightVision
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 shadow-glow'
                : 'bg-rakshak-secondaryBg text-rakshak-secondaryText hover:text-rakshak-text border border-rakshak-border'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Night Vision {nightVision ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`px-3 py-1.5 rounded-full font-mono text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isRecording
                ? 'bg-red-50 text-rakshak-danger border border-red-200'
                : 'bg-rakshak-secondaryBg text-rakshak-secondaryText'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-rakshak-danger animate-pulse' : 'bg-gray-400'}`} />
            <span>{isRecording ? 'REC' : 'PAUSED'}</span>
          </button>
        </div>
      </div>

      {/* 16:9 Live Feed Container */}
      <div className="relative aspect-[16/9] w-full rounded-[20px] overflow-hidden bg-rakshak-darkBg shadow-soft border border-rakshak-border group">
        
        {/* Background Stream Image with Night Vision Filter */}
        <img
          src={activeCam.streamUrl}
          alt={activeCam.name}
          className={`w-full h-full object-cover transition-all duration-500 ${
            nightVision ? 'brightness-125 contrast-125 hue-rotate-90 sepia-50' : 'brightness-100'
          }`}
        />

        {/* Night Vision Green Overlay Tint */}
        {nightVision && (
          <div className="absolute inset-0 bg-emerald-950/40 mix-blend-color pointer-events-none" />
        )}

        {/* Top Floating Telemetry Overlay */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 glass-card-dark px-3.5 py-1.5 rounded-full text-white text-xs font-mono">
            <Radio className="w-3.5 h-3.5 text-rakshak-accent animate-pulse" />
            <span>LIVE FEED • CANAL ZONE 04</span>
          </div>

          <div className="glass-card-dark px-3.5 py-1.5 rounded-full text-white text-xs font-mono">
            {currentTime || '13:48:12 . 01/08/2026'}
          </div>
        </div>

        {/* AI Bounding Box Simulation 1 (Wild Boar) */}
        <div className="absolute top-[32%] left-[30%] w-[26%] h-[32%] border-2 border-rakshak-accent bg-rakshak-accent/20 rounded-2xl p-2 animate-pulse-glow">
          <div className="absolute -top-7 left-0 glass-card-dark px-3 py-1 rounded-lg text-xs font-mono text-rakshak-accent font-bold flex items-center gap-1.5 shadow-soft border border-rakshak-accent/40">
            <Eye className="w-3.5 h-3.5" />
            <span>Wild Boar Pack • 94% Conf</span>
          </div>
        </div>

        {/* AI Bounding Box Simulation 2 (Nilgai) */}
        <div className="absolute bottom-[22%] right-[20%] w-[18%] h-[24%] border-2 border-rakshak-warning bg-rakshak-warning/20 rounded-2xl p-2">
          <div className="absolute -top-7 left-0 glass-card-dark px-3 py-1 rounded-lg text-xs font-mono text-rakshak-warning font-bold flex items-center gap-1.5 border border-rakshak-warning/40">
            <Eye className="w-3.5 h-3.5" />
            <span>Nilgai (Adult) • 88% Conf</span>
          </div>
        </div>

        {/* Bottom Floating Feed Controls */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <div className="glass-card-dark px-3 py-1.5 rounded-full text-emerald-400 text-xs font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>YOLOv8 Vision Model Active</span>
          </div>

          <button className="pointer-events-auto w-8 h-8 rounded-full glass-card-dark text-white flex items-center justify-center hover:bg-white/20 transition-colors">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Camera Grid Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
        {cameras.map((c, i) => (
          <button
            key={c.id || i}
            onClick={() => setSelectedCamIndex(i)}
            className={`px-4 py-2 rounded-2xl text-xs font-sora font-semibold whitespace-nowrap transition-all ${
              selectedCamIndex === i
                ? 'bg-rakshak-primary text-white shadow-soft'
                : 'bg-rakshak-secondaryBg text-rakshak-secondaryText hover:text-rakshak-text'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

    </div>
  );
};
