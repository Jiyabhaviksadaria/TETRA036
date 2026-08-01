'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { Cpu, Radio, Shield, Zap, RefreshCw } from 'lucide-react';

export default function DevicesPage() {
  const devices = [
    { name: 'Rakshak Edge Compute Node 01', type: 'AI Edge Gateway', status: 'Online', ip: '192.168.1.10', firmware: 'v4.2.1-prod' },
    { name: 'Zone B High-Frequency Siren Array', type: 'Acoustic Deterrent', status: 'Online', ip: '192.168.1.24', firmware: 'v2.1.0' },
    { name: 'Zone A Strobe Light Beacon', type: 'Optical Deterrent', status: 'Online', ip: '192.168.1.30', firmware: 'v1.8.4' },
    { name: 'Airborne Sentinel Drone 01 Dock', type: 'Autonomous UAV Dock', status: 'Standby', ip: '192.168.1.55', firmware: 'v5.0.2' },
  ];

  return (
    <div className="flex min-h-screen bg-rakshak-bg text-rakshak-text">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />
        <main className="p-4 md:p-8 space-y-8 max-w-[1440px] mx-auto w-full">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-6 rounded-[24px]">
            <div>
              <h1 className="font-sora text-2xl font-bold text-rakshak-text flex items-center gap-2">
                <Cpu className="w-6 h-6 text-rakshak-primary" />
                IoT Hardware &amp; Deterrent Devices
              </h1>
              <p className="text-xs text-rakshak-secondaryText font-inter">
                Status of edge nodes, acoustic sirens, strobe beacons, and automated drone docks.
              </p>
            </div>

            <button className="px-5 py-2.5 rounded-full bg-rakshak-primary text-white font-sora font-semibold text-xs flex items-center gap-2 shadow-soft hover:shadow-glow transition-all">
              <RefreshCw className="w-4 h-4" />
              <span>Ping All Network Nodes</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {devices.map((d, i) => (
              <div key={i} className="glass-card rounded-[24px] p-6 shadow-soft border border-rakshak-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rakshak-primary font-sora font-bold text-sm">
                    <Radio className="w-4 h-4" />
                    {d.name}
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    {d.status}
                  </span>
                </div>
                <div className="text-xs font-mono text-rakshak-secondaryText space-y-1">
                  <p>Type: {d.type}</p>
                  <p>IP Address: {d.ip}</p>
                  <p>Firmware: {d.firmware}</p>
                </div>
              </div>
            ))}
          </div>

        </main>
      </div>
    </div>
  );
}
