'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Play, ShieldCheck, Zap, Activity, ScanLine } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden bg-rakshak-bg">
      {/* Background Graphic Effects & Sunlight Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rakshak-secondaryBg via-rakshak-bg to-rakshak-bg opacity-90 -z-10" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-r from-rakshak-accent/20 to-rakshak-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        
        {/* Top Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-rakshak-accent/30 shadow-soft text-rakshak-primary text-xs font-mono font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-rakshak-accent animate-pulse" />
            Next-Gen AI Perimeter Defense Engine for Agriculture
          </div>
        </div>

        {/* Hero Content Header */}
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="font-sora text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-rakshak-text leading-[1.1] tracking-tight">
            Protect Every Harvest <br />
            <span className="bg-gradient-to-r from-rakshak-primary via-rakshak-accent to-emerald-600 bg-clip-text text-transparent">
              with AI Intelligence
            </span>
          </h1>

          <p className="font-inter text-lg sm:text-xl text-rakshak-secondaryText max-w-2xl mx-auto font-normal leading-relaxed">
            Rakshak AI continuously monitors your farm, detects wildlife intrusion in real time, and provides intelligent recommendations before crops are damaged.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-rakshak-primary hover:bg-rakshak-primary/90 text-white font-sora font-semibold text-base shadow-glow hover:shadow-soft-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <span>Start Monitoring</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <a
              href="#dashboard-preview"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full glass-card hover:bg-white text-rakshak-text border border-rakshak-border font-sora font-semibold text-base shadow-soft transition-all duration-300"
            >
              <div className="w-7 h-7 rounded-full bg-rakshak-secondaryBg flex items-center justify-center text-rakshak-primary">
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              </div>
              <span>Watch Demo</span>
            </a>
          </div>
        </div>

        {/* Hero Image Container with Simulated Drone & Camera Overlay */}
        <div className="mt-16 relative max-w-5xl mx-auto rounded-[24px] overflow-hidden shadow-soft-lg border border-rakshak-border/80 group">
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-rakshak-darkBg">
            {/* Cinematic Farmland Image */}
            <img
              src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop"
              alt="Rakshak AI Farm Monitoring"
              className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-rakshak-darkBg/80 via-transparent to-black/30" />

            {/* AI Scanning Lines & Laser Overlay */}
            <div className="absolute inset-0 border-[2px] border-rakshak-accent/30 pointer-events-none rounded-[24px]" />
            <div className="absolute top-4 left-6 flex items-center gap-3 glass-card-dark px-4 py-2 rounded-full text-white text-xs font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span>LIVE DRONE FEED • CAM-01 ORCHARD PERIMETER</span>
            </div>

            {/* AI Bounding Box Simulation 1 */}
            <div className="absolute top-[35%] left-[28%] w-[22%] h-[28%] border-2 border-rakshak-accent bg-rakshak-accent/10 rounded-xl p-2 animate-pulse-glow">
              <div className="absolute -top-7 left-0 glass-card-dark px-2.5 py-1 rounded-md text-[11px] font-mono text-rakshak-accent font-semibold flex items-center gap-1.5 shadow-soft">
                <ScanLine className="w-3.5 h-3.5" />
                <span>Wild Boar (Pack) • 94%</span>
              </div>
            </div>

            {/* AI Bounding Box Simulation 2 */}
            <div className="absolute bottom-[25%] right-[22%] w-[18%] h-[22%] border-2 border-rakshak-warning bg-rakshak-warning/10 rounded-xl p-2">
              <div className="absolute -top-7 left-0 glass-card-dark px-2.5 py-1 rounded-md text-[11px] font-mono text-rakshak-warning font-semibold flex items-center gap-1.5">
                <ScanLine className="w-3.5 h-3.5" />
                <span>Nilgai • 88%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Glass Metric Badges (4 Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-12 max-w-5xl mx-auto">
          <div className="glass-card rounded-[24px] p-6 shadow-soft hover:shadow-soft-lg transition-all duration-300 border border-rakshak-border/80 text-center">
            <div className="w-10 h-10 rounded-2xl bg-rakshak-secondaryBg text-rakshak-primary flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="font-mono text-3xl md:text-4xl font-bold text-rakshak-text">
              98.7%
            </div>
            <div className="text-xs font-inter font-medium text-rakshak-secondaryText mt-1">
              Detection Accuracy
            </div>
          </div>

          <div className="glass-card rounded-[24px] p-6 shadow-soft hover:shadow-soft-lg transition-all duration-300 border border-rakshak-border/80 text-center">
            <div className="w-10 h-10 rounded-2xl bg-rakshak-secondaryBg text-rakshak-primary flex items-center justify-center mx-auto mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <div className="font-mono text-3xl md:text-4xl font-bold text-rakshak-text">
              &lt;4 sec
            </div>
            <div className="text-xs font-inter font-medium text-rakshak-secondaryText mt-1">
              Avg Detection Time
            </div>
          </div>

          <div className="glass-card rounded-[24px] p-6 shadow-soft hover:shadow-soft-lg transition-all duration-300 border border-rakshak-border/80 text-center">
            <div className="w-10 h-10 rounded-2xl bg-rakshak-secondaryBg text-rakshak-primary flex items-center justify-center mx-auto mb-3">
              <Activity className="w-5 h-5" />
            </div>
            <div className="font-mono text-3xl md:text-4xl font-bold text-rakshak-text">
              24/7
            </div>
            <div className="text-xs font-inter font-medium text-rakshak-secondaryText mt-1">
              Continuous Monitoring
            </div>
          </div>

          <div className="glass-card rounded-[24px] p-6 shadow-soft hover:shadow-soft-lg transition-all duration-300 border border-rakshak-border/80 text-center">
            <div className="w-10 h-10 rounded-2xl bg-rakshak-secondaryBg text-rakshak-primary flex items-center justify-center mx-auto mb-3">
              <ScanLine className="w-5 h-5" />
            </div>
            <div className="font-mono text-3xl md:text-4xl font-bold text-rakshak-text">
              12+
            </div>
            <div className="text-xs font-inter font-medium text-rakshak-secondaryText mt-1">
              Supported Animal Types
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
