'use client';

import React from 'react';
import { TrendingUp, PieChart, Clock, ShieldCheck } from 'lucide-react';

export const AnalyticsPreview: React.FC = () => {
  return (
    <section id="analytics" className="py-24 bg-rakshak-secondaryBg/30 border-y border-rakshak-border/60 relative">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rakshak-secondaryBg text-rakshak-primary text-xs font-mono font-semibold uppercase tracking-wider">
            Predictive Intelligence
          </div>
          <h2 className="font-sora text-3xl sm:text-4xl md:text-5xl font-bold text-rakshak-text">
            Actionable Farm Intelligence &amp; Trend Analytics
          </h2>
          <p className="text-base sm:text-lg text-rakshak-secondaryText font-inter">
            Turn raw camera telemetry into historical insights to prevent future intrusions and optimize deterrent placement.
          </p>
        </div>

        {/* Analytics Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Detection Trends */}
          <div className="glass-card rounded-[24px] p-6 shadow-soft border border-rakshak-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rakshak-primary font-sora font-bold text-sm">
                <TrendingUp className="w-4 h-4" />
                Detection Frequency
              </div>
              <span className="text-xs font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                -34% Damage
              </span>
            </div>
            
            {/* Visual Simulated Bar Chart */}
            <div className="h-36 flex items-end justify-between gap-2 pt-4 px-2 border-b border-rakshak-border">
              <div className="w-full bg-rakshak-secondaryBg hover:bg-rakshak-primary rounded-t-lg h-[40%] transition-colors relative group">
                <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono bg-rakshak-darkBg text-white px-1.5 py-0.5 rounded">Mon: 12</span>
              </div>
              <div className="w-full bg-rakshak-secondaryBg hover:bg-rakshak-primary rounded-t-lg h-[65%] transition-colors relative group">
                <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono bg-rakshak-darkBg text-white px-1.5 py-0.5 rounded">Tue: 18</span>
              </div>
              <div className="w-full bg-rakshak-secondaryBg hover:bg-rakshak-primary rounded-t-lg h-[30%] transition-colors relative group">
                <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono bg-rakshak-darkBg text-white px-1.5 py-0.5 rounded">Wed: 8</span>
              </div>
              <div className="w-full bg-rakshak-secondaryBg hover:bg-rakshak-primary rounded-t-lg h-[85%] transition-colors relative group">
                <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono bg-rakshak-darkBg text-white px-1.5 py-0.5 rounded">Thu: 24</span>
              </div>
              <div className="w-full bg-rakshak-primary rounded-t-lg h-[50%] transition-colors relative group">
                <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono bg-rakshak-darkBg text-white px-1.5 py-0.5 rounded">Fri: 14</span>
              </div>
            </div>
            <p className="text-xs text-rakshak-secondaryText">Peak intrusion hours occur between 11:00 PM and 3:00 AM.</p>
          </div>

          {/* Card 2: Species Breakdown */}
          <div className="glass-card rounded-[24px] p-6 shadow-soft border border-rakshak-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rakshak-primary font-sora font-bold text-sm">
                <PieChart className="w-4 h-4" />
                Species Distribution
              </div>
              <span className="text-xs font-mono text-rakshak-secondaryText">This Month</span>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-rakshak-text font-semibold">Wild Boar</span>
                  <span className="text-rakshak-secondaryText">48% (124 events)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-rakshak-secondaryBg overflow-hidden">
                  <div className="h-full bg-rakshak-primary w-[48%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-rakshak-text font-semibold">Nilgai (Blue Bull)</span>
                  <span className="text-rakshak-secondaryText">31% (80 events)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-rakshak-secondaryBg overflow-hidden">
                  <div className="h-full bg-rakshak-accent w-[31%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-rakshak-text font-semibold">Stray Cattle</span>
                  <span className="text-rakshak-secondaryText">21% (54 events)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-rakshak-secondaryBg overflow-hidden">
                  <div className="h-full bg-amber-400 w-[21%]" />
                </div>
              </div>
            </div>
            <p className="text-xs text-rakshak-secondaryText">Wild boars constitute the primary threat to root crops.</p>
          </div>

          {/* Card 3: Response Speed */}
          <div className="glass-card rounded-[24px] p-6 shadow-soft border border-rakshak-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rakshak-primary font-sora font-bold text-sm">
                <Clock className="w-4 h-4" />
                Response Speed Efficiency
              </div>
              <span className="text-xs font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Optimal
              </span>
            </div>

            <div className="pt-2 text-center">
              <div className="font-mono text-4xl font-extrabold text-rakshak-text">
                3.4 <span className="text-xl font-normal text-rakshak-secondaryText">sec</span>
              </div>
              <p className="text-xs text-rakshak-secondaryText mt-1">Average Automated Defense Trigger Time</p>
            </div>

            <div className="pt-4 border-t border-rakshak-border grid grid-cols-2 gap-3 text-center text-xs font-mono">
              <div className="bg-rakshak-secondaryBg p-2.5 rounded-xl">
                <span className="text-rakshak-secondaryText">Sirens Fired</span>
                <p className="font-bold text-rakshak-text text-sm">412 Times</p>
              </div>
              <div className="bg-rakshak-secondaryBg p-2.5 rounded-xl">
                <span className="text-rakshak-secondaryText">Repel Success</span>
                <p className="font-bold text-emerald-700 text-sm">96.2%</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
