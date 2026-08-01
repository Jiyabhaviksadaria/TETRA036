'use client';

import React, { useState } from 'react';
import { Clock, Play, AlertTriangle, ShieldCheck, Filter } from 'lucide-react';
import { DecisionPayload } from './DecisionEnginePanel';

export interface TimelineLogItem extends DecisionPayload {
  id: string;
}

const defaultLogs: TimelineLogItem[] = [
  {
    id: 'log-01',
    animal: 'Wild Boar (Pack of 4)',
    confidence: 94,
    region: 'Sector 4 Sugarcane Field',
    movement: 'Advancing NW Toward Crops',
    time: '02:14:08 AM',
    threat: 'HIGH',
    response: 'Zone B Strobe Light + 110dB Acoustic Siren',
    reason: 'High-risk intrusion into a protected crop area during low-visibility night conditions.',
  },
  {
    id: 'log-02',
    animal: 'Nilgai (Adult Male)',
    confidence: 89,
    region: 'Gate 2 Perimeter Fence',
    movement: 'Walking Parallel to North Ditch',
    time: '01:42:15 AM',
    threat: 'HIGH',
    response: 'Ultrasonic Pulse Repeller',
    reason: 'Large animal movement near high-density wheat field boundary.',
  },
  {
    id: 'log-03',
    animal: 'Stray Cattle (2 Cows)',
    confidence: 96,
    region: 'South Pasture Access Road',
    movement: 'Stationary Near Canal',
    time: '00:15:30 AM',
    threat: 'LOW',
    response: 'Low Intensity Warning Light',
    reason: 'Low threat level; animal non-aggressive and clear of crop zone.',
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
  const [filter, setFilter] = useState<'ALL' | 'HIGH' | 'LOW'>('ALL');
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

  return (
    <div className="glass-panel rounded-[24px] p-6 shadow-soft-lg border border-forest-600/50 space-y-4 font-mono">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-forest-600/40">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-sunrise-400" />
          <h3 className="font-display font-bold text-sm text-field-100">
            Incident Log &amp; Replay Timeline
          </h3>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs">
          <Filter className="w-3.5 h-3.5 text-field-100/60 mr-1" />
          {(['ALL', 'HIGH', 'LOW'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold transition-all ${
                filter === f
                  ? 'bg-forest-600 text-sunrise-400 border border-forest-600'
                  : 'bg-forest-950/60 text-field-100/60 hover:text-field-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Incident Log List */}
      <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
        {filteredLogs.map((log) => {
          const isSelected = selectedId === log.id;
          const isHigh = log.threat === 'HIGH';

          return (
            <div
              key={log.id}
              onClick={() => handleReplay(log)}
              className={`rounded-2xl p-4 border transition-all cursor-pointer group flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-forest-800 border-forest-600 shadow-soft ring-1 ring-forest-600'
                  : 'bg-forest-950/50 border-forest-600/30 hover:border-forest-600/60 hover:bg-forest-800/40'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isHigh ? 'bg-status-alert animate-pulse' : 'bg-status-safe'
                    }`}
                  />
                  <span className="font-display font-bold text-xs text-field-100">
                    {log.animal} ({log.confidence}% Conf)
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isHigh ? 'bg-status-alert/20 text-status-alert' : 'bg-status-safe/20 text-status-safe'
                    }`}
                  >
                    {log.threat}
                  </span>
                </div>
                <p className="text-xs text-field-100/70 font-body">
                  {log.region} • {log.movement}
                </p>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto">
                <span className="text-[11px] text-sunrise-400 font-mono">
                  {log.time}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReplay(log);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-forest-600/40 group-hover:bg-forest-600 text-sunrise-400 text-[11px] font-mono font-semibold flex items-center gap-1 transition-all shadow-soft"
                >
                  <Play className="w-3 h-3 fill-current" />
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
