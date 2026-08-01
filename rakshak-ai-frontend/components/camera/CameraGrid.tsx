import React from 'react';
import { Camera } from '@/types/camera';
import { CameraCard } from '@/components/dashboard/CameraCard';

export const CameraGrid: React.FC<{ cameras: Camera[] }> = ({ cameras }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cameras.map((camera) => (
        <CameraCard key={camera.id} camera={camera} />
      ))}
    </div>
  );
};
