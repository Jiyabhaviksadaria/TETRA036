'use client';

import React from 'react';
import { TitleBar } from '@/components/layout/TitleBar';
import { User, Shield, MapPin, Mail, Phone } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="min-h-screen font-sans">
      <TitleBar />
      <main className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto w-full">
        <div className="card-panel p-5 flex items-center gap-4">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop"
            alt="Harpreet Singh"
            className="w-14 h-14 rounded-full object-cover border-2 border-[#076653]"
          />
          <div>
            <h1 className="font-bold text-lg text-[#06231D]">Harpreet Singh</h1>
            <p className="text-xs text-[#076653] font-semibold">Master Farmer &amp; Farm Owner</p>
            <p className="text-[11px] text-[#4C6B5C]">Green Valley Organic Farm • Sector 4</p>
          </div>
        </div>
      </main>
    </div>
  );
}
