'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, Sparkles, ArrowRight, Menu, X } from 'lucide-react';

export const LandingNavbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-4 transition-all duration-300">
      <div className="max-w-[1440px] mx-auto glass-nav rounded-[24px] px-6 py-3.5 flex items-center justify-between shadow-soft border border-rakshak-border/60">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rakshak-primary to-rakshak-accent flex items-center justify-center shadow-glow text-white transform group-hover:scale-105 transition-transform duration-300">
            <Shield className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-sora font-extrabold text-xl tracking-tight text-rakshak-text flex items-center gap-1">
              Rakshak <span className="text-rakshak-primary">AI</span>
            </span>
            <span className="text-[10px] font-mono font-medium tracking-widest text-rakshak-secondaryText uppercase">
              Farm Protection
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 font-inter text-sm font-medium text-rakshak-secondaryText">
          <a href="#features" className="hover:text-rakshak-primary transition-colors">
            Features
          </a>
          <a href="#technology" className="hover:text-rakshak-primary transition-colors">
            Technology
          </a>
          <a href="#dashboard-preview" className="hover:text-rakshak-primary transition-colors">
            Dashboard
          </a>
          <a href="#analytics" className="hover:text-rakshak-primary transition-colors">
            Analytics
          </a>
          <a href="#pricing" className="hover:text-rakshak-primary transition-colors">
            Pricing
          </a>
          <a href="#faq" className="hover:text-rakshak-primary transition-colors">
            FAQ
          </a>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-rakshak-text hover:text-rakshak-primary px-4 py-2 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/dashboard"
            className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rakshak-primary hover:bg-rakshak-primary/90 text-white font-sora font-semibold text-sm shadow-soft hover:shadow-glow transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-rakshak-text hover:text-rakshak-primary transition-colors"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden mt-2 max-w-[1440px] mx-auto glass-card rounded-[24px] p-6 shadow-soft-lg flex flex-col gap-4 text-center border border-rakshak-border animate-in fade-in slide-in-from-top-4 duration-300">
          <a href="#features" onClick={() => setMobileOpen(false)} className="text-rakshak-text font-medium py-2">
            Features
          </a>
          <a href="#technology" onClick={() => setMobileOpen(false)} className="text-rakshak-text font-medium py-2">
            Technology
          </a>
          <a href="#dashboard-preview" onClick={() => setMobileOpen(false)} className="text-rakshak-text font-medium py-2">
            Dashboard
          </a>
          <a href="#analytics" onClick={() => setMobileOpen(false)} className="text-rakshak-text font-medium py-2">
            Analytics
          </a>
          <a href="#faq" onClick={() => setMobileOpen(false)} className="text-rakshak-text font-medium py-2">
            FAQ
          </a>
          <div className="pt-2 border-t border-rakshak-border flex flex-col gap-3">
            <Link href="/login" onClick={() => setMobileOpen(false)} className="text-rakshak-text font-semibold py-2">
              Login
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="w-full py-3 rounded-2xl bg-rakshak-primary text-white font-sora font-semibold text-center shadow-soft"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
