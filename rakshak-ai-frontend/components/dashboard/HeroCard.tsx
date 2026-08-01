import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';

export const HeroCard: React.FC = () => {
  return (
    <GlassCard glow className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 text-xs font-semibold mb-3">
            <span>✨ AI THREAT MONITORING</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Perimeter Security Guarded
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mt-2">
            Real-time computer vision actively scanning 14 surveillance sectors. Zero critical breaches detected in the last 24 hours.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary" size="md">
            Scan All Zones
          </Button>
        </div>
      </div>
    </GlassCard>
  );
};
