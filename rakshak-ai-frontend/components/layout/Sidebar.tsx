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
    <aside className="w-64 bg-white border-r border-rakshak-border flex flex-col justify-between p-5 min-h-screen shrink-0 shadow-soft font-inter hidden md:flex">
      
      <div className="space-y-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rakshak-primary to-rakshak-accent flex items-center justify-center text-white shadow-glow">
            <Shield className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-sora font-extrabold text-lg text-rakshak-text tracking-tight">
              Rakshak <span className="text-rakshak-primary">AI</span>
            </span>
            <span className="text-[10px] font-mono tracking-widest text-rakshak-secondaryText uppercase">
              Farm Sentinel
            </span>
          </div>
        </Link>

        {/* Navigation Menu */}
        <nav className="space-y-1.5">
          <p className="px-3 text-[11px] font-mono font-semibold uppercase tracking-wider text-rakshak-secondaryText mb-2">
            Main Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path + item.label}
                href={item.path}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl font-sora text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-rakshak-primary text-white shadow-soft'
                    : 'text-rakshak-secondaryText hover:text-rakshak-text hover:bg-rakshak-secondaryBg'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-rakshak-primary'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Edge Sensor Node Status Card */}
      <div className="glass-card rounded-[24px] p-4 border border-rakshak-border bg-rakshak-secondaryBg/50 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rakshak-primary text-xs font-mono font-bold">
            <Radio className="w-4 h-4 animate-pulse" />
            EDGE NODE 01
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>
        <p className="text-xs text-rakshak-text font-semibold">Green Valley Sector 4</p>
        <p className="text-[11px] text-rakshak-secondaryText font-mono">Signal: 98% • Thermal ON</p>
      </div>

    </aside>
  );
};
