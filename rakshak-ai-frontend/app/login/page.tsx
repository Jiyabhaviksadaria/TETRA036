import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 font-bold mx-auto mb-3 text-2xl">
            🛡️
          </div>
          <h1 className="text-2xl font-black text-white">RAKSHAK AI</h1>
          <p className="text-xs text-slate-400 mt-1">Authorized Tactical Personnel Portal</p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Operator ID</label>
            <input
              type="text"
              placeholder="e.g. OFF-8942-DEF"
              className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Security Key</label>
            <input
              type="password"
              placeholder="••••••••••••"
              className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 text-sm"
            />
          </div>
          <Button variant="primary" className="w-full py-3 mt-2">
            Authenticate & Access
          </Button>
        </form>
      </GlassCard>
    </div>
  );
}
