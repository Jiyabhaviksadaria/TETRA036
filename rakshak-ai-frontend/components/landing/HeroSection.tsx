'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Play, ShieldCheck, Zap, Activity, ScanLine, Eye } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden bg-forest-950">
      {/* Background Graphic Effects & Sunrise Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-forest-800/80 via-forest-950 to-forest-950 opacity-90 -z-10" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-r from-forest-600/30 via-sunrise-400/20 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        
        {/* Top Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-forest-600/60 shadow-soft text-sunrise-400 text-xs font-mono font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-status-safe animate-pulse" />
            Explainable AI Farm Sentinel • Autonomous Wildlife Defense
          </div>
        </div>

        {/* Hero Content Header */}
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-extrabold text-field-100 leading-[1.08] tracking-tight">
            Protect Every Harvest <br />
            <span className="bg-gradient-to-r from-status-safe via-sunrise-400 to-emerald-300 bg-clip-text text-transparent">
              with Explainable AI Intelligence
            </span>
          </h1>

          <p className="font-body text-lg sm:text-xl text-field-100/80 max-w-2xl mx-auto font-normal leading-relaxed">
            Rakshak AI continuously monitors dusk &amp; night fields, predicts animal intrusion vectors in sub-4 seconds, and provides step-by-step transparent reasoning before crops are damaged.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-forest-600 hover:bg-forest-600/90 text-field-100 font-display font-semibold text-base shadow-glow-safe hover:shadow-soft-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <span>See Live Dashboard Demo</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full glass-panel hover:bg-forest-800 text-field-100 border border-forest-600/60 font-display font-semibold text-base shadow-soft transition-all duration-300"
            >
              <div className="w-7 h-7 rounded-full bg-forest-800 flex items-center justify-center text-sunrise-400">
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              </div>
              <span>Explore 5-Step Pipeline</span>
            </a>
          </div>
        </div>

        {/* Live Decision Example Visual (The Cow/Boar Night Decision Differentiator) */}
        <div className="mt-16 relative max-w-5xl mx-auto rounded-[24px] overflow-hidden glass-panel shadow-soft-lg border border-forest-600/60 p-4 md:p-6 bg-forest-950/80">
          
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-forest-600/40 font-mono text-xs">
            <span className="text-sunrise-400 font-bold flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              LIVE DECISION EXAMPLE • NIGHT INTRUSION SIMULATION
            </span>
            <span className="text-status-alert font-bold bg-status-alert/20 border border-status-alert/40 px-3 py-1 rounded-full">
              HIGH RISK DETECTED
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Live Night Field Visual */}
            <div className="relative aspect-[16/9] rounded-[20px] overflow-hidden bg-forest-950 border border-forest-600/50 shadow-soft">
              <img
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop"
                alt="Night Field Intrusion"
                className="w-full h-full object-cover brightness-90 contrast-110"
              />
              <div className="absolute inset-0 bg-forest-950/40 mix-blend-multiply" />

              {/* Night Laser Bounding Overlay */}
              <div className="absolute top-[30%] left-[28%] w-[38%] h-[42%] border-2 border-status-alert bg-status-alert/20 rounded-2xl p-2 animate-ring-alert">
                <div className="absolute -top-7 left-0 glass-panel px-3 py-1 rounded-lg text-xs font-mono text-status-alert font-bold flex items-center gap-1.5 border border-status-alert/50">
                  <ScanLine className="w-3.5 h-3.5" />
                  <span>Stray Cattle / Cow (Night) • 92% Conf</span>
                </div>
              </div>
            </div>

            {/* Live 4-Step Reason Card */}
            <div className="space-y-3 font-mono text-xs">
              <div className="bg-forest-800/80 border border-forest-600/50 p-3 rounded-2xl">
                <span className="text-sunrise-400 font-bold block mb-1">01. OBSERVATION:</span>
                <p className="text-field-100 font-body">Cattle (Cow) detected by Thermal Night Vision node.</p>
              </div>

              <div className="bg-forest-800/80 border border-forest-600/50 p-3 rounded-2xl">
                <span className="text-sunrise-400 font-bold block mb-1">02. CONTEXT:</span>
                <p className="text-field-100 font-body">Entered Protected Crop Zone 4 at 02:14 AM (Low Visibility).</p>
              </div>

              <div className="bg-forest-800/80 border border-forest-600/50 p-3 rounded-2xl">
                <span className="text-status-alert font-bold block mb-1">03. ASSESSMENT:</span>
                <p className="text-field-100 font-body">HIGH Threat — Risk of trampling high-value sugarcane crops.</p>
              </div>

              <div className="bg-forest-600/30 border border-status-safe/50 p-3 rounded-2xl">
                <span className="text-status-safe font-bold block mb-1">04. DECISION ACTION:</span>
                <p className="text-field-100 font-body">Trigger Strobe Light + Low-Frequency Speaker Siren.</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
