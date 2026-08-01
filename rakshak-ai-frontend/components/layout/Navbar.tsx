'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Bell, Sun, Moon, ShieldAlert, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Wild Boar Intrusion Warning', time: '2m ago', read: false },
    { id: 2, title: 'Zone B Siren Fired Successfully', time: '14m ago', read: false },
    { id: 3, title: 'Drone 01 Low Battery Return', time: '1h ago', read: true },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const isDark = theme === 'dark';

  return (
    <header
      className={`h-20 border-b px-6 flex items-center justify-between transition-colors duration-300 relative z-30 font-inter ${
        isDark
          ? 'bg-[#0B1F16] border-[#1F5A3D]/40 text-[#F4F1E8] shadow-[0_10px_30px_rgba(11,31,22,0.8)]'
          : 'bg-white border-slate-200 text-[#0F172A] shadow-sm'
      }`}
    >
      
      {/* Left Greeting & Subtitle */}
      <div className="flex items-center gap-4">
        <div className="animate-in fade-in slide-in-from-left-2 duration-300">
          <h1
            className={`text-xl md:text-2xl font-bold leading-tight flex items-center gap-2 font-display ${
              isDark ? 'text-[#F4F1E8]' : 'text-[#0F172A]'
            }`}
          >
            Good Morning <span className="text-xl md:text-2xl">🌿</span>
          </h1>
          <p
            className={`text-xs md:text-sm font-mono mt-0.5 ${
              isDark ? 'text-[#A3B8AD]' : 'text-[#64748B]'
            }`}
          >
            Green Valley Organic Farm • Sector 4 Surveillance
          </p>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="hidden lg:flex items-center w-80 xl:w-96 relative animate-in zoom-in-95 duration-300">
        <Search
          className={`w-4 h-4 absolute left-4 pointer-events-none z-10 ${
            isDark ? 'text-[#A3B8AD]' : 'text-[#64748B]'
          }`}
        />
        <input
          type="text"
          placeholder="Search cameras, zones, animals or logs..."
          className={`w-full h-11 border rounded-full pl-11 pr-4 text-xs transition-all font-inter shadow-inner ${
            isDark
              ? 'bg-[#123626]/80 border-[#1F5A3D]/50 text-[#F4F1E8] placeholder-[#A3B8AD]/70 focus:border-[#4ADE80] focus:ring-1 focus:ring-[#4ADE80]/30'
              : 'bg-slate-100 border-slate-200 text-[#0F172A] placeholder-[#64748B] focus:border-[#1F5A3D] focus:ring-1 focus:ring-[#1F5A3D]/30'
          }`}
        />
      </div>

      {/* Right Actions: Theme Toggle + Weather + Notifications + User Avatar */}
      <div className="flex items-center gap-3 md:gap-4">
        
        {/* Real-time Weather Widget Pill */}
        <div
          className={`hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-full border shadow-sm transition-all duration-300 ${
            isDark
              ? 'bg-[#123626]/90 border-[#1F5A3D]/50 text-[#F4F1E8]'
              : 'bg-slate-100/90 border-slate-200 text-[#0F172A]'
          }`}
        >
          <Sun className="w-4 h-4 text-[#FACC15] shrink-0" />
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="font-bold">24°C</span>
            <span className={isDark ? 'text-[#A3B8AD]' : 'text-[#64748B]'}>Sunny</span>
            <span className={isDark ? 'text-[#A3B8AD]/40' : 'text-slate-300'}>•</span>
            <span className={isDark ? 'text-[#A3B8AD]' : 'text-[#64748B]'}>Wind 12 km/h NW</span>
          </div>
        </div>

        {/* ☀️ / 🌙 Night & Day Mode Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          title={isDark ? 'Switch to Day Mode (Light Theme)' : 'Switch to Night Mode (Dark Theme)'}
          className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all duration-300 hover:scale-105 active:scale-95 ${
            isDark
              ? 'bg-[#123626]/80 hover:bg-[#123626] border-[#1F5A3D]/50 text-[#FACC15]'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-amber-500 shadow-sm'
          }`}
        >
          {isDark ? (
            <Moon className="w-4 h-4 fill-[#FACC15] text-[#FACC15]" />
          ) : (
            <Sun className="w-4 h-4 fill-amber-500 text-amber-500" />
          )}
        </button>

        {/* Notification Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className={`w-10 h-10 rounded-2xl border flex items-center justify-center transition-all duration-200 relative ${
              isDark
                ? 'bg-[#123626]/80 hover:bg-[#123626] border-[#1F5A3D]/50 text-[#F4F1E8]'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-[#0F172A]'
            }`}
          >
            <Bell className={`w-4 h-4 ${isDark ? 'text-[#A3B8AD]' : 'text-[#64748B]'}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[10px] font-mono font-bold flex items-center justify-center animate-pulse shadow-md">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div
              className={`absolute right-0 mt-3 w-80 backdrop-blur-[20px] rounded-[24px] p-4 border space-y-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200 ${
                isDark
                  ? 'bg-[#123626]/95 border-[#1F5A3D]/60 text-[#F4F1E8] shadow-[0_20px_40px_rgba(11,31,22,0.9)]'
                  : 'bg-white/95 border-slate-200 text-[#0F172A] shadow-lg'
              }`}
            >
              <div
                className={`flex items-center justify-between pb-2 border-b ${
                  isDark ? 'border-[#1F5A3D]/40' : 'border-slate-100'
                }`}
              >
                <span className="font-display font-bold text-xs">
                  Recent Alerts & System Activity
                </span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className={isDark ? 'text-[#A3B8AD] hover:text-[#F4F1E8]' : 'text-[#64748B] hover:text-[#0F172A]'}
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
                        ? isDark
                          ? 'bg-[#0B1F16]/60 border-[#1F5A3D]/30 text-[#A3B8AD]'
                          : 'bg-slate-50 border-slate-100 text-[#64748B]'
                        : isDark
                        ? 'bg-red-950/40 border-red-500/40 text-[#F4F1E8] font-medium'
                        : 'bg-red-50 border-red-200 text-[#0F172A] font-medium'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display font-semibold text-xs flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-[#EF4444]" />
                        {n.title}
                      </span>
                      <span className={`font-mono text-[10px] ${isDark ? 'text-[#A3B8AD]' : 'text-[#64748B]'}`}>
                        {n.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setNotifications(notifications.map((n) => ({ ...n, read: true })))}
                className={`w-full text-center text-xs font-mono font-semibold py-1 hover:underline ${
                  isDark ? 'text-[#4ADE80]' : 'text-emerald-600'
                }`}
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>

        {/* User Avatar & Name */}
        <Link
          href="/profile"
          className={`flex items-center gap-3 p-1 rounded-full transition-colors group ${
            isDark ? 'hover:bg-[#123626]/60' : 'hover:bg-slate-100'
          }`}
        >
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop"
            alt="Farmer Profile"
            className="w-11 h-11 rounded-full object-cover border-2 border-[#4ADE80] shadow-[0_0_12px_rgba(74,222,128,0.3)] group-hover:scale-105 transition-transform duration-200"
          />
          <div className="hidden xl:flex flex-col text-left">
            <span
              className={`font-display text-xs font-bold leading-tight transition-colors ${
                isDark ? 'text-[#F4F1E8] group-hover:text-[#4ADE80]' : 'text-[#0F172A] group-hover:text-emerald-600'
              }`}
            >
              Harpreet Singh
            </span>
            <span className={`text-[10px] font-mono ${isDark ? 'text-[#A3B8AD]' : 'text-[#64748B]'}`}>
              Master Farmer
            </span>
          </div>
        </Link>

      </div>

    </header>
  );
};
