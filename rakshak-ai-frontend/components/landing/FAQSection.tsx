'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does Rakshak AI detect animals in low light or complete darkness?',
      a: 'Rakshak AI utilizes dual-spectrum cameras combining high-sensitivity optical sensors with thermal infrared imaging. Our YOLO-based vision models run onboard edge compute boxes for zero latency night vision detection.',
    },
    {
      q: 'What happens if my farm internet connection drops?',
      a: 'Our edge processing units (Rakshak Edge Node) process video locally on your farm. Sirens, lights, and automated deterrents fire locally without requiring active cloud connectivity. Incident logs sync automatically once internet reconnects.',
    },
    {
      q: 'Does the deterrent cause any harm to animals?',
      a: 'No. Rakshak AI strictly uses non-harmful acoustic sirens, multi-frequency ultrasonic pulses, and targeted strobe lights designed to humanely repel wildlife without physical injury.',
    },
    {
      q: 'Can existing CCTV or drone cameras be integrated?',
      a: 'Yes. Rakshak AI supports standard RTSP, ONVIF, and HTTP video streams. You can easily connect your existing IP cameras or farm surveillance hardware.',
    },
    {
      q: 'How fast are notifications delivered to my phone?',
      a: 'Intrusion alerts are dispatched via Push Notifications, SMS, and WhatsApp within less than 4 seconds of initial visual detection.',
    },
  ];

  return (
    <section id="faq" className="py-24 bg-rakshak-secondaryBg/30 border-y border-rakshak-border/60 relative">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rakshak-secondaryBg text-rakshak-primary text-xs font-mono font-semibold uppercase tracking-wider">
            Got Questions?
          </div>
          <h2 className="font-sora text-3xl sm:text-4xl md:text-5xl font-bold text-rakshak-text">
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-lg text-rakshak-secondaryText font-inter">
            Everything you need to know about setting up and running Rakshak AI on your farm.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="glass-card rounded-[24px] overflow-hidden shadow-soft border border-rakshak-border transition-all duration-200"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-sora font-bold text-base md:text-lg text-rakshak-text hover:text-rakshak-primary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-rakshak-primary shrink-0" />
                    <span>{faq.q}</span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-rakshak-secondaryText transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-rakshak-primary' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-2 font-inter text-sm text-rakshak-secondaryText leading-relaxed border-t border-rakshak-border/40 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
