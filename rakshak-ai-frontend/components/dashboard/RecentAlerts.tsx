'use client';

import React, { useState } from 'react';
import { Clock, Play, Filter } from 'lucide-react';
import { DecisionPayload } from './DecisionEnginePanel';
import { useTheme } from '../../context/ThemeContext';
import { InfoPopover } from '../ui/InfoPopover';

export interface TimelineLogItem extends DecisionPayload {
  id: string;
  emoji?: string;
  outcome?: string;
}

const defaultLogs: TimelineLogItem[] = [
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
    reason: 'Wild boar moving directly toward sugarcane crop zone at high speed during low-visibility hours.',
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
    response: 'High-Decibel Siren + Strobe Illumination',
    outcome: 'High → High Siren + Strobe',
    reason: 'Nilgai (Blue Bull) herd member breaching northern perimeter fence.',
  },
  {
    id: 'log-03',
    animal: 'Cow',
    emoji: '🐄',
    confidence: 89,
    region: 'South Pasture Access Road',
    movement: 'S (Slow Grazing)',
    time: '00:15:30 AM',
    threat: 'MEDIUM',
    response: 'Ultrasonic Repellent Pulse',
    outcome: 'Medium → Ultrasonic Pulse',
    reason: 'Stray cattle grazing in perimeter buffer zone, slow movement detected.',
  },
  {
    id: 'log-04',
    animal: 'Human Patrol',
    emoji: '👤',
    confidence: 96,
    region: 'Outer Gate Pathway',
    movement: 'E (Outer Pathway)',
    time: '23:45:10 PM',
    threat: 'SAFE',
    response: 'Log Authorized Entry',
    outcome: 'Safe → Logged Only',
    reason: 'Authorized farm worker / patrol human detected near outer gate pathway.',
  },
];

interface RecentAlertsProps {
  logs?: TimelineLogItem[];
  onSelectLog?: (log: DecisionPayload) => void;
}

export const RecentAlerts: React.FC<RecentAlertsProps> = ({
  logs = defaultLogs,
  onSelectLog,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [filter, setFilter] = useState<string>('ALL');
  const [selectedId, setSelectedId] = useState<string>('log-01');

  const filteredLogs = logs.filter((log) => {
    if (filter === 'ALL') return true;
    return log.threat === filter;
  });

  const handleReplay = (log: TimelineLogItem) => {
    setSelectedId(log.id);
    if (onSelectLog) {
      onSelectLog(log);
    }
  };

  const getThreatBadgeStyle = (threat: string) => {
    switch (threat) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'MEDIUM':
        return 'bg-amber-400/20 text-amber-400 border-amber-400/40';
      case 'LOW':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'SAFE':
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <div
      className={`rounded-[24px] p-6 border space-y-4 font-mono transition-all duration-300 ${
        isDark
          ? 'glass-panel bg-[#163E2D]/90 border-[#246B49]/60 text-[#F4F1E8] shadow-[0_10px_30px_rgba(14,40,28,0.8)]'
          : 'bg-white border-slate-200 text-slate-900 shadow-md'
      }`}
    >
      {/* Header Bar with High-Contrast Typography */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#246B49]/40">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#F2C879]" />
          <h3 className={`font-display font-black text-sm sm:text-base tracking-wide ${isDark ? 'text-[#F2C879]' : 'text-[#0E281C]'}`}>
            EVENT TIMELINE HISTORY &amp; INCIDENT REPLAY
          </h3>
          <InfoPopover text="Historical log of spatial intrusions, threat levels, and executed deterrent outcomes." />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs">
          <Filter className="w-3.5 h-3.5 text-[#A3B8AD] mr-1" />
          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'SAFE'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition-all ${
                filter === f
                  ? 'bg-[#246B49] text-[#F2C879] border border-[#4ADE80]'
                  : 'bg-[#0E281C]/60 text-[#A3B8AD] hover:text-[#F4F1E8]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Incident Log List */}
      <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
        {filteredLogs.map((log) => {
          const isSelected = selectedId === log.id;

          return (
            <div
              key={log.id}
              onClick={() => handleReplay(log)}
              className={`rounded-2xl p-3.5 border transition-all cursor-pointer group flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-[#0E281C] border-[#4ADE80] shadow-[0_0_15px_rgba(74,222,128,0.2)]'
                  : 'bg-[#0E281C]/70 border-[#246B49]/40 hover:border-[#246B49]/80 hover:bg-[#163E2D]/60'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Scenario Emoji Badge */}
                  <span className="px-2 py-0.5 rounded-full bg-[#163E2D] border border-[#246B49] text-xs font-bold">
                    {log.emoji || '🐗'} {log.animal}
                  </span>

                  <span className="font-mono text-xs text-[#A3B8AD]">
                    ({log.confidence}% Conf)
                  </span>

                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${getThreatBadgeStyle(
                      log.threat
                    )}`}
                  >
                    {log.threat}
                  </span>
                </div>

                <p className="text-xs text-[#A3B8AD] font-body">
                  {log.region} • {log.movement}
                </p>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
                <span className="text-[11px] text-[#F2C879] font-mono font-bold">
                  {log.time}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReplay(log);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#246B49]/70 group-hover:bg-[#246B49] text-[#F2C879] text-[11px] font-mono font-bold flex items-center gap-1 transition-all shadow-sm"
                >
                  <Play className="w-3 h-3 fill-current text-[#F2C879]" />
                  <span>Replay EDE</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
