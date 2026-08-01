'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Bell, Sun, ShieldAlert, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Wild Boar Intrusion Warning', time: '2m ago', read: false },
    { id: 2, title: 'Zone B Siren Fired Successfully', time: '14m ago', read: false },
    { id: 3, title: 'Drone 01 Low Battery Return', time: '1h ago', read: true },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-20 bg-[#0B1F16] border-b border-[#1F5A3D]/40 px-6 flex items-center justify-between shadow-[0_10px_30px_rgba(11,31,22,0.8)] relative z-30 font-inter text-[#F4F1E8]">
      
      {/* Left Greeting & Subtitle */}
      <div className="flex items-center gap-4">
        <div className="animate-in fade-in slide-in-from-left-2 duration-300">
          <h1 className="text-xl md:text-2xl font-bold text-[#F4F1E8] leading-tight flex items-center gap-2 font-display">
            Good Morning <span className="text-xl md:text-2xl">🌿</span>
          </h1>
          <p className="text-xs md:text-sm font-mono text-[#A3B8AD] mt-0.5">
            Green Valley Organic Farm • Sector 4 Surveillance
          </p>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="hidden lg:flex items-center w-80 xl:w-96 relative animate-in zoom-in-95 duration-300">
        <Search className="w-4 h-4 text-[#A3B8AD] absolute left-4 pointer-events-none z-10" />
        <input
          type="text"
          placeholder="Search cameras, zones, animals or logs..."
          className="w-full h-11 bg-[#123626]/80 border border-[#1F5A3D]/50 rounded-full pl-11 pr-4 text-xs text-[#F4F1E8] placeholder-[#A3B8AD]/70 focus:outline-none focus:border-[#4ADE80] focus:ring-1 focus:ring-[#4ADE80]/30 transition-all font-inter shadow-inner"
        />
      </div>

      {/* Right Actions: Weather + Notifications + User Avatar */}
      <div className="flex items-center gap-4">
        
        {/* Real-time Weather Widget Pill */}
        <div className="hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#123626]/90 border border-[#1F5A3D]/50 shadow-sm hover:-translate-y-0.5 transition-all duration-300">
          <Sun className="w-4 h-4 text-[#FACC15] shrink-0 animate-spin-slow" />
          <div className="flex items-center gap-2 text-xs font-mono text-[#F4F1E8]">
            <span className="font-bold text-[#F4F1E8]">24°C</span>
            <span className="text-[#A3B8AD]">Sunny</span>
            <span className="text-[#A3B8AD]/40">•</span>
            <span className="text-[#A3B8AD]">Wind 12 km/h NW</span>
          </div>
        </div>

        {/* Notification Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className="w-10 h-10 rounded-2xl bg-[#123626]/80 hover:bg-[#123626] border border-[#1F5A3D]/50 flex items-center justify-center text-[#F4F1E8] hover:-translate-y-0.5 transition-all duration-200 relative"
          >
            <Bell className="w-4 h-4 text-[#A3B8AD]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[10px] font-mono font-bold flex items-center justify-center animate-pulse shadow-md">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-[#123626]/95 backdrop-blur-[20px] rounded-[24px] p-4 shadow-[0_20px_40px_rgba(11,31,22,0.9)] border border-[#1F5A3D]/60 space-y-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-[#1F5A3D]/40">
                <span className="font-display font-bold text-xs text-[#F4F1E8]">
                  Recent Alerts & System Activity
                </span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[#A3B8AD] hover:text-[#F4F1E8]"
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
                        ? 'bg-[#0B1F16]/60 border-[#1F5A3D]/30 text-[#A3B8AD]'
                        : 'bg-red-950/40 border-red-500/40 text-[#F4F1E8] font-medium'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display font-semibold text-xs flex items-center gap-1.5 text-[#F4F1E8]">
                        <ShieldAlert className="w-3.5 h-3.5 text-[#EF4444]" />
                        {n.title}
                      </span>
                      <span className="font-mono text-[10px] text-[#A3B8AD]">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setNotifications(notifications.map((n) => ({ ...n, read: true })))}
                className="w-full text-center text-xs font-mono text-[#4ADE80] font-semibold py-1 hover:underline"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>

        {/* User Avatar & Name */}
        <Link
          href="/profile"
          className="flex items-center gap-3 p-1 rounded-full hover:bg-[#123626]/60 transition-colors group"
        >
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop"
            alt="Farmer Profile"
            className="w-11 h-11 rounded-full object-cover border-2 border-[#4ADE80] shadow-[0_0_12px_rgba(74,222,128,0.3)] group-hover:scale-105 transition-transform duration-200"
          />
          <div className="hidden xl:flex flex-col text-left">
            <span className="font-display text-xs font-bold text-[#F4F1E8] leading-tight group-hover:text-[#4ADE80] transition-colors">
              Harpreet Singh
            </span>
            <span className="text-[10px] font-mono text-[#A3B8AD]">
              Master Farmer
            </span>
          </div>
        </Link>

      </div>

    </header>
  );
};
