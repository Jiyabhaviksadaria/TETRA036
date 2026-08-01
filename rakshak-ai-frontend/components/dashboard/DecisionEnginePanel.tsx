'use client';

import React, { useState, useEffect } from 'react';
import { Eye, MapPin, AlertTriangle, ShieldCheck, Cpu, ArrowRight, Play, Sparkles } from 'lucide-react';
import { InfoPopover } from '../ui/InfoPopover';
import { useTheme } from '../../context/ThemeContext';

export interface DecisionPayload {
  animal: string;
  confidence: number;
  region: string;
  movement: string;
  time: string;
  threat: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  response: string;
  reason: string;
}

interface DecisionEnginePanelProps {
  payload?: DecisionPayload;
  onReplayComplete?: () => void;
}

const defaultPayload: DecisionPayload = {
  animal: 'Wild Boar (Pack of 4)',
  confidence: 94,
  region: 'Sector 4 Sugarcane Field',
  movement: 'Advancing NW Toward Crops (14 km/h)',
  time: 'Night (02:14:08 AM)',
  threat: 'HIGH',
  response: 'Zone B Strobe Light + 110dB Acoustic Siren',
  reason: 'High-risk intrusion into a protected crop area during low-visibility night conditions.',
};

export const DecisionEnginePanel: React.FC<DecisionEnginePanelProps> = ({
  payload = defaultPayload,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeStepIndex, setActiveStepIndex] = useState(4);
  const [isAnimating, setIsAnimating] = useState(false);

  // Trigger step-by-step illumination animation whenever payload changes
  useEffect(() => {
    setIsAnimating(true);
    setActiveStepIndex(0);
    const timers: NodeJS.Timeout[] = [];

    [1, 2, 3, 4].forEach((step, idx) => {
      const timer = setTimeout(() => {
        setActiveStepIndex(step);
        if (step === 4) setIsAnimating(false);
      }, (idx + 1) * 300);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [payload]);

  const steps = [
    {
      num: '01',
      stage: 'OBSERVATION',
      title: `${payload.animal} Detected`,
      detail: `Confidence: ${payload.confidence}% • Neural YOLOv8 Node`,
      icon: Eye,
      color: isDark ? 'text-[#4ADE80]' : 'text-emerald-700',
    },
    {
      num: '02',
      stage: 'CONTEXT',
      title: `${payload.region}`,
      detail: `Vector: ${payload.movement} • ${payload.time}`,
      icon: MapPin,
      color: isDark ? 'text-[#F2C879]' : 'text-amber-700',
    },
    {
      num: '03',
      stage: 'ASSESSMENT',
      title: `Threat Severity: ${payload.threat}`,
      detail: payload.reason,
      icon: AlertTriangle,
      color: payload.threat === 'HIGH' || payload.threat === 'CRITICAL' ? 'text-rose-400' : 'text-emerald-400',
    },
    {
      num: '04',
      stage: 'DECISION',
      title: payload.response,
      detail: 'Automated Non-lethal Action Transmitted to Zone B Edge Siren',
      icon: ShieldCheck,
      color: isDark ? 'text-emerald-300' : 'text-emerald-800',
    },
  ];

  return (
    <div
      className={`rounded-[24px] p-6 border space-y-6 relative overflow-hidden transition-all duration-300 ${
        isDark
          ? 'glass-panel bg-[#163E2D]/90 border-[#246B49]/60 text-[#F4F1E8] shadow-[0_10px_30px_rgba(14,40,28,0.8)]'
          : 'bg-white border-slate-200 text-slate-900 shadow-md'
      }`}
    >
      
      {/* High-Contrast Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#246B49]/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0E281C] border border-[#246B49] text-[#4ADE80] flex items-center justify-center shadow-sm">
            <Cpu className="w-5 h-5 animate-pulse text-[#4ADE80]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-display text-base sm:text-lg font-black tracking-wide ${isDark ? 'text-[#F2C879]' : 'text-[#0E281C]'}`}>
                EXPLAINABLE DECISION ENGINE (EDE)
              </h3>
              <InfoPopover text="4-step transparent reasoning pipeline detailing observation, context, threat assessment, and non-lethal action." />
            </div>
            <p className={`text-xs font-mono mt-0.5 ${isDark ? 'text-[#A3B8AD]' : 'text-slate-600'}`}>
              Transparent, human-auditable reasoning chain for farm intrusion repelling.
            </p>
          </div>
        </div>

        {/* Replay Test Trigger */}
        <button
          onClick={() => {
            setActiveStepIndex(0);
            setIsAnimating(true);
            [1, 2, 3, 4].forEach((step, idx) => {
              setTimeout(() => setActiveStepIndex(step), (idx + 1) * 300);
            });
          }}
          disabled={isAnimating}
          className={`self-start sm:self-auto px-4 py-2 rounded-full border text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm ${
            isDark
              ? 'bg-[#0E281C] hover:bg-[#246B49] text-[#F2C879] border-[#246B49]'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current text-[#F2C879]" />
          <span>{isAnimating ? 'Running Pipeline...' : 'Replay Animation'}</span>
        </button>
      </div>

      {/* 4-Step Pipeline Stepper */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isFilled = activeStepIndex >= idx + 1;

          return (
            <div
              key={idx}
              className={`rounded-[20px] p-4 border transition-all duration-500 relative flex flex-col justify-between ${
                isFilled
                  ? isDark
                    ? 'bg-[#0E281C]/90 border-[#246B49] shadow-md animate-step-fill'
                    : 'bg-emerald-50/80 border-emerald-300 shadow-sm animate-step-fill'
                  : 'bg-black/20 border-white/10 opacity-30 scale-95'
              }`}
            >
              <div>
                {/* Step Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-mono font-bold tracking-widest ${isDark ? 'text-[#F2C879]' : 'text-emerald-800'}`}>
                    STEP {step.num} • {step.stage}
                  </span>
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${isFilled ? 'bg-[#246B49]/40 text-[#4ADE80]' : 'text-slate-500'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                {/* Step Content */}
                <h4 className={`font-display text-sm font-extrabold mb-1.5 ${isFilled ? step.color : 'text-slate-500'}`}>
                  {step.title}
                </h4>

                <p className={`font-mono text-xs leading-relaxed ${isDark ? 'text-[#F4F1E8]/90' : 'text-slate-700'}`}>
                  {step.detail}
                </p>
              </div>

              {/* Connecting Connector Arrow for Desktop */}
              {idx < 3 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-[#246B49]">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Reasoning Context Footer Callout */}
      <div className={`border rounded-2xl p-4 flex items-start gap-3 ${isDark ? 'bg-[#0E281C]/70 border-[#246B49]/50' : 'bg-slate-50 border-slate-200'}`}>
        <Sparkles className="w-5 h-5 text-[#F2C879] shrink-0 mt-0.5" />
        <div>
          <span className="font-mono text-xs font-bold text-[#F2C879] uppercase tracking-wider block mb-1">
            Explainable AI Reasoning Payload:
          </span>
          <p className={`font-body text-xs leading-relaxed italic ${isDark ? 'text-[#F4F1E8]' : 'text-slate-800'}`}>
            &ldquo;{payload.reason}&rdquo;
          </p>
        </div>
      </div>

    </div>
  );
};
