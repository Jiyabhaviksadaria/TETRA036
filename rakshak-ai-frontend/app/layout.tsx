import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '../context/ThemeContext';

export const metadata: Metadata = {
  title: 'Rakshak AI - Autonomous Farm Wildlife Intrusion Defense',
  description: 'AI-powered computer vision platform protecting agricultural crops from animal intrusion in real time.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 dark:bg-[#0B1F16] text-slate-900 dark:text-[#F4F1E8] min-h-screen font-inter antialiased selection:bg-[#1F5A3D] selection:text-white transition-colors duration-300">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
