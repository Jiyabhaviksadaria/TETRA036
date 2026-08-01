'use client';

import React, { useState } from 'react';
import { TitleBar } from '@/components/layout/TitleBar';
import { CameraGrid } from '@/components/camera/CameraGrid';
import { mockCameras } from '@/services/cameraService';
import { Video, Plus } from 'lucide-react';

export default function CamerasPage() {
  const [cameras] = useState(mockCameras);

  return (
    <div className="min-h-screen font-sans">
      <TitleBar />
      <main className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto w-full">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 card-panel p-5">
          <div>
            <h1 className="font-bold text-lg text-[#06231D] flex items-center gap-2">
              <Video className="w-5 h-5 text-[#076653]" />
              Farm Surveillance Camera Grid
            </h1>
            <p className="text-xs text-[#4C6B5C]">
              Manage and monitor live optical &amp; thermal camera nodes across all farm sectors.
            </p>
          </div>

          <button type="button" className="px-4 py-2 rounded-lg bg-[#076653] hover:bg-[#0C9276] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>Connect New Camera Node</span>
          </button>
        </div>

        <CameraGrid cameras={cameras} />

      </main>
    </div>
  );
}
