'use client';

import React from 'react';
import { Star, Quote } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const reviews = [
    {
      name: 'Harpreet Singh',
      role: 'Owner, 120-Acre Sugarcane & Wheat Estate',
      location: 'Punjab, India',
      quote:
        'Wild boars used to destroy nearly 20% of our sugarcane harvest every season. Since installing Rakshak AI, night intrusions drop to near zero. The automated acoustic deterrent is an absolute game-changer.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
      rating: 5,
    },
    {
      name: 'Vikramaditya Rao',
      role: 'Chief Farm Manager, AgroGreen Organic Co-op',
      location: 'Maharashtra, India',
      quote:
        'The mobile alerts and AI bounding boxes give our guards precise coordinates instantly. It takes the guesswork out of field security, especially in complete darkness.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
      rating: 5,
    },
    {
      name: 'Dr. Sunita Patel',
      role: 'Agricultural Technologist & Consultant',
      location: 'Gujarat, India',
      quote:
        'Rakshak AI strikes the perfect balance between field-ready simplicity and high-end artificial intelligence. It looks and feels like a Fortune 500 enterprise product built for real farmers.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
      rating: 5,
    },
  ];

  return (
    <section className="py-24 bg-rakshak-bg relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rakshak-secondaryBg text-rakshak-primary text-xs font-mono font-semibold uppercase tracking-wider">
            Farmer Testimonials
          </div>
          <h2 className="font-sora text-3xl sm:text-4xl md:text-5xl font-bold text-rakshak-text">
            Trusted by Farmers &amp; Agronomists Across the Country
          </h2>
          <p className="text-base sm:text-lg text-rakshak-secondaryText font-inter">
            Read how Rakshak AI protects high-value crops and brings peace of mind to farm owners.
          </p>
        </div>

        {/* Testimonials 3 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="glass-card rounded-[24px] p-8 shadow-soft hover:shadow-soft-lg transition-all duration-300 border border-rakshak-border flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-rakshak-primary/20" />
                </div>

                <p className="font-inter text-sm text-rakshak-text leading-relaxed italic">
                  &ldquo;{rev.quote}&rdquo;
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-rakshak-border flex items-center gap-4">
                <img
                  src={rev.avatar}
                  alt={rev.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-rakshak-accent shadow-soft"
                />
                <div>
                  <h4 className="font-sora font-bold text-sm text-rakshak-text">
                    {rev.name}
                  </h4>
                  <p className="text-xs text-rakshak-secondaryText font-inter">
                    {rev.role}
                  </p>
                  <span className="text-[10px] font-mono text-rakshak-primary font-semibold">
                    {rev.location}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
