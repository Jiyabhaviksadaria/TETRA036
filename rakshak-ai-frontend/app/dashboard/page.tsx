'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { MissionControl } from '@/components/dashboard/MissionControl';
import { ScenarioSelector } from '@/components/dashboard/ScenarioSelector';
import { DigitalFarmMap } from '@/components/dashboard/DigitalFarmMap';
import { LiveFeed } from '@/components/camera/LiveFeed';
import { DecisionPayload } from '@/components/dashboard/DecisionEnginePanel';
import { StatusRing, ThreatLevel } from '@/components/dashboard/StatusRing';
import { RecommendationCard } from '@/components/dashboard/RecommendationCard';
import { RecentAlerts, TimelineLogItem } from '@/components/dashboard/RecentAlerts';
import { mockCameras } from '@/services/cameraService';
import { runScenario, getInitialStatus, SystemStatus, ScenarioResult } from '@/services/mockApi';
import { useTheme } from '@/context/ThemeContext';

export default function DashboardPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [selectedScenario, setSelectedScenario] = useState<string>('Wild Boar');
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // System & Mission Control State
  const [systemStatus, setSystemStatus] = useState<SystemStatus>(getInitialStatus());

  // Animal Map State
  const [animalMap, setAnimalMap] = useState({
    x: 82,
    y: 72,
    direction: 'SW (Toward Crop)',
    type: 'Wild Boar',
    emoji: '🐗',
    threat: 'CRITICAL',
  });

  // Threat State
  const [threatLevel, setThreatLevel] = useState<ThreatLevel>('HIGH');
  const [activeDecision, setActiveDecision] = useState<DecisionPayload>({
    animal: 'Wild Boar',
    confidence: 94,
    region: 'Sector 4 Sugarcane Field',
    movement: 'SW (Toward Crop)',
    time: 'Night (02:14:08 AM)',
    threat: 'CRITICAL',
    response: 'Zone B Strobe Light + 110dB Acoustic Siren',
    reason: 'Wild boar moving directly toward sugarcane crop zone at high speed during low-visibility night hours.',
  });

  // Current Card ETA & Actions
  const [cardData, setCardData] = useState<{
    threatLevel: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    eta: number;
    reason: string;
    actions: string[];
  }>({
    threatLevel: 'CRITICAL',
    eta: 18,
    reason: 'Wild boar moving directly toward sugarcane crop zone at high speed during low-visibility night hours.',
    actions: ['Flash High-Intensity Lights', 'Fire High-Decibel Siren', 'Notify Farmer via SMS/App'],
  });

  // Timeline Logs State
  const [timelineLogs, setTimelineLogs] = useState<TimelineLogItem[]>([
    {
      id: 'log-01',
      animal: 'Wild Boar',
      emoji: '🐗',
      confidence: 94,
      region: 'Sector 4 Sugarcane Field',
      movement: 'SW (Toward Crop)',
      time: '02:14:08 AM',
      threat: 'CRITICAL',
      response: 'Zone B Strobe Light + 110dB Acoustic Siren',
      outcome: 'Critical → Strobe + Siren',
      reason: 'Wild boar moving directly toward sugarcane crop zone at high speed during low-visibility night hours.',
    },
    {
      id: 'log-02',
      animal: 'Nilgai',
      emoji: '🦌',
      confidence: 91,
      region: 'North Perimeter Fence',
      movement: 'W (Rapid Approach)',
      time: '01:42:15 AM',
      threat: 'HIGH',
      response: 'High Siren + Strobe',
      outcome: 'High → High Siren + Strobe',
      reason: 'Nilgai (Blue Bull) herd member breaching northern perimeter fence.',
    },
  ]);

  // Handle Simulation Start Cascade Trigger
  const handleStartSimulation = async () => {
    setIsRunning(true);

    // Step 1: Motion Detected
    setSystemStatus((prev) => ({ ...prev, motion: 'detected', camera: 'active' }));
    
    // Fetch scenario payload from mock engine
    const result: ScenarioResult = await runScenario(selectedScenario);

    // Step 2: AI Engine Analyzing
    setSystemStatus((prev) => ({ ...prev, ai: 'analyzing' }));

    setTimeout(() => {
      // Step 3: Animate Digital Farm Map Dot
      setAnimalMap({
        x: result.position.x,
        y: result.position.y,
        direction: result.direction,
        type: result.animal,
        emoji: result.emoji,
        threat: result.threat,
      });

      // Step 4: Update Threat Level
      const mappedThreat: ThreatLevel =
        result.threat === 'CRITICAL' || result.threat === 'HIGH'
          ? 'HIGH'
          : result.threat === 'MEDIUM' || result.threat === 'LOW'
          ? 'LOW'
          : 'SAFE';

      setThreatLevel(mappedThreat);

      setActiveDecision({
        animal: `${result.emoji} ${result.animal}`,
        confidence: result.confidence,
        region: 'Sector 4 Sugarcane Field',
        movement: result.direction,
        time: result.timestamp,
        threat: result.threat,
        response: result.response.join(' + '),
        reason: result.reason,
      });

      setCardData({
        threatLevel: result.threat,
        eta: result.eta,
        reason: result.reason,
        actions: result.response,
      });

      // Step 5: Mission Control Alert State
      setSystemStatus({
        farm: result.threat === 'CRITICAL' || result.threat === 'HIGH' ? 'alert' : result.threat === 'MEDIUM' ? 'caution' : 'safe',
        system: 'active',
        camera: 'active',
        motion: 'detected',
        ai: 'complete',
      });

      // Step 6: Prepend to Event Timeline
      const newLog: TimelineLogItem = {
        id: result.id,
        animal: result.animal,
        emoji: result.emoji,
        confidence: result.confidence,
        region: 'Sector 4 Sugarcane Field',
        movement: result.direction,
        time: result.timestamp,
        threat: result.threat,
        response: result.response.join(' + '),
        outcome: `${result.threat} → ${result.response[0]}`,
        reason: result.reason,
      };

      setTimelineLogs((prev) => [newLog, ...prev]);

      setIsRunning(false);
    }, 1000);
  };

  const handleSelectLog = (logPayload: DecisionPayload) => {
    setActiveDecision(logPayload);
    if (logPayload.threat === 'HIGH' || logPayload.threat === 'CRITICAL') {
      setThreatLevel('HIGH');
    } else if (logPayload.threat === 'LOW' || logPayload.threat === 'MEDIUM') {
      setThreatLevel('LOW');
    } else {
      setThreatLevel('SAFE');
    }

    setCardData({
      threatLevel: logPayload.threat,
      eta: logPayload.threat === 'CRITICAL' ? 18 : logPayload.threat === 'HIGH' ? 25 : 45,
      reason: logPayload.reason,
      actions: logPayload.response.split(' + '),
    });
  };

  return (
    <div
      className={`flex min-h-screen font-body transition-colors duration-300 ${
        isDark ? 'bg-[#0E281C] text-[#F4F1E8]' : 'bg-[#F4FAF5] text-slate-900'
      }`}
    >
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        {/* 🟢 Sticky Mission Control Status Strip */}
        <MissionControl status={systemStatus} />

        <main className="p-4 md:p-8 space-y-6 max-w-[1440px] mx-auto w-full">
          
          {/* 🟡 Scenario Selector Bar */}
          <ScenarioSelector
            selectedScenario={selectedScenario}
            onSelectScenario={setSelectedScenario}
            onStartSimulation={handleStartSimulation}
            isRunning={isRunning}
          />

          {/* Grid Layout: Live Feed, 2D Farm Map, Threat Ring, Decision Card, Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Columns */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* 16:9 Live Camera Feed */}
              <LiveFeed cameras={mockCameras} />

              {/* 🗺️ Digital Farm Map Twin */}
              <DigitalFarmMap animal={animalMap} />

              {/* Event Timeline with Scenario Badges */}
              <RecentAlerts logs={timelineLogs} onSelectLog={handleSelectLog} />
            </div>

            {/* Right Column: Threat Ring & Decision Card */}
            <div className="space-y-6">
              {/* Signature Threat Status Ring Indicator & Simulator */}
              <StatusRing
                threatLevel={threatLevel}
                onThreatLevelChange={setThreatLevel}
              />

              {/* 🔵 Decision / Alert Card with ETA & Checklist */}
              <RecommendationCard
                threatLevel={cardData.threatLevel}
                eta={cardData.eta}
                reasonText={cardData.reason}
                actions={cardData.actions}
              />
            </div>

          </div>

        </main>
      </div>

    </div>
  );
}
