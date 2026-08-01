'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { Settings, Shield, Bell, Sliders, Save } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen bg-rakshak-bg text-rakshak-text">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />
        <main className="p-4 md:p-8 space-y-8 max-w-[1440px] mx-auto w-full">
          
          <div className="glass-card p-6 rounded-[24px]">
            <h1 className="font-sora text-2xl font-bold text-rakshak-text flex items-center gap-2">
              <Settings className="w-6 h-6 text-rakshak-primary" />
              Platform &amp; AI Sentinel Settings
            </h1>
            <p className="text-xs text-rakshak-secondaryText font-inter mt-1">
              Configure detection sensitivity, automated deterrent thresholds, and notification routing.
            </p>
          </div>

          <div className="glass-card rounded-[24px] p-6 shadow-soft border border-rakshak-border space-y-6 max-w-3xl">
            <div className="space-y-4">
              <h3 className="font-sora font-bold text-base text-rakshak-text flex items-center gap-2">
                <Sliders className="w-4 h-4 text-rakshak-primary" />
                AI Vision Thresholds
              </h3>

              <div className="space-y-3 font-inter text-xs">
                <div className="flex items-center justify-between p-3 bg-rakshak-secondaryBg rounded-2xl">
                  <div>
                    <span className="font-semibold text-rakshak-text">Minimum Confidence Score</span>
                    <p className="text-rakshak-secondaryText">Alerts trigger only above this confidence level (Default: 85%)</p>
                  </div>
                  <span className="font-mono font-bold text-rakshak-primary text-sm">85%</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-rakshak-secondaryBg rounded-2xl">
                  <div>
                    <span className="font-semibold text-rakshak-text">Automated Siren Trigger</span>
                    <p className="text-rakshak-secondaryText">Fire siren automatically for critical animal threats (Boar/Elephant)</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-rakshak-primary" />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-rakshak-border flex justify-end">
              <button className="px-6 py-2.5 rounded-full bg-rakshak-primary text-white font-sora font-semibold text-xs flex items-center gap-2 shadow-soft hover:shadow-glow transition-all">
                <Save className="w-4 h-4" />
                <span>Save Configuration</span>
              </button>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
