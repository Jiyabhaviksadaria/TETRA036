'use client';

import React, { useState, useEffect } from 'react';
import { Eye, MapPin, AlertTriangle, ShieldCheck, Cpu, ArrowRight, Play, Sparkles } from 'lucide-react';

export interface DecisionPayload {
  animal: string;
  confidence: number;
  region: string;
  movement: string;
  time: string;
  threat: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH';
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
      }, (idx + 1) * 350);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [payload]);

  const steps = [
    {
      num: '01',
      stage: 'Observation',
      title: `${payload.animal} Detected`,
      detail: `Confidence: ${payload.confidence}% • Neural YOLOv8 Node`,
      icon: Eye,
      color: 'text-emerald-400',
    },
    {
      num: '02',
      stage: 'Context',
      title: `${payload.region}`,
      detail: `Vector: ${payload.movement} • ${payload.time}`,
      icon: MapPin,
      color: 'text-amber-400',
    },
    {
      num: '03',
      stage: 'Assessment',
      title: `Threat Severity: ${payload.threat}`,
      detail: payload.reason,
      icon: AlertTriangle,
      color: payload.threat === 'HIGH' ? 'text-rose-400' : 'text-emerald-400',
    },
    {
      num: '04',
      stage: 'Decision',
      title: payload.response,
      detail: 'Automated 1-Click Action Transmitted to Zone B Edge Siren',
      icon: ShieldCheck,
      color: 'text-emerald-300',
    },
  ];

  return (
    <div className="glass-panel rounded-[24px] p-6 shadow-soft-lg border border-forest-600/50 space-y-6 relative overflow-hidden">
      
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-forest-600/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-forest-600/30 border border-forest-600/60 text-emerald-400 flex items-center justify-center shadow-soft">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-lg font-bold text-field-100">
                Explainable Decision Engine (EDE)
              </h3>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sunrise-400 bg-sunrise-400/10 border border-sunrise-400/30 px-2.5 py-0.5 rounded-full">
                4-Stage Pipeline
              </span>
            </div>
            <p className="text-xs text-forest-600/90 font-body text-field-100/70 mt-0.5">
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
              setTimeout(() => setActiveStepIndex(step), (idx + 1) * 350);
            });
          }}
          disabled={isAnimating}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-forest-800 hover:bg-forest-600 text-sunrise-400 border border-forest-600/60 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-soft"
        >
          <Play className="w-3 h-3 fill-current" />
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
                  ? 'bg-forest-800/90 border-forest-600 shadow-soft animate-step-fill'
                  : 'bg-forest-950/40 border-forest-600/20 opacity-30 scale-95'
              }`}
            >
              <div>
                {/* Step Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono font-bold text-sunrise-400 uppercase tracking-widest">
                    Step {step.num} • {step.stage}
                  </span>
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${isFilled ? 'bg-forest-600/40 text-emerald-300' : 'text-field-100/40'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                {/* Step Content */}
                <h4 className={`font-display text-sm font-bold mb-1.5 ${isFilled ? step.color : 'text-field-100/40'}`}>
                  {step.title}
                </h4>

                <p className="font-body text-xs text-field-100/80 leading-relaxed">
                  {step.detail}
                </p>
              </div>

              {/* Connecting Connector Arrow for Desktop */}
              {idx < 3 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-forest-600">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Reasoning Context Footer Callout */}
      <div className="bg-forest-800/60 border border-forest-600/40 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-sunrise-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-mono text-xs font-bold text-sunrise-400 uppercase tracking-wider block mb-1">
            Explainable AI Reasoning Payload:
          </span>
          <p className="font-body text-xs text-field-100 leading-relaxed italic">
            &ldquo;{payload.reason}&rdquo;
          </p>
        </div>
      </div>

    </div>
  );
};
