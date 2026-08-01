import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';

export const metadata: Metadata = {
  title: 'Rakshak AI - Threat Defense & Surveillance System',
  description: 'AI-powered real-time security surveillance and perimeter defense engine.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 overflow-y-auto">
            {children}
          </main>
        </div>
        <Footer />
        <MobileNav />
      </body>
    </html>
  );
}
