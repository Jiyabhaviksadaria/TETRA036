'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { LiveFeed } from '@/components/camera/LiveFeed';
import { DecisionEnginePanel, DecisionPayload } from '@/components/dashboard/DecisionEnginePanel';
import { StatusRing, ThreatLevel } from '@/components/dashboard/StatusRing';
import { RecommendationCard } from '@/components/dashboard/RecommendationCard';
import { RecentAlerts, TimelineLogItem } from '@/components/dashboard/RecentAlerts';
import { mockCameras } from '@/services/cameraService';
import { ShieldCheck, Activity, Video, Bell, CloudSun } from 'lucide-react';

export default function DashboardPage() {
  const [threatLevel, setThreatLevel] = useState<ThreatLevel>('HIGH');
  const [activeDecision, setActiveDecision] = useState<DecisionPayload>({
    animal: 'Wild Boar (Pack of 4)',
    confidence: 94,
    region: 'Sector 4 Sugarcane Field',
    movement: 'Advancing NW Toward Crops (14 km/h)',
    time: 'Night (02:14:08 AM)',
    threat: 'HIGH',
    response: 'Zone B Strobe Light + 110dB Acoustic Siren',
    reason: 'High-risk intrusion into a protected crop area during low-visibility night conditions.',
  });

  const handleSelectLog = (logPayload: DecisionPayload) => {
    setActiveDecision(logPayload);
    if (logPayload.threat === 'HIGH') {
      setThreatLevel('HIGH');
    } else if (logPayload.threat === 'LOW') {
      setThreatLevel('LOW');
    } else {
      setThreatLevel('SAFE');
    }
  };

  return (
    <div className="flex min-h-screen bg-forest-950 text-field-100 font-body">
      
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="p-4 md:p-8 space-y-8 max-w-[1440px] mx-auto w-full">
          
          {/* Main Top Header Banner */}
          <div className="glass-panel rounded-[24px] p-6 shadow-soft-lg border border-forest-600/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-r from-forest-950 via-forest-800/60 to-forest-950">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-800 text-sunrise-400 text-xs font-mono font-bold border border-forest-600/40">
                <span className="w-2.5 h-2.5 rounded-full bg-status-safe animate-pulse" />
                EXPLAINABLE AI SENTINEL ACTIVE • 24/7 DUSK &amp; NIGHT MONITORING
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-extrabold text-field-100">
                Autonomous Farm Defense Console
              </h2>
              <p className="text-xs text-field-100/70 font-body">
                8 Optical &amp; Thermal camera nodes continuously scanning Green Valley Organic Farm.
              </p>
            </div>

            {/* Quick KPI Chips */}
            <div className="grid grid-cols-3 gap-3 text-center font-mono w-full md:w-auto">
              <div className="bg-forest-950 border border-forest-600/40 px-4 py-2.5 rounded-2xl shadow-soft">
                <span className="text-[10px] text-field-100/60 block">Cameras</span>
                <span className="font-bold text-field-100 text-sm">8 / 8 Active</span>
              </div>
              <div className="bg-forest-950 border border-forest-600/40 px-4 py-2.5 rounded-2xl shadow-soft">
                <span className="text-[10px] text-field-100/60 block">Accuracy</span>
                <span className="font-bold text-status-safe text-sm">98.7% Conf</span>
              </div>
              <div className="bg-forest-950 border border-forest-600/40 px-4 py-2.5 rounded-2xl shadow-soft">
                <span className="text-[10px] text-field-100/60 block">Avg Speed</span>
                <span className="font-bold text-sunrise-400 text-sm">&lt; 3.4 sec</span>
              </div>
            </div>
          </div>

          {/* Primary Product Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 2 Columns: Live Feed & Explainable Decision Engine Panel */}
            <div className="lg:col-span-2 space-y-8">
              {/* 16:9 Live Camera Feed */}
              <LiveFeed cameras={mockCameras} />

              {/* 4-Step Explainable Decision Engine (EDE) Panel */}
              <DecisionEnginePanel payload={activeDecision} />

              {/* Scrollable Incident Timeline with Click-to-Replay Interaction */}
              <RecentAlerts onSelectLog={handleSelectLog} />
            </div>

            {/* Right Column: Status Ring & Smart Response Card */}
            <div className="space-y-8">
              {/* Signature Threat Status Ring Indicator & Simulator */}
              <StatusRing
                threatLevel={threatLevel}
                onThreatLevelChange={setThreatLevel}
              />

              {/* Smart Response Card with Accept / Farmer Override */}
              <RecommendationCard
                actionText={activeDecision.response}
                reasonText={activeDecision.reason}
                successRate={activeDecision.confidence}
              />
            </div>

          </div>

        </main>
      </div>

    </div>
  );
}
