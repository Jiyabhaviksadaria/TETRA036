'use client';

import React, { useState } from 'react';
import { Sparkles, Zap, CheckCircle2, Shield } from 'lucide-react';

export const RecommendationCard: React.FC = () => {
  const [activated, setActivated] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleExecute = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setActivated(true);
    }, 1200);
  };

  return (
    <div className="glass-card rounded-[24px] p-6 shadow-soft bg-gradient-to-br from-rakshak-secondaryBg/70 via-white to-white border border-rakshak-border space-y-4 relative overflow-hidden">
      
      {/* Header AI Assistant Pill */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-rakshak-primary text-xs font-mono font-bold">
          <Sparkles className="w-4 h-4 text-rakshak-accent animate-pulse" />
          <span>AI RECOMMENDATION ENGINE</span>
        </div>
        <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full">
          94% Estimated Success
        </span>
      </div>

      {/* Recommended Action */}
      <div>
        <h3 className="font-sora text-lg font-bold text-rakshak-text flex items-center gap-2">
          <Shield className="w-5 h-5 text-rakshak-primary" />
          Activate Zone B High-Frequency Siren
        </h3>
        <p className="text-xs text-rakshak-secondaryText font-inter mt-1">
          Triggers multi-directional ultrasonic pulse &amp; 110dB acoustic deterrent.
        </p>
      </div>

      {/* Reason Tags */}
      <div>
        <p className="text-[11px] font-mono text-rakshak-secondaryText uppercase tracking-wider mb-2">
          AI Risk Drivers &amp; Context:
        </p>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[11px] font-mono bg-white text-rakshak-text px-3 py-1 rounded-full border border-rakshak-border shadow-soft">
            Moving toward crops
          </span>
          <span className="text-[11px] font-mono bg-white text-rakshak-text px-3 py-1 rounded-full border border-rakshak-border shadow-soft">
            Large animal pack
          </span>
          <span className="text-[11px] font-mono bg-white text-rakshak-text px-3 py-1 rounded-full border border-rakshak-border shadow-soft">
            Fast movement (14 km/h)
          </span>
          <span className="text-[11px] font-mono bg-white text-rakshak-text px-3 py-1 rounded-full border border-rakshak-border shadow-soft">
            Repeated intrusion zone
          </span>
        </div>
      </div>

      {/* One Click Execute Action */}
      <div className="pt-2">
        {activated ? (
          <div className="w-full py-3 rounded-2xl bg-emerald-700 text-white font-sora font-semibold text-xs flex items-center justify-center gap-2 shadow-soft animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Zone B Siren Fired Successfully! Animal Repelled</span>
          </div>
        ) : (
          <button
            onClick={handleExecute}
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-rakshak-primary hover:bg-rakshak-primary/90 text-white font-sora font-semibold text-xs flex items-center justify-center gap-2 shadow-soft hover:shadow-glow transition-all duration-300"
          >
            {loading ? (
              <span className="animate-pulse">Transmitting Signal to Speaker Node...</span>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Execute Zone B Siren Now</span>
              </>
            )}
          </button>
        )}
      </div>

    </div>
  );
};
