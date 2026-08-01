'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, ArrowRight, Menu, X } from 'lucide-react';

export const LandingNavbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-4 transition-all duration-300">
      <div className="max-w-[1440px] mx-auto glass-nav rounded-[24px] px-6 py-3.5 flex items-center justify-between shadow-soft border border-forest-600/40">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-forest-600 flex items-center justify-center shadow-glow-safe text-status-safe transform group-hover:scale-105 transition-transform duration-300">
            <Shield className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-xl tracking-tight text-field-100 flex items-center gap-1">
              Rakshak <span className="text-status-safe">AI</span>
            </span>
            <span className="text-[10px] font-mono tracking-widest text-sunrise-400 uppercase font-semibold">
              Farm Sentinel
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 font-body text-sm font-medium text-field-100/70">
          <a href="#how-it-works" className="hover:text-status-safe transition-colors">
            How It Works
          </a>
          <a href="#features" className="hover:text-status-safe transition-colors">
            Features
          </a>
          <Link href="/dashboard" className="hover:text-status-safe transition-colors">
            Live Dashboard
          </Link>
          <a href="#analytics" className="hover:text-status-safe transition-colors">
            Analytics
          </a>
          <a href="#faq" className="hover:text-status-safe transition-colors">
            FAQ
          </a>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-field-100 hover:text-status-safe px-4 py-2 transition-colors font-display"
          >
            Login
          </Link>
          <Link
            href="/dashboard"
            className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-forest-600 hover:bg-forest-600/90 text-field-100 font-display font-semibold text-sm shadow-soft hover:shadow-glow-safe transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <span>See Live Demo</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-field-100 hover:text-status-safe transition-colors"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden mt-2 max-w-[1440px] mx-auto glass-panel rounded-[24px] p-6 shadow-soft-lg flex flex-col gap-4 text-center border border-forest-600/50 animate-in fade-in slide-in-from-top-4 duration-300">
          <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="text-field-100 font-medium py-2">
            How It Works
          </a>
          <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="text-field-100 font-medium py-2">
            Live Dashboard
          </Link>
          <a href="#faq" onClick={() => setMobileOpen(false)} className="text-field-100 font-medium py-2">
            FAQ
          </a>
          <div className="pt-2 border-t border-forest-600/40 flex flex-col gap-3">
            <Link href="/login" onClick={() => setMobileOpen(false)} className="text-field-100 font-semibold py-2">
              Login
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="w-full py-3 rounded-2xl bg-forest-600 text-field-100 font-display font-semibold text-center shadow-soft"
            >
              See Live Demo
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
