'use client';

import React from 'react';
import { TitleBar } from '@/components/layout/TitleBar';
import { Settings, Sliders, Save } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="min-h-screen font-sans">
      <TitleBar />
      <main className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto w-full">
        
        <div className="card-panel p-5">
          <h1 className="font-bold text-lg text-[#06231D] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#076653]" />
            Platform &amp; AI Sentinel Settings
          </h1>
          <p className="text-xs text-[#4C6B5C] font-sans mt-0.5">
            Configure detection sensitivity, automated deterrent thresholds, and notification routing.
          </p>
        </div>

        <div className="card-panel p-5 space-y-4 max-w-2xl">
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-[#06231D] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#076653]" />
              AI Vision Thresholds
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-3 bg-[#F2F8DC] rounded-lg border border-[#DCE8B8]">
                <div>
                  <span className="font-bold text-[#06231D]">Minimum Confidence Score</span>
                  <p className="text-[#4C6B5C]">Alerts trigger only above this confidence level (Default: 85%)</p>
                </div>
                <span className="font-mono font-bold text-[#076653] text-sm">85%</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#F2F8DC] rounded-lg border border-[#DCE8B8]">
                <div>
                  <span className="font-bold text-[#06231D]">Automated Siren Trigger</span>
                  <p className="text-[#4C6B5C]">Fire siren automatically for critical animal threats (Boar/Nilgai)</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#076653]" />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#DCE8B8] flex justify-end">
            <button type="button" className="px-5 py-2 rounded-lg bg-[#076653] hover:bg-[#0C9276] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer">
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
