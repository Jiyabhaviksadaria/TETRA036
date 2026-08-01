'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: '📊' },
    { label: 'Alerts', path: ROUTES.ALERTS, icon: '🚨' },
    { label: 'Cameras', path: ROUTES.CAMERAS, icon: '📹' },
    { label: 'Analytics', path: ROUTES.ANALYTICS, icon: '📈' },
    { label: 'Settings', path: ROUTES.SETTINGS, icon: '⚙️' },
    { label: 'Profile', path: ROUTES.PROFILE, icon: '👤' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-800/80 bg-slate-950/60 p-4 gap-2 min-h-[calc(100vh-65px)]">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-3 py-2">
        Navigation
      </div>
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
              isActive
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-500/5'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </aside>
  );
};
