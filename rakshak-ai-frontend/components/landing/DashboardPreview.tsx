'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Activity, Video, AlertTriangle, ArrowRight } from 'lucide-react';

export const DashboardPreview: React.FC = () => {
  return (
    <section id="dashboard-preview" className="py-24 bg-rakshak-bg relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rakshak-secondaryBg text-rakshak-primary text-xs font-mono font-semibold uppercase tracking-wider">
            Interactive Control Center
          </div>
          <h2 className="font-sora text-3xl sm:text-4xl md:text-5xl font-bold text-rakshak-text">
            Designed for Instant Clarity &amp; Zero Stress
          </h2>
          <p className="text-base sm:text-lg text-rakshak-secondaryText font-inter">
            A single, elegant interface designed specifically for farmers to know their farm’s status in seconds.
          </p>
        </div>

        {/* Dashboard Frame Container */}
        <div className="relative max-w-6xl mx-auto rounded-[24px] overflow-hidden glass-card shadow-soft-lg border border-rakshak-border p-3 md:p-6 bg-gradient-to-b from-white via-rakshak-bg to-rakshak-secondaryBg/30">
          
          {/* Top Bar Mockup */}
          <div className="flex items-center justify-between pb-4 border-b border-rakshak-border px-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <span className="text-xs font-mono font-semibold text-rakshak-secondaryText ml-2">
                rakshak-ai-dashboard.app
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                FARM STATUS: SAFE
              </span>
            </div>
          </div>

          {/* Body Mockup Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
            
            {/* Left Main Stream Mockup */}
            <div className="lg:col-span-2 space-y-4">
              <div className="relative aspect-[16/9] rounded-[24px] overflow-hidden bg-rakshak-darkBg shadow-soft border border-rakshak-border">
                <img
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop"
                  alt="Live Camera Stream"
                  className="w-full h-full object-cover opacity-90"
                />
                
                {/* AI Overlay Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 glass-card-dark px-3 py-1.5 rounded-full text-white text-xs font-mono">
                  <Video className="w-3.5 h-3.5 text-rakshak-accent" />
                  <span>CAM-01 • Zone B Orchard (Live 60 FPS)</span>
                </div>

                {/* Simulated Detection Box */}
                <div className="absolute top-1/3 left-1/3 w-40 h-32 border-2 border-rakshak-accent bg-rakshak-accent/20 rounded-xl p-2 animate-pulse-glow">
                  <div className="absolute -top-6 left-0 bg-rakshak-darkBg text-rakshak-accent text-[11px] font-mono font-bold px-2 py-0.5 rounded border border-rakshak-accent">
                    Wild Boar Pack • 94%
                  </div>
                </div>
              </div>

              {/* Status Chips */}
              <div className="grid grid-cols-3 gap-3">
                <div className="glass-card p-3 rounded-2xl text-center">
                  <span className="text-xs font-mono text-rakshak-secondaryText">Connected Cameras</span>
                  <p className="font-mono text-lg font-bold text-rakshak-text">8 / 8 Active</p>
                </div>
                <div className="glass-card p-3 rounded-2xl text-center">
                  <span className="text-xs font-mono text-rakshak-secondaryText">Today&apos;s Alerts</span>
                  <p className="font-mono text-lg font-bold text-rakshak-primary">2 Resolved</p>
                </div>
                <div className="glass-card p-3 rounded-2xl text-center">
                  <span className="text-xs font-mono text-rakshak-secondaryText">Current Weather</span>
                  <p className="font-mono text-lg font-bold text-rakshak-text">24°C Sunny</p>
                </div>
              </div>
            </div>

            {/* Right Threat & Recommendation Cards */}
            <div className="space-y-4">
              
              {/* Threat Card */}
              <div className="glass-card rounded-[24px] p-5 shadow-soft border-l-4 border-l-rakshak-danger border-rakshak-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-rakshak-danger uppercase bg-red-50 px-2.5 py-1 rounded-full">
                    Active Threat Level: High
                  </span>
                  <span className="text-xs font-mono text-rakshak-secondaryText">120m away</span>
                </div>
                <h4 className="font-sora font-bold text-base text-rakshak-text">
                  Wild Boar Intrusion Detected
                </h4>
                <p className="text-xs text-rakshak-secondaryText font-inter">
                  Direction: Moving NW towards Sugarcane Field • Est. Arrival &lt;2 mins
                </p>
              </div>

              {/* Recommendation Card */}
              <div className="glass-card rounded-[24px] p-5 shadow-soft bg-gradient-to-br from-rakshak-secondaryBg to-white border border-rakshak-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rakshak-primary text-xs font-mono font-bold">
                    <Shield className="w-4 h-4" />
                    AI RECOMMENDED ACTION
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    94% Success
                  </span>
                </div>
                <h4 className="font-sora font-bold text-base text-rakshak-text">
                  Activate Zone B Acoustic Siren
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-full text-rakshak-secondaryText border border-rakshak-border">
                    Moving toward crops
                  </span>
                  <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-full text-rakshak-secondaryText border border-rakshak-border">
                    Large animal
                  </span>
                </div>
                <Link
                  href="/dashboard"
                  className="w-full py-2.5 rounded-xl bg-rakshak-primary text-white text-xs font-sora font-semibold text-center block shadow-soft hover:shadow-glow transition-all"
                >
                  Execute Siren Now
                </Link>
              </div>

            </div>

          </div>

          {/* CTA Banner Overlay */}
          <div className="mt-8 pt-6 border-t border-rakshak-border text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-rakshak-primary text-white font-sora font-semibold text-sm shadow-soft hover:shadow-glow transition-all"
            >
              <span>Explore Live Interactive Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
};
