'use client';

import React from 'react';
import { Eye, MapPin, AlertTriangle, ShieldCheck, Clock, ArrowRight } from 'lucide-react';

export const AIWorkflow: React.FC = () => {
  const steps = [
    {
      icon: Eye,
      step: '01',
      stage: 'Observation',
      title: 'Thermal Vision Stream',
      desc: 'Dual optical and thermal sensors capture perimeter video at 60 FPS.',
    },
    {
      icon: MapPin,
      step: '02',
      stage: 'Context',
      title: 'Field & Time Context',
      desc: 'Intrusion vector, crop type, and night visibility parameters evaluated.',
    },
    {
      icon: AlertTriangle,
      step: '03',
      stage: 'Assessment',
      title: 'Explainable Assessment',
      desc: 'Risk matrix computes threat level (SAFE / CAUTION / HIGH THREAT).',
    },
    {
      icon: ShieldCheck,
      step: '04',
      stage: 'Decision',
      title: 'Smart Deterrence',
      desc: 'Automated 1-click action recommended with Accept / Override controls.',
    },
    {
      icon: Clock,
      step: '05',
      stage: 'Timeline',
      title: 'Replay Logged Event',
      desc: 'Incident saved to immutable log with 1-click decision replay capability.',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-forest-950/90 border-y border-forest-600/40 relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-800 text-sunrise-400 text-xs font-mono font-semibold uppercase tracking-wider border border-forest-600/40">
            5-Step Autonomous Flow
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-field-100">
            How Rakshak AI Thinks &amp; Acts
          </h2>
          <p className="text-base sm:text-lg text-field-100/70 font-body">
            Not a black box — every recommendation shows its explicit reasoning chain.
          </p>
        </div>

        {/* 5-Step Horizontal Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {steps.map((s, index) => {
            const IconComponent = s.icon;
            return (
              <div key={index} className="relative group">
                <div className="glass-panel rounded-[24px] p-5 h-full shadow-soft hover:shadow-soft-lg transition-all duration-300 border border-forest-600/50 flex flex-col justify-between hover:-translate-y-1">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-forest-600/30 text-sunrise-400 flex items-center justify-center font-bold">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-xs font-bold text-emerald-400 bg-forest-800 px-2 py-0.5 rounded-full border border-forest-600/40">
                        {s.step}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sunrise-400 block mb-1">
                      {s.stage}
                    </span>

                    <h4 className="font-display font-bold text-base text-field-100 mb-2">
                      {s.title}
                    </h4>

                    <p className="font-body text-xs text-field-100/70 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>

                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-forest-600">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
