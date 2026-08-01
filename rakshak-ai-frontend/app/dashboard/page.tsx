'use client';

import React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { HeroCard } from '@/components/dashboard/HeroCard';
import { ThreatCard } from '@/components/dashboard/ThreatCard';
import { RecommendationCard } from '@/components/dashboard/RecommendationCard';
import { WeatherCard } from '@/components/dashboard/WeatherCard';
import { Statistics } from '@/components/dashboard/Statistics';
import { RecentAlerts } from '@/components/dashboard/RecentAlerts';
import { LiveFeed } from '@/components/camera/LiveFeed';
import { useAlerts } from '@/hooks/useAlerts';
import { useCamera } from '@/hooks/useCamera';
import { Loader } from '@/components/common/Loader';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const { alerts, loading: loadingAlerts } = useAlerts();
  const { cameras, loading: loadingCameras } = useCamera();

  if (loadingAlerts || loadingCameras) {
    return <Loader message="Initializing Defense Operations Dashboard..." />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Security Command Center"
        subtitle="Real-time perimeter surveillance & AI threat assessment"
        actions={
          <Button variant="primary" size="sm">
            + Add Camera Feed
          </Button>
        }
      />

      <HeroCard />

      <Statistics />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Primary Live Feed</h3>
            <LiveFeed cameraName={cameras[0]?.name || 'Sector 4 Camera'} />
          </div>
          <RecentAlerts alerts={alerts} />
        </div>

        <div className="space-y-6">
          <ThreatCard />
          <RecommendationCard />
          <WeatherCard />
        </div>
      </div>
    </div>
  );
}
