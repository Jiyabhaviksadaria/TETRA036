'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { RecentAlerts } from '@/components/dashboard/RecentAlerts';
import { Filter, ShieldAlert } from 'lucide-react';

export default function AlertsPage() {
  return (
    <div className="flex min-h-screen bg-forest-950 text-field-100 font-body">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />
        <main className="p-4 md:p-8 space-y-8 max-w-[1440px] mx-auto w-full">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-[24px]">
            <div>
              <h1 className="font-display text-2xl font-bold text-field-100 flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-status-alert" />
                Threat Detections &amp; Incident Replay Logs
              </h1>
              <p className="text-xs text-field-100/70 font-body">
                Complete log of detected animal intrusions, explainable decision engine payloads, and deterrence records.
              </p>
            </div>
          </div>

          <RecentAlerts />

        </main>
      </div>
    </div>
  );
}
