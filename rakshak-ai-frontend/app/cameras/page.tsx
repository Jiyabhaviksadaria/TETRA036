'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { CameraGrid } from '@/components/camera/CameraGrid';
import { mockCameras } from '@/services/cameraService';
import { Video, Plus, Shield } from 'lucide-react';

export default function CamerasPage() {
  const [cameras] = useState(mockCameras);

  return (
    <div className="flex min-h-screen bg-rakshak-bg text-rakshak-text">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />
        <main className="p-4 md:p-8 space-y-8 max-w-[1440px] mx-auto w-full">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-6 rounded-[24px]">
            <div>
              <h1 className="font-sora text-2xl font-bold text-rakshak-text flex items-center gap-2">
                <Video className="w-6 h-6 text-rakshak-primary" />
                Farm Surveillance Camera Grid
              </h1>
              <p className="text-xs text-rakshak-secondaryText font-inter">
                Manage and monitor live optical &amp; thermal camera nodes across all farm sectors.
              </p>
            </div>

            <button className="px-5 py-2.5 rounded-full bg-rakshak-primary text-white font-sora font-semibold text-xs flex items-center gap-2 shadow-soft hover:shadow-glow transition-all">
              <Plus className="w-4 h-4" />
              <span>Connect New Camera Node</span>
            </button>
          </div>

          <CameraGrid cameras={cameras} />

        </main>
      </div>
    </div>
  );
}
