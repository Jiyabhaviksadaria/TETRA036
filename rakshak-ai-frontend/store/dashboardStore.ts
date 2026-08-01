import { mockAlerts } from '@/services/alertService';
import { mockCameras } from '@/services/cameraService';
import { Alert } from '@/types/alert';
import { Camera } from '@/types/camera';

export interface DashboardState {
  alerts: Alert[];
  cameras: Camera[];
  selectedCameraId: string | null;
  activeFilter: string;
}

// In-memory lightweight store instance for client hydration
export function createDashboardStore(): DashboardState {
  return {
    alerts: mockAlerts,
    cameras: mockCameras,
    selectedCameraId: mockCameras[0]?.id || null,
    activeFilter: 'all',
  };
}
