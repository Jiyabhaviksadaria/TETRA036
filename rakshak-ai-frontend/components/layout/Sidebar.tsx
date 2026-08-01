'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Camera,
  ShieldAlert,
  BarChart3,
  Bell,
  Cpu,
  Settings,
  User,
  Shield,
  Radio,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Live Cameras', path: '/cameras', icon: Camera },
    { label: 'Threat Detection', path: '/alerts', icon: ShieldAlert },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Alerts', path: '/alerts', icon: Bell },
    { label: 'Devices', path: '/devices', icon: Cpu },
    { label: 'Settings', path: '/settings', icon: Settings },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-[#0B1F16] border-r border-[#1F5A3D]/40 flex flex-col justify-between p-5 min-h-screen shrink-0 font-inter hidden md:flex text-[#F4F1E8]">
      
      <div className="space-y-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 px-2 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1F5A3D] to-[#4ADE80] flex items-center justify-center text-white shadow-[0_0_20px_rgba(74,222,128,0.3)] group-hover:scale-105 transition-transform duration-300">
            <Shield className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-xl text-[#F4F1E8] tracking-tight">
              Rakshak <span className="text-[#4ADE80]">AI</span>
            </span>
            <span className="text-[10px] font-mono tracking-[0.2em] text-[#A3B8AD] uppercase">
              Farm Sentinel
            </span>
          </div>
        </Link>

        {/* Navigation Menu */}
        <nav className="space-y-1.5">
          <p className="px-3 text-[11px] font-mono font-semibold uppercase tracking-wider text-[#A3B8AD]/70 mb-2">
            Main Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path + item.label}
                href={item.path}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl font-display text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#123626] text-[#4ADE80] border border-[#1F5A3D]/60 shadow-[0_4px_20px_rgba(11,31,22,0.5)]'
                    : 'text-[#A3B8AD] hover:text-[#F4F1E8] hover:bg-[#123626]/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#4ADE80]' : 'text-[#A3B8AD]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Edge Sensor Node Status Card */}
      <div className="glass-card rounded-[24px] p-4 border border-[#1F5A3D]/40 bg-[#123626]/60 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#4ADE80] text-xs font-mono font-bold">
            <Radio className="w-4 h-4 animate-pulse" />
            EDGE NODE 01
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-[#4ADE80] shadow-[0_0_10px_#4ADE80]" />
        </div>
        <p className="text-xs text-[#F4F1E8] font-semibold">Green Valley Sector 4</p>
        <p className="text-[11px] text-[#A3B8AD] font-mono">Signal: 98% • Thermal ON</p>
      </div>

    </aside>
  );
};
