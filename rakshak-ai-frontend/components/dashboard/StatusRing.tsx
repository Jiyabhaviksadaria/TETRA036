'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, Activity, RefreshCw } from 'lucide-react';

export type ThreatLevel = 'SAFE' | 'LOW' | 'HIGH';

interface StatusRingProps {
  threatLevel: ThreatLevel;
  onThreatLevelChange?: (level: ThreatLevel) => void;
}

export const StatusRing: React.FC<StatusRingProps> = ({
  threatLevel,
  onThreatLevelChange,
}) => {
  const configs = {
    SAFE: {
      title: 'FIELD SAFE',
      subtitle: 'Zero intrusions in protected crop sectors',
      colorText: 'text-status-safe',
      bgColor: 'bg-status-safe/10',
      borderColor: 'border-status-safe',
      glowClass: 'animate-ring-safe shadow-glow-safe',
      badge: 'Continuous 24/7 Surveillance Active',
      icon: ShieldCheck,
    },
    LOW: {
      title: 'CAUTION LEVEL',
      subtitle: 'Wildlife perimeter movement detected near gate 2',
      colorText: 'text-status-caution',
      bgColor: 'bg-status-caution/10',
      borderColor: 'border-status-caution',
      glowClass: 'shadow-glow-caution',
      badge: 'Monitoring Approaching Vector',
      icon: AlertTriangle,
    },
    HIGH: {
      title: 'HIGH CRITICAL THREAT',
      subtitle: 'Wild Boar Pack penetrating Sugarcane Sector 4',
      colorText: 'text-status-alert',
      bgColor: 'bg-status-alert/10',
      borderColor: 'border-status-alert',
      glowClass: 'animate-ring-alert shadow-glow-alert',
      badge: 'Automated Deterrent Standby / Execution',
      icon: ShieldAlert,
    },
  };

  const currentConfig = configs[threatLevel];
  const Icon = currentConfig.icon;

  return (
    <div className="glass-panel rounded-[24px] p-6 shadow-soft-lg border border-forest-600/50 flex flex-col items-center justify-between text-center space-y-6 relative overflow-hidden">
      
      {/* Top Header */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-forest-600/40 font-mono text-xs">
        <span className="text-sunrise-400 font-bold flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          SYSTEM THREAT MONITOR
        </span>
        <span className="text-field-100/70">REALTIME SENTINEL RING</span>
      </div>

      {/* Signature Animated Status Ring */}
      <div className="relative my-4 flex items-center justify-center">
        {/* Outer Pulsing Aura Ring */}
        <div
          className={`w-44 h-44 rounded-full border-4 ${currentConfig.borderColor} ${currentConfig.glowClass} ${currentConfig.bgColor} transition-all duration-700 flex items-center justify-center p-4`}
        >
          {/* Inner Circle */}
          <div className="w-32 h-32 rounded-full bg-forest-950/90 border border-forest-600/60 flex flex-col items-center justify-center space-y-1 p-2">
            <Icon className={`w-9 h-9 ${currentConfig.colorText} transition-all duration-500`} />
            <span className={`font-display text-sm font-extrabold ${currentConfig.colorText} tracking-wider`}>
              {threatLevel}
            </span>
          </div>
        </div>
      </div>

      {/* Status Readout Info */}
      <div className="space-y-1.5 max-w-sm">
        <h3 className={`font-display text-xl font-extrabold ${currentConfig.colorText} tracking-tight`}>
          {currentConfig.title}
        </h3>
        <p className="font-body text-xs text-field-100/80 leading-relaxed">
          {currentConfig.subtitle}
        </p>
      </div>

      {/* Demo State Switcher Pill Buttons */}
      <div className="pt-2 border-t border-forest-600/30 w-full space-y-2">
        <span className="text-[10px] font-mono text-field-100/60 uppercase tracking-widest block">
          Judge Demo Threat Simulator:
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onThreatLevelChange && onThreatLevelChange('SAFE')}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-mono font-bold border transition-all ${
              threatLevel === 'SAFE'
                ? 'bg-status-safe text-forest-950 border-status-safe shadow-glow-safe'
                : 'bg-forest-800 text-field-100/60 border-forest-600/40 hover:text-field-100'
            }`}
          >
            SAFE
          </button>

          <button
            onClick={() => onThreatLevelChange && onThreatLevelChange('LOW')}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-mono font-bold border transition-all ${
              threatLevel === 'LOW'
                ? 'bg-status-caution text-forest-950 border-status-caution shadow-glow-caution'
                : 'bg-forest-800 text-field-100/60 border-forest-600/40 hover:text-field-100'
            }`}
          >
            CAUTION
          </button>

          <button
            onClick={() => onThreatLevelChange && onThreatLevelChange('HIGH')}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-mono font-bold border transition-all ${
              threatLevel === 'HIGH'
                ? 'bg-status-alert text-white border-status-alert shadow-glow-alert animate-pulse'
                : 'bg-forest-800 text-field-100/60 border-forest-600/40 hover:text-field-100'
            }`}
          >
            HIGH ALERT
          </button>
        </div>
      </div>

    </div>
  );
};
