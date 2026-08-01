import React from 'react';
import { PageHeader } from '@/components/common/PageHeader';

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="AI Intelligence & Analytics"
        subtitle="Historical detection metrics, model performance, and sector heatmaps"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 h-64 flex flex-col justify-between">
          <h3 className="text-lg font-bold text-white">Detection Frequency Heatmap</h3>
          <div className="flex-1 flex items-center justify-center text-slate-500 font-mono text-sm">
            [ Interactive Chart Placeholder ]
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 h-64 flex flex-col justify-between">
          <h3 className="text-lg font-bold text-white">Neural Net Accuracy Rate</h3>
          <div className="flex-1 flex items-center justify-center text-slate-500 font-mono text-sm">
            [ Model Metrics Visualizer ]
          </div>
        </div>
      </div>
    </div>
  );
}
