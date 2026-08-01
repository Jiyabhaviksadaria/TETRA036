'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, CheckCircle2, ArrowRight } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-rakshak-darkBg text-white pt-20 pb-12 border-t border-rakshak-border/20 relative">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        
        {/* Top CTA Bar */}
        <div className="glass-card-dark rounded-[24px] p-8 md:p-12 mb-16 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-sora text-2xl md:text-3xl font-extrabold text-white">
              Ready to Secure Your Farm Harvest?
            </h3>
            <p className="text-sm font-inter text-slate-300">
              Deploy Rakshak AI vision nodes in less than 20 minutes with zero upfront hardware lock-in.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="px-8 py-4 rounded-full bg-rakshak-primary hover:bg-rakshak-accent text-white font-sora font-semibold text-base shadow-glow transition-all duration-300 shrink-0 flex items-center gap-2"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-16 border-b border-white/10">
          
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rakshak-primary to-rakshak-accent flex items-center justify-center text-white shadow-glow">
                <Shield className="w-5 h-5" />
              </div>
              <span className="font-sora font-extrabold text-xl text-white">
                Rakshak <span className="text-rakshak-accent">AI</span>
              </span>
            </Link>

            <p className="text-xs text-slate-400 font-inter leading-relaxed max-w-sm">
              Next-generation agricultural computer vision and autonomous wildlife intrusion defense system for modern farming enterprises.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>All Systems Operational (99.98% Uptime)</span>
            </div>
          </div>

          {/* Col 2: Platform */}
          <div className="space-y-3">
            <h4 className="font-sora text-sm font-bold text-white uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-xs font-inter text-slate-400">
              <li><a href="#features" className="hover:text-rakshak-accent transition-colors">Real-Time Detection</a></li>
              <li><a href="#technology" className="hover:text-rakshak-accent transition-colors">Camera Edge Nodes</a></li>
              <li><a href="#analytics" className="hover:text-rakshak-accent transition-colors">Intrusion Analytics</a></li>
              <li><Link href="/dashboard" className="hover:text-rakshak-accent transition-colors">Live Dashboard</Link></li>
            </ul>
          </div>

          {/* Col 3: Company */}
          <div className="space-y-3">
            <h4 className="font-sora text-sm font-bold text-white uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-xs font-inter text-slate-400">
              <li><a href="#" className="hover:text-rakshak-accent transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-rakshak-accent transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-rakshak-accent transition-colors">AgriTech Partners</a></li>
              <li><a href="#" className="hover:text-rakshak-accent transition-colors">Press Kit</a></li>
            </ul>
          </div>

          {/* Col 4: Legal & Contact */}
          <div className="space-y-3">
            <h4 className="font-sora text-sm font-bold text-white uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-xs font-inter text-slate-400">
              <li><a href="#" className="hover:text-rakshak-accent transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-rakshak-accent transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-rakshak-accent transition-colors">Security &amp; Ethics</a></li>
              <li><a href="#" className="hover:text-rakshak-accent transition-colors">Contact Support</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-inter gap-4">
          <p>© 2026 Rakshak AI Technologies Inc. All rights reserved.</p>
          <p className="font-mono">Designed for Next-Gen Agriculture</p>
        </div>

      </div>
    </footer>
  );
};
