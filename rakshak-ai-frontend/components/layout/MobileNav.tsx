'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

export const MobileNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: '📊' },
    { label: 'Alerts', path: ROUTES.ALERTS, icon: '🚨' },
    { label: 'Cameras', path: ROUTES.CAMERAS, icon: '📹' },
    { label: 'Analytics', path: ROUTES.ANALYTICS, icon: '📈' },
    { label: 'Settings', path: ROUTES.SETTINGS, icon: '⚙️' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 px-2 py-2 flex items-center justify-around">
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center gap-1 p-2 text-xs font-medium ${
              isActive ? 'text-cyan-400' : 'text-slate-400'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
