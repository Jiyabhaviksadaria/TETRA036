import React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <PageHeader
        title="System Settings"
        subtitle="Configure alert thresholds, AI parameters, and hardware integrations"
      />

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-white mb-2">Detection Sensitivity</h3>
          <p className="text-sm text-slate-400 mb-4">
            Adjust confidence cutoff score for automated perimeter alarms.
          </p>
          <input
            type="range"
            min="50"
            max="99"
            defaultValue="85"
            className="w-full accent-cyan-400"
          />
        </div>

        <div className="border-t border-slate-800 pt-6 flex justify-end">
          <Button variant="primary">Save Configuration</Button>
        </div>
      </div>
    </div>
  );
}
