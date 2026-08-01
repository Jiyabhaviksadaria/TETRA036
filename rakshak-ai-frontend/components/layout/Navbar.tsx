'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Bell, Sun, Cloud, User, Check, X, ShieldAlert } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Wild Boar Intrusion Warning', time: '2m ago', read: false },
    { id: 2, title: 'Zone B Siren Fired Successfully', time: '14m ago', read: false },
    { id: 3, title: 'Drone 01 Low Battery Return', time: '1h ago', read: true },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-20 bg-white border-b border-rakshak-border px-6 flex items-center justify-between shadow-soft font-inter relative z-30">
      
      {/* Left Greeting */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="font-sora text-xl font-bold text-rakshak-text flex items-center gap-2">
            Good Morning <span className="text-xl">🌿</span>
          </h1>
          <p className="text-xs text-rakshak-secondaryText font-mono">
            Green Valley Organic Farm • Sector 4 Sector Surveillance
          </p>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="hidden lg:flex items-center w-96 relative">
        <Search className="w-4 h-4 text-rakshak-secondaryText absolute left-4" />
        <input
          type="text"
          placeholder="Search cameras, zones, animal types, or logs..."
          className="w-full bg-rakshak-bg border border-rakshak-border rounded-full py-2.5 left-10 pl-11 pr-4 text-xs text-rakshak-text focus:outline-none focus:border-rakshak-primary focus:ring-1 focus:ring-rakshak-primary transition-all font-inter"
        />
      </div>

      {/* Right Actions & Profile */}
      <div className="flex items-center gap-4">
        
        {/* Real-time Weather Widget Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rakshak-secondaryBg border border-rakshak-border text-rakshak-text text-xs font-mono">
          <Sun className="w-4 h-4 text-amber-500" />
          <span>24°C Sunny • Wind 12 km/h NW</span>
        </div>

        {/* Notifications Icon Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-2xl bg-rakshak-bg hover:bg-rakshak-secondaryBg border border-rakshak-border flex items-center justify-center text-rakshak-text relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rakshak-danger text-white text-[10px] font-mono font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 glass-card rounded-[24px] p-4 shadow-soft-lg border border-rakshak-border space-y-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-rakshak-border">
                <span className="font-sora font-bold text-xs text-rakshak-text">
                  Recent Alerts &amp; System Activity
                </span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-rakshak-secondaryText hover:text-rakshak-text"
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
                        ? 'bg-rakshak-bg border-rakshak-border text-rakshak-secondaryText'
                        : 'bg-red-50/60 border-red-200 text-rakshak-text font-medium'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-sora font-semibold text-xs flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-rakshak-danger" />
                        {n.title}
                      </span>
                      <span className="font-mono text-[10px] text-rakshak-secondaryText">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setNotifications(notifications.map((n) => ({ ...n, read: true })))}
                className="w-full text-center text-xs font-mono text-rakshak-primary font-semibold py-1 hover:underline"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <Link
          href="/profile"
          className="flex items-center gap-3 p-1 rounded-full hover:bg-rakshak-secondaryBg transition-colors"
        >
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop"
            alt="Farmer Profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-rakshak-primary shadow-soft"
          />
          <div className="hidden xl:flex flex-col text-left">
            <span className="font-sora text-xs font-bold text-rakshak-text">Harpreet Singh</span>
            <span className="text-[10px] font-mono text-rakshak-secondaryText">Master Farmer</span>
          </div>
        </Link>

      </div>

    </header>
  );
};
