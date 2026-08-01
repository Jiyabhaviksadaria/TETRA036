'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, ArrowRight, Lock } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-rakshak-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rakshak-secondaryBg via-rakshak-bg to-rakshak-bg -z-10" />

      <div className="w-full max-w-md glass-card rounded-[24px] p-8 shadow-soft-lg border border-rakshak-border space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3 justify-center mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rakshak-primary to-rakshak-accent flex items-center justify-center text-white shadow-glow">
              <Shield className="w-6 h-6" />
            </div>
          </Link>

          <h1 className="font-sora font-extrabold text-2xl text-rakshak-text">
            Welcome Back to Rakshak <span className="text-rakshak-primary">AI</span>
          </h1>
          <p className="text-xs text-rakshak-secondaryText font-inter">
            Enter your farmer account credentials to access your live sentinel network.
          </p>
        </div>

        {/* Form */}
        <form className="space-y-4 font-inter" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-xs font-semibold text-rakshak-text mb-1.5 font-sora">
              Farmer Phone Number / Email
            </label>
            <input
              type="text"
              placeholder="+91 98765 43210 or name@farm.in"
              className="w-full px-4 py-3 rounded-2xl bg-rakshak-bg border border-rakshak-border text-rakshak-text placeholder-rakshak-secondaryText text-xs focus:outline-none focus:border-rakshak-primary focus:ring-1 focus:ring-rakshak-primary transition-all font-mono"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-rakshak-text font-sora">
                Password
              </label>
              <a href="#" className="text-[11px] font-mono text-rakshak-primary hover:underline">
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              placeholder="••••••••••••"
              className="w-full px-4 py-3 rounded-2xl bg-rakshak-bg border border-rakshak-border text-rakshak-text placeholder-rakshak-secondaryText text-xs focus:outline-none focus:border-rakshak-primary focus:ring-1 focus:ring-rakshak-primary transition-all font-mono"
            />
          </div>

          <Link
            href="/dashboard"
            className="w-full py-3.5 rounded-2xl bg-rakshak-primary hover:bg-rakshak-primary/90 text-white font-sora font-semibold text-xs flex items-center justify-center gap-2 shadow-soft hover:shadow-glow transition-all duration-300 mt-4"
          >
            <span>Sign In to Sentinel Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </form>

        <div className="pt-4 border-t border-rakshak-border text-center">
          <p className="text-xs text-rakshak-secondaryText font-inter">
            Don&apos;t have a Rakshak AI node installed yet?{' '}
            <Link href="/" className="text-rakshak-primary font-semibold hover:underline">
              Request Hardware Demo
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
