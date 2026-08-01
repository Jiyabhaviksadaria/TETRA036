'use client';

import React from 'react';
import {
  Scan,
  Video,
  BrainCircuit,
  Lightbulb,
  Compass,
  Moon,
  CloudSun,
  BarChart3,
  ArrowUpRight,
} from 'lucide-react';

export const FeatureGrid: React.FC = () => {
  const features = [
    {
      icon: Scan,
      title: 'Real-Time Detection',
      description: 'Sub-4-second neural identification of animal intrusion across all camera zones with 98.7% precision.',
      badge: 'Core Engine',
    },
    {
      icon: Video,
      title: 'Live Camera Monitoring',
      description: 'Multi-channel 4K video streams with custom AI bounding box overlays and perimeter scan lines.',
      badge: 'Surveillance',
    },
    {
      icon: BrainCircuit,
      title: 'AI Threat Analysis',
      description: 'Instant classification of threat severity based on animal size, speed, pack behavior, and target field.',
      badge: 'Intelligence',
    },
    {
      icon: SmartRecommendationsIcon,
      title: 'Smart Recommendations',
      description: 'Automated actionable deterrence advice (acoustic sirens, strobe lights, ultrasound, drone deployment).',
      badge: 'Actionable',
    },
    {
      icon: Compass,
      title: 'Animal Tracking',
      description: 'Vector-based movement direction estimation and time-to-crop arrival calculation.',
      badge: 'Predictive',
    },
    {
      icon: Moon,
      title: 'Night Vision Capabilities',
      description: 'Thermal spectrum scanning and low-light enhancement for uninterrupted 24/7 night coverage.',
      badge: '24/7 Defense',
    },
    {
      icon: CloudSun,
      title: 'Weather Awareness',
      description: 'Real-time wind, rainfall, and visibility integration for adaptive sensor sensitivity.',
      badge: 'Contextual',
    },
    {
      icon: BarChart3,
      title: 'Farm Analytics',
      description: 'Deep intrusion heatmaps, species frequency charts, and response efficiency reporting.',
      badge: 'Reporting',
    },
  ];

  function SmartRecommendationsIcon(props: any) {
    return <Lightbulb {...props} />;
  }

  return (
    <section id="features" className="py-24 bg-rakshak-bg relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rakshak-secondaryBg text-rakshak-primary text-xs font-mono font-semibold uppercase tracking-wider">
            Autonomous Farm Security
          </div>
          <h2 className="font-sora text-3xl sm:text-4xl md:text-5xl font-bold text-rakshak-text">
            Engineered for Comprehensive <br />
            Field Security &amp; Crop Protection
          </h2>
          <p className="text-base sm:text-lg text-rakshak-secondaryText font-inter">
            Combining state-of-the-art computer vision with field-ready automation so you never lose a harvest to unexpected intruders.
          </p>
        </div>

        {/* 8 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="group glass-card rounded-[24px] p-6 shadow-soft hover:shadow-soft-lg transition-all duration-300 border border-rakshak-border/80 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rakshak-secondaryBg to-white text-rakshak-primary flex items-center justify-center shadow-soft border border-rakshak-border/50 group-hover:bg-rakshak-primary group-hover:text-white transition-colors duration-300">
                      <Icon className="w-6 h-6 stroke-[1.8]" />
                    </div>
                    <span className="text-[11px] font-mono font-semibold text-rakshak-secondaryText bg-rakshak-secondaryBg px-2.5 py-1 rounded-full">
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="font-sora text-lg font-bold text-rakshak-text mb-2 group-hover:text-rakshak-primary transition-colors">
                    {feature.title}
                  </h3>

                  <p className="font-inter text-sm text-rakshak-secondaryText leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-rakshak-border/40 flex items-center justify-between text-xs font-semibold text-rakshak-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Learn more</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
