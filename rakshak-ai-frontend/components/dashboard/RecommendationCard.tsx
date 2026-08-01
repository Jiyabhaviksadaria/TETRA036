'use client';

import React, { useState } from 'react';
import { Check, CheckCircle2, XCircle, AlertCircle, Clock, Zap } from 'lucide-react';
import { InfoPopover } from '../ui/InfoPopover';
import { useTheme } from '../../context/ThemeContext';

interface RecommendationCardProps {
  threatLevel?: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  eta?: number;
  reasonText?: string;
  actions?: string[];
  onAccept?: () => void;
  onOverride?: () => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  threatLevel = 'CRITICAL',
  eta = 18,
  reasonText = 'Wild boar moving directly toward sugarcane crop zone at high speed during low-visibility hours.',
  actions = ['Flash High-Intensity Lights', 'Fire High-Decibel Siren', 'Notify Farmer via SMS/App'],
  onAccept,
  onOverride,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [status, setStatus] = useState<'IDLE' | 'EXECUTED' | 'OVERRIDDEN'>('IDLE');
  const [loading, setLoading] = useState(false);

  const isHighThreat = threatLevel === 'CRITICAL' || threatLevel === 'HIGH';

  const handleAccept = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStatus('EXECUTED');
      if (onAccept) onAccept();
    }, 600);
  };

  const handleOverride = () => {
    setStatus('OVERRIDDEN');
    if (onOverride) onOverride();
  };

  return (
    <div
      className={`rounded-[24px] p-6 border space-y-4 font-sans transition-all duration-300 ${
        isDark
          ? 'glass-panel bg-[#163E2D]/90 border-[#246B49]/60 text-[#F4F1E8] shadow-[0_10px_30px_rgba(14,40,28,0.8)]'
          : 'bg-white border-slate-200 text-slate-900 shadow-md'
      }`}
    >
      
      {/* Header Bar with High-Contrast Typography */}
      <div className="flex items-center justify-between pb-3 border-b border-[#246B49]/40">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#F2C879]" />
          <h3 className={`font-display font-black text-sm sm:text-base tracking-wide ${isDark ? 'text-[#F2C879]' : 'text-[#0E281C]'}`}>
            DECISION &amp; ALERT ACTIONS
          </h3>
          <InfoPopover text="Automated non-lethal deterrent action plan with manual farmer accept/override controls." />
        </div>

        {/* Threat Badge */}
        <span
          className={`text-xs font-bold font-mono px-3 py-1 rounded-full uppercase tracking-wider ${
            isHighThreat
              ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
          }`}
        >
          {threatLevel}
        </span>
      </div>

      {/* ETA & Target Context */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0E281C] border border-[#246B49]/50 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#F2C879]" />
          <span className="font-semibold text-[#A3B8AD]">REACTION ETA:</span>
        </div>
        <span className="font-extrabold text-[#F2C879] text-sm">
          {eta > 0 ? `${eta} SECONDS` : 'IMMEDIATE'}
        </span>
      </div>

      {/* Action Checklist Staggered Pill Badges */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-[#A3B8AD] uppercase tracking-wider block font-mono">
          RECOMMENDED DETERRENT ACTION SET:
        </span>

        <div className="flex flex-wrap gap-2">
          {actions.map((act, idx) => (
            <div
              key={act + idx}
              style={{ animationDelay: `${idx * 100}ms` }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0E281C] border border-[#246B49] text-[#4ADE80] text-xs font-bold shadow-sm animate-in fade-in slide-in-from-left-2 duration-200"
            >
              <Check className="w-3.5 h-3.5 text-[#4ADE80] shrink-0 stroke-[3]" />
              <span>{act}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Status Execution Notification */}
      {status === 'EXECUTED' && (
        <div className="p-3.5 rounded-2xl bg-[#4ADE80]/20 border border-[#4ADE80] text-[#4ADE80] text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />
          <span>Action Accepted — Deterrent Signals Dispatched!</span>
        </div>
      )}

      {status === 'OVERRIDDEN' && (
        <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span>Farmer Override Applied — Active Alarm Suspended</span>
        </div>
      )}

      {/* Two Always-Visible Buttons: Accept (teal filled) & Override (outline/ghost) */}
      <div className="grid grid-cols-2 gap-3 pt-1 font-display">
        <button
          type="button"
          onClick={handleAccept}
          disabled={loading}
          className="py-3 px-4 rounded-2xl bg-[#246B49] hover:bg-[#2E8B5E] text-[#F2C879] border border-[#4ADE80]/40 text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
        >
          {loading ? (
            <span className="animate-pulse">Transmitting...</span>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />
              <span>Accept Action</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleOverride}
          className="py-3 px-4 rounded-2xl bg-[#0E281C] hover:bg-[#163E2D] text-[#F4F1E8]/80 hover:text-white border border-[#246B49]/50 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <XCircle className="w-4 h-4 text-amber-400" />
          <span>Farmer Override</span>
        </button>
      </div>

    </div>
  );
};
