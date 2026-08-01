'use client';

import React from 'react';
import { AlertTriangle, ShieldCheck, Clock, Eye, AlertOctagon } from 'lucide-react';
import { Alert } from '@/types/alert';

interface RecentAlertsProps {
  alerts?: Alert[];
}

export const RecentAlerts: React.FC<RecentAlertsProps> = ({ alerts = [] }) => {
  return (
    <div className="glass-card rounded-[24px] p-6 shadow-soft border border-rakshak-border space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-sora font-bold text-base text-rakshak-text flex items-center gap-2">
          <Clock className="w-4 h-4 text-rakshak-primary" />
          Live Intrusion Incident Timeline
        </h3>
        <span className="text-xs font-mono text-rakshak-secondaryText bg-rakshak-secondaryBg px-2.5 py-1 rounded-full">
          Newest First
        </span>
      </div>

      {/* Vertical Timeline Feed */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-rakshak-border">
        {alerts.map((alert, index) => {
          const isCritical = alert.severity === 'critical';
          const isHigh = alert.severity === 'high';
          const isResolved = alert.status === 'resolved';

          return (
            <div key={alert.id || index} className="relative group">
              
              {/* Dot Icon */}
              <div
                className={`absolute -left-[29px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-soft transition-transform group-hover:scale-110 ${
                  isCritical
                    ? 'bg-rakshak-danger ring-4 ring-red-100'
                    : isHigh
                    ? 'bg-rakshak-warning ring-4 ring-amber-100'
                    : 'bg-rakshak-primary ring-4 ring-emerald-100'
                }`}
              >
                {isCritical ? '!' : isResolved ? '✓' : '•'}
              </div>

              {/* Card Body */}
              <div className="glass-card rounded-2xl p-4 border border-rakshak-border/80 hover:border-rakshak-primary/50 transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-sora font-bold text-sm text-rakshak-text flex items-center gap-2">
                    {alert.threatType} Detection
                  </span>
                  <span className="font-mono text-[11px] text-rakshak-secondaryText">
                    {alert.timestamp}
                  </span>
                </div>

                <p className="text-xs text-rakshak-secondaryText font-inter leading-relaxed">
                  {alert.description}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-rakshak-border/40 text-[11px] font-mono">
                  <span className="text-rakshak-secondaryText">{alert.location}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-rakshak-primary font-semibold">
                      {alert.confidenceScore}% Conf
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full capitalize font-semibold ${
                        isResolved
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {alert.status}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
