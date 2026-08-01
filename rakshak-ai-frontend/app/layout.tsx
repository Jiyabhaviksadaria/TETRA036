import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en">
      <body className="bg-rakshak-bg text-rakshak-text min-h-screen font-inter antialiased selection:bg-rakshak-primary selection:text-white">
        {children}
      </body>
    </html>
  );
}
