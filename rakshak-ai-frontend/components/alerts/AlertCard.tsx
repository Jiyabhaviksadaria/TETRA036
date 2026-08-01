import React from 'react';
import { Alert } from '@/types/alert';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

export const AlertCard: React.FC<{ alert: Alert }> = ({ alert }) => {
  return (
    <div className="bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 transition-all duration-200">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={alert.severity}>{alert.severity}</Badge>
            <span className="text-xs text-slate-400 font-mono">
              {alert.threatType}
            </span>
          </div>
          <h4 className="font-semibold text-slate-100">{alert.title}</h4>
          <p className="text-xs text-slate-400 mt-1">{alert.description}</p>
        </div>
        <div className="text-right text-xs text-slate-500 whitespace-nowrap">
          <div>{formatDate(alert.timestamp)}</div>
          <div className="mt-2 text-cyan-400 font-medium">
            Score: {(alert.confidenceScore * 100).toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  );
};
