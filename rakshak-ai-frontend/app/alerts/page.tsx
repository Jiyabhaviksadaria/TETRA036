'use client';

import React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { AlertCard } from '@/components/alerts/AlertCard';
import { Timeline } from '@/components/alerts/Timeline';
import { useAlerts } from '@/hooks/useAlerts';
import { Loader } from '@/components/common/Loader';

export default function AlertsPage() {
  const { alerts, loading } = useAlerts();

  if (loading) return <Loader message="Loading Security Alerts..." />;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Security Alerts & Incident Logs"
        subtitle="Detailed log of flagged threat events and timeline investigation"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-white">Active Alerts ({alerts.length})</h3>
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 h-fit">
          <h3 className="text-lg font-semibold text-white mb-6">Incident Timeline</h3>
          <Timeline />
        </div>
      </div>
    </div>
  );
}
