'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { User, Shield, MapPin, Phone, Mail, Award } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen bg-rakshak-bg text-rakshak-text">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />
        <main className="p-4 md:p-8 space-y-8 max-w-[1440px] mx-auto w-full">
          
          <div className="glass-card p-6 rounded-[24px]">
            <h1 className="font-sora text-2xl font-bold text-rakshak-text flex items-center gap-2">
              <User className="w-6 h-6 text-rakshak-primary" />
              Farmer Profile &amp; Property Details
            </h1>
            <p className="text-xs text-rakshak-secondaryText font-inter mt-1">
              Registered farm enterprise, emergency contact numbers, and security delegation.
            </p>
          </div>

          <div className="glass-card rounded-[24px] p-6 shadow-soft border border-rakshak-border max-w-2xl space-y-6">
            <div className="flex items-center gap-5">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop"
                alt="Harpreet Singh"
                className="w-20 h-20 rounded-full object-cover border-4 border-rakshak-primary shadow-soft"
              />
              <div>
                <h2 className="font-sora text-xl font-bold text-rakshak-text">Harpreet Singh</h2>
                <p className="text-xs text-rakshak-secondaryText font-inter">Owner &amp; Lead Agronomist • Green Valley Estate</p>
                <span className="inline-block mt-2 text-[11px] font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full">
                  Verified Farm Enterprise #PJB-88392
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono pt-4 border-t border-rakshak-border">
              <div className="p-3 bg-rakshak-secondaryBg rounded-2xl flex items-center gap-3">
                <MapPin className="w-4 h-4 text-rakshak-primary" />
                <div>
                  <span className="text-[10px] text-rakshak-secondaryText block">Location</span>
                  <span className="font-bold text-rakshak-text">Sector 4, Ludhiana, Punjab</span>
                </div>
              </div>

              <div className="p-3 bg-rakshak-secondaryBg rounded-2xl flex items-center gap-3">
                <Award className="w-4 h-4 text-rakshak-primary" />
                <div>
                  <span className="text-[10px] text-rakshak-secondaryText block">Farm Area</span>
                  <span className="font-bold text-rakshak-text">120 Acres (Sugarcane &amp; Wheat)</span>
                </div>
              </div>

              <div className="p-3 bg-rakshak-secondaryBg rounded-2xl flex items-center gap-3">
                <Phone className="w-4 h-4 text-rakshak-primary" />
                <div>
                  <span className="text-[10px] text-rakshak-secondaryText block">Emergency SOS Phone</span>
                  <span className="font-bold text-rakshak-text">+91 98765 43210</span>
                </div>
              </div>

              <div className="p-3 bg-rakshak-secondaryBg rounded-2xl flex items-center gap-3">
                <Mail className="w-4 h-4 text-rakshak-primary" />
                <div>
                  <span className="text-[10px] text-rakshak-secondaryText block">Alert Email</span>
                  <span className="font-bold text-rakshak-text">harpreet@greenvalleyfarms.in</span>
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
