'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { LiveFeed } from '@/components/camera/LiveFeed';
import { ThreatCard } from '@/components/dashboard/ThreatCard';
import { RecommendationCard } from '@/components/dashboard/RecommendationCard';
import { WeatherCard } from '@/components/dashboard/WeatherCard';
import { RecentAlerts } from '@/components/dashboard/RecentAlerts';
import { mockCameras } from '@/services/cameraService';
import { mockAlerts } from '@/services/alertService';
import { ShieldCheck, Video, Bell, CloudSun, Activity, BarChart2 } from 'lucide-react';

export default function DashboardPage() {
  const [cameras] = useState(mockCameras);
  const [alerts] = useState(mockAlerts);

  return (
    <div className="flex min-h-screen bg-rakshak-bg text-rakshak-text">
      
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-4 md:p-8 space-y-8 max-w-[1440px] mx-auto w-full">
          
          {/* Main Hero Header Bar */}
          <div className="glass-card rounded-[24px] p-6 shadow-soft border border-rakshak-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-r from-white via-rakshak-bg to-rakshak-secondaryBg/40">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                FARM STATUS: SAFE • 0 ACTIVE INTRUSIONS IN CROP ZONES
              </div>
              <h2 className="font-sora text-2xl md:text-3xl font-extrabold text-rakshak-text">
                Autonomous Farm Sentinel Active
              </h2>
              <p className="text-xs text-rakshak-secondaryText font-inter">
                8 Cameras &amp; 1 Aerial Drone unit actively scanning Sector 4 Perimeter.
              </p>
            </div>

            {/* Quick KPI Chips */}
            <div className="grid grid-cols-3 gap-3 text-center font-mono w-full md:w-auto">
              <div className="bg-white border border-rakshak-border px-4 py-2.5 rounded-2xl shadow-soft">
                <span className="text-[10px] text-rakshak-secondaryText block">Cameras</span>
                <span className="font-bold text-rakshak-text text-sm">8 / 8 Online</span>
              </div>
              <div className="bg-white border border-rakshak-border px-4 py-2.5 rounded-2xl shadow-soft">
                <span className="text-[10px] text-rakshak-secondaryText block">Today&apos;s Alerts</span>
                <span className="font-bold text-rakshak-primary text-sm">2 Handled</span>
              </div>
              <div className="bg-white border border-rakshak-border px-4 py-2.5 rounded-2xl shadow-soft">
                <span className="text-[10px] text-rakshak-secondaryText block">Weather</span>
                <span className="font-bold text-rakshak-text text-sm">24°C Clear</span>
              </div>
            </div>
          </div>

          {/* Primary Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 2 Columns: Live Camera Stream & Incident Timeline */}
            <div className="lg:col-span-2 space-y-8">
              {/* Live Camera Stream Section */}
              <LiveFeed cameras={cameras} />

              {/* Intrusion Timeline */}
              <RecentAlerts alerts={alerts} />
            </div>

            {/* Right Column: Threat Card, AI Recommendation, Weather Card */}
            <div className="space-y-8">
              {/* Active Threat Card */}
              <ThreatCard />

              {/* AI Recommendation Card */}
              <RecommendationCard />

              {/* Micro-climate Weather Card */}
              <WeatherCard />
            </div>

          </div>

        </main>
      </div>

    </div>
  );
}
