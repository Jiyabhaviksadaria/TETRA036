import React from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { TrustedBy } from '@/components/landing/TrustedBy';
import { FeatureGrid } from '@/components/landing/FeatureGrid';
import { AIWorkflow } from '@/components/landing/AIWorkflow';
import { DashboardPreview } from '@/components/landing/DashboardPreview';
import { AnalyticsPreview } from '@/components/landing/AnalyticsPreview';
import { Testimonials } from '@/components/landing/Testimonials';
import { FAQSection } from '@/components/landing/FAQSection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function Home() {
  return (
    <div className="min-h-screen bg-rakshak-bg text-rakshak-text">
      <LandingNavbar />
      <main>
        <HeroSection />
        <TrustedBy />
        <FeatureGrid />
        <AIWorkflow />
        <DashboardPreview />
        <AnalyticsPreview />
        <Testimonials />
        <FAQSection />
      </main>
      <LandingFooter />
    </div>
  );
}
