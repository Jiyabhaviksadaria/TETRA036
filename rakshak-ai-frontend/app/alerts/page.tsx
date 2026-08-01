'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { RecentAlerts } from '@/components/dashboard/RecentAlerts';
import { mockAlerts } from '@/services/alertService';
import { Bell, Filter, ShieldAlert } from 'lucide-react';

export default function AlertsPage() {
  const [alerts] = useState(mockAlerts);

  return (
    <div className="flex min-h-screen bg-rakshak-bg text-rakshak-text">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />
        <main className="p-4 md:p-8 space-y-8 max-w-[1440px] mx-auto w-full">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-6 rounded-[24px]">
            <div>
              <h1 className="font-sora text-2xl font-bold text-rakshak-text flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-rakshak-danger" />
                Threat Detections &amp; Incident Alerts
              </h1>
              <p className="text-xs text-rakshak-secondaryText font-inter">
                Complete log of detected animal intrusions, deterrence actions, and resolution logs.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button className="px-4 py-2 rounded-full glass-card text-rakshak-text font-mono text-xs flex items-center gap-1.5 border border-rakshak-border">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter by Severity</span>
              </button>
            </div>
          </div>

          <RecentAlerts alerts={alerts} />

        </main>
      </div>
    </div>
  );
}
