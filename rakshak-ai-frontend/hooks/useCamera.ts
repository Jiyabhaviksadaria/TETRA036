'use client';

import { useState, useEffect } from 'react';
import { Camera } from '@/types/camera';
import { cameraService } from '@/services/cameraService';

export function useCamera() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cameraService.getCameras().then((data) => {
      setCameras(data);
      setLoading(false);
    });
  }, []);

  return { cameras, loading };
}
