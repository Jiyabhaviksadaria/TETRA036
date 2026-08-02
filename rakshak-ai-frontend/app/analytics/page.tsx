'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { AnalyticsPreview } from '@/components/landing/AnalyticsPreview';
import { BarChart3, Download } from 'lucide-react';
import { rakshakApi } from '@/services/rakshakApi';

export default function AnalyticsPage() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeUrlRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    return () => {
      if (activeUrlRef.current) {
        window.URL.revokeObjectURL(activeUrlRef.current);
      }
    };
  }, []);

  const handleExport = async () => {
    setIsDownloading(true);
    setError(null);
    try {
      const { blob, filename } = await rakshakApi.getMonthlyReportBlob();
      
      // Clean up previous blob URL if any exists
      if (activeUrlRef.current) {
        window.URL.revokeObjectURL(activeUrlRef.current);
      }

      const url = window.URL.createObjectURL(blob);
      activeUrlRef.current = url;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'rakshak_ai_monthly_report.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Failed to download report:', err);
      setError(err?.message || 'Failed to download report. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-rakshak-bg text-rakshak-text">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />
        <main className="p-4 md:p-8 space-y-8 max-w-[1440px] mx-auto w-full">

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-6 rounded-[24px]">
            <div>
              <h1 className="font-sora text-2xl font-bold text-rakshak-text flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-rakshak-primary" />
                Farm Security Intelligence &amp; Analytics
              </h1>
              <p className="text-xs text-rakshak-secondaryText font-inter">
                Historical intrusion heatmaps, species trends, and deterrence efficiency metrics.
              </p>
              {error && (
                <p className="text-xs text-red-500 font-inter mt-1">
                  {error}
                </p>
              )}
            </div>

            <button
              onClick={handleExport}
              disabled={isDownloading}
              className={`px-5 py-2.5 rounded-full bg-rakshak-primary text-white font-sora font-semibold text-xs flex items-center gap-2 shadow-soft hover:shadow-glow transition-all ${
                isDownloading ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Exporting...' : 'Export Monthly Report (PDF)'}</span>
            </button>
          </div>

          <AnalyticsPreview />

        </main>
      </div>
    </div>
  );
}

