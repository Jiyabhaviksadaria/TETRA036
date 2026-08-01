'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Bell, Sun, Shield, X, ShieldAlert } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Wild Boar Intrusion Warning', time: '2m ago', read: false },
    { id: 2, title: 'Zone B Siren Fired Successfully', time: '14m ago', read: false },
    { id: 3, title: 'Drone 01 Low Battery Return', time: '1h ago', read: true },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-[96px] bg-gradient-to-b from-white to-[#F8FAFC] border-b border-slate-900/10 px-[40px] flex items-center justify-between shadow-[0_12px_40px_rgba(15,23,42,0.08)] relative z-30 font-inter">
      
      {/* Left Container: Logo Area + Greeting */}
      <div className="flex items-center gap-[32px]">
        
        {/* Logo Area */}
        <Link href="/" className="flex items-center gap-3.5 pr-8 border-r border-slate-900/[0.08] min-w-[240px] group">
          {/* Logo icon */}
          <div className="w-12 h-12 rounded-[24px] bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(22,163,74,0.4)] group-hover:scale-105 transition-transform duration-300">
            <Shield className="w-6 h-6 stroke-[2.5]" />
          </div>
          {/* Text */}
          <div className="flex flex-col">
            <div className="font-display text-2xl font-extrabold tracking-tight leading-none">
              <span className="text-[#0F172A]">Rakshak </span>
              <span className="text-[#16A34A]">AI</span>
            </div>
            <span className="text-[10px] font-mono font-semibold tracking-[0.25em] uppercase text-[#94A3B8] mt-1">
              FARM SENTINEL
            </span>
          </div>
        </Link>

        {/* Greeting Section (Fade Up) */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 hidden md:block">
          <h1 className="text-[38px] font-bold text-[#0F172A] leading-[1.1] flex items-center gap-2 font-display">
            Good Morning <span className="text-3xl">🌿</span>
          </h1>
          <p className="text-[18px] font-medium text-[#64748B] mt-[8px]">
            Green Valley Organic Farm • Sector 4 Surveillance
          </p>
        </div>

      </div>

      {/* Center Search Bar (Scale In) */}
      <div className="hidden xl:flex items-center w-[400px] relative animate-in zoom-in-95 duration-300">
        <Search className="w-5 h-5 text-white/80 absolute left-4 pointer-events-none z-10" />
        <input
          type="text"
          placeholder="Search cameras, zones, animals or logs..."
          className="w-full h-[54px] bg-slate-950 border border-slate-800 rounded-full pl-12 pr-6 text-sm text-white placeholder-white/75 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition-all font-inter shadow-inner"
        />
      </div>

      {/* Right Actions: Weather + Notifications + User Avatar */}
      <div className="flex items-center gap-[32px]">
        
        {/* Weather Card (Slide Left) */}
        <div className="hidden lg:flex items-center gap-3 px-5 py-3 rounded-full bg-[#0B1F16]/90 backdrop-blur-[20px] border border-white/45 shadow-[0_12px_40px_rgba(15,23,42,0.08)] hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] animate-in slide-in-from-right-4 duration-400">
          <Sun className="w-5 h-5 text-[#FACC15] shrink-0" />
          <div className="flex items-center gap-2 text-sm font-mono">
            <span className="font-bold text-white text-base">24°C</span>
            <span className="text-white/40">•</span>
            <span className="font-medium text-slate-200">Sunny</span>
            <span className="text-white/40">•</span>
            <span className="font-medium text-slate-300">Wind 12 km/h NW</span>
          </div>
        </div>

        {/* Notification Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className="w-12 h-12 rounded-2xl bg-slate-900/10 hover:bg-slate-900/20 backdrop-blur-[20px] border border-slate-900/10 flex items-center justify-center text-[#0F172A] hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#EF4444] text-white text-xs font-mono font-bold flex items-center justify-center animate-pulse shadow-md">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-[20px] rounded-[24px] p-4 shadow-[0_12px_40px_rgba(15,23,42,0.15)] border border-slate-200 space-y-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-display font-bold text-sm text-[#0F172A]">
                  Recent Alerts & System Activity
                </span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[#64748B] hover:text-[#0F172A]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl border text-xs space-y-1 transition-colors ${
                      n.read
                        ? 'bg-slate-50 border-slate-100 text-[#64748B]'
                        : 'bg-red-50/80 border-red-200 text-[#0F172A] font-medium'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display font-semibold text-xs flex items-center gap-1.5 text-[#0F172A]">
                        <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                        {n.title}
                      </span>
                      <span className="font-mono text-[10px] text-[#64748B]">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setNotifications(notifications.map((n) => ({ ...n, read: true })))}
                className="w-full text-center text-xs font-mono text-[#16A34A] font-semibold py-1 hover:underline"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>

        {/* User Avatar & Name (Fade In) */}
        <Link
          href="/profile"
          className="flex items-center gap-3.5 group animate-in fade-in duration-300"
        >
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop"
            alt="Farmer Profile"
            className="w-[56px] h-[56px] rounded-full object-cover border-2 border-[#16A34A] shadow-md group-hover:scale-105 transition-transform duration-300"
          />
          <div className="hidden md:flex flex-col text-left">
            <span className="text-[18px] font-bold text-[#0F172A] leading-tight group-hover:text-[#16A34A] transition-colors">
              Harpreet Singh
            </span>
            <span className="text-[15px] font-medium text-[#64748B] leading-tight">
              Master Farmer
            </span>
          </div>
        </Link>

      </div>

    </header>
  );
};
