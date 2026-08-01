import React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { GlassCard } from '@/components/ui/GlassCard';

export default function ProfilePage() {
  return (
    <div className="space-y-8 max-w-3xl">
      <PageHeader title="Operator Profile" subtitle="Commander credentials and access permissions" />

      <GlassCard className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-3xl">
            🛡️
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Commander Alex Vance</h2>
            <p className="text-sm text-cyan-400 font-mono">ID: OFF-8942-DEF</p>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4 text-sm text-slate-300 space-y-2">
          <div><strong className="text-slate-400">Clearance Level:</strong> Level 5 - Master Tactical</div>
          <div><strong className="text-slate-400">Assigned Sector:</strong> Regional Defense Hub 01</div>
        </div>
      </GlassCard>
    </div>
  );
}
