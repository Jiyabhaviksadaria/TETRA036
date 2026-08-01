import React from 'react';
import { Alert } from '@/types/alert';
import { AlertCard } from '@/components/alerts/AlertCard';

export const RecentAlerts: React.FC<{ alerts: Alert[] }> = ({ alerts }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-100">Recent Security Alerts</h3>
        <span className="text-xs text-cyan-400 font-semibold cursor-pointer hover:underline">
          View All ({alerts.length}) →
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {alerts.slice(0, 3).map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </div>
    </div>
  );
};
