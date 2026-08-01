'use client';

import React from 'react';
import { Camera, Eye, AlertTriangle, Bell, Zap, FileCheck, ArrowRight } from 'lucide-react';

export const AIWorkflow: React.FC = () => {
  const steps = [
    {
      icon: Camera,
      step: '01',
      title: 'Camera Capture',
      desc: '4K thermal & optical cameras stream live perimeter video 24/7.',
    },
    {
      icon: Eye,
      step: '02',
      title: 'AI Detection',
      desc: 'YOLOv8 vision models detect animal shape & bounding coordinates in <4s.',
    },
    {
      icon: AlertTriangle,
      step: '03',
      title: 'Threat Classification',
      desc: 'Species, pack size, movement vector, and arrival danger are computed.',
    },
    {
      icon: Bell,
      step: '04',
      title: 'Farmer Alert',
      desc: 'Instant high-priority notification pushed to mobile and web dashboard.',
    },
    {
      icon: Zap,
      step: '05',
      title: 'Recommended Action',
      desc: 'One-click siren, ultrasound, or strobe deterrence trigger presented.',
    },
    {
      icon: FileCheck,
      step: '06',
      title: 'Incident Logged',
      desc: 'Event analytics & farm intrusion heatmaps automatically updated.',
    },
  ];

  return (
    <section id="technology" className="py-24 bg-rakshak-secondaryBg/30 border-y border-rakshak-border/60 relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rakshak-secondaryBg text-rakshak-primary text-xs font-mono font-semibold uppercase tracking-wider">
            Autonomous Pipeline
          </div>
          <h2 className="font-sora text-3xl sm:text-4xl md:text-5xl font-bold text-rakshak-text">
            From Detection to Action in Seconds
          </h2>
          <p className="text-base sm:text-lg text-rakshak-secondaryText font-inter">
            How Rakshak AI processes field data to protect your crops automatically.
          </p>
        </div>

        {/* Workflow Steps Horizontal Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 relative">
          {steps.map((s, index) => {
            const IconComponent = s.icon;
            return (
              <div key={index} className="relative group">
                <div className="glass-card rounded-[24px] p-5 h-full shadow-soft hover:shadow-soft-lg transition-all duration-300 border border-rakshak-border/80 flex flex-col justify-between hover:-translate-y-1">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-rakshak-primary/10 text-rakshak-primary flex items-center justify-center font-bold">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-xs font-bold text-rakshak-accent bg-rakshak-secondaryBg px-2 py-0.5 rounded-full">
                        {s.step}
                      </span>
                    </div>

                    <h4 className="font-sora font-bold text-base text-rakshak-text mb-2">
                      {s.title}
                    </h4>

                    <p className="font-inter text-xs text-rakshak-secondaryText leading-relaxed">
                      {s.desc}
                    </p>
                  </div>

                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-rakshak-primary/40">
                      <ArrowRight className="w-5 h-5" />
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
