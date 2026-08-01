'use client';

import React from 'react';
import { Award, Building2, Landmark, Globe2, Sprout } from 'lucide-react';

export const TrustedBy: React.FC = () => {
  const partners = [
    { name: 'National Agricultural Board', type: 'Government', icon: Landmark },
    { name: 'Indian Council of Ag Research', type: 'Universities', icon: Award },
    { name: 'Global Wildlife & Farm Initiative', type: 'NGOs', icon: Globe2 },
    { name: 'Punjab Farm Cooperatives Union', type: 'Farm Cooperatives', icon: Sprout },
    { name: 'AgriVision Tech Labs', type: 'AgriTech Partners', icon: Building2 },
  ];

  return (
    <section className="py-12 bg-rakshak-secondaryBg/40 border-y border-rakshak-border/60">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <p className="text-center text-xs font-mono font-bold tracking-widest text-rakshak-secondaryText uppercase mb-8">
          Trusted By Leading Agricultural Institutions &amp; Organizations
        </p>

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
          {partners.map((partner, index) => {
            const IconComponent = partner.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3 opacity-70 hover:opacity-100 transition-opacity duration-300 group cursor-default"
              >
                <div className="w-10 h-10 rounded-2xl bg-white shadow-soft flex items-center justify-center text-rakshak-primary group-hover:scale-110 transition-transform">
                  <IconComponent className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-sora font-semibold text-sm text-rakshak-text">
                    {partner.name}
                  </span>
                  <span className="text-[11px] font-inter text-rakshak-secondaryText">
                    {partner.type}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
