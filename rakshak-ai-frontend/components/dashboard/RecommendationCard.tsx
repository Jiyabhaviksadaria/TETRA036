'use client';

import React, { useState } from 'react';
import { Zap, CheckCircle2, Shield, XCircle, AlertCircle } from 'lucide-react';

interface RecommendationCardProps {
  actionText?: string;
  reasonText?: string;
  successRate?: number;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  actionText = 'Activate Zone B Strobe Light & 110dB Acoustic Siren',
  reasonText = 'High-risk intrusion into a protected sugarcane crop sector during low-visibility night conditions.',
  successRate = 94,
}) => {
  const [status, setStatus] = useState<'IDLE' | 'EXECUTED' | 'OVERRIDDEN'>('IDLE');
  const [loading, setLoading] = useState(false);

  const handleAccept = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStatus('EXECUTED');
    }, 800);
  };

  const handleOverride = () => {
    setStatus('OVERRIDDEN');
  };

  return (
    <div className="glass-panel rounded-[24px] p-6 shadow-soft-lg border border-forest-600/50 space-y-4 relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sunrise-400 text-xs font-mono font-bold">
          <Zap className="w-4 h-4 text-sunrise-400 animate-pulse" />
          <span>SMART RESPONSE ENGINE</span>
        </div>
        <span className="text-[11px] font-mono font-bold text-status-safe bg-status-safe/10 border border-status-safe/30 px-3 py-0.5 rounded-full">
          {successRate}% Repel Rate
        </span>
      </div>

      {/* Action Title */}
      <div>
        <h3 className="font-display text-base font-bold text-field-100 flex items-center gap-2">
          <Shield className="w-4 h-4 text-forest-600 fill-emerald-500/30" />
          {actionText}
        </h3>
      </div>

      {/* Reasoning Container */}
      <div className="bg-forest-950/60 border border-forest-600/30 rounded-2xl p-3.5 space-y-1">
        <span className="text-[10px] font-mono text-sunrise-400 font-bold uppercase tracking-wider block">
          AI Justification &amp; Context:
        </span>
        <p className="font-body text-xs text-field-100/90 leading-relaxed">
          {reasonText}
        </p>
      </div>

      {/* Action Buttons: Accept vs Farmer Override */}
      <div className="pt-2">
        {status === 'EXECUTED' ? (
          <div className="w-full py-3 rounded-2xl bg-status-safe/20 border border-status-safe text-status-safe font-display font-semibold text-xs flex items-center justify-center gap-2 shadow-glow-safe animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Action Accepted &amp; Deterrent Siren Fired!</span>
          </div>
        ) : status === 'OVERRIDDEN' ? (
          <div className="w-full py-3 rounded-2xl bg-status-caution/20 border border-status-caution text-status-caution font-display font-semibold text-xs flex items-center justify-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4" />
            <span>Farmer Manual Override Applied — Action Paused</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 font-display">
            <button
              onClick={handleAccept}
              disabled={loading}
              className="py-3 px-4 rounded-2xl bg-forest-600 hover:bg-forest-600/80 text-field-100 text-xs font-bold flex items-center justify-center gap-2 shadow-soft hover:shadow-glow-safe transition-all duration-300"
            >
              {loading ? (
                <span className="animate-pulse">Transmitting...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-status-safe" />
                  <span>Accept Action</span>
                </>
              )}
            </button>

            <button
              onClick={handleOverride}
              className="py-3 px-4 rounded-2xl bg-forest-800 hover:bg-forest-800/80 text-field-100/80 hover:text-field-100 border border-forest-600/40 text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <XCircle className="w-4 h-4 text-status-caution" />
              <span>Farmer Override</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
